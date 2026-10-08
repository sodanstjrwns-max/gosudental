import { html, raw } from 'hono/html'
import { Layout, breadcrumbSchema, faqSchema } from '../layout'
import { SITE, AREAS, TREATMENTS, DOCTORS } from '../data/site'
import { AREA_ENTRIES, AREA_REGION_LOCAL } from '../data/area-local'

// 확장 원고 본문(\n\n 블록, '- ' 목록)을 앞부분만 간단히 렌더 (지역 페이지용 발췌)
function renderExcerpt(body: string, minChars = 520): string {
  const blocks = body.replace(/\r/g, '').split(/\n\s*\n/)
  const out: string[] = []
  let n = 0
  for (const blk of blocks) {
    const lines = blk.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) continue
    if (lines.every((l) => /^- /.test(l))) out.push(`<ul>${lines.map((l) => `<li>${l.slice(2)}</li>`).join('')}</ul>`)
    else if (lines.every((l) => /^\d+\. /.test(l))) out.push(`<ol>${lines.map((l) => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('')}</ol>`)
    else out.push(`<p>${lines.join(' ')}</p>`)
    n += lines.join(' ').length
    if (n >= minChars) break
  }
  return out.join('')
}

export function areaPage(slug: string) {
  const area = AREAS.find((a) => a.slug === slug)
  if (!area) return null
  const t = TREATMENTS.find((x) => x.slug === area.treatmentSlug)!
  const entry = AREA_ENTRIES[area.slug]
  const regionSlug = area.slug.slice(0, area.slug.length - area.treatmentSlug.length - 1)
  const local = AREA_REGION_LOCAL[regionSlug]
  if (!entry || !local) return null
  const docs = DOCTORS.filter((d) => t.doctorSlugs.includes(d.slug))
  // 지역×진료마다 다른 질문 세트 (src/data/area-local.ts). 화면 FAQ 와 FAQPage 스키마가 같은 배열을 쓴다.
  const localFaqs = entry.faqs
  const focus = t.sections.find((s) => s.h === entry.focus)

  const secContext = html`
    <h2>${entry.h}</h2>
    <p>${entry.body}</p>`
  const secAccess = html`
    <h2>${local.access.h}</h2>
    <p>${local.access.body}</p>
    <p><a href="/directions">→ 오시는 길 · 진료시간 안내</a></p>`
  const secFocus = focus ? html`
    <h2>${focus.h}</h2>
    ${raw(renderExcerpt(focus.body))}
    <p><a href="/treatments/${t.slug}">→ ${t.name} 진료 전체 내용 보기</a></p>` : ''
  const order = [
    [secContext, secAccess, secFocus],
    [secAccess, secContext, secFocus],
    [secContext, secFocus, secAccess],
  ][local.variant]

  const content = html`
<section class="page-hero dark" id="area-hero">
  <div class="section-inner">
    <nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <a href="/treatments/${t.slug}">${t.name}</a> / <span>${area.region} ${area.treatment}</span></nav>
    <p class="eyebrow" style="color:var(--brand-accent)">${area.region} · ${area.treatment}</p>
    <h1 class="h-display">${area.region} ${area.treatment}, <br><em style="color:var(--brand-soft)">고수치과</em>가 함께합니다</h1>
    <p class="lead">${entry.lead}</p>
  </div>
</section>

<section class="section" id="area-content-section">
  <div class="section-narrow prose">
    <div class="alert info" id="quick-answer"><strong>핵심 답변</strong> — ${entry.answer}</div>
    ${order}
    <p style="font-size:14px;color:var(--ink-soft)">치료 방법·기간·결과에는 개인차가 있으며, 정밀 진단 후 개별적으로 안내드립니다.</p>
  </div>
</section>

<section class="section" style="background:var(--brand-mist);padding-top:60px;padding-bottom:60px" id="area-doctors">
  <div class="section-inner">
    <h2 style="font-size:24px;font-weight:800;color:var(--brand-dark);margin-bottom:24px">${area.treatment} 담당 의료진</h2>
    <div class="treat-sub-grid" style="grid-template-columns:repeat(${Math.min(docs.length, 3)},1fr)">
      ${docs.map((d) => html`
      <a href="/doctors/${d.slug}" class="treat-sub" style="background:#fff">
        <h3>${d.name} 원장 · ${d.role}</h3>
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
    <div id="area-related-links" style="margin-top:48px">
      <h3 style="font-size:18px;font-weight:800;color:var(--brand-dark);margin-bottom:12px">함께 보면 좋은 안내</h3>
      <div class="pill-row">
        ${area.region === '내포' || area.region === '내포신도시' ? html`<a class="pill" href="/area/naepo">내포 치과 안내</a>` : ''}
        ${entry.links.map((l) => html`<a class="pill" href="${l.href}">${l.label}</a>`)}
      </div>
      <h3 style="font-size:18px;font-weight:800;color:var(--brand-dark);margin:24px 0 12px">다른 지역 ${area.treatment} 안내</h3>
      <div class="pill-row">
        ${AREAS.filter((a) => a.treatmentSlug === area.treatmentSlug && a.slug !== area.slug).map((a) => html`<a class="pill" href="/area/${a.slug}">${a.region} ${a.treatment}</a>`)}
      </div>
      <h3 style="font-size:18px;font-weight:800;color:var(--brand-dark);margin:24px 0 12px">${area.region} 다른 진료 안내</h3>
      <div class="pill-row">
        ${AREAS.filter((a) => a.region === area.region && a.slug !== area.slug).map((a) => html`<a class="pill" href="/area/${a.slug}">${a.region} ${a.treatment}</a>`)}
      </div>
    </div>
    <div class="cta-band" style="margin-top:60px">
      <h2>${area.region}에서 오시는 <br>${area.treatment} 상담</h2>
      <p>정확한 진단과 충분한 설명부터 시작합니다.</p>
      <a href="/reservation" class="hero-btn primary">상담 예약하기</a>
    </div>
  </div>
</section>`

  const citySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${area.region} ${area.treatment} — ${SITE.name}`,
    about: { '@type': 'Place', name: area.region },
    url: `${SITE.domain}/area/${area.slug}`,
  }

  return Layout(
    {
      title: `${area.region} ${area.treatment} 진료·방문 안내 | 고수치과의원`,
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
