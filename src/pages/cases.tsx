import { html } from 'hono/html'
import { Layout, breadcrumbSchema } from '../layout'
import { TREATMENTS, DOCTORS, SITE } from '../data/site'

const CASE_CATEGORIES = ['임플란트', '치아교정', '심미보철', '충치·신경치료', '보철치료', '턱관절', '기타']

export const CASE_PER_PAGE = 12
// 구조 필드만으로 만든 사례 요약(데이터에 있는 값만)
export function caseSummary(cs: any) {
  const doctor = DOCTORS.find((d) => d.slug === cs.doctor_slug)
  const who = [cs.age_group, cs.gender].filter(Boolean).join(' ')
  return [`${cs.category || '치과'} 치료 사례`, who ? `${who} 환자` : '', cs.duration ? `치료 기간 ${cs.duration}` : '', doctor ? `담당 ${doctor.name} 원장` : ''].filter(Boolean).join(' · ') + '.'
}

export function casesListPage(cases: any[], loggedIn: boolean, opts: { cat?: string; page?: number; totalPages?: number } = {}) {
  const { cat, page = 1, totalPages = 1 } = opts
  const q = (c?: string, p = 1) => { const a: string[] = []; if (c) a.push(`cat=${encodeURIComponent(c)}`); if (p > 1) a.push(`page=${p}`); return a.length ? `?${a.join('&')}` : '' }
  const content = html`
<section class="page-hero" id="cases-hero">
  <div class="section-inner">
    <nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <span>비포 &amp; 애프터</span></nav>
    <p class="eyebrow">Before &amp; After</p>
    <h1 class="h-display">나와 비슷한 고민의 <br><em>치료 이야기</em></h1>
    <p class="lead">비슷한 고민을 가진 분들의 치료 과정을 고민별로 모았습니다. 치료 결과는 개인에 따라 차이가 있을 수 있으며, 치료 후 사진은 사이트 열람 정책에 따라 로그인 후 열람하실 수 있습니다.</p>
    ${!loggedIn ? html`<div class="alert info" style="max-width:560px;margin-top:24px"><i class="fas fa-lock" style="margin-right:8px"></i>치료 후(After) 사진은 <a href="/auth/login" style="font-weight:700;text-decoration:underline">로그인</a> 후 확인하실 수 있습니다.</div>` : ''}
  </div>
</section>

<section class="section" id="cases-list-section" style="padding-top:40px">
  <div class="section-inner">
    <nav class="case-filter" aria-label="진료별 치료 사례 필터">
      <a href="/cases" class="${!cat ? 'active' : ''}" ${!cat ? 'aria-current="page"' : ''}>전체</a>
      ${CASE_CATEGORIES.map((c) => html`<a href="/cases${q(c)}" class="${cat === c ? 'active' : ''}">${c}</a>`)}
    </nav>
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
              ? html`<img src="/api/case-image/${cs.id}/photo_before" alt="${cs.category || '치과'} 치료 전" width="480" height="360" loading="lazy" decoding="async">`
              : html`<div style="display:flex;align-items:center;justify-content:center;height:100%"><i class="fas fa-tooth" style="font-size:36px;color:var(--brand-soft)"></i></div>`}
          </div>
          <div class="case-body">
            <div class="case-meta">
              <span>${cs.category}</span>
              ${cs.age_group ? html`<span>${cs.age_group}</span>` : ''}
              ${cs.gender ? html`<span>${cs.gender}</span>` : ''}
            </div>
            <h2>${cs.title}</h2>
            <p>${cs.region || ''} ${cs.duration ? '· 치료기간 ' + cs.duration : ''}</p>
          </div>
        </a>`)}
      </div>`}
    ${totalPages > 1 ? html`<nav class="col-pager" aria-label="비포&애프터 목록 페이지">
      ${page > 1 ? html`<a href="/cases${q(cat, page - 1)}" rel="prev">‹ 이전</a>` : ''}
      ${Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => n === page ? html`<span aria-current="page">${n}</span>` : html`<a href="/cases${q(cat, n)}">${n}</a>`)}
      ${page < totalPages ? html`<a href="/cases${q(cat, page + 1)}" rel="next">다음 ›</a>` : ''}
    </nav>` : ''}
  </div>
</section>`

  return Layout(
    {
      title: `${cat ? `${cat} ` : ''}비포 & 애프터 — 치료 케이스${page > 1 ? ` (${page}쪽)` : ''} | 고수치과의원`,
      canonicalSearch: q(cat, page) || undefined,
      // 진료별 필터 화면은 목록의 부분집합 → noindex(follow 아님은 레이아웃 기본값)
      noindex: !!cat,
      description:
        '고수치과의 실제 치료 케이스를 고민별로 모았습니다. 임플란트·치아교정·심미보철 치료 전후 비교. 치료 결과는 개인에 따라 차이가 있을 수 있습니다.',
      path: '/cases',
      pageType: 'CollectionPage',
      schema: [
        breadcrumbSchema([{ name: '홈', path: '/' }, { name: '비포 & 애프터', path: '/cases' }]),
        ...(cases.length ? [{
          '@context': 'https://schema.org', '@type': 'ItemList', numberOfItems: cases.length,
          itemListElement: cases.map((cs, i) => ({ '@type': 'ListItem', position: (page - 1) * CASE_PER_PAGE + i + 1, name: cs.title, url: `${SITE.domain}/cases/${cs.id}` })),
        }] : []),
      ],
    },
    content
  )
}

export function caseDetailPage(cs: any, loggedIn: boolean, relCols: any[] = [], relCases: any[] = []) {
  const doctor = DOCTORS.find((d) => d.slug === cs.doctor_slug)
  const treatment = TREATMENTS.find((t) => t.name === cs.category || cs.category?.includes(t.name.slice(0, 2)))

  const pairs: { label: string; before: string | null; after: string | null }[] = [
    { label: '파노라마', before: cs.pano_before, after: cs.pano_after },
    { label: '구내포토', before: cs.photo_before, after: cs.photo_after },
  ].filter((p) => p.before || p.after)

  const content = html`
<section class="page-hero" id="case-hero" style="padding-bottom:50px">
  <div class="section-inner">
    <nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <a href="/cases">비포 &amp; 애프터</a> / <span>${cs.title}</span></nav>
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
    <aside class="col-answer" id="col-answer" aria-label="사례 요약"><strong>사례 요약</strong><p>${caseSummary(cs)}</p></aside>
    ${pairs.map((p) => html`
    <div style="margin-bottom:44px">
      <h2 style="font-size:20px;font-weight:800;color:var(--brand-dark);margin-bottom:16px">${p.label} 전후 비교</h2>
      ${p.before && p.after && loggedIn
        ? html`
        <div class="ba-slider">
          <img src="/api/case-image/${cs.id}/${p.label === '파노라마' ? 'pano' : 'photo'}_before" alt="${cs.category || '치과'} 치료 전 — ${p.label}">
          <img class="ba-after" src="/api/case-image/${cs.id}/${p.label === '파노라마' ? 'pano' : 'photo'}_after" alt="${cs.category || '치과'} 치료 후 — ${p.label}">
          <span class="ba-tag before">Before</span>
          <span class="ba-tag after">After</span>
          <div class="ba-handle" role="slider" tabindex="0" aria-label="${p.label} 전후 사진 비교" aria-valuemin="2" aria-valuemax="98" aria-valuenow="50"></div>
        </div>
        <p style="font-size:13px;color:var(--ink-mute);margin-top:10px;text-align:center"><i class="fas fa-arrows-left-right" style="margin-right:6px"></i>슬라이더를 드래그하거나 좌우 방향키로 비교해 보세요</p>`
        : html`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="case-thumb" style="border-radius:14px;position:relative">
            ${p.before ? html`<img src="/api/case-image/${cs.id}/${p.label === '파노라마' ? 'pano' : 'photo'}_before" alt="${cs.category || '치과'} 치료 전 — ${p.label}">` : ''}
            <span class="ba-tag before" style="top:12px">Before</span>
          </div>
          <div class="case-thumb" style="border-radius:14px;position:relative">
            ${p.after
              ? loggedIn
                ? html`<img src="/api/case-image/${cs.id}/${p.label === '파노라마' ? 'pano' : 'photo'}_after" alt="${cs.category || '치과'} 치료 후 — ${p.label}">`
                : html`<div class="lock-overlay"><i class="fas fa-lock"></i><span>치료 후 사진은 로그인 후 <br>열람 가능합니다</span><a href="/auth/login" class="btn-brand" style="margin-top:8px;font-size:13px;padding:8px 18px">로그인</a></div>`
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
      본 치료 사례는 이해를 돕기 위한 것으로, 치료 방법과 결과는 개인의 구강 상태에 따라 차이가 있을 수 있습니다. 전후 사진은 같은 촬영 조건을 기준으로 하며 개인차가 있습니다. 시술 전 의료진과 충분히 상담하시기 바랍니다.
    </div>

    <div style="display:flex;gap:14px;margin-top:40px;flex-wrap:wrap">
      ${doctor ? html`
      <a href="/doctors/${doctor.slug}" class="treat-sub" style="flex:1;min-width:240px">
        <p style="font-size:12px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">담당 의료진</p>
        <h2>${doctor.name} 원장 (${doctor.role})</h2>
        <p>"${doctor.tagline}"</p>
      </a>` : ''}
      ${treatment ? html`
      <a href="/treatments/${treatment.slug}" class="treat-sub" style="flex:1;min-width:240px">
        <p style="font-size:12px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">관련 진료</p>
        <h2>${treatment.name}</h2>
        <p>${treatment.short}</p>
      </a>` : ''}
    </div>
    ${relCols.length ? html`<div class="col-related"><h2>${cs.category || ''} 관련 칼럼</h2><ul>${relCols.map((r) => html`<li><a href="/column/${r.slug}">${r.title}</a><time datetime="${String(r.created_at || '').slice(0, 10)}">${String(r.created_at || '').slice(0, 10)}</time></li>`)}</ul></div>` : ''}
    ${relCases.length ? html`<div class="col-related"><h2>다른 ${cs.category || ''} 사례</h2><ul>${relCases.map((k) => html`<li><a href="/cases/${k.id}">${k.title}</a><span>${k.duration || ''}</span></li>`)}</ul></div>` : ''}
  </div>
</section>`

  return Layout(
    {
      title: `${cs.category || '치과'} 사례 — ${cs.title}${cs.duration && !String(cs.title).includes(cs.duration) ? `, ${cs.duration}` : ''} | 고수치과의원`,
      description: `${caseSummary(cs)} ${String(cs.description || '').replace(/\s+/g, ' ').slice(0, 120)}`.trim(),
      path: `/cases/${cs.id}`,
      noindex: true,
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
