import { html, raw } from 'hono/html'
import { Layout, breadcrumbSchema, faqSchema } from '../layout'
import { SITE, TREATMENTS, DOCTORS, TERMS } from '../data/site'

export function treatmentsListPage() {
  const core = TREATMENTS.filter((t) => t.core)
  const others = TREATMENTS.filter((t) => !t.core)
  const coreImgs: Record<string, string> = {
    implant: '/static/img/interior-03.jpg',
    ortho: '/static/img/interior-07.jpg',
    aesthetic: '/static/img/interior-01.jpg',
  }

  const content = html`
<section class="page-hero dark" id="treatments-hero">
  <div class="section-inner">
    <nav class="breadcrumb"><a href="/">홈</a> / <span>진료안내</span></nav>
    <p class="eyebrow" style="color:var(--brand-accent)">Treatments</p>
    <h1 class="h-display">한 사람의 고민을 해결하는<br><em style="color:var(--brand-soft)">올인원 진료</em></h1>
    <p class="lead">많은 치료를 권한다는 의미가 아닙니다. 필요한 여러 선택지를 한곳에서 충분히 비교하고, 그중 꼭 필요한 치료를 선택할 수 있게 해드린다는 의미입니다.</p>
  </div>
</section>

<section class="section" id="treatments-core-section">
  <div class="section-inner">
    <p class="eyebrow reveal">Signature</p>
    <h2 class="h-display reveal reveal-d1">핵심 진료</h2>
    <div class="treat-grid">
      ${core.map((t, i) => html`
      <a href="/treatments/${t.slug}" class="treat-card reveal reveal-d${i + 1}">
        <div class="treat-card-img"><img src="${coreImgs[t.slug]}" alt="${t.name}" loading="lazy"></div>
        <div class="treat-card-body">
          <span class="treat-tag">Signature</span>
          <h3>${t.name}</h3>
          <p>${t.short}</p>
          <span class="treat-more">자세히 보기 <i class="fas fa-arrow-right"></i></span>
        </div>
      </a>`)}
    </div>
    <p class="eyebrow reveal" style="margin-top:80px">All Treatments</p>
    <h2 class="h-display reveal reveal-d1">전체 진료</h2>
    <div class="treat-sub-grid">
      ${others.map((t) => html`
      <a href="/treatments/${t.slug}" class="treat-sub reveal">
        <h4>${t.name}</h4>
        <p>${t.short}</p>
      </a>`)}
    </div>
  </div>
</section>`

  return Layout(
    {
      title: '진료안내 — 임플란트·치아교정·심미보철 | 고수치과의원',
      description:
        '고수치과 진료안내. 임플란트, 교정과 전문의 치아교정, 라미네이트 심미보철을 핵심으로 충치·신경치료, 보철, 턱관절, 안티에이징까지 내포 유일의 올인원 진료.',
      path: '/treatments',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '진료안내', path: '/treatments' }])],
    },
    content
  )
}

// 백과사전 용어 자동 인링크
function autoLink(text: string): string {
  let out = text
  const done = new Set<string>()
  for (const term of TERMS) {
    if (done.size >= 6) break
    if (out.includes(term.name) && !done.has(term.name) && term.name.length >= 3) {
      out = out.replace(term.name, `<a href="/encyclopedia/${term.slug}">${term.name}</a>`)
      done.add(term.name)
    }
  }
  return out
}

export function treatmentDetailPage(slug: string, relatedCases: any[]) {
  const t = TREATMENTS.find((x) => x.slug === slug)
  if (!t) return null
  const docs = DOCTORS.filter((d) => t.doctorSlugs.includes(d.slug))
  const relTerms = TERMS.filter((term) => t.relatedTerms.includes(term.name)).slice(0, 8)

  const procSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: t.name,
    description: t.short,
    howPerformed: t.sections[0]?.body.slice(0, 200),
    procedureType: 'https://schema.org/NoninvasiveProcedure',
    provider: { '@type': 'Dentist', name: SITE.name },
  }
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${t.name} — ${SITE.name}`,
    url: `${SITE.domain}/treatments/${t.slug}`,
    reviewedBy: docs.map((d) => ({ '@type': 'Person', name: `${d.name} 원장` })),
    lastReviewed: '2026-08-31',
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.lead'] },
  }

  const heroImgs: Record<string, string> = {
    implant: '/static/img/interior-03.jpg',
    ortho: '/static/img/interior-07.jpg',
    aesthetic: '/static/img/interior-01.jpg',
    preservation: '/static/img/interior-02.jpg',
    prosthetics: '/static/img/interior-04.jpg',
    tmj: '/static/img/interior-09.jpg',
    antiaging: '/static/img/interior-17.jpg',
  }

  const content = html`
<section class="hero" id="treatment-hero" style="min-height:72svh">
  <div class="hero-bg" style="background-image:url('${heroImgs[t.slug] || '/static/img/interior-lobby.jpg'}')"></div>
  <div class="hero-veil"></div>
  <div class="hero-inner" style="padding-top:150px;padding-bottom:80px">
    <nav class="breadcrumb" style="color:rgba(255,255,255,0.6)"><a href="/">홈</a> / <a href="/treatments">진료안내</a> / <span>${t.name}</span></nav>
    <p class="hero-eyebrow">${t.core ? 'Signature Treatment' : 'Treatment'}</p>
    <h1 class="hero-title" style="font-size:clamp(32px,5vw,64px)">
      <span class="line"><span>${t.name}</span></span>
    </h1>
    <p class="hero-sub">${t.heroCopy}</p>
  </div>
</section>

<section class="section" id="treatment-content-section">
  <div class="section-narrow prose">
    ${t.sections.map((s, i) => html`
    <div class="reveal" id="section-${i}">
      <h2>${s.h}</h2>
      <p>${raw(autoLink(s.body).replace(/\n/g, '<br>'))}</p>
    </div>`)}
  </div>
</section>

<section class="section" id="treatment-doctors-section" style="background:var(--brand-mist)">
  <div class="section-inner">
    <p class="eyebrow reveal">Medical Team</p>
    <h2 class="h-display reveal reveal-d1">${t.name} <em>담당 의료진</em></h2>
    <div class="doctor-grid" style="grid-template-columns:repeat(${Math.min(docs.length, 3)},1fr);max-width:${docs.length * 380}px">
      ${docs.map((d, i) => html`
      <a href="/doctors/${d.slug}" class="doctor-card reveal reveal-d${i + 1}">
        <div class="doctor-photo" style="aspect-ratio:16/9">
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

${relatedCases.length > 0 ? html`
<section class="section" id="treatment-cases-section">
  <div class="section-inner">
    <p class="eyebrow reveal">Before &amp; After</p>
    <h2 class="h-display reveal reveal-d1">${t.name} <em>치료 케이스</em></h2>
    <div class="case-grid">
      ${relatedCases.map((cs) => html`
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
    <p style="margin-top:32px" class="reveal"><a href="/cases" class="treat-more">전체 케이스 보기 <i class="fas fa-arrow-right"></i></a></p>
  </div>
</section>` : ''}

<section class="section" id="treatment-faq-section" ${relatedCases.length === 0 ? '' : raw('style="background:#fff"')}>
  <div class="section-narrow">
    <p class="eyebrow reveal">FAQ</p>
    <h2 class="h-display reveal reveal-d1">${t.name},<br>이런 점이 <em>궁금하셨나요?</em></h2>
    <div class="faq-list reveal reveal-d2">
      ${t.faqs.map((f) => html`
      <details class="faq-item">
        <summary>${f.q}</summary>
        <div class="faq-a">${f.a}</div>
      </details>`)}
    </div>
  </div>
</section>

${relTerms.length ? html`
<section class="section" id="treatment-terms-section" style="padding-top:0">
  <div class="section-narrow">
    <p class="eyebrow reveal">Encyclopedia</p>
    <h2 class="h-display reveal reveal-d1" style="font-size:clamp(24px,3vw,36px)">관련 <em>치과 용어</em></h2>
    <div class="pill-row reveal reveal-d2">
      ${relTerms.map((term) => html`<a class="pill" href="/encyclopedia/${term.slug}">${term.name}</a>`)}
    </div>
  </div>
</section>` : ''}

<section class="section" style="padding-top:20px" id="treatment-cta">
  <div class="section-inner">
    <div class="cta-band reveal">
      <h2>${t.name} 상담이<br>필요하신가요?</h2>
      <p>불필요한 치료를 권하지 않습니다. 정확한 진단과 충분한 설명부터 시작합니다.</p>
      <a href="/reservation" class="hero-btn primary">상담 예약하기</a>
    </div>
  </div>
</section>`

  return Layout(
    {
      title: `${t.name} — 내포 ${t.name} | 고수치과의원`,
      description: `${t.heroCopy.slice(0, 140)}`,
      path: `/treatments/${t.slug}`,
      schema: [
        procSchema,
        webPageSchema,
        faqSchema(t.faqs),
        breadcrumbSchema([
          { name: '홈', path: '/' },
          { name: '진료안내', path: '/treatments' },
          { name: t.name, path: `/treatments/${t.slug}` },
        ]),
      ],
    },
    content
  )
}
