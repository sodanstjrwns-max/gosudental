import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Hono } from 'hono'
import app from '../src/index'
import { canonicalUrl, schemaDate } from '../src/layout'
import { getUser, hashPassword, verifyPassword, signToken, verifyToken, secretOf, type Bindings } from '../src/auth'
import { consent, sanitizeContent, validateImage, safeJson } from '../src/security'

const secret = 'a-strong-test-secret-with-at-least-32-characters'
test('public handover never reveals credentials and retains restrictive headers', async () => {
  const sentinel = 'PRIVATE-ADMIN-SENTINEL-NOT-FOR-HTML'
  for (const origin of ['https://gosudc.kr', 'http://localhost', 'https://preview.example']) {
    const response = await app.request(origin + '/handover', {}, { ADMIN_PASSWORD: sentinel, SESSION_SECRET: secret } as any)
    assert.equal(response.status, 200)
    const body = await response.text()
    assert.ok(!body.includes(sentinel))
    assert.ok(!body.includes(secret))
    assert.ok(!body.includes('id="admin-password"'))
    assert.match(response.headers.get('Cache-Control') || '', /no-store/)
    assert.match(response.headers.get('Content-Security-Policy') || '', /default-src 'none'/)
    assert.match(response.headers.get('X-Robots-Tag') || '', /noindex/)
    assert.equal(response.headers.get('Referrer-Policy'), 'no-referrer')
  }
})
test('SEO canonical URLs exclude tracking, fragments and alternate hosts', () => {
  assert.equal(canonicalUrl('/treatments/implant/?utm_source=test#faq'), 'https://gosudc.kr/treatments/implant')
  assert.equal(canonicalUrl('https://preview.example/doctors/'), 'https://gosudc.kr/doctors')
  assert.equal(canonicalUrl('/'), 'https://gosudc.kr/')
  assert.equal(schemaDate('2026-09-15 12:00:00'), '2026-09-15T12:00:00.000Z')
  assert.equal(schemaDate('not a date'), undefined)
})

test('public trailing slash redirects preserve queries but never redirect write APIs', async () => {
  const response = await app.request('https://www.gosudc.kr/treatments/?utm_source=test')
  assert.equal(response.status, 301)
  assert.equal(response.headers.get('location'), 'https://gosudc.kr/treatments?utm_source=test')
  const api = await app.request('https://gosudc.kr/api/unknown/', { method: 'POST', headers: { Origin: 'https://gosudc.kr', 'Content-Type': 'application/json' }, body: '{}' }, {} as any)
  assert.notEqual(api.status, 301)
  assert.notEqual(api.status, 302)
})

test('search results and member-gated case details remain excluded from search', async () => {
  const search = await app.request('https://gosudc.kr/encyclopedia?q=implant', {}, {} as any)
  assert.match(search.headers.get('X-Robots-Tag') || '', /noindex/)
  assert.doesNotMatch(await search.text(), /type="application\/ld\+json"/)
  const DB = { prepare: () => ({ bind: () => ({ first: async () => ({ id: 1, title: '사례', published: 1, category: '임플란트' }) }) }) }
  const detail = await app.request('https://gosudc.kr/cases/1', {}, { DB } as any)
  assert.match(detail.headers.get('X-Robots-Tag') || '', /noindex/)
})

test('public editorial images can be indexed, missing images and private APIs cannot', async () => {
  const R2 = { get: async (key: string) => key === 'uploads/public.webp' ? { body: new Uint8Array([1]), httpMetadata: { contentType: 'image/webp' } } : null }
  const image = await app.request('https://gosudc.kr/api/uploads/public.webp', {}, { R2 } as any)
  assert.equal(image.status, 200)
  assert.equal(image.headers.get('X-Robots-Tag'), null)
  assert.match(image.headers.get('Cache-Control') || '', /public/)
  const missing = await app.request('https://gosudc.kr/api/uploads/missing.webp', {}, { R2 } as any)
  assert.equal(missing.status, 404)
  assert.match(missing.headers.get('X-Robots-Tag') || '', /noindex/)
})

test('strict consent: false-like values never become consent', () => {
  for (const value of [false, 'false', '0', 0, 1, {}, [], null, undefined]) assert.equal(consent(value), false)
  for (const value of [true, 'true', 'on']) assert.equal(consent(value), true)
})
test('password hashes salted and verifiable', async () => {
  for (const malformed of ['!', 'bad.hash', 'x'.repeat(22) + '.' + 'x'.repeat(43)]) assert.equal(await verifyPassword('test', malformed), false)
  const hash = await hashPassword('a long test password')
  assert.ok(await verifyPassword('a long test password', hash))
  assert.equal(await verifyPassword('wrong password', hash), false)
  assert.notEqual(await hashPassword('a long test password'), hash)
})
test('signed session rejects malformed, expired, tampered, missing-exp tokens', async () => {
  const valid = await signToken({ t: 'user', id: 1 }, secret, 60)
  assert.equal((await verifyToken(valid, secret)).id, 1)
  for (const token of ['!', 'x.y', valid + '.extra', valid.slice(0, -4) + 'abcd', await signToken({}, secret, -1)]) assert.equal(await verifyToken(token, secret), null)
  assert.equal(await verifyToken(valid, 'incorrect-secret'), null)
})
test('missing or short secrets fail closed', () => {
  for (const SESSION_SECRET of [undefined, '', 'short']) assert.throws(() => secretOf({ env: { SESSION_SECRET } } as any), /인증 설정/)
})
test('member deletion immediately invalidates an otherwise signed session', async () => {
  const h = new Hono<{ Bindings: Bindings }>()
  h.get('/', async c => c.json({ user: await getUser(c) }))
  const token = await signToken({ t: 'user', id: 3, name: 'Deleted' }, secret, 60)
  const DB = { prepare: () => ({ bind: () => ({ first: async () => null }) }) }
  const response = await h.request('/', { headers: { Cookie: `gosu_session=${token}` } }, { SESSION_SECRET: secret, DB } as any)
  assert.equal((await response.json() as { user: unknown }).user, null)
})
test('HTML allowlist strips executable content but preserves editorial formatting', () => {
  const input = '<h2>제목</h2><p onclick="evil()">본문<strong>강조</strong></p><script>alert(1)</script><svg><script>evil()</script></svg><img src="/api/uploads/test.png" onerror="evil()"><a href="javascript:alert(1)">링크</a><iframe src="https://evil.test"></iframe>'
  const clean = sanitizeContent(input)
  assert.match(clean, /<h2>제목<\/h2>/)
  assert.match(clean, /<strong>강조<\/strong>/)
  assert.match(clean, /src="\/api\/uploads\/test.png"/)
  assert.doesNotMatch(clean, /onclick|onerror|<script|javascript:|<svg|<iframe|evil\(\)/i)
  for (const href of ['jav&#x61;script:alert(1)', '//evil.test', 'data:text/html,foo']) assert.doesNotMatch(sanitizeContent(`<a href="${href}">x</a>`), /href="[^\"]+"/)
  assert.doesNotMatch(sanitizeContent('<img src="https://tracker.test/a.png">'), /tracker.test/)
})
test('JSON-LD cannot break out of script', () => {
  assert.doesNotMatch(safeJson({ text: '</script><script>alert(1)</script>' }), /</)
})
test('upload validates actual file signature and MIME, rejects oversized/SVG/spoof', async () => {
  const png = new File([readFileSync('public/static/img/favicon-32.png')], 'test.png', { type: 'image/png' })
  assert.equal((await validateImage(png)).ext, 'png')
  for (const file of [new File(['<svg onload="alert(1)"></svg>'], 'test.svg', { type: 'image/svg+xml' }), new File(['<html>fake</html>'], 'fake.jpg', { type: 'image/jpeg' }), new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' })]) await assert.rejects(validateImage(file))
})
test('API rejects cross-origin writes and missing auth configuration', async () => {
  const headers = { 'Content-Type': 'application/json', Origin: 'http://localhost' }
  const absent = await app.request('http://localhost/api/auth/login', { method: 'POST', headers, body: '{}' }, {} as any)
  assert.equal(absent.status, 503)
  const cross = await app.request('http://localhost/api/reservation', { method: 'POST', headers: { ...headers, Origin: 'https://evil.test' }, body: '{}' }, {} as any)
  assert.equal(cross.status, 403)
})

test('database failures are service errors, not empty content or misleading 404s', async () => {
  const DB = { prepare: () => { throw new Error('database temporarily unavailable') } }
  for (const path of ['/cases', '/column/example', '/notice', '/sitemap.xml']) {
    const response = await app.request('http://localhost' + path, {}, { DB } as any)
    assert.equal(response.status, 503)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
    assert.match(response.headers.get('X-Robots-Tag') || '', /noindex/)
    assert.match(await response.text(), /잠시 후|일시적/)
  }
})

test('logout clears only its own session cookie', async () => {
  for (const [route, expected, retained] of [['auth', 'gosu_session', 'gosu_admin'], ['admin', 'gosu_admin', 'gosu_session']]) {
    const response = await app.request(`http://localhost/api/${route}/logout`, { method: 'POST', headers: { Origin: 'http://localhost' } }, {} as any)
    assert.equal(response.status, 200)
    assert.match(response.headers.get('Set-Cookie') || '', new RegExp(expected))
    assert.doesNotMatch(response.headers.get('Set-Cookie') || '', new RegExp(retained))
  }
})

test('merged stats pages fail closed without configured keys and preserve admin-session access', async () => {
  for (const path of ['/api/local-stats', '/api/local-stats?key=invalid', '/admin/stats?key=invalid']) {
    const response = await app.request('http://localhost' + path, {}, {} as any)
    assert.equal(response.status, 404)
  }
  const token = await signToken({ t: 'admin' }, secret, 60)
  const page = await app.request('http://localhost/admin/stats', { headers: { Cookie: `gosu_admin=${token}` } }, { SESSION_SECRET: secret, ADMIN_PASSWORD: 'long-test-admin-password' } as any)
  assert.equal(page.status, 200)
  assert.match(await page.text(), /통합 통계/)
  assert.equal(page.headers.get('Cache-Control'), 'no-store')
})
