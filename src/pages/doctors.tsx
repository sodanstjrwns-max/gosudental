import { html } from 'hono/html'
import { Layout, breadcrumbSchema } from '../layout'
import { PHOTOS, CHO_PORTRAITS, CHO_LIFE } from '../data/photos'
import { photoFigure, photoGallery } from '../photo-gallery'
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
    ${photoFigure(PHOTOS[2], 'team', 'team-portrait')}
    <div class="doctor-grid">
      ${DOCTORS.map((d, i) => html`
      <a href="/doctors/${d.slug}" class="doctor-card reveal reveal-d${i + 1}">
        <div class="doctor-photo">
          <span class="badge">${d.role}</span>
          ${d.photo ? html`<img src="${d.photo}" alt="${d.name} ${d.role} 프로필 사진" width="800" height="1200" loading="lazy">` : html`<i class="fas fa-user-doctor" aria-hidden="true"></i>`}
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
</section>
<section class="section photo-story-band" id="doctors-story-preview">
  <div class="section-inner">
    <p class="eyebrow">Beyond the White Coat</p>
    <h2 class="h-display">진료실 밖에서 만나는 <em>조원익 원장</em></h2>
    <p class="lead">화이트 코트와 진료복, 그리고 농구 유니폼. 사진으로 만나는 대표원장의 또 다른 모습입니다.</p>
    ${photoGallery([PHOTOS[15], PHOTOS[13], PHOTOS[3]], 'team-story')}
    <a href="/doctors/cho-wonik#doctor-life" class="treat-more">조원익 원장의 사진 이야기 전체 보기 <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
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
    image: d.photo ? `${SITE.domain}${d.photo}` : undefined,
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
        ${d.photo ? html`<img src="${d.photo}" alt="${d.name} ${d.role} 프로필 사진" width="800" height="1200" fetchpriority="high">` : html`<i class="fas fa-user-doctor" aria-hidden="true" style="font-size:110px"></i>`}
      </div>
    </div>
  </div>
</section>

${slug === 'cho-wonik' ? html`
<section class="section" id="doctor-portraits">
  <div class="section-inner">
    <p class="eyebrow">Portraits of Wonik</p>
    <h2 class="h-display">사진으로 만나는 <em>조원익 원장</em></h2>
    <p class="lead">한 장의 프로필 너머, 조원익 원장의 여러 모습을 담았습니다. 사진을 누르면 전체 화면으로 볼 수 있습니다.</p>
    ${photoGallery(CHO_PORTRAITS, 'cho-portraits', 'portrait-gallery')}
  </div>
</section>` : ''}

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

${slug === 'cho-wonik' ? html`
<section class="section photo-story-band" id="doctor-life">
  <div class="section-inner">
    <p class="eyebrow">Off the Clock</p>
    <h2 class="h-display">진료실 밖의 <em>조원익</em></h2>
    <p class="lead">농구 코트에서, 경기가 끝난 뒤, 운동을 기록하는 순간에. 대표원장의 일상을 사진으로 소개합니다.</p>
    ${photoGallery(CHO_LIFE, 'cho-life', 'life-gallery')}
    <p class="photo-context-note">개인 취미·스포츠 활동 사진입니다. 농구 트로피 등은 의료 분야의 수상 경력과 무관합니다.</p>
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
      ogImage: d.photo ? `${SITE.domain}${d.photo}` : undefined,
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
