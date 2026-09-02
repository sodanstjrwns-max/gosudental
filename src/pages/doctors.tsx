import { html } from 'hono/html'
import { Layout, breadcrumbSchema } from '../layout'
import { SITE, DOCTORS, TREATMENTS } from '../data/site'

export function doctorsListPage() {
  const content = html`
<section class="page-hero dark" id="doctors-hero">
  <div class="section-inner">
    <nav class="breadcrumb" aria-label="브레드크럼"><a href="/">홈</a> / <span>의료진</span></nav>
    <p class="eyebrow" style="color:var(--brand-accent)">Medical Team</p>
    <h1 class="h-display">배움을 멈추지 않는 <br><em style="color:var(--brand-soft)">고수치과 의료진</em></h1>
    <p class="lead">앞으로도 고수치과에서 가장 많이 배우고, 가장 많이 고민하는 사람은 의료진이고 싶습니다. 배운 것은 다시 환자분의 더 좋은 결과로 돌려드리겠습니다.</p>
  </div>
</section>

<section class="section" id="doctors-list-section">
  <div class="section-inner">
    <div class="doctor-grid" style="margin-top:0">
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
          <span class="treat-more" style="margin-top:16px">프로필 보기 <i class="fas fa-arrow-right"></i></span>
        </div>
      </a>`)}
    </div>
  </div>
</section>`

  return Layout(
    {
      title: '의료진 소개 | 고수치과의원 — 내포신도시 치과',
      description:
        '고수치과 의료진을 소개합니다. 대표원장 조원익, 치과교정과 전문의 김경환, 이민우 원장 — 3인 협진 체계로 임플란트·교정·심미보철 올인원 진료를 제공합니다.',
      path: '/doctors',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '의료진', path: '/doctors' }])],
    },
    content
  )
}

export function doctorDetailPage(slug: string, cases: any[]) {
  const d = DOCTORS.find((x) => x.slug === slug)
  if (!d) return null
  const specs = TREATMENTS.filter((t) => d.specialties.includes(t.slug))

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${d.name} 원장`,
    jobTitle: d.role,
    worksFor: { '@type': 'Dentist', name: SITE.name },
    description: d.tagline,
    url: `${SITE.domain}/doctors/${d.slug}`,
    alumniOf: d.career[0],
  }

  const content = html`
<section class="page-hero" id="doctor-hero">
  <div class="section-inner">
    <nav class="breadcrumb" aria-label="브레드크럼"><a href="/">홈</a> / <a href="/doctors">의료진</a> / <span>${d.name} 원장</span></nav>
    <div class="grid-2">
      <div>
        <p class="eyebrow">${d.role}</p>
        <h1 class="h-display">${d.name} <em>원장</em></h1>
        <p class="lead" style="font-size:20px;font-weight:600;color:var(--brand-dark)">"${d.tagline}"</p>
        <p class="lead" style="margin-top:18px">${d.intro}</p>
        <div class="pill-row" style="margin-top:26px">
          ${specs.map((t) => html`<a class="pill" href="/treatments/${t.slug}">${t.name}</a>`)}
        </div>
      </div>
      <div class="doctor-photo" style="border-radius:24px;aspect-ratio:4/4.6">
        <i class="fas fa-user-doctor" aria-hidden="true" style="font-size:110px"></i>
      </div>
    </div>
  </div>
</section>

<section class="section" id="doctor-career-section" style="padding-top:60px">
  <div class="section-inner">
    <div class="career-cols">
      <div class="career-block reveal">
        <h3>Career &amp; Membership</h3>
        <ul>${d.career.map((c) => html`<li>${c}</li>`)}</ul>
      </div>
      <div class="career-block reveal reveal-d1">
        <h3>Education &amp; Courses</h3>
        <ul>${d.courses.map((c) => html`<li>${c}</li>`)}</ul>
      </div>
    </div>
  </div>
</section>

<section class="section" id="doctor-treatments-section" style="background:var(--brand-mist)">
  <div class="section-inner">
    <p class="eyebrow reveal">Specialties</p>
    <h2 class="h-display reveal reveal-d1">${d.name} 원장의 <em>진료 분야</em></h2>
    <div class="treat-sub-grid" style="grid-template-columns:repeat(${Math.min(specs.length, 4)},1fr)">
      ${specs.map((t, i) => html`
      <a href="/treatments/${t.slug}" class="treat-sub reveal reveal-d${i + 1}" style="background:#fff">
        <h4>${t.name}</h4>
        <p>${t.short}</p>
      </a>`)}
    </div>
  </div>
</section>

${cases.length > 0 ? html`
<section class="section" id="doctor-cases-section">
  <div class="section-inner">
    <p class="eyebrow reveal">Cases</p>
    <h2 class="h-display reveal reveal-d1">${d.name} 원장의 <em>치료 케이스</em></h2>
    <div class="case-grid">
      ${cases.map((cs) => html`
      <a href="/cases/${cs.id}" class="case-card reveal">
        <div class="case-thumb">
          ${cs.photo_before ? html`<img src="/api/case-image/${cs.id}/photo_before" alt="${cs.title} 치료 전" loading="lazy">` : html`<div style="display:flex;align-items:center;justify-content:center;height:100%"><i class="fas fa-tooth" style="font-size:36px;color:var(--brand-soft)"></i></div>`}
        </div>
        <div class="case-body">
          <div class="case-meta"><span>${cs.category}</span>${cs.age_group ? html`<span>${cs.age_group}</span>` : ''}</div>
          <h3>${cs.title}</h3>
        </div>
      </a>`)}
    </div>
  </div>
</section>` : ''}

<section class="section" style="padding-top:0" id="doctor-cta">
  <div class="section-inner">
    <div class="cta-band reveal">
      <h2>${d.name} 원장에게 <br>상담받고 싶으시다면</h2>
      <p>상담 예약 시 희망 의료진을 남겨주세요.</p>
      <a href="/reservation" class="hero-btn primary">상담 예약하기</a>
    </div>
  </div>
</section>`

  return Layout(
    {
      title: `${d.name} 원장 — ${d.role} | 고수치과의원`,
      description: `고수치과 ${d.name} ${d.role}. ${d.tagline}. ${d.career.slice(0, 3).join(', ')}.`,
      path: `/doctors/${d.slug}`,
      schema: [
        personSchema,
        breadcrumbSchema([
          { name: '홈', path: '/' },
          { name: '의료진', path: '/doctors' },
          { name: `${d.name} 원장`, path: `/doctors/${d.slug}` },
        ]),
      ],
    },
    content
  )
}
