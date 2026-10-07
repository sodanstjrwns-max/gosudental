// 고수 농구장 — 조원익 원장 요청 '홈페이지 게임' (2026-10-07)
// 치과의사 × 농구 미니게임 3종. 검색 색인 제외(noindex, follow) · 사이트맵·llms 미포함.
// 게임 로직은 public/static/game/*.js (Canvas 2D, 외부 라이브러리 없음).
import { html, raw } from 'hono/html'
import { Layout } from '../layout'
import { safeJson } from '../security'

export const GAME_ASSET_VERSION = '20261007-game'

type Tier = { min: number; title: string; desc?: string }
interface GameDef {
  slug: 'shootout' | 'dunk' | 'freethrow'
  name: string
  en: string
  tag: string
  desc: string
  rule: string
  keys: string
  how: string[]
  unit: string
  bestUnit: string
  tiers: Tier[]
  care: string
  careLink: { href: string; label: string }
  title: string
  description: string
  canvasLabel: string
}

export const GAMES: GameDef[] = [
  {
    slug: 'shootout',
    name: '충치 슛아웃',
    en: 'CAVITY SHOOTOUT',
    tag: '30초 · 콤보',
    desc: '불소볼을 당겼다 놓아, 치아 사이를 돌아다니는 충치균을 맞히세요. 3연속 적중부터 BURNING SHOT!',
    rule: '공을 뒤로 당겼다 놓으면 날아갑니다. 30초 동안 충치균을 최대한 많이 맞히세요.',
    keys: '키보드: ← → 조준 · ↑ ↓ 힘 · 스페이스/엔터 발사',
    how: [
      '화면 아래 공을 손가락(마우스)으로 뒤로 당겼다 놓으면 새총처럼 날아갑니다. 점선이 예상 궤적입니다.',
      '충치균을 맞히면 100점, 3연속 적중부터 BURNING SHOT 점수 2배, 5연속부터 3배입니다.',
      '시간이 지날수록 충치균이 빨라집니다. 한 번에 두 마리를 맞히면 보너스가 있어요.',
    ],
    unit: '점',
    bestUnit: '점',
    tiers: [
      { min: 4000, title: '충치균 사냥꾼', desc: '이 정도면 입안 수비 MVP예요.' },
      { min: 2000, title: '불소 슈터', desc: '콤보를 조금만 더 이어 보세요.' },
      { min: 700, title: '칫솔 루키', desc: '조준선 끝을 충치균 앞쪽에 두면 잘 맞아요.' },
      { min: 0, title: '몸 푸는 중', desc: '공을 크게 당길수록 멀리 날아갑니다.' },
    ],
    care: '충치 예방의 기본은 꼼꼼한 칫솔질과 6개월마다 받는 정기검진입니다. 초기 충치는 증상이 없는 경우가 많아요.',
    careLink: { href: '/treatments/preservation', label: '충치 · 신경치료 안내' },
    title: '충치 슛아웃 — 고수 농구장 미니게임 | 고수치과',
    description: '불소볼을 새총처럼 당겨 충치균을 맞히는 30초 미니게임. 고수치과 고수 농구장.',
    canvasLabel: '충치 슛아웃 게임 화면: 위쪽 입안의 치아 사이를 충치균이 움직이고, 아래에서 불소볼을 당겨 쏩니다.',
  },
  {
    slug: 'dunk',
    name: '임플란트 덩크',
    en: 'IMPLANT DUNK',
    tag: '3레벨 · 타이밍',
    desc: '오르내리는 게이지를 목표 구간에서 멈추면 고수 치아가 임플란트를 들고 덩크! 레벨이 오를수록 빨라집니다.',
    rule: '게이지가 하늘색 목표 구간에 왔을 때 탭하세요. 앞니 → 어금니 → 뼈이식 부위, 레벨마다 3번 도전합니다.',
    keys: '키보드: 스페이스/엔터로 게이지 멈추기',
    how: [
      '왼쪽 깊이 게이지가 오르내립니다. 진한 하늘색 칸에서 멈추면 PERFECT, 연한 칸이면 GOOD입니다.',
      '목표 구간을 벗어나면 픽스처가 흔들려요. 레벨이 오를수록 게이지가 빨라지고 목표 구간이 좁아집니다.',
      'PERFECT 300점, GOOD 150점에 레벨 배수(×1·×2·×3)가 붙습니다.',
    ],
    unit: '점',
    bestUnit: '점',
    tiers: [
      { min: 4500, title: '덩크 고수', desc: '타이밍 감각이 아주 좋아요.' },
      { min: 2700, title: '골밑 에이스', desc: '레벨 3에서 한 번만 더 PERFECT를 노려 보세요.' },
      { min: 1200, title: '덩크 연습생', desc: '게이지가 목표 칸에 들어오기 직전에 탭해 보세요.' },
      { min: 0, title: '몸 푸는 중', desc: '게이지의 리듬을 한 번 지켜본 뒤 눌러 보세요.' },
    ],
    care: '임플란트는 잇몸뼈의 양과 상태를 검사한 뒤 개인에 맞게 치료 계획을 세웁니다. 뼈이식이 필요한지도 검사로 확인합니다.',
    careLink: { href: '/treatments/implant', label: '임플란트 진료 안내' },
    title: '임플란트 덩크 — 고수 농구장 미니게임 | 고수치과',
    description: '파워 게이지 타이밍으로 임플란트를 잇몸뼈 골대에 덩크하는 3레벨 미니게임. 고수치과 고수 농구장.',
    canvasLabel: '임플란트 덩크 게임 화면: 왼쪽 깊이 게이지, 가운데 치아 캐릭터, 오른쪽 잇몸뼈 골대가 있습니다.',
  },
  {
    slug: 'freethrow',
    name: '자유투 교정',
    en: 'FREE THROW BRACES',
    tag: '10구 · 바람',
    desc: '각도와 힘을 차례로 정해 슛! 골인할 때마다 비뚤어진 치아에 브라켓이 붙고 하나씩 반듯해집니다.',
    rule: '첫 탭으로 각도, 두 번째 탭으로 힘을 정하면 슛합니다. 바람을 읽고 10구 안에 미소를 완성해 보세요.',
    keys: '키보드: 스페이스/엔터로 각도·힘 고정',
    how: [
      '빨간 화살표가 좌우로 움직일 때 한 번 탭하면 각도가, 아래 힘 막대가 차오를 때 한 번 더 탭하면 힘이 정해집니다.',
      '오른쪽 위 바람 표시(← →)만큼 공이 옆으로 밀립니다. 숫자가 클수록 바람이 셉니다.',
      '골인할 때마다 위쪽 치아 하나에 브라켓이 붙어 반듯하게 정렬됩니다. 노골이어도 다음 구로 넘어갑니다.',
    ],
    unit: '개',
    bestUnit: '개',
    tiers: [
      { min: 10, title: '완성된 미소', desc: '10개 치아가 모두 반듯해졌어요!' },
      { min: 7, title: '거의 완성된 미소', desc: '몇 개만 더 정렬하면 완성이에요.' },
      { min: 4, title: '교정 진행 중인 미소', desc: '바람 방향 반대쪽으로 살짝 조준해 보세요.' },
      { min: 0, title: '미소 준비 중', desc: '각도는 골대 쪽으로, 힘은 절반보다 조금 넘게!' },
    ],
    care: '치아 배열이 신경 쓰인다면 교정 상담에서 현재 상태부터 확인해 보세요. 교정 방법과 기간은 개인마다 다릅니다.',
    careLink: { href: '/treatments/ortho', label: '치아교정 진료 안내' },
    title: '자유투 교정 — 고수 농구장 미니게임 | 고수치과',
    description: '각도와 힘을 정해 자유투를 넣으면 비뚤어진 치아가 하나씩 정렬되는 10구 미니게임. 고수치과 고수 농구장.',
    canvasLabel: '자유투 교정 게임 화면: 위쪽에 비뚤어진 치아 10개, 가운데 골대, 아래에 공을 든 치아 캐릭터가 있습니다.',
  },
]

const DISCLAIMER = '고수 농구장은 재미로 즐기는 게임이며, 실제 진료 방법이나 치료 결과를 나타내지 않습니다. 치료 방법과 결과는 개인에 따라 차이가 있으므로 진료 전 의료진과 충분히 상담하시기 바랍니다.'

const ART: Record<GameDef['slug'], string> = {
  shootout: `<svg viewBox="0 0 320 180" aria-hidden="true" focusable="false"><rect x="34" y="18" width="252" height="104" rx="44" fill="#3a1f26" stroke="#101417" stroke-width="4"/><rect x="40" y="22" width="240" height="16" rx="8" fill="#e9b3b1"/><rect x="40" y="102" width="240" height="16" rx="8" fill="#e9b3b1"/><g fill="#fff" stroke="#101417" stroke-width="2.5"><rect x="56" y="36" width="34" height="30" rx="7"/><rect x="96" y="36" width="34" height="30" rx="7"/><rect x="136" y="36" width="34" height="30" rx="7"/><rect x="176" y="36" width="34" height="30" rx="7"/><rect x="216" y="36" width="34" height="30" rx="7"/><rect x="56" y="76" width="34" height="28" rx="7"/><rect x="96" y="76" width="34" height="28" rx="7"/><rect x="176" y="76" width="34" height="28" rx="7"/><rect x="216" y="76" width="34" height="28" rx="7"/></g><circle cx="152" cy="86" r="12" fill="#8c9a55" stroke="#4f5a2a" stroke-width="2.5"/><circle cx="148" cy="84" r="2.6" fill="#101417"/><circle cx="157" cy="84" r="2.6" fill="#101417"/><path d="M160 166 Q 150 140 154 120" fill="none" stroke="#337a99" stroke-width="3" stroke-dasharray="5 5"/><circle cx="160" cy="160" r="14" fill="#acd7e5" stroke="#101417" stroke-width="3"/><path d="M146 160h28M160 146v28M150 150q5 10 0 20M170 150q-5 10 0 20" fill="none" stroke="#101417" stroke-width="2"/></svg>`,
  dunk: `<svg viewBox="0 0 320 180" aria-hidden="true" focusable="false"><rect x="0" y="150" width="320" height="30" fill="#eef6fa"/><path d="M0 150h320" stroke="#101417" stroke-width="3"/><rect x="290" y="30" width="6" height="120" fill="#2e353b"/><rect x="266" y="30" width="18" height="70" rx="3" fill="#fff" stroke="#101417" stroke-width="2.5"/><rect x="200" y="72" width="66" height="70" rx="14" fill="#efe6d2" stroke="#101417" stroke-width="2.5"/><rect x="202" y="98" width="62" height="16" fill="#acd7e5" opacity=".8"/><rect x="196" y="66" width="74" height="13" rx="6" fill="#e9b3b1" stroke="#101417" stroke-width="2"/><ellipse cx="233" cy="62" rx="44" ry="6" fill="none" stroke="#b8382b" stroke-width="4"/><rect x="24" y="34" width="16" height="104" rx="8" fill="#fff" stroke="#101417" stroke-width="2.5"/><rect x="26" y="70" width="12" height="18" fill="#acd7e5"/><path d="M118 48l6 0 4 34h-14z" fill="#a9b4bc" stroke="#101417" stroke-width="2"/><rect x="115" y="40" width="12" height="9" rx="2" fill="#acd7e5" stroke="#101417" stroke-width="2"/><path d="M98 96c-6-22 6-30 14-27 6 2 10 2 16 0 8-3 20 5 14 27-3 14-4 26-7 40-2 7-9 7-10 0-2-12-4-16-8-16s-6 4-8 16c-1 7-8 7-10 0-3-14-4-26-1-40z" fill="#fff" stroke="#101417" stroke-width="3"/><circle cx="110" cy="96" r="2.6" fill="#101417"/><circle cx="126" cy="96" r="2.6" fill="#101417"/><path d="M112 104q6 7 12 0" fill="#101417"/></svg>`,
  freethrow: `<svg viewBox="0 0 320 180" aria-hidden="true" focusable="false"><path d="M20 28 Q160 58 300 28" fill="none" stroke="#e9b3b1" stroke-width="12" stroke-linecap="round"/><g fill="#fff" stroke="#101417" stroke-width="2.2"><rect x="30" y="34" width="22" height="26" rx="6" transform="rotate(-14 41 47)"/><rect x="58" y="40" width="22" height="26" rx="6" transform="rotate(10 69 53)"/><rect x="86" y="44" width="22" height="26" rx="6"/><rect x="114" y="46" width="22" height="26" rx="6"/><rect x="142" y="47" width="22" height="26" rx="6"/><rect x="170" y="47" width="22" height="26" rx="6"/><rect x="198" y="46" width="22" height="26" rx="6" transform="rotate(-12 209 59)"/><rect x="226" y="44" width="22" height="26" rx="6" transform="rotate(16 237 57)"/><rect x="254" y="40" width="22" height="26" rx="6" transform="rotate(-8 265 53)"/></g><path d="M86 57h106" stroke="#337a99" stroke-width="2"/><g fill="#a9b4bc" stroke="#101417" stroke-width="1.2"><rect x="92" y="53" width="9" height="7" rx="1.5"/><rect x="120" y="55" width="9" height="7" rx="1.5"/><rect x="148" y="56" width="9" height="7" rx="1.5"/><rect x="176" y="56" width="9" height="7" rx="1.5"/></g><rect x="122" y="88" width="76" height="44" rx="4" fill="#fff" stroke="#101417" stroke-width="2.5"/><ellipse cx="160" cy="130" rx="22" ry="5" fill="none" stroke="#b8382b" stroke-width="4"/><path d="M140 132l6 22M160 132v22M180 132l-6 22" stroke="#4d565e" stroke-width="1.4"/><circle cx="246" cy="146" r="13" fill="#acd7e5" stroke="#101417" stroke-width="3"/><path d="M233 146h26M246 133v26M237 137q5 9 0 18M255 137q-5 9 0 18" fill="none" stroke="#101417" stroke-width="2"/><path d="M234 132 Q 210 86 186 118" fill="none" stroke="#b8382b" stroke-width="3" stroke-dasharray="5 5"/></svg>`,
}

function gameBySlug(slug: string) {
  return GAMES.find((g) => g.slug === slug)
}

export function gameHubPage() {
  const content = html`
<link rel="stylesheet" href="/static/game/game.css?v=${GAME_ASSET_VERSION}">
<section class="gm-page" id="game-hub">
  <div class="gm-inner">
    <nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <span>고수 농구장</span></nav>
    <header class="gm-hub-head">
      <p class="eyebrow">GOSU COURT</p>
      <h1>고수 농구장</h1>
      <p>농구를 좋아하는 고수치과 원장님이 준비한 치과 미니게임 세 가지.<br>대기 시간에 가볍게 한 판, 최고 기록에 도전해 보세요.</p>
    </header>
    <div class="gm-cards">
      ${GAMES.map((g) => html`
      <a class="gm-card" href="/game/${g.slug}">
        <div class="gm-card-art">${raw(ART[g.slug])}</div>
        <div class="gm-card-body">
          <span class="gm-card-tag">${g.en} · ${g.tag}</span>
          <h2>${g.name}</h2>
          <p>${g.desc}</p>
          <div class="gm-card-foot">
            <span class="gm-card-best">최고 기록 <b data-best="${g.slug}" data-unit="${g.bestUnit}">-</b></span>
            <span class="gm-card-go">플레이 →</span>
          </div>
        </div>
      </a>`)}
    </div>
    <p class="gm-hub-note">최고 기록은 이 기기의 브라우저에만 저장되며 서버로 전송되지 않습니다. ${DISCLAIMER}</p>
  </div>
</section>
<script>
(function(){
  document.querySelectorAll('[data-best]').forEach(function(el){
    var v = 0;
    try { v = parseInt(localStorage.getItem('gosu-game-best-' + el.getAttribute('data-best')), 10) || 0; } catch (e) {}
    if (v > 0) el.textContent = v.toLocaleString('ko-KR') + el.getAttribute('data-unit');
  });
})();
</script>`

  return Layout(
    {
      title: '고수 농구장 — 치과 × 농구 미니게임 | 고수치과',
      description: '충치 슛아웃, 임플란트 덩크, 자유투 교정. 농구를 좋아하는 고수치과 원장님이 준비한 치과 미니게임 3종.',
      path: '/game',
      noindex: true,
      robots: 'noindex, follow',
      analytics: true,
      bodyClass: 'game-page',
    },
    content
  )
}

export function gamePlayPage(slug: string) {
  const g = gameBySlug(slug)
  if (!g) return null
  const others = GAMES.filter((x) => x.slug !== g.slug)
  const config = { unit: g.unit, bestUnit: g.bestUnit, tiers: g.tiers }
  const content = html`
<link rel="stylesheet" href="/static/game/game.css?v=${GAME_ASSET_VERSION}">
<section class="gm-page" id="game-${g.slug}">
  <div class="gm-inner">
    <div class="gm-top">
      <div>
        <nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <a href="/game">고수 농구장</a> / <span>${g.name}</span></nav>
        <h1 class="gm-title"><small>${g.en}</small>${g.name}</h1>
      </div>
      <a class="gm-back" href="/game">← 농구장</a>
    </div>

    <div class="gm-stage" id="gm-stage" data-game="${g.slug}" data-ink-off>
      <canvas class="gm-canvas" tabindex="0" role="img" aria-label="${g.canvasLabel}"></canvas>

      <div class="gm-panel" data-panel="start">
        <p class="gm-panel-kicker">고수 농구장 · ${g.tag}</p>
        <h2>${g.name}</h2>
        <p class="gm-rule">${g.rule}</p>
        <p class="gm-keys">${g.keys}</p>
        <button type="button" class="gm-btn" data-act="start">시작하기</button>
        <noscript><p class="gm-keys" style="margin-top:14px">게임을 하려면 브라우저의 JavaScript를 켜 주세요.</p></noscript>
      </div>

      <div class="gm-panel" data-panel="pause" hidden>
        <p class="gm-panel-kicker">PAUSE</p>
        <h2>잠시 멈춤</h2>
        <p class="gm-rule">다른 화면에 다녀오는 동안 게임을 멈춰 두었어요.</p>
        <button type="button" class="gm-btn" data-act="resume">계속하기</button>
      </div>

      <div class="gm-panel" data-panel="result" hidden aria-live="polite">
        <p class="gm-panel-kicker">RESULT</p>
        <p class="gm-result-tier" data-r="tier"></p>
        <p class="gm-result-tierdesc" data-r="tierdesc"></p>
        <p class="gm-score"><b data-r="score">0</b><span data-r="unit">${g.unit}</span></p>
        <p class="gm-newbest" data-r="newbest" hidden>최고 기록 갱신!</p>
        <p class="gm-detail" data-r="detail"></p>
        <p class="gm-bestrow">내 최고 기록 <strong data-r="best">0</strong></p>
        <div class="gm-actions">
          <button type="button" class="gm-btn" data-act="again">다시 하기</button>
        </div>
        <div class="gm-other">
          ${others.map((o) => html`<a href="/game/${o.slug}">${o.name} 하러 가기</a>`)}
          <a href="/game">농구장 홈</a>
        </div>
        <div class="gm-care">
          <p>${g.care}</p>
          <div class="gm-care-links">
            <a class="gm-res" href="/reservation">상담 예약하기 →</a>
            <a href="${g.careLink.href}">${g.careLink.label}</a>
          </div>
        </div>
      </div>
    </div>

    <div class="gm-help">
      <ul>${g.how.map((h) => html`<li>${h}</li>`)}</ul>
      <p class="gm-disclaimer">${DISCLAIMER}</p>
    </div>
  </div>
</section>
<script type="application/json" id="gm-config">${raw(safeJson(config))}</script>
<script src="/static/game/game-core.js?v=${GAME_ASSET_VERSION}" defer></script>
<script src="/static/game/${g.slug}.js?v=${GAME_ASSET_VERSION}" defer></script>`

  return Layout(
    {
      title: g.title,
      description: g.description,
      path: `/game/${g.slug}`,
      noindex: true,
      robots: 'noindex, follow',
      analytics: true,
      bodyClass: 'game-page',
    },
    content
  )
}
