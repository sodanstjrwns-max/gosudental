// ═══════════════════════════════════════════════
// 고수치과의원 홈페이지 — 메인 라우터
// Hono + Cloudflare Pages (D1 + R2)
// ═══════════════════════════════════════════════
import { Hono } from 'hono'
import { html } from 'hono/html'
import { Layout } from './layout'
import { bodyLimit } from 'hono/body-limit'
import { HTTPException } from 'hono/http-exception'
import { registerAdminAPI } from './admin-api'
import { bad, text, passwordValue, emailValue, phoneValue, consent, jsonObject, rateLimit, clientIP } from './security'
import { handoverPage } from './pages/handover'
import { serveStatic } from 'hono/cloudflare-workers'
import {
  type Bindings, getUser, getAdmin, setUserSession, setAdminSession,
  clearSessions, hashPassword, verifyPassword, isBot, secretOf, constantTimePasswordMatch,
} from './auth'
import { SITE, DOCTORS, TREATMENTS, AREAS, REGION_DB, TERMS, PRICING, PRICING_NOTICE, EQUIPMENT } from './data/site'
import { homePage } from './pages/home'
import { missionPage } from './pages/mission'
import { doctorsListPage, doctorDetailPage } from './pages/doctors'
import { treatmentsListPage, treatmentDetailPage } from './pages/treatments'
import { casesListPage, caseDetailPage } from './pages/cases'
import {
  columnListPage, columnDetailPage, encyclopediaPage, termDetailPage,
  noticeListPage, noticeDetailPage,
} from './pages/content'
import { directionsPage, tourPage, pricingPage, faqTotalPage, reservationPage } from './pages/info'
import { loginPage, registerPage, mypagePage, privacyPage, termsPage, notFoundPage } from './pages/auth'
import { areaPage } from './pages/area'
import {
  adminLoginPage, adminDashPage, adminUsersPage, adminReservationsPage,
  adminCasesPage, adminPostsPage, adminNoticesPage, adminFeesPage, adminStatsPage,
} from './pages/admin'
import { AdminStats, fetchSiteStats } from './pages/stats'

const app = new Hono<{ Bindings: Bindings }>()
app.onError((error, c) => {
  const status = error instanceof HTTPException ? error.status : 500
  if (status === 500) console.error('Request failed:', c.req.method, c.req.path)
  c.header('Cache-Control', 'no-store')
  const message = status === 500 ? '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' : error.message
  if (!c.req.path.startsWith('/api/')) {
    c.header('X-Robots-Tag', 'noindex, nofollow')
    return c.html(Layout({ title: '일시적인 오류 | 고수치과', description: message, path: '/error', noindex: true }, html`<section class="section" style="padding-top:160px;min-height:70vh"><div class="section-narrow"><h1>잠시 후 다시 이용해주세요</h1><p role="alert">${message}</p><p>정보를 불러오지 못했습니다. 등록된 내용이 삭제된 것은 아닙니다.</p><a class="btn-brand" href="/">홈으로 돌아가기</a></div></section>`), status)
  }
  return c.json({ ok: false, error: message }, status)
})

// 공개 주소는 운영 도메인으로 통일하고 관리자·API의 세션은 해당 origin에 유지한다.
app.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  if (['GET', 'HEAD'].includes(c.req.method) &&
      !/^\/(admin|api)(\/|$)/.test(url.pathname)) {
    let redirect = false
    if (['gosudental.pages.dev', 'www.gosudc.kr'].includes(url.hostname)) {
      url.protocol = 'https:'
      url.host = 'gosudc.kr'
      redirect = true
    }
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.replace(/\/+$/, '')
      redirect = true
    }
    if (redirect) return c.redirect(url.toString(), 301)
  }
  await next()
})

// 진료 slug → 케이스 카테고리 매핑
const TREAT_CASE_CAT: Record<string, string> = {
  implant: '임플란트',
  ortho: '치아교정',
  aesthetic: '심미보철',
  preservation: '충치·신경치료',
  prosthetics: '보철치료',
  tmj: '턱관절',
  antiaging: '기타',
}

app.use('/static/*', serveStatic({ root: './public' }))

// ── 전역 보안 · 크롤링 제어 헤더 (Worker 렌더링 응답용) ──
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'SAMEORIGIN')
  if (!c.res.headers.has('Referrer-Policy')) c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (!c.res.headers.has('Content-Security-Policy')) c.header('Content-Security-Policy', "object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'")
  if (new URL(c.req.url).protocol === 'https:') c.header('Strict-Transport-Security', 'max-age=31536000')
  const p = c.req.path
  const privatePath = p === '/handover' || p.startsWith('/admin') || p.startsWith('/auth/') || p.startsWith('/cases') || p.startsWith('/api/')
  if (c.res.status >= 400 || c.req.method !== 'GET' || privatePath || c.res.headers.has('Set-Cookie')) {
    c.header('Cache-Control', 'no-store')
  } else {
    // Public, non-personalized HTML only. No shared cache for member/case responses.
    c.header('Cache-Control', 'public, max-age=0, must-revalidate')
  }
  const publicUpload = p.startsWith('/api/uploads/') && c.res.status === 200 && ['GET', 'HEAD'].includes(c.req.method)
  if (publicUpload) c.header('Cache-Control', 'public, max-age=3600')
  if (p.startsWith('/admin') || p.startsWith('/auth/') || (p.startsWith('/api/') && !publicUpload) || p.startsWith('/cases/') || (p === '/encyclopedia' && c.req.query('q')?.trim()) || c.res.status >= 400) {
    c.header('X-Robots-Tag', 'noindex, nofollow, noarchive')
  }
})

// Same-origin writes and bounded request bodies, including multipart upload requests.
app.use('/api/*', async (c, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(c.req.method)) {
    if (c.req.header('origin') !== new URL(c.req.url).origin || c.req.header('sec-fetch-site') === 'cross-site')
      throw new HTTPException(403, { message: '사이트 내에서 다시 요청해주세요.' })
    const type = (c.req.header('content-type') || '').split(';')[0].trim()
    if (c.req.method !== 'DELETE' && !c.req.path.endsWith('/logout') && !['application/json', 'multipart/form-data'].includes(type))
      throw new HTTPException(415, { message: '지원하지 않는 요청 형식입니다.' })
  }
  await next()
})
app.use('/api/*', bodyLimit({ maxSize: 21 * 1024 * 1024, onError: c => c.json({ ok: false, error: '전체 업로드는 21MB 이하만 가능합니다.' }, 413) }))
app.use('/api/*', async (c, next) => {
  if (c.req.header('content-type')?.includes('application/json')) {
    const maxSize = (c.req.path.startsWith('/api/admin/posts') || c.req.path === '/api/admin/fees') ? 256 * 1024 : 16 * 1024
    return bodyLimit({ maxSize, onError: c => c.json({ ok: false, error: '입력 내용이 너무 큽니다.' }, 413) })(c, next)
  }
  await next()
})
for (const path of ['/api/auth/register', '/api/auth/login', '/api/admin/login']) {
  app.use(path, async (c, next) => { secretOf(c); await next() })
}
for (const [path, limit, seconds] of [
  ['/api/auth/login', 30, 900], ['/api/admin/login', 10, 900],
  ['/api/auth/register', 10, 3600], ['/api/reservation', 10, 3600],
] as const) {
  app.use(path, async (c, next) => {
    if (c.req.method === 'POST') await rateLimit(c, path, clientIP(c), limit, seconds)
    await next()
  })
}

// ── 유틸 ──────────────────────────────────────
const ok = (data: object = {}) => ({ ok: true, ...data })
const err = (message: string) => ({ ok: false, error: message })

// ── 비급여 수가 로드 ─────────────────────────
type FeeItem = { name: string; price: string; note: string; is_published?: number }
type FeeGroup = { category: string; items: FeeItem[] }

// Empty results are intentional (all private or deleted); DB failures must never reveal seed prices.
async function loadFeeGroups(db: any, publishedOnly: boolean): Promise<FeeGroup[] | null> {
  if (!db) throw new HTTPException(503, { message: '수가 DB를 사용할 수 없습니다.' })
  try {
    const where = publishedOnly ? 'WHERE is_published = 1' : ''
    const { results } = await db.prepare(
      `SELECT category, name, price, note, is_published, sort_group, sort_order
       FROM fees ${where} ORDER BY sort_group ASC, sort_order ASC, id ASC`
    ).all()
    if (!results || !results.length) return []
    const groups: FeeGroup[] = []
    const byCat = new Map<string, FeeGroup>()
    for (const r of results as any[]) {
      let g = byCat.get(r.category)
      if (!g) { g = { category: r.category, items: [] }; byCat.set(r.category, g); groups.push(g) }
      g.items.push({ name: r.name, price: r.price, note: r.note || '', is_published: r.is_published })
    }
    // publishedOnly 로 비어버린 그룹은 숨김
    return groups.filter((g) => g.items.length)
  } catch (e) {
    throw new HTTPException(503, { message: '수가를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' })
  }
}

// Administrator sees stored rows including private fees. An empty editor stays empty.
async function loadFeeGroupsForAdmin(db: any): Promise<FeeGroup[]> {
  const groups = await loadFeeGroups(db, false)
  if (groups) return groups
  return PRICING.map((cat) => ({
    category: cat.category,
    items: cat.items.map((it) => ({ name: it.name, price: it.price, note: it.note || '', is_published: 1 })),
  }))
}

async function bumpViews(c: any, table: 'cases' | 'posts' | 'notices', id: number) {
  if (isBot(c.req.header('user-agent'))) return
  try {
    await c.env.DB.prepare(`UPDATE ${table} SET views = views + 1 WHERE id = ?`).bind(id).run()
  } catch { /* noop */ }
}

// ═══════════════════════════════════════════════
// 공개 페이지
// ═══════════════════════════════════════════════
app.get('/handover', (c) => handoverPage(c)) // 납품 안내서 (noindex, 분석 제외)
app.get('/', (c) => c.html(homePage()))
app.get('/mission', (c) => c.html(missionPage()))

// 의료진
app.get('/doctors', (c) => c.html(doctorsListPage()))
app.get('/doctors/:slug', async (c) => {
  const slug = c.req.param('slug')
  if (!DOCTORS.some((d) => d.slug === slug)) return c.html(notFoundPage(), 404)
  let cases: any[] = []
  try {
    const r = await c.env.DB.prepare(
      'SELECT id, title, category, age_group, photo_before, region, views, created_at FROM cases WHERE doctor_slug = ? AND published = 1 ORDER BY created_at DESC LIMIT 6'
    ).bind(slug).all()
    cases = r.results || []
  } catch { /* DB 미준비 시에도 페이지는 렌더 */ }
  const page = doctorDetailPage(slug, cases)
  return page ? c.html(page) : c.html(notFoundPage(), 404)
})

// 진료 안내
app.get('/treatments', (c) => c.html(treatmentsListPage()))
app.get('/treatments/:slug', async (c) => {
  const slug = c.req.param('slug')
  const t = TREATMENTS.find((x) => x.slug === slug)
  if (!t) return c.html(notFoundPage(), 404)
  let cases: any[] = []
  try {
    const r = await c.env.DB.prepare(
      'SELECT id, title, category, age_group, photo_before, region, views, created_at FROM cases WHERE category = ? AND published = 1 ORDER BY created_at DESC LIMIT 4'
    ).bind(TREAT_CASE_CAT[slug] || t.name).all()
    cases = r.results || []
  } catch { /* noop */ }
  const page = treatmentDetailPage(slug, cases)
  return page ? c.html(page) : c.html(notFoundPage(), 404)
})

// 비포&애프터
app.get('/cases', async (c) => {
  const user = await getUser(c)
  let cases: any[] = []
  try {
    const r = await c.env.DB.prepare(
      'SELECT id, title, description, age_group, gender, category, region, doctor_slug, duration, photo_before, views, created_at FROM cases WHERE published = 1 ORDER BY created_at DESC'
    ).all()
    cases = r.results || []
  } catch { throw new HTTPException(503, { message: '콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' }) }
  return c.html(casesListPage(cases, !!user))
})
app.get('/cases/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) return c.html(notFoundPage(), 404)
  let cs: any = null
  try {
    cs = await c.env.DB.prepare('SELECT * FROM cases WHERE id = ? AND published = 1').bind(id).first()
  } catch { throw new HTTPException(503, { message: '콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' }) }
  if (!cs) return c.html(notFoundPage(), 404)
  const user = await getUser(c)
  await bumpViews(c, 'cases', id)
  return c.html(caseDetailPage(cs, !!user))
})

// 원장 칼럼
app.get('/column', async (c) => {
  let posts: any[] = []
  try {
    const r = await c.env.DB.prepare(
      'SELECT id, slug, title, thumbnail, author_slug, meta_description, category, views, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC'
    ).all()
    posts = r.results || []
  } catch { throw new HTTPException(503, { message: '콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' }) }
  return c.html(columnListPage(posts))
})
app.get('/column/:slug', async (c) => {
  const slug = c.req.param('slug')
  let post: any = null
  try {
    post = await c.env.DB.prepare('SELECT * FROM posts WHERE slug = ? AND published = 1').bind(slug).first()
  } catch { throw new HTTPException(503, { message: '콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' }) }
  if (!post) return c.html(notFoundPage(), 404)
  await bumpViews(c, 'posts', post.id)
  return c.html(columnDetailPage(post))
})

// 치과 백과사전
app.get('/encyclopedia', (c) => c.html(encyclopediaPage(c.req.query('q'))))
app.get('/encyclopedia/:slug', (c) => {
  const page = termDetailPage(c.req.param('slug'))
  return page ? c.html(page) : c.html(notFoundPage(), 404)
})

// 공지사항
app.get('/notice', async (c) => {
  let notices: any[] = []
  try {
    const r = await c.env.DB.prepare(
      'SELECT id, title, content, image, pinned, views, created_at FROM notices ORDER BY pinned DESC, created_at DESC'
    ).all()
    notices = r.results || []
  } catch { throw new HTTPException(503, { message: '콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' }) }
  return c.html(noticeListPage(notices))
})
app.get('/notice/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) return c.html(notFoundPage(), 404)
  let n: any = null
  try {
    n = await c.env.DB.prepare('SELECT * FROM notices WHERE id = ?').bind(id).first()
  } catch { throw new HTTPException(503, { message: '콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' }) }
  if (!n) return c.html(notFoundPage(), 404)
  await bumpViews(c, 'notices', id)
  return c.html(noticeDetailPage(n))
})

// 병원 안내
app.get('/directions', (c) => c.html(directionsPage()))
app.get('/tour', (c) => c.html(tourPage()))
app.get('/pricing', async (c) => {
  const groups = await loadFeeGroups(c.env.DB, true)
  return c.html(pricingPage(groups || undefined))
})
app.get('/faq', (c) => c.html(faqTotalPage()))
app.get('/reservation', (c) => c.html(reservationPage()))
app.get('/privacy', (c) => c.html(privacyPage()))
app.get('/terms', (c) => c.html(termsPage()))

// 지역 SEO 페이지 (지역 × 진료)
app.get('/area/:slug', (c) => {
  const page = areaPage(c.req.param('slug'))
  return page ? c.html(page) : c.html(notFoundPage(), 404)
})

// ═══════════════════════════════════════════════
// 회원 (auth)
// ═══════════════════════════════════════════════
app.get('/auth/login', async (c) => {
  const user = await getUser(c)
  if (user) return c.redirect('/auth/mypage')
  return c.html(loginPage(c.req.query('next')))
})
app.get('/auth/register', async (c) => {
  const user = await getUser(c)
  if (user) return c.redirect('/auth/mypage')
  return c.html(registerPage())
})
app.get('/auth/mypage', async (c) => {
  const user = await getUser(c)
  if (!user) return c.redirect('/auth/login?next=/auth/mypage')
  return c.html(mypagePage(user))
})

app.get('/api/auth/me', async (c) => {
  const user = await getUser(c)
  return c.json({ user: user ? { name: user.name, email: user.email } : null })
})

app.post('/api/auth/register', async (c) => {
  const body = await jsonObject(c)
  const name = text(body.name, '이름', 80, true)
  const email = emailValue(body.email, true)
  const phone = phoneValue(body.phone)
  const password = passwordValue(body.password)
  if (password.length < 8) bad('비밀번호는 8자 이상이어야 합니다.')
  if (!consent(body.privacy_consent)) bad('개인정보 수집·이용 동의는 필수입니다.')
  const exists = await c.env.DB.prepare('SELECT id FROM users WHERE lower(email) = ?').bind(email).first()
  if (exists) return c.json(err('이미 가입된 이메일입니다.'), 409)
  const hash = await hashPassword(password)
  const r = await c.env.DB.prepare('INSERT INTO users (email, phone, name, password_hash, privacy_consent, marketing_consent) VALUES (?, ?, ?, ?, 1, ?)')
    .bind(email, phone, name, hash, consent(body.marketing_consent) ? 1 : 0).run()
  await setUserSession(c, { id: Number(r.meta.last_row_id), name, email })
  return c.json(ok({ redirect: '/auth/mypage', message: '가입이 완료되었습니다.' }))
})

app.post('/api/auth/login', async (c) => {
  const body = await jsonObject(c)
  const email = emailValue(body.email, true)
  const password = passwordValue(body.password)
  await rateLimit(c, 'login-email', email, 10)
  const user: any = await c.env.DB.prepare('SELECT id, name, email, password_hash FROM users WHERE lower(email) = ?').bind(email).first()
  const valid = user ? await verifyPassword(password, user.password_hash) : (await hashPassword(password), false)
  if (!valid) return c.json(err('이메일 또는 비밀번호가 올바르지 않습니다.'), 401)
  await setUserSession(c, { id: user.id, name: user.name, email: user.email })
  const next = c.req.query('next')
  const redirect = next && /^\/(?!\/)/.test(next) && !/[\\\x00-\x20]/.test(next) ? next : '/auth/mypage'
  return c.json(ok({ redirect }))
})

app.post('/api/auth/logout', (c) => {
  clearSessions(c, 'user')
  return c.json(ok())
})

// ═══════════════════════════════════════════════
// 예약 / 공용 API
// ═══════════════════════════════════════════════
app.post('/api/reservation', async (c) => {
  const body = await jsonObject(c)
  const name = text(body.name, '이름', 80, true)
  const phone = phoneValue(body.phone)
  const email = emailValue(body.email)
  const category = text(body.category, '진료', 60)
  if (category && category !== '기타' && !TREATMENTS.some(t => t.name === category)) bad('올바른 진료를 선택해주세요.')
  const preferred = text(body.preferred_at, '희망 일시', 100)
  const message = text(body.message, '메시지', 3000)
  if (!consent(body.privacy_consent)) bad('개인정보 수집·이용 동의가 필요합니다.')
  await c.env.DB.prepare('INSERT INTO reservations (name, phone, email, category, preferred_at, message) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(name, phone, email || null, category || null, preferred || null, message || null).run()
  return c.json(ok({ message: '상담 예약이 접수되었습니다. 개원 준비 기간에는 순차적으로 연락드립니다.' }))
})

// 중앙 대시보드 실예약 집계 — 최근 28일 vs 직전 28일 (created_at 은 UTC CURRENT_TIMESTAMP)
app.get('/api/local-stats', async (c) => {
  const key = c.req.header('authorization')?.replace(/^Bearer\s+/i, '') || c.req.query('key') || ''
  if (![c.env.STATS_TOKEN, c.env.MASTER_KEY].some((secret: string | undefined) => secret && key === secret)) return c.notFound()
  try {
    const row = await c.env.DB.prepare(
      `SELECT
         SUM(CASE WHEN created_at >= datetime('now','-28 days') THEN 1 ELSE 0 END) AS cur,
         SUM(CASE WHEN created_at >= datetime('now','-56 days') AND created_at < datetime('now','-28 days') THEN 1 ELSE 0 END) AS prev
       FROM reservations`
    ).first<{ cur: number | null; prev: number | null }>()
    const cur = Number(row?.cur ?? 0), prev = Number(row?.prev ?? 0)
    return c.json({ supported: true, tables: [{ name: 'reservations', cur, prev }], total: { cur, prev } })
  } catch { return c.json({ supported: false }) }
})
app.get('/api/regions', (c) => c.json(REGION_DB))

// 케이스 사진 서빙 (R2) — after 사진은 로그인 회원 전용 (의료법)
app.get('/api/case-image/:id/:field', async (c) => {
  const id = Number(c.req.param('id'))
  const field = c.req.param('field')
  const allowed = ['pano_before', 'pano_after', 'photo_before', 'photo_after']
  if (!Number.isInteger(id) || !allowed.includes(field)) return c.notFound()
  if (field.endsWith('_after')) {
    const user = await getUser(c)
    const admin = await getAdmin(c)
    if (!user && !admin) return c.text('로그인 회원만 열람 가능합니다.', 403)
  }
  try {
    const cs: any = await c.env.DB.prepare(`SELECT ${field} AS k, published FROM cases WHERE id = ?`).bind(id).first()
    if (!cs || !cs.k || (!cs.published && !(await getAdmin(c)))) return c.notFound()
    const obj = await c.env.R2.get(cs.k)
    if (!obj) return c.notFound()
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(obj.httpMetadata?.contentType || '')) return c.notFound()
    return new Response(obj.body as any, {
      headers: {
        'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return c.notFound()
  }
})

// 업로드 파일 서빙 (칼럼/공지 이미지 — 공개)
app.get('/api/uploads/:key{.+}', async (c) => {
  const key = 'uploads/' + c.req.param('key')
  try {
    const obj = await c.env.R2.get(key)
    if (!obj) return c.notFound()
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(obj.httpMetadata?.contentType || '')) return c.notFound()
    return new Response(obj.body as any, {
      headers: {
        'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=604800',
      },
    })
  } catch {
    return c.notFound()
  }
})

// ═══════════════════════════════════════════════
// 관리자
// ═══════════════════════════════════════════════


app.get('/admin/login', async (c) => {
  if (await getAdmin(c)) return c.redirect('/admin')
  return c.html(adminLoginPage())
})

app.post('/api/admin/login', async (c) => {
  const expected = c.env.ADMIN_PASSWORD
  if (!expected || expected.length < 12) throw new HTTPException(503, { message: '관리자 인증 설정을 준비 중입니다.' })
  const body = await jsonObject(c)
  const password = passwordValue(body.password)
  if (!(await constantTimePasswordMatch(password, expected))) return c.json(err('비밀번호가 올바르지 않습니다.'), 401)
  await setAdminSession(c)
  return c.json(ok())
})

app.post('/api/admin/logout', (c) => {
  clearSessions(c, 'admin')
  return c.json(ok())
})

// 통합 통계 키 접근 (세션 없이 ?key= 로 열람 허용)
const statsKeyOk = (c: any) => {
  const key = c.req.header('authorization')?.replace(/^Bearer\s+/i, '') || c.req.query('key') || ''
  return [c.env.STATS_TOKEN, c.env.MASTER_KEY].some((secret: string | undefined) => secret && key === secret)
}
// 관리자 페이지 가드 (login 제외 전체)
app.use('/admin/*', async (c, next) => {
  const p = new URL(c.req.url).pathname
  if (p === '/admin/login') return next()
  if (p === '/admin/stats') return next() // 통계는 라우트에서 자체 인증(미인증 시 404)
  if (!(await getAdmin(c))) return c.redirect('/admin/login')
  await next()
})
app.use('/admin', async (c, next) => {
  if (!(await getAdmin(c))) return c.redirect('/admin/login')
  await next()
})
// 관리자 API 가드
app.use('/api/admin/*', async (c, next) => {
  const p = new URL(c.req.url).pathname
  if (p === '/api/admin/login' || p === '/api/admin/logout') return next()
  if (!(await getAdmin(c))) return c.json(err('관리자 인증이 필요합니다.'), 401)
  await next()
})

app.get('/admin', async (c) => {
  const stats = await c.env.DB.prepare(`SELECT
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT COUNT(*) FROM cases) AS cases,
    (SELECT COUNT(*) FROM posts) AS posts,
    (SELECT COUNT(*) FROM notices) AS notices,
    (SELECT COUNT(*) FROM reservations) AS resv,
    (SELECT COALESCE(SUM(views),0) FROM cases) +
    (SELECT COALESCE(SUM(views),0) FROM posts) +
    (SELECT COALESCE(SUM(views),0) FROM notices) AS totalViews
  `).first<{ users: number; cases: number; posts: number; notices: number; resv: number; totalViews: number }>()
  if (!stats) throw new HTTPException(503, { message: '관리 통계를 불러오지 못했습니다.' })
  return c.html(adminDashPage(stats))
})

app.get('/admin/users', async (c) => {
  const r = await c.env.DB.prepare('SELECT id, name, email, phone, marketing_consent, created_at FROM users ORDER BY created_at DESC').all()
  return c.html(adminUsersPage(r.results || []))
})
app.get('/admin/reservations', async (c) => {
  const r = await c.env.DB.prepare('SELECT * FROM reservations ORDER BY created_at DESC').all()
  return c.html(adminReservationsPage(r.results || []))
})
app.get('/admin/cases', async (c) => {
  const r = await c.env.DB.prepare('SELECT id, title, category, region, doctor_slug, views, created_at FROM cases ORDER BY created_at DESC').all()
  return c.html(adminCasesPage(r.results || []))
})
app.get('/admin/posts', async (c) => {
  const r = await c.env.DB.prepare('SELECT id, slug, title, author_slug, views, created_at FROM posts ORDER BY created_at DESC').all()
  return c.html(adminPostsPage(r.results || []))
})
app.get('/admin/notices', async (c) => {
  const r = await c.env.DB.prepare('SELECT id, title, pinned, views, created_at FROM notices ORDER BY pinned DESC, created_at DESC').all()
  return c.html(adminNoticesPage(r.results || []))
})
app.get('/admin/fees', async (c) => {
  const groups = await loadFeeGroupsForAdmin(c.env.DB)
  return c.html(adminFeesPage(groups))
})
// 통합 통계 — 관리자 세션 또는 ?key=(사이트 토큰/마스터키) 로만 열람, 그 외 404
app.get('/admin/stats', async (c) => {
  if (!(await getAdmin(c)) && !statsKeyOk(c)) return c.notFound()
  const data = await fetchSiteStats(c.env.STATS_TOKEN)
  return c.html(adminStatsPage(AdminStats(data)))
})

// 관리자 인증 가드 다음에 CRUD를 등록합니다.
registerAdminAPI(app)

// 비급여 진료비 저장 — 전체 교체(delete-all + insert) 단일 배치
app.post('/api/admin/fees', async (c) => {
  if (!c.env.DB) return c.json(err('DB를 사용할 수 없습니다.'), 503)
  let body: any
  try { body = await c.req.json() } catch { return c.json(err('잘못된 요청'), 400) }
  if (!Array.isArray(body?.groups) || body.groups.length > 30) bad('수가 분류 형식을 확인해주세요.')
  const groups = body.groups
  let count = 0
  for (const group of groups) {
    text(group?.category, '분류', 100, true)
    if (!Array.isArray(group?.items)) bad('수가 항목 형식을 확인해주세요.')
    count += group.items.length
    if (count > 300) bad('수가는 300개 이하만 저장할 수 있습니다.')
    for (const item of group.items) {
      text(item?.name, '항목명', 200, true); text(item?.price, '비용', 200); text(item?.note, '비고', 1000)
      if (item?.is_published !== undefined && ![0,1,false,true].includes(item.is_published)) bad('공개 상태를 확인해주세요.')
    }
  }
  const ins = c.env.DB.prepare(
    'INSERT INTO fees (category, name, price, note, is_published, sort_group, sort_order) VALUES (?,?,?,?,?,?,?)'
  )
  const stmts: any[] = [c.env.DB.prepare('DELETE FROM fees')]
  groups.forEach((g: any, gi: number) => {
    const category = String(g?.category ?? '').trim()
    if (!category) return
    const items = Array.isArray(g?.items) ? g.items : []
    items.forEach((it: any, ii: number) => {
      const name = String(it?.name ?? '').trim()
      if (!name) return
      const price = String(it?.price ?? '').trim()
      const note = it?.note ? String(it.note).trim() : null
      const pub = it?.is_published === 0 || it?.is_published === false ? 0 : 1
      stmts.push(ins.bind(category, name, price, note, pub, gi + 1, ii))
    })
  })
  try {
    await c.env.DB.batch(stmts)
    return c.json(ok({ count: stmts.length - 1 }))
  } catch (e: any) {
    console.error('save fees error', e)
    return c.json(err('저장에 실패했습니다.'), 500)
  }
})

// ═══════════════════════════════════════════════
// SEO 파일: sitemap.xml / robots.txt / llms.txt
// ═══════════════════════════════════════════════
app.get('/sitemap.xml', async (c) => {
  const staticPaths = [
    { p: '/', pr: '1.0' }, { p: '/mission', pr: '0.9' },
    { p: '/doctors', pr: '0.9' }, { p: '/treatments', pr: '0.9' },
    { p: '/cases', pr: '0.8' }, { p: '/column', pr: '0.8' },
    { p: '/encyclopedia', pr: '0.7' }, { p: '/faq', pr: '0.8' },
    { p: '/notice', pr: '0.6' }, { p: '/directions', pr: '0.8' },
    { p: '/tour', pr: '0.7' }, { p: '/pricing', pr: '0.7' },
    { p: '/reservation', pr: '0.8' }, { p: '/privacy', pr: '0.3' }, { p: '/terms', pr: '0.3' },
  ]
  const xml = (value: string) => value.replace(/[<>&"']/g, ch => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[ch]!))
  // Omit lastmod when actual edit time is unavailable (never fabricate today's date).
  const U = (loc: string, pr: string, cf = 'weekly', lm = '') =>
    `<url><loc>${xml(loc)}</loc>${/^\d{4}-\d{2}-\d{2}$/.test(lm) ? `<lastmod>${lm}</lastmod>` : ''}<changefreq>${cf}</changefreq><priority>${pr}</priority></url>`
  const urls: string[] = staticPaths.map((s) => U(`${SITE.domain}${s.p}`, s.pr, s.p === '/' ? 'daily' : 'weekly'))
  DOCTORS.forEach((d) => urls.push(U(`${SITE.domain}/doctors/${d.slug}`, '0.8', 'monthly')))
  TREATMENTS.forEach((t) => urls.push(U(`${SITE.domain}/treatments/${t.slug}`, t.core ? '0.9' : '0.7', 'weekly')))
  AREAS.forEach((a) => urls.push(U(`${SITE.domain}/area/${a.slug}`, '0.6', 'monthly')))
  TERMS.forEach((t) => urls.push(U(`${SITE.domain}/encyclopedia/${t.slug}`, '0.4', 'monthly')))
  try {
    const posts = await c.env.DB.prepare('SELECT slug, updated_at FROM posts WHERE published = 1').all()
    for (const p of (posts.results || []) as any[]) urls.push(U(`${SITE.domain}/column/${p.slug}`, '0.7', 'weekly', (p.updated_at || '').slice(0, 10)))
    // Member-gated case detail pages are noindex; keep only the public cases listing.
    const notices = await c.env.DB.prepare('SELECT id FROM notices').all()
    for (const notice of (notices.results || []) as { id: number }[]) urls.push(U(`${SITE.domain}/notice/${notice.id}`, '0.6', 'weekly'))
  } catch { throw new HTTPException(503, { message: '사이트맵을 일시적으로 불러올 수 없습니다.' }) }
  return c.body(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`,
    200,
    { 'Content-Type': 'application/xml; charset=utf-8' }
  )
})

app.get('/robots.txt', (c) => c.text(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth/
Disallow: /api/
Allow: /api/uploads/

Sitemap: ${SITE.domain}/sitemap.xml
`))

app.get('/llms.txt', (c) =>
  c.text(`# ${SITE.name}
> ${SITE.slogan}

${SITE.name}은 ${SITE.address}(${SITE.landmark})에 위치한 치과의원입니다. ${SITE.openDate}.
미션: "${SITE.mission}"

## 의료진
${DOCTORS.map((d) => `- ${d.name} ${d.role} (${d.career[0] || ''}) — 주요 분야: ${d.specialties.map((s) => TREATMENTS.find((t) => t.slug === s)?.name || s).join(', ')}`).join('\n')}

## 진료 분야
${TREATMENTS.map((t) => `- [${t.name}](${SITE.domain}/treatments/${t.slug}): ${t.short}`).join('\n')}

## 주요 페이지
- [병원 미션](${SITE.domain}/mission)
- [의료진 소개](${SITE.domain}/doctors)
- [비포&애프터](${SITE.domain}/cases): 공개 목록. 치료 후 사진은 로그인 필요, 상세는 검색 제외.
- [진료비 안내](${SITE.domain}/pricing): 공개 잠정수가와 적용 조건
- [원장 칼럼](${SITE.domain}/column): 작성자와 게시일이 표시된 의료 정보
- [자주 묻는 질문](${SITE.domain}/faq)
- [치과 백과사전](${SITE.domain}/encyclopedia)
- [오시는 길](${SITE.domain}/directions): ${SITE.address}
- [상담 예약](${SITE.domain}/reservation)

## 진료 시간
${SITE.hours.map((h) => `- ${h.day}: ${h.time}`).join('\n')}

## 정보 이용 시 확인 사항
- 개원 예정 안내이며 대표전화·확정 진료시간은 오시는 길 페이지에서 확인합니다.
- 진료 이미지는 실제 의료진 사진, 인테리어 설계 이미지, AI 설명 이미지로 구분되어 있습니다.
- 잠정수가를 확정 가격으로 인용하거나 개인에게 동일한 치료 결과를 보장하지 않습니다.

## 상세 문서
- [전체 FAQ·백과사전·진료 상세](${SITE.domain}/llms-full.txt)

※ 본 안내는 일반적인 의료 정보이며, 치료 결과는 개인에 따라 다를 수 있습니다.
`)
)

// AEO 딥 문서 — AI 답변엔진이 인용할 수 있는 전문 (FAQ + 백과사전 + 진료 상세)
app.get('/llms-full.txt', async (c) => {
  const publicFees = await loadFeeGroups(c.env.DB, true) || []
  const treatBlocks = TREATMENTS.map((t) => {
    const secs = t.sections.map((s) => `### ${s.h}\n${s.body.replace(/\n{2,}/g, '\n')}`).join('\n\n')
    const faqs = t.faqs.map((f) => `Q. ${f.q}\nA. ${f.a}`).join('\n\n')
    return `## ${t.name} (${SITE.domain}/treatments/${t.slug})\n${t.heroCopy}\n\n${secs}\n\n### ${t.name} 자주 묻는 질문\n${faqs}`
  }).join('\n\n---\n\n')

  const termBlocks = TERMS.map((t) => `- [${t.name}](${SITE.domain}/encyclopedia/${t.slug}): ${t.def}`).join('\n')

  const priceBlocks = publicFees.map((p) =>
    `### ${p.category}\n${p.items.map((i) => `- ${i.name}: ${i.price}${i.note ? ` (${i.note})` : ''}`).join('\n')}`
  ).join('\n\n')

  const doctorBlocks = DOCTORS.map((d) =>
    `### ${d.name} ${d.role}\n출처: ${SITE.domain}/doctors/${d.slug}\n"${d.tagline}"\n${d.intro}\n주요 이력: ${d.career.slice(0, 4).join(' / ')}`
  ).join('\n\n')

  return c.text(`# ${SITE.name} — 전체 안내 문서 (AI 답변용)
> ${SITE.slogan}

이 문서는 ${SITE.name}의 공식 정보 전문입니다. AI 검색·답변 엔진이 환자 질문에 답할 때 이 내용을 근거로 사용할 수 있습니다.

## 기본 정보
- 이름: ${SITE.name} (${SITE.nameEn})
- 주소: ${SITE.address}
- 위치 랜드마크: ${SITE.landmark}
- 개원: ${SITE.openDate}
- 대표원장: 조원익
- 미션: ${SITE.mission}
- 예약: ${SITE.domain}/reservation
- 블로그: ${SITE.blog}

## 핵심 차별점
- 치과교정과 전문의(보건복지부 인증)가 교정 진료 담당
- 임플란트·교정·심미보철·충치·턱관절까지 한곳에서 해결하는 올인원 진료
- 진료 철학: 살릴 수 있는 치아는 오래 살리고, 잃어버린 치아는 제대로 회복해서, 다시 잘 먹을 수 있게
- 통증 배려: "치료 중 아프면 절대 억지로 이어가지 않겠습니다" (대표원장 약속)

## 의료진
${doctorBlocks}

## 장비
${EQUIPMENT.map((e) => `- ${e.name}: ${e.desc}`).join('\n')}

---

${treatBlocks}

---

## 비용 안내 (잠정수가)
${PRICING_NOTICE}
${priceBlocks}

---

## 치과 용어 백과사전 (${TERMS.length}개)
${termBlocks}

---

※ 모든 시술은 부작용이 발생할 수 있으며 치료 결과는 개인에 따라 다를 수 있습니다. 정확한 진단은 내원 상담을 통해 받으시기 바랍니다.
출처: ${SITE.domain} · 공개 진료비 최신 정보: ${SITE.domain}/pricing
본 문서는 공개 안내와 공개 DB 수가를 기반으로 제공합니다. 개별 진단·확정 가격·검색 노출을 보장하지 않습니다.
`)
})

// 404
app.notFound((c) => c.html(notFoundPage(), 404))

export default app
