import { html, raw } from 'hono/html'
import { Layout, breadcrumbSchema } from '../layout'
import { SITE, TERMS, TREATMENTS, DOCTORS } from '../data/site'

// ── 원장 칼럼 ──
export function columnListPage(posts: any[]) {
  const content = html`
<section class="page-hero" id="column-hero">
  <div class="section-inner">
    <nav class="breadcrumb"><a href="/">홈</a> / <span>원장 칼럼</span></nav>
    <p class="eyebrow">Column</p>
    <h1 class="h-display">원장이 직접 쓰는 <br><em>치과 이야기</em></h1>
    <p class="lead">광고가 아닌, 진짜 도움이 되는 치과 이야기를 기록합니다. 배우고 성장하는 과정도 함께 남깁니다.</p>
  </div>
</section>

<section class="section" id="column-list-section" style="padding-top:30px">
  <div class="section-inner">
    ${posts.length === 0
      ? html`<div class="empty-state">
          <i class="fas fa-pen-nib"></i>
          <p style="font-size:17px;font-weight:600;color:var(--ink-soft)">첫 칼럼을 준비하고 있습니다</p>
          <p style="margin-top:8px">그동안 원장 블로그의 이야기를 만나보세요 — <a href="${SITE.blog}" target="_blank" rel="noopener" style="color:var(--brand);font-weight:700">행복한 치과의사의 성장로그</a></p>
        </div>`
      : html`<div class="post-grid" style="margin-top:0">
        ${posts.map((p) => html`
        <a href="/column/${p.slug}" class="post-card">
          <div class="post-thumb">
            ${p.thumbnail ? html`<img src="${p.thumbnail}" alt="${p.title}" loading="lazy">` : html`<div style="display:flex;align-items:center;justify-content:center;height:100%"><i class="fas fa-tooth" style="font-size:32px;color:var(--brand-soft)"></i></div>`}
          </div>
          <div class="post-body">
            <p class="date">${(p.created_at || '').slice(0, 10)} ${p.category ? '· ' + p.category : ''}</p>
            <h3>${p.title}</h3>
            <p>${p.meta_description || ''}</p>
          </div>
        </a>`)}
      </div>`}
  </div>
</section>`

  return Layout(
    {
      title: '원장 칼럼 | 고수치과의원',
      description: '고수치과 원장이 직접 쓰는 치과 이야기. 임플란트·교정·심미보철에 대한 정확하고 솔직한 의료 정보를 전합니다.',
      path: '/column',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '원장 칼럼', path: '/column' }])],
    },
    content
  )
}

export function columnDetailPage(post: any) {
  const author = DOCTORS.find((d) => d.slug === post.author_slug) || DOCTORS[0]
  const relTreatment = TREATMENTS.find((t) => post.category === t.name)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: post.title,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Person', name: `${author.name} 원장`, url: `${SITE.domain}/doctors/${author.slug}` },
    reviewedBy: { '@type': 'Person', name: `${author.name} 원장` },
    publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.domain}/static/img/logo-stack.png` } },
    mainEntityOfPage: `${SITE.domain}/column/${post.slug}`,
  }

  const content = html`
<section class="page-hero" id="post-hero" style="padding-bottom:40px">
  <div class="section-narrow">
    <nav class="breadcrumb"><a href="/">홈</a> / <a href="/column">원장 칼럼</a> / <span>${post.title}</span></nav>
    ${post.category ? html`<p class="eyebrow">${post.category}</p>` : ''}
    <h1 class="h-display" style="font-size:clamp(26px,3.8vw,44px)">${post.title}</h1>
    <p style="font-size:14.5px;color:var(--ink-mute)">
      <a href="/doctors/${author.slug}" style="font-weight:700;color:var(--brand)">${author.name} 원장</a> · ${(post.created_at || '').slice(0, 10)}
      ${post.updated_at && post.updated_at !== post.created_at ? html` (최종 검토 ${(post.updated_at || '').slice(0, 10)})` : ''}
    </p>
  </div>
</section>

<section class="section" id="post-body-section" style="padding-top:20px">
  <div class="section-narrow">
    <article class="prose">${raw(post.content)}</article>

    <div style="display:flex;gap:14px;margin-top:52px;flex-wrap:wrap">
      <a href="/doctors/${author.slug}" class="treat-sub" style="flex:1;min-width:240px">
        <p style="font-size:12px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">글쓴이</p>
        <h4>${author.name} 원장 (${author.role})</h4>
        <p>"${author.tagline}"</p>
      </a>
      ${relTreatment ? html`
      <a href="/treatments/${relTreatment.slug}" class="treat-sub" style="flex:1;min-width:240px">
        <p style="font-size:12px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">관련 진료</p>
        <h4>${relTreatment.name}</h4>
        <p>${relTreatment.short}</p>
      </a>` : ''}
    </div>
  </div>
</section>`

  return Layout(
    {
      title: `${post.title} | 고수치과 원장 칼럼`,
      description: post.meta_description || post.title,
      path: `/column/${post.slug}`,
      ogImage: post.thumbnail || undefined,
      schema: [
        articleSchema,
        breadcrumbSchema([
          { name: '홈', path: '/' },
          { name: '원장 칼럼', path: '/column' },
          { name: post.title, path: `/column/${post.slug}` },
        ]),
      ],
    },
    content
  )
}

// ── 백과사전 ──
export function encyclopediaPage(q?: string) {
  const filtered = q ? TERMS.filter((t) => t.name.includes(q) || t.def.includes(q)) : TERMS
  const content = html`
<section class="page-hero" id="dict-hero">
  <div class="section-inner">
    <nav class="breadcrumb"><a href="/">홈</a> / <span>치과 백과사전</span></nav>
    <p class="eyebrow">Encyclopedia</p>
    <h1 class="h-display">치과 <em>백과사전</em></h1>
    <p class="lead">진료실에서 들었던 낯선 용어들, 쉽게 풀어 설명해 드립니다. 총 ${TERMS.length}개 용어 수록 (계속 추가됩니다).</p>
    <form method="GET" action="/encyclopedia" style="max-width:420px;margin-top:24px;display:flex;gap:10px">
      <input class="form-control" type="search" name="q" value="${q || ''}" placeholder="용어 검색 (예: 임플란트, 신경치료)">
      <button class="btn-brand" type="submit" style="border:none;cursor:pointer;font-family:var(--font)">검색</button>
    </form>
  </div>
</section>

<section class="section" id="dict-list-section" style="padding-top:30px">
  <div class="section-inner">
    ${filtered.length === 0 ? html`<div class="empty-state"><i class="fas fa-magnifying-glass"></i><p>"${q}"에 대한 검색 결과가 없습니다.</p></div>` : ''}
    <div class="dict-grid">
      ${filtered.map((t) => {
        const rel = TREATMENTS.filter((tr) => t.related.includes(tr.slug))
        return html`
        <article class="dict-card" id="${t.name}">
          <h3><a href="/encyclopedia/${t.slug}">${t.name}</a></h3>
          <p>${t.def}</p>
          <div class="dict-links">
            ${rel.map((tr) => html`<a href="/treatments/${tr.slug}">${tr.name}</a>`)}
          </div>
        </article>`
      })}
    </div>
  </div>
</section>`

  return Layout(
    {
      title: q ? `"${q}" 검색 결과 — 치과 백과사전 | 고수치과` : `치과 백과사전 — ${TERMS.length}개 치과 용어 사전 | 고수치과의원`,
      description: '임플란트·교정·신경치료 등 진료실에서 만나는 치과 용어를 알기 쉽게 정리한 고수치과 백과사전.',
      path: '/encyclopedia',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '백과사전', path: '/encyclopedia' }])],
    },
    content
  )
}

export function termDetailPage(slug: string) {
  const term = TERMS.find((t) => t.slug === slug || t.name === decodeURIComponent(slug))
  if (!term) return null
  const rel = TREATMENTS.filter((tr) => term.related.includes(tr.slug))
  const relTerms = TERMS.filter((t) => t.slug !== term.slug && t.related.some((r) => term.related.includes(r))).slice(0, 8)

  const defSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.name,
    description: term.def,
    url: `${SITE.domain}/encyclopedia/${term.slug}`,
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: '고수치과 치과 백과사전' },
  }

  const content = html`
<section class="page-hero" id="term-hero">
  <div class="section-narrow">
    <nav class="breadcrumb"><a href="/">홈</a> / <a href="/encyclopedia">백과사전</a> / <span>${term.name}</span></nav>
    <p class="eyebrow">Dental Term</p>
    <h1 class="h-display">${term.name}</h1>
    <p class="lead" style="font-size:19px">${term.def}</p>
  </div>
</section>

<section class="section" id="term-related-section" style="padding-top:20px">
  <div class="section-narrow">
    ${rel.length ? html`
    <h2 style="font-size:20px;font-weight:800;color:var(--brand-dark);margin-bottom:18px">관련 진료 보기</h2>
    <div class="treat-sub-grid" style="grid-template-columns:repeat(${Math.min(rel.length, 3)},1fr)">
      ${rel.map((tr) => html`
      <a href="/treatments/${tr.slug}" class="treat-sub">
        <h4>${tr.name}</h4>
        <p>${tr.short}</p>
      </a>`)}
    </div>` : ''}
    ${relTerms.length ? html`
    <h2 style="font-size:20px;font-weight:800;color:var(--brand-dark);margin:44px 0 18px">함께 보면 좋은 용어</h2>
    <div class="pill-row">
      ${relTerms.map((t) => html`<a class="pill" href="/encyclopedia/${t.slug}">${t.name}</a>`)}
    </div>` : ''}
  </div>
</section>`

  return Layout(
    {
      title: `${term.name}이란? — 치과 백과사전 | 고수치과의원`,
      description: `${term.name}: ${term.def}`,
      path: `/encyclopedia/${term.slug}`,
      schema: [
        defSchema,
        breadcrumbSchema([
          { name: '홈', path: '/' },
          { name: '백과사전', path: '/encyclopedia' },
          { name: term.name, path: `/encyclopedia/${term.slug}` },
        ]),
      ],
    },
    content
  )
}

// ── 공지사항 ──
export function noticeListPage(notices: any[]) {
  const content = html`
<section class="page-hero" id="notice-hero">
  <div class="section-inner">
    <nav class="breadcrumb"><a href="/">홈</a> / <span>공지사항</span></nav>
    <p class="eyebrow">Notice</p>
    <h1 class="h-display">공지사항</h1>
  </div>
</section>

<section class="section" id="notice-list-section" style="padding-top:20px">
  <div class="section-narrow">
    ${notices.length === 0
      ? html`<div class="empty-state"><i class="fas fa-bullhorn"></i><p>등록된 공지사항이 없습니다.</p></div>`
      : html`<div class="notice-list">
        ${notices.map((n) => html`
        <a href="/notice/${n.id}" class="notice-row">
          ${n.pinned ? html`<span class="pin">공지</span>` : ''}
          <h3>${n.title}</h3>
          <time>${(n.created_at || '').slice(0, 10)}</time>
        </a>`)}
      </div>`}
  </div>
</section>`

  return Layout(
    {
      title: '공지사항 | 고수치과의원',
      description: '고수치과 공지사항 — 개원 소식, 진료 안내, 이벤트 소식을 전해드립니다.',
      path: '/notice',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '공지사항', path: '/notice' }])],
    },
    content
  )
}

export function noticeDetailPage(n: any) {
  const content = html`
<section class="page-hero" id="notice-detail-hero" style="padding-bottom:40px">
  <div class="section-narrow">
    <nav class="breadcrumb"><a href="/">홈</a> / <a href="/notice">공지사항</a> / <span>${n.title}</span></nav>
    ${n.pinned ? html`<span class="pin" style="font-size:12px;font-weight:800;color:#fff;background:var(--brand);padding:5px 13px;border-radius:999px">대표 공지</span>` : ''}
    <h1 class="h-display" style="font-size:clamp(24px,3.4vw,40px);margin-top:14px">${n.title}</h1>
    <p style="font-size:14px;color:var(--ink-mute)">${(n.created_at || '').slice(0, 10)}</p>
  </div>
</section>
<section class="section" style="padding-top:10px" id="notice-detail-body">
  <div class="section-narrow prose">
    ${n.image ? html`<img src="${n.image}" alt="${n.title}">` : ''}
    <p>${n.content}</p>
    <p style="margin-top:40px"><a href="/notice" class="treat-more"><i class="fas fa-arrow-left"></i> 목록으로</a></p>
  </div>
</section>`

  return Layout(
    {
      title: `${n.title} | 고수치과 공지사항`,
      description: (n.content || '').slice(0, 140),
      path: `/notice/${n.id}`,
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '공지사항', path: '/notice' }, { name: n.title, path: `/notice/${n.id}` }])],
    },
    content
  )
}
