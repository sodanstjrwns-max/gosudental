/* GOSU DENTAL — front interactions */
(function () {
  'use strict';

  // Header scroll state
  const header = document.getElementById('site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  // Count-up stats
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const dur = 1600;
        const start = performance.now();
        const fmt = (v) => (Number.isInteger(target) ? Math.round(v) : v.toFixed(1));
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  }

  // Before/After sliders
  document.querySelectorAll('.ba-slider').forEach((slider) => {
    const after = slider.querySelector('.ba-after');
    const handle = slider.querySelector('.ba-handle');
    if (!after || !handle) return;
    const setPos = (clientX) => {
      const rect = slider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + '%';
    };
    let dragging = false;
    const start = (e) => { dragging = true; setPos(e.touches ? e.touches[0].clientX : e.clientX); };
    const move = (e) => { if (dragging) setPos(e.touches ? e.touches[0].clientX : e.clientX); };
    const end = () => { dragging = false; };
    slider.addEventListener('mousedown', start);
    slider.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
  });

  // Case filter
  const filterBar = document.querySelector('.case-filter');
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      filterBar.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.case-grid [data-cat]').forEach((card) => {
        card.style.display = cat === 'all' || card.dataset.cat === cat ? '' : 'none';
      });
    });
  }

  // Login state in header
  fetch('/api/auth/me').then((r) => r.json()).then((d) => {
    const link = document.getElementById('login-link');
    if (link && d.user) { link.textContent = d.user.name + '님'; link.href = '/auth/mypage'; }
  }).catch(() => {});

  // Region autocomplete (admin case form + anywhere with .region-ac)
  document.querySelectorAll('.region-ac').forEach((input) => {
    const wrap = input.closest('.ac-wrap');
    const list = wrap && wrap.querySelector('.ac-list');
    if (!list) return;
    let regions = null;
    input.addEventListener('input', async () => {
      const q = input.value.trim();
      if (!q) { list.classList.remove('open'); return; }
      if (!regions) {
        regions = await fetch('/api/regions').then((r) => r.json()).catch(() => []);
      }
      const matches = regions.filter((r) => r.includes(q)).slice(0, 8);
      list.innerHTML = matches.map((m) => `<div>${m}</div>`).join('');
      list.classList.toggle('open', matches.length > 0);
    });
    list.addEventListener('click', (e) => {
      if (e.target.tagName === 'DIV') { input.value = e.target.textContent; list.classList.remove('open'); }
    });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) list.classList.remove('open'); });
  });

  // Generic AJAX forms
  document.querySelectorAll('form[data-ajax]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      if (btn) btn.disabled = true;
      try {
        const fd = new FormData(form);
        const body = {};
        fd.forEach((v, k) => { body[k] = v; });
        form.querySelectorAll('input[type=checkbox]').forEach((cb) => { body[cb.name] = cb.checked; });
        const res = await fetch(form.action, {
          method: form.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.ok) {
          if (data.redirect) { location.href = data.redirect; return; }
          alert(data.message || '완료되었습니다.');
          form.reset();
        } else {
          alert(data.error || '오류가 발생했습니다.');
        }
      } catch (err) {
        alert('네트워크 오류가 발생했습니다.');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  });
})();
