/* GOSU DENTAL — front interactions */
(function () {
  'use strict';

  // Header scroll state
  const header = document.getElementById('site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu — 스크롤 잠금 + 링크 클릭 시 자동 닫힘
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    const setMenu = (open) => {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      document.body.classList.toggle('menu-open', open);
      document.querySelectorAll('main,.site-footer,.mobile-cta-bar').forEach((el) => { el.inert = open; });
      if (!open && menu.contains(document.activeElement)) toggle.focus();
    };
    toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (e) => {
      if (!menu.classList.contains('open')) return;
      if (e.key === 'Escape') { setMenu(false); toggle.focus(); }
      if (e.key === 'Tab') {
        const items = [toggle, ...menu.querySelectorAll('a,summary')].filter((el) => el.getClientRects().length);
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // 화면 회전/리사이즈로 데스크톱 폭이 되면 잠금 해제
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && menu.classList.contains('open')) setMenu(false);
    }, { passive: true });
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
    const setPercent = (value) => {
      const pct = Math.max(2, Math.min(98, value));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + '%';
      handle.setAttribute('aria-valuenow', String(Math.round(pct)));
    };
    const setPos = (clientX) => {
      const rect = slider.getBoundingClientRect();
      if (rect.width) setPercent(((clientX - rect.left) / rect.width) * 100);
    };
    handle.addEventListener('keydown', (e) => {
      const current = Number(handle.getAttribute('aria-valuenow'));
      const next = { ArrowLeft: current - 5, ArrowRight: current + 5, Home: 2, End: 98 }[e.key];
      if (next !== undefined) { e.preventDefault(); setPercent(next); }
    });
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
    filterBar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.classList.contains('active'))));
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      filterBar.querySelectorAll('button').forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      const cat = btn.dataset.cat;
      document.querySelectorAll('.case-grid [data-cat]').forEach((card) => {
        card.style.display = cat === 'all' || card.dataset.cat === cat ? '' : 'none';
      });
    });
  }

  // Login state in header
  if (document.getElementById('login-link')) fetch('/api/auth/me').then((r) => r.json()).then((d) => {
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
    const status = document.createElement('p');
    status.className = 'form-feedback';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.tabIndex = -1;
    form.append(status);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      if (form.dataset.submitting === 'true') return;
      form.dataset.submitting = 'true';
      form.setAttribute('aria-busy', 'true');
      if (btn) btn.disabled = true;
      status.textContent = '처리 중입니다…';
      status.dataset.error = 'false';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const fd = new FormData(form);
        const body = {};
        fd.forEach((v, k) => { body[k] = v; });
        form.querySelectorAll('input[type=checkbox]').forEach((cb) => { body[cb.name] = cb.checked; });
        const res = await fetch(form.action, {
          method: form.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || '처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
        const redirect = data.redirect || form.dataset.successRedirect;
        if (redirect) { location.href = redirect; return; }
        status.textContent = data.message || '완료되었습니다.';
        form.reset();
        status.focus();
      } catch (err) {
        status.dataset.error = 'true';
        status.textContent = err.name === 'AbortError'
          ? '응답이 지연되고 있습니다. 접수 여부를 확인한 후 다시 시도해주세요.'
          : err instanceof TypeError ? '연결이 끊겼습니다. 입력 내용은 유지됩니다. 접수 여부를 확인 후 다시 시도해주세요.' : err.message;
        status.focus();
      } finally {
        clearTimeout(timeout);
        form.dataset.submitting = 'false';
        form.removeAttribute('aria-busy');
        if (btn) btn.disabled = false;
      }
    });
  });
})();
