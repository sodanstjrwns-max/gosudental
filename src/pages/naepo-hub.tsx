import { html } from 'hono/html'
import { Layout, breadcrumbSchema, faqSchema } from '../layout'
import { SITE, AREAS, DOCTORS } from '../data/site'

// ─────────────────────────────────────────────
// '내포 치과' 지역 허브 (2026-10-08)
// - 네이버 통합검색 '내포 치과' 4위·'내포신도시 치과' 1위 → 정확 일치 허브를 하나 둔다.
// - 사실은 site.ts 값만 사용(주소·건물·주차·대표전화·개원 예정일·의료진·장비). 진료시간은 개원 전 미확정이라 '확정 시 안내'.
// - 다른 지역 페이지(area-local.ts) 문장은 재사용하지 않는다. 가격·후기·평점·최상급 표현 금지.
// ─────────────────────────────────────────────
export const NAEPO_HUB_PATH = '/area/naepo'
export const NAEPO_HUB_MODIFIED = '2026-10-08'

const HUB_FAQS = [
  {
    q: '내포 치과 고수치과는 정확히 어디에 있나요?',
    a: `주소는 ${SITE.address}입니다. 내포신도시 안 주키즈소아청소년과가 있는 건물의 5층이고, 내포신도시중흥S클래스더시티 아파트 바로 앞에 있습니다. 행정구역은 예산군 삽교읍이지만 생활권으로는 내포신도시 한가운데입니다.`,
  },
  {
    q: '언제부터 진료하나요? 진료시간은요?',
    a: `${SITE.openDate}입니다. 요일별 진료시간은 아직 확정되지 않아, 정해지는 대로 오시는 길 페이지와 네이버 플레이스에 먼저 올려 두겠습니다. 일요일과 공휴일은 휴진할 예정입니다.`,
  },
  {
    q: '차를 가지고 가도 되나요?',
    a: '네. 병원이 있는 건물 안에 주차공간이 있어 자가용으로 오셔도 됩니다. 예산·홍성·덕산 쪽에서 차로 오시는 분은 내비게이션에 "예학로 93"을 입력하시면 건물 앞까지 안내됩니다.',
  },
  {
    q: '교정 상담은 어느 원장님이 하나요?',
    a: '치아교정은 보건복지부 인증 치과교정과 전문의인 김경환 원장이 상담부터 마무리까지 맡습니다. 성장기 아이의 교정, 성인 교정, 인비절라인 투명교정을 모두 상담하실 수 있습니다.',
  },
  {
    q: '임플란트 전에 어떤 검사를 하나요?',
    a: '파노라마와 CBCT(3차원 CT)로 잇몸뼈의 높이·폭과 신경 위치를 확인하고, 구강스캐너로 치아와 잇몸 모양을 디지털로 기록합니다. 그 결과를 화면으로 함께 보며 살릴 수 있는 치아가 있는지부터 설명드립니다.',
  },
  {
    q: '예약은 어떻게 하나요?',
    a: `홈페이지 예약 페이지에서 원하시는 날짜와 상담 내용을 남기시거나 대표전화 ${SITE.tel}로 문의하시면 됩니다. 개원 전에는 남겨 주신 연락처로 일정이 정해지는 대로 연락드립니다.`,
  },
]

export function naepoHubPage() {
  const ortho = DOCTORS.find((d) => d.slug === 'kim-kyunghwan')
  const areaLinks = AREAS.filter((a) => a.region === '내포' || a.region === '내포신도시')

  const content = html`
<section class="page-hero dark" id="naepo-hub-hero">
  <div class="section-inner">
    <nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <a href="/directions">오시는 길</a> / <span>내포 치과</span></nav>
    <p class="eyebrow" style="color:var(--brand-accent)">내포신도시 · 예산군 삽교읍 예학로 93</p>
    <h1 class="h-display">내포 치과</h1>
    <p class="lead">내포신도시 중흥S클래스더시티 앞, 주키즈소아청소년과 건물 5층의 고수치과입니다. ${SITE.openDate}이며, 임플란트·교정과 전문의 치아교정·심미보철을 한곳에서 상담하실 수 있습니다.</p>
  </div>
</section>

<section class="section" id="naepo-hub-content">
  <div class="section-narrow prose">
    <div class="alert info" id="quick-answer"><strong>핵심 답변</strong> — 내포신도시에서 치과를 찾으신다면, 고수치과는 ${SITE.address}(주키즈소아청소년과 건물)에 있고 건물 안에 주차할 수 있습니다. 대표전화는 ${SITE.tel}, 개원은 2026년 11월 2일 예정입니다.</div>

    <h2>위치와 찾아오는 길</h2>
    <p>고수치과가 들어선 곳은 충남도청이 있는 내포신도시의 예산군 삽교읍 구역입니다. 건물 1층부터 위로 소아청소년과 등 병의원이 함께 있는 주키즈소아청소년과 건물이고, 치과는 5층입니다. 길 건너편이 내포신도시중흥S클래스더시티 단지라 아파트 정문을 기준으로 찾으시면 쉽습니다.</p>
    <ul>
      <li>보성초등학교·덕산중학교·덕산고등학교에서 걸어서 5분 안팎</li>
      <li>건물 내 주차공간 이용 가능</li>
      <li>홍성·예산·덕산에서 차로 오실 때 내비게이션 목적지: 예학로 93</li>
    </ul>
    <p><a href="/directions">→ 지도와 오시는 길 자세히 보기</a></p>

    <h2>진료시간과 개원 일정</h2>
    <p>${SITE.openDate}입니다. 평일·토요일 진료시간은 아직 확정 전이라 숫자를 미리 적지 않았습니다. 확정되면 <a href="/directions">오시는 길·진료시간</a> 페이지와 네이버 플레이스에 먼저 안내드리고, 일요일과 공휴일은 휴진할 예정입니다. 개원 전 상담 문의는 대표전화 <a href="${SITE.telHref}">${SITE.tel}</a> 또는 <a href="/reservation">예약 페이지</a>로 남겨 주세요.</p>

    <h2>함께 진료하는 의료진</h2>
    <ul>
      <li><a href="/doctors/cho-wonik">조원익 대표원장</a> — 단국대학교 치과대학 졸업. 임플란트·심미보철을 중심으로 진료하며, 살릴 수 있는 치아를 먼저 살피는 것을 원칙으로 합니다.</li>
      <li><a href="/doctors/kim-kyunghwan">김경환 원장</a> — ${ortho ? ortho.role : '교정과 전문의'}(보건복지부 인증). 원광대학교 치과병원 치과교정과 수련, 성장기·성인·투명교정을 맡습니다.</li>
      <li><a href="/doctors/lee-minwoo">이민우 원장</a> — 단국대학교 치과대학 졸업. 충치·신경치료와 보철, 턱관절 진료를 맡습니다.</li>
    </ul>

    <h2>내포에서 많이 찾는 진료</h2>
    <p>진료 과목별로 무엇을 확인하고 어떤 순서로 치료하는지 정리해 두었습니다.</p>
    <ul>
      <li><a href="/treatments/implant">임플란트</a> — CBCT와 구강스캐너로 계획하고, 조건이 맞으면 앞니는 디지털 임시치아를 빠르게 연결합니다.</li>
      <li><a href="/treatments/ortho">치아교정</a> — 교정과 전문의 상담, 아이 성장기 교정부터 성인·인비절라인까지.</li>
      <li><a href="/treatments/aesthetic">심미보철·라미네이트</a> — RAYFace 안면스캐너로 얼굴과 치아의 조화를 함께 봅니다.</li>
      <li><a href="/treatments/preservation">충치·신경치료</a>, <a href="/treatments/prosthetics">크라운·브릿지</a>, <a href="/treatments/tmj">턱관절치료</a></li>
    </ul>
    <p>비용이 궁금하시면 <a href="/pricing">비급여 수가 안내</a>를, 처음 듣는 치과 용어는 <a href="/encyclopedia">치과 백과사전</a>을 참고해 주세요.</p>

    <h2>지역별 진료 안내</h2>
    <p>내포·내포신도시에서 많이 묻는 진료를 따로 정리한 페이지입니다.</p>
    <div class="pill-row">
      ${areaLinks.map((a) => html`<a class="pill" href="/area/${a.slug}">${a.region} ${a.treatment}</a>`)}
    </div>
    <p style="font-size:14px;color:var(--ink-soft)">치료 방법·기간·결과에는 개인차가 있으며, 정밀 진단 후 개별적으로 안내드립니다.</p>
  </div>
</section>

<section class="section" id="naepo-hub-faq" style="padding-top:0">
  <div class="section-narrow">
    <h2 style="font-size:24px;font-weight:800;color:var(--brand-dark)">내포 치과 자주 묻는 질문</h2>
    <div class="faq-list">
      ${HUB_FAQS.map((f) => html`
      <details class="faq-item">
        <summary>${f.q}</summary>
        <div class="faq-a">${f.a}</div>
      </details>`)}
    </div>
    <div class="cta-band" style="margin-top:60px">
      <h2>내포신도시에서 상담 예약</h2>
      <p>${SITE.addressShort} · 대표전화 ${SITE.tel}</p>
      <a href="/reservation" class="hero-btn primary">상담 예약하기</a>
    </div>
  </div>
</section>`

  return Layout(
    {
      title: '내포 치과 · 내포신도시 치과 | 고수치과',
      description: `내포 치과 고수치과 — ${SITE.address}(내포신도시 주키즈소아청소년과 건물, 중흥S클래스더시티 앞). 건물 내 주차, 대표전화 ${SITE.tel}, 2026년 11월 2일 개원 예정. 임플란트·교정과 전문의 치아교정·심미보철.`,
      path: NAEPO_HUB_PATH,
      pageType: 'MedicalWebPage',
      modifiedTime: NAEPO_HUB_MODIFIED,
      schema: [
        {
          '@type': 'MedicalWebPage',
          about: { '@id': `${SITE.domain}/#organization` },
          areaServed: [
            { '@type': 'Place', name: '내포신도시' },
            { '@type': 'AdministrativeArea', name: '충청남도 예산군 삽교읍' },
            { '@type': 'AdministrativeArea', name: '충청남도 홍성군 홍북읍' },
          ],
          dateModified: NAEPO_HUB_MODIFIED,
        },
        faqSchema(HUB_FAQS),
        breadcrumbSchema([
          { name: '홈', path: '/' },
          { name: '오시는 길', path: '/directions' },
          { name: '내포 치과', path: NAEPO_HUB_PATH },
        ]),
      ],
    },
    content
  )
}
