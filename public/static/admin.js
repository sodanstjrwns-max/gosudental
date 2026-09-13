/* GOSU DENTAL — create/edit with explicit error handling and preserved images. */
(() => {
  'use strict';
  async function request(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || '요청을 처리하지 못했습니다. 다시 로그인하거나 잠시 후 시도해주세요.');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('응답이 지연됩니다. 저장 여부를 목록에서 확인한 후 다시 시도해주세요.');
      throw error;
    } finally { clearTimeout(timer); }
  }
  const json = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const form = document.querySelector('form[data-content-kind]');
  if (form) {
    const kind = form.dataset.contentKind;
    const submit = form.querySelector('[type=submit]');
    const initialLabel = submit.textContent;
    const status = form.querySelector('.edit-status');
    const cancel = form.querySelector('.cancel-edit');
    const editor = document.getElementById('editor');
    let dirty = false;
    form.addEventListener('input', () => { dirty = true; });
    form.addEventListener('change', () => { dirty = true; });
    window.addEventListener('beforeunload', e => {
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    });
    const reset = () => {
      dirty = false;
      form.reset(); delete form.dataset.editId;
      if (editor) editor.replaceChildren();
      form.querySelectorAll('[data-preview]').forEach(el => el.replaceChildren());
      form.querySelector('.edit-heading').textContent = '새 콘텐츠 작성';
      submit.textContent = initialLabel;
      cancel.hidden = true; status.textContent = '';
    };
    cancel.addEventListener('click', () => { if (confirm('수정 중인 내용을 취소하시겠습니까?')) reset(); });
    document.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', async () => {
      if ((dirty || form.dataset.editId) && !confirm('현재 수정 중인 내용을 버리고 다른 항목을 여시겠습니까?')) return;
      btn.disabled = true;
      try {
        const { item } = await request('/api/admin/' + kind + '/' + btn.dataset.id);
        reset(); form.dataset.editId = item.id;
        for (const [key, value] of Object.entries(item)) {
          const input = form.elements.namedItem(key);
          if (!input || input.type === 'file') continue;
          if (input.type === 'checkbox') input.checked = !!value;
          else input.value = value == null ? '' : String(value);
        }
        if (editor) editor.innerHTML = item.content || ''; // server sanitizes on both GET and save
        form.querySelectorAll('[data-preview]').forEach(el => {
          const field = el.dataset.preview;
          if (!item[field]) return;
          const img = document.createElement('img'); img.className = 'existing-image'; img.alt = '현재 등록된 이미지';
          img.src = kind === 'cases' ? '/api/case-image/' + item.id + '/' + field : item[field];
          el.append(img);
        });
        form.querySelector('.edit-heading').textContent = '수정 중: #' + item.id;
        submit.textContent = '변경사항 저장'; cancel.hidden = false;
        status.textContent = '기존 사진은 새 파일을 선택하거나 삭제에 체크하지 않으면 유지됩니다.';
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        form.elements.namedItem('title').focus({ preventScroll: true });
      } catch (e) { alert(e.message); }
      finally { btn.disabled = false; }
    }));
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (submit.disabled) return;
      for (const input of form.querySelectorAll('input[type=file]')) {
        const file = input.files[0];
        if (file && (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
          status.textContent = 'JPG·PNG·WebP 이미지를 한 장당 5MB 이하로 선택해주세요.'; return;
        }
      }
      const id = form.dataset.editId;
      const method = id ? 'PUT' : 'POST';
      const url = '/api/admin/' + kind + (id ? '/' + id : '');
      submit.disabled = true; status.textContent = '저장 중입니다…';
      try {
        const fd = new FormData(form);
        const options = kind === 'posts'
          ? json(method, { ...Object.fromEntries(fd), content: editor.innerHTML, published: fd.get('published') === '1' })
          : { method, body: fd };
        await request(url, options);
        status.textContent = '저장되었습니다.';
        dirty = false;
        location.reload();
      } catch (e) { status.textContent = e.message; }
      finally { submit.disabled = false; }
    });
  }
  document.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('이 항목을 삭제하시겠습니까? 되돌릴 수 없습니다.')) return;
    btn.disabled = true;
    try { await request('/api/admin/' + btn.dataset.delete + '/' + btn.dataset.id, { method: 'DELETE' }); location.reload(); }
    catch (e) { alert(e.message); btn.disabled = false; }
  }));
  document.querySelectorAll('[data-pin]').forEach(btn => btn.addEventListener('click', async () => {
    btn.disabled = true;
    try { await request('/api/admin/notices/' + btn.dataset.pin, json('PUT', { pinned: Number(btn.dataset.value) })); location.reload(); }
    catch (e) { alert(e.message); btn.disabled = false; }
  }));
  document.querySelectorAll('[data-reservation]').forEach(input => input.addEventListener('change', async () => {
    input.disabled = true;
    try { await request('/api/admin/reservations/' + input.dataset.reservation, json('PUT', { status: input.value })); input.dataset.previous = input.value; }
    catch (e) { input.value = input.dataset.previous; alert(e.message); }
    finally { input.disabled = false; }
  }));
})();
