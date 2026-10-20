import { html, raw } from 'hono/html'
import { DOCTORS } from '../data/site'
import { safeJson } from '../security'
import { siteStyles } from '../styles.generated'
import { CASE_CATEGORIES } from './cases'

function adminShell(active: string, title: string, body: any) {
  return html`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — 고수치과 관리자</title>
<meta name="robots" content="noindex,nofollow">
<style>${raw(siteStyles)}</style>
</head>
<body>
<div class="admin-shell">
  <aside class="admin-side">
    <h2><i class="fas fa-tooth" style="margin-right:8px"></i>고수치과 관리자</h2>
    <a href="/admin" class="${active === 'dash' ? 'active' : ''}"><i class="fas fa-gauge" style="width:20px"></i> 대시보드</a>
    <a href="/admin/cases" class="${active === 'cases' ? 'active' : ''}"><i class="fas fa-images" style="width:20px"></i> 비포&애프터</a>
    <a href="/admin/posts" class="${active === 'posts' ? 'active' : ''}"><i class="fas fa-pen-nib" style="width:20px"></i> 원장 칼럼</a>
    <a href="/admin/notices" class="${active === 'notices' ? 'active' : ''}"><i class="fas fa-bullhorn" style="width:20px"></i> 공지사항</a>
    <a href="/admin/fees" class="${active === 'fees' ? 'active' : ''}"><i class="fas fa-won-sign" style="width:20px"></i> 비급여 수가</a>
    <a href="/admin/users" class="${active === 'users' ? 'active' : ''}"><i class="fas fa-users" style="width:20px"></i> 회원 관리</a>
    <a href="/admin/reservations" class="${active === 'resv' ? 'active' : ''}"><i class="fas fa-calendar-check" style="width:20px"></i> 예약 관리</a>
    <a href="/admin/recruit" class="${active === 'recruit' ? 'active' : ''}"><i class="fas fa-user" style="width:20px"></i> 채용 지원</a>
    <a href="/admin/stats" class="${active === 'stats' ? 'active' : ''}"><i class="fas fa-chart-line" style="width:20px"></i> 통합 통계</a>
    <a href="/" style="margin-top:20px"><i class="fas fa-arrow-up-right-from-square" style="width:20px"></i> 사이트 보기</a>
    <a href="#" onclick="fetch('/api/admin/logout',{method:'POST'}).then(()=>location.href='/admin/login')" ><i class="fas fa-right-from-bracket" style="width:20px"></i> 로그아웃</a>
  </aside>
  <main class="admin-main">${body}</main>
</div>
<script src="/static/admin.js?v=20261021-recruit" defer></script>
</body>
</html>`
}

export function adminLoginPage() {
  return html`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>관리자 로그인 — 고수치과</title>
<meta name="robots" content="noindex,nofollow">
<style>${raw(siteStyles)}</style>
</head>
<body style="background:var(--brand-mist)">
<section style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px">
  <div style="width:100%;max-width:400px">
    <div style="text-align:center;margin-bottom:28px">
      <img src="/static/img/logo-stack.png" alt="고수치과" width="110" style="margin:0 auto 14px">
      <h1 style="font-size:22px;font-weight:800;color:var(--brand-dark)">관리자 로그인</h1>
    </div>
    <form class="form-card" data-ajax action="/api/admin/login" method="POST" data-success-redirect="/admin">
      <div class="form-group">
        <label for="admin-field-1">비밀번호</label>
        <input id="admin-field-1" class="form-control" name="password" type="password" required autocomplete="current-password" autofocus>
      </div>
      <button type="submit" class="btn-submit">로그인</button>
    </form>
  </div>
</section>
<script src="/static/app.js?v=20260913-delivery" defer></script>
</body>
</html>`
}

export function adminDashPage(stats: { users: number; cases: number; posts: number; notices: number; resv: number; recruit: number; totalViews: number }) {
  return adminShell('dash', '대시보드', html`
<h1>대시보드</h1>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
  <div class="admin-card"><p style="font-size:13px;color:var(--ink-mute)">회원 수</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.users}</p></div>
  <div class="admin-card"><p style="font-size:13px;color:var(--ink-mute)">비포&애프터 케이스</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.cases}</p></div>
  <div class="admin-card"><p style="font-size:13px;color:var(--ink-mute)">칼럼 게시물</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.posts}</p></div>
  <div class="admin-card"><p style="font-size:13px;color:var(--ink-mute)">공지사항</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.notices}</p></div>
  <div class="admin-card"><p style="font-size:13px;color:var(--ink-mute)">예약 신청</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.resv}</p></div>
  <a class="admin-card" href="/admin/recruit"><p style="font-size:13px;color:var(--ink-mute)">채용 지원</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.recruit}</p></a>
  <div class="admin-card"><p style="font-size:13px;color:var(--ink-mute)">총 조회수 (봇 제외)</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.totalViews}</p></div>
</div>`)
}

export function adminUsersPage(users: any[]) {
  return adminShell('users', '회원 관리', html`
<h1>회원 관리 (${users.length})</h1>
<div class="admin-card">
  <table class="admin-table" tabindex="0" aria-label="등록 목록, 좌우 방향키로 가로 스크롤">
    <thead><tr><th>ID</th><th>이름</th><th>이메일</th><th>전화번호</th><th>마케팅 동의</th><th>가입일</th><th></th></tr></thead>
    <tbody>
      ${users.map((u) => html`
      <tr>
        <td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.phone}</td>
        <td>${u.marketing_consent ? '✅' : '—'}</td>
        <td>${(u.created_at || '').slice(0, 10)}</td>
        <td><button class="admin-btn danger" data-delete="users" data-id="${u.id}">삭제</button></td>
      </tr>`)}
    </tbody>
  </table>
</div>`)
}

export function adminReservationsPage(items: any[]) {
  return adminShell('resv', '예약 관리', html`
<h1>예약 관리 (${items.length})</h1>
<div class="admin-card">
  <table class="admin-table" tabindex="0" aria-label="등록 목록, 좌우 방향키로 가로 스크롤">
    <thead><tr><th>ID</th><th>이름</th><th>연락처</th><th>진료</th><th>희망 일시</th><th>메시지</th><th>상태</th><th>신청일</th></tr></thead>
    <tbody>
      ${items.map((r) => html`
      <tr>
        <td>${r.id}</td><td>${r.name}</td><td>${r.phone}</td><td>${r.category || '—'}</td>
        <td>${r.preferred_at || '—'}</td><td style="max-width:200px">${r.message || '—'}</td>
        <td>
          <select aria-label="예약 상태" data-reservation="${r.id}" data-previous="${r.status}">
            <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>대기</option>
            <option value="confirmed" ${r.status === 'confirmed' ? 'selected' : ''}>확정</option>
            <option value="done" ${r.status === 'done' ? 'selected' : ''}>완료</option>
            <option value="canceled" ${r.status === 'canceled' ? 'selected' : ''}>취소</option>
          </select>
        </td>
        <td>${(r.created_at || '').slice(0, 10)}</td>
      </tr>`)}
    </tbody>
  </table>
</div>`)
}

export function adminCasesPage(cases: any[]) {
  return adminShell('cases', '비포&애프터', html`
<h1>비포&애프터 관리</h1>
<div class="admin-card">
  <h2 style="font-size:17px;font-weight:800;margin-bottom:18px;color:var(--brand-dark)">새 케이스 등록</h2>
  <form id="case-form" data-content-kind="cases">
    <div class="admin-edit-actions"><strong class="edit-heading">새 콘텐츠 작성</strong><button class="admin-btn ghost cancel-edit" type="button" hidden>수정 취소 / 새로 작성</button></div>
    <p class="edit-status" role="status" aria-live="polite"></p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="form-group"><label for="admin-field-2">제목 *</label><input id="admin-field-2" class="form-control" name="title" required placeholder="예: 상실된 어금니, 임플란트로 저작 기능 회복"></div>
      <div class="form-group"><label for="admin-field-3">진료 카테고리 *</label>
        <select id="admin-field-3" class="form-control" name="category" required>
          ${CASE_CATEGORIES.map((c) => html`<option value="${c}">${c}</option>`)}
        </select>
      </div>
      <div class="form-group"><label for="admin-field-4">환자 나이대</label>
        <select id="admin-field-4" class="form-control" name="age_group"><option value="">선택</option><option>10대</option><option>20대</option><option>30대</option><option>40대</option><option>50대</option><option>60대</option><option>70대 이상</option></select>
      </div>
      <div class="form-group"><label for="admin-field-5">성별</label>
        <select id="admin-field-5" class="form-control" name="gender"><option value="">선택</option><option>여성</option><option>남성</option></select>
      </div>
      <div class="form-group ac-wrap"><label for="admin-field-6">지역 (자동완성)</label>
        <input id="admin-field-6" class="form-control region-ac" name="region" placeholder="예: 삽교 → 충청남도 예산군 삽교읍" autocomplete="off">
        <div class="ac-list"></div>
      </div>
      <div class="form-group"><label for="admin-field-7">담당 원장</label>
        <select id="admin-field-7" class="form-control" name="doctor_slug">
          ${DOCTORS.map((d) => html`<option value="${d.slug}">${d.name} (${d.role})</option>`)}
        </select>
      </div>
      <div class="form-group"><label for="admin-field-8">치료 기간</label><input id="admin-field-8" class="form-control" name="duration" placeholder="예: 3개월"></div>
    </div>
    <div class="form-group"><label for="admin-field-9">케이스 설명</label><textarea id="admin-field-9" class="form-control" name="description" placeholder="치료 과정과 결과를 설명해주세요 (SEO에 반영됩니다)"></textarea></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
      <div class="form-group"><label for="admin-field-10">파노라마 전</label><input id="admin-field-10" class="form-control" type="file" name="pano_before" accept="image/jpeg,image/png,image/webp"><div data-preview="pano_before"></div><label class="form-check"><input type="checkbox" name="remove_pano_before"> 기존 이미지 삭제</label></div>
      <div class="form-group"><label for="admin-field-11">파노라마 후</label><input id="admin-field-11" class="form-control" type="file" name="pano_after" accept="image/jpeg,image/png,image/webp"><div data-preview="pano_after"></div><label class="form-check"><input type="checkbox" name="remove_pano_after"> 기존 이미지 삭제</label></div>
      <div class="form-group"><label for="admin-field-12">구내포토 전</label><input id="admin-field-12" class="form-control" type="file" name="photo_before" accept="image/jpeg,image/png,image/webp"><div data-preview="photo_before"></div><label class="form-check"><input type="checkbox" name="remove_photo_before"> 기존 이미지 삭제</label></div>
      <div class="form-group"><label for="admin-field-13">구내포토 후</label><input id="admin-field-13" class="form-control" type="file" name="photo_after" accept="image/jpeg,image/png,image/webp"><div data-preview="photo_after"></div><label class="form-check"><input type="checkbox" name="remove_photo_after"> 기존 이미지 삭제</label></div>
    </div>
    <div class="form-group"><label for="admin-field-14">공개 상태</label><select id="admin-field-14" name="published" class="form-control"><option value="1">공개</option><option value="0">비공개</option></select></div>
    <p>JPG·PNG·WebP, 한 장당 최대 5MB. 새 파일을 선택하지 않으면 기존 사진을 유지합니다.</p>
    <button type="submit" class="admin-btn" style="padding:12px 28px;font-size:15px">케이스 등록</button>
  </form>
</div>

<div class="admin-card">
  <h2 style="font-size:17px;font-weight:800;margin-bottom:18px;color:var(--brand-dark)">등록된 케이스 (${cases.length})</h2>
  <table class="admin-table" tabindex="0" aria-label="등록 목록, 좌우 방향키로 가로 스크롤">
    <thead><tr><th>ID</th><th>제목</th><th>카테고리</th><th>지역</th><th>담당</th><th>조회수</th><th>등록일</th><th></th></tr></thead>
    <tbody>
      ${cases.map((c) => html`
      <tr>
        <td>${c.id}</td>
        <td><a href="/cases/${c.id}" target="_blank" style="color:var(--brand);font-weight:600">${c.title}</a></td>
        <td>${c.category}</td><td>${c.region || '—'}</td>
        <td>${(DOCTORS.find((d) => d.slug === c.doctor_slug) || {}).name || '—'}</td>
        <td>${c.views}</td><td>${(c.created_at || '').slice(0, 10)}</td>
        <td><button class="admin-btn ghost" type="button" data-edit="cases" data-id="${c.id}">수정</button> <button class="admin-btn danger" data-delete="cases" data-id="${c.id}">삭제</button></td>
      </tr>`)}
    </tbody>
  </table>
</div>

<script src="/static/app.js?v=20260913-delivery"></script>
`)
}

const EDITOR_SCRIPT = raw(`<script>
/* 칼럼 에디터 — 2026-10-15 확장: 밑줄·번호 목록·표(삽입·행/열 편집)·HTML 보기/편집·붙여넣기 정리.
   저장 시 서버(security.ts sanitizeContent)가 허용 태그만 남기므로 여기 정리는 편의용 1차 정리다. */
var colSavedRange = null;
function colEd() { return document.getElementById('editor'); }
function colInEditor(node) { var ed = colEd(); return !!(ed && node && (node === ed || ed.contains(node))); }
function colSaveRange() {
  var sel = window.getSelection();
  if (sel && sel.rangeCount && colInEditor(sel.getRangeAt(0).commonAncestorContainer)) colSavedRange = sel.getRangeAt(0).cloneRange();
}
function colRestoreRange() {
  var ed = colEd(); ed.focus();
  var sel = window.getSelection();
  if (colSavedRange && colInEditor(colSavedRange.commonAncestorContainer)) { sel.removeAllRanges(); sel.addRange(colSavedRange); return; }
  var r = document.createRange(); r.selectNodeContents(ed); r.collapse(false); sel.removeAllRanges(); sel.addRange(r);
}
function colChanged() { var f = document.getElementById('post-form'); if (f) f.dispatchEvent(new Event('input', { bubbles: true })); colUpdateTableTools(); }
function execCmd(cmd, val) { if (colHtmlMode()) return; colRestoreRange(); document.execCommand(cmd, false, val || null); colSaveRange(); colChanged(); }
function insertHeading(tag) { if (colHtmlMode()) return; colRestoreRange(); document.execCommand('formatBlock', false, tag); colSaveRange(); colChanged(); }
function insertLink() {
  if (colHtmlMode()) return;
  colSaveRange();
  var url = prompt('링크 주소 (https://… 또는 /treatments/… )');
  if (!url) return;
  if (!/^(https?:\\/\\/|\\/(?!\\/)|#|mailto:|tel:)/i.test(url)) { alert('https:// 로 시작하는 주소나 사이트 안 주소(/로 시작)만 넣을 수 있습니다.'); return; }
  execCmd('createLink', url);
}
async function uploadImage(file) {
  const fd = new FormData(); fd.append('image', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const d = await res.json();
  if (!res.ok || !d.ok) throw new Error(d.error || '이미지 업로드 실패');
  return d.url;
}
async function colInsertImageFile(file) {
  try { const url = await uploadImage(file); if (url) { colRestoreRange(); document.execCommand('insertImage', false, url); colSaveRange(); colChanged(); } } catch (e) { alert(e.message); }
}
function pickImage() {
  if (colHtmlMode()) return;
  colSaveRange();
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/jpeg,image/png,image/webp';
  inp.onchange = () => { if (inp.files[0]) colInsertImageFile(inp.files[0]); };
  inp.click();
}

/* ── 붙여넣기·HTML 정리(허용 태그만, 속성 제거) ── */
var COL_ALLOWED = { P:1, BR:1, H2:1, H3:1, H4:1, STRONG:1, B:1, EM:1, I:1, U:1, S:1, UL:1, OL:1, LI:1, BLOCKQUOTE:1, A:1, IMG:1, FIGURE:1, FIGCAPTION:1, HR:1, TABLE:1, CAPTION:1, THEAD:1, TBODY:1, TFOOT:1, TR:1, TH:1, TD:1, DIV:1, SPAN:1 };
var COL_DROP = { SCRIPT:1, STYLE:1, IFRAME:1, OBJECT:1, EMBED:1, SVG:1, MATH:1, TEXTAREA:1, NOSCRIPT:1, TEMPLATE:1, HEAD:1, META:1, LINK:1, TITLE:1, BUTTON:1, INPUT:1, SELECT:1, FORM:1, VIDEO:1, AUDIO:1, CANVAS:1 };
var COL_KEEP_ATTR = { A: ['href', 'title'], IMG: ['src', 'alt', 'width', 'height'], TH: ['colspan', 'rowspan'], TD: ['colspan', 'rowspan'] };
function colCleanHtml(htmlStr, report) {
  var doc = new DOMParser().parseFromString('<body>' + String(htmlStr || '') + '</body>', 'text/html');
  var droppedImages = 0;
  (function walk(node) {
    Array.from(node.childNodes).forEach(function (el) {
      if (el.nodeType === 8) { el.remove(); return; }
      if (el.nodeType !== 1) return;
      var tag = el.tagName;
      if (COL_DROP[tag]) { el.remove(); return; }
      if (tag === 'H1') { var h2 = doc.createElement('h2'); while (el.firstChild) h2.appendChild(el.firstChild); el.replaceWith(h2); el = h2; tag = 'H2'; }
      if (!COL_ALLOWED[tag]) { walk(el); el.replaceWith.apply(el, Array.from(el.childNodes)); return; }
      var keep = COL_KEEP_ATTR[tag] || [];
      Array.from(el.attributes).forEach(function (at) { if (keep.indexOf(at.name) < 0) el.removeAttribute(at.name); });
      if (tag === 'A') { var h = el.getAttribute('href') || ''; if (!/^(https?:\\/\\/|\\/(?!\\/)|#|mailto:|tel:)/i.test(h)) el.removeAttribute('href'); }
      if (tag === 'IMG') { var src = el.getAttribute('src') || ''; if (!/^\\/(api\\/uploads|static\\/img)\\/[\\w.\\/-]+\\.(jpe?g|png|webp)$/i.test(src)) { droppedImages++; el.remove(); return; } }
      walk(el);
    });
  })(doc.body);
  if (report) report.droppedImages = droppedImages;
  return doc.body.innerHTML;
}
function colPrettyHtml(h) {
  return String(h || '')
    .replace(/\\s*(<(?:p|div|h[1-6]|ul|ol|li|table|thead|tbody|tfoot|tr|blockquote|figure|hr)\\b)/gi, '\\n$1')
    .replace(/(<\\/(?:p|div|h[1-6]|ul|ol|table|thead|tbody|tfoot|tr|blockquote|figure)>)/gi, '$1\\n')
    .replace(/\\n{2,}/g, '\\n').trim();
}

/* ── HTML 보기/편집 ── */
function colHtmlMode() { var t = document.getElementById('editor-html'); return !!(t && !t.hidden); }
function colEditorSync() { if (colHtmlMode()) colEd().innerHTML = colCleanHtml(document.getElementById('editor-html').value); }
function colEditorExitHtml(discard) {
  var t = document.getElementById('editor-html'); if (!t || t.hidden) return;
  if (!discard) colEditorSync();
  t.hidden = true; colEd().hidden = false;
  var btn = document.getElementById('tb-html'); btn.setAttribute('aria-pressed', 'false'); btn.textContent = '</> HTML';
  document.querySelectorAll('.editor-toolbar [data-wysiwyg]').forEach(function (b) { b.disabled = false; });
}
function toggleHtml() {
  var t = document.getElementById('editor-html'), ed = colEd(), btn = document.getElementById('tb-html');
  if (!colHtmlMode()) {
    t.value = colPrettyHtml(ed.innerHTML); ed.hidden = true; t.hidden = false; t.focus();
    btn.setAttribute('aria-pressed', 'true'); btn.textContent = '편집기로 돌아가기';
    document.querySelectorAll('.editor-toolbar [data-wysiwyg]').forEach(function (b) { b.disabled = true; });
    document.getElementById('table-pop').hidden = true;
  } else { colEditorExitHtml(false); colChanged(); }
}
window.colEditorSync = colEditorSync;
window.colEditorExitHtml = colEditorExitHtml;

/* ── 표 ── */
function toggleTablePop() {
  if (colHtmlMode()) return;
  colSaveRange();
  var pop = document.getElementById('table-pop'); pop.hidden = !pop.hidden;
  if (!pop.hidden) document.getElementById('tbl-rows').focus();
}
function insertTable() {
  var rows = Math.min(30, Math.max(1, parseInt(document.getElementById('tbl-rows').value, 10) || 3));
  var cols = Math.min(10, Math.max(1, parseInt(document.getElementById('tbl-cols').value, 10) || 3));
  var head = document.getElementById('tbl-head').checked;
  var h = '<table>';
  if (head) { h += '<thead><tr>'; for (var c = 0; c < cols; c++) h += '<th><br></th>'; h += '</tr></thead>'; }
  h += '<tbody>';
  var bodyRows = head ? Math.max(1, rows - 1) : rows;
  for (var r = 0; r < bodyRows; r++) { h += '<tr>'; for (var c2 = 0; c2 < cols; c2++) h += '<td><br></td>'; h += '</tr>'; }
  h += '</tbody></table><p><br></p>';
  colRestoreRange();
  document.execCommand('insertHTML', false, h);
  document.getElementById('table-pop').hidden = true;
  colSaveRange(); colChanged();
}
function colCurrentCell() {
  var sel = window.getSelection(); if (!sel || !sel.rangeCount) return null;
  var n = sel.anchorNode; if (n && n.nodeType === 3) n = n.parentNode;
  var cell = n && n.closest ? n.closest('td,th') : null;
  return cell && colInEditor(cell) ? cell : null;
}
function colUpdateTableTools() { var tools = document.getElementById('tb-table-tools'); if (tools) tools.hidden = colHtmlMode() || !colCurrentCell(); }
function tableOp(op) {
  var cell = colCurrentCell(); if (!cell) { alert('표 안의 칸을 먼저 클릭해주세요.'); return; }
  var row = cell.parentNode, table = cell.closest('table'), idx = Array.prototype.indexOf.call(row.children, cell);
  var allRows = Array.from(table.querySelectorAll('tr'));
  if (op === 'row-add') { var nr = document.createElement('tr'); for (var i = 0; i < row.children.length; i++) { var td = document.createElement('td'); td.innerHTML = '<br>'; nr.appendChild(td); } if (row.parentNode.tagName === 'THEAD') { var tb = table.tBodies[0] || table.appendChild(document.createElement('tbody')); tb.insertBefore(nr, tb.firstChild); } else row.after(nr); }
  if (op === 'col-add') allRows.forEach(function (tr) { var ref = tr.children[idx]; var nc = document.createElement(tr.parentNode.tagName === 'THEAD' ? 'th' : 'td'); nc.innerHTML = '<br>'; if (ref) ref.after(nc); else tr.appendChild(nc); });
  if (op === 'row-del') { if (allRows.length <= 1) { table.remove(); } else row.remove(); }
  if (op === 'col-del') { if (row.children.length <= 1) table.remove(); else allRows.forEach(function (tr) { if (tr.children[idx]) tr.children[idx].remove(); }); }
  if (op === 'table-del') { if (confirm('이 표를 삭제할까요?')) table.remove(); }
  colChanged();
}

document.addEventListener('DOMContentLoaded', () => {
  const ed = colEd();
  if (!ed) return;
  // 새 줄을 <div> 대신 <p> 문단으로 — 핵심 요약 자동 발췌·문단 간격이 안정적으로 동작
  try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) {}
  ed.addEventListener('focus', () => {
    if (ed.innerHTML.trim() === '' || ed.innerHTML === '<br>') {
      ed.innerHTML = '<p><br></p>';
      const r = document.createRange(); r.setStart(ed.firstChild, 0); r.collapse(true);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    }
  });
  // 툴바 버튼을 눌러도 본문 커서(선택 영역)가 사라지지 않게
  document.querySelector('.editor-toolbar').addEventListener('mousedown', (e) => { if (e.target.closest('button')) e.preventDefault(); });
  document.addEventListener('selectionchange', () => { colSaveRange(); colUpdateTableTools(); });
  ed.addEventListener('dragover', (e) => { e.preventDefault(); ed.classList.add('dragover'); });
  ed.addEventListener('dragleave', () => ed.classList.remove('dragover'));
  ed.addEventListener('drop', async (e) => {
    e.preventDefault(); ed.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) colInsertImageFile(file);
  });
  // 붙여넣기: 블로그·워드·구글문서 HTML의 글꼴·색·스크립트 등을 걷어내고 구조(제목·굵게·밑줄·목록·표·링크)만 남긴다
  ed.addEventListener('paste', (e) => {
    const cd = e.clipboardData; if (!cd) return;
    const file = Array.from(cd.files || []).find((f) => /^image\\/(jpeg|png|webp)$/.test(f.type));
    const htmlData = cd.getData('text/html');
    if (!htmlData && file) { e.preventDefault(); colInsertImageFile(file); return; }
    if (!htmlData) return;
    e.preventDefault();
    const rep = {};
    const cleaned = colCleanHtml(htmlData, rep);
    document.execCommand('insertHTML', false, cleaned);
    colChanged();
    const st = document.querySelector('#post-form .edit-status');
    if (rep.droppedImages && st) st.textContent = '붙여넣은 내용 중 외부 사진 ' + rep.droppedImages + '장은 제외했습니다. 사진은 🖼 사진 버튼이나 끌어다 놓기로 올려주세요.';
  });
});
</script>`)

export function adminPostsPage(posts: any[]) {
  return adminShell('posts', '원장 칼럼', html`
<h1>원장 칼럼 관리</h1>
<div class="admin-card">
  <h2 style="font-size:17px;font-weight:800;margin-bottom:18px;color:var(--brand-dark)">새 칼럼 작성</h2>
  <form id="post-form" data-content-kind="posts">
    <div class="admin-edit-actions"><strong class="edit-heading">새 콘텐츠 작성</strong><button class="admin-btn ghost cancel-edit" type="button" hidden>수정 취소 / 새로 작성</button></div>
    <p class="edit-status" role="status" aria-live="polite"></p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="form-group"><label for="admin-field-15">제목 *</label><input id="admin-field-15" class="form-control" name="title" required></div>
      <div class="form-group"><label for="admin-field-16">슬러그 (URL) *</label><input id="admin-field-16" class="form-control" name="slug" required placeholder="예: implant-care-guide (영문·숫자·하이픈)"></div>
      <div class="form-group"><label for="admin-field-17">작성자 *</label>
        <select id="admin-field-17" class="form-control" name="author_slug">
          ${DOCTORS.map((d) => html`<option value="${d.slug}">${d.name} (${d.role})</option>`)}
        </select>
      </div>
      <div class="form-group"><label for="admin-field-18">관련 진료 카테고리</label>
        <select id="admin-field-18" class="form-control" name="category">
          <option value="">없음</option>
          <option>임플란트</option><option>치아교정</option><option>심미보철 · 라미네이트</option>
          <option>충치 · 신경치료</option><option>보철치료</option><option>턱관절치료</option><option>피부미용 · 안티에이징</option>
        </select>
      </div>
    </div>
    <div class="form-group"><label for="admin-field-19">메타 설명 (검색 결과 노출용, 120~160자)</label><input id="admin-field-19" class="form-control" name="meta_description" maxlength="170"></div>
    <div class="form-group">
      <label for="admin-field-20">본문 * <span style="font-weight:400;color:var(--ink-mute)">(이미지 드래그&드롭 삽입 가능)</span></label>
      <div class="editor-toolbar" role="toolbar" aria-label="본문 서식">
        <button type="button" data-wysiwyg onclick="insertHeading('h2')" title="큰 소제목 (목차에 표시)">H2</button>
        <button type="button" data-wysiwyg onclick="insertHeading('h3')" title="작은 소제목 (목차에 표시)">H3</button>
        <button type="button" data-wysiwyg onclick="insertHeading('p')">본문</button>
        <span class="tb-sep" aria-hidden="true"></span>
        <button type="button" data-wysiwyg onclick="execCmd('bold')" title="굵게 (Ctrl/⌘+B)"><b>B</b></button>
        <button type="button" data-wysiwyg onclick="execCmd('italic')" title="기울임 (Ctrl/⌘+I)"><i>I</i></button>
        <button type="button" data-wysiwyg onclick="execCmd('underline')" title="밑줄 (Ctrl/⌘+U)"><u>U</u> 밑줄</button>
        <span class="tb-sep" aria-hidden="true"></span>
        <button type="button" data-wysiwyg onclick="execCmd('insertUnorderedList')">• 목록</button>
        <button type="button" data-wysiwyg onclick="execCmd('insertOrderedList')">1. 번호 목록</button>
        <button type="button" data-wysiwyg onclick="insertHeading('blockquote')">❝ 인용</button>
        <button type="button" data-wysiwyg onclick="insertLink()">🔗 링크</button>
        <button type="button" data-wysiwyg onclick="pickImage()">🖼 사진</button>
        <button type="button" data-wysiwyg onclick="toggleTablePop()" aria-controls="table-pop">▦ 표</button>
        <span class="tb-sep" aria-hidden="true"></span>
        <button type="button" id="tb-html" onclick="toggleHtml()" aria-pressed="false" title="HTML 코드로 보기·편집">&lt;/&gt; HTML</button>
        <span class="tb-table-tools" id="tb-table-tools" hidden>
          <span class="tb-sep" aria-hidden="true"></span>
          <button type="button" data-wysiwyg onclick="tableOp('row-add')">행 추가</button>
          <button type="button" data-wysiwyg onclick="tableOp('col-add')">열 추가</button>
          <button type="button" data-wysiwyg onclick="tableOp('row-del')">행 삭제</button>
          <button type="button" data-wysiwyg onclick="tableOp('col-del')">열 삭제</button>
          <button type="button" data-wysiwyg onclick="tableOp('table-del')">표 삭제</button>
        </span>
      </div>
      <div class="editor-table-pop" id="table-pop" hidden>
        <label>행 <input type="number" id="tbl-rows" min="1" max="30" value="3"></label>
        <label>열 <input type="number" id="tbl-cols" min="1" max="10" value="3"></label>
        <label class="form-check" style="margin:0"><input type="checkbox" id="tbl-head" checked> 첫 행을 머리글로</label>
        <button type="button" class="admin-btn" onclick="insertTable()">표 넣기</button>
        <button type="button" class="admin-btn ghost" onclick="document.getElementById('table-pop').hidden=true">닫기</button>
      </div>
      <div id="editor" class="editor-area" role="textbox" aria-label="칼럼 본문" aria-multiline="true" contenteditable="true"></div>
      <textarea id="editor-html" class="editor-html" aria-label="칼럼 본문 HTML" spellcheck="false" hidden></textarea>
      <p class="editor-hint">H2·H3 소제목은 글 위 <strong>목차</strong>에 자동으로 들어갑니다(2개 이상일 때). 표 칸을 클릭하면 행·열 편집 버튼이 나타납니다. HTML 모드에서는 코드를 직접 붙여넣을 수 있으며, 저장 시 안전한 태그(제목·문단·굵게·밑줄·목록·표·링크·사진)만 남습니다.</p>
    </div>
    <div class="form-group"><label for="admin-field-summary">핵심 요약 <span style="font-weight:400;color:var(--ink-mute)">(선택 · 글 맨 위 '핵심 요약' 상자. 비워두면 본문 첫 설명 문단에서 자동 발췌)</span></label><textarea id="admin-field-summary" class="form-control" name="summary" maxlength="300" rows="3" placeholder="예: 임플란트 수명은 식립 위치와 사후 관리에 따라 크게 달라집니다. 정기 검진이 가장 중요합니다."></textarea></div>
    <label class="form-check" style="margin-bottom:18px"><input type="checkbox" name="show_toc" checked> <span><strong>목차 표시</strong> — 소제목(H2·H3)이 2개 이상이면 본문 앞에 목차를 보여줍니다</span></label>
    <div class="form-group"><label>공개 상태</label><select id="admin-field-20" name="published" class="form-control"><option value="1">공개</option><option value="0">비공개</option></select></div>
    <button type="submit" class="admin-btn" style="padding:12px 28px;font-size:15px">칼럼 발행</button>
  </form>
</div>

<div class="admin-card">
  <h2 style="font-size:17px;font-weight:800;margin-bottom:18px;color:var(--brand-dark)">발행된 칼럼 (${posts.length})</h2>
  <table class="admin-table" tabindex="0" aria-label="등록 목록, 좌우 방향키로 가로 스크롤">
    <thead><tr><th>ID</th><th>제목</th><th>작성자</th><th>조회수</th><th>발행일</th><th></th></tr></thead>
    <tbody>
      ${posts.map((p) => html`
      <tr>
        <td>${p.id}</td>
        <td><a href="/column/${p.slug}" target="_blank" style="color:var(--brand);font-weight:600">${p.title}</a></td>
        <td>${(DOCTORS.find((d) => d.slug === p.author_slug) || {}).name || '—'}</td>
        <td>${p.views}</td><td>${(p.created_at || '').slice(0, 10)}</td>
        <td><button class="admin-btn ghost" type="button" data-edit="posts" data-id="${p.id}">수정</button> <button class="admin-btn danger" data-delete="posts" data-id="${p.id}">삭제</button></td>
      </tr>`)}
    </tbody>
  </table>
</div>

${EDITOR_SCRIPT}
`)
}

export function adminNoticesPage(notices: any[]) {
  return adminShell('notices', '공지사항', html`
<h1>공지사항 관리</h1>
<div class="admin-card">
  <h2 style="font-size:17px;font-weight:800;margin-bottom:18px;color:var(--brand-dark)">새 공지 작성</h2>
  <form id="notice-form" data-content-kind="notices">
    <div class="admin-edit-actions"><strong class="edit-heading">새 콘텐츠 작성</strong><button class="admin-btn ghost cancel-edit" type="button" hidden>수정 취소 / 새로 작성</button></div>
    <p class="edit-status" role="status" aria-live="polite"></p>
    <div class="form-group"><label for="admin-field-21">제목 *</label><input id="admin-field-21" class="form-control" name="title" required></div>
    <div class="form-group"><label for="admin-field-22">내용 *</label><textarea id="admin-field-22" class="form-control" name="content" required></textarea></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:end">
      <div class="form-group"><label for="admin-field-23">이미지 (선택)</label><input id="admin-field-23" class="form-control" type="file" name="image" accept="image/jpeg,image/png,image/webp"><div data-preview="image"></div><label class="form-check"><input type="checkbox" name="remove_image"> 기존 이미지 삭제</label></div>
      <label class="form-check" style="margin-bottom:22px"><input type="checkbox" name="pinned"> <span><strong>대표 공지로 상단 고정</strong></span></label>
    </div>
    <button type="submit" class="admin-btn" style="padding:12px 28px;font-size:15px">공지 등록</button>
  </form>
</div>

<div class="admin-card">
  <h2 style="font-size:17px;font-weight:800;margin-bottom:18px;color:var(--brand-dark)">등록된 공지 (${notices.length})</h2>
  <table class="admin-table" tabindex="0" aria-label="등록 목록, 좌우 방향키로 가로 스크롤">
    <thead><tr><th>ID</th><th>제목</th><th>대표</th><th>조회수</th><th>등록일</th><th></th></tr></thead>
    <tbody>
      ${notices.map((n) => html`
      <tr>
        <td>${n.id}</td>
        <td><a href="/notice/${n.id}" target="_blank" style="color:var(--brand);font-weight:600">${n.title}</a></td>
        <td>${n.pinned ? '📌' : '—'}</td><td>${n.views}</td><td>${(n.created_at || '').slice(0, 10)}</td>
        <td>
          <button class="admin-btn ghost" type="button" data-edit="notices" data-id="${n.id}">수정</button>
          <button class="admin-btn ghost" data-pin="${n.id}" data-value="${n.pinned ? 0 : 1}">${n.pinned ? '고정 해제' : '고정'}</button>
          <button class="admin-btn danger" data-delete="notices" data-id="${n.id}">삭제</button>
        </td>
      </tr>`)}
    </tbody>
  </table>
</div>

`)
}

export function adminFeesPage(groups: { category: string; items: { name: string; price: string; note: string; is_published?: number }[] }[]) {
  const dataJson = raw(safeJson(groups || []))
  return adminShell('fees', '비급여 수가', html`
<h1>비급여 진료비(수가) 관리</h1>
<p style="color:var(--ink-mute);margin:-6px 0 18px;font-size:14px">
  분류·항목·금액을 직접 편집할 수 있습니다. 각 항목의 <strong>공개</strong> 체크를 끄면 비용 안내 페이지에서 숨겨지고, 저장 시 반영됩니다.
  <br>모든 항목이 비공개인 분류는 페이지에 표시되지 않습니다.
</p>

<div class="admin-card">
  <div id="fees-editor"></div>
  <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
    <button type="button" class="admin-btn ghost" onclick="addGroup()"><i class="fas fa-plus"></i> 분류 추가</button>
    <button type="button" class="admin-btn" id="fees-save" style="padding:10px 28px" onclick="saveFees()"><i class="fas fa-floppy-disk"></i> 저장</button>
  </div>
</div>

<script>
var FEES = ${dataJson};

function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function render(){
  var root = document.getElementById('fees-editor');
  if(!FEES.length){ root.innerHTML = '<p style="color:var(--ink-mute)">항목이 없습니다. \\'분류 추가\\'로 시작하세요.</p>'; return; }
  var h = '';
  FEES.forEach(function(g, gi){
    h += '<div style="border:1px solid var(--line,#e5e7eb);border-radius:12px;padding:16px;margin-bottom:18px">';
    h += '<div style="display:flex;gap:10px;align-items:center;margin-bottom:12px">';
    h += '<input aria-label="분류명" class="form-control" style="font-weight:800;font-size:16px;max-width:340px" value="'+esc(g.category)+'" oninput="FEES['+gi+'].category=this.value" placeholder="분류명 (예: 임플란트)">';
    h += '<button type="button" class="admin-btn danger" onclick="delGroup('+gi+')" style="margin-left:auto">분류 삭제</button>';
    h += '</div>';
    h += '<table class="admin-table" tabindex="0" aria-label="수가 편집 목록"><thead><tr><th style="width:36%">항목</th><th style="width:22%">비용</th><th>비고</th><th style="width:70px;text-align:center">공개</th><th style="width:60px"></th></tr></thead><tbody>';
    g.items.forEach(function(it, ii){
      var checked = (it.is_published===0||it.is_published===false)?'':'checked';
      h += '<tr>';
      h += '<td><input class="form-control" value="'+esc(it.name)+'" oninput="FEES['+gi+'].items['+ii+'].name=this.value" aria-label="항목명" placeholder="항목명"></td>';
      h += '<td><input class="form-control" value="'+esc(it.price)+'" oninput="FEES['+gi+'].items['+ii+'].price=this.value" aria-label="비용" placeholder="예: 500,000원"></td>';
      h += '<td><input class="form-control" value="'+esc(it.note)+'" oninput="FEES['+gi+'].items['+ii+'].note=this.value" aria-label="비고" placeholder="비고 (선택)"></td>';
      h += '<td style="text-align:center"><input aria-label="수가 공개" type="checkbox" '+checked+' onchange="FEES['+gi+'].items['+ii+'].is_published=this.checked?1:0;render()"></td>';
      h += '<td><button type="button" class="admin-btn danger" onclick="delItem('+gi+','+ii+')">삭제</button></td>';
      h += '</tr>';
    });
    h += '</tbody></table>';
    h += '<button type="button" class="admin-btn ghost" style="margin-top:10px" onclick="addItem('+gi+')"><i class="fas fa-plus"></i> 항목 추가</button>';
    h += '</div>';
  });
  root.innerHTML = h;
}
function addGroup(){ FEES.push({category:'새 분류', items:[{name:'',price:'',note:'',is_published:1}]}); render(); }
function delGroup(gi){ if(confirm('이 분류 전체를 삭제하시겠습니까?')){ FEES.splice(gi,1); render(); } }
function addItem(gi){ FEES[gi].items.push({name:'',price:'',note:'',is_published:1}); render(); }
function delItem(gi,ii){ FEES[gi].items.splice(ii,1); render(); }
async function saveFees(){
  var btn = document.getElementById('fees-save');
  btn.disabled = true; var t = btn.innerHTML; btn.textContent = '저장 중...';
  try {
    var res = await fetch('/api/admin/fees', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({groups:FEES}) });
    var d = await res.json();
    if (d.ok) { alert('저장되었습니다. (항목 '+d.count+'개)'); location.reload(); }
    else alert(d.error || '저장 오류');
  } catch(e){ alert('네트워크 오류'); }
  btn.disabled = false; btn.innerHTML = t;
}
render();
</script>`)
}

// 통합 통계 (중앙 대시보드 연동) — 본문은 pages/stats.ts 의 AdminStats 가 생성
export function adminStatsPage(body: any) {
  return adminShell('stats', '통합 통계', body)
}

// 상시 인재채용 지원서 (2026-10-21) — 보유기간: 채용 절차 종료 후 1년 또는 삭제 요청 시까지
export const RECRUIT_STATUS: Record<string, string> = {
  new: '신규', reviewing: '검토 중', contacted: '연락 완료', pooled: '인재풀 보관', closed: '종료',
}
// D1 CURRENT_TIMESTAMP(UTC) → 한국시간 'YYYY-MM-DD HH:MM'
const kst = (v?: string) => {
  const t = v ? Date.parse(v.replace(' ', 'T') + 'Z') : NaN
  return Number.isFinite(t) ? new Date(t + 9 * 3600e3).toISOString().slice(0, 16).replace('T', ' ') : (v || '')
}
export function adminRecruitPage(items: any[]) {
  const fresh = items.filter((r) => (r.status || 'new') === 'new').length
  return adminShell('recruit', '채용 지원', html`
<h1>채용 지원 (${items.length}${fresh ? ` · 신규 ${fresh}` : ''})</h1>
<p style="font-size:13.5px;color:var(--ink-mute);margin:-14px 0 20px">/recruit 상시 인재채용 페이지에서 접수된 지원서입니다. 항목을 누르면 상세 내용이 열립니다. 보유기간(채용 절차 종료 후 1년 또는 지원자 삭제 요청 시)이 지나면 삭제해 주세요.</p>
${items.length ? '' : html`<div class="admin-card"><p style="color:var(--ink-mute)">아직 접수된 지원서가 없습니다.</p></div>`}
${items.map((r) => {
  const st = RECRUIT_STATUS[r.status] ? r.status : 'new'
  return html`
<details class="admin-card rc-adm-item" id="apply-${r.id}">
  <summary>
    <span><strong>${r.name}</strong> <span class="rc-adm-meta">· ${r.field} · ${r.phone} · ${kst(r.created_at)} 접수</span></span>
    <span class="rc-adm-badge s-${st}">${RECRUIT_STATUS[st]}</span>
  </summary>
  <div class="rc-adm-body">
    <dl>
      <dt>성함</dt><dd>${r.name}</dd>
      <dt>연락처</dt><dd><a href="tel:${r.phone}">${r.phone}</a></dd>
      <dt>지원 분야</dt><dd>${r.field}</dd>
      <dt>경력</dt><dd>${r.experience || '—'}</dd>
      <dt>희망 입사 시기</dt><dd>${r.start_date || '—'}</dd>
      <dt>자기소개</dt><dd>${r.intro || '—'}</dd>
      <dt>개인정보 동의</dt><dd>${r.privacy_consent ? '동의함' : '—'} (접수 ${kst(r.created_at)} 한국시간)</dd>
    </dl>
    <div class="rc-adm-edit">
      <label style="font-size:13px;font-weight:700">처리 상태
        <select class="form-control" data-recruit-status="${r.id}">
          ${Object.entries(RECRUIT_STATUS).map(([k, v]) => html`<option value="${k}" ${k === st ? 'selected' : ''}>${v}</option>`)}
        </select>
      </label>
      <label style="font-size:13px;font-weight:700">메모 (내부용)
        <textarea class="form-control" data-recruit-memo="${r.id}" maxlength="2000" placeholder="예: 10/22 통화, 12월 입사 가능">${r.memo || ''}</textarea>
      </label>
      <div class="rc-adm-actions">
        <button type="button" class="admin-btn" data-recruit-save="${r.id}">저장</button>
        <button type="button" class="admin-btn danger" data-delete="recruit" data-id="${r.id}">삭제</button>
        <span role="status" aria-live="polite"></span>
      </div>
    </div>
  </div>
</details>`
})}`)
}
