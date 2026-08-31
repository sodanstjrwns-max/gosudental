import { html } from 'hono/html'
import { Layout, breadcrumbSchema, faqSchema } from '../layout'
import { SITE, AREAS, TREATMENTS, DOCTORS } from '../data/site'

export function areaPage(slug: string) {
  const area = AREAS.find((a) => a.slug === slug)
  if (!area) return null
  const t = TREATMENTS.find((x) => x.slug === area.treatmentSlug)!
  const docs = DOCTORS.filter((d) => t.doctorSlugs.includes(d.slug))
  const localFaqs = [
    {
      q: `${area.region}에서 ${area.treatment} 잘하는 치과는 어디인가요?`,
      a: `${area.region}에서 ${area.treatment} 치과를 찾으신다면 의료진의 경력·연수 이력, 진단 장비, 치료 계획 설명의 충실함을 확인해 보세요. 고수치과는 ${t.doctorSlugs.includes('kim-kyunghwan') ? '보건복지부 인증 치과교정과 전문의가 상주하며' : '관련 연수 과정을 다수 이수한 의료진이'} 정밀 진단과 충분한 설명을 원칙으로 진료합니다.`,
    },
    {
      q: `${area.region}에서 고수치과까지 얼마나 걸리나요?`,
      a: `고수치과는 내포신도시 중심(주키즈소아청소년과 건물 5층, 중흥S클래스더시티 앞)에 위치해 ${area.region} 어디서든 접근이 편리합니다. 건물 내 여유로운 주차공간을 이용하실 수 있습니다.`,
    },
    {
      q: `${area.treatment} 상담만 받아도 되나요?`,
      a: `물론입니다. 고수치과는 불필요한 치료를 권하지 않는 것을 원칙으로 하며, 정확한 진단과 설명을 들으신 뒤 충분히 비교하고 결정하실 수 있습니다.`,
    },
  ]

  const content = html`
<section class="page-hero dark" id="area-hero">
  <div class="section-inner">
    <nav class="breadcrumb"><a href="/">홈</a> / <a href="/treatments/${t.slug}">${t.name}</a> / <span>${area.region} ${area.treatment}</span></nav>
    <p class="eyebrow" style="color:var(--brand-accent)">${area.region} · ${area.treatment}</p>
    <h1 class="h-display">${area.region} ${area.treatment},<br><em style="color:var(--brand-soft)">고수치과</em>가 함께합니다</h1>
    <p class="lead">${area.region}에서 ${area.treatment}를 고민하고 계신가요? 굳이 멀리 가지 않아도, 내포신도시 안에서 충분히 믿고 치료받을 수 있도록 — 고수치과가 준비했습니다.</p>
  </div>
</section>

<section class="section" id="area-content-section">
  <div class="section-narrow prose">
    <h2>${area.region}에서 ${area.treatment}를 고민하신다면</h2>
    <p>${t.heroCopy}</p>
    <p>고수치과는 ${SITE.addressShort}에 위치해 ${area.region}을 비롯한 내포·예산·홍성 생활권 어디에서든 방문하기 편리합니다. ${area.region}에서 오시는 길은 <a href="/directions">오시는 길 안내</a>에서 확인하실 수 있습니다.</p>
    <h2>고수치과 ${area.treatment}의 원칙</h2>
    <p>${t.sections[1]?.body?.split('\n')[0] || t.short}</p>
    <p><a href="/treatments/${t.slug}">→ ${t.name} 진료 자세히 보기</a></p>
  </div>
</section>

<section class="section" style="background:var(--brand-mist);padding-top:60px;padding-bottom:60px" id="area-doctors">
  <div class="section-inner">
    <h2 style="font-size:24px;font-weight:800;color:var(--brand-dark);margin-bottom:24px">${area.treatment} 담당 의료진</h2>
    <div class="treat-sub-grid" style="grid-template-columns:repeat(${Math.min(docs.length, 3)},1fr)">
      ${docs.map((d) => html`
      <a href="/doctors/${d.slug}" class="treat-sub" style="background:#fff">
        <h4>${d.name} 원장 · ${d.role}</h4>
        <p>"${d.tagline}"</p>
      </a>`)}
    </div>
  </div>
</section>

<section class="section" id="area-faq">
  <div class="section-narrow">
    <h2 style="font-size:24px;font-weight:800;color:var(--brand-dark)">${area.region} ${area.treatment} 자주 묻는 질문</h2>
    <div class="faq-list">
      ${localFaqs.map((f) => html`
      <details class="faq-item">
        <summary>${f.q}</summary>
        <div class="faq-a">${f.a}</div>
      </details>`)}
    </div>
    <div class="cta-band" style="margin-top:60px">
      <h2>${area.region}에서 오시는<br>${area.treatment} 상담</h2>
      <p>정확한 진단과 충분한 설명부터 시작합니다.</p>
      <a href="/reservation" class="hero-btn primary">상담 예약하기</a>
    </div>
  </div>
</section>`

  const citySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${area.region} ${area.treatment} — ${SITE.name}`,
    about: { '@type': 'City', name: area.region },
    url: `${SITE.domain}/area/${area.slug}`,
  }

  return Layout(
    {
      title: `${area.region} ${area.treatment} — ${area.region} 치과 추천 | 고수치과의원`,
      description: `${area.region} ${area.treatment} 치과를 찾으신다면 — 내포신도시 고수치과. ${t.short}. 주키즈소아과 건물 5층, 주차 가능.`,
      path: `/area/${area.slug}`,
      schema: [
        citySchema,
        faqSchema(localFaqs),
        breadcrumbSchema([
          { name: '홈', path: '/' },
          { name: t.name, path: `/treatments/${t.slug}` },
          { name: `${area.region} ${area.treatment}`, path: `/area/${area.slug}` },
        ]),
      ],
    },
    content
  )
}
