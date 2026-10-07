/* 고수 농구장 ② 임플란트 덩크 — 파워 게이지를 목표 구간에서 멈춰 잇몸뼈에 픽스처 덩크 */
(function () {
  'use strict';
  var GG = window.GosuGame;
  if (!GG) return;
  var Draw = GG.Draw, C = GG.C, clamp = GG.clamp, lerp = GG.lerp, rand = GG.rand;

  var LEVELS = [
    { name: '레벨 1 · 앞니', speed: 0.5, hw: 0.13, boneW: 58 },
    { name: '레벨 2 · 어금니', speed: 0.72, hw: 0.1, boneW: 86 },
    { name: '레벨 3 · 뼈이식 부위', speed: 0.95, hw: 0.075, boneW: 92, graft: true },
  ];
  var TRIES = 3;
  var PERFECT_K = 0.4;   // 목표 반폭 중 PERFECT 비율
  var BASE = { perfect: 300, good: 150, wobble: 0 };
  var TOOTH = 74, FIX_LEN = 56;

  var S = {}, L = {};

  function layout(g) {
    var vh = g.VH;
    L.ground = vh - 58;
    L.hoopY = Math.max(150, vh * 0.34);
    L.cx = 286;
    L.boneTop = L.hoopY + 24;
    L.boneH = clamp(L.ground - L.boneTop - 90, 110, 160);
    L.startX = 112;
    L.gx = 34; L.gTop = Math.max(90, vh * 0.2); L.gBot = Math.min(L.ground - 40, vh * 0.66);
    L.gTop = Math.min(L.gTop, L.gBot - 160);
  }

  function lvl() { return LEVELS[S.level]; }

  function newTry() {
    S.phase = 'ready';
    S.pt = 0;
    S.gp = Math.random() * 2;
    S.target = rand(0.42, 0.78);
    S.tx = L.startX; S.feet = L.ground;
    S.fixTip = null; S.fixRot = 0; S.mood = 'happy';
    S.result = null;
  }

  function start(g) {
    S.level = 0; S.tryN = 0; S.score = 0;
    S.counts = { perfect: 0, good: 0, wobble: 0 };
    S.marks = [];
    S.banner = { text: LEVELS[0].name, t: 1.1 };
    newTry();
    S.phase = 'intro'; S.pt = 0;
  }

  function gaugeVal() { var ph = S.gp % 2; return ph < 1 ? ph : 2 - ph; }

  function tap(g) {
    if (S.phase !== 'ready') return;
    S.power = gaugeVal();
    var e = Math.abs(S.power - S.target), hw = lvl().hw;
    S.result = e <= hw * PERFECT_K ? 'perfect' : e <= hw ? 'good' : 'wobble';
    S.phase = 'jump'; S.pt = 0;
  }

  var JUMP_T = 0.55, SLAM_T = 0.32, FALL_T = 0.42, JUDGE_T = 1.0;

  function peakFeet() { return L.hoopY - 10 + TOOTH; }

  function update(g, dt, realDt) {
    S.pt += dt;
    if (S.banner && S.banner.t > 0) S.banner.t -= realDt;
    if (S.phase === 'intro') {
      if (S.pt > 0.9) { S.phase = 'ready'; S.pt = 0; }
      return;
    }
    if (S.phase === 'ready') {
      S.gp += dt * lvl().speed * 2;
      return;
    }
    if (S.phase === 'jump') {
      var e = Math.min(1, S.pt / JUMP_T);
      S.tx = lerp(L.startX, L.cx - 18, e);
      S.feet = L.ground - (L.ground - peakFeet()) * Math.sin(e * Math.PI / 2);
      S.mood = 'wow';
      if (e >= 1) {
        S.phase = 'slam'; S.pt = 0;
        S.fixTip = L.hoopY - 10;
        if (S.result === 'perfect') { g.timeScale = g.reduced ? 0.6 : 0.28; }
      }
      return;
    }
    if (S.phase === 'slam') {
      var k = Math.min(1, S.pt / SLAM_T);
      var depthY = L.boneTop + S.power * L.boneH;
      S.fixTip = lerp(L.hoopY - 10, depthY, 1 - Math.pow(1 - k, 3));
      if (k >= 1) {
        g.timeScale = 1;
        S.phase = 'fall'; S.pt = 0;
        judge(g);
      }
      return;
    }
    if (S.phase === 'fall') {
      var f = Math.min(1, S.pt / FALL_T);
      S.feet = lerp(peakFeet(), L.ground, f * f);
      S.tx = L.cx - 18 - f * 40;
      if (f >= 1) { S.phase = 'judge'; S.pt = 0; }
      return;
    }
    if (S.phase === 'judge') {
      if (S.result === 'wobble') S.fixRot = Math.sin(g.t * 18) * 0.12 * Math.max(0, 1 - S.pt);
      if (S.pt > JUDGE_T) next(g);
    }
  }

  function judge(g) {
    var r = S.result, mult = S.level + 1;
    var pts = BASE[r] * mult;
    S.score += pts;
    S.counts[r]++;
    S.marks.push(r);
    var y = L.boneTop - 40;
    if (r === 'perfect') {
      S.mood = 'joy';
      g.float('PERFECT 골유착!', 200, y - 30, C.seal, 28);
      g.float('+' + pts, L.cx, y, C.seal, 22);
      g.burst(L.cx, L.boneTop, C.sky, 26, 260, 3.4);
      g.burst(L.cx, L.boneTop, '#ffffff', 14, 200, 3);
      g.burst(L.cx, L.boneTop, C.sealSoft, 8, 220, 2.6);
      g.shake(9, 0.3);
      g.flash(0.16);
    } else if (r === 'good') {
      S.mood = 'happy';
      g.float('GOOD', 200, y - 30, C.skyDeep, 26);
      g.float('+' + pts, L.cx, y, C.skyDeep, 20);
      g.burst(L.cx, L.boneTop, C.sky, 12, 180, 3);
      g.shake(4, 0.18);
    } else {
      S.mood = 'worry';
      g.float('흔들림…', 200, y - 30, C.inkMute, 24);
      g.float(S.power < S.target ? '조금 얕아요' : '조금 깊어요', L.cx, y, C.inkMute, 16);
    }
  }

  function next(g) {
    S.tryN++;
    if (S.tryN >= TRIES) {
      S.tryN = 0; S.level++;
      if (S.level >= LEVELS.length) {
        S.level = LEVELS.length - 1;
        S.phase = 'done';
        g.end({
          score: S.score,
          detail: 'PERFECT ' + S.counts.perfect + ' · GOOD ' + S.counts.good + ' · 흔들림 ' + S.counts.wobble,
          delay: 300,
        });
        return;
      }
      S.marks = [];
      S.banner = { text: LEVELS[S.level].name, t: 1.1 };
      newTry();
      S.phase = 'intro'; S.pt = 0;
      return;
    }
    newTry();
  }

  /* ── 그리기 ── */
  function drawFixture(ctx, x, tipY, rot) {
    ctx.save();
    ctx.translate(x, tipY);
    if (rot) ctx.rotate(rot);
    // 나사 몸통(아래가 끝)
    ctx.beginPath();
    ctx.moveTo(-4, 0); ctx.lineTo(4, 0);
    ctx.lineTo(7.5, -FIX_LEN + 12); ctx.lineTo(-7.5, -FIX_LEN + 12);
    ctx.closePath();
    var gr = ctx.createLinearGradient(-8, 0, 8, 0);
    gr.addColorStop(0, C.metalDeep); gr.addColorStop(0.45, '#dfe5e9'); gr.addColorStop(1, C.metal);
    ctx.fillStyle = gr; ctx.fill();
    ctx.lineWidth = 1.6; ctx.strokeStyle = C.ink; ctx.stroke();
    // 나사산
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
    for (var y = -5; y > -FIX_LEN + 14; y -= 5.5) {
      var w = 4 + (-y / (FIX_LEN - 12)) * 3.5;
      ctx.beginPath(); ctx.moveTo(-w - 1.5, y + 1.6); ctx.lineTo(w + 1.5, y - 1.6); ctx.stroke();
    }
    // 지대주(머리)
    Draw.roundRect(ctx, -6, -FIX_LEN, 12, 12, 2);
    ctx.fillStyle = C.sky; ctx.fill();
    ctx.lineWidth = 1.6; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
  }

  function drawHoop(g, ctx) {
    var lv = lvl(), bw = lv.boneW;
    var x0 = L.cx - bw / 2;
    // 기둥·백보드
    ctx.save();
    ctx.fillStyle = C.ink2;
    ctx.fillRect(372, L.hoopY - 120, 7, L.ground - L.hoopY + 120);
    Draw.roundRect(ctx, 340, L.hoopY - 110, 22, 100, 3);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillRect(352, L.hoopY - 22, 22, 6);
    // 잇몸뼈 '골대'
    var top = L.boneTop, h = L.boneH;
    Draw.roundRect(ctx, x0, top, bw, h, 18);
    ctx.fillStyle = C.bone; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    // 해면골 무늬
    ctx.save();
    Draw.roundRect(ctx, x0, top, bw, h, 18); ctx.clip();
    ctx.fillStyle = C.boneDeep;
    for (var i = 0; i < 26; i++) {
      var px = x0 + ((i * 37) % bw), py = top + 24 + ((i * 53) % (h - 24));
      ctx.beginPath(); ctx.ellipse(px, py, 4, 2.6, (i % 3) * 0.7, 0, Math.PI * 2); ctx.fill();
    }
    if (lv.graft) {
      ctx.fillStyle = 'rgba(51,122,153,0.35)';
      for (var j = 0; j < 22; j++) {
        var gx = x0 + 10 + ((j * 29) % (bw - 20)), gy = top + 30 + ((j * 41) % (h * 0.55));
        ctx.beginPath(); ctx.arc(gx, gy, 3.2, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
    // 목표 구간
    if (S.phase !== 'done') {
      var ty0 = top + (S.target - lv.hw) * h, ty1 = top + (S.target + lv.hw) * h;
      ctx.fillStyle = 'rgba(172,215,229,0.55)';
      ctx.fillRect(x0 + 2, ty0, bw - 4, ty1 - ty0);
      ctx.setLineDash([5, 4]); ctx.strokeStyle = C.skyDeep; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x0, ty0); ctx.lineTo(x0 + bw, ty0); ctx.moveTo(x0, ty1); ctx.lineTo(x0 + bw, ty1); ctx.stroke();
      ctx.setLineDash([]);
      Draw.text(ctx, '목표', x0 - 8, (ty0 + ty1) / 2, { align: 'right', size: 12, color: C.skyDeep, weight: 700 });
    }
    // 잇몸
    Draw.roundRect(ctx, x0 - 4, top - 6, bw + 8, 18, 9);
    ctx.fillStyle = C.gum; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
  }

  function drawRimFront(ctx) {
    var bw = lvl().boneW + 26;
    ctx.save();
    ctx.lineWidth = 5; ctx.strokeStyle = C.seal;
    ctx.beginPath(); ctx.ellipse(L.cx, L.hoopY, bw / 2, 7, 0, 0, Math.PI); ctx.stroke();
    ctx.restore();
  }
  function drawRimBack(ctx) {
    var bw = lvl().boneW + 26;
    ctx.save();
    ctx.lineWidth = 5; ctx.strokeStyle = C.seal;
    ctx.beginPath(); ctx.ellipse(L.cx, L.hoopY, bw / 2, 7, 0, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = C.ink2;
    ctx.beginPath(); ctx.moveTo(L.cx + bw / 2, L.hoopY); ctx.lineTo(352, L.hoopY - 18); ctx.stroke();
    ctx.restore();
  }

  function drawGauge(g, ctx) {
    var lv = lvl();
    var x = L.gx, t = L.gTop, b = L.gBot, h = b - t, w = 22;
    ctx.save();
    Draw.roundRect(ctx, x - w / 2, t, w, h, 11);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    // 목표대 (게이지 아래=얕게, 위=깊게)
    var y0 = b - (S.target + lv.hw) * h, y1 = b - (S.target - lv.hw) * h;
    ctx.fillStyle = 'rgba(172,215,229,0.9)';
    ctx.fillRect(x - w / 2 + 2, y0, w - 4, y1 - y0);
    var py0 = b - (S.target + lv.hw * PERFECT_K) * h, py1 = b - (S.target - lv.hw * PERFECT_K) * h;
    ctx.fillStyle = C.skyDeep;
    ctx.fillRect(x - w / 2 + 2, py0, w - 4, py1 - py0);
    var v = S.phase === 'ready' || S.phase === 'intro' ? gaugeVal() : (S.power == null ? 0 : S.power);
    var my = b - v * h;
    ctx.fillStyle = C.seal;
    ctx.beginPath(); ctx.moveTo(x + w / 2 + 2, my); ctx.lineTo(x + w / 2 + 14, my - 8); ctx.lineTo(x + w / 2 + 14, my + 8); ctx.closePath(); ctx.fill();
    ctx.fillRect(x - w / 2 - 2, my - 2, w + 4, 4);
    ctx.restore();
    Draw.text(ctx, '깊이', x, t - 14, { size: 12, color: C.inkSoft, weight: 700 });
  }

  function drawTooth(g, ctx) {
    var s = TOOTH, cx = S.tx, cy = S.feet - s * 0.5;
    var squash = S.phase === 'ready' ? 1 + Math.sin(g.t * 6) * 0.02 : 1;
    // 그림자
    ctx.save();
    ctx.fillStyle = 'rgba(16,20,23,0.12)';
    var sh = clamp(1 - (L.ground - S.feet) / 300, 0.3, 1);
    ctx.beginPath(); ctx.ellipse(cx, L.ground + 4, 26 * sh, 5 * sh, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // 팔
    ctx.save();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
    var holding = S.phase === 'ready' || S.phase === 'intro' || S.phase === 'jump';
    var hx = cx + 4, hy = cy - s * 0.5 - 4;
    if (holding) {
      ctx.beginPath(); ctx.moveTo(cx - s * 0.36, cy - s * 0.05); ctx.quadraticCurveTo(cx - s * 0.3, cy - s * 0.5, hx - 4, hy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + s * 0.36, cy - s * 0.05); ctx.quadraticCurveTo(cx + s * 0.34, cy - s * 0.5, hx + 4, hy); ctx.stroke();
    } else if (S.phase === 'slam') {
      ctx.beginPath(); ctx.moveTo(cx + s * 0.36, cy - s * 0.1); ctx.lineTo(L.cx - 10, L.hoopY + 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - s * 0.36, cy - s * 0.05); ctx.lineTo(cx - s * 0.5, cy - s * 0.4); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(cx - s * 0.36, cy); ctx.lineTo(cx - s * 0.52, cy - s * (S.mood === 'joy' ? 0.5 : 0.1)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + s * 0.36, cy); ctx.lineTo(cx + s * 0.52, cy - s * (S.mood === 'joy' ? 0.5 : 0.1)); ctx.stroke();
    }
    // 다리
    ctx.beginPath(); ctx.moveTo(cx - 9, S.feet - s * 0.05); ctx.lineTo(cx - 11, S.feet); ctx.moveTo(cx + 9, S.feet - s * 0.05); ctx.lineTo(cx + 11, S.feet); ctx.stroke();
    ctx.restore();
    Draw.tooth(ctx, cx, cy, s, { mood: S.mood, sy: squash, sx: 2 - squash, blink: S.phase === 'ready' && (g.t % 3.2) < 0.12 });
    // 들고 있는 픽스처(머리 위)
    if (holding) drawFixture(ctx, hx, hy + 6 - 2, 0);
  }

  function draw(g, ctx) {
    Draw.paperBg(ctx, g.VH, g.t);
    // 코트 바닥
    ctx.fillStyle = C.skyMist; ctx.fillRect(0, L.ground, 400, g.VH - L.ground);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, L.ground); ctx.lineTo(400, L.ground); ctx.stroke();
    ctx.strokeStyle = C.skyLine; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(L.cx + 40, L.ground + 2, 120, Math.PI, Math.PI * 1.5); ctx.stroke();
    if (!S.phase) { layoutDefaults(); }
    drawRimBack(ctx);
    drawHoop(g, ctx);
    if (S.fixTip != null) drawFixture(ctx, L.cx, S.fixTip, S.fixRot);
    drawRimFront(ctx);
    drawGauge(g, ctx);
    drawTooth(g, ctx);
    // HUD
    if (g.state !== 'start') {
      Draw.text(ctx, (S.score || 0).toLocaleString('ko-KR') + '점', 16, 24, { align: 'left', size: 20 });
      Draw.text(ctx, lvl().name, 384, 24, { align: 'right', size: 15, color: C.skyDeep });
      for (var i = 0; i < TRIES; i++) {
        var m = S.marks[i];
        ctx.beginPath(); ctx.arc(22 + i * 18, 50, 6, 0, Math.PI * 2);
        ctx.fillStyle = m === 'perfect' ? C.seal : m === 'good' ? C.skyDeep : m === 'wobble' ? C.inkMute : '#fff';
        ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = C.ink; ctx.stroke();
      }
      if (S.phase === 'ready' && S.tryN === 0 && S.level === 0) {
        Draw.text(ctx, '탭 · 스페이스로 멈추기', 200, L.ground + 30, { size: 14, color: C.inkSoft, weight: 700 });
      }
    }
    if (S.banner && S.banner.t > 0 && g.state === 'play') {
      var a = Math.min(1, S.banner.t * 3);
      ctx.save(); ctx.globalAlpha = a;
      Draw.roundRect(ctx, 70, g.VH * 0.12, 260, 46, 4);
      ctx.fillStyle = C.ink; ctx.fill();
      ctx.restore();
      Draw.text(ctx, S.banner.text, 200, g.VH * 0.12 + 23, { size: 19, color: '#fff', alpha: a });
    }
  }

  function layoutDefaults() {
    S.level = 0; S.tryN = 0; S.score = 0; S.marks = [];
    S.target = 0.6; S.tx = L.startX; S.feet = L.ground; S.mood = 'happy'; S.phase = 'idle'; S.gp = 0.3;
  }

  GG.run({
    id: 'dunk',
    init: function () {},
    layout: function (g) {
      layout(g);
      if (!S.phase || S.phase === 'idle') layoutDefaults();
      else if (S.phase === 'ready' || S.phase === 'intro' || S.phase === 'judge') { S.feet = L.ground; }
    },
    start: start,
    update: update,
    draw: draw,
    down: function (g) { tap(g); },
    key: function (g, k, repeat) { if (!repeat && (k === ' ' || k === 'Enter')) tap(g); },
  });
  if (window.__gosuGame) window.__gosuGame.debug = { S: S, L: L, gaugeVal: gaugeVal, level: lvl };
})();
