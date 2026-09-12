// ═══════════════════════════════════════════════
// 고수치과의원 홈페이지 — 메인 라우터
// Hono + Cloudflare Pages (D1 + R2)
// ═══════════════════════════════════════════════
import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import {
  type Bindings, getUser, getAdmin, setUserSession, setAdminSession,
  clearSessions, hashPassword, verifyPassword, isBot,
} from './auth'
import { SITE, DOCTORS, TREATMENTS, AREAS, REGION_DB, TERMS, PRICING, EQUIPMENT } from './data/site'
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
import { AdminStats, fetchSiteStats, STATS_TOKEN, MASTER_KEY } from './pages/stats'

const app = new Hono<{ Bindings: Bindings }>()

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
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  const p = c.req.path
  if (p.startsWith('/admin') || p.startsWith('/api/')) {
    c.header('X-Robots-Tag', 'noindex, nofollow, noarchive')
    c.header('Cache-Control', 'no-store')
  }
})

// ── 유틸 ──────────────────────────────────────
const ok = (data: object = {}) => ({ ok: true, ...data })
const err = (message: string) => ({ ok: false, error: message })

// ── 비급여 수가 로드 ─────────────────────────
type FeeItem = { name: string; price: string; note: string; is_published?: number }
type FeeGroup = { category: string; items: FeeItem[] }

// publishedOnly=true → 공개 항목만. 실패/빈 결과면 null → 호출부에서 PRICING 시드로 폴백.
async function loadFeeGroups(db: any, publishedOnly: boolean): Promise<FeeGroup[] | null> {
  if (!db) return null
  try {
    const where = publishedOnly ? 'WHERE is_published = 1' : ''
    const { results } = await db.prepare(
      `SELECT category, name, price, note, is_published, sort_group, sort_order
       FROM fees ${where} ORDER BY sort_group ASC, sort_order ASC, id ASC`
    ).all()
    if (!results || !results.length) return null
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
    console.error('loadFeeGroups error', e)
    return null
  }
}

// 관리자 편집기용: 비공개 포함 전체. DB 비었으면 PRICING 시드(전 항목 공개)로.
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
      'SELECT id, title, category, region, views, created_at FROM cases WHERE doctor_slug = ? AND published = 1 ORDER BY created_at DESC LIMIT 6'
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
      'SELECT id, title, category, region, views, created_at FROM cases WHERE category = ? AND published = 1 ORDER BY created_at DESC LIMIT 4'
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
  } catch { /* noop */ }
  return c.html(casesListPage(cases, !!user))
})
app.get('/cases/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) return c.html(notFoundPage(), 404)
  let cs: any = null
  try {
    cs = await c.env.DB.prepare('SELECT * FROM cases WHERE id = ? AND published = 1').bind(id).first()
  } catch { /* noop */ }
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
  } catch { /* noop */ }
  return c.html(columnListPage(posts))
})
app.get('/column/:slug', async (c) => {
  const slug = c.req.param('slug')
  let post: any = null
  try {
    post = await c.env.DB.prepare('SELECT * FROM posts WHERE slug = ? AND published = 1').bind(slug).first()
  } catch { /* noop */ }
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
  } catch { /* noop */ }
  return c.html(noticeListPage(notices))
})
app.get('/notice/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) return c.html(notFoundPage(), 404)
  let n: any = null
  try {
    n = await c.env.DB.prepare('SELECT * FROM notices WHERE id = ?').bind(id).first()
  } catch { /* noop */ }
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
  let body: any
  try { body = await c.req.json() } catch { return c.json(err('잘못된 요청입니다.'), 400) }
  const { name, email, phone, password, privacy_consent, marketing_consent } = body
  if (!name || !email || !phone || !password) return c.json(err('필수 항목을 모두 입력해주세요.'), 400)
  if (!privacy_consent || privacy_consent === 'false' || privacy_consent === false)
    return c.json(err('개인정보 수집·이용 동의는 필수입니다.'), 400)
  if (String(password).length < 8) return c.json(err('비밀번호는 8자 이상이어야 합니다.'), 400)
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) return c.json(err('올바른 이메일 형식이 아닙니다.'), 400)
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 11) return c.json(err('올바른 전화번호를 입력해주세요.'), 400)
  try {
    const exists = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
    if (exists) return c.json(err('이미 가입된 이메일입니다.'), 409)
    const hash = await hashPassword(String(password))
    const marketing = marketing_consent === true || marketing_consent === 'true' || marketing_consent === 'on' ? 1 : 0
    const r = await c.env.DB.prepare(
      'INSERT INTO users (email, phone, name, password_hash, privacy_consent, marketing_consent) VALUES (?, ?, ?, ?, 1, ?)'
    ).bind(email, digits, name, hash, marketing).run()
    await setUserSession(c, { id: Number(r.meta.last_row_id), name, email })
    return c.json(ok({ redirect: '/auth/mypage', message: '가입이 완료되었습니다.' }))
  } catch (e) {
    return c.json(err('가입 처리 중 오류가 발생했습니다.'), 500)
  }
})

app.post('/api/auth/login', async (c) => {
  let body: any
  try { body = await c.req.json() } catch { return c.json(err('잘못된 요청입니다.'), 400) }
  const { email, password } = body
  if (!email || !password) return c.json(err('이메일과 비밀번호를 입력해주세요.'), 400)
  try {
    const user: any = await c.env.DB.prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?').bind(email).first()
    if (!user || !(await verifyPassword(String(password), user.password_hash)))
      return c.json(err('이메일 또는 비밀번호가 올바르지 않습니다.'), 401)
    await setUserSession(c, { id: user.id, name: user.name, email: user.email })
    const next = c.req.query('next')
    const redirect = next && next.startsWith('/') && !next.startsWith('//') ? next : '/auth/mypage'
    return c.json(ok({ redirect }))
  } catch {
    return c.json(err('로그인 처리 중 오류가 발생했습니다.'), 500)
  }
})

app.post('/api/auth/logout', (c) => {
  clearSessions(c)
  return c.json(ok())
})

// ═══════════════════════════════════════════════
// 예약 / 공용 API
// ═══════════════════════════════════════════════
app.post('/api/reservation', async (c) => {
  let body: any
  try { body = await c.req.json() } catch { return c.json(err('잘못된 요청입니다.'), 400) }
  const { name, phone, email, category, preferred_at, message, privacy_consent } = body
  if (!name || !phone) return c.json(err('이름과 연락처를 입력해주세요.'), 400)
  if (!privacy_consent || privacy_consent === false || privacy_consent === 'false')
    return c.json(err('개인정보 수집·이용 동의가 필요합니다.'), 400)
  try {
    await c.env.DB.prepare(
      'INSERT INTO reservations (name, phone, email, category, preferred_at, message) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(name, String(phone).replace(/\D/g, ''), email || null, category || null, preferred_at || null, message || null).run()
    return c.json(ok({ message: '상담 예약이 접수되었습니다. 개원 준비 기간에는 순차적으로 연락드립니다.' }))
  } catch {
    return c.json(err('예약 접수 중 오류가 발생했습니다.'), 500)
  }
})

// 중앙 대시보드 실예약 집계 — 최근 28일 vs 직전 28일 (created_at 은 UTC CURRENT_TIMESTAMP)
app.get('/api/local-stats', async (c) => {
  const key = c.req.query('key') || ''
  if (key !== STATS_TOKEN && key !== MASTER_KEY) return c.notFound()
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
    const cs: any = await c.env.DB.prepare(`SELECT ${field} AS k FROM cases WHERE id = ?`).bind(id).first()
    if (!cs || !cs.k) return c.notFound()
    const obj = await c.env.R2.get(cs.k)
    if (!obj) return c.notFound()
    return new Response(obj.body as any, {
      headers: {
        'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': field.endsWith('_after') ? 'private, max-age=300' : 'public, max-age=86400',
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
const ADMIN_FALLBACK = 'gosu2026!admin'

app.get('/admin/login', async (c) => {
  if (await getAdmin(c)) return c.redirect('/admin')
  return c.html(adminLoginPage())
})

app.post('/api/admin/login', async (c) => {
  let body: any
  try { body = await c.req.json() } catch { return c.json(err('잘못된 요청'), 400) }
  const expected = c.env.ADMIN_PASSWORD || ADMIN_FALLBACK
  if (body.password !== expected) return c.json(err('비밀번호가 올바르지 않습니다.'), 401)
  await setAdminSession(c)
  return c.json(ok())
})

app.post('/api/admin/logout', (c) => {
  clearSessions(c)
  return c.json(ok())
})

// 통합 통계 키 접근 (세션 없이 ?key= 로 열람 허용)
const statsKeyOk = (c: any) => {
  const key = c.req.query('key') || ''
  return key === STATS_TOKEN || key === MASTER_KEY
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
  const q = async (sql: string) => {
    try { const r: any = await c.env.DB.prepare(sql).first(); return Number(r?.n || 0) } catch { return 0 }
  }
  const stats = {
    users: await q('SELECT COUNT(*) n FROM users'),
    cases: await q('SELECT COUNT(*) n FROM cases'),
    posts: await q('SELECT COUNT(*) n FROM posts'),
    notices: await q('SELECT COUNT(*) n FROM notices'),
    resv: await q('SELECT COUNT(*) n FROM reservations'),
    totalViews: (await q('SELECT COALESCE(SUM(views),0) n FROM cases')) +
      (await q('SELECT COALESCE(SUM(views),0) n FROM posts')) +
      (await q('SELECT COALESCE(SUM(views),0) n FROM notices')),
  }
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
  const data = await fetchSiteStats()
  return c.html(adminStatsPage(AdminStats(data)))
})

// ── 관리자 CRUD API ──
async function putR2Image(c: any, file: File | null, prefix: string): Promise<string | null> {
  if (!file || typeof file === 'string' || !file.size) return null
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  await c.env.R2.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || 'image/jpeg' },
  })
  return key
}

app.post('/api/admin/cases', async (c) => {
  const fd = await c.req.formData()
  const title = String(fd.get('title') || '').trim()
  const category = String(fd.get('category') || '').trim()
  if (!title || !category) return c.json(err('제목과 카테고리는 필수입니다.'), 400)
  const keys: Record<string, string | null> = {}
  for (const f of ['pano_before', 'pano_after', 'photo_before', 'photo_after']) {
    keys[f] = await putR2Image(c, fd.get(f) as File | null, 'cases')
  }
  await c.env.DB.prepare(
    `INSERT INTO cases (title, description, age_group, gender, category, region, doctor_slug, duration, pano_before, pano_after, photo_before, photo_after)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    title, String(fd.get('description') || ''), String(fd.get('age_group') || ''), String(fd.get('gender') || ''),
    category, String(fd.get('region') || ''), String(fd.get('doctor_slug') || ''), String(fd.get('duration') || ''),
    keys.pano_before, keys.pano_after, keys.photo_before, keys.photo_after
  ).run()
  return c.json(ok())
})

app.delete('/api/admin/cases/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const cs: any = await c.env.DB.prepare('SELECT pano_before, pano_after, photo_before, photo_after FROM cases WHERE id = ?').bind(id).first()
  if (cs) {
    for (const k of [cs.pano_before, cs.pano_after, cs.photo_before, cs.photo_after]) {
      if (k) { try { await c.env.R2.delete(k) } catch { /* noop */ } }
    }
  }
  await c.env.DB.prepare('DELETE FROM cases WHERE id = ?').bind(id).run()
  return c.json(ok())
})

app.post('/api/admin/upload', async (c) => {
  const fd = await c.req.formData()
  const file = fd.get('image') as File | null
  const key = await putR2Image(c, file, 'uploads')
  if (!key) return c.json(err('이미지 파일이 필요합니다.'), 400)
  return c.json(ok({ url: `/api/${key}` }))
})

app.post('/api/admin/posts', async (c) => {
  let body: any
  try { body = await c.req.json() } catch { return c.json(err('잘못된 요청'), 400) }
  const { title, slug, content, author_slug, category, meta_description } = body
  if (!title || !slug || !content) return c.json(err('제목·슬러그·본문은 필수입니다.'), 400)
  if (!/^[a-z0-9-]+$/.test(slug)) return c.json(err('슬러그는 영문 소문자·숫자·하이픈만 가능합니다.'), 400)
  const exists = await c.env.DB.prepare('SELECT id FROM posts WHERE slug = ?').bind(slug).first()
  if (exists) return c.json(err('이미 사용 중인 슬러그입니다.'), 409)
  // 본문 첫 이미지를 썸네일로
  const m = String(content).match(/<img[^>]+src="([^"]+)"/)
  await c.env.DB.prepare(
    'INSERT INTO posts (slug, title, content, thumbnail, author_slug, meta_description, category) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(slug, title, content, m ? m[1] : null, author_slug || null, meta_description || null, category || null).run()
  return c.json(ok())
})

app.delete('/api/admin/posts/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(Number(c.req.param('id'))).run()
  return c.json(ok())
})

app.post('/api/admin/notices', async (c) => {
  const fd = await c.req.formData()
  const title = String(fd.get('title') || '').trim()
  const content = String(fd.get('content') || '').trim()
  if (!title || !content) return c.json(err('제목과 내용은 필수입니다.'), 400)
  const key = await putR2Image(c, fd.get('image') as File | null, 'uploads')
  const pinned = fd.get('pinned') ? 1 : 0
  if (pinned) await c.env.DB.prepare('UPDATE notices SET pinned = 0').run()
  await c.env.DB.prepare('INSERT INTO notices (title, content, image, pinned) VALUES (?, ?, ?, ?)')
    .bind(title, content, key ? `/api/${key}` : null, pinned).run()
  return c.json(ok())
})

app.put('/api/admin/notices/:id', async (c) => {
  const id = Number(c.req.param('id'))
  let body: any
  try { body = await c.req.json() } catch { return c.json(err('잘못된 요청'), 400) }
  if (body.pinned === 1) await c.env.DB.prepare('UPDATE notices SET pinned = 0').run()
  await c.env.DB.prepare('UPDATE notices SET pinned = ? WHERE id = ?').bind(body.pinned ? 1 : 0, id).run()
  return c.json(ok())
})

app.delete('/api/admin/notices/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM notices WHERE id = ?').bind(Number(c.req.param('id'))).run()
  return c.json(ok())
})

app.delete('/api/admin/users/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(Number(c.req.param('id'))).run()
  return c.json(ok())
})

app.put('/api/admin/reservations/:id', async (c) => {
  let body: any
  try { body = await c.req.json() } catch { return c.json(err('잘못된 요청'), 400) }
  const status = ['pending', 'confirmed', 'done', 'canceled'].includes(body.status) ? body.status : 'pending'
  await c.env.DB.prepare('UPDATE reservations SET status = ? WHERE id = ?').bind(status, Number(c.req.param('id'))).run()
  return c.json(ok())
})

// 비급여 진료비 저장 — 전체 교체(delete-all + insert) 단일 배치
app.post('/api/admin/fees', async (c) => {
  if (!c.env.DB) return c.json(err('DB를 사용할 수 없습니다.'), 503)
  let body: any
  try { body = await c.req.json() } catch { return c.json(err('잘못된 요청'), 400) }
  const groups = Array.isArray(body?.groups) ? body.groups : []
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
  const today = new Date().toISOString().slice(0, 10)
  const U = (loc: string, pr: string, cf = 'weekly', lm = today) =>
    `<url><loc>${loc}</loc><lastmod>${lm}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`
  const urls: string[] = staticPaths.map((s) => U(`${SITE.domain}${s.p}`, s.pr, s.p === '/' ? 'daily' : 'weekly'))
  DOCTORS.forEach((d) => urls.push(U(`${SITE.domain}/doctors/${d.slug}`, '0.8', 'monthly')))
  TREATMENTS.forEach((t) => urls.push(U(`${SITE.domain}/treatments/${t.slug}`, t.core ? '0.9' : '0.7', 'weekly')))
  AREAS.forEach((a) => urls.push(U(`${SITE.domain}/area/${a.slug}`, '0.6', 'monthly')))
  TERMS.forEach((t) => urls.push(U(`${SITE.domain}/encyclopedia/${t.slug}`, '0.4', 'monthly')))
  try {
    const posts = await c.env.DB.prepare('SELECT slug, updated_at FROM posts WHERE published = 1').all()
    for (const p of (posts.results || []) as any[]) urls.push(U(`${SITE.domain}/column/${p.slug}`, '0.7', 'weekly', (p.updated_at || today).slice(0, 10)))
    const cases = await c.env.DB.prepare('SELECT id, created_at FROM cases WHERE published = 1').all()
    for (const cs of (cases.results || []) as any[]) urls.push(U(`${SITE.domain}/cases/${cs.id}`, '0.6', 'weekly', (cs.created_at || today).slice(0, 10)))
  } catch { /* noop */ }
  return c.body(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`,
    200,
    { 'Content-Type': 'application/xml; charset=utf-8' }
  )
})

app.get('/robots.txt', (c) =>
  c.text(`# gosudental.pages.dev — 검색엔진 + AI 답변엔진(AEO) 모두 환영
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Allow: /api/case-image/

# ── AI 답변 엔진 (AEO) 명시 허용 ──
User-agent: GPTBot
Allow: /
Disallow: /admin

User-agent: OAI-SearchBot
Allow: /
Disallow: /admin

User-agent: ChatGPT-User
Allow: /
Disallow: /admin

User-agent: ClaudeBot
Allow: /
Disallow: /admin

User-agent: Claude-Web
Allow: /
Disallow: /admin

User-agent: anthropic-ai
Allow: /
Disallow: /admin

User-agent: PerplexityBot
Allow: /
Disallow: /admin

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: Yeti
Allow: /
Disallow: /admin

User-agent: Daum
Allow: /
Disallow: /admin

Sitemap: ${SITE.domain}/sitemap.xml

# AI/LLM 요약용 문서
# ${SITE.domain}/llms.txt (개요) · ${SITE.domain}/llms-full.txt (전문)
`)
)

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
- [비포&애프터](${SITE.domain}/cases)
- [자주 묻는 질문](${SITE.domain}/faq)
- [치과 백과사전](${SITE.domain}/encyclopedia)
- [오시는 길](${SITE.domain}/directions): ${SITE.address}
- [상담 예약](${SITE.domain}/reservation)

## 진료 시간
${SITE.hours.map((h) => `- ${h.day}: ${h.time}`).join('\n')}

## 상세 문서
- 전체 FAQ·백과사전·진료 상세: ${SITE.domain}/llms-full.txt

※ 본 안내는 의료광고 심의 기준을 준수하며, 치료 결과는 개인에 따라 다를 수 있습니다.
`)
)

// AEO 딥 문서 — AI 답변엔진이 인용할 수 있는 전문 (FAQ + 백과사전 + 진료 상세)
app.get('/llms-full.txt', (c) => {
  const treatBlocks = TREATMENTS.map((t) => {
    const secs = t.sections.map((s) => `### ${s.h}\n${s.body.replace(/\n{2,}/g, '\n')}`).join('\n\n')
    const faqs = t.faqs.map((f) => `Q. ${f.q}\nA. ${f.a}`).join('\n\n')
    return `## ${t.name} (${SITE.domain}/treatments/${t.slug})\n${t.heroCopy}\n\n${secs}\n\n### ${t.name} 자주 묻는 질문\n${faqs}`
  }).join('\n\n---\n\n')

  const termBlocks = TERMS.map((t) => `- **${t.name}**: ${t.def}`).join('\n')

  const priceBlocks = PRICING.map((p) =>
    `### ${p.category}\n${p.items.map((i) => `- ${i.name}: ${i.price}${i.note ? ` (${i.note})` : ''}`).join('\n')}`
  ).join('\n\n')

  const doctorBlocks = DOCTORS.map((d) =>
    `### ${d.name} ${d.role}\n"${d.tagline}"\n${d.intro}\n주요 이력: ${d.career.slice(0, 4).join(' / ')}`
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
- 내포신도시에서 드문 치과교정과 전문의(보건복지부 인증) 상주 치과
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

## 비용 안내 (비급여)
${priceBlocks}

---

## 치과 용어 백과사전 (${TERMS.length}개)
${termBlocks}

---

※ 의료광고 심의 기준 준수. 모든 시술은 부작용이 발생할 수 있으며 치료 결과는 개인에 따라 다를 수 있습니다. 정확한 진단은 내원 상담을 통해 받으시기 바랍니다.
문서 기준일: 2026-09-02 · 출처: ${SITE.domain}
`)
})

// 404
app.notFound((c) => c.html(notFoundPage(), 404))

export default app
