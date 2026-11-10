// ═══════════════════════════════════════════════
// 구글 전용 검색 제외 (2026-11-10)
//
// 무엇을: 치과 백과사전 구역(/encyclopedia 목록 + /encyclopedia/용어 103쪽)을
//         구글 크롤러에게만 `X-Robots-Tag: googlebot: noindex` 헤더로 검색 제외한다.
// 왜:     대량 생성 구역 때문에 구글이 사이트 전체를 낮게 평가하는 일을 막으려는 예방 조치.
//         구글이 보는 사이트를 병원 핵심 페이지(홈·진료·의료진·비용·오시는 길 등)로 줄인다.
// 지킬 것: 네이버(Yeti)·Bing·일반 방문자·AI 봇 응답은 헤더·본문이 한 글자도 달라지면 안 된다.
//         HTML 메타 태그, robots.txt, sitemap, canonical, 본문, 스키마는 건드리지 않는다.
//         200 HTML 응답에만 붙인다(301·404 제외).
// 되돌리기: isGoogleHiddenPath 가 항상 false 를 돌려주게 하면 끝.
// ═══════════════════════════════════════════════

export const GOOGLE_HIDE_HEADER = 'googlebot: noindex'

/** 구글 검색 크롤러만. Google-Extended·GoogleOther·AdsBot·Mediapartners 는 대상이 아니다. */
export function isGoogleCrawler(ua: string | undefined | null): boolean {
  return !!ua && /googlebot|google-inspectiontool/i.test(ua)
}

/** 구글에만 가리는 경로. 범위는 백과사전 구역뿐(목록 포함). 지역·칼럼·그 밖은 전부 남긴다. */
export function isGoogleHiddenPath(pathname: string): boolean {
  return pathname === '/encyclopedia' || pathname.startsWith('/encyclopedia/')
}
