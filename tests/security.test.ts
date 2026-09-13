import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Hono } from 'hono'
import app from '../src/index'
import { getUser, hashPassword, verifyPassword, signToken, verifyToken, secretOf, type Bindings } from '../src/auth'
import { consent, sanitizeContent, validateImage, safeJson } from '../src/security'

const secret = 'a-strong-test-secret-with-at-least-32-characters'
test('strict consent: false-like values never become consent', () => {
  for (const value of [false, 'false', '0', 0, 1, {}, [], null, undefined]) assert.equal(consent(value), false)
  for (const value of [true, 'true', 'on']) assert.equal(consent(value), true)
})
test('password hashes salted and verifiable', async () => {
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
