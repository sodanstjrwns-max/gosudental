import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const base = 'http://localhost:3000' // Deliberately hardcoded: never run write tests on production.
const env = Object.fromEntries(readFileSync('.dev.vars', 'utf8').split('\n').filter(s => s.includes('=')).map(s => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')] }))
const unique = 'qa' + Date.now()
let admin = '', member = '', userId = 0, caseId = 0, postId = 0, noticeId = 0
async function call(path: string, method = 'GET', body?: unknown, cookie = '', ip = '192.0.2.15') {
  const headers: Record<string, string> = { Origin: base, 'CF-Connecting-IP': ip }
  if (cookie) headers.Cookie = cookie
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json'
  return fetch(base + path, { method, headers, body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body), redirect: 'manual' })
}
async function good(res: Response) {
  const data = await res.json() as any
  assert.equal(res.status, 200, JSON.stringify(data)); assert.equal(data.ok, true)
  return data
}
function fd(values: Record<string, string>, image?: boolean) {
  const data = new FormData()
  Object.entries(values).forEach(([k, v]) => data.set(k, v))
  if (image) data.set('photo_after', new File([readFileSync('public/static/img/favicon-32.png')], 'photo.png', { type: 'image/png' }))
  return data
}

test('local D1/R2: registration, reservation, full content CRUD, session revocation and limits', async () => {
  // Only expired/local test request-protection state is reset, not patient data.
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'gosudental-production', '--local', '--command', 'DELETE FROM rate_limits'], { stdio: 'pipe' })
  try {
    assert.equal((await call('/admin')).status, 302)
    assert.equal((await call('/api/admin/cases/1')).status, 401)
    const login = await call('/api/admin/login', 'POST', { password: env.ADMIN_PASSWORD })
    await good(login); admin = login.headers.get('set-cookie')!.split(';')[0]
    assert.ok(admin.startsWith('gosu_admin='))
    const input = { name: unique, email: unique + '@example.com', phone: '010-1234-5678', password: 'Testing-password-2026', privacy_consent: true, marketing_consent: true }
    assert.equal((await call('/api/auth/register', 'POST', { ...input, privacy_consent: false })).status, 400)
    assert.equal((await call('/api/auth/register', 'POST', { ...input, privacy_consent: {} })).status, 400)
    const registered = await call('/api/auth/register', 'POST', input)
    await good(registered); member = registered.headers.get('set-cookie')!.split(';')[0]
    assert.match(registered.headers.get('set-cookie')!, /HttpOnly/)
    assert.match(registered.headers.get('set-cookie')!, /Secure/)
    assert.equal((await call('/api/auth/register', 'POST', input)).status, 409)
    const payload = JSON.parse(Buffer.from(member.split('=')[1].split('.')[0], 'base64url').toString())
    userId = payload.id
    const me = await (await call('/api/auth/me', 'GET', undefined, member)).json() as any
    assert.equal(me.user.name, unique)
    assert.equal((await call('/api/auth/login', 'POST', { email: input.email, password: 'wrong' })).status, 401)
    const signed = await good(await call('/api/auth/login?next=//evil.test', 'POST', { email: input.email.toUpperCase(), password: input.password }))
    assert.equal(signed.redirect, '/auth/mypage')
    const reserve = { name: unique, phone: '010-1234-5678', category: '임플란트', privacy_consent: true, message: 'Local automated test only' }
    assert.equal((await call('/api/reservation', 'POST', { ...reserve, phone: 'garbage' })).status, 400)
    assert.equal((await call('/api/reservation', 'POST', { ...reserve, privacy_consent: false })).status, 400)
    await good(await call('/api/reservation', 'POST', reserve))
    const reservationsHtml = await (await call('/admin/reservations', 'GET', undefined, admin)).text()
    assert.ok(reservationsHtml.includes(unique))

    const cs = { title: unique, category: '임플란트', doctor_slug: 'cho-wonik', published: '1', description: '처음 설명' }
    caseId = (await good(await call('/api/admin/cases', 'POST', fd(cs, true), admin))).id
    assert.equal((await call(`/api/case-image/${caseId}/photo_after`)).status, 403)
    assert.equal((await call(`/api/case-image/${caseId}/photo_after`, 'GET', undefined, member)).status, 200)
    await good(await call(`/api/admin/cases/${caseId}`, 'PUT', fd({ ...cs, description: '수정한 설명' }), admin))
    const editedCase = (await good(await call(`/api/admin/cases/${caseId}`, 'GET', undefined, admin))).item
    assert.equal(editedCase.description, '수정한 설명'); assert.ok(editedCase.photo_after)
    await good(await call(`/api/admin/cases/${caseId}`, 'PUT', fd({ ...cs, published: '0' }), admin))
    assert.equal((await call(`/api/case-image/${caseId}/photo_after`, 'GET', undefined, member)).status, 404)
    await good(await call(`/api/admin/cases/${caseId}`, 'PUT', fd(cs), admin))

    const post = { title: unique, slug: unique, author_slug: 'cho-wonik', content: '<h2>안전한 제목</h2><p onclick="alert(1)">내용</p><script>alert(1)</script>' }
    postId = (await good(await call('/api/admin/posts', 'POST', post, admin))).id
    let item = (await good(await call(`/api/admin/posts/${postId}`, 'GET', undefined, admin))).item
    assert.doesNotMatch(item.content, /script|onclick/)
    const image = new FormData(); image.set('image', new File([readFileSync('public/static/img/favicon-32.png')], 'photo.png', { type: 'image/png' }))
    const upload = await good(await call('/api/admin/upload', 'POST', image, admin))
    assert.equal((await call(upload.url)).status, 200)
    await good(await call(`/api/admin/posts/${postId}`, 'PUT', { ...post, title: '변경 ' + unique, content: '<h3>변경 제목</h3><p>본문</p><img src="' + upload.url + '">' }, admin))
    item = (await good(await call(`/api/admin/posts/${postId}`, 'GET', undefined, admin))).item
    assert.equal(item.thumbnail, upload.url)
    assert.match(await (await call('/column/' + unique)).text(), /변경 제목/)
    assert.equal((await call('/api/admin/posts', 'POST', post, admin)).status, 409)
    assert.equal((await call('/api/admin/posts/99999999', 'PUT', post, admin)).status, 404)

    const notice = fd({ title: unique, content: '공지 원문', pinned: 'on' })
    notice.set('image', new File([readFileSync('public/static/img/favicon-32.png')], 'photo.png', { type: 'image/png' }))
    noticeId = (await good(await call('/api/admin/notices', 'POST', notice, admin))).id
    await good(await call(`/api/admin/notices/${noticeId}`, 'PUT', fd({ title: unique + ' 변경', content: '공지 수정' }), admin))
    item = (await good(await call(`/api/admin/notices/${noticeId}`, 'GET', undefined, admin))).item
    assert.equal(item.content, '공지 수정'); assert.ok(item.image)
    await good(await call(`/api/admin/notices/${noticeId}`, 'PUT', fd({ title: unique, content: '공지 수정', remove_image: 'on' }), admin))
    assert.equal((await good(await call(`/api/admin/notices/${noticeId}`, 'GET', undefined, admin))).item.image, null)
    await good(await call(`/api/admin/notices/${noticeId}`, 'PUT', { pinned: 1 }, admin))

    for (const [name, type, data] of [['fake.jpg', 'image/jpeg', '<script>evil()</script>'], ['bad.svg', 'image/svg+xml', '<svg/>']] as const) {
      const image = new FormData(); image.set('image', new File([data], name, { type }))
      assert.equal((await call('/api/admin/upload', 'POST', image, admin)).status, 400)
    }
    const large = new FormData(); large.set('image', new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }))
    assert.equal((await call('/api/admin/upload', 'POST', large, admin)).status, 413)
    assert.equal((await call('/api/reservation', 'POST', { ...reserve, message: 'x'.repeat(20000) })).status, 413)
    assert.equal((await call('/api/auth/login', 'POST', null)).status, 400)
    assert.equal((await call('/api/auth/me', 'GET', undefined, 'gosu_session=%%%%.oops')).status, 200)
    const xsrf = await fetch(base + '/api/admin/posts', { method: 'POST', headers: { Origin: 'https://evil.test', Cookie: admin, 'Content-Type': 'application/json' }, body: JSON.stringify(post) })
    assert.equal(xsrf.status, 403)
    await good(await call(`/api/admin/users/${userId}`, 'DELETE', undefined, admin)); userId = 0
    assert.equal(((await (await call('/api/auth/me', 'GET', undefined, member)).json()) as any).user, null)
    assert.equal((await call(`/api/case-image/${caseId}/photo_after`, 'GET', undefined, member)).status, 403)
    for (let i = 0; i < 10; i++) assert.equal((await call('/api/admin/login', 'POST', { password: 'wrong-admin-password' }, '', '192.0.2.222')).status, 401)
    const blocked = await call('/api/admin/login', 'POST', { password: 'wrong-admin-password' }, '', '192.0.2.222')
    assert.equal(blocked.status, 429); assert.ok(Number(blocked.headers.get('retry-after')) > 0)
    const styles = await call('/static/style.css?v=20260913-1'); assert.match(styles.headers.get('cache-control') || '', /must-revalidate/)
  } finally {
    for (const [kind, id] of [['cases', caseId], ['posts', postId], ['notices', noticeId], ['users', userId]] as const) if (id) await call(`/api/admin/${kind}/${id}`, 'DELETE', undefined, admin)
    execFileSync('npx', ['wrangler', 'd1', 'execute', 'gosudental-production', '--local', '--command', `DELETE FROM reservations WHERE name='${unique}'; DELETE FROM rate_limits;`], { stdio: 'pipe' })
  }
})

test('merged remote features: fee editor, hidden fees, large payload and statistics authorization', async () => {
  const login = await call('/api/admin/login', 'POST', { password: env.ADMIN_PASSWORD }, '', '192.0.2.99')
  await good(login)
  const cookie = login.headers.get('set-cookie')!.split(';')[0]
  const editor = await (await call('/admin/fees', 'GET', undefined, cookie)).text()
  const match = editor.match(/var FEES = (.*?);\n/)
  assert.ok(match, 'Fee editor JSON must be present')
  const original = JSON.parse(match[1])
  assert.equal(original.flatMap((g: any) => g.items).length, 106)
  try {
    assert.equal((await call('/api/admin/fees', 'POST', { groups: [] })).status, 401)
    assert.equal((await call('/api/admin/fees', 'POST', {}, cookie)).status, 400)
    const hidden = [{ category: '통합테스트', items: [{ name: '숨김항목-merge-test', price: '912345원', note: '</script><script>bad()</script>', is_published: 0 }] }]
    await good(await call('/api/admin/fees', 'POST', { groups: hidden }, cookie))
    for (const path of ['/pricing', '/llms-full.txt']) {
      const response = await call(path)
      assert.equal(response.status, 200)
      const text = await response.text()
      assert.doesNotMatch(text, /숨김항목-merge-test|912345원|89만원/)
    }
    const privateEditor = await (await call('/admin/fees', 'GET', undefined, cookie)).text()
    assert.ok(privateEditor.includes('숨김항목-merge-test'))
    assert.doesNotMatch(privateEditor, /<script>bad\(\)<\/script>/)
    hidden[0].items[0].is_published = 1
    await good(await call('/api/admin/fees', 'POST', { groups: hidden }, cookie))
    assert.match(await (await call('/pricing')).text(), /숨김항목-merge-test/)
    assert.match(await (await call('/llms-full.txt')).text(), /숨김항목-merge-test/)
    await good(await call('/api/admin/fees', 'POST', { groups: [] }, cookie))
    assert.doesNotMatch(await (await call('/pricing')).text(), /89만원|숨김항목-merge-test/)
    // Long notes in a 106-row edit must not hit the general 16KB JSON limit.
    const large = structuredClone(original)
    large.forEach((group: any) => group.items.forEach((item: any) => { item.note = '가'.repeat(100) }))
    assert.ok(Buffer.byteLength(JSON.stringify({ groups: large }), 'utf8') > 16000)
    await good(await call('/api/admin/fees', 'POST', { groups: large }, cookie))
    await good(await call('/api/admin/fees', 'POST', { groups: original }, cookie))
    assert.equal((await call('/admin/stats?key=invalid')).status, 404)
    assert.equal((await call('/api/local-stats')).status, 404)
    assert.equal((await call('/api/local-stats?key=invalid')).status, 404)
    assert.ok(env.STATS_TOKEN, 'Local integration secret required for test')
    const stats = await fetch(base + '/api/local-stats', { headers: { Authorization: 'Bearer ' + env.STATS_TOKEN } })
    assert.equal(stats.status, 200)
    const data: any = await stats.json()
    assert.equal(data.supported, true)
    assert.equal(typeof data.total.cur, 'number')
    assert.equal(stats.headers.get('cache-control'), 'no-store')
    const home = await (await call('/')).text()
    for (const marker of ['naver-site-verification','google-site-verification','G-PEHGCMJSN9','yenfpw6ija','pf-dashboard-2nt.pages.dev/beacon.js']) assert.ok(home.includes(marker), marker)
  } finally {
    await good(await call('/api/admin/fees', 'POST', { groups: original }, cookie))
  }
})
