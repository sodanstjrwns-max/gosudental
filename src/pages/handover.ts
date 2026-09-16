import { html } from 'hono/html'
import type { Context } from 'hono'
import { DOCTORS, TREATMENTS, TERMS } from '../data/site'

// 공개 납품 안내서에는 인증 비밀값을 절대 포함하지 않는다.
export function handoverPage(c: Context<any>) {
  // 원장 요청: 안내서에 관리자 비밀번호 표시 (도담과 동일). 운영 도메인(gosudc.kr)에서만 env 값을 렌더, 소스·로그에는 남기지 않음.
  const _u = new URL(c.req.url)
  const deliveryOrigin = _u.origin === 'https://gosudc.kr' || ['localhost', '127.0.0.1'].includes(_u.hostname)
  const adminPassword = deliveryOrigin ? String(c.env?.ADMIN_PASSWORD || '') : ''
  c.header('Cache-Control', 'private, no-store, max-age=0, no-transform')
  c.header('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'")
  c.header('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  c.header('Referrer-Policy', 'no-referrer')
  return c.html(html`<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet"><meta name="referrer" content="no-referrer">
<title>고수치과의원 홈페이지 납품 안내서</title>
<meta name="description" content="고수치과의원 홈페이지의 가치와 구성, 콘텐츠 운영 방법, 관리자 사용법, 수정 지원과 결제 안내.">
<link rel="canonical" href="https://gosudc.kr/handover"><link rel="icon" href="/static/img/favicon-32.png">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Gowun+Batang:wght@400;700&family=Nanum+Brush+Script&display=swap">
<link rel="stylesheet" href="/static/handover.css?v=2">
</head><body class="handover-page"><main id="main" class="handover-document">
  <header class="cover">
    <div class="hanja" aria-hidden="true">固守<b>高手</b></div>
    <span class="seal-stamp" aria-hidden="true">高手</span>
    <p class="eyebrow">WEBSITE HANDOVER DOCUMENT</p>
    <h1>고수치과의원<br><span class="accent">공식 홈페이지</span> 납품 안내서</h1>
    <p class="sub">좋은 진료가 검색엔진과 AI를 통해 발견되고,<br><b>시간이 지날수록 쌓이는 SEO·AEO 자산</b>으로서의 홈페이지를 전해 드립니다.</p>
    <p class="meta"><b>도메인</b> gosudc.kr · <b>받는 분</b> 고수치과의원 원장님 · <b>제작</b> 문석준</p>
  </header>
  <div class="document-body">
    <p class="lead">안녕하세요, 원장님. <b>고수치과의원 공식 홈페이지(gosudc.kr)</b> 납품을 완료했습니다.<br>이 홈페이지는 병원 소개 페이지가 아니라, <b>검색엔진과 AI가 고수치과를 스스로 찾아내 추천하도록 설계된 디지털 영업 자산</b>이며, 콘텐츠가 쌓일수록 더 강해지도록 만들어졌습니다.</p>

    <section id="delivery-scope">
      <p class="sec-num">CORE PURPOSE</p><h2>이 홈페이지가 담고 있는 <span class="em">세 가지</span></h2>
      <p class="sec-desc">이 세 가지를 모두 충족하도록 한 줄 한 줄 설계했습니다.</p>
      <ol class="flow purpose-flow">
        <li class="step"><span class="dot">1</span><div><strong>SEO</strong> — 검색엔진이 우리 사이트를 찾고 이해하도록 <small>(네이버·구글·빙)</small></div></li>
        <li class="step"><span class="dot">2</span><div><strong>AEO</strong> — AI가 병원과 진료 정보를 참고할 수 있도록 <small>(ChatGPT·Claude·Perplexity 등)</small></div></li>
        <li class="step"><span class="dot">3</span><div><strong>체류시간</strong> — 사람이 실제로 보고 ‘내원’을 결정할 수 있도록 <small>(읽히는 콘텐츠·심리 흐름)</small></div></li>
      </ol>
      <aside class="callout"><p class="title">이 홈페이지의 최대 의의는 SEO·AEO입니다.</p><p>검색엔진과 AI가 우리 병원을 <strong>‘발견하고·이해하고·답변의 근거로 참고’</strong>할 수 있게 만드는 것이 목적입니다. 그래서 진료 안내가 길고, 용어사전과 지역별 안내 페이지가 많습니다. 사람에게는 필요한 답이고, 크롤러에게는 의미 있는 신호입니다.</p></aside>
    </section>

    <section id="delivery-highlights">
      <p class="sec-num">HIGHLIGHTS</p><h2>이 홈페이지의 백미 — <span class="em">세 가지 핵심 가치</span></h2>
      <p class="sec-desc">단순 디자인이 아니라 ‘검색·신뢰·전환’을 설계한 결과물입니다.</p>
      <h3><span class="badge">1</span>SEO·AEO로 준비한 ‘검색되는 홈페이지’</h3>
      <p>환자들은 “내포신도시 치과”, “예산 임플란트”, “삽교 치아교정”을 검색하고, AI에게도 질문합니다. 페이지별 제목·설명·대표주소(canonical), 구조화 데이터(Schema), 사이트맵, robots·llms.txt까지 검색과 AI 양쪽 규격을 갖췄습니다. 대표주소는 <a href="https://gosudc.kr/">https://gosudc.kr</a>입니다.</p>
      <h3><span class="badge">2</span>쌓을수록 강해지는 사례·칼럼 엔진</h3>
      <p>관리자에서 치료사례와 칼럼을 올리면 <strong>공개 칼럼이 사이트맵</strong>에 반영됩니다. 치료사례 상세는 회원 로그인 후 열람하며, 검색 노출은 보장되지 않습니다. 원장님이 올리는 만큼 검색 입구가 늘어납니다.</p>
      <h3><span class="badge">3</span>환자의 심리 흐름을 따라가는 배열</h3>
      <p><b>인지 → 관심 → 신뢰 → 행동(예약)</b>의 순서로 페이지와 문구를 배열해 불안·불편·불신을 줄이고 자연스럽게 예약으로 이어지게 했습니다.</p>
    </section>

    <section id="delivery-structure">
      <p class="sec-num">STRUCTURE</p><h2>홈페이지 <span class="em">구성과 기능</span></h2>
      <p class="sec-desc">병원 소개부터 용어사전까지 다양한 안내 페이지를 제공합니다. 공개 URL 수는 운영 콘텐츠에 따라 달라집니다.</p>
      <table class="spec-table"><caption class="sr-only">고수치과 홈페이지 구성과 기능</caption><thead><tr><th scope="col">항목</th><th scope="col">내용</th></tr></thead><tbody>
        <tr><th scope="row">전체 공개 안내</th><td><strong>공개 안내 사이트맵</strong> — 병원·의료진·진료·용어사전·지역 안내를 연결하는 구조입니다.</td></tr>
        <tr><th scope="row">치과 용어사전</th><td><strong>${TERMS.length}개 용어 페이지</strong> — 어려운 용어를 쉬운 말로 설명하고 관련 진료로 연결합니다.</td></tr>
        <tr><th scope="row">지역 × 진료</th><td><strong>18개 안내 페이지</strong> — 내포신도시·예산·삽교·홍성 등 주변 지역과 진료를 연결하는 로컬 SEO 페이지입니다.</td></tr>
        <tr><th scope="row">진료 상세 안내</th><td><strong>${TREATMENTS.length}개 진료 페이지</strong> — 임플란트·치아교정·심미보철·라미네이트 등 증상–원인–치료–FAQ까지 담았습니다.</td></tr>
        <tr><th scope="row">대표 이미지</th><td>임플란트·치아교정·심미보철 카드는 <strong>AI 생성 이미지</strong>로 제작해 표기했고, 의료진 실제 사진 16장과 인테리어 사진은 실사입니다. 개원 후 실제 진료 사진이 생기면 교체해 드립니다.</td></tr>
        <tr><th scope="row">의료진 소개</th><td><strong>${DOCTORS.length}명 개별 페이지</strong> — 조원익·김경환·이민우 원장 등 경력과 진료 철학을 소개합니다.</td></tr>
        <tr><th scope="row">치료사례·칼럼</th><td>관리자에서 공개 여부를 관리합니다. 치료사례 상세는 회원에게 제공하고, 공개 칼럼은 사이트맵에 반영합니다.</td></tr>
        <tr><th scope="row">진료비(수가) 관리</th><td>비급여 항목·금액·공개 여부를 관리자에서 직접 수정합니다(의료법 고지 의무 대응).</td></tr>
        <tr><th scope="row">예약·상담 접수</th><td>홈페이지 예약 신청을 관리자에서 확인하고 상태를 관리합니다.</td></tr>
        <tr><th scope="row">의료광고법 안전 설계</th><td>효과 단정·과장·최상급 표현을 배제하고 면책·개인차 안내를 전 페이지에 적용했습니다.</td></tr>
        <tr><th scope="row">모바일·속도</th><td>모바일 하단 고정 버튼(예약·길찾기), WebP 이미지·지연 로딩.</td></tr>
        <tr><th scope="row">운영 기반</th><td>Cloudflare 엣지, D1 데이터베이스, R2 이미지 저장소. 관리 화면은 비로그인 접근 차단·검색 제외.</td></tr>
      </tbody></table>
    </section>

    <section id="delivery-operations">
      <p class="sec-num">ADMIN GUIDE</p><h2>관리자 페이지 <span class="em">사용법</span></h2>
      <p class="sec-desc">원장님이 직접 콘텐츠를 운영하실 수 있도록 정리했습니다.</p>
      <h3>들어가는 방법</h3><ul><li>브라우저에서 <a href="https://gosudc.kr/admin/login"><strong>https://gosudc.kr/admin/login</strong></a>에 접속합니다.</li><li>별도로 전달받은 관리자 비밀번호를 입력하면 <strong>바로 관리 화면</strong>이 열립니다.</li></ul>
      <section id="delivery-admin-access" class="credentials" aria-labelledby="admin-access-title" data-nosnippet>
        <h3 id="admin-access-title">관리자 로그인 정보</h3>
        <p class="credential-label">접속 주소</p><p class="credential-url"><a href="https://gosudc.kr/admin/login">https://gosudc.kr/admin/login</a></p>
        <p class="credential-label">관리자 비밀번호</p>
        ${adminPassword ? html`<p id="admin-password" class="credential-value" translate="no">${adminPassword}</p><button type="button" class="copy-button" data-copy-target="admin-password">관리자 비밀번호 복사</button>` : html`<p class="credential-unavailable">비밀번호는 카카오톡으로 별도 전달드립니다.</p>`}
      </section>
      <aside class="warn"><p class="title">관리자 비밀번호는 별도로 보관해 주세요.</p><p><strong>이 주소는 링크를 아는 사람이 열 수 있으므로</strong> 문서·링크를 외부에 공유하지 마세요. 비밀번호 변경이 필요하면 언제든 말씀해 주세요.</p></aside>
      <h3>관리자에서 할 수 있는 것</h3><ul>
        <li><strong>대시보드</strong> — 예약·사례·칼럼·공지 현황을 한눈에 봅니다.</li>
        <li><strong>예약 관리</strong> — 홈페이지 예약 신청을 확인하고 처리 상태를 바꿉니다.</li>
        <li><strong>치료사례</strong> — 전후 사진과 설명을 올립니다. 공개 여부를 설정하고 회원 열람용으로 제공합니다.</li>
        <li><strong>원장 칼럼</strong> — 제목·본문·메타 설명을 입력해 발행합니다.</li>
        <li><strong>공지사항</strong> — 휴진·이벤트를 등록하고 공지사항 목록에 표시합니다.</li>
        <li><strong>진료비(수가)</strong> — 항목별 금액과 공개/비공개를 수정합니다.</li>
        <li><strong>통합 통계</strong> — 검색·방문·행동 통계를 확인합니다.</li>
      </ul>
      <aside class="callout"><p class="title">치료사례 올리는 법</p><p><a href="/admin/cases">관리자 → 치료사례 → 새 사례 등록</a> → 제목·진료 종류·전후 사진을 넣고 저장합니다. 환자 동의를 받은 사례만 올리시고, 효과를 단정하는 문구는 피해 주세요.</p></aside>
      <aside class="callout"><p class="title">칼럼 쓰는 법</p><p><a href="/admin/posts">관리자 → 원장 칼럼 → 새 칼럼 작성</a> → 제목·본문과 함께 <strong>메타 설명(120~160자)</strong>를 꼭 채워 주세요. 검색 노출의 핵심입니다.</p></aside>
      <aside class="callout"><p class="title">진료비 수정하기</p><p><a href="/admin/fees">관리자 → 진료비(수가)</a>에서 금액을 수정하고 항목별 공개/비공개를 정하면 홈페이지 비용 안내에 바로 반영됩니다.</p></aside>
      <aside class="warn"><p class="title">개원 전 꼭 알려주실 것</p><p>홈페이지에는 아직 <strong>대표 전화번호가 비어 있고 "2026년 11월 2일 개원 예정"</strong>으로 표시됩니다. 전화번호·진료시간·네이버 예약 주소·카카오톡 채널이 확정되면 알려주세요. 받는 즉시 전 페이지와 예약 버튼에 반영합니다.</p></aside>
      <aside class="note"><p class="title">예약 신청 확인 방법</p><p>홈페이지 예약 신청은 <a href="/admin/reservations">관리자 → 예약 관리</a>에 쌓입니다. 자동 알림은 아직 연결하지 않았으니 <strong>하루 한 번 목록을 확인</strong>해 주세요. 원하시면 접수 즉시 지메일로 알림이 가도록 연결해 드립니다.</p></aside>
      <p class="note"><b>사진·저장 안내</b><br>JPG·PNG·WebP, 파일당 5MB를 지원합니다. HEIC는 변환해 주세요. 저장 완료 안내를 확인한 뒤 화면을 닫아 주세요.</p>
    </section>

    <section id="delivery-indexing">
      <p class="sec-num">IMPORTANT</p><h2>가장 중요한 당부 — <span class="em">“검색 색인은 시간이 걸립니다”</span></h2>
      <p class="sec-desc">검색은 광고를 켜듯 바로 완성되는 것이 아니라, 꾸준히 가꾸는 ‘농사’에 가깝습니다.</p>
      <aside class="warn"><p class="title">수집·색인·노출은 서로 다른 단계입니다.</p><p>홈페이지와 사이트맵을 준비했다고 모든 페이지가 바로 검색에 뜨지 않습니다. 검색엔진이 페이지를 수집하고 색인하기까지 걸리는 시간은 사이트와 콘텐츠에 따라 다르며, 색인과 순위 상승을 보장하지 않습니다.</p></aside>
      <p><strong>그래서 중요한 것은 기다리는 동안 사례와 칼럼을 꾸준히 쌓는 일</strong>입니다. 검색엔진의 신뢰가 쌓이는 시점에 이미 풍부한 콘텐츠가 한꺼번에 노출됩니다.</p>
      <ul><li>정확한 글이 쌓일수록 환자의 구체적인 질문에 답하는 페이지가 늘어납니다.</li><li>Google Search Console·네이버 서치어드바이저·빙 웹마스터에 사이트를 등록해 두었습니다. 수집·색인 상태와 검색어를 확인하실 수 있습니다.</li></ul>
      <p><strong>한 줄 요약:</strong> “오늘부터 글 한 편, 사례 하나씩.”</p>
    </section>

    <section id="delivery-growth">
      <p class="sec-num">HOW TO GROW</p><h2>가만히 두면 안 됩니다 — <span class="em">‘돈값 × 100’을 목표로</span></h2>
      <p class="sec-desc">이 홈페이지의 진짜 가치는 ‘납품 시점’이 아니라 ‘앞으로’ 결정됩니다.</p>
      <p>동의와 공개 검토를 마친 <strong>치료사례</strong>, 원장님의 생각과 설명을 담은 <strong>칼럼</strong>을 계속 올려 주세요. 사례 하나, 글 한 편이 새로운 질문에 답하는 검색 입구가 됩니다. 수익을 보장한다는 뜻이 아니라, 그만큼 오래 제대로 활용해 주셨으면 하는 마음입니다.</p>
      <aside class="warn"><p class="title">이 홈페이지를 만드신 목적을 잊지 마세요.</p><p>예쁜 홈페이지를 갖는 것이 목적이 아닙니다. <strong>검색·AI를 통해 발견되고, 좋은 진료를 이해한 환자가 상담과 내원으로 이어지는 것</strong>이 목적입니다.</p></aside>
    </section>

    <section id="delivery-limits">
      <p class="sec-num">SUPPORT &amp; FEEDBACK</p><h2>베타테스트 &amp; <span class="em">영원한 무상 수정</span></h2>
      <p class="sec-desc">납품은 끝이 아니라 시작입니다. 함께 다듬어 가요.</p>
      <aside class="callout"><p class="title">당분간 베타테스터가 되어 주세요.</p><p>기기·브라우저마다 반응이 달라 모든 경우를 미리 확인하기는 어렵습니다. 이상한 부분이 보이면 편하게 알려 주세요. 바로 고칩니다.</p></aside>
      <p><strong>원장님이 생각하시는 대부분의 사항은 수정하거나 구현할 수 있습니다.</strong> 문구·디자인·배치·기능까지 편하게 전달해 주세요.</p>
      <aside class="note"><p class="title">딱 하나, 제게 없는 실제 사진입니다.</p><p>AI 설명 이미지는 실제 환자·진료 결과 사진을 대신하지 않습니다. 현재 진료 카드의 AI 이미지는 별도로 표시되어 있습니다. 실제 병원 사진이나 영상이 생기면 보내 주세요. 받는 즉시 반영합니다.</p></aside>
      <aside class="callout handover-promise"><p class="title">수정 기한은 영원히입니다.</p><p>어디 가지 않고 항상 있을 테니, 언제든 어떤 방식의 피드백도 환영합니다.</p></aside>
    </section>

    <section id="delivery-payment">
      <p class="sec-num">PAYMENT</p><h2><span class="em">결제</span> 안내</h2>
      <p class="sec-desc">아래 계좌로 이체해 주시면 세금계산서를 발급해 드립니다.</p>
      <div class="pay"><h3>결제 금액 및 입금 계좌</h3>
        <div class="amount"><p class="bank">홈페이지 납품 금액</p><p class="amount-value">15,000,000<span>원</span></p><p class="holder">일천오백만 원 · 1,500만 원</p></div>
        <div class="acct"><p class="bank">NH 농협</p><p class="no" id="payment-account-number">1085-02-007634</p><p class="holder">예금주 : 문석준</p><button type="button" class="copy-button" data-copy-target="payment-account-number">계좌번호 복사</button></div>
        <ul><li><strong>결제 방법</strong> — 계좌이체로 부탁드립니다.</li><li><strong>세금계산서</strong> — 입금 확인 후 <strong>2주 이내</strong>에 발급해 드립니다.</li><li>카드나 다른 결제 수단은 아직 지원하지 않습니다. 양해 부탁드립니다.</li></ul>
      </div>
    </section>
    <p id="handover-copy-status" role="status" aria-live="polite"></p>
    <nav class="document-actions" aria-label="안내서 바로가기"><a href="/">홈페이지 보기</a><a href="#delivery-admin-access">관리자 로그인 정보</a><button type="button" id="handover-print">인쇄 · PDF 저장</button></nav>
  </div>
  <footer class="closing"><p class="q">신뢰를 바탕으로 옳은 진료를 고수하며,<br><span class="em">한 사람의 삶을 더 나은 방향으로.</span></p><p>고수치과의 좋은 진료가 더 많은 환자에게 전해지기를 바랍니다.<br>문석준 드림</p></footer>
</main><script src="/static/handover.js?v=1" defer></script></body></html>`)
}
