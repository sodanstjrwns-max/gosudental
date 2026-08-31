import { html } from 'hono/html'
import { Layout } from '../layout'
import { SITE, TREATMENTS, DOCTORS, EQUIPMENT } from '../data/site'

export function homePage() {
  const core = TREATMENTS.filter((t) => t.core)
  const others = TREATMENTS.filter((t) => !t.core)
  const coreImgs: Record<string, string> = {
    implant: '/static/img/interior-03.jpg',
    ortho: '/static/img/interior-07.jpg',
    aesthetic: '/static/img/interior-01.jpg',
  }

  const content = html`
<!-- HERO -->
<section class="hero" id="hero-section">
  <div class="hero-bg" style="background-image:url('/static/img/interior-lobby.jpg')"></div>
  <div class="hero-veil"></div>
  <div class="hero-inner">
    <p class="hero-eyebrow">GOSU DENTAL · 내포신도시 ${SITE.openDate}</p>
    <h1 class="hero-title">
      <span class="line"><span>치과 치료의 두려움을</span></span>
      <span class="line"><span><em>신뢰</em>로 바꾸는 치과</span></span>
    </h1>
    <p class="hero-sub">좋은 결과를 고수합니다. 환자 중심의 진료를 고수합니다. 배움과 성장을 고수합니다. — 굳이 멀리 가지 않아도, 내포에서 충분히 믿고 치료받을 수 있도록.</p>
    <div class="hero-actions">
      <a href="/reservation" class="hero-btn primary">상담 예약하기</a>
      <a href="/mission" class="hero-btn outline">고수치과 이야기</a>
    </div>
  </div>
  <div class="hero-scroll">Scroll</div>
</section>

<!-- 철학 -->
<section class="section philosophy" id="philosophy-section">
  <div class="section-inner">
    <p class="eyebrow reveal" style="color:var(--brand-accent)">Our Promise</p>
    <h2 class="h-display reveal reveal-d1" style="color:#fff">고수치과는<br>세 가지 약속을 <em style="color:var(--brand-accent)">고수</em>합니다</h2>
    <p class="lead reveal reveal-d2" style="color:rgba(255,255,255,0.7)">固守 — 지켜야 할 것을 오래도록 지키며, 어제보다 더 나은 高手가 되어가는 치과.</p>
    <div class="phil-grid">
      <article class="phil-card reveal reveal-d1">
        <span class="phil-num">PROMISE 01</span>
        <h3>좋은 결과를 고수합니다</h3>
        <p>비용보다 결과를 먼저 생각하며, 검증된 재료와 장비를 사용합니다. 치료의 질과 타협하지 않습니다.</p>
      </article>
      <article class="phil-card reveal reveal-d2">
        <span class="phil-num">PROMISE 02</span>
        <h3>환자 중심 진료를 고수합니다</h3>
        <p>불필요한 치료를 권하지 않고, 필요한 치료는 충분히 설명합니다. 환자의 이야기를 먼저 듣습니다.</p>
      </article>
      <article class="phil-card reveal reveal-d3">
        <span class="phil-num">PROMISE 03</span>
        <h3>배움과 성장을 고수합니다</h3>
        <p>오늘보다 더 나은 진료를 위해 배움과 연구를 멈추지 않습니다. 전국의 고수들을 직접 찾아가 배웁니다.</p>
      </article>
    </div>
  </div>
</section>

<!-- 핵심 진료 -->
<section class="section" id="core-treatments-section">
  <div class="section-inner">
    <p class="eyebrow reveal">Core Treatments</p>
    <h2 class="h-display reveal reveal-d1">내포 유일의 <em>올인원 진료</em></h2>
    <p class="lead reveal reveal-d2">한 사람의 고민을 해결하기 위해 필요한 여러 선택지를 한곳에서 비교하고, 그중 꼭 필요한 치료만 선택할 수 있도록 안내합니다.</p>
    <div class="treat-grid">
      ${core.map((t, i) => html`
      <a href="/treatments/${t.slug}" class="treat-card reveal reveal-d${i + 1}">
        <div class="treat-card-img"><img src="${coreImgs[t.slug]}" alt="${t.name} 진료 공간" loading="lazy"></div>
        <div class="treat-card-body">
          <span class="treat-tag">Signature</span>
          <h3>${t.name}</h3>
          <p>${t.short}</p>
          <span class="treat-more">자세히 보기 <i class="fas fa-arrow-right"></i></span>
        </div>
      </a>`)}
    </div>
    <div class="treat-sub-grid">
      ${others.map((t) => html`
      <a href="/treatments/${t.slug}" class="treat-sub reveal">
        <h4>${t.name}</h4>
        <p>${t.short}</p>
      </a>`)}
    </div>
  </div>
</section>

<!-- 숫자 -->
<section class="section stats-band" id="stats-section">
  <div class="section-inner">
    <div class="stats-grid">
      <div class="reveal"><div class="stat-num"><span data-count="3">0</span><span class="unit">인</span></div><p class="stat-label">의료진 협진 체계</p></div>
      <div class="reveal reveal-d1"><div class="stat-num"><span data-count="6">0</span><span class="unit">과목</span></div><p class="stat-label">올인원 진료 영역</p></div>
      <div class="reveal reveal-d2"><div class="stat-num"><span data-count="20">0</span><span class="unit">년+</span></div><p class="stat-label">교정 전문의 임상 경험</p></div>
      <div class="reveal reveal-d3"><div class="stat-num"><span data-count="30">0</span><span class="unit">회+</span></div><p class="stat-label">의료진 연수 · 교육 이수</p></div>
    </div>
  </div>
</section>

<!-- 의료진 -->
<section class="section" id="doctors-section" style="background:#fff">
  <div class="section-inner">
    <p class="eyebrow reveal">Medical Team</p>
    <h2 class="h-display reveal reveal-d1">배움을 멈추지 않는<br><em>고수치과 의료진</em></h2>
    <div class="doctor-grid">
      ${DOCTORS.map((d, i) => html`
      <a href="/doctors/${d.slug}" class="doctor-card reveal reveal-d${i + 1}">
        <div class="doctor-photo">
          <span class="badge">${d.role}</span>
          <i class="fas fa-user-doctor" aria-hidden="true"></i>
        </div>
        <div class="doctor-body">
          <h3>${d.name} 원장</h3>
          <p class="role">${d.role === '교정과 전문의' ? '치과교정과 전문의 (보건복지부 인증)' : d.role}</p>
          <p>"${d.tagline}"</p>
        </div>
      </a>`)}
    </div>
  </div>
</section>

<!-- 공간 -->
<section class="section" id="space-section" style="background:var(--brand-mist)">
  <div class="section-inner">
    <p class="eyebrow reveal">Space</p>
    <h2 class="h-display reveal reveal-d1">치과 같지 않은,<br>편안한 <em>공간</em></h2>
    <p class="lead reveal reveal-d2">치과 문을 여는 순간부터 두려움이 아닌 편안함을 느끼실 수 있도록, 공간 하나하나를 설계했습니다.</p>
    <div class="space-gallery">
      <figure class="space-item sp-a reveal"><img src="/static/img/interior-lobby.jpg" alt="고수치과 로비 전경" loading="lazy"><figcaption class="cap">Lounge</figcaption></figure>
      <figure class="space-item sp-b reveal reveal-d1"><img src="/static/img/interior-bookcafe.jpg" alt="고수치과 북카페 상담 공간" loading="lazy"><figcaption class="cap">Book Cafe</figcaption></figure>
      <figure class="space-item sp-c reveal"><img src="/static/img/interior-02.jpg" alt="고수치과 진료 공간" loading="lazy"><figcaption class="cap">Clinic</figcaption></figure>
      <figure class="space-item sp-d reveal reveal-d1"><img src="/static/img/interior-04.jpg" alt="고수치과 대기 공간" loading="lazy"><figcaption class="cap">Waiting</figcaption></figure>
      <figure class="space-item sp-e reveal reveal-d2"><img src="/static/img/interior-09.jpg" alt="고수치과 복도" loading="lazy"><figcaption class="cap">Hall</figcaption></figure>
    </div>
    <p style="text-align:center;margin-top:40px" class="reveal"><a href="/tour" class="treat-more" style="font-size:16px">공간 전체 둘러보기 <i class="fas fa-arrow-right"></i></a></p>
  </div>
</section>

<!-- 장비 -->
<section class="section" id="equipment-section">
  <div class="section-inner">
    <p class="eyebrow reveal">Technology</p>
    <h2 class="h-display reveal reveal-d1">환자의 불편을 줄이는<br><em>디지털 장비</em></h2>
    <p class="lead reveal reveal-d2">비싼 장비를 위한 장비가 아니라, 새로운 기술이 실제로 환자분의 불편을 줄이고 더 좋은 결과를 만드는지 고민해서 선택했습니다.</p>
    <div class="treat-sub-grid" style="grid-template-columns:repeat(3,1fr);margin-top:50px">
      ${EQUIPMENT.map((e, i) => html`
      <div class="treat-sub reveal reveal-d${(i % 3) + 1}">
        <h4>${e.name}</h4>
        <p>${e.desc}</p>
      </div>`)}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="section" id="cta-section" style="padding-top:0">
  <div class="section-inner">
    <div class="cta-band reveal">
      <h2>치과가 두려우셨나요?<br>그 마음부터 듣겠습니다.</h2>
      <p>${SITE.addressShort} · ${SITE.openDate}</p>
      <a href="/reservation" class="hero-btn primary">상담 예약하기</a>
    </div>
  </div>
</section>`

  return Layout(
    {
      title: '고수치과의원 | 내포신도시 임플란트·치아교정·심미보철 치과',
      description:
        '내포신도시 주키즈소아청소년과 건물 5층, 고수치과의원. 치과 치료의 두려움을 신뢰로 바꾸는 치과 — 임플란트·교정과 전문의 치아교정·라미네이트 심미보철 올인원 진료. 2026년 11월 개원.',
      path: '/',
    },
    content
  )
}
