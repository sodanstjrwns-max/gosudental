// HMAC 서명 세션 + PBKDF2 비밀번호 해시 (Web Crypto)
import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

export type Bindings = {
  DB: D1Database
  R2: R2Bucket
  ADMIN_PASSWORD?: string
  SESSION_SECRET?: string
}

const enc = new TextEncoder()

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function signToken(payload: object, secret: string, maxAgeSec: number): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify({ ...payload, exp: Date.now() + maxAgeSec * 1000 })))
  const key = await hmacKey(secret)
  const sig = b64url(await crypto.subtle.sign('HMAC', key, enc.encode(body)))
  return `${body}.${sig}`
}

export async function verifyToken(token: string, secret: string): Promise<any | null> {
  try {
    if (typeof token !== 'string' || token.length > 4096 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) return null
    const [body, sig] = token.split('.')
    const key = await hmacKey(secret)
    if (!(await crypto.subtle.verify('HMAC', key, b64urlDecode(sig) as unknown as ArrayBuffer, enc.encode(body)))) return null
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)))
    if (!payload || !Number.isFinite(payload.exp) || payload.exp <= Date.now()) return null
    return payload
  } catch { return null }
}

export async function hashPassword(password: string, salt?: Uint8Array): Promise<string> {
  const s = salt || crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: s as unknown as ArrayBuffer, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  )
  return `${b64url(s)}.${b64url(bits)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (typeof stored !== 'string' || !/^[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}$/.test(stored)) return false
  try {
    const [saltB64] = stored.split('.')
    const salt = b64urlDecode(saltB64)
    if (salt.length !== 16) return false
    return constantEqual(await hashPassword(password, salt), stored)
  } catch { return false }
}

export async function constantTimePasswordMatch(a: string, b: string) {
  const [x, y] = await Promise.all([a, b].map(s => crypto.subtle.digest('SHA-256', enc.encode(s))))
  return constantEqual(b64url(x), b64url(y))
}
function constantEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
export function secretOf(c: Context<{ Bindings: Bindings }>) {
  const secret = c.env.SESSION_SECRET
  if (!secret || secret.length < 32) throw new HTTPException(503, { message: '인증 설정을 준비 중입니다. 관리자에게 문의해주세요.' })
  return secret
}

export async function getUser(c: Context<{ Bindings: Bindings }>): Promise<{ id: number; name: string; email: string } | null> {
  const token = getCookie(c, 'gosu_session')
  if (!token) return null
  if (!c.env.SESSION_SECRET || c.env.SESSION_SECRET.length < 32) return null
  const payload = await verifyToken(token, secretOf(c))
  if (!payload || payload.t !== 'user' || !Number.isSafeInteger(payload.id) || payload.id < 1) return null
  // A deleted member must immediately lose all access, including image endpoints.
  return await c.env.DB.prepare('SELECT id, name, email FROM users WHERE id = ?').bind(payload.id).first<{ id: number; name: string; email: string }>()
}

export async function getAdmin(c: Context<{ Bindings: Bindings }>): Promise<boolean> {
  const token = getCookie(c, 'gosu_admin')
  if (!token) return false
  if (!c.env.SESSION_SECRET || c.env.SESSION_SECRET.length < 32 || !c.env.ADMIN_PASSWORD || c.env.ADMIN_PASSWORD.length < 12) return false
  const payload = await verifyToken(token, secretOf(c))
  return !!payload && payload.t === 'admin'
}

export async function setUserSession(c: Context<{ Bindings: Bindings }>, user: { id: number; name: string; email: string }) {
  const token = await signToken({ t: 'user', id: user.id }, secretOf(c), 30 * 86400)
  setCookie(c, 'gosu_session', token, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge: 30 * 86400 })
}

export async function setAdminSession(c: Context<{ Bindings: Bindings }>) {
  const token = await signToken({ t: 'admin' }, secretOf(c), 86400)
  setCookie(c, 'gosu_admin', token, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge: 86400 })
}

export function clearSessions(c: Context<{ Bindings: Bindings }>, kind?: 'user' | 'admin') {
  if (kind !== 'admin') deleteCookie(c, 'gosu_session', { path: '/' })
  if (kind !== 'user') deleteCookie(c, 'gosu_admin', { path: '/' })
}

export function isBot(ua: string | undefined): boolean {
  if (!ua) return true
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|gptbot|claudebot|perplexity|headless|lighthouse/i.test(ua)
}
