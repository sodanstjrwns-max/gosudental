// ============================================================
// 칼럼·비포애프터 SEO/AEO 헬퍼 (PFWE-COLUMN-CASE-SEO 표준, 2026-10-03) — 고수치과
// - 본문 HTML 정리: 본문 속 <h1> → <h2>(페이지 H1은 제목 하나), 이미지 alt·lazy 보강
// - 핵심 답변: 본문 첫 문단에서 그대로 발췌(새 문장을 만들지 않음)
// - FAQ: 질문형 <h3> + 다음 제목 전까지의 답변
// ============================================================

const decodeEntities = (s: string) =>
  s
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => {
      const c = Number(n)
      return c > 0 && c < 0x110000 ? String.fromCodePoint(c) : ''
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
      const c = parseInt(n, 16)
      return c > 0 && c < 0x110000 ? String.fromCodePoint(c) : ''
    })
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')

export const htmlText = (s: string) =>
  decodeEntities(
    String(s || '')
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\s*\/?>|<\/(?:p|li|div|blockquote|tr|figcaption|h[1-6])>/gi, ' ')
      .replace(/<[^>]*>/g, ''),
  )
    .replace(/\[\d+(?:\s*[,–-]\s*\d+)*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** 렌더용 본문 정리 — 내용은 바꾸지 않고 태그만 보정 */
export function prepareArticleHtml(html: string, title: string): string {
  let out = String(html || '')
  // 붙여넣기로 제목 태그가 문단·사진을 감싼 경우(<h2><p>…</p></h2>) 제목 태그만 걷어낸다 — 본문이 제목 크기로 보이고 목차가 깨지는 것 방지 (2026-10-15)
  out = out.replace(/<(h[1-6])\b[^>]*>((?:(?!<\/\1>)[\s\S])*?<(?:p|div|img|ul|ol|table|figure|blockquote|h[1-6])\b(?:(?!<\/\1>)[\s\S])*)<\/\1>/gi, '$2')
  // 빈 h2·h3(<h2><br></h2>) 제거
  out = out.replace(/<(h[2-4])\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>|<span>\s*<\/span>)*<\/\1>/gi, '')
  // 빈 h1(<h1><br></h1>) 제거, 나머지 본문 h1 은 h2 로 (페이지 H1 = 글 제목 하나)
  out = out.replace(/<h1\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/h1>/gi, '')
  out = out.replace(/<h1(\b[^>]*)>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>')
  // 이미지: alt 없으면 제목 기반, 첫 이미지 외 lazy, decoding async
  let n = 0
  out = out.replace(/<img\b([^>]*?)\/?>/gi, (_m, attrs: string) => {
    n++
    let a = attrs
    const altM = a.match(/\salt\s*=\s*("([^"]*)"|'([^']*)')/i)
    const altVal = altM ? (altM[2] ?? altM[3] ?? '').trim() : ''
    if (!altVal) {
      a = a.replace(/\salt\s*=\s*("[^"]*"|'[^']*')/i, '')
      a += ` alt="${escAttr(`${title} 이미지 ${n}`)}"`
    }
    if (n > 1 && !/\sloading\s*=/i.test(a)) a += ' loading="lazy"'
    if (!/\sdecoding\s*=/i.test(a)) a += ' decoding="async"'
    return `<img${a.replace(/\s+$/, '')} />`
  })
  return out
}

const GREETING = /^(안녕하세요|안녕하십니까|반갑습니다)/
const SENTENCE_SPLIT = /(?<=[.!?。])\s+/
const CONNECTOR = /^(그리고|그런데|하지만|그러나|그래서|그렇게|또|또한|특히|물론|이처럼|이렇게)\s/
const LEAD_IN = /(이런|다음과 같|아래와 같|아래처럼)/
const SELF_INTRO = /(원장|대표원장|치과의원|치과)\s*[가-힣]{0,4}\s*(입니다|이에요|예요)\.?$/

/**
 * 본문 HTML → 문단 텍스트 목록(제목은 HEAD 표시). 에디터가 Enter 로 만드는 <div> 줄, 태그 밖 맨 글자도 문단으로 본다.
 * 목록·표·인용·그림 캡션은 요약 후보에서 뺀다.
 */
function articleBlocks(html: string): string[] {
  const HEAD = '\u0002HEAD\u0002'
  const src = String(html || '')
    .replace(/<(h[1-6])\b[^>]*>[\s\S]*?<\/\1>/gi, `\u0001${HEAD}\u0001`)
    .replace(/<(ul|ol|table|blockquote|figure)\b[^>]*>[\s\S]*?<\/\1>/gi, '\u0001')
    .replace(/<\/?(?:p|div|section|article|hr)\b[^>]*>|<br\s*\/?>\s*(?:<br\s*\/?>\s*)+/gi, '\u0001')
  return src.split('\u0001').map((t) => (t === HEAD ? HEAD : htmlText(t))).filter(Boolean)
}
/** 문단 앞머리의 인사·자기소개 문장("안녕하세요. ○○치과 대표원장 ○○○입니다.")만 떼어낸다 — 뒤 문장은 그대로 */
function dropGreeting(t: string): string {
  const ss = t.split(SENTENCE_SPLIT).filter(Boolean)
  while (ss.length && (GREETING.test(ss[0]) || (SELF_INTRO.test(ss[0]) && ss[0].length < 50))) ss.shift()
  return ss.join(' ')
}

/**
 * 핵심 요약 박스 문구 — 본문에서 그대로 발췌(새 문장을 만들지 않음). 2026-10-15 보완:
 * 0) (호출부) 관리자 '핵심 요약' 입력값이 있으면 그것을 우선 사용
 * 1) "결론부터/결론적으로/요약하면/한마디로"로 시작하는 문단
 * 2) 글 머리(첫 소제목 전, 첫 소제목이 맨 위면 두 번째 소제목 전)의 첫 설명 문단 — 인사·자기소개 문장은 떼고 판단
 * 3) 앞쪽 15문단 중 "…입니다/됩니다"로 설명하는 문단
 * 4) 그 외 첫 실질 문단(40자 이상)
 * 문단 = <p>, 에디터의 <div> 줄, 태그 밖 글자. ※ 안내문·▶ 링크 줄·인용·질문은 제외. 최대 3문장·220자.
 */
export function answerSummaryFromHtml(html: string): string {
  const blocks = articleBlocks(html).slice(0, 60)
  const paras: string[] = []
  let leadEnd = -1
  for (const b of blocks) {
    if (b === '\u0002HEAD\u0002') {
      if (paras.length && leadEnd < 0) leadEnd = paras.length
      continue
    }
    const t = dropGreeting(b)
    if (t.length >= 20) paras.push(t)
  }
  if (leadEnd < 0) leadEnd = Math.min(paras.length, 4)
  const ok = (t: string) =>
    t.length >= 40 &&
    !GREETING.test(t) &&
    !/^[※▶►\-–•·*]/.test(t) &&
    !/▶/.test(t) &&
    !/^[“"'「『(]/.test(t) &&
    !/[“”"]/.test(t) &&
    !CONNECTOR.test(t) &&
    !/원장입니다\.?$/.test(t) &&
    !/[?？]$|까요\.?$/.test(t) &&
    !(LEAD_IN.test(t) && t.length < 90)
  const declarative = (t: string) => /(다|요)\.?$/.test(t)
  const pick =
    paras.find((t) => /^(먼저\s*)?(결론부터|결론적으로|요약하면|한마디로|핵심만)/.test(t)) ||
    paras.slice(0, Math.min(leadEnd, 4)).find((t) => ok(t) && declarative(t)) ||
    paras.slice(0, 15).find((t) => ok(t) && /(입니다|됩니다|습니다)\.?$/.test(t) && /(입니다|됩니다|때문입니다)/.test(t)) ||
    paras.find(ok)
  if (!pick) return ''
  return clipSentences(pick)
}
function clipSentences(pick: string, max = 220): string {
  const sentences = pick.split(SENTENCE_SPLIT).filter(Boolean)
  let out = ''
  for (const s of sentences.slice(0, 3)) {
    if ((out + ' ' + s).trim().length > max && out) break
    out = (out + ' ' + s).trim()
  }
  if (out.length > max) out = out.slice(0, max - 1).trimEnd() + '…'
  return out
}

// ===== 칼럼 부가 설정(핵심 요약 직접 입력·목차 표시) — 2026-10-15 =====
// posts 테이블에 열을 추가하지 않고(운영 D1 마이그레이션 없이) 본문 맨 앞의 표시 요소로 저장한다.
// <div data-col-meta="summary">요약</div> · <div data-col-meta="no-toc"></div>
// 화면·검색 요약·목차 계산 전에 splitColumnMeta 로 떼어내므로 본문에는 나타나지 않는다.
export type ColumnMeta = { summary: string; showToc: boolean }
const META_RE = /<div\b[^>]*\bdata-col-meta="(summary|no-toc)"[^>]*>([\s\S]*?)<\/div>/gi
export function splitColumnMeta(html: string): { html: string; meta: ColumnMeta } {
  let summary = ''
  let showToc = true
  const rest = String(html || '').replace(META_RE, (_m, kind: string, inner: string) => {
    if (kind === 'summary' && !summary) summary = htmlText(inner).slice(0, 300)
    if (kind === 'no-toc') showToc = false
    return ''
  })
  return { html: rest, meta: { summary, showToc } }
}
const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export function joinColumnMeta(html: string, meta: ColumnMeta): string {
  const body = splitColumnMeta(html).html
  const summary = String(meta.summary || '').replace(/\s+/g, ' ').trim()
  return (summary ? `<div data-col-meta="summary">${escHtml(summary)}</div>` : '') + (meta.showToc ? '' : '<div data-col-meta="no-toc"></div>') + body
}

export type TocItem = { level: 2 | 3; id: string; text: string }
/** h2·h3 에 id(sec-1, sec-2 …)를 붙이고 목차 항목을 돌려준다. 너무 긴(120자 초과) 제목은 목차에서 뺀다(id 는 부여). */
export function addHeadingAnchors(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = []
  let n = 0
  const out = String(html || '').replace(/<(h[23])\b([^>]*)>([\s\S]*?)<\/\1>/gi, (m, tag: string, attrs: string, inner: string) => {
    const text = htmlText(inner)
    if (!text) return m
    n++
    const id = `sec-${n}`
    const clean = attrs.replace(/\sid\s*=\s*("[^"]*"|'[^']*'|\S+)/i, '')
    if (text.length <= 120) toc.push({ level: tag.toLowerCase() === 'h2' ? 2 : 3, id, text })
    return `<${tag}${clean} id="${id}">${inner}</${tag}>`
  })
  return { html: out, toc }
}
/** 표를 가로 스크롤 상자로 감싼다(모바일에서 표만 좌우로 밀어 보기) */
export function wrapTables(html: string): string {
  return String(html || '')
    .replace(/<table\b/gi, '<div class="col-table" role="region" aria-label="표 (좌우로 밀어 보기)" tabindex="0"><table')
    .replace(/<\/table>/gi, '</table></div>')
}

const QUESTION_END = /(?:[?？]|(?:나요|까요|가요|은가|는가|인가|니까|는지요|을까|ㄹ까|죠|습니까|되나요|있나요)[.!]?)$/
const clip = (s: string, n: number) => {
  if (s.length <= n) return s
  const cut = s.slice(0, n)
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('다. '), cut.lastIndexOf('요. '))
  return (end > n * 0.5 ? cut.slice(0, end + 1) : cut.trimEnd()) + '…'
}

export type Faq = { q: string; a: string }
/** 질문형 h3 + 다음 h1~h3 전까지 답변. 렌더 HTML(prepareArticleHtml 결과)을 넣어 화면 내용과 일치시킨다. */
export function faqsFromArticleHtml(html: string, maxItems = 20, maxAnswer = 1000): Faq[] {
  const src = String(html || '')
  const heads = Array.from(src.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi))
  const out: Faq[] = []
  const seen = new Set<string>()
  for (const m of heads) {
    if (out.length >= maxItems) break
    const q = htmlText(m[1]).replace(/^(?:Q\s*\d*\s*[.:)]|질문\s*\d*\s*[.:)])\s*/i, '').trim()
    if (!q || q.length > 200 || !QUESTION_END.test(q) || seen.has(q)) continue
    let seg = src.slice(m.index! + m[0].length)
    const next = seg.search(/<h[1-3][\s>]/i)
    if (next >= 0) seg = seg.slice(0, next)
    const stop = seg.search(/<p\b[^>]*>\s*<(strong|b)\b[^>]*>[^<]{1,40}<\/\1>\s*<\/p>|<hr\b|<p\b[^>]*>\s*※/i)
    if (stop >= 0) seg = seg.slice(0, stop)
    const a = htmlText(seg).replace(/^(?:A\s*\d*\s*[.:)]|답변\s*[.:)])\s*/i, '').trim()
    if (a.length < 10) continue
    seen.add(q)
    out.push({ q, a: clip(a, maxAnswer) })
  }
  return out
}

/** meta description 80~160자: 우선 값이 80자 미만이면 본문 발췌로 보충 */
export function metaDescription(primary: string | undefined | null, fallback: string, max = 160): string {
  const norm = (s: string) => String(s || '').replace(/\s+/g, ' ').trim()
  let d = norm(primary || '')
  if (d.length < 80) {
    const f = norm(fallback)
    d = d ? (f && !f.startsWith(d) ? `${d} ${f}` : f || d) : f
  }
  if (d.length <= max) return d
  const cut = d.slice(0, max - 1)
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('다.'), cut.lastIndexOf('요.'))
  return stop >= max * 0.5 ? cut.slice(0, stop + (cut[stop] === '.' ? 1 : 2)).trim() : cut.trimEnd() + '…'
}

/** D1 'YYYY-MM-DD HH:MM:SS' → ISO(UTC) */
export function isoDate(v: string | null | undefined): string | undefined {
  if (!v) return undefined
  const s = String(v).trim().replace(' ', 'T')
  const d = new Date(/Z$|[+-]\d{2}:?\d{2}$/.test(s) ? s : s + 'Z')
  return isNaN(d.getTime()) ? undefined : d.toISOString()
}
export const ymd = (v: string | null | undefined) => (v ? String(v).slice(0, 10) : '')

// IndexNow — 공개 칼럼 저장 후 응답 뒤(waitUntil) 통보. 키는 검증 파일로 공개되는 값.
export const INDEXNOW_KEY = '024ee7058372d26d344d7bfc39f1f498'
export async function pingIndexNow(paths: string[], host = 'gosudc.kr'): Promise<void> {
  const urlList = [...new Set(paths.filter(Boolean).map((p) => `https://${host}${p.startsWith('/') ? p : '/' + p}`))]
  if (!urlList.length) return
  const body = JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`, urlList })
  await Promise.all(['https://api.indexnow.org/indexnow', 'https://searchadvisor.naver.com/indexnow'].map(async (ep) => {
    try { await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body, signal: AbortSignal.timeout(5000) }) } catch { /* 무시 */ }
  }))
}

// ===== 칼럼 작성 주체 (2026-10-08, 사용자 승인) =====
// 원장을 저자·감수자로 표시하는 건 원장이 쓰거나 검토했다는 근거가 있을 때만.
// seed.sql('샘플 원장 칼럼', 커밋 d963032 2026-08-31 대행사 일괄 구현)로 들어간 id 1(greeting-open-2026)·
// id 2(implant-checklist-before)는 author_slug='cho-wonik' 이지만 원장 작성·검토 근거 없음 → 병원(Organization) 발행.
// 작성자가 비었거나 등록 의료진이 아닌 글도 대표원장으로 대체(fallback)하지 않고 병원 발행.
// 관리자에서 병원이 의료진을 작성자로 직접 선택한 글(시드 제외)만 그 원장을 저자로 표시한다.
export const AGENCY_SEED_POST_IDS = new Set([1, 2])
export const CLINIC_GENERAL_INFO_NOTE = '일반 건강정보입니다. 진료 판단은 내원 상담에서 원장이 직접 합니다.'
export function attestedColumnAuthor<D extends { slug: string }>(p: { id?: number | string | null; author_slug?: string | null }, doctors: D[]): D | undefined {
  if (p.id != null && AGENCY_SEED_POST_IDS.has(Number(p.id))) return undefined
  return p.author_slug ? doctors.find((d) => d.slug === p.author_slug) : undefined
}

// 이미지 헤더 바이트에서 가로·세로 읽기 (PNG · JPEG · WebP). 칼럼 썸네일 og:image:width/height 용 (2026-10-14).
// 실패하면 null — 크기를 지어내지 않는다.
export function imageSizeFromBytes(b: Uint8Array): { width: number; height: number } | null {
  const u16be = (i: number) => (b[i] << 8) | b[i + 1]
  const u32be = (i: number) => ((b[i] << 24) >>> 0) + (b[i + 1] << 16) + (b[i + 2] << 8) + b[i + 3]
  const u16le = (i: number) => b[i] | (b[i + 1] << 8)
  const u24le = (i: number) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16)
  const ok = (w: number, h: number) => (w > 0 && h > 0 && w < 20000 && h < 20000 ? { width: w, height: h } : null)
  if (b.length >= 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return ok(u32be(16), u32be(20))
  if (b.length >= 30 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    const kind = String.fromCharCode(b[12], b[13], b[14], b[15])
    if (kind === 'VP8 ') return ok(u16le(26) & 0x3fff, u16le(28) & 0x3fff)
    if (kind === 'VP8L') { const v = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24); return ok((v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1) }
    if (kind === 'VP8X') return ok(u24le(24) + 1, u24le(27) + 1)
    return null
  }
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue }
      const m = b[i + 1]
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue }
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return ok(u16be(i + 7), u16be(i + 5))
      i += 2 + u16be(i + 2)
    }
  }
  return null
}
