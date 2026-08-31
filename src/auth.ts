// HMAC 서명 세션 + PBKDF2 비밀번호 해시 (Web Crypto)
import type { Context } from 'hono'
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
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const key = await hmacKey(secret)
  const ok = await crypto.subtle.verify('HMAC', key, b64urlDecode(sig) as unknown as ArrayBuffer, enc.encode(body))
  if (!ok) return null
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)))
    if (payload.exp && payload.exp < Date.now()) return null
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
  const [saltB64] = stored.split('.')
  if (!saltB64) return false
  const rehash = await hashPassword(password, b64urlDecode(saltB64))
  return rehash === stored
}

const SECRET_FALLBACK = 'gosu-dental-dev-secret-key-2026-inpo'
export function secretOf(c: Context<{ Bindings: Bindings }>) {
  return c.env.SESSION_SECRET || SECRET_FALLBACK
}

export async function getUser(c: Context<{ Bindings: Bindings }>): Promise<{ id: number; name: string; email: string } | null> {
  const token = getCookie(c, 'gosu_session')
  if (!token) return null
  const payload = await verifyToken(token, secretOf(c))
  return payload && payload.t === 'user' ? payload : null
}

export async function getAdmin(c: Context<{ Bindings: Bindings }>): Promise<boolean> {
  const token = getCookie(c, 'gosu_admin')
  if (!token) return false
  const payload = await verifyToken(token, secretOf(c))
  return !!payload && payload.t === 'admin'
}

export async function setUserSession(c: Context<{ Bindings: Bindings }>, user: { id: number; name: string; email: string }) {
  const token = await signToken({ t: 'user', id: user.id, name: user.name, email: user.email }, secretOf(c), 30 * 86400)
  setCookie(c, 'gosu_session', token, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge: 30 * 86400 })
}

export async function setAdminSession(c: Context<{ Bindings: Bindings }>) {
  const token = await signToken({ t: 'admin' }, secretOf(c), 86400)
  setCookie(c, 'gosu_admin', token, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge: 86400 })
}

export function clearSessions(c: Context<{ Bindings: Bindings }>) {
  deleteCookie(c, 'gosu_session', { path: '/' })
  deleteCookie(c, 'gosu_admin', { path: '/' })
}

export function isBot(ua: string | undefined): boolean {
  if (!ua) return true
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|gptbot|claudebot|perplexity|headless|lighthouse/i.test(ua)
}
