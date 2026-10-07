/* 고수 농구장 ③ 자유투 교정 — 각도·힘 2단계 조준, 바람 읽고 10구. 골인마다 치아 하나 정렬 */
(function () {
  'use strict';
  var GG = window.GosuGame;
  if (!GG) return;
  var Draw = GG.Draw, C = GG.C, clamp = GG.clamp, lerp = GG.lerp, rand = GG.rand;

  var SHOTS = 10;
  var GRAV = 900;
  var BALL_R = 14;
  var RIM = 38;                     // 림 반폭
  var ANG_MIN = 70, ANG_MAX = 110;  // 도(°), 90 = 수직
  var ANG_SPEED = 0.45, POW_SPEED = 0.6;  // 왕복/초
  var WIND_UNIT = 30;

  var S = {}, L = {};

  function layout(g) {
    var vh = g.VH;
    L.teethY = 82;
    L.hoopX = 200;
    L.hoopY = Math.max(205, vh * 0.38);
    L.shootY = vh - 100;
    L.dy = L.shootY - L.hoopY;
    var base = Math.sqrt(2 * GRAV * L.dy);
    L.vmin = base * 1.0; L.vmax = base * 1.22;
    L.teeth = [];
    for (var i = 0; i < SHOTS; i++) {
      var x = 22 + 18 + i * 35.6;
      var u = (x - 200) / 180;
      L.teeth.push({ x: x, y: L.teethY + 18 * (1 - u * u) });
    }
  }

  function crookedSet() {
    var arr = [];
    for (var i = 0; i < SHOTS; i++) {
      var sign = Math.random() < 0.5 ? -1 : 1;
      arr.push({ rot0: sign * rand(0.18, 0.48), dy0: rand(-9, 9), dx0: rand(-3, 3), k: 0, aligned: false, pop: 0 });
    }
    return arr;
  }

  // 발사 후 t초 위치(바람 = 가로 가속도)
  function pos(sx, vx, vy, ax, t) {
    return { x: sx + vx * t + 0.5 * ax * t * t, y: L.shootY - vy * t + 0.5 * GRAV * t * t };
  }
  // 림 높이를 내려오며 지날 때의 x (없으면 null)
  function crossX(sx, ang, v, ax) {
    var a = ang * Math.PI / 180, vx = Math.cos(a) * v, vy = Math.sin(a) * v;
    var disc = vy * vy - 2 * GRAV * L.dy;
    if (disc < 0) return null;
    var t = (vy + Math.sqrt(disc)) / GRAV;
    return sx + vx * t + 0.5 * ax * t * t;
  }
  function solveFor(sx, ax, ang) {
    // 주어진 각도에서 가장 정확한 힘(0~1)
    var best = null, bd = 1e9;
    for (var p = 0; p <= 1.0001; p += 0.005) {
      var x = crossX(sx, ang, lerp(L.vmin, L.vmax, p), ax);
      if (x == null) continue;
      var d = Math.abs(x - L.hoopX);
      if (d < bd) { bd = d; best = p; }
    }
    return { power: best, err: bd };
  }
  function solve() {
    var best = null;
    for (var ang = ANG_MIN; ang <= ANG_MAX; ang += 1) {
      var r = solveFor(S.sx, S.ax, ang);
      if (r.power != null && (!best || r.err < best.err)) best = { angle: ang, power: r.power, err: r.err };
    }
    return best;
  }

  function newShot() {
    for (var tries = 0; tries < 30; tries++) {
      var side = Math.random() < 0.5 ? -1 : 1;
      S.sx = 200 + side * rand(20, 100);
      S.windLv = Math.round(rand(-3, 3));
      S.ax = S.windLv * WIND_UNIT;
      var sol = solve();
      if (sol && sol.err < 6) break;
    }
    S.phase = 'angle'; S.pt = 0;
    S.angPh = Math.random() * 2; S.powPh = 0;
    S.ang = null; S.power = null;
    S.ball = null; S.made = false;
  }

  function start(g) {
    S.shot = 0; S.aligned = 0;
    S.teeth = crookedSet();
    S.streaks = [];
    for (var i = 0; i < 7; i++) S.streaks.push({ x: rand(0, 400), y: rand(L.hoopY - 40, L.shootY - 40), l: rand(18, 40) });
    newShot();
  }

  function tri(ph) { var p = ph % 2; return p < 1 ? p : 2 - p; }
  function curAng() { return S.ang != null ? S.ang : lerp(ANG_MIN, ANG_MAX, tri(S.angPh)); }
  function curPow() { return S.power != null ? S.power : tri(S.powPh); }

  function tap(g) {
    if (S.phase === 'angle') { S.ang = curAng(); S.phase = 'power'; S.powPh = 0; return; }
    if (S.phase === 'power') { S.power = curPow(); launch(g); }
  }

  function launch(g) {
    var a = S.ang * Math.PI / 180, v = lerp(L.vmin, L.vmax, S.power);
    S.ball = { sx: S.sx, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, x: S.sx, y: L.shootY, free: null, bounces: 0, prevY: L.shootY, rot: 0, done: false };
    S.phase = 'fly'; S.pt = 0;
  }

  function finishShot(g, made) {
    var b = S.ball;
    b.done = true;
    S.made = made;
    var tooth = S.teeth[S.shot];
    if (made) {
      S.aligned++;
      tooth.aligned = true;
      tooth.k = 0;
      g.float(S.aligned === SHOTS ? '완성!' : '골인! 정렬 +1', 200, L.hoopY - 70, C.skyDeep, 24);
      g.burst(L.hoopX, L.hoopY + 10, C.sky, 16, 200, 3);
      g.burst(L.teeth[S.shot].x, L.teeth[S.shot].y, '#ffffff', 8, 140, 2.4);
      g.shake(3, 0.15);
    } else {
      g.float('노골', 200, L.hoopY - 70, C.inkMute, 22);
    }
    S.phase = 'after'; S.pt = 0;
  }

  function update(g, dt) {
    S.pt += dt;
    // 바람 줄무늬
    S.streaks.forEach(function (s) {
      s.x += S.ax * 0.9 * dt + (S.windLv === 0 ? 0 : (S.windLv > 0 ? 30 : -30) * dt);
      if (s.x > 440) s.x = -40; if (s.x < -40) s.x = 440;
    });
    S.teeth.forEach(function (t) {
      if (t.aligned && t.k < 1) t.k = Math.min(1, t.k + dt / 0.7);
    });
    if (S.phase === 'angle') S.angPh += dt * ANG_SPEED * 2;
    else if (S.phase === 'power') S.powPh += dt * POW_SPEED * 2;
    else if (S.phase === 'fly') flyStep(g, dt);
    else if (S.phase === 'after') {
      if (S.ball && !S.ball.gone) flyStep(g, dt);
      if (S.pt > 1.0) {
        S.shot++;
        if (S.shot >= SHOTS) {
          S.phase = 'done';
          g.end({ score: S.aligned, scoreText: String(S.aligned), unitText: ' / 10 정렬', detail: '골인 ' + S.aligned + '구 · 노골 ' + (SHOTS - S.aligned) + '구', delay: 500 });
        } else newShot();
      }
    }
  }

  function flyStep(g, dt) {
    var b = S.ball;
    b.t += dt;
    b.prevY = b.y;
    var prevX = b.x;
    if (!b.free) {
      var p = pos(b.sx, b.vx, b.vy, S.ax, b.t);
      b.x = p.x; b.y = p.y;
    } else {
      b.free.vy += GRAV * dt; b.free.vx += S.ax * dt;
      b.x += b.free.vx * dt; b.y += b.free.vy * dt;
    }
    b.rot += dt * 8;
    var descending = b.y > b.prevY;
    if (!b.done && descending && b.prevY < L.hoopY && b.y >= L.hoopY) {
      var dx = b.x - L.hoopX;
      var ad = Math.abs(dx);
      if (ad <= RIM - BALL_R * 0.3) { finishShot(g, true); }
      else if (ad <= RIM + BALL_R && b.bounces < 2) {
        // 림에 맞고 튕김
        b.bounces++;
        var vxNow = b.free ? b.free.vx : b.vx + S.ax * b.t;
        var vyNow = b.free ? b.free.vy : -b.vy + GRAV * b.t;
        var inward = ad < RIM ? -Math.sign(dx) : Math.sign(dx);
        b.free = { vx: vxNow * 0.5 + inward * 70, vy: -Math.abs(vyNow) * 0.42 };
        b.y = L.hoopY - 1;
        g.float('통!', b.x, L.hoopY - 24, C.seal, 16);
      } else if (!b.done) { /* 림 바깥 — 계속 떨어짐 */ }
    }
    if (!b.done && b.y > L.hoopY + 40 && descending) finishShot(g, false);
    if (b.y > g.VH + 40 || b.x < -60 || b.x > 460 || b.t > 4) {
      if (!b.done) finishShot(g, false);
      b.gone = true;
    }
    void prevX;
  }

  /* ── 그리기 ── */
  function drawTeeth(g, ctx) {
    var arr = S.teeth || crookedPreview();
    // 철사(정렬된 치아끼리)
    ctx.save();
    ctx.strokeStyle = C.skyDeep; ctx.lineWidth = 2;
    ctx.beginPath();
    var started = false; // 끊긴 구간은 moveTo 로 새로 시작
    for (var i = 0; i < SHOTS; i++) {
      var t = arr[i], p = L.teeth[i];
      if (t.aligned && t.k >= 1) {
        if (!started) { ctx.moveTo(p.x, p.y + 2); started = true; } else ctx.lineTo(p.x, p.y + 2);
      } else {
        started = false;
      }
    }
    ctx.stroke();
    ctx.restore();
    for (var j = 0; j < SHOTS; j++) {
      var tt = arr[j], pp = L.teeth[j];
      var e = tt.aligned ? easeOutBack(tt.k) : 0;
      var rot = lerp(tt.rot0, 0, e), oy = lerp(tt.dy0, 0, e), ox = lerp(tt.dx0, 0, e);
      var current = g.state === 'play' && j === S.shot && S.phase !== 'done';
      if (current) {
        ctx.save();
        ctx.fillStyle = 'rgba(172,215,229,0.5)';
        ctx.beginPath(); ctx.ellipse(pp.x, pp.y + 26, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      Draw.tooth(ctx, pp.x + ox, pp.y + oy, 34, { rot: rot, mood: tt.aligned ? 'joy' : current ? 'wow' : 'worry' });
      if (tt.aligned) {
        // 브라켓
        var bs = Math.min(1, tt.k * 2.2);
        ctx.save();
        ctx.translate(pp.x + ox, pp.y + oy + 2);
        ctx.rotate(rot);
        ctx.scale(bs, bs);
        Draw.roundRect(ctx, -5, -4, 10, 8, 1.5);
        ctx.fillStyle = C.metal; ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = C.ink; ctx.stroke();
        ctx.fillStyle = C.sky; ctx.fillRect(-1.5, -4, 3, 8);
        ctx.restore();
        if (tt.k < 1) Draw.sparkle(ctx, pp.x + 12, pp.y - 14, 7, 1 - tt.k);
      }
    }
  }
  var previewTeeth = null;
  function crookedPreview() { if (!previewTeeth) previewTeeth = crookedSet(); return previewTeeth; }
  function easeOutBack(k) { var c = 1.6; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }

  function drawHoopBack(ctx) {
    var x = L.hoopX, y = L.hoopY;
    ctx.save();
    // 기둥(뒤)
    ctx.fillStyle = C.ink2; ctx.fillRect(x - 3, y - 64, 6, 4);
    // 백보드
    Draw.roundRect(ctx, x - 62, y - 76, 124, 76, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.lineWidth = 2.5; ctx.strokeStyle = C.seal;
    ctx.strokeRect(x - 22, y - 36, 44, 30);
    // 림 뒤쪽
    ctx.lineWidth = 4.5; ctx.strokeStyle = C.seal;
    ctx.beginPath(); ctx.ellipse(x, y, RIM, 7, 0, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  function drawHoopFront(ctx) {
    var x = L.hoopX, y = L.hoopY;
    ctx.save();
    // 그물
    ctx.strokeStyle = 'rgba(46,53,59,0.55)'; ctx.lineWidth = 1.4;
    for (var i = 0; i <= 6; i++) {
      var u = -1 + i / 3;
      ctx.beginPath(); ctx.moveTo(x + u * RIM, y + 2); ctx.lineTo(x + u * RIM * 0.62, y + 40); ctx.stroke();
    }
    for (var j = 1; j <= 3; j++) {
      var yy = y + j * 12, w = RIM * (1 - j * 0.12);
      ctx.beginPath(); ctx.moveTo(x - w, yy); ctx.lineTo(x + w, yy); ctx.stroke();
    }
    ctx.lineWidth = 4.5; ctx.strokeStyle = C.seal;
    ctx.beginPath(); ctx.ellipse(x, y, RIM, 7, 0, 0, Math.PI); ctx.stroke();
    ctx.restore();
  }

  function drawWind(g, ctx) {
    var lv = S.windLv || 0;
    var y = L.hoopY + 70;
    ctx.save();
    ctx.strokeStyle = 'rgba(51,122,153,0.22)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    if (lv !== 0 && S.streaks) S.streaks.forEach(function (s) { ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - Math.sign(lv) * s.l, s.y); ctx.stroke(); });
    ctx.restore();
    var label = lv === 0 ? '바람 없음' : '바람 ' + (lv < 0 ? '← ' : '') + Math.abs(lv) + (lv > 0 ? ' →' : '');
    Draw.roundRect(ctx, 300, y - 15, 88, 30, 15);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
    Draw.text(ctx, label, 344, y + 1, { size: 14, color: lv === 0 ? C.inkMute : C.skyDeep });
  }

  function drawAim(g, ctx) {
    var sx = S.sx, sy = L.shootY;
    if (S.phase === 'angle' || S.phase === 'power') {
      var a = curAng() * Math.PI / 180;
      var len = 84;
      ctx.save();
      // 각도 부채꼴 가이드
      ctx.strokeStyle = C.skyLine; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx, sy, len, -ANG_MAX * Math.PI / 180, -ANG_MIN * Math.PI / 180); ctx.stroke();
      ctx.strokeStyle = S.phase === 'angle' ? C.seal : C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
      var ex = sx + Math.cos(a) * len, ey = sy - Math.sin(a) * len;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(ex + Math.cos(a) * 10, ey - Math.sin(a) * 10);
      ctx.lineTo(ex + Math.cos(a + 2.4) * 10, ey - Math.sin(a + 2.4) * 10);
      ctx.lineTo(ex + Math.cos(a - 2.4) * 10, ey - Math.sin(a - 2.4) * 10);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    if (S.phase === 'power') {
      var w = 150, x0 = clamp(sx - w / 2, 24, 388 - w), y0 = sy + 70;
      Draw.roundRect(ctx, x0, y0, w, 14, 7);
      ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
      var p = curPow();
      Draw.roundRect(ctx, x0 + 2, y0 + 2, Math.max(4, (w - 4) * p), 10, 5);
      ctx.fillStyle = C.seal; ctx.fill();
      Draw.text(ctx, '힘', x0 - 2, y0 + 7, { align: 'right', size: 12, color: C.inkSoft, weight: 700 });
    }
  }

  function drawShooter(g, ctx) {
    var sx = S.sx || 200, sy = L.shootY;
    ctx.save();
    ctx.fillStyle = 'rgba(16,20,23,0.12)';
    ctx.beginPath(); ctx.ellipse(sx, sy + 64, 24, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    Draw.tooth(ctx, sx, sy + 34, 62, { mood: S.phase === 'after' ? (S.made ? 'joy' : 'worry') : 'happy' });
    if (!S.ball && g.state === 'play' || g.state !== 'play') Draw.ball(ctx, sx, sy, BALL_R, 0);
  }

  function draw(g, ctx) {
    Draw.paperBg(ctx, g.VH, g.t);
    // 코트
    ctx.fillStyle = C.skyMist; ctx.fillRect(0, L.shootY + 60, 400, g.VH);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, L.shootY + 60); ctx.lineTo(400, L.shootY + 60); ctx.stroke();
    ctx.strokeStyle = C.skyLine; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(200, L.shootY + 60, 150, Math.PI, Math.PI * 2); ctx.stroke();
    // 잇몸 띠
    ctx.save();
    ctx.strokeStyle = C.gum; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath();
    for (var i = 0; i <= 20; i++) { var x = 20 + i * 18, u = (x - 200) / 180; var yy = L.teethY - 22 + 18 * (1 - u * u); if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
    ctx.stroke();
    ctx.restore();
    drawTeeth(g, ctx);
    if (g.state === 'play' || g.state === 'over') drawWind(g, ctx);
    drawHoopBack(ctx);
    var b = S.ball;
    var ballAbove = b && b.y < L.hoopY;
    if (b && !b.gone && ballAbove) Draw.ball(ctx, b.x, b.y, BALL_R * (0.8 + 0.2 * clamp((b.y - L.hoopY) / L.dy, 0, 1)), b.rot);
    drawHoopFront(ctx);
    if (b && !b.gone && !ballAbove) Draw.ball(ctx, b.x, b.y, BALL_R * (0.8 + 0.2 * clamp((b.y - L.hoopY) / L.dy, 0, 1)), b.rot);
    drawShooter(g, ctx);
    if (g.state === 'play') drawAim(g, ctx);
    // HUD
    if (g.state !== 'start') {
      Draw.text(ctx, '슛 ' + Math.min(SHOTS, (S.shot || 0) + 1) + ' / ' + SHOTS, 16, 24, { align: 'left', size: 17 });
      Draw.text(ctx, '정렬 ' + (S.aligned || 0), 384, 24, { align: 'right', size: 17, color: C.skyDeep });
      if (g.state === 'play' && (S.phase === 'angle' || S.phase === 'power')) {
        Draw.text(ctx, S.phase === 'angle' ? '① 탭: 각도 고정' : '② 탭: 힘 고정 → 슛!', 16, L.hoopY + 70, { align: 'left', size: 14, color: S.phase === 'angle' ? C.seal : C.ink, weight: 800 });
      }
    }
  }

  GG.run({
    id: 'freethrow',
    init: function () {},
    layout: layout,
    start: start,
    update: update,
    draw: draw,
    down: function (g) { tap(g); },
    key: function (g, k, repeat) { if (!repeat && (k === ' ' || k === 'Enter')) tap(g); },
  });
  // 자동 점검용 읽기 전용 노출(정답 각도·힘 계산)
  if (window.__gosuGame) window.__gosuGame.debug = { S: S, L: L, solve: solve, solveFor: function (ang) { return solveFor(S.sx, S.ax, ang); }, curAng: curAng, curPow: curPow };
})();
