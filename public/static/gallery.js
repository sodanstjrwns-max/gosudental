/* Owner-supplied photo galleries: native modal, keyboard navigation and touch swipe. */
(() => {
  'use strict';
  const links = [...document.querySelectorAll('[data-photo-group]')];
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  if (typeof dialog.showModal !== 'function') return; // Links still open photos without JS support.
  dialog.className = 'photo-lightbox';
  dialog.setAttribute('aria-label', '사진 크게 보기');
  dialog.setAttribute('aria-describedby', 'lightbox-caption');
  dialog.innerHTML = '<div class="lightbox-toolbar"><span class="lightbox-counter" aria-live="polite"></span><button type="button" class="lightbox-close" aria-label="사진 닫기">닫기 ×</button></div><div class="lightbox-stage"><img class="lightbox-image" alt=""></div><p id="lightbox-caption" class="lightbox-caption"></p><nav class="lightbox-controls" aria-label="사진 넘기기"><button type="button" class="lightbox-prev" aria-label="이전 사진">← 이전</button><button type="button" class="lightbox-next" aria-label="다음 사진">다음 →</button></nav>';
  document.body.append(dialog);
  const image = dialog.querySelector('.lightbox-image');
  const counter = dialog.querySelector('.lightbox-counter');
  const caption = dialog.querySelector('.lightbox-caption');
  const previous = dialog.querySelector('.lightbox-prev');
  const next = dialog.querySelector('.lightbox-next');
  let group = [], index = 0, opener = null, pointerStart = null;
  function show(step = 0) {
    index = (index + step + group.length) % group.length;
    const item = group[index];
    const text = item.dataset.photoCaption || '';
    image.alt = text; image.src = item.href;
    caption.textContent = text;
    counter.textContent = (index + 1) + ' / ' + group.length;
    previous.hidden = next.hidden = group.length < 2;
  }
  links.forEach(link => link.addEventListener('click', e => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault(); e.stopPropagation();
    opener = link;
    group = links.filter(item => item.dataset.photoGroup === link.dataset.photoGroup);
    index = group.indexOf(link); show();
    dialog.showModal(); document.body.classList.add('photo-viewer-open');
    dialog.querySelector('.lightbox-close').focus();
  }));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => show(-1));
  next.addEventListener('click', () => show(1));
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(1); }
  });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('photo-viewer-open');
    image.removeAttribute('src');
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  });
  image.addEventListener('pointerdown', e => { pointerStart = e.pointerType === 'touch' ? e.clientX : null; });
  image.addEventListener('pointerup', e => {
    if (pointerStart !== null && Math.abs(e.clientX - pointerStart) > 50) show(e.clientX < pointerStart ? 1 : -1);
    pointerStart = null;
  });
  image.addEventListener('pointercancel', () => { pointerStart = null; });
})();
