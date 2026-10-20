import { html } from 'hono/html'
import { Layout, breadcrumbSchema } from '../layout'
import { SITE } from '../data/site'

// 상시 인재채용 (2026-10-21) — 문장은 조원익 대표원장 원고(카톡) 그대로. 내용 추가·과장 금지.
// JobPosting 스키마 넣지 않음: 구체 공고·급여·마감이 없는 상시 인재풀이라 구글 JobPosting 정책 위반 소지.
export const RECRUIT_FIELDS = ['치과위생사', '간호조무사', '데스크·상담', '기타'] as const
export const RECRUIT_MODIFIED = '2026-10-21'

export function recruitPage() {
  const content = html`
<section class="hero rc-hero" id="recruit-hero">
  <div class="hero-bg" style="background-image:url('/static/img/interior-05.webp')"></div>
  <div class="hero-veil"></div>
  <div class="hero-hanja" aria-hidden="true">固守<b>高手</b></div>
  <div class="hero-inner">
    <p class="hero-eyebrow">GOSU DENTAL | 상시 인재채용</p>
    <h1 class="hero-title">
      <span class="line"><span>좋은 치과는,</span></span>
      <span class="line"><span>결국 <span class="rc-nb"><em>좋은 사람들</em>이</span> 만듭니다.</span></span>
    </h1>
    <div class="hero-sub rc-hero-sub">
      <p>우리는 단순히 함께 일할 직원을 찾는 것이 아닙니다.</p>
      <p>같은 방향을 바라보고, 서로에게 좋은 영향을 주며, 함께 성장할 동료를 기다립니다.</p>
      <p><strong>신뢰로 선택받고, 결과로 기억되는 치과.</strong></p>
      <p>그 여정을 함께할 당신을 기다립니다.</p>
    </div>
    <div class="hero-actions">
      <a href="#recruit-apply" class="hero-btn primary">고수치과에 지원하기</a>
    </div>
  </div>
  <div class="hero-scroll">Scroll</div>
</section>

<section class="section rc-sec" id="recruit-01">
  <div class="rc-row">
    <p class="rc-num" aria-hidden="true">01</p>
    <div class="rc-body prose">
      <h2><span class="sr-only">01. </span>좋은 문화가 좋은 치과를 만듭니다.</h2>
      <p>안녕하세요. 고수치과 대표원장 조원익입니다.</p>
      <p>저는 치과의사가 된 이후 여러 치과를 방문하며 다양한 원장님들의 진료와 경영철학을 배웠습니다.</p>
      <p>그 과정에서 한 가지 공통점을 발견했습니다.</p>
      <p>오랫동안 좋은 평가를 받는 치과에는 좋은 장비나 규모보다 먼저, <strong>좋은 사람들이 만들어가는 문화</strong>가 있었습니다.</p>
      <p>좋은 문화는 좋은 사람들을 모이게 하고, 좋은 사람들은 서로에게 긍정적인 영향을 주며, 그 영향력은 다시 병원의 성장으로 이어집니다.</p>
      <p>그래서 고수치과는 단순히 규모가 큰 치과보다, <strong>좋은 사람들이 오래 함께하고 싶은 치과</strong>를 꿈꿉니다.</p>
    </div>
  </div>
</section>

<section class="section rc-sec rc-mist" id="recruit-02">
  <div class="rc-row">
    <p class="rc-num" aria-hidden="true">02</p>
    <div class="rc-body prose">
      <h2><span class="sr-only">02. </span>우리는 진료를 보조하는 사람이 아닌, 치료를 함께 완성하는 동료입니다.</h2>
      <p class="rc-key"><strong>치과의사는 치료를 시작할 수 있지만, 좋은 치료 경험은 한 팀이 함께 완성합니다.</strong></p>
      <p>환자가 치과에서 느끼는 신뢰와 안심, 그리고 치료 결과에 대한 만족은 치과의사 혼자 만들 수 없습니다.</p>
      <p>환자의 긴장을 풀어주고, 치료 과정을 이해시키고, 치료 후의 변화를 함께 기뻐하는 사람들.</p>
      <p>바로 환자와 가장 가까운 곳에서 일하는 우리 동료들입니다.</p>
      <p>고수치과는 치과위생사를 단순히 원장의 진료를 보조하는 사람이 아닌, <strong>환자의 구강 건강과 치료 경험을 함께 책임지는 전문 의료인</strong>으로 존중합니다.</p>
      <p>각자의 전문성이 존중받고, 서로의 역할이 모여 더 좋은 결과를 만드는 치과.</p>
      <p>그것이 우리가 지향하는 팀의 모습입니다.</p>
    </div>
  </div>
</section>

<section class="section rc-sec" id="recruit-03">
  <div class="rc-row">
    <p class="rc-num" aria-hidden="true">03</p>
    <div class="rc-body prose">
      <h2><span class="sr-only">03. </span>어제보다 나은 오늘, 함께 성장하는 치과</h2>
      <p class="rc-key"><strong>시키는 일을 잘하는 것보다, 왜 그렇게 하는지 이해하는 것이 중요합니다.</strong></p>
      <p>대표원장인 저 역시 여전히 배우고 있는 치과의사입니다.</p>
      <p>새로운 술식을 공부하고, 동료 의료인들과 지식을 나누고, 더 좋은 진료 방법을 고민하는 과정이 즐겁습니다.</p>
      <p>그리고 그 즐거움을 우리 구성원들과도 나누고 싶습니다.</p>
      <p class="rc-tags">디지털 덴티스트리, 임플란트, 교정, 심미치료, Smile Design, 안티에이징까지.</p>
      <p>고수치과는 치아만 치료하는 것을 넘어, 환자의 기능과 심미, 얼굴과 미소의 조화까지 함께 고민합니다.</p>
      <p>새로운 진료가 대표원장만의 지식으로 남지 않고, <strong>우리 모두가 이해하고 함께 만들어가는 진료</strong>가 되기를 바랍니다.</p>
      <p>교육과 경험을 통해 구성원 한 사람 한 사람이 자신의 전문성을 넓혀갈 수 있도록 돕겠습니다.</p>
      <p class="rc-key"><strong>병원의 성장이 곧 구성원의 성장으로 이어지는 곳.</strong></p>
      <p>고수치과가 만들고 싶은 일터입니다.</p>
    </div>
  </div>
</section>

<section class="section rc-sec rc-mist" id="recruit-04">
  <div class="rc-row">
    <p class="rc-num" aria-hidden="true">04</p>
    <div class="rc-body prose">
      <h2><span class="sr-only">04. </span>서로의 시간과 삶을 존중합니다.</h2>
      <p class="rc-key"><strong>좋은 직장은 일할 때도, 퇴근한 뒤에도 행복할 수 있어야 합니다.</strong></p>
      <p>저는 개인적으로 오버타임을 좋아하지 않습니다.</p>
      <p>진료가 끝나면 저 역시 빠르게 퇴근해 제 삶을 즐기고 싶습니다.</p>
      <p>함께 일하는 동료들도 마찬가지였으면 좋겠습니다.</p>
      <p>근무시간에는 각자의 역할에 책임을 다하고, 퇴근 후에는 온전히 자신의 삶에 집중할 수 있는 곳.</p>
      <p>불필요한 야근과 비효율적인 업무를 줄이고, 서로의 시간을 존중하는 문화를 만들겠습니다.</p>
      <p>일을 잘하는 사람이 더 많은 일을 떠안는 것이 아니라, 서로 도우며 함께 효율적으로 일하는 팀이 되고 싶습니다.</p>
      <blockquote class="rc-quote"><strong>오래 일해 달라고 요구하기보다, 오래 일하고 싶은 환경을 만드는 것이 대표의 역할이라고 생각합니다.</strong></blockquote>
    </div>
  </div>
</section>

<section class="section rc-sec" id="recruit-05">
  <div class="rc-row">
    <p class="rc-num" aria-hidden="true">05</p>
    <div class="rc-body prose">
      <h2><span class="sr-only">05. </span>우리가 기다리는 동료</h2>
      <p class="rc-key"><strong>완벽한 사람보다, 함께 나아갈 사람을 기다립니다.</strong></p>
      <div class="rc-versus">
        <p>경력이 화려한 사람보다 배우려는 사람을,</p>
        <p>혼자 돋보이는 사람보다 팀을 먼저 생각하는 사람을,</p>
        <p>이미 모든 것을 잘하는 사람보다 함께 더 잘하려는 사람을 기다립니다.</p>
      </div>
      <p>좋은 농구팀이 한 명의 스타플레이어만으로 우승할 수 없듯, 좋은 치과도 대표원장 한 사람만으로 만들어질 수 없습니다.</p>
      <p>서로 다른 장점과 경험을 가진 사람들이 같은 목표를 향해 움직일 때, 비로소 좋은 팀이 완성된다고 믿습니다.</p>
      <p>우리는 이런 동료와 함께하고 싶습니다.</p>
      <ul class="rc-check">
        <li>환자에게 진심으로 다가가는 사람</li>
        <li>자신의 일에 책임감과 자부심을 가진 사람</li>
        <li>새로운 것을 배우고 성장하는 데 즐거움을 느끼는 사람</li>
        <li>동료의 성장을 함께 기뻐할 수 있는 사람</li>
        <li>서로의 다름을 존중하고 건강하게 소통하는 사람</li>
      </ul>
      <p class="rc-key"><strong>지금 얼마나 잘하는가보다, 앞으로 얼마나 함께 성장할 수 있는가를 더 중요하게 생각합니다.</strong></p>
    </div>
  </div>
</section>

<section class="section philosophy rc-promise" id="recruit-06">
  <div class="section-inner rc-promise-inner">
    <p class="rc-num rc-num-light" aria-hidden="true">06</p>
    <h2 class="h-display"><span class="sr-only">06. </span>고수치과라는 이름에 담긴 약속</h2>
    <p class="lead rc-lead-light">고수치과에는 두 가지 의미가 담겨 있습니다.</p>
    <div class="rc-hanja-grid">
      <article class="rc-hanja-card">
        <p class="rc-hanja" lang="zh-Hant" aria-hidden="true">固守</p>
        <h3><span lang="zh-Hant">固守</span> | 고수하다</h3>
        <p>환자에게 약속한 진료의 원칙과 좋은 결과를 끝까지 지켜나가겠다는 다짐.</p>
      </article>
      <article class="rc-hanja-card">
        <p class="rc-hanja" lang="zh-Hant" aria-hidden="true">高手</p>
        <h3><span lang="zh-Hant">高手</span> | 고수가 되다</h3>
        <p>각자의 자리에서 끊임없이 배우고 성장하며, 자신의 분야에서 실력을 갖춘 전문가가 되자는 다짐.</p>
      </article>
    </div>
    <div class="rc-letter">
      <p>저는 단순히 치과를 운영하는 사람이 아니라, 좋은 팀을 만들어가는 대표가 되고 싶습니다.</p>
      <p>그리고 고수치과에서 함께 보낸 시간이 언젠가 여러분의 직업 인생에서도 자랑스러운 시간으로 기억되었으면 좋겠습니다.</p>
      <p class="rc-letter-key"><strong>신뢰로 선택받고, 결과로 기억되는 치과.</strong></p>
      <p>그 길을 함께 걸어갈 동료를 기다립니다.</p>
      <p class="rc-sign">고수치과 대표원장 <b>조원익</b></p>
    </div>
  </div>
</section>

<section class="section rc-sec" id="recruit-07">
  <div class="section-inner">
    <div class="rc-head">
      <p class="rc-num" aria-hidden="true">07</p>
      <div>
        <h2 class="h-display"><span class="sr-only">07. </span>고수치과에서 함께 누릴 수 있는 것들</h2>
        <p class="rc-note"><em>세부 근무조건과 지원제도는 직무 및 채용 시점에 따라 달라질 수 있습니다.</em></p>
      </div>
    </div>
    <div class="rc-benefit-grid">
      <article class="rc-benefit">
        <h3>성장하는 환경</h3>
        <ul>
          <li>다양한 진료 분야를 경험할 수 있는 임상 환경</li>
          <li>원내 교육과 임상 지식 공유</li>
          <li>외부 세미나 교육비 지원</li>
          <li>디지털 장비와 새로운 진료 시스템을 배울 기회</li>
        </ul>
      </article>
      <article class="rc-benefit">
        <h3>서로를 존중하는 근무문화</h3>
        <ul>
          <li>명확한 역할과 책임을 바탕으로 한 팀워크</li>
          <li>불필요한 오버타임을 줄이기 위한 노력</li>
          <li>자유롭고 건강한 의견 교환</li>
          <li>동료의 전문성과 개인의 삶을 존중하는 문화</li>
        </ul>
      </article>
      <article class="rc-benefit">
        <h3>노력에 보답하는 보상과 지원</h3>
        <ul>
          <li>직무와 역량을 고려한 급여</li>
          <li>병원의 성과를 함께 나누는 인센티브 제도</li>
          <li>직원 대상 치과 진료 및 관련 복지 지원</li>
        </ul>
      </article>
    </div>
  </div>
</section>

<section class="section rc-sec rc-mist" id="recruit-08">
  <div class="rc-row">
    <p class="rc-num" aria-hidden="true">08</p>
    <div class="rc-body prose">
      <h2><span class="sr-only">08. </span>지금 채용 중이 아니어도 괜찮습니다.</h2>
      <p class="rc-key"><strong>좋은 인연에는 정해진 시기가 없다고 생각합니다.</strong></p>
      <p>현재 원하는 직무의 채용공고가 없더라도 고수치과의 방향에 공감하신다면 언제든 편하게 지원해 주세요.</p>
      <p>당장 함께하지 못하더라도, 새로운 동료가 필요한 순간 먼저 연락드릴 수 있도록 소중한 인연을 이어가겠습니다.</p>
    </div>
  </div>
</section>

<section class="section rc-apply" id="recruit-apply">
  <div class="rc-apply-inner">
    <div class="rc-apply-intro">
      <p class="eyebrow">Talent Pool</p>
      <h3 class="h-display">상시 인재풀 등록</h3>
      <dl class="rc-apply-info">
        <div><dt>모집 분야</dt><dd>치과위생사 / 간호조무사 / 데스크·상담 / 기타</dd></div>
        <div><dt>지원 시 필요한 정보</dt><dd>성함, 연락처, 지원 분야, 경력, 희망 입사 시기, 간단한 자기소개</dd></div>
      </dl>
      <p class="rc-apply-key"><strong>화려한 이력서보다, 함께 일하고 싶은 마음과 진솔한 이야기를 기다립니다.</strong></p>
      <a href="#recruit-form" class="hero-btn primary rc-apply-btn">고수치과 상시채용 지원하기</a>
      <address class="rc-contact">
        <p><i class="fas fa-location-dot" aria-hidden="true"></i> 충청남도 예산군 삽교읍 예학로 93, 대성빌딩 5층</p>
        <p><i class="fas fa-phone" aria-hidden="true"></i> 고수치과 | <a href="${SITE.telHref}">${SITE.tel}</a></p>
      </address>
    </div>
    <form class="form-card rc-form" id="recruit-form" data-ajax action="/api/recruit" method="POST">
      <p class="rc-form-title">지원서 작성 <span><span class="req">*</span> 필수 항목</span></p>
      <div class="rc-form-grid">
        <div class="form-group">
          <label for="rc-name">성함 <span class="req">*</span></label>
          <input id="rc-name" class="form-control" name="name" required maxlength="40" autocomplete="name" placeholder="홍길동">
        </div>
        <div class="form-group">
          <label for="rc-phone">연락처 <span class="req">*</span></label>
          <input id="rc-phone" class="form-control" name="phone" type="tel" required maxlength="20" autocomplete="tel" inputmode="tel" placeholder="010-0000-0000">
        </div>
      </div>
      <div class="form-group">
        <label for="rc-field">지원 분야 <span class="req">*</span></label>
        <select id="rc-field" class="form-control" name="field" required>
          <option value="">선택해주세요</option>
          ${RECRUIT_FIELDS.map((f) => html`<option value="${f}">${f}</option>`)}
        </select>
      </div>
      <div class="rc-form-grid">
        <div class="form-group">
          <label for="rc-exp">경력</label>
          <input id="rc-exp" class="form-control" name="experience" maxlength="200" placeholder="예: 치과위생사 3년 / 신입">
        </div>
        <div class="form-group">
          <label for="rc-start">희망 입사 시기</label>
          <input id="rc-start" class="form-control" name="start_date" maxlength="100" placeholder="예: 즉시 가능 / 2027년 1월">
        </div>
      </div>
      <div class="form-group">
        <label for="rc-intro">간단한 자기소개</label>
        <textarea id="rc-intro" class="form-control" name="intro" maxlength="2000" rows="6" placeholder="고수치과와 함께하고 싶은 이유나 나의 이야기를 편하게 적어주세요. (주민등록번호 등 민감한 정보는 적지 말아 주세요)"></textarea>
      </div>
      <div class="rc-hp" aria-hidden="true">
        <label for="rc-website">홈페이지(비워 두세요)</label>
        <input id="rc-website" name="website" tabindex="-1" autocomplete="off">
      </div>
      <div class="rc-consent">
        <p class="rc-consent-title">개인정보 수집·이용 안내</p>
        <ul>
          <li><b>수집 목적</b> 채용 전형 진행, 상시 인재풀 등록 및 채용 관련 연락</li>
          <li><b>수집 항목</b> 성함, 연락처, 지원 분야, 경력, 희망 입사 시기, 자기소개</li>
          <li><b>보유 기간</b> 채용 절차 종료 후 1년 또는 삭제 요청 시까지 (이후 지체 없이 파기)</li>
          <li>동의를 거부하실 수 있으며, 거부 시 온라인 지원 접수가 제한됩니다.</li>
        </ul>
        <label class="form-check">
          <input type="checkbox" name="privacy_consent" required>
          <span>[필수] 위 개인정보 수집·이용에 동의합니다.</span>
        </label>
      </div>
      <button type="submit" class="btn-submit">지원서 보내기</button>
    </form>
  </div>
</section>`

  return Layout(
    {
      title: '상시 인재채용 — 좋은 치과는 좋은 사람들이 만듭니다 | 고수치과의원',
      description:
        '고수치과 상시 인재채용. 치과위생사·간호조무사·데스크·상담 분야 상시 인재풀 등록을 받습니다. 같은 방향을 바라보고 함께 성장할 동료를 기다립니다. 내포신도시 고수치과.',
      path: '/recruit',
      ogImageAlt: '고수치과 상시 인재채용',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '상시 인재채용', path: '/recruit' }])],
    },
    content
  )
}
