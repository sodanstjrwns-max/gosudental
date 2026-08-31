import { html } from 'hono/html'
import { Layout, breadcrumbSchema } from '../layout'
import { TREATMENTS, DOCTORS } from '../data/site'

const CASE_CATEGORIES = ['임플란트', '치아교정', '심미보철', '충치·신경치료', '보철치료', '턱관절', '기타']

export function casesListPage(cases: any[], loggedIn: boolean) {
  const content = html`
<section class="page-hero" id="cases-hero">
  <div class="section-inner">
    <nav class="breadcrumb"><a href="/">홈</a> / <span>비포 &amp; 애프터</span></nav>
    <p class="eyebrow">Before &amp; After</p>
    <h1 class="h-display">나와 비슷한 고민의<br><em>치료 이야기</em></h1>
    <p class="lead">비슷한 고민을 가진 분들의 치료 과정을 고민별로 모았습니다. 치료 결과는 개인에 따라 차이가 있을 수 있으며, 치료 후 사진은 의료법에 따라 로그인 후 열람하실 수 있습니다.</p>
    ${!loggedIn ? html`<div class="alert info" style="max-width:560px;margin-top:24px"><i class="fas fa-lock" style="margin-right:8px"></i>치료 후(After) 사진은 <a href="/auth/login" style="font-weight:700;text-decoration:underline">로그인</a> 후 확인하실 수 있습니다.</div>` : ''}
  </div>
</section>

<section class="section" id="cases-list-section" style="padding-top:40px">
  <div class="section-inner">
    <div class="case-filter" role="tablist">
      <button class="active" data-cat="all">전체</button>
      ${CASE_CATEGORIES.map((c) => html`<button data-cat="${c}">${c}</button>`)}
    </div>
    ${cases.length === 0
      ? html`<div class="empty-state">
          <i class="fas fa-images"></i>
          <p style="font-size:17px;font-weight:600;color:var(--ink-soft)">치료 케이스를 준비하고 있습니다</p>
          <p style="margin-top:8px">2026년 11월 개원 이후, 환자분들의 동의를 받은 치료 케이스가 하나씩 채워질 예정입니다.</p>
        </div>`
      : html`<div class="case-grid">
        ${cases.map((cs) => html`
        <a href="/cases/${cs.id}" class="case-card" data-cat="${cs.category}">
          <div class="case-thumb">
            ${cs.photo_before
              ? html`<img src="/api/case-image/${cs.id}/photo_before" alt="${cs.title} 치료 전 사진" loading="lazy">`
              : html`<div style="display:flex;align-items:center;justify-content:center;height:100%"><i class="fas fa-tooth" style="font-size:36px;color:var(--brand-soft)"></i></div>`}
          </div>
          <div class="case-body">
            <div class="case-meta">
              <span>${cs.category}</span>
              ${cs.age_group ? html`<span>${cs.age_group}</span>` : ''}
              ${cs.gender ? html`<span>${cs.gender}</span>` : ''}
            </div>
            <h3>${cs.title}</h3>
            <p>${cs.region || ''} ${cs.duration ? '· 치료기간 ' + cs.duration : ''}</p>
          </div>
        </a>`)}
      </div>`}
  </div>
</section>`

  return Layout(
    {
      title: '비포 & 애프터 — 치료 케이스 | 고수치과의원',
      description:
        '고수치과의 실제 치료 케이스를 고민별로 모았습니다. 임플란트·치아교정·심미보철 치료 전후 비교. 치료 결과는 개인에 따라 차이가 있을 수 있습니다.',
      path: '/cases',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '비포 & 애프터', path: '/cases' }])],
    },
    content
  )
}

export function caseDetailPage(cs: any, loggedIn: boolean) {
  const doctor = DOCTORS.find((d) => d.slug === cs.doctor_slug)
  const treatment = TREATMENTS.find((t) => t.name === cs.category || cs.category?.includes(t.name.slice(0, 2)))

  const pairs: { label: string; before: string | null; after: string | null }[] = [
    { label: '파노라마', before: cs.pano_before, after: cs.pano_after },
    { label: '구내포토', before: cs.photo_before, after: cs.photo_after },
  ].filter((p) => p.before || p.after)

  const content = html`
<section class="page-hero" id="case-hero" style="padding-bottom:50px">
  <div class="section-inner">
    <nav class="breadcrumb"><a href="/">홈</a> / <a href="/cases">비포 &amp; 애프터</a> / <span>${cs.title}</span></nav>
    <div class="case-meta" style="margin-bottom:14px">
      <span>${cs.category}</span>
      ${cs.age_group ? html`<span>${cs.age_group}</span>` : ''}
      ${cs.gender ? html`<span>${cs.gender}</span>` : ''}
      ${cs.duration ? html`<span>치료기간 ${cs.duration}</span>` : ''}
      ${cs.region ? html`<span><i class="fas fa-location-dot" style="margin-right:4px"></i>${cs.region}</span>` : ''}
    </div>
    <h1 class="h-display" style="font-size:clamp(26px,3.6vw,44px)">${cs.title}</h1>
  </div>
</section>

<section class="section" id="case-detail-section" style="padding-top:20px">
  <div class="section-narrow">
    ${pairs.map((p) => html`
    <div style="margin-bottom:44px">
      <h2 style="font-size:20px;font-weight:800;color:var(--brand-dark);margin-bottom:16px">${p.label} 전후 비교</h2>
      ${p.before && p.after && loggedIn
        ? html`
        <div class="ba-slider">
          <img src="/api/case-image/${cs.id}/${p.label === '파노라마' ? 'pano' : 'photo'}_before" alt="${cs.title} ${p.label} 치료 전">
          <img class="ba-after" src="/api/case-image/${cs.id}/${p.label === '파노라마' ? 'pano' : 'photo'}_after" alt="${cs.title} ${p.label} 치료 후">
          <span class="ba-tag before">Before</span>
          <span class="ba-tag after">After</span>
          <div class="ba-handle"></div>
        </div>
        <p style="font-size:13px;color:var(--ink-mute);margin-top:10px;text-align:center"><i class="fas fa-arrows-left-right" style="margin-right:6px"></i>슬라이더를 좌우로 움직여 비교해 보세요</p>`
        : html`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="case-thumb" style="border-radius:14px;position:relative">
            ${p.before ? html`<img src="/api/case-image/${cs.id}/${p.label === '파노라마' ? 'pano' : 'photo'}_before" alt="${cs.title} ${p.label} 치료 전">` : ''}
            <span class="ba-tag before" style="top:12px">Before</span>
          </div>
          <div class="case-thumb" style="border-radius:14px;position:relative">
            ${p.after
              ? loggedIn
                ? html`<img src="/api/case-image/${cs.id}/${p.label === '파노라마' ? 'pano' : 'photo'}_after" alt="${cs.title} ${p.label} 치료 후">`
                : html`<div class="lock-overlay"><i class="fas fa-lock"></i><span>치료 후 사진은 로그인 후<br>열람 가능합니다</span><a href="/auth/login" class="btn-brand" style="margin-top:8px;font-size:13px;padding:8px 18px">로그인</a></div>`
              : ''}
            <span class="ba-tag after" style="top:12px">After</span>
          </div>
        </div>`}
    </div>`)}

    ${cs.description ? html`
    <div class="prose" style="margin-top:20px">
      <h2>치료 이야기</h2>
      <p>${cs.description}</p>
    </div>` : ''}

    <div class="alert warn" style="margin-top:36px">
      본 치료 사례는 이해를 돕기 위한 것으로, 치료 방법과 결과는 개인의 구강 상태에 따라 차이가 있을 수 있습니다. 시술 전 의료진과 충분히 상담하시기 바랍니다.
    </div>

    <div style="display:flex;gap:14px;margin-top:40px;flex-wrap:wrap">
      ${doctor ? html`
      <a href="/doctors/${doctor.slug}" class="treat-sub" style="flex:1;min-width:240px">
        <p style="font-size:12px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">담당 의료진</p>
        <h4>${doctor.name} 원장 (${doctor.role})</h4>
        <p>"${doctor.tagline}"</p>
      </a>` : ''}
      ${treatment ? html`
      <a href="/treatments/${treatment.slug}" class="treat-sub" style="flex:1;min-width:240px">
        <p style="font-size:12px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">관련 진료</p>
        <h4>${treatment.name}</h4>
        <p>${treatment.short}</p>
      </a>` : ''}
    </div>
  </div>
</section>`

  return Layout(
    {
      title: `${cs.title} — ${cs.category} 치료 케이스 | 고수치과의원`,
      description: `${cs.region || '내포'} ${cs.category} 치료 케이스. ${(cs.description || cs.title).slice(0, 120)}`,
      path: `/cases/${cs.id}`,
      schema: [
        breadcrumbSchema([
          { name: '홈', path: '/' },
          { name: '비포 & 애프터', path: '/cases' },
          { name: cs.title, path: `/cases/${cs.id}` },
        ]),
      ],
    },
    content
  )
}

export { CASE_CATEGORIES }
