/* 고수치과 메인 스크롤 몰입 연출 (GSAP ScrollTrigger + Lenis) — 수묵(水墨) 결
   - 글자는 모두 HTML 에 그대로 두고 움직임만 더한다(크롤러·AEO 영향 없음, JS 꺼져도 전부 보임)
   - 동작 줄이기 사용자는 아무것도 하지 않는다
   - ink.js 의 기존 연출(족자 펼침·붓 구분선·먹 와이프·붓 커서·클릭 먹물)과 히어로 CSS 애니메이션은 그대로 두고,
     단순 .reveal 페이드만 쓰던 블록을 넘겨받아 '먹 번짐·붓질·낙관' 어휘로 바꾼다
   - 리듬: 붓질처럼 천천히 시작해 한 번에 긋는다(power2.inOut), 글은 번지듯 또렷해진다(blur → 선명) */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  function start() {
  var root = document.documentElement;
  root.classList.add('mx');
  var mobile = matchMedia('(max-width: 767px)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var BRUSH = 'power2.inOut', BLEED = 'sine.out';

  // 1) 관성 스크롤 — 마우스·트랙패드만 (터치는 기본 스크롤)
  if (fine && window.Lenis) {
    var lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80 });
      });
    });
  }

  // 화면에 들어오면 한 번 재생 — 빠르게 지나쳐도 onEnter 가 불려 끝까지 재생, 탭이 숨어도 타임아웃으로 끝 상태 보장
  var TIMING = ['duration', 'ease', 'stagger', 'delay'];
  var claimed = [];
  function claim(list) { gsap.utils.toArray(list).forEach(function (el) { claimed.push(el); }); }
  function isClaimed(el) { return claimed.some(function (c) { return c === el || c.contains(el) || el.contains(c); }); }
  function takeover(el) { if (el) el.classList.remove('reveal', 'reveal-d1', 'reveal-d2', 'reveal-d3', 'reveal-d4'); return el; }
  function enter(targets, vars, trigger, start) {
    targets = gsap.utils.toArray(targets);
    if (!targets.length) return null;
    claim(targets);
    var from = {}, to = { opacity: 1, x: 0, y: 0, xPercent: 0, yPercent: 0, rotate: 0, skewX: 0, scale: 1, paused: true,
      onComplete: function () { gsap.set(targets, { clearProps: 'opacity,transform,transition,clipPath,filter' }); } };
    if ('clipPath' in vars) to.clipPath = vars.clipEnd || 'inset(0% 0% 0% 0%)';
    if ('filter' in vars) to.filter = 'blur(0px)';
    Object.keys(vars).forEach(function (k) { if (k !== 'clipEnd') (TIMING.indexOf(k) > -1 ? to : from)[k] = vars[k]; });
    gsap.set(targets, { transition: 'none' });
    var tw = gsap.fromTo(targets, from, to);
    ScrollTrigger.create({ trigger: trigger || targets[0], start: start || 'top 86%', once: true, onEnter: function () {
      tw.play();
      setTimeout(function () { if (tw.progress() < 1) tw.progress(1); }, (tw.totalDuration() + 0.6) * 1000);
    } });
    return tw;
  }
  function scrub(target, from, to, st) {
    claim(target);
    return gsap.fromTo(target, from, Object.assign({ ease: 'none', scrollTrigger: Object.assign({ scrub: true }, st) }, to));
  }
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var parts = node.textContent.split(/(\s+)/);
      if (parts.join('').trim() === '') return;
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        var i = document.createElement('span'); i.className = 'mx-ink'; i.textContent = p;
        frag.appendChild(i);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return el.querySelectorAll('.mx-ink');
  }
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return gsap.utils.toArray((ctx || document).querySelectorAll(sel)); };
  var kids = function (el) { return Array.prototype.filter.call(el.children, function (c) { return !/STYLE|SCRIPT/.test(c.tagName); }); };

  // 먹 번짐 낱말: 흐릿하게 번져 있다가 낱말마다 또렷해짐
  function inkWords(h, trigger, delay) {
    return enter(splitWords(h), { opacity: 0, filter: 'blur(10px)', y: 6, duration: 1.1, ease: BLEED, stagger: 0.07, delay: delay || 0 }, trigger || h, 'top 86%');
  }
  // 섹션 머리(영문 눈썹·제목·리드)
  function sectionHead(sec) {
    var eb = $(':scope > .section-inner > .eyebrow', sec), h = $(':scope > .section-inner > h2', sec), lead = $(':scope > .section-inner > .lead', sec);
    [eb, h, lead].forEach(takeover);
    if (eb) enter(eb, { x: -24, opacity: 0, duration: 1, ease: BRUSH }, eb, 'top 88%');
    if (h) inkWords(h, h, 0.1);
    if (lead) enter(lead, { opacity: 0, filter: 'blur(5px)', y: 10, duration: 1.2, ease: BLEED, delay: 0.25 }, lead, 'top 90%');
  }

  // ── 히어로: 먹빛 배경은 천천히, 세로 한자는 반대로 떠오르고, 글은 먼저 걷힘 (CSS 애니메이션과 겹치지 않게 translate 속성 사용)
  var hero = $('#hero-section');
  if (hero) {
    var st = { trigger: hero, start: 'top top', end: 'bottom top' };
    var bg = $('.hero-bg', hero), hanja = $('.hero-hanja', hero), seal = $('.hero-seal', hero), inner = $('.hero-inner', hero);
    if (bg) scrub(bg, { translate: '0px 0px' }, { translate: '0px ' + (mobile ? 40 : 120) + 'px' }, st);
    if (hanja) scrub(hanja, { translate: '0px 0px' }, { translate: '0px ' + (mobile ? -40 : -140) + 'px' }, st);
    if (seal) scrub(seal, { translate: '0px 0px' }, { translate: '0px ' + (mobile ? -20 : -70) + 'px' }, st);
    if (inner && !mobile) scrub(inner, { translate: '0px 0px', opacity: 1 }, { translate: '0px -90px', opacity: 0.2 }, st);
  }

  // ── 대표원장 소개: 사진이 붓 한 획처럼 왼쪽에서 오른쪽으로 그어지며 드러남, 글은 번지듯
  var dir = $('#director-introduction');
  if (dir) {
    var fig = $('.clinic-photo', dir), copy = $('.photo-story-copy', dir);
    if (fig) {
      enter(fig, { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.5, ease: BRUSH }, fig, 'top 82%');
      var fimg = $('img', fig); if (fimg) enter(fimg, { scale: 1.14, duration: 2, ease: 'power3.out' }, fig, 'top 82%');
    }
    if (copy) {
      var dh = $('h2', copy);
      enter(kids(copy).filter(function (c) { return c !== dh; }), { opacity: 0, filter: 'blur(6px)', y: 14, duration: 1.2, ease: BLEED, stagger: 0.1, delay: 0.3 }, copy, 'top 82%');
      if (dh) inkWords(dh, copy, 0.15);
    }
  }

  // ── 철학(먹 바탕): 세 장의 족자가 위에서 아래로 풀리고, 번호 낙관이 '쿵' 찍힘
  var phil = $('#philosophy-section');
  if (phil) {
    sectionHead(phil);
    var cards = $$('.phil-card', phil);
    cards.forEach(takeover);
    enter(cards, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.4, ease: BRUSH, stagger: 0.18 }, $('.phil-grid', phil), 'top 82%');
    $$('.phil-num', phil).forEach(function (n, i) {
      enter(n, { scale: 1.8, rotate: -14, opacity: 0, duration: 0.55, ease: 'back.out(2.4)', delay: 0.9 + i * 0.18 }, $('.phil-grid', phil), 'top 82%');
    });
  }

  // ── 핵심 진료: 사진 위로 먹이 퍼지듯 동그랗게 열리고, 작은 진료 칸은 붓 방향(왼→오)으로
  var core = $('#core-treatments-section');
  if (core) {
    sectionHead(core);
    var tcs = $$('.treat-card', core);
    tcs.forEach(takeover);
    enter(tcs, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.14 }, $('.treat-grid', core), 'top 85%');
    tcs.forEach(function (c, i) {
      var im = $('.treat-card-img', c);
      if (im) enter(im, { clipPath: 'circle(0% at 30% 70%)', clipEnd: 'circle(150% at 30% 70%)', duration: 1.6, ease: BRUSH, delay: 0.15 + i * 0.14 }, $('.treat-grid', core), 'top 85%');
    });
    var subs = $$('.treat-sub-grid > .treat-sub', core);
    subs.forEach(takeover);
    enter(subs, { x: -30, opacity: 0, filter: 'blur(4px)', duration: 1, ease: BLEED, stagger: 0.06 }, $('.treat-sub-grid', core), 'top 88%');
  }

  // ── 내포 진료 안내 카드: 차례로 올라오고 사진은 카드 안에서 천천히 내려앉음
  var area = $('#naepo-area-cards');
  if (area) {
    sectionHead(area);
    var lis = $$('.area-card-grid > li', area);
    enter(lis, { y: mobile ? 30 : 56, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: { each: 0.08, grid: 'auto', from: 'start' } }, lis[0], 'top 88%');
    $$('.area-card-img', area).forEach(function (box) {
      var img = $('img', box); if (!img) return;
      box.classList.add('mx-par');
      gsap.fromTo(img, { scale: 1.16, yPercent: -5 }, { scale: 1.04, yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  // ── 숫자 띠: 숫자가 낙관처럼 크게 번졌다가 제자리에 찍힘
  var stats = $$('#stats-section .stats-grid > div');
  if (stats.length) {
    stats.forEach(takeover);
    enter(stats, { scale: 1.25, opacity: 0, filter: 'blur(8px)', duration: 0.9, ease: 'power3.out', stagger: 0.14 }, '#stats-section', 'top 80%');
  }

  // ── 의료진: 팀 사진은 오른쪽에서 붓질로, 원장 카드는 차례로, 초상은 카드 안에서 시차
  var docs = $('#doctors-section');
  if (docs) {
    sectionHead(docs);
    var story = $('.home-team-story', docs);
    if (story) {
      var tf = $('.clinic-photo', story), ta = $('article', story);
      if (tf) enter(tf, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.5, ease: BRUSH }, story, 'top 82%');
      if (ta) enter(kids(ta), { opacity: 0, filter: 'blur(6px)', y: 12, duration: 1.1, ease: BLEED, stagger: 0.08, delay: 0.3 }, story, 'top 82%');
    }
    var dcs = $$('.doctor-card', docs);
    dcs.forEach(takeover);
    enter(dcs, { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.14 }, $('.doctor-grid', docs), 'top 86%');
    $$('.doctor-photo', docs).forEach(function (box) {
      var img = $('img', box); if (!img) return;
      box.classList.add('mx-par');
      gsap.fromTo(img, { scale: 1.12, yPercent: -4 }, { scale: 1.12, yPercent: 4, ease: 'none',
        scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  // ── 코트 위의 조원익(에디토리얼): 속공처럼 빠르게 — 제목은 비스듬히 미끄러져 들어오고, 사진들은 서로 다른 깊이로 흐름
  var court = $('#director-life-preview');
  if (court) {
    var ch = $('#court-story-title');
    if (ch) enter(splitWords(ch), { x: 46, skewX: -14, opacity: 0, duration: 0.8, ease: 'power4.out', stagger: 0.05 }, ch, 'top 86%');
    var intro = $('.court-intro', court);
    if (intro) enter(kids(intro).filter(function (c) { return c !== ch; }), { x: -30, opacity: 0, duration: 0.8, ease: 'power4.out', stagger: 0.08 }, intro, 'top 86%');
    var feat = $('.court-feature .clinic-photo', court);
    if (feat) {
      enter(feat, { clipPath: 'inset(12% 0% 12% 0%)', duration: 1.1, ease: 'power4.out' }, feat, 'top 85%');
      var fi = $('img', feat);
      if (fi) { $('.photo-open', feat).classList.add('mx-par'); gsap.fromTo(fi, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: feat, start: 'top bottom', end: 'bottom top', scrub: true } }); }
    }
    var vert = $('.court-vertical', court);
    if (vert) scrub(vert, { y: mobile ? 20 : 80 }, { y: mobile ? -20 : -80 }, { trigger: court, start: 'top bottom', end: 'bottom top' });
    var off = $('.court-offcourt', court);
    if (off) enter(kids(off), { x: mobile ? 0 : 60, y: mobile ? 30 : 0, opacity: 0, duration: 0.9, ease: 'power4.out', stagger: 0.12 }, off, 'top 86%');
    var foot = $('.court-footer', court);
    if (foot) {
      enter(kids(foot), { y: 30, opacity: 0, duration: 0.9, ease: 'power4.out', stagger: 0.1 }, foot, 'top 90%');
      var arrow = $('.court-link-arrow', foot);
      if (arrow) enter(arrow, { rotate: -135, scale: 0.6, opacity: 0, duration: 0.9, ease: 'back.out(1.8)', delay: 0.4 }, foot, 'top 90%');
    }
  }

  // ── 공간: 사진마다 다른 방향에서 붓으로 칠하듯 드러나고, 안에서는 시차
  var space = $('#space-section');
  if (space) {
    sectionHead(space);
    var dirs = { 'sp-a': 'inset(0% 100% 0% 0%)', 'sp-b': 'inset(0% 0% 100% 0%)', 'sp-c': 'inset(100% 0% 0% 0%)', 'sp-d': 'inset(0% 0% 0% 100%)', 'sp-e': 'inset(0% 100% 0% 0%)' };
    $$('.space-item', space).forEach(function (f, i) {
      takeover(f);
      var cls = Object.keys(dirs).filter(function (k) { return f.classList.contains(k); })[0];
      enter(f, { clipPath: dirs[cls] || 'inset(0% 100% 0% 0%)', duration: 1.4, ease: BRUSH, delay: (i % 3) * 0.12 }, f, 'top 88%');
      var img = $('img', f); if (!img) return;
      gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: 'none',
        scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    var more = $('#space-section .section-inner > p.reveal:last-child');
    if (more) { takeover(more); enter(more, { opacity: 0, y: 14, duration: 0.9, ease: 'power2.out' }, more, 'top 92%'); }
  }

  // ── 장비: 바둑판 순서로 번지듯
  var eq = $('#equipment-section');
  if (eq) {
    sectionHead(eq);
    var items = $$('.equipment-grid > .treat-sub', eq);
    items.forEach(takeover);
    enter(items, { y: 24, opacity: 0, filter: 'blur(6px)', duration: 1, ease: BLEED, stagger: { each: 0.07, grid: 'auto', from: 'start' } }, $('.equipment-grid', eq), 'top 88%');
  }

  // ── 상담 예약: 먹 띠가 다가오며 커지고, 문장은 번지고, 버튼은 낙관처럼 찍힘
  var cta = $('#cta-section .cta-band');
  if (cta) {
    takeover(cta);
    scrub(cta, { scale: mobile ? 0.95 : 0.9 }, { scale: 1 }, { trigger: cta, start: 'top bottom', end: 'top 40%' });
    var h2 = $('h2', cta), p = $('p', cta), btn = $('.hero-btn', cta);
    if (h2) inkWords(h2, cta, 0.05);
    if (p) enter(p, { opacity: 0, filter: 'blur(5px)', duration: 1.1, ease: BLEED, delay: 0.4 }, cta, 'top 86%');
    if (btn) enter(btn, { scale: 1.4, opacity: 0, duration: 0.55, ease: 'back.out(2.2)', delay: 0.8 }, cta, 'top 86%');
  }

  // ── 기존 등장 신호(.reveal→visible, 족자 unrolled, 붓 구분선 drawn)는 모양 그대로 두고 신호만 넘겨받는다:
  //    IO 는 빠르게 건너뛴 구간을 놓치지만 ScrollTrigger 는 지나친 구간에도 onEnter 를 불러 반드시 끝 상태가 된다
  [['main .reveal', 'visible', 'top 92%'], ['main .quote-band', 'unrolled', 'top 70%'], ['main .brush-divider', 'drawn', 'top 85%']].forEach(function (r) {
    $$(r[0]).forEach(function (el) {
      if (el.classList.contains(r[1])) return;
      ScrollTrigger.create({ trigger: el, start: r[2], once: true, onEnter: function () { el.classList.add(r[1]); } });
    });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
