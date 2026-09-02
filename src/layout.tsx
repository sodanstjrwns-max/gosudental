import { html, raw } from 'hono/html'
import { SITE, TREATMENTS, DOCTORS } from './data/site'

export interface PageMeta {
  title: string
  description: string
  path: string
  ogImage?: string
  schema?: object[]
  bodyClass?: string
}

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': ['Dentist', 'LocalBusiness'],
  '@id': `${SITE.domain}/#organization`,
  name: SITE.name,
  alternateName: [SITE.nameEn, '고수치과', '내포 고수치과'],
  url: SITE.domain,
  logo: `${SITE.domain}/static/img/logo-stack.png`,
  image: [`${SITE.domain}/static/img/og-image.jpg`, `${SITE.domain}/static/img/interior-lobby.jpg`],
  slogan: SITE.slogan,
  description: `${SITE.slogan} — 임플란트·교정과 전문의 치아교정·심미보철 올인원 진료. 내포신도시 주키즈소아청소년과 건물 5층, 2026년 11월 2일 개원 예정.`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '삽교읍 예학로 93, 5층',
    addressLocality: '예산군',
    addressRegion: '충청남도',
    postalCode: '32419',
    addressCountry: 'KR',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 36.6547, longitude: 126.6716 },
  hasMap: 'https://map.naver.com/p/search/충청남도%20예산군%20삽교읍%20예학로%2093',
  areaServed: ['내포신도시', '예산군', '홍성군', '삽교읍', '덕산면', '충청남도'],
  medicalSpecialty: 'Dentistry',
  founder: { '@type': 'Person', name: '조원익', jobTitle: '대표원장' },
  foundingDate: '2026-11-02',
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], description: '진료시간 확정 시 안내' },
  ],
  availableService: TREATMENTS.map((t) => ({
    '@type': 'MedicalProcedure',
    name: t.name,
    url: `${SITE.domain}/treatments/${t.slug}`,
  })),
  knowsAbout: ['임플란트', '치아교정', '투명교정', '심미보철', '라미네이트', '충치치료', '신경치료', '턱관절치료', '자연치아 보존'],
  sameAs: [SITE.blog, SITE.instagram],
}

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.domain}/#website`,
  url: SITE.domain,
  name: SITE.name,
  inLanguage: 'ko-KR',
  publisher: { '@id': `${SITE.domain}/#organization` },
}

export function Layout(meta: PageMeta, content: any) {
  const canonical = `${SITE.domain}${meta.path}`
  const og = meta.ogImage || `${SITE.domain}/static/img/og-image.jpg`
  const schemas = [ORG_SCHEMA, WEBSITE_SCHEMA, ...(meta.schema || [])]
  const coreT = TREATMENTS.filter((t) => t.core)
  const otherT = TREATMENTS.filter((t) => !t.core)

  return html`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${meta.title}</title>
<meta name="description" content="${meta.description}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta name="keywords" content="내포신도시 치과, 예산 치과, 홍성 치과, 고수치과, 내포 임플란트, 내포 치아교정, 교정과 전문의, 삽교읍 치과">
<meta name="author" content="고수치과의원">
<meta name="geo.region" content="KR-44">
<meta name="geo.placename" content="충청남도 예산군 삽교읍 (내포신도시)">
<meta name="geo.position" content="36.6547;126.6716">
<meta name="ICBM" content="36.6547, 126.6716">
<meta name="theme-color" content="#101417">
<meta name="format-detection" content="telephone=no">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${SITE.name} — ${SITE.slogan}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${meta.title}">
<meta name="twitter:description" content="${meta.description}">
<meta name="twitter:image" content="${og}">
<link rel="icon" type="image/png" sizes="32x32" href="/static/img/favicon-32.png">
<link rel="apple-touch-icon" href="/static/img/apple-touch-icon.png">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700;900&family=Nanum+Brush+Script&family=Gowun+Batang:wght@400;700&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-tc-webfont@1.2.0/lxgwwenkaitc-bold.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css">
<link rel="stylesheet" href="/static/style.css">
${raw(schemas.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n'))}
</head>
<body class="${meta.bodyClass || ''}">
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <filter id="ink-bleed" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.032 0.045" numOctaves="3" seed="7" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>
<a href="#main-content" class="skip-link">본문 바로가기</a>

<header id="site-header" class="site-header">
  <div class="header-inner">
    <a href="/" class="header-logo" aria-label="고수치과 홈으로">
      <img src="/static/img/logo-h.png" alt="고수치과 GOSU DENTAL 로고" width="150" height="70">
    </a>
    <nav class="gnb" aria-label="주 메뉴">
      <ul class="gnb-list">
        <li><a href="/mission">병원미션</a></li>
        <li class="has-mega">
          <a href="/doctors">의료진</a>
          <div class="mega"><div class="mega-col">
            <a href="/doctors">의료진 전체보기</a>
            ${DOCTORS.map((d) => html`<a href="/doctors/${d.slug}">${d.name} ${d.role}</a>`)}
          </div></div>
        </li>
        <li class="has-mega">
          <a href="/treatments">진료안내</a>
          <div class="mega mega-wide">
            <div class="mega-col">
              <span class="mega-label">핵심 진료</span>
              ${coreT.map((t) => html`<a href="/treatments/${t.slug}">${t.name}</a>`)}
            </div>
            <div class="mega-col">
              <span class="mega-label">전체 진료</span>
              ${otherT.map((t) => html`<a href="/treatments/${t.slug}">${t.name}</a>`)}
            </div>
          </div>
        </li>
        <li class="has-mega">
          <a href="/cases">콘텐츠</a>
          <div class="mega"><div class="mega-col">
            <a href="/cases">비포 & 애프터</a>
            <a href="/column">원장 칼럼</a>
            <a href="/encyclopedia">치과 백과사전</a>
          </div></div>
        </li>
        <li class="has-mega">
          <a href="/directions">병원안내</a>
          <div class="mega"><div class="mega-col">
            <a href="/directions">오시는 길 · 진료시간</a>
            <a href="/tour">공간 둘러보기</a>
            <a href="/pricing">비용 안내</a>
            <a href="/faq">자주 묻는 질문</a>
            <a href="/notice">공지사항</a>
          </div></div>
        </li>
      </ul>
    </nav>
    <div class="header-cta">
      <a href="/auth/login" class="btn-ghost" id="login-link">로그인</a>
      <a href="/reservation" class="btn-brand">상담 예약</a>
    </div>
    <button class="mobile-toggle" aria-label="메뉴 열기" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="mobile-menu" id="mobile-menu">
    <a href="/mission">병원미션</a>
    <a href="/doctors">의료진</a>
    <details><summary>진료안내</summary>
      ${TREATMENTS.map((t) => html`<a href="/treatments/${t.slug}">${t.name}</a>`)}
    </details>
    <a href="/cases">비포 & 애프터</a>
    <a href="/column">원장 칼럼</a>
    <a href="/encyclopedia">백과사전</a>
    <a href="/directions">오시는 길</a>
    <a href="/tour">공간 둘러보기</a>
    <a href="/pricing">비용 안내</a>
    <a href="/faq">FAQ</a>
    <a href="/notice">공지사항</a>
    <a href="/auth/login">로그인</a>
    <a href="/reservation" class="mobile-cta">상담 예약</a>
  </div>
</header>

<main id="main-content">${content}</main>

<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <img src="/static/img/logo-h.png" alt="고수치과 로고" width="180" height="84" loading="lazy">
      <p class="footer-slogan">${SITE.slogan}</p>
      <div class="footer-sns">
        <a href="${SITE.blog}" target="_blank" rel="noopener" aria-label="네이버 블로그"><i class="fas fa-blog"></i></a>
        <a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="인스타그램"><i class="fab fa-instagram"></i></a>
        <a href="#" aria-label="유튜브 (개설 예정)"><i class="fab fa-youtube"></i></a>
      </div>
    </div>
    <div class="footer-info">
      <p><strong>${SITE.name}</strong> | 대표자: 조원익</p>
      <p>${SITE.address} (${SITE.addressShort})</p>
      <p>${SITE.openDate} | 대표전화: 개원 시 안내</p>
      <p class="footer-links">
        <a href="/privacy">개인정보 처리방침</a> · <a href="/terms">이용약관</a> · <a href="/sitemap.xml">사이트맵</a>
      </p>
    </div>
    <div class="footer-legal">
      <p>본 홈페이지의 치료 전후 사진과 치료 정보는 이해를 돕기 위한 것으로, 치료 결과는 개인에 따라 차이가 있을 수 있습니다. 모든 시술에는 부작용이 발생할 수 있으므로 시술 전 의료진과 충분히 상담하시기 바랍니다.</p>
      <p>© 2026 GOSU DENTAL. All rights reserved.</p>
    </div>
  </div>
</footer>

<nav class="mobile-cta-bar" aria-label="모바일 빠른 메뉴">
  <a href="/directions" class="cta-dir"><i class="fas fa-location-dot" aria-hidden="true"></i> 오시는 길</a>
  <a href="/reservation" class="cta-res"><i class="fas fa-calendar-check" aria-hidden="true"></i> 상담 예약</a>
</nav>

<script src="/static/app.js" defer></script>
<script src="/static/ink.js" defer></script>
</body>
</html>`
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE.domain}${it.path}`,
    })),
  }
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}
