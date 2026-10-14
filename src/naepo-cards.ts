import { SITE } from './data/site'

// ─────────────────────────────────────────────
// '내포 {진료}' 하위 페이지 6개의 대표 이미지·카드 (2026-10-14 하위 페이지 카드 1차)
// 같은 사진을 og:image · 본문 첫 이미지 · 페이지 스키마 image · 사이트맵 image:image 에 동일하게 쓴다.
// - 임플란트·교정·라미네이트: 기존 진료 AI 이미지(treatment-*-ai-20260915.webp, 1200×800)
// - 충치·신경 / 보철 / 턱관절: 2026-10-14 생성 AI 이미지(원본 tools/subpage-cards/gen/gosudental/*.png)
// 파생본: /static/img/cards/naepo-<진료>-1200x630.jpg(og) · -600.webp(카드) · -1200.webp/-640.webp(본문, 신규 3종)
// ─────────────────────────────────────────────
export interface NaepoCard {
  slug: string // /area/<slug>
  title: string // 카드·ItemList 이름 = '{지역} {진료}'
  line: string // 카드 한 줄 설명
  og: string // 1200×630 jpg
  body: string // 본문 첫 이미지 (가로 1200)
  body640: string
  bodyW: number
  bodyH: number
  square: string // 600×600 webp
}

const OG_W = 1200
const OG_H = 630
export const NAEPO_CARD_OG = { width: OG_W, height: OG_H }

const card = (slug: string, title: string, line: string, body: string, bodyH: number): NaepoCard => ({
  slug,
  title,
  line,
  og: `/static/img/cards/${slug}-1200x630.jpg`,
  body,
  body640: body.replace(/(-1200)?\.webp$/, '-640.webp'),
  bodyW: 1200,
  bodyH,
  square: `/static/img/cards/${slug}-600.webp`,
})

export const NAEPO_CARDS: NaepoCard[] = [
  card('naepo-implant', '내포 임플란트', 'CBCT로 뼈와 신경 위치를 확인하고 계획하는 첫 상담', '/static/img/treatment-implant-ai-20260915.webp', 800),
  card('naepo-ortho', '내포 치아교정', '치과교정과 전문의가 진단부터 유지 관리까지', '/static/img/treatment-ortho-ai-20260915.webp', 800),
  card('naepo-aesthetic', '내포 라미네이트', '안면스캐너로 얼굴과 치아의 조화를 먼저 보는 설계', '/static/img/treatment-aesthetic-ai-20260915.webp', 800),
  card('naepo-preservation', '내포 충치·신경치료', '치료할 충치와 지켜볼 충치를 나누는 진단부터', '/static/img/cards/naepo-preservation-1200.webp', 797),
  card('naepo-prosthetics', '내포 보철(크라운·브릿지)', '교합을 먼저 보고 소재를 고르는 크라운·브릿지', '/static/img/cards/naepo-prosthetics-1200.webp', 797),
  card('naepo-tmj', '내포 턱관절', '관절과 근육을 구분하고 보존적 치료부터 단계적으로', '/static/img/cards/naepo-tmj-1200.webp', 797),
]

export const naepoCard = (slug: string) => NAEPO_CARDS.find((c) => c.slug === slug)

const abs = (p: string) => `${SITE.domain}${p}`

/** 페이지 스키마·primaryImageOfPage 용 ImageObject (og 와 같은 사진) */
export function naepoCardImageObject(c: NaepoCard) {
  return { '@type': 'ImageObject', url: abs(c.og), width: OG_W, height: OG_H, caption: `${c.title} 진료 안내 이미지` }
}

/** 홈 ItemList — 화면 카드와 1:1, 같은 순서 */
export function naepoItemListSchema(name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: NAEPO_CARDS.length,
    itemListElement: NAEPO_CARDS.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(`/area/${c.slug}`),
      name: c.title,
      image: abs(c.square),
    })),
  }
}

const esc = (v: string) => v.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!))

/**
 * 사진 카드 그리드 (정사각 600 썸네일 + 제목 + 한 줄). 카드 전체가 링크, 제목 텍스트가 접근 이름.
 * titleTag: 홈·허브처럼 h2 아래면 'h3', 하위 페이지 하단 형제 카드처럼 제목 계층 밖이면 'p'.
 */
export function naepoCardGrid(opts: { exclude?: string; titleTag?: 'h3' | 'p'; compact?: boolean } = {}): string {
  const tag = opts.titleTag || 'h3'
  const items = NAEPO_CARDS.filter((c) => c.slug !== opts.exclude)
  return `<ul class="area-card-grid${opts.compact ? ' compact' : ''}" role="list">${items
    .map(
      (c) => `<li><a class="area-card" href="/area/${c.slug}" aria-label="${esc(c.title)}"><span class="area-card-img"><img src="${c.square}" width="600" height="600" loading="lazy" decoding="async" alt="${esc(c.title)}"></span><span class="area-card-body"><${tag} class="area-card-title">${esc(c.title)}</${tag}><span class="area-card-line">${esc(c.line)}</span></span></a></li>`
    )
    .join('')}</ul>`
}
