/* GOSU DENTAL — 고수 농구장 공용 엔진 (2026-10-07, 조원익 원장 요청)
   Canvas 2D + 순수 JS. 외부 이미지·라이브러리 없음.
   - 가상 좌표: 가로 400 고정, 세로(VH)는 무대 비율에 따라 가변
   - devicePixelRatio·리사이즈 대응, rAF 루프, 탭 숨김 시 일시정지
   - pointer events(마우스+터치) · 키보드(스페이스/엔터/화살표)
   - prefers-reduced-motion 이면 흔들림·번쩍임 생략
   각 게임(shootout.js, dunk.js, freethrow.js)은 GosuGame.run(def) 로 등록한다. */
(function () {
  'use strict';

  var W = 400;
  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  // 캔버스 글자는 시스템 한글 글꼴(사이트 웹폰트는 서브셋이라 캔버스 문구 글리프가 없을 수 있음)
  var FONT = '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';

  function cssVar(name, fb) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fb;
    } catch (e) { return fb; }
  }
  var C = {
    ink: cssVar('--ink', '#101417'),
    inkDeep: cssVar('--ink-deep', '#0a0d0f'),
    ink2: cssVar('--ink-2', '#2e353b'),
    inkSoft: cssVar('--ink-soft', '#4d565e'),
    inkMute: cssVar('--ink-mute', '#626e78'),
    sky: cssVar('--sky', '#acd7e5'),
    skyBright: cssVar('--sky-bright', '#b8e6f5'),
    skyDeep: cssVar('--sky-deep', '#337a99'),
    skyMist: cssVar('--sky-mist', '#eef6fa'),
    skyLine: cssVar('--sky-line', '#d7e9f1'),
    seal: cssVar('--seal', '#b8382b'),
    sealSoft: cssVar('--seal-soft', '#d4574a'),
    paper: cssVar('--paper', '#fcfdfe'),
    line: cssVar('--line', '#e5ecf0'),
    white: '#ffffff',
    gum: '#e9b3b1',
    gumDeep: '#c98582',
    mouth: '#3a1f26',
    bone: '#efe6d2',
    boneDeep: '#d8c9a8',
    metal: '#a9b4bc',
    metalDeep: '#6f7b84',
    germ: '#8c9a55',
    germDeep: '#4f5a2a',
  };

  var Best = {
    get: function (id) {
      try { var v = parseInt(window.localStorage.getItem('gosu-game-best-' + id), 10); return isFinite(v) ? v : 0; }
      catch (e) { return 0; }
    },
    set: function (id, v) {
      try { window.localStorage.setItem('gosu-game-best-' + id, String(v)); } catch (e) {}
    },
  };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ───────── 그리기 도우미 ───────── */
  var Draw = {
    text: function (ctx, str, x, y, o) {
      o = o || {};
      ctx.save();
      ctx.font = (o.weight || 800) + ' ' + (o.size || 18) + 'px ' + FONT;
      ctx.textAlign = o.align || 'center';
      ctx.textBaseline = o.base || 'middle';
      if (o.alpha != null) ctx.globalAlpha = o.alpha;
      if (o.stroke) {
        ctx.lineJoin = 'round';
        ctx.lineWidth = o.strokeWidth || 5;
        ctx.strokeStyle = o.stroke;
        ctx.strokeText(str, x, y);
      }
      ctx.fillStyle = o.color || C.ink;
      ctx.fillText(str, x, y);
      ctx.restore();
    },
    roundRect: function (ctx, x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    },
    // 고수 치아 캐릭터 — 로고처럼 하얀 어금니, 먹선, 점 눈, 웃는 입, 하늘색 볼
    toothPath: function (ctx, s) {
      ctx.beginPath();
      ctx.moveTo(-0.40 * s, -0.16 * s);
      ctx.bezierCurveTo(-0.47 * s, -0.42 * s, -0.30 * s, -0.55 * s, -0.16 * s, -0.48 * s);
      ctx.bezierCurveTo(-0.06 * s, -0.43 * s, 0.06 * s, -0.43 * s, 0.16 * s, -0.48 * s);
      ctx.bezierCurveTo(0.30 * s, -0.55 * s, 0.47 * s, -0.42 * s, 0.40 * s, -0.16 * s);
      ctx.bezierCurveTo(0.36 * s, 0.04 * s, 0.35 * s, 0.20 * s, 0.30 * s, 0.42 * s);
      ctx.bezierCurveTo(0.27 * s, 0.53 * s, 0.15 * s, 0.53 * s, 0.13 * s, 0.40 * s);
      ctx.bezierCurveTo(0.10 * s, 0.25 * s, 0.06 * s, 0.17 * s, 0, 0.17 * s);
      ctx.bezierCurveTo(-0.06 * s, 0.17 * s, -0.10 * s, 0.25 * s, -0.13 * s, 0.40 * s);
      ctx.bezierCurveTo(-0.15 * s, 0.53 * s, -0.27 * s, 0.53 * s, -0.30 * s, 0.42 * s);
      ctx.bezierCurveTo(-0.35 * s, 0.20 * s, -0.36 * s, 0.04 * s, -0.40 * s, -0.16 * s);
      ctx.closePath();
    },
    tooth: function (ctx, x, y, s, o) {
      o = o || {};
      ctx.save();
      ctx.translate(x, y);
      if (o.rot) ctx.rotate(o.rot);
      if (o.sx || o.sy) ctx.scale(o.sx || 1, o.sy || 1);
      Draw.toothPath(ctx, s);
      ctx.fillStyle = o.fill || C.white;
      ctx.fill();
      ctx.lineWidth = Math.max(1.6, s * 0.05);
      ctx.strokeStyle = C.ink;
      ctx.lineJoin = 'round';
      ctx.stroke();
      // 광택
      ctx.beginPath();
      ctx.ellipse(-0.22 * s, -0.30 * s, 0.05 * s, 0.09 * s, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(172,215,229,0.55)';
      ctx.fill();
      if (o.face !== false) Draw.face(ctx, 0, -0.08 * s, s, o.mood || 'happy', o.blink);
      ctx.restore();
    },
    face: function (ctx, x, y, s, mood, blink) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = C.ink;
      ctx.strokeStyle = C.ink;
      ctx.lineCap = 'round';
      var ex = 0.12 * s, ey = -0.06 * s, er = 0.035 * s;
      if (blink || mood === 'joy') {
        ctx.lineWidth = Math.max(1.4, s * 0.03);
        ctx.beginPath(); ctx.arc(-ex, ey + er * 0.6, er, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        ctx.beginPath(); ctx.arc(ex, ey + er * 0.6, er, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.ellipse(-ex, ey, er * 0.85, er * 1.25, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(ex, ey, er * 0.85, er * 1.25, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-ex + er * 0.3, ey - er * 0.45, er * 0.32, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex + er * 0.3, ey - er * 0.45, er * 0.32, 0, Math.PI * 2); ctx.fill();
      }
      // 볼터치
      ctx.fillStyle = 'rgba(172,215,229,0.75)';
      ctx.beginPath(); ctx.ellipse(-0.2 * s, 0.03 * s, 0.05 * s, 0.03 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0.2 * s, 0.03 * s, 0.05 * s, 0.03 * s, 0, 0, Math.PI * 2); ctx.fill();
      // 입
      ctx.lineWidth = Math.max(1.4, s * 0.03);
      if (mood === 'worry') {
        ctx.beginPath(); ctx.arc(0, 0.09 * s, 0.06 * s, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      } else if (mood === 'wow') {
        ctx.fillStyle = C.ink;
        ctx.beginPath(); ctx.ellipse(0, 0.05 * s, 0.04 * s, 0.05 * s, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(-0.08 * s, 0.02 * s);
        ctx.quadraticCurveTo(0, 0.14 * s, 0.08 * s, 0.02 * s);
        ctx.closePath();
        ctx.fillStyle = C.ink; ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, 0.07 * s, 0.035 * s, 0.018 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = C.sealSoft; ctx.fill();
      }
      ctx.restore();
    },
    // 불소볼 — 하늘색 농구공
    ball: function (ctx, x, y, r, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot || 0);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = C.sky; ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.4, r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
      ctx.restore();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = Math.max(1.3, r * 0.1);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = Math.max(1, r * 0.08);
      ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
      ctx.beginPath(); ctx.arc(-r * 1.25, 0, r * 0.85, -0.85, 0.85); ctx.stroke();
      ctx.beginPath(); ctx.arc(r * 1.25, 0, r * 0.85, Math.PI - 0.85, Math.PI + 0.85); ctx.stroke();
      ctx.restore();
    },
    sparkle: function (ctx, x, y, r, a) {
      ctx.save();
      ctx.globalAlpha = a == null ? 1 : a;
      ctx.translate(x, y);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = C.skyDeep;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (var i = 0; i < 8; i++) {
        var rr = i % 2 ? r * 0.32 : r;
        var ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
        ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    },
    // 먹 번짐 느낌의 바탕(종이 + 옅은 먹 산)
    paperBg: function (ctx, vh, t) {
      ctx.fillStyle = C.paper;
      ctx.fillRect(0, 0, W, vh);
      var g = ctx.createLinearGradient(0, 0, 0, vh);
      g.addColorStop(0, 'rgba(238,246,250,0.9)');
      g.addColorStop(1, 'rgba(252,253,254,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, vh);
    },
  };

  /* ───────── 게임 실행기 ───────── */
  function run(def) {
    var stage = document.getElementById('gm-stage');
    if (!stage) return;
    var canvas = stage.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var cfg = {};
    try { cfg = JSON.parse(document.getElementById('gm-config').textContent); } catch (e) {}
    var startPanel = stage.querySelector('[data-panel="start"]');
    var resultPanel = stage.querySelector('[data-panel="result"]');
    var pausePanel = stage.querySelector('[data-panel="pause"]');

    var g = {
      W: W, VH: 640, scale: 1, dpr: 1, t: 0, time: 0,
      state: 'start', reduced: reduced, C: C, Draw: Draw, FONT: FONT,
      timeScale: 1, cfg: cfg,
      rand: rand, clamp: clamp, lerp: lerp,
      parts: [], floats: [], shakeT: 0, shakeMag: 0, flashT: 0,
    };

    var MAX_PARTS = 140;
    g.burst = function (x, y, color, n, speed, size) {
      n = Math.min(n, MAX_PARTS - g.parts.length);
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, v = (speed || 160) * (0.35 + Math.random() * 0.75);
        g.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 0, max: 0.45 + Math.random() * 0.4, r: (size || 3) * (0.6 + Math.random() * 0.8), c: color });
      }
    };
    g.float = function (str, x, y, color, size) {
      if (g.floats.length > 10) g.floats.shift();
      g.floats.push({ s: str, x: x, y: y, c: color || C.ink, size: size || 20, life: 0, max: 1.0 });
    };
    g.shake = function (mag, dur) {
      if (reduced) return;
      g.shakeMag = Math.max(g.shakeMag, mag); g.shakeT = Math.max(g.shakeT, dur || 0.25);
    };
    g.flash = function (dur) { if (!reduced) g.flashT = dur || 0.18; };

    /* 크기·해상도 */
    function resize() {
      var r = stage.getBoundingClientRect();
      var cw = Math.max(200, r.width), ch = Math.max(300, r.height);
      g.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      g.scale = cw / W;
      g.VH = ch / g.scale;
      canvas.width = Math.round(cw * g.dpr);
      canvas.height = Math.round(ch * g.dpr);
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      if (def.layout) def.layout(g);
      if (!running) render();
    }

    /* 루프 */
    var running = false, raf = 0, last = 0, hiddenPause = false;
    function loop(now) {
      raf = 0;
      if (!running) return;
      var dt = last ? Math.min(0.034, (now - last) / 1000) : 0.016;
      last = now;
      step(dt);
      render();
      if (running) raf = requestAnimationFrame(loop);
    }
    function startLoop() {
      if (running) return;
      running = true; last = 0;
      raf = requestAnimationFrame(loop);
    }
    function stopLoop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }
    function step(dt) {
      var sdt = dt * g.timeScale;
      g.t += dt;
      if (g.state === 'play') {
        g.time += sdt;
        def.update(g, sdt, dt);
      }
      for (var i = g.parts.length - 1; i >= 0; i--) {
        var p = g.parts[i];
        p.life += sdt;
        if (p.life >= p.max) { g.parts.splice(i, 1); continue; }
        p.vy += 420 * sdt; p.x += p.vx * sdt; p.y += p.vy * sdt;
      }
      for (var j = g.floats.length - 1; j >= 0; j--) {
        var f = g.floats[j];
        f.life += dt;
        f.y -= 34 * dt;
        if (f.life >= f.max) g.floats.splice(j, 1);
      }
      if (g.shakeT > 0) { g.shakeT -= dt; if (g.shakeT <= 0) g.shakeMag = 0; }
      if (g.flashT > 0) g.flashT -= dt;
      // 결과 화면으로 넘어간 뒤 잔여 이펙트가 끝나면 루프 정지
      if (g.state !== 'play' && !g.parts.length && !g.floats.length && g.shakeT <= 0 && g.flashT <= 0 && !g.keepAnimating) stopLoop();
    }
    function render() {
      ctx.setTransform(g.dpr * g.scale, 0, 0, g.dpr * g.scale, 0, 0);
      ctx.save();
      if (g.shakeT > 0 && g.shakeMag) {
        ctx.translate((Math.random() - 0.5) * g.shakeMag, (Math.random() - 0.5) * g.shakeMag);
      }
      def.draw(g, ctx);
      for (var i = 0; i < g.parts.length; i++) {
        var p = g.parts[i], k = 1 - p.life / p.max;
        ctx.globalAlpha = k;
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.5 + k * 0.5), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (var j = 0; j < g.floats.length; j++) {
        var f = g.floats[j], a = 1 - Math.max(0, (f.life - f.max * 0.6) / (f.max * 0.4));
        Draw.text(ctx, f.s, f.x, f.y, { size: f.size, color: f.c, stroke: '#fff', strokeWidth: 5, alpha: a });
      }
      ctx.restore();
      if (g.flashT > 0) {
        ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.55, g.flashT * 3).toFixed(3) + ')';
        ctx.fillRect(0, 0, W, g.VH);
      }
    }

    /* 상태 전환 */
    function showPanel(p) {
      [startPanel, resultPanel, pausePanel].forEach(function (el) { if (el) el.hidden = el !== p; });
      stage.classList.toggle('is-playing', !p);
    }
    function begin() {
      g.time = 0; g.t = 0; g.parts.length = 0; g.floats.length = 0; g.timeScale = 1;
      g.shakeT = 0; g.flashT = 0;
      def.start(g);
      g.state = 'play';
      showPanel(null);
      try { canvas.focus({ preventScroll: true }); } catch (e) { canvas.focus(); }
      startLoop();
    }
    g.end = function (res) {
      if (g.state !== 'play') return;
      g.state = 'over';
      g.timeScale = 1;
      var best = Best.get(def.id);
      var isBest = res.score > best;
      if (isBest) Best.set(def.id, res.score);
      fillResult(res, isBest ? res.score : best, isBest && res.score > 0);
      setTimeout(function () {
        showPanel(resultPanel);
        var again = resultPanel && resultPanel.querySelector('[data-act="again"]');
        if (again) try { again.focus({ preventScroll: true }); } catch (e) {}
      }, res.delay == null ? 650 : res.delay);
    };
    function tierFor(score) {
      var tiers = (cfg.tiers || []).slice().sort(function (a, b) { return b.min - a.min; });
      for (var i = 0; i < tiers.length; i++) if (score >= tiers[i].min) return tiers[i];
      return null;
    }
    function fillResult(res, best, isBest) {
      if (!resultPanel) return;
      var unit = cfg.unit || '';
      var set = function (sel, txt) { var el = resultPanel.querySelector(sel); if (el) el.textContent = txt; };
      var tier = tierFor(res.score);
      set('[data-r="tier"]', tier ? tier.title : '');
      set('[data-r="tierdesc"]', tier && tier.desc ? tier.desc : '');
      set('[data-r="score"]', (res.scoreText || res.score.toLocaleString('ko-KR')));
      set('[data-r="unit"]', res.unitText != null ? res.unitText : unit);
      set('[data-r="best"]', best.toLocaleString('ko-KR') + (cfg.bestUnit || unit));
      set('[data-r="detail"]', res.detail || '');
      var nb = resultPanel.querySelector('[data-r="newbest"]');
      if (nb) nb.hidden = !isBest;
    }

    /* 입력 — 포인터 */
    function toV(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / g.scale, y: (e.clientY - r.top) / g.scale, id: e.pointerId, type: e.pointerType };
    }
    var activePointer = null;
    canvas.addEventListener('pointerdown', function (e) {
      if (g.state !== 'play') return;
      if (activePointer !== null) return;
      e.preventDefault();
      activePointer = e.pointerId;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      if (def.down) def.down(g, toV(e));
    });
    canvas.addEventListener('pointermove', function (e) {
      if (g.state !== 'play' || e.pointerId !== activePointer) return;
      if (def.move) def.move(g, toV(e));
    });
    function up(e) {
      if (e.pointerId !== activePointer) return;
      activePointer = null;
      if (g.state === 'play' && def.up) def.up(g, toV(e), e.type === 'pointercancel');
    }
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    // iOS 길게 누르기 메뉴·더블탭 확대 방지
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    canvas.addEventListener('touchstart', function (e) { if (g.state === 'play') e.preventDefault(); }, { passive: false });

    /* 입력 — 키보드 */
    window.addEventListener('keydown', function (e) {
      var k = e.key;
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (g.state !== 'play') return;
      if (/^(INPUT|TEXTAREA|SELECT|A|BUTTON|SUMMARY)$/.test(tag)) return;
      if (k === ' ' || k === 'Spacebar' || k === 'Enter' || k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
        e.preventDefault();
        if (def.key) def.key(g, k === 'Spacebar' ? ' ' : k, e.repeat);
      }
    });

    /* 버튼 */
    stage.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'start' || act === 'again') { e.preventDefault(); begin(); }
      if (act === 'resume') { e.preventDefault(); resume(); }
    });

    /* 탭 숨김 → 일시정지 */
    function pause() {
      if (g.state !== 'play' || hiddenPause) return;
      hiddenPause = true;
      stopLoop();
      if (pausePanel) showPanel(pausePanel);
    }
    function resume() {
      if (!hiddenPause) return;
      hiddenPause = false;
      showPanel(null);
      try { canvas.focus({ preventScroll: true }); } catch (e) {}
      startLoop();
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause();
      else if (hiddenPause && !pausePanel) resume();
    });
    window.addEventListener('pagehide', pause);

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    window.addEventListener('resize', resize, { passive: true });
    if (def.init) def.init(g);
    resize();
    showPanel(startPanel);
    stage.classList.add('is-ready');
    // 디버그·자동 점검용 읽기 전용 핸들 (게임 상태 조회)
    window.__gosuGame = { g: g, id: def.id };
  }

  window.GosuGame = { run: run, Draw: Draw, C: C, W: W, FONT: FONT, Best: Best, reduced: reduced, clamp: clamp, lerp: lerp, rand: rand };
})();
