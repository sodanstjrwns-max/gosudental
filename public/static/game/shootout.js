/* 고수 농구장 ① 충치 슛아웃 — 30초 동안 불소볼로 충치균 맞히기 */
(function () {
  'use strict';
  var GG = window.GosuGame;
  if (!GG) return;
  var Draw = GG.Draw, C = GG.C, clamp = GG.clamp, rand = GG.rand;

  var DURATION = 30;
  var GRAV = 900;
  var K = 7;            // 당긴 거리 → 속도 배율
  var MAXPULL = 150;
  var BALL_R = 17;

  var S = {};           // 게임 상태
  var L = {};           // 레이아웃

  function layout(g) {
    var vh = g.VH;
    L.mx = 14; L.mw = 372;
    L.top = 50;
    L.bot = Math.max(L.top + 230, vh * 0.52);
    L.mh = L.bot - L.top;
    L.gum = 18;
    L.th = clamp(L.mh * 0.2, 40, 70);
    L.upperY = L.top + L.gum;                  // 윗니 뿌리선
    L.lowerY = L.bot - L.gum;                  // 아랫니 뿌리선
    L.zoneTop = L.upperY + L.th + 18;
    L.zoneBot = L.lowerY - L.th - 18;
    L.lanes = [lerpZone(0.2), lerpZone(0.55), lerpZone(0.88)];
    L.homeX = 200; L.homeY = vh - 74;
    L.teeth = [];
    var n = 6, gap = 5, tw = (L.mw - 30 - gap * (n - 1)) / n;
    for (var i = 0; i < n; i++) {
      var cx = L.mx + 15 + tw / 2 + i * (tw + gap);
      L.teeth.push({ x: cx, w: tw, upper: true, shine: 0 });
      L.teeth.push({ x: cx, w: tw, upper: false, shine: 0 });
    }
    if (S.teeth) L.teeth.forEach(function (t, i) { t.shine = S.teeth[i] ? S.teeth[i].shine : 0; });
    S.teeth = L.teeth;
    if (S.germs) S.germs.forEach(function (gm) { gm.y0 = L.lanes[gm.lane]; });
  }
  function lerpZone(k) { return L.zoneTop + (L.zoneBot - L.zoneTop) * k; }

  function speedFactor(g) { return 1 + Math.min(1, g.time / DURATION) * 1.7; }

  function spawnGerm(g) {
    var lane = Math.floor(Math.random() * L.lanes.length);
    var dir = Math.random() < 0.5 ? -1 : 1;
    S.germs.push({
      x: rand(70, 330), y: L.lanes[lane], y0: L.lanes[lane], lane: lane,
      vx: dir * rand(55, 85), ph: Math.random() * 6, r: 17, born: 0, dying: -1, seed: Math.random() * 10,
    });
  }

  function start(g) {
    S.score = 0; S.combo = 0; S.maxCombo = 0; S.hits = 0; S.shots = 0;
    S.germs = []; S.balls = []; S.respawn = [];
    S.drag = null; S.ready = 0; S.burnT = 0;
    S.kAng = 0; S.kPow = 0.78; S.kShow = false;
    S.teeth.forEach(function (t) { t.shine = 0; });
    for (var i = 0; i < 3; i++) spawnGerm(g);
  }

  function shoot(g, vx, vy) {
    if (S.ready > 0 || S.balls.length >= 3) return false;
    S.balls.push({ x: L.homeX, y: L.homeY, vx: vx, vy: vy, rot: 0, life: 0, hit: 0 });
    S.shots++;
    S.ready = 0.2;
    return true;
  }

  function toothNear(x, y) {
    var best = null, bd = 1e9;
    for (var i = 0; i < S.teeth.length; i++) {
      var t = S.teeth[i];
      var ty = t.upper ? L.upperY + L.th / 2 : L.lowerY - L.th / 2;
      var d = Math.abs(t.x - x) + Math.abs(ty - y) * 0.6;
      if (d < bd) { bd = d; best = t; }
    }
    return best;
  }

  function multFor(combo) { return combo >= 5 ? 3 : combo >= 3 ? 2 : 1; }

  function hitGerm(g, b, gm) {
    gm.dying = 0;
    if (!b.hit) {
      S.combo++;
      S.maxCombo = Math.max(S.maxCombo, S.combo);
      if (S.combo === 3) {
        S.burnT = 1.3;
        g.float('BURNING SHOT ×2', 200, L.bot + 40, C.seal, 26);
        g.flash(0.12);
      } else if (S.combo === 5) {
        S.burnT = 1.3;
        g.float('BURNING SHOT ×3', 200, L.bot + 40, C.seal, 28);
        g.flash(0.12);
      }
    }
    b.hit++;
    S.hits++;
    var m = multFor(S.combo);
    var pts = 100 * m + (b.hit > 1 ? 50 : 0);
    S.score += pts;
    g.float('+' + pts + (b.hit > 1 ? ' 더블!' : ''), gm.x, gm.y - 24, m > 1 ? C.seal : C.skyDeep, m > 1 ? 22 : 19);
    g.burst(gm.x, gm.y, C.germ, 10, 170, 3.2);
    g.burst(gm.x, gm.y, C.sky, 8, 200, 2.6);
    g.shake(m > 1 ? 6 : 3, 0.18);
    var t = toothNear(gm.x, gm.y);
    if (t) t.shine = 1;
    S.respawn.push(0.55);
  }

  function update(g, dt) {
    var sf = speedFactor(g);
    if (S.ready > 0) S.ready -= dt;
    if (S.burnT > 0) S.burnT -= dt;
    // 충치균
    for (var i = S.germs.length - 1; i >= 0; i--) {
      var gm = S.germs[i];
      if (gm.dying >= 0) {
        gm.dying += dt;
        if (gm.dying > 0.35) S.germs.splice(i, 1);
        continue;
      }
      gm.born += dt;
      gm.ph += dt * (3 + sf);
      gm.x += gm.vx * sf * dt;
      if (gm.x < 40) { gm.x = 40; gm.vx = Math.abs(gm.vx); }
      if (gm.x > 360) { gm.x = 360; gm.vx = -Math.abs(gm.vx); }
      if (Math.random() < 0.004 * sf) gm.vx = -gm.vx;   // 가끔 방향 전환
      gm.y = gm.y0 + Math.sin(gm.ph) * 7;
    }
    var want = Math.min(5, 3 + Math.floor(g.time / 9));
    var living = S.germs.filter(function (x) { return x.dying < 0; }).length + S.respawn.length;
    while (living < want) { S.respawn.push(0.3); living++; }
    for (var r = S.respawn.length - 1; r >= 0; r--) {
      S.respawn[r] -= dt;
      if (S.respawn[r] <= 0) { S.respawn.splice(r, 1); spawnGerm(g); }
    }
    // 공
    for (var j = S.balls.length - 1; j >= 0; j--) {
      var b = S.balls[j];
      b.life += dt;
      b.vy += GRAV * dt;
      b.x += b.vx * dt; b.y += b.vy * dt;
      b.rot += b.vx * dt * 0.03;
      var br = ballR(b.y);
      for (var k = 0; k < S.germs.length; k++) {
        var gm2 = S.germs[k];
        if (gm2.dying >= 0 || gm2.born < 0.25) continue;
        var dx = gm2.x - b.x, dy = gm2.y - b.y;
        if (dx * dx + dy * dy < (gm2.r + br * 0.85) * (gm2.r + br * 0.85)) hitGerm(g, b, gm2);
      }
      if (S.combo >= 3 && Math.random() < 0.5) g.burst(b.x, b.y + br * 0.6, Math.random() < 0.5 ? C.sealSoft : C.sky, 1, 40, 2.6);
      var out = b.y > g.VH + 40 || b.x < -40 || b.x > 440 || b.life > 2.6 || (b.vy > 0 && b.y > L.homeY + 10);
      if (out) {
        if (!b.hit) {
          if (S.combo >= 3) g.float('콤보 끊김', 200, L.bot + 40, C.inkMute, 16);
          S.combo = 0;
        }
        S.balls.splice(j, 1);
      }
    }
    S.teeth.forEach(function (t) { if (t.shine > 0) t.shine = Math.max(0, t.shine - dt * 1.4); });
    if (g.time >= DURATION) {
      g.end({
        score: S.score,
        detail: '적중 ' + S.hits + '회 · 슛 ' + S.shots + '회 · 최대 콤보 ' + S.maxCombo,
      });
    }
  }

  function ballR(y) {
    var k = clamp((y - L.zoneTop) / (L.homeY - L.zoneTop), 0, 1);
    return BALL_R * (0.62 + 0.38 * k);
  }

  /* ── 입력 ── */
  function pullVec(p) {
    var dx = S.drag.x - p.x, dy = S.drag.y - p.y;
    var len = Math.hypot(dx, dy);
    if (len > MAXPULL) { dx *= MAXPULL / len; dy *= MAXPULL / len; len = MAXPULL; }
    return { dx: dx, dy: dy, len: len };
  }
  function down(g, p) { S.drag = { x: p.x, y: p.y, cx: p.x, cy: p.y }; S.kShow = false; }
  function move(g, p) { if (S.drag) { S.drag.cx = p.x; S.drag.cy = p.y; } }
  function up(g, p, cancel) {
    if (!S.drag) return;
    S.drag.cx = p.x; S.drag.cy = p.y;
    var v = pullVec({ x: p.x, y: p.y });
    S.drag = null;
    if (cancel || v.len < 16 || v.dy > -4 && Math.abs(v.dx) < 4) return;
    shoot(g, v.dx * K, v.dy * K);
  }
  function key(g, k) {
    S.kShow = true;
    if (k === 'ArrowLeft') S.kAng = clamp(S.kAng - 0.05, -0.7, 0.7);
    else if (k === 'ArrowRight') S.kAng = clamp(S.kAng + 0.05, -0.7, 0.7);
    else if (k === 'ArrowUp') S.kPow = clamp(S.kPow + 0.04, 0.45, 1);
    else if (k === 'ArrowDown') S.kPow = clamp(S.kPow - 0.04, 0.45, 1);
    else {
      var sp = S.kPow * MAXPULL * K;
      shoot(g, Math.sin(S.kAng) * sp, -Math.cos(S.kAng) * sp);
    }
  }
  function aimVel() {
    if (S.drag) {
      var v = pullVec({ x: S.drag.cx, y: S.drag.cy });
      if (v.len < 8) return null;
      return { vx: v.dx * K, vy: v.dy * K, pull: v };
    }
    if (S.kShow) {
      var sp = S.kPow * MAXPULL * K;
      return { vx: Math.sin(S.kAng) * sp, vy: -Math.cos(S.kAng) * sp, pull: null };
    }
    return null;
  }

  /* ── 그리기 ── */
  function drawMouth(g, ctx) {
    // 입술 바깥 먹선
    ctx.save();
    Draw.roundRect(ctx, L.mx, L.top - 6, L.mw, L.mh + 12, 70);
    ctx.fillStyle = C.mouth; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    // 혀
    ctx.beginPath();
    ctx.ellipse(200, L.lowerY - L.th * 0.3, 140, L.mh * 0.22, 0, Math.PI, 0);
    ctx.fillStyle = '#7a3a45'; ctx.fill();
    // 잇몸
    Draw.roundRect(ctx, L.mx + 6, L.top - 2, L.mw - 12, L.gum + 10, 30);
    ctx.fillStyle = C.gum; ctx.fill();
    Draw.roundRect(ctx, L.mx + 6, L.lowerY - 8, L.mw - 12, L.gum + 10, 30);
    ctx.fill();
    ctx.restore();
    // 치아
    var near = S.germs || [];
    for (var i = 0; i < S.teeth.length; i++) {
      var t = S.teeth[i];
      var worry = false;
      for (var k = 0; k < near.length; k++) if (near[k].dying < 0 && Math.abs(near[k].x - t.x) < 34) { worry = true; break; }
      drawIncisor(ctx, t, worry);
    }
  }
  function drawIncisor(ctx, t, worry) {
    var w = t.w, h = L.th;
    var x = t.x - w / 2;
    var y = t.upper ? L.upperY : L.lowerY - h;
    ctx.save();
    if (t.shine > 0) {
      ctx.shadowColor = 'rgba(184,230,245,' + (0.9 * t.shine).toFixed(2) + ')';
      ctx.shadowBlur = 18 * t.shine;
    }
    ctx.beginPath();
    if (t.upper) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h - 12);
      ctx.quadraticCurveTo(x + w, y + h, x + w - 12, y + h);
      ctx.lineTo(x + 12, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - 12);
    } else {
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + 12);
      ctx.quadraticCurveTo(x + w, y, x + w - 12, y);
      ctx.lineTo(x + 12, y);
      ctx.quadraticCurveTo(x, y, x, y + 12);
    }
    ctx.closePath();
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2.4; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
    Draw.face(ctx, t.x, y + h * (t.upper ? 0.55 : 0.45), w * 1.15, t.shine > 0.2 ? 'joy' : worry ? 'worry' : 'happy');
    if (t.shine > 0) Draw.sparkle(ctx, t.x + w * 0.3, y + h * (t.upper ? 0.25 : 0.2), 8 * t.shine + 3, t.shine);
  }

  function drawGerm(ctx, gm, tm) {
    var k = gm.dying >= 0 ? gm.dying / 0.35 : 0;
    var pop = gm.born < 0.25 ? gm.born / 0.25 : 1;
    var r = gm.r * pop * (1 + k * 0.6);
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.translate(gm.x, gm.y);
    if (gm.vx < 0) ctx.scale(-1, 1);
    // 뿔
    ctx.fillStyle = C.seal;
    ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.75); ctx.lineTo(-r * 0.25, -r * 1.35); ctx.lineTo(-r * 0.05, -r * 0.8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(r * 0.5, -r * 0.75); ctx.lineTo(r * 0.25, -r * 1.35); ctx.lineTo(r * 0.05, -r * 0.8); ctx.fill();
    // 울퉁불퉁 몸
    ctx.beginPath();
    for (var i = 0; i <= 18; i++) {
      var a = (i / 18) * Math.PI * 2;
      var rr = r * (1 + 0.12 * Math.sin(a * 5 + tm * 6 + gm.seed));
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fillStyle = C.germ; ctx.fill();
    ctx.lineWidth = 2.4; ctx.strokeStyle = C.germDeep; ctx.stroke();
    // 점박이
    ctx.fillStyle = 'rgba(79,90,42,0.45)';
    ctx.beginPath(); ctx.arc(-r * 0.45, r * 0.35, r * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.5, r * 0.45, r * 0.11, 0, Math.PI * 2); ctx.fill();
    // 눈 + 성난 눈썹
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-r * 0.32, -r * 0.1, r * 0.24, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.32, -r * 0.1, r * 0.24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(-r * 0.26, -r * 0.06, r * 0.11, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.38, -r * 0.06, r * 0.11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-r * 0.55, -r * 0.42); ctx.lineTo(-r * 0.12, -r * 0.28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.55, -r * 0.42); ctx.lineTo(r * 0.12, -r * 0.28); ctx.stroke();
    // 이빨 드러낸 입
    ctx.beginPath(); ctx.moveTo(-r * 0.3, r * 0.32); ctx.lineTo(r * 0.3, r * 0.32); ctx.stroke();
    ctx.restore();
  }

  function drawCourt(g, ctx) {
    var vh = g.VH;
    ctx.save();
    ctx.strokeStyle = C.skyLine; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(200, vh + 40, 150, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, vh - 22); ctx.lineTo(400, vh - 22); ctx.stroke();
    ctx.restore();
  }

  function drawAim(g, ctx) {
    var a = aimVel();
    if (!a) return;
    var x = L.homeX, y = L.homeY, vx = a.vx, vy = a.vy;
    ctx.save();
    for (var i = 1; i <= 18; i++) {
      var t = i * 0.045;
      var px = x + vx * t, py = y + vy * t + 0.5 * GRAV * t * t;
      if (py < 0) break;
      ctx.globalAlpha = 1 - i / 22;
      ctx.fillStyle = i % 2 ? C.skyDeep : C.ink;
      ctx.beginPath(); ctx.arc(px, py, 3.2 - i * 0.08, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    if (a.pull) {
      // 고무줄
      var bx = L.homeX - a.pull.dx * 0.35, by = L.homeY - a.pull.dy * 0.35;
      ctx.save();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(L.homeX - 34, L.homeY + 6); ctx.lineTo(bx, by); ctx.lineTo(L.homeX + 34, L.homeY + 6); ctx.stroke();
      ctx.restore();
    }
  }

  function draw(g, ctx) {
    Draw.paperBg(ctx, g.VH, g.t);
    drawCourt(g, ctx);
    drawMouth(g, ctx);
    var tm = g.t;
    (S.germs || []).forEach(function (gm) { drawGerm(ctx, gm, tm); });
    // 새총 받침(Y자 칫솔 손잡이 느낌)
    ctx.save();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(L.homeX, L.homeY + 50); ctx.lineTo(L.homeX, L.homeY + 22);
    ctx.moveTo(L.homeX, L.homeY + 22); ctx.lineTo(L.homeX - 34, L.homeY + 4);
    ctx.moveTo(L.homeX, L.homeY + 22); ctx.lineTo(L.homeX + 34, L.homeY + 4); ctx.stroke();
    ctx.restore();
    if (g.state === 'play') drawAim(g, ctx);
    // 대기 공
    if (!S.balls || (S.ready <= 0 && S.balls.length < 3) || g.state !== 'play') {
      var ox = 0, oy = 0;
      if (S.drag) { var v = pullVec({ x: S.drag.cx, y: S.drag.cy }); ox = -v.dx * 0.35; oy = -v.dy * 0.35; }
      Draw.ball(ctx, L.homeX + ox, L.homeY + oy, BALL_R, 0);
    }
    (S.balls || []).forEach(function (b) { Draw.ball(ctx, b.x, b.y, ballR(b.y), b.rot); });
    // HUD
    if (g.state !== 'start') {
      var left = Math.max(0, DURATION - g.time);
      Draw.text(ctx, (S.score || 0).toLocaleString('ko-KR') + '점', 16, 24, { align: 'left', size: 20, color: C.ink });
      Draw.text(ctx, Math.ceil(left) + '초', 384, 24, { align: 'right', size: 20, color: left <= 5 ? C.seal : C.ink });
      if (S.combo >= 2) {
        var burning = S.combo >= 3;
        Draw.text(ctx, S.combo + ' 콤보' + (burning ? ' ×' + multFor(S.combo) : ''), 200, 24, { size: burning ? 18 : 16, color: burning ? C.seal : C.skyDeep });
      }
      // 남은 시간 막대
      ctx.fillStyle = C.line; ctx.fillRect(16, 40, 368, 4);
      ctx.fillStyle = left <= 5 ? C.seal : C.skyDeep; ctx.fillRect(16, 40, 368 * (left / DURATION), 4);
    }
    if (S.burnT > 0 && !g.reduced) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.35, S.burnT * 0.3);
      ctx.strokeStyle = C.seal; ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, 392, g.VH - 8);
      ctx.restore();
    }
  }

  GG.run({
    id: 'shootout',
    init: function (g) { S.teeth = []; S.germs = []; S.balls = []; },
    layout: layout,
    start: start,
    update: update,
    draw: draw,
    down: down, move: move, up: up, key: key,
  });
  if (window.__gosuGame) window.__gosuGame.debug = { S: S, L: L };
})();
