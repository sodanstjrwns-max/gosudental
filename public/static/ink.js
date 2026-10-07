/* GOSU DENTAL — 수묵(水墨) interactive layer
   1) Hero brush-ink mouse trail (canvas)
   2) Click ink-drop splash (anywhere)
   3) Scroll-drawn brush divider strokes
   6) Brush-tip cursor follower with fading ink trail (desktop fine pointer only)
   Respects prefers-reduced-motion & touch devices. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ══════════ 1. Hero ink brush trail ══════════ */
  function initHeroInk() {
    var hero = document.querySelector('.hero');
    if (!hero || reduced || !finePointer) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'ink-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;

    function resize() {
      var r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Ink blobs: each is a soft dot that grows (bleeds) then fades
    var blobs = [];
    var last = null;
    var raf = null;

    function spawn(x, y, vx, vy) {
      var speed = Math.min(Math.hypot(vx, vy), 40);
      // faster stroke = thinner drier brush; slow = fat wet ink
      var base = 14 - speed * 0.22 + Math.random() * 4;
      blobs.push({
        x: x + (Math.random() - 0.5) * 3,
        y: y + (Math.random() - 0.5) * 3,
        r: Math.max(2.5, base),
        maxR: Math.max(4, base * (1.5 + Math.random() * 0.8)),
        a: 0.28 + Math.random() * 0.14,
        decay: 0.0035 + Math.random() * 0.003,
        grow: 0.14 + Math.random() * 0.12,
      });
      // occasional satellite droplet (飛白)
      if (Math.random() < 0.12) {
        var ang = Math.random() * Math.PI * 2, d = 12 + Math.random() * 22;
        blobs.push({
          x: x + Math.cos(ang) * d, y: y + Math.sin(ang) * d,
          r: 1 + Math.random() * 2.2, maxR: 2 + Math.random() * 3,
          a: 0.22 + Math.random() * 0.1, decay: 0.004, grow: 0.05,
        });
      }
      if (blobs.length > 260) blobs.splice(0, blobs.length - 260);
    }

    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      if (last) {
        var dx = x - last.x, dy = y - last.y;
        var dist = Math.hypot(dx, dy);
        var steps = Math.max(1, Math.floor(dist / 6));
        for (var i = 1; i <= steps; i++) {
          spawn(last.x + (dx * i) / steps, last.y + (dy * i) / steps, dx, dy);
        }
      } else {
        spawn(x, y, 0, 0);
      }
      last = { x: x, y: y };
      if (!raf) raf = requestAnimationFrame(tick);
    });
    hero.addEventListener('pointerleave', function () { last = null; });

    function tick() {
      ctx.clearRect(0, 0, W, H);
      var alive = false;
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        if (b.a <= 0) continue;
        alive = true;
        if (b.r < b.maxR) b.r += b.grow;   // ink bleed
        b.a -= b.decay;
        if (b.a <= 0) continue;
        var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        // 물빛 먹 — logo sky ink, glows on the dark hero
        g.addColorStop(0, 'rgba(172,215,229,' + b.a.toFixed(3) + ')');
        g.addColorStop(0.65, 'rgba(172,215,229,' + (b.a * 0.55).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(172,215,229,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (alive) { raf = requestAnimationFrame(tick); }
      else { raf = null; blobs.length = 0; }
    }
  }

  /* ══════════ 2. Click ink-drop splash ══════════ */
  function initInkDrop() {
    if (reduced) return;
    document.addEventListener('click', function (e) {
      // skip interactive elements — don't splash over intent
      if (e.target.closest('a, button, input, select, textarea, label, summary')) return;
      var drop = document.createElement('span');
      drop.className = 'ink-drop';
      // irregular blob shape per drop
      var r = function () { return 38 + Math.round(Math.random() * 24); };
      drop.style.borderRadius = r() + '% ' + r() + '% ' + r() + '% ' + r() + '% / ' + r() + '% ' + r() + '% ' + r() + '% ' + r() + '%';
      drop.style.left = e.clientX + 'px';
      drop.style.top = e.clientY + 'px';
      document.body.appendChild(drop);
      // satellite droplets
      for (var i = 0; i < 3; i++) {
        var s = document.createElement('span');
        s.className = 'ink-drop ink-drop-sat';
        var ang = Math.random() * Math.PI * 2, d = 26 + Math.random() * 30;
        s.style.left = e.clientX + Math.cos(ang) * d + 'px';
        s.style.top = e.clientY + Math.sin(ang) * d + 'px';
        s.style.animationDelay = (Math.random() * 0.08) + 's';
        document.body.appendChild(s);
        (function (el) { setTimeout(function () { el.remove(); }, 1300); })(s);
      }
      setTimeout(function () { drop.remove(); }, 1300);
    });
  }

  /* ══════════ 3. Brush divider strokes (scroll-drawn) ══════════ */
  var STROKE_SVG =
    '<svg viewBox="0 0 900 28" preserveAspectRatio="none" aria-hidden="true">' +
    '<path class="brush-path" d="M8 16 C 120 8, 230 22, 360 15 S 610 6, 730 14 S 860 20, 892 13" ' +
    'fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>' +
    '<path class="brush-path brush-path-2" d="M40 20 C 180 14, 320 24, 470 18 S 700 12, 870 17" ' +
    'fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.45"/>' +
    '</svg>';

  function initBrushDividers() {
    var sections = document.querySelectorAll('main > .section, main > .quote-band');
    if (!sections.length) return;
    sections.forEach(function (sec, i) {
      if (i === 0) return; // no divider before first
      var div = document.createElement('div');
      div.className = 'brush-divider';
      div.innerHTML = STROKE_SVG;
      sec.parentNode.insertBefore(div, sec);
    });

    var paths = document.querySelectorAll('.brush-divider .brush-path');
    paths.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = reduced ? 0 : len;
    });

    if (reduced || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('drawn');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.brush-divider').forEach(function (d) { io.observe(d); });
  }

  /* ══════════ 4. 족자(簇子) 펼침 — quote-band scroll unroll ══════════ */
  function initScrollUnroll() {
    var bands = document.querySelectorAll('.quote-band');
    if (!bands.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      bands.forEach(function (b) { b.classList.add('unrolled'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('unrolled');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.45 });
    bands.forEach(function (b) { io.observe(b); });
  }

  /* ══════════ 5. 먹 와이프 페이지 전환 ══════════ */
  function initInkWipe() {
    if (reduced || !finePointer) return; // 터치 기기: 전환 지연 없이 즉시 이동
    // arrival: sweep the ink away
    try {
      if (sessionStorage.getItem('inkWipe') === '1') {
        sessionStorage.removeItem('inkWipe');
        document.body.classList.add('ink-arrive');
        setTimeout(function () { document.body.classList.remove('ink-arrive'); }, 900);
      }
    } catch (e) { /* sessionStorage unavailable */ }

    // departure: sweep the ink in, then navigate
    var wiping = false;
    document.addEventListener('click', function (e) {
      if (wiping) return;
      var a = e.target.closest('a');
      if (!a || e.defaultPrevented || a.hasAttribute('data-photo-group')) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var url;
      try { url = new URL(href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;

      e.preventDefault();
      wiping = true;
      try { sessionStorage.setItem('inkWipe', '1'); } catch (err) {}
      var wipe = document.createElement('div');
      wipe.className = 'ink-wipe';
      document.body.appendChild(wipe);
      // force reflow then animate
      void wipe.offsetWidth;
      wipe.classList.add('in');
      setTimeout(function () { location.href = url.href; }, 480);
    });
    // restore if page came back from bfcache mid-wipe
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        wiping = false;
        document.querySelectorAll('.ink-wipe').forEach(function (w) { w.remove(); });
      }
    });
  }


  /* ══════════ 6. 붓 커서 — 마우스를 따라오는 붓끝 + 옅은 먹 꼬리 ══════════
     2026-10-07 원장 요청. 네이티브 커서는 그대로 두고(접근성) 그 옆에 붓끝이 살짝 늦게 따라온다.
     데스크톱 정밀 포인터 전용 · reduced-motion 끔 · /admin 제외 · 입력창 위에서는 숨김.
     transform/opacity 만 갱신(레이아웃 유발 없음), 꼬리는 10개 요소 풀 재사용, 정지하면 rAF 멈춤. */
  function initBrushCursor() {
    if (reduced || /^\/admin(\/|$)/.test(location.pathname)) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var SVG_NS = 'http://www.w3.org/2000/svg';
    var BW = 20, BH = 46;           // 붓 크기(px) — 끝(tip)은 아래 가운데
    var OFF_X = 14, OFF_Y = 18;     // 커서 화살표를 가리지 않도록 오른쪽 아래로 비켜 둔다
    var BASE_TILT = 32;             // 손에 쥔 붓처럼 기본으로 기운 각도
    var POOL = 10;

    var brush = document.createElement('div');
    brush.className = 'brush-cursor';
    brush.setAttribute('aria-hidden', 'true');
    brush.innerHTML =
      '<svg viewBox="0 0 20 46" width="' + BW + '" height="' + BH + '" focusable="false">' +
      '<rect class="bc-handle" x="7" y="0" width="6" height="21" rx="2.4"/>' +
      '<rect class="bc-knot" x="6.6" y="8" width="6.8" height="1.6" rx=".8"/>' +
      '<rect class="bc-ferrule" x="6.2" y="20" width="7.6" height="4.4" rx="1.4"/>' +
      '<path class="bc-tuft" d="M6.4 24.2 C 5.2 30, 6.6 37, 10 45.6 C 13.4 37, 14.8 30, 13.6 24.2 Z"/>' +
      '<path class="bc-wet" d="M8.6 34 C 9 38.5, 9.6 41.5, 10 44 C 10.5 41, 11 38, 11.2 34 Z"/>' +
      '</svg>';

    var trails = [];
    for (var i = 0; i < POOL; i++) {
      var t = document.createElement('span');
      t.className = 'brush-trail';
      t.setAttribute('aria-hidden', 'true');
      var r = function () { return 40 + Math.round(Math.random() * 20); };
      t.style.borderRadius = r() + '% ' + r() + '% ' + r() + '% ' + r() + '% / ' + r() + '% ' + r() + '% ' + r() + '% ' + r() + '%';
      trails.push({ el: t, x: 0, y: 0, born: -1, size: 1 });
    }
    function mount() {
      document.body.appendChild(brush);
      trails.forEach(function (tr) { document.body.appendChild(tr.el); });
    }
    mount();

    var mx = 0, my = 0;           // 실제 포인터
    var bx = 0, by = 0;           // 붓끝(지연 추적)
    var tilt = BASE_TILT, scale = 1, targetScale = 1;
    var shown = false, hidden = false, raf = null;
    var lastDrop = null, next = 0, lastMoveAt = 0;
    var LIFE = 620;               // 꼬리 수명(ms)

    function wake() { if (!raf) raf = requestAnimationFrame(tick); }

    function onMove(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      lastMoveAt = performance.now();
      if (!shown) {
        shown = true; bx = mx; by = my;
        brush.classList.add('on');
      }
      var target = e.target && e.target.closest ? e.target : null;
      var typing = target && target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], iframe');
      hidden = !!typing;
      brush.classList.toggle('off', hidden);
      targetScale = target && target.closest('a, button, summary, label, [role="button"], .treat-card, .case-card, .doctor-card') ? 1.28 : 1;
      wake();
    }

    function drop(x, y, speed) {
      var tr = trails[next];
      next = (next + 1) % POOL;
      tr.x = x; tr.y = y;
      tr.size = Math.max(0.55, 1.15 - speed * 0.012);  // 느리면 굵고 촉촉, 빠르면 가늘게
      tr.born = performance.now();
    }

    function tick(now) {
      // 붓끝은 포인터를 살짝 늦게 따라온다
      var px = bx, py = by;
      bx += (mx - bx) * 0.22;
      by += (my - by) * 0.22;
      var vx = bx - px, vy = by - py;
      var speed = Math.hypot(vx, vy);

      // 이동 방향으로 기울기 — 가로 이동은 좌우로, 세로 이동은 살짝 눕힘
      var want = BASE_TILT - Math.max(-30, Math.min(30, vx * 2.2)) + Math.max(-10, Math.min(10, vy * 0.8));
      tilt += (want - tilt) * 0.14;
      scale += (targetScale - scale) * 0.2;

      var tipX = bx + OFF_X, tipY = by + OFF_Y;
      brush.style.transform =
        'translate3d(' + (tipX - BW / 2).toFixed(2) + 'px,' + (tipY - BH).toFixed(2) + 'px,0) rotate(' + tilt.toFixed(2) + 'deg) scale(' + scale.toFixed(3) + ')';

      // 움직이는 동안만 먹 번짐 꼬리를 남긴다
      if (!hidden && speed > 0.6) {
        if (!lastDrop || Math.hypot(tipX - lastDrop.x, tipY - lastDrop.y) > 11) {
          drop(tipX, tipY, speed);
          lastDrop = { x: tipX, y: tipY };
        }
      }

      var active = false;
      for (var i = 0; i < POOL; i++) {
        var tr = trails[i];
        if (tr.born < 0) continue;
        var k = (now - tr.born) / LIFE;
        if (k >= 1) { tr.born = -1; tr.el.style.opacity = '0'; continue; }
        active = true;
        var s = tr.size * (0.45 + k * 0.95);            // 번지며 커지고
        tr.el.style.opacity = (0.26 * (1 - k) * (1 - k)).toFixed(3); // 옅어진다
        tr.el.style.transform = 'translate3d(' + tr.x.toFixed(1) + 'px,' + tr.y.toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
      }

      var settled = Math.abs(mx - bx) < 0.3 && Math.abs(my - by) < 0.3 &&
        Math.abs(targetScale - scale) < 0.01 && now - lastMoveAt > 250;
      if (active || !settled) { raf = requestAnimationFrame(tick); }
      else { raf = null; lastDrop = null; }
    }

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget) { brush.classList.remove('on'); shown = false; }
    });
    window.addEventListener('blur', function () { brush.classList.remove('on'); shown = false; });
  }

  /* ══════════ init ══════════ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
  function boot() {
    /* initHeroInk(); — 2026-09-16 원장 요청: 마우스 따라다니는 파란 붓선 제거 */
    initInkDrop();
    initBrushDividers();
    initScrollUnroll();
    initInkWipe();
    initBrushCursor();
  }
})();
