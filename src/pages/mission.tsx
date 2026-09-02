import { html } from 'hono/html'
import { Layout, breadcrumbSchema } from '../layout'
import { SITE } from '../data/site'

export function missionPage() {
  const content = html`
<section class="hero" id="mission-hero" style="min-height:88svh">
  <div class="hero-bg" style="background-image:url('/static/img/interior-bookcafe.jpg')"></div>
  <div class="hero-veil"></div>
  <div class="hero-hanja" aria-hidden="true">信賴<b>固守</b></div>
  <span class="hero-seal" aria-hidden="true">信賴</span>
  <div class="hero-inner">
    <p class="hero-eyebrow">Mission &amp; Story</p>
    <h1 class="hero-title">
      <span class="line"><span>치과의사는</span></span>
      <span class="line"><span>한 사람의 <em>세상</em>을</span></span>
      <span class="line"><span>바꿀 수 있습니다</span></span>
    </h1>
    <p class="hero-sub">신뢰를 바탕으로 옳은 진료를 고수하며, 한 사람의 삶을 더 나은 방향으로 바꾼다 — 고수치과의 미션입니다.</p>
  </div>
  <div class="hero-scroll">Scroll</div>
</section>

<section class="quote-band" id="mission-quote-section">
  <blockquote class="reveal">지켜야 할 것을 오래도록 지키며, <br>어제보다 더 나은 <em>'고수'</em>가 되어가는 치과.</blockquote>
  <cite class="reveal reveal-d1">고수치과라는 이름의 약속</cite>
</section>

<section class="section" id="name-origin-section">
  <div class="section-narrow prose">
    <p class="eyebrow reveal">Why GOSU</p>
    <h2 class="h-display reveal reveal-d1">고수치과 이름에 담긴 <br>두 가지 <em>고수</em></h2>
    <div class="reveal reveal-d2">
      <p>개원을 결심했을 때 만들고 싶었던 것은 원장의 이름을 건 치과가 아니라, <strong>치과의사 조원익이 중요하다고 생각해온 진료의 원칙을 오래도록 고수(固守)할 수 있는 치과</strong>였습니다.</p>
      <p>비용이나 편의 때문에 치료의 질과 타협하기보다 좋은 결과를 고수하고, 치료를 먼저 권하기보다 환자분의 이야기를 충분히 듣고 정말 필요한 것이 무엇인지 함께 고민하는 환자 중심의 진료를 고수하고, 현재 알고 있는 것에 안주하지 않고 더 좋은 치료를 위해 끊임없이 배우는 배움과 성장을 고수하는 것.</p>
      <p>그리고 또 하나의 '고수'가 있습니다. 전국의 수많은 고수(高手) 치과의사들을 직접 찾아뵙고 배우면서 깨달았습니다 — 좋은 원칙을 오랫동안 固守하는 과정이 쌓이면, 언젠가는 환자분들에게 高手로 인정받을 수 있다는 것을.</p>
      <p>스스로를 '고수'라고 이야기하는 치과보다, 치료를 받고 난 환자분들이 <strong>"여기는 정말 믿고 맡길 수 있는 치과다"</strong>라고 이야기해 주시는 치과가 되고 싶습니다.</p>
    </div>
  </div>
</section>

<section class="section philosophy" id="mission-core-section">
  <div class="section-inner" style="text-align:center">
    <p class="eyebrow reveal" style="color:var(--sky);justify-content:center">Slogan</p>
    <h2 class="h-display reveal reveal-d1" style="color:#fff">치과 치료의 두려움을 <br><em style="color:var(--sky)">신뢰</em>로 바꾸는 치과</h2>
    <p class="lead reveal reveal-d2" style="color:rgba(255,255,255,0.72);margin:0 auto">
      '이 치료가 정말 나에게 필요한 걸까.' '이 치과의사를 믿어도 될까.' '치료하다가 아프면 내 이야기를 들어줄까.' <br><br>
      그런 마음들이 쌓여 치과에 대한 두려움이 됩니다. 반대로 환자의 이야기를 충분히 듣고, 필요한 치료를 정직하게 설명하고, 작은 치료 하나하나에서 믿음을 쌓아간다면 — 그 두려움을 신뢰로 바꿀 수 있다고 믿습니다.
    </p>
    <div class="phil-grid" style="text-align:left">
      <article class="phil-card reveal reveal-d1">
        <span class="phil-num">MISSION</span>
        <h3>신뢰 × 옳은 진료</h3>
        <p>신뢰를 바탕으로 옳은 진료를 고수하며, 한 사람의 삶을 더 나은 방향으로 바꿉니다.</p>
      </article>
      <article class="phil-card reveal reveal-d2">
        <span class="phil-num">VISION</span>
        <h3>결과로 기억되는 치과</h3>
        <p>신뢰로 선택받고, 결과로 기억되는 치과. 내포를 대표하는 올인원 진료 체계를 만들어갑니다.</p>
      </article>
      <article class="phil-card reveal reveal-d3">
        <span class="phil-num">VALUE</span>
        <h3>세 가지 고수</h3>
        <p>좋은 결과 · 환자 중심 진료 · 배움과 성장. 지켜야 할 것을 오래도록 지킵니다.</p>
      </article>
    </div>
  </div>
</section>

<section class="section" id="story-section">
  <div class="section-narrow prose">
    <p class="eyebrow reveal">A Patient Story</p>
    <h2 class="h-display reveal reveal-d1">이 문장을 쓰게 만든 <br>한 분의 <em>환자</em></h2>
    <div class="reveal reveal-d2">
      <p>오랫동안 기억에 남아 있는 40대 여성 환자분이 있습니다. 처음 오신 이유는 검게 변한 송곳니 하나였지만, 입안을 살펴보니 오랫동안 치료받지 못한 치아들이 여러 개 있었습니다.</p>
      <p>치료의 필요성을 몰라서가 아니었습니다. 오랫동안 가지고 있던 <strong>통증에 대한 두려움과 치과에 대한 불신</strong>이 치료를 계속 미루게 만들고 있었습니다.</p>
      <p>그래서 처음부터 많은 치료를 이야기하기보다, 가장 신경 쓰여 하셨던 그 송곳니 하나부터 치료해 드렸습니다. 그 작은 치료 하나가 첫 번째 신뢰가 되었고, 환자분의 속도에 맞춰 하나씩 — 결국 처음에는 엄두조차 내기 어려웠던 치료들을 모두 마칠 수 있었습니다.</p>
      <p>지금까지 가장 기억에 남는 변화는 치아가 아닙니다. <strong>어금니가 회복되고 식사가 편해진 뒤, 내원하실 때마다 얼굴에 살이 붙고 표정이 밝아지고 웃는 모습이 부쩍 많아지던 것</strong>입니다.</p>
      <p>아파서 제대로 먹지 못했던 사람이 다시 잘 먹고, 치아 때문에 웃지 못했던 사람이 더 자주 웃고, 무서워서 미뤄왔던 사람이 이제는 치과를 믿고 치료를 이어가는 것. 치과의사라는 직업에서 가장 큰 보람을 느끼는 순간입니다.</p>
      <p>치과의사 한 사람이 세상을 바꿀 수는 없습니다. 하지만 저는 굳게 믿습니다. <br><strong>치과의사는 한 사람의 세상을 바꿀 수 있습니다.</strong> 고수치과는 그런 진료를 고수하고 싶습니다.</p>
      <p style="margin-top:28px"><a href="https://blog.naver.com/vkdlxld0101/224325996270" target="_blank" rel="noopener" class="treat-more" style="font-size:16px">원장이 직접 쓴 신념글 전문 읽기 <i class="fas fa-arrow-up-right-from-square"></i></a></p>
    </div>
  </div>
</section>

<section class="section" id="region-promise-section" style="background:var(--brand-mist)">
  <div class="section-narrow prose">
    <p class="eyebrow reveal">For Naepo</p>
    <h2 class="h-display reveal reveal-d1">굳이 멀리 가지 않아도 <br>되는 <em>치과</em></h2>
    <div class="reveal reveal-d2">
      <p>내포·홍성·예산에 계신 환자분들도 좋은 치료를 받기 위해 멀리까지 찾아가지 않아도 되도록, 지역 안에서 충분히 신뢰하고 선택할 수 있는 치과를 만들고 싶습니다.</p>
      <p>쾌적하고 깨끗한 진료환경을 기본으로, 물방울레이저와 안면스캐너를 비롯한 디지털·레이저 장비, 원내 3D 프린팅 시스템까지 — 단순히 고가의 장비를 갖추기 위해서가 아니라 <strong>새로운 기술이 실제로 환자분의 불편을 줄이고 더 좋은 결과를 만드는 데 도움이 되는지</strong>를 고민해서 도입했습니다.</p>
      <p>그리고 이 모든 것의 중심에는 결국 사람이 있습니다. 원장과 직원 모두가 같은 기준으로 움직일 수 있는 체계적인 내부 교육 시스템과 진료 프로토콜을 만들어, 누가 진료를 돕더라도 일관되고 수준 높은 의료서비스를 경험하실 수 있도록 하겠습니다.</p>
      <p style="font-size:19px;font-weight:700;color:var(--sky-deep);font-family:var(--serif)">"우리 지역에도 충분히 믿고 치료받을 수 있는 치과가 있다." <br>환자분들이 그렇게 생각할 수 있는 선택지가 되겠습니다.</p>
    </div>
  </div>
</section>

<section class="section" id="mission-cta-section">
  <div class="section-inner">
    <div class="cta-band reveal">
      <h2>고수치과의 진료 이야기가 <br>더 궁금하시다면</h2>
      <p>대표원장이 직접 기록하는 성장 로그를 만나보세요.</p>
      <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative">
        <a href="${SITE.blog}" target="_blank" rel="noopener" class="hero-btn primary">원장 블로그 방문하기</a>
        <a href="/doctors" class="hero-btn outline">의료진 소개 보기</a>
      </div>
    </div>
  </div>
</section>`

  return Layout(
    {
      title: '병원미션 — 치과 치료의 두려움을 신뢰로 | 고수치과의원',
      description:
        '고수치과의 미션: 신뢰를 바탕으로 옳은 진료를 고수하며, 한 사람의 삶을 더 나은 방향으로 바꾼다. 좋은 결과·환자 중심 진료·배움과 성장, 세 가지를 고수하는 내포신도시 치과입니다.',
      path: '/mission',
      schema: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '병원미션', path: '/mission' }])],
    },
    content
  )
}
