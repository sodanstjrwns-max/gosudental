// =====================================================================
// "내포 치과" 대표 키워드 허브(/area/naepo)로 모으는 내부 링크 (2026-10-08)
// - 앵커 문구는 항상 정확히 "내포 치과", nofollow 없음
// - 한 페이지에 허브 링크 최대 2개(푸터 1 + 본문 1). 허브 자신과 홈(이미 2개)에는 푸터 링크를 넣지 않는다.
// - 칼럼 상세 끝 안내 문장은 4가지 문형 중 slug 해시로 고정 선택(글마다 같은 문장 반복 방지)
// - 사실 정보는 site.ts 값만(건물·주차·지역·의료진). 개원 전이라 진료시간·개원일 같은 시점 정보는 문장에 넣지 않는다.
// =====================================================================

export const HUB_PATH = '/area/naepo'
export const HUB_ANCHOR = '내포 치과'

/** 푸터에 허브 링크를 넣을지 — 허브 자신·홈(본문에 이미 2개)은 제외 */
export function footerHubLink(path: string): boolean {
  return path !== HUB_PATH && path !== '/'
}

function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h
}

/** 칼럼 상세 본문 끝 지역 안내 한 문장(HTML 문자열). seed = 글 slug */
export function columnHubNote(seed: string, topic?: string): string {
  const a = `<a href="${HUB_PATH}">${HUB_ANCHOR}</a>`
  const what = topic ? `${topic} 상담` : '진료 상담'
  const forms = [
    `고수치과는 ${a}를 찾는 내포신도시 주민분들께 ${what}을 어떻게 받으실 수 있는지 차근차근 안내합니다.`,
    `${a}를 알아보고 계신다면 주키즈소아청소년과 건물 5층에 자리한 고수치과의 위치와 주차 안내를 먼저 확인해 보세요.`,
    `예산·홍성·덕산에서 ${a}를 찾는 분들을 위해 고수치과의 찾아오는 길과 담당 의료진을 한곳에 정리해 두었습니다.`,
    `내포신도시중흥S클래스더시티 앞 고수치과는 ${a}를 찾는 이웃분들께 진료 과목과 담당 원장을 미리 안내해 드립니다.`,
  ]
  return `<p class="col-hub-note" style="margin:28px 0 0;padding:14px 18px;border-left:3px solid var(--brand);background:var(--brand-mist);border-radius:0 10px 10px 0;font-size:15px;line-height:1.75;color:var(--ink-soft)">${forms[hashSeed(seed) % forms.length]}</p>`
}
