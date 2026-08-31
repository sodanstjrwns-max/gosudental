import { html } from 'hono/html'
import { Layout, breadcrumbSchema, faqSchema } from '../layout'
import { SITE, TREATMENTS, PRICING } from '../data/site'

export function directionsPage() {
  const lbSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.domain}/#localbusiness`,
    name: SITE.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '삽교읍 예학로 93, 5층',
      addressLocality: '예산군',
      addressRegion: '충청남도',
      addressCountry: 'KR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 36.6547, longitude: 126.6716 },
    url: SITE.domain,
    image: `${SITE.domain}/static/img/og-image.jpg`,
  }

  const content = html`
<section class="page-hero" id="directions-hero">
  <div class="section-inner">
    <nav class="breadcrumb"><a href="/">홈</a> / <span>오시는 길</span></nav>
    <p class="eyebrow">Directions</p>
    <h1 class="h-display">오시는 길 · <em>진료시간</em></h1>
    <p class="lead">${SITE.address}<br>${SITE.addressShort}</p>
  </div>
</section>

<section class="section" id="directions-map-section" style="padding-top:30px">
  <div class="section-inner">
    <div class="map-frame reveal">
      <iframe
        src="https://maps.google.com/maps?q=${encodeURIComponent('충청남도 예산군 삽교읍 예학로 93')}&z=16&output=embed"
        title="고수치과 위치 지도" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
    <div class="grid-2" style="margin-top:56px;align-items:start">
      <div class="reveal">
        <h2 style="font-size:24px;font-weight:800;color:var(--brand-dark);margin-bottom:22px"><i class="fas fa-location-dot" style="color:var(--brand);margin-right:10px"></i>찾아오시는 방법</h2>
        <div class="prose">
          <ul>
            <li><strong>내포신도시 주키즈소아청소년과 건물 5층</strong>에 위치하고 있습니다.</li>
            <li>내포신도시중흥S클래스더시티 아파트 바로 앞 건물입니다.</li>
            <li>보성초등학교·덕산중학교·덕산고등학교에서 도보 5분 거리입니다.</li>
            <li>건물 내 여유로운 주차공간을 이용하실 수 있습니다.</li>
          </ul>
        </div>
      </div>
      <div class="reveal reveal-d1">
        <h2 style="font-size:24px;font-weight:800;color:var(--brand-dark);margin-bottom:22px"><i class="fas fa-clock" style="color:var(--brand);margin-right:10px"></i>진료시간</h2>
        <table class="price-table">
          <tbody>
            ${SITE.hours.map((h) => html`<tr><td style="font-weight:700;color:var(--brand-dark);width:40%">${h.day}</td><td>${h.time}</td></tr>`)}
          </tbody>
        </table>
        <div class="alert info">${SITE.openDate}입니다. 진료시간은 확정되는 대로 이 페이지와 네이버 플레이스에서 안내드리겠습니다.</div>
      </div>
    </div>
  </div>
</section>`

  return Layout(
    {
      title: '오시는 길 · 진료시간 — 내포신도시 주키즈소아과 건물 5층 | 고수치과의원',
      description:
        '고수치과 오시는 길: 충청남도 예산군 삽교읍 예학로 93, 5층 (내포신도시 주키즈소아청소년과 건물, 중흥S클래스더시티 앞). 주차 가능. 진료시간 안내.',
      path: '/directions',
      schema: [lbSchema, breadcrumbSchema([{ name: '홈', path: '/' }, { name: '오시는 길', path: '/directions' }])],
    },
    content
  )
}

export function tourPage() {
  const shots = [
    { img: 'interior-lobby.jpg', cap: '라운지 — 치과 문을 여는 순간부터 편안하게', cls: 'sp-a' },
    { img: 'interior-bookcafe.jpg', cap: '북카페 — 기다림이 지루하지 않은 공간', cls: 'sp-b' },
    { img: 'interior-01.jpg', cap: '데스크 & 라운지', cls: 'sp-c' },
    { img: 'interior-02.jpg', cap: '진료 존', cls: 'sp-d' },
    { img: 'interior-03.jpg', cap: '진료실 — 프라이버시를 지키는 구조', cls: 'sp-e' },
    { img: 'interior-04.jpg', cap: '대기 공간', cls: 'sp-a' },
    { img: 'interior-07.jpg', cap: '상담실', cls: 'sp-b' },
    { img: 'interior-09.jpg', cap: '복도 — 동선까지 설계한 공간', cls: 'sp-c' },
    { img: 'interior-17.jpg', cap: '진료 공간 전경', cls: 'sp-d' },
    { img: 'interior-04.jpg', cap: '수술 · 특수 진료 존', cls: 'sp-e' },
  ]
  const content = html`
<section class="page-hero dark" id="tour-hero">
  <div class="section-inner">
    <nav class="breadcrumb"><a href="/">홈</a> / <span>공간 둘러보기</span></nav>
    <p class="eyebrow" style="color:var(--brand-accent)">Space Tour</p>
    <h1 class="h-display">치과 같지 않은 치과,<br><em style="color:var(--brand-soft)">고수치과의 공간</em></h1>
    <p class="lead">두려움은 공간에서부터 시작됩니다. 그래서 고수치과는 첫인상부터 다르게 설계했습니다. 내포에서 가장 큰 규모, 가장 쾌적한 환경으로 준비하고 있습니다.</p>
  </div>
</section>

<section class="section" id="tour-gallery-section">
  <div class="section-inner">
    <div class="space-gallery" style="margin-top:0">
      ${shots.map((s) => html`
      <figure class="space-item ${s.cls} reveal">
        <img src="/static/img/${s.img}" alt="고수치과 ${s.cap}" loading="lazy">
        <figcaption class="cap">${s.cap}</figcaption>
      </figure>`)}
    </div>
    <div class="alert info" style="margin-top:40px">위 이미지는 인테리어 설계(3D) 도면으로, 실제 완공 모습과 일부 차이가 있을 수 있습니다. 개원 후 실제 공간 사진으로 업데이트됩니다.</div>
  </div>
</section>`

  return Layout(
    {
      title: '공간 둘러보기 | 고수치과의원 — 내포 최대 규모 치과',
      description: '고수치과 공간 둘러보기. 라운지·북카페·진료실·상담실까지 — 치과 같지 않은 편안한 공간을 만나보세요.',
      path: '/tour',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '공간 둘러보기', path: '/tour' }])],
    },
    content
  )
}

export function pricingPage() {
  const content = html`
<section class="page-hero" id="pricing-hero">
  <div class="section-inner">
    <nav class="breadcrumb"><a href="/">홈</a> / <span>비용 안내</span></nav>
    <p class="eyebrow">Pricing</p>
    <h1 class="h-display">비급여 진료비 <em>안내</em></h1>
    <p class="lead">의료법 제45조 및 관련 고시에 따라 비급여 진료비용을 고지합니다. 정확한 비용은 개원 시 확정하여 게시하며, 진단 후 치료 계획과 함께 상세히 안내드립니다.</p>
  </div>
</section>

<section class="section" id="pricing-table-section" style="padding-top:30px">
  <div class="section-narrow">
    ${PRICING.map((cat) => html`
    <div class="reveal">
      <h2 style="font-size:22px;font-weight:800;color:var(--brand-dark);margin:36px 0 6px">${cat.category}</h2>
      <table class="price-table">
        <thead><tr><th style="width:44%">항목</th><th>비용</th><th>비고</th></tr></thead>
        <tbody>
          ${cat.items.map((it) => html`<tr><td style="font-weight:600;color:var(--brand-dark)">${it.name}</td><td>${it.price}</td><td>${it.note}</td></tr>`)}
        </tbody>
      </table>
    </div>`)}
    <div class="alert warn reveal">비급여 진료비용은 부위·난이도·사용 재료에 따라 달라질 수 있으며, 반드시 사전에 충분한 설명과 동의를 거쳐 진행합니다. 최종 비용은 진단 후 안내드립니다.</div>
  </div>
</section>`

  return Layout(
    {
      title: '비용 안내 — 비급여 진료비 고지 | 고수치과의원',
      description: '고수치과 비급여 진료비용 안내. 임플란트·치아교정·라미네이트 등 주요 진료 비용을 투명하게 고지합니다.',
      path: '/pricing',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '비용 안내', path: '/pricing' }])],
    },
    content
  )
}

export function faqTotalPage() {
  const allFaqs = TREATMENTS.flatMap((t) => t.faqs.map((f) => ({ ...f, cat: t.name, slug: t.slug })))
  const content = html`
<section class="page-hero" id="faq-hero">
  <div class="section-inner">
    <nav class="breadcrumb"><a href="/">홈</a> / <span>자주 묻는 질문</span></nav>
    <p class="eyebrow">FAQ</p>
    <h1 class="h-display">자주 묻는 질문<br><em>${allFaqs.length}가지</em></h1>
    <p class="lead">진료별로 환자분들이 가장 많이 궁금해하시는 질문을 모았습니다. 원하는 진료를 선택해 확인해 보세요.</p>
  </div>
</section>

<section class="section" id="faq-list-section" style="padding-top:30px">
  <div class="section-narrow">
    <div class="case-filter">
      <button class="active" data-cat="all">전체</button>
      ${TREATMENTS.map((t) => html`<button data-cat="${t.slug}">${t.name}</button>`)}
    </div>
    <div class="faq-list case-grid" style="display:block">
      ${allFaqs.map((f) => html`
      <details class="faq-item" data-cat="${f.slug}">
        <summary>${f.q}</summary>
        <div class="faq-a">${f.a}<p style="margin-top:10px"><a href="/treatments/${f.slug}" style="color:var(--brand);font-weight:700;font-size:14px">→ ${f.cat} 자세히 보기</a></p></div>
      </details>`)}
    </div>
  </div>
</section>
<script>
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.querySelector('.case-filter');
  bar && bar.addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    document.querySelectorAll('.faq-item[data-cat]').forEach((el) => {
      el.style.display = btn.dataset.cat === 'all' || el.dataset.cat === btn.dataset.cat ? '' : 'none';
    });
  });
});
</script>`

  return Layout(
    {
      title: `자주 묻는 질문 ${allFaqs.length}가지 | 고수치과의원`,
      description: '임플란트·치아교정·라미네이트·신경치료·턱관절 — 고수치과 진료에 대해 환자분들이 가장 많이 묻는 질문과 답변을 한곳에 모았습니다.',
      path: '/faq',
      schema: [
        faqSchema(allFaqs.slice(0, 40)),
        breadcrumbSchema([{ name: '홈', path: '/' }, { name: '자주 묻는 질문', path: '/faq' }]),
      ],
    },
    content
  )
}

export function reservationPage() {
  const content = html`
<section class="page-hero" id="reservation-hero">
  <div class="section-inner">
    <nav class="breadcrumb"><a href="/">홈</a> / <span>상담 예약</span></nav>
    <p class="eyebrow">Reservation</p>
    <h1 class="h-display">상담 <em>예약</em></h1>
    <p class="lead">어려운 예약은 고수치과와 어울리지 않습니다. 아래 양식만 남겨주시면, 확인 후 바로 연락드리겠습니다.</p>
  </div>
</section>

<section class="section" id="reservation-form-section" style="padding-top:30px">
  <div class="auth-wrap" style="max-width:640px">
    <form class="form-card" data-ajax action="/api/reservation" method="POST">
      <div class="form-group">
        <label>성함 <span class="req">*</span></label>
        <input class="form-control" name="name" required placeholder="홍길동">
      </div>
      <div class="form-group">
        <label>연락처 <span class="req">*</span></label>
        <input class="form-control" name="phone" type="tel" required placeholder="010-0000-0000">
      </div>
      <div class="form-group">
        <label>이메일</label>
        <input class="form-control" name="email" type="email" placeholder="example@email.com">
      </div>
      <div class="form-group">
        <label>관심 진료</label>
        <select class="form-control" name="category">
          <option value="">선택해주세요</option>
          ${TREATMENTS.map((t) => html`<option value="${t.name}">${t.name}</option>`)}
          <option value="기타">기타 / 상담 후 결정</option>
        </select>
      </div>
      <div class="form-group">
        <label>희망 일시</label>
        <input class="form-control" name="preferred_at" placeholder="예: 11월 첫째 주 평일 오후">
      </div>
      <div class="form-group">
        <label>남기실 말씀</label>
        <textarea class="form-control" name="message" placeholder="궁금하신 점이나 현재 불편하신 점을 편하게 적어주세요. 치과 치료가 두려우신 분은 미리 말씀해 주시면 더 세심하게 준비하겠습니다."></textarea>
      </div>
      <label class="form-check">
        <input type="checkbox" name="privacy" required>
        <span>[필수] 개인정보 수집·이용에 동의합니다. (수집 항목: 성함·연락처·이메일 / 목적: 상담 예약 응대 / 보유 기간: 목적 달성 후 파기)</span>
      </label>
      <button type="submit" class="btn-submit">예약 신청하기</button>
    </form>
    <div class="alert info" style="margin-top:20px">${SITE.openDate}로, 개원 전에는 상담 예약을 순차적으로 안내드립니다.</div>
  </div>
</section>`

  return Layout(
    {
      title: '상담 예약 | 고수치과의원 — 내포신도시 치과',
      description: '고수치과 상담 예약. 임플란트·치아교정·심미보철 상담을 온라인으로 간편하게 신청하세요.',
      path: '/reservation',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '상담 예약', path: '/reservation' }])],
    },
    content
  )
}
