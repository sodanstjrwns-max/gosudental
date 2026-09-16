import { sanitizeContent } from '../security'
import { html, raw } from 'hono/html'
import { Layout, breadcrumbSchema, schemaDate, faqSchema } from '../layout'
import { TERM_ARTICLES, TERM_REFERENCES } from '../data/encyclopedia-content'
import { SITE, TERMS, TREATMENTS, DOCTORS } from '../data/site'

// ── 원장 칼럼 ──
export function columnListPage(posts: any[]) {
  const content = html`
<section class="page-hero" id="column-hero">
  <div class="section-inner">
    <nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <span>원장 칼럼</span></nav>
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
            <h2>${p.title}</h2>
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
      pageType: 'CollectionPage',
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
    '@type': 'BlogPosting',
    '@id': `${SITE.domain}/column/${post.slug}#article`,
    headline: post.title,
    description: post.meta_description || post.title,
    inLanguage: 'ko-KR',
    datePublished: schemaDate(post.created_at),
    dateModified: schemaDate(post.updated_at || post.created_at),
    image: new URL(post.thumbnail || '/static/img/og-image.jpg', SITE.domain).href,
    author: { '@type': 'Person', '@id': `${SITE.domain}/doctors/${author.slug}#person`, name: `${author.name} 원장`, url: `${SITE.domain}/doctors/${author.slug}` },
    publisher: { '@id': `${SITE.domain}/#organization` },
    mainEntityOfPage: { '@id': `${SITE.domain}/column/${post.slug}#webpage` },
  }

  const content = html`
<section class="page-hero" id="post-hero" style="padding-bottom:40px">
  <div class="section-narrow">
    <nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <a href="/column">원장 칼럼</a> / <span>${post.title}</span></nav>
    ${post.category ? html`<p class="eyebrow">${post.category}</p>` : ''}
    <h1 class="h-display" style="font-size:clamp(26px,3.8vw,44px)">${post.title}</h1>
    <p style="font-size:14.5px;color:var(--ink-mute)">
      <a href="/doctors/${author.slug}" style="font-weight:700;color:var(--brand)">${author.name} 원장</a> · ${(post.created_at || '').slice(0, 10)}
      ${post.updated_at && post.updated_at !== post.created_at ? html` (최종 수정 ${(post.updated_at || '').slice(0, 10)})` : ''}
    </p>
  </div>
</section>

<section class="section" id="post-body-section" style="padding-top:20px">
  <div class="section-narrow">
    <article class="prose">${raw(sanitizeContent(post.content))}</article>

    <div style="display:flex;gap:14px;margin-top:52px;flex-wrap:wrap">
      <a href="/doctors/${author.slug}" class="treat-sub" style="flex:1;min-width:240px">
        <p style="font-size:12px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">글쓴이</p>
        <h2>${author.name} 원장 (${author.role})</h2>
        <p>"${author.tagline}"</p>
      </a>
      ${relTreatment ? html`
      <a href="/treatments/${relTreatment.slug}" class="treat-sub" style="flex:1;min-width:240px">
        <p style="font-size:12px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">관련 진료</p>
        <h2>${relTreatment.name}</h2>
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
      ogType: 'article',
      pageType: 'MedicalWebPage',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
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
  q = q?.trim()
  const query = q?.toLocaleLowerCase('ko-KR')
  const filtered = query ? TERMS.filter((t) => [t.name, t.def, TERM_ARTICLES[t.name]?.summary || ''].join(' ').toLocaleLowerCase('ko-KR').includes(query)) : TERMS
  const content = html`
<section class="page-hero" id="dict-hero">
  <div class="section-inner">
    <nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <span>치과 백과사전</span></nav>
    <p class="eyebrow">Encyclopedia</p>
    <h1 class="h-display">치과 <em>백과사전</em></h1>
    <p class="lead">진료실에서 들었던 낯선 용어들, 쉽게 풀어 설명해 드립니다. 총 ${TERMS.length}개 용어 수록 (계속 추가됩니다).</p>
    <form method="GET" action="/encyclopedia" style="max-width:420px;margin-top:24px;display:flex;gap:10px">
      <input class="form-control" type="search" id="dictionary-search" aria-label="치과 용어 검색" name="q" value="${q || ''}" placeholder="용어 검색 (예: 임플란트, 신경치료)">
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
          <h2><a href="/encyclopedia/${t.slug}">${t.name}</a></h2>
          <p>${TERM_ARTICLES[t.name]?.summary || t.def}</p>
          <a class="term-read-link" href="/encyclopedia/${t.slug}">상세 설명 · 주의사항 · FAQ <span aria-hidden="true">→</span></a>
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
      noindex: Boolean(q?.trim()),
      pageType: 'CollectionPage',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '백과사전', path: '/encyclopedia' }])],
    },
    content
  )
}

export function termDetailPage(slug: string) {
  let decoded = slug
  try { decoded = decodeURIComponent(slug) } catch { return null }
  const term = TERMS.find((t) => t.slug === slug || t.name === decoded)
  if (!term) return null
  const article = TERM_ARTICLES[term.name]
  const rel = TREATMENTS.filter((tr) => term.related.includes(tr.slug))
  const suggested = (article?.relatedNames || []).map(name => TERMS.find(t => t.name === name)).filter((t): t is typeof term => Boolean(t))
  const relTerms = [...suggested, ...TERMS.filter((t) => t.slug !== term.slug && !suggested.some(s => s.slug === t.slug) && t.related.some((r) => term.related.includes(r)))].slice(0, 8)
  const references = (article?.referenceIds || []).map(id => TERM_REFERENCES[id]).filter(Boolean)
  const bodyCharacters = article ? article.sections.reduce((n, s) => n + s.paragraphs.join('').length, 0) + article.faqs.reduce((n, f) => n + f.q.length + f.a.length, 0) : term.def.length
  const readingMinutes = Math.max(1, Math.ceil(bodyCharacters / 500))

  const defSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${SITE.domain}/encyclopedia/${term.slug}#term`,
    name: term.name,
    description: article?.summary || term.def,
    url: `${SITE.domain}/encyclopedia/${term.slug}`,
    inDefinedTermSet: { '@type': 'DefinedTermSet', '@id': `${SITE.domain}/encyclopedia#terms`, name: '고수치과 치과 백과사전', url: `${SITE.domain}/encyclopedia` },
  }

  const content = html`
<section class="page-hero" id="term-hero">
  <div class="section-narrow">
    <nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <a href="/encyclopedia">백과사전</a> / <span>${term.name}</span></nav>
    <p class="eyebrow">Dental Term</p>
    <h1 class="h-display">${term.name}</h1>
    <p class="lead" style="font-size:19px">${article?.summary || term.def}</p>
    ${article ? html`<p class="term-reading-meta">${rel.map(t => t.name).join(' · ')} <span aria-hidden="true">/</span> 약 ${readingMinutes}분 읽기 <span aria-hidden="true">/</span> 자주 묻는 질문 ${article.faqs.length}가지</p>` : ''}
  </div>
</section>

${article ? html`
<section class="section term-guide-section" id="term-guide-section">
  <div class="section-narrow">
    <nav class="term-toc" aria-labelledby="term-toc-heading">
      <h2 id="term-toc-heading">이 용어, 차근차근 알아보기</h2>
      <ol>${article.sections.map((section, i) => html`<li><a href="#term-chapter-${i + 1}"><span aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${section.heading}</a></li>`)}<li><a href="#term-faq"><span aria-hidden="true">Q&A</span>자주 묻는 질문</a></li></ol>
    </nav>
    <article class="term-guide" aria-label="${term.name} 상세 설명">
      ${article.sections.map((section, i) => html`
      <section class="term-chapter prose" id="term-chapter-${i + 1}" aria-labelledby="term-chapter-title-${i + 1}">
        <p class="term-chapter-number" aria-hidden="true">${String(i + 1).padStart(2, '0')} / GUIDE</p>
        <h2 id="term-chapter-title-${i + 1}">${section.heading}</h2>
        ${section.paragraphs.map(p => html`<p>${p}</p>`)}
      </section>`)}
    </article>
    <aside class="term-consultation" aria-labelledby="term-consultation-heading">
      <p class="eyebrow">Before your visit</p>
      <h2 id="term-consultation-heading">진료실에서 확인하면 좋은 질문</h2>
      <ul>${article.checklist.map(item => html`<li>${item}</li>`)}</ul>
    </aside>
    <section id="term-faq" class="term-faq" aria-labelledby="term-faq-heading">
      <p class="eyebrow">Questions & Answers</p>
      <h2 id="term-faq-heading">${term.name}, 자주 묻는 질문</h2>
      <div class="faq-list">${article.faqs.map((faq, i) => html`<details class="faq-item" id="term-question-${i + 1}"><summary>${faq.q}</summary><div class="faq-a">${faq.a}</div></details>`)}</div>
    </section>
    <aside class="term-reference" aria-labelledby="term-reference-heading">
      <h2 id="term-reference-heading">함께 읽을 참고자료</h2>
      <ul>${references.map(source => html`<li><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.title}<span class="sr-only"> (새 창, 영문 자료)</span><span aria-hidden="true"> ↗</span></a></li>`)}</ul>
      <p>참고자료는 관련 주제의 일반 정보입니다. 해외 자료의 허가·보험·진료 체계는 국내와 다를 수 있으며, 개별 제품이나 고수치과의 진료 결과를 보증하지 않습니다.</p>
    </aside>
    <p class="term-medical-note">이 글은 용어 이해를 돕기 위한 일반적인 의료정보이며 개인별 진단이나 치료 처방을 대신하지 않습니다. 적용 여부와 주의사항은 구강 상태·건강 상태·복용 약물에 따라 달라지므로 담당 의료진과 확인해 주세요.</p>
  </div>
</section>` : ''}

<section class="section" id="term-related-section" style="padding-top:20px">
  <div class="section-narrow">
    ${rel.length ? html`
    <h2 style="font-size:20px;font-weight:800;color:var(--brand-dark);margin-bottom:18px">관련 진료 보기</h2>
    <div class="treat-sub-grid" style="grid-template-columns:repeat(${Math.min(rel.length, 3)},1fr)">
      ${rel.map((tr) => html`
      <a href="/treatments/${tr.slug}" class="treat-sub">
        <h3>${tr.name}</h3>
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
      description: article?.summary || `${term.name}: ${term.def}`,
      path: `/encyclopedia/${term.slug}`,
      pageType: 'MedicalWebPage',
      schema: [
        defSchema,
        ...(article ? [faqSchema(article.faqs), { '@context': 'https://schema.org', '@type': 'MedicalWebPage', about: { '@id': `${SITE.domain}/encyclopedia/${term.slug}#term` }, citation: references.map(source => ({ '@type': 'CreativeWork', name: source.title, url: source.url })) }] : []),
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
    <nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <span>공지사항</span></nav>
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
          <h2>${n.title}</h2>
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
      pageType: 'CollectionPage',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '공지사항', path: '/notice' }])],
    },
    content
  )
}

export function noticeDetailPage(n: any) {
  const content = html`
<section class="page-hero" id="notice-detail-hero" style="padding-bottom:40px">
  <div class="section-narrow">
    <nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <a href="/notice">공지사항</a> / <span>${n.title}</span></nav>
    ${n.pinned ? html`<span class="pin" style="font-size:12px;font-weight:800;color:#fff;background:var(--brand);padding:5px 13px;border-radius:999px">대표 공지</span>` : ''}
    <h1 class="h-display" style="font-size:clamp(24px,3.4vw,40px);margin-top:14px">${n.title}</h1>
    <p style="font-size:14px;color:var(--ink-mute)">${(n.created_at || '').slice(0, 10)}</p>
  </div>
</section>
<section class="section" style="padding-top:10px" id="notice-detail-body">
  <div class="section-narrow prose">
    ${n.image ? html`<img src="${n.image}" alt="${n.title}">` : ''}
    <p class="notice-content">${n.content}</p>
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
