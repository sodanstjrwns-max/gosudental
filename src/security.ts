import xss from 'xss'
const { FilterXSS, safeAttrValue, escapeAttrValue } = xss as unknown as typeof import('xss')
import { HTTPException } from 'hono/http-exception'
import type { Context } from 'hono'
import type { Bindings } from './auth'

export function bad(message: string): never {
  throw new HTTPException(400, { message })
}
export function text(value: unknown, label: string, max = 200, required = false): string {
  if (value === undefined || value === null) value = ''
  if (typeof value !== 'string') return bad(`${label} 형식이 올바르지 않습니다.`)
  const s = value.trim()
  if ((required && !s) || s.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s))
    return bad(`${label}을(를) ${max}자 이내로 올바르게 입력해주세요.`)
  return s
}
export function passwordValue(value: unknown, min = 1) {
  // Password whitespace is significant; do not silently trim existing credentials.
  if (typeof value !== 'string' || value.length < min || value.length > 128) bad(`비밀번호는 ${min}~128자로 입력해주세요.`)
  return value as string
}
export function emailValue(value: unknown, required = false) {
  const s = text(value, '이메일', 254, required).toLowerCase()
  if (s && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) bad('올바른 이메일을 입력해주세요.')
  return s
}
export function phoneValue(value: unknown) {
  const s = text(value, '연락처', 24, true)
  if (!/^[0-9\s()+-]+$/.test(s)) bad('올바른 연락처를 입력해주세요.')
  const digits = s.replace(/\D/g, '')
  if (!/^0\d{8,10}$/.test(digits)) bad('올바른 연락처를 입력해주세요.')
  return digits
}
export function consent(value: unknown) { return value === true || value === 'true' || value === 'on' }
export function positiveId(value: unknown) {
  if (!/^\d+$/.test(String(value))) bad('잘못된 게시물 번호입니다.')
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id < 1) bad('잘못된 게시물 번호입니다.')
  return id
}
export async function jsonObject(c: Context) {
  const raw = await c.req.json().catch(() => bad('잘못된 JSON 요청입니다.'))
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) bad('객체 형식으로 요청해주세요.')
  return raw as Record<string, unknown>
}
// js-xss is a parser-based allowlist sanitizer with no Node runtime dependencies.
const htmlFilter = new FilterXSS({
  whiteList: {
    p: [], br: [], h2: [], h3: [], h4: [], strong: [], b: [], em: [], i: [], u: [], s: [],
    ul: [], ol: [], li: [], blockquote: [], a: ['href', 'title'],
    img: ['src', 'alt', 'width', 'height'], figure: [], figcaption: [], hr: [],
    table: [], thead: [], tbody: [], tr: [], th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan'], div: [], span: [],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'textarea', 'title', 'noscript', 'template'],
  allowCommentTag: false,
  safeAttrValue(tag, name, value, cssFilter) {
    if (tag === 'img' && name === 'src') {
      return /^\/(?:api\/uploads\/|static\/img\/)[a-zA-Z0-9_./-]+\.(?:jpe?g|png|webp)$/i.test(value) ? escapeAttrValue(value) : ''
    }
    if (tag === 'a' && name === 'href') {
      if (!/^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(value) || /[\\\x00-\x20]/.test(value)) return ''
    }
    if (['width', 'height', 'colspan', 'rowspan'].includes(name) && !/^\d{1,4}$/.test(value)) return ''
    return safeAttrValue(tag, name, value, cssFilter)
  },
})
export function sanitizeContent(content: string) { return htmlFilter.process(content) }
export function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
}

// Persistent, atomic fixed-window limiter. Store hashed identifiers, not raw IPs/emails.
export async function rateLimit(c: Context<{ Bindings: Bindings }>, scope: string, identity: string, limit: number, windowSec = 900) {
  const now = Math.floor(Date.now() / 1000)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(scope + ':' + identity))
  const key = scope + ':' + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
  let row: { hits: number; expires_at: number } | null
  try {
    row = await c.env.DB.prepare(`INSERT INTO rate_limits (key, hits, expires_at) VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET
      hits = CASE WHEN rate_limits.expires_at <= ? THEN 1 ELSE rate_limits.hits + 1 END,
      expires_at = CASE WHEN rate_limits.expires_at <= ? THEN excluded.expires_at ELSE rate_limits.expires_at END
      RETURNING hits, expires_at`).bind(key, now + windowSec, now, now).first()
    await c.env.DB.prepare('DELETE FROM rate_limits WHERE key IN (SELECT key FROM rate_limits WHERE expires_at < ? LIMIT 100)').bind(now).run()
  } catch {
    throw new HTTPException(503, { message: '요청 보호 기능을 준비 중입니다. 잠시 후 다시 시도해주세요.' })
  }
  if (!row) throw new HTTPException(503, { message: '요청 보호 기능을 사용할 수 없습니다.' })
  if (row.hits > limit) {
    c.header('Retry-After', String(Math.max(1, row.expires_at - now)))
    throw new HTTPException(429, { message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' })
  }
}
export function clientIP(c: Context) {
  // Cloudflare overwrites this header at the edge. Never trust arbitrary X-Forwarded-For.
  return c.req.header('cf-connecting-ip') || 'local'
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export async function validateImage(file: File) {
  if (!(file instanceof File) || !file.size) bad('이미지 파일이 필요합니다.')
  if (file.size > MAX_IMAGE_BYTES) throw new HTTPException(413, { message: '이미지는 한 장당 5MB 이하만 가능합니다.' })
  const bytes = new Uint8Array(await file.arrayBuffer())
  const prefix = (v: number[]) => v.every((b, i) => bytes[i] === b)
  let ext = ''
  if (prefix([0xff, 0xd8, 0xff]) && bytes.length > 4 && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9) ext = 'jpg'
  if (prefix([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10]) && bytes.length >= 33 && new TextDecoder().decode(bytes.slice(12, 16)) === 'IHDR') ext = 'png'
  if (bytes.length >= 30 && new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP' && new DataView(bytes.buffer).getUint32(4, true) + 8 === bytes.length) ext = 'webp'
  const mime = ({ jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' } as Record<string, string>)[ext]
  if (!mime || file.type !== mime) bad('파일 내용과 형식이 일치하는 JPG·PNG·WebP 이미지만 업로드할 수 있습니다.')
  return { bytes, ext, mime }
}
