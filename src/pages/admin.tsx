import { html, raw } from 'hono/html'
import { DOCTORS } from '../data/site'
import { CASE_CATEGORIES } from './cases'

function adminShell(active: string, title: string, body: any) {
  return html`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — 고수치과 관리자</title>
<meta name="robots" content="noindex,nofollow">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css">
<link rel="stylesheet" href="/static/style.css">
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
    <a href="/" style="margin-top:20px;opacity:0.6"><i class="fas fa-arrow-up-right-from-square" style="width:20px"></i> 사이트 보기</a>
    <a href="#" onclick="fetch('/api/admin/logout',{method:'POST'}).then(()=>location.href='/admin/login')" style="opacity:0.6"><i class="fas fa-right-from-bracket" style="width:20px"></i> 로그아웃</a>
  </aside>
  <main class="admin-main">${body}</main>
</div>
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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="/static/style.css">
</head>
<body style="background:var(--brand-mist)">
<section style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px">
  <div style="width:100%;max-width:400px">
    <div style="text-align:center;margin-bottom:28px">
      <img src="/static/img/logo-stack.png" alt="고수치과" width="110" style="margin:0 auto 14px">
      <h1 style="font-size:22px;font-weight:800;color:var(--brand-dark)">관리자 로그인</h1>
    </div>
    <form class="form-card" onsubmit="event.preventDefault();fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:this.password.value})}).then(r=>r.json()).then(d=>{if(d.ok)location.href='/admin';else alert(d.error||'비밀번호가 올바르지 않습니다.')})">
      <div class="form-group">
        <label>비밀번호</label>
        <input class="form-control" name="password" type="password" required autofocus>
      </div>
      <button type="submit" class="btn-submit">로그인</button>
    </form>
  </div>
</section>
</body>
</html>`
}

export function adminDashPage(stats: { users: number; cases: number; posts: number; notices: number; resv: number; totalViews: number }) {
  return adminShell('dash', '대시보드', html`
<h1>대시보드</h1>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
  <div class="admin-card"><p style="font-size:13px;color:var(--ink-mute)">회원 수</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.users}</p></div>
  <div class="admin-card"><p style="font-size:13px;color:var(--ink-mute)">비포&애프터 케이스</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.cases}</p></div>
  <div class="admin-card"><p style="font-size:13px;color:var(--ink-mute)">칼럼 게시물</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.posts}</p></div>
  <div class="admin-card"><p style="font-size:13px;color:var(--ink-mute)">공지사항</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.notices}</p></div>
  <div class="admin-card"><p style="font-size:13px;color:var(--ink-mute)">예약 신청</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.resv}</p></div>
  <div class="admin-card"><p style="font-size:13px;color:var(--ink-mute)">총 조회수 (봇 제외)</p><p style="font-size:34px;font-weight:800;color:var(--brand-dark)">${stats.totalViews}</p></div>
</div>`)
}

export function adminUsersPage(users: any[]) {
  return adminShell('users', '회원 관리', html`
<h1>회원 관리 (${users.length})</h1>
<div class="admin-card">
  <table class="admin-table">
    <thead><tr><th>ID</th><th>이름</th><th>이메일</th><th>전화번호</th><th>마케팅 동의</th><th>가입일</th><th></th></tr></thead>
    <tbody>
      ${users.map((u) => html`
      <tr>
        <td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.phone}</td>
        <td>${u.marketing_consent ? '✅' : '—'}</td>
        <td>${(u.created_at || '').slice(0, 10)}</td>
        <td><button class="admin-btn danger" onclick="if(confirm('삭제하시겠습니까?'))fetch('/api/admin/users/${u.id}',{method:'DELETE'}).then(()=>location.reload())">삭제</button></td>
      </tr>`)}
    </tbody>
  </table>
</div>`)
}

export function adminReservationsPage(items: any[]) {
  return adminShell('resv', '예약 관리', html`
<h1>예약 관리 (${items.length})</h1>
<div class="admin-card">
  <table class="admin-table">
    <thead><tr><th>ID</th><th>이름</th><th>연락처</th><th>진료</th><th>희망 일시</th><th>메시지</th><th>상태</th><th>신청일</th></tr></thead>
    <tbody>
      ${items.map((r) => html`
      <tr>
        <td>${r.id}</td><td>${r.name}</td><td>${r.phone}</td><td>${r.category || '—'}</td>
        <td>${r.preferred_at || '—'}</td><td style="max-width:200px">${r.message || '—'}</td>
        <td>
          <select onchange="fetch('/api/admin/reservations/${r.id}',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:this.value})})">
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
  <form id="case-form">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="form-group"><label>제목 *</label><input class="form-control" name="title" required placeholder="예: 상실된 어금니, 임플란트로 저작 기능 회복"></div>
      <div class="form-group"><label>진료 카테고리 *</label>
        <select class="form-control" name="category" required>
          ${CASE_CATEGORIES.map((c) => html`<option value="${c}">${c}</option>`)}
        </select>
      </div>
      <div class="form-group"><label>환자 나이대</label>
        <select class="form-control" name="age_group"><option value="">선택</option><option>10대</option><option>20대</option><option>30대</option><option>40대</option><option>50대</option><option>60대</option><option>70대 이상</option></select>
      </div>
      <div class="form-group"><label>성별</label>
        <select class="form-control" name="gender"><option value="">선택</option><option>여성</option><option>남성</option></select>
      </div>
      <div class="form-group ac-wrap"><label>지역 (자동완성)</label>
        <input class="form-control region-ac" name="region" placeholder="예: 삽교 → 충청남도 예산군 삽교읍" autocomplete="off">
        <div class="ac-list"></div>
      </div>
      <div class="form-group"><label>담당 원장</label>
        <select class="form-control" name="doctor_slug">
          ${DOCTORS.map((d) => html`<option value="${d.slug}">${d.name} (${d.role})</option>`)}
        </select>
      </div>
      <div class="form-group"><label>치료 기간</label><input class="form-control" name="duration" placeholder="예: 3개월"></div>
    </div>
    <div class="form-group"><label>케이스 설명</label><textarea class="form-control" name="description" placeholder="치료 과정과 결과를 설명해주세요 (SEO에 반영됩니다)"></textarea></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
      <div class="form-group"><label>파노라마 전</label><input class="form-control" type="file" name="pano_before" accept="image/*"></div>
      <div class="form-group"><label>파노라마 후</label><input class="form-control" type="file" name="pano_after" accept="image/*"></div>
      <div class="form-group"><label>구내포토 전</label><input class="form-control" type="file" name="photo_before" accept="image/*"></div>
      <div class="form-group"><label>구내포토 후</label><input class="form-control" type="file" name="photo_after" accept="image/*"></div>
    </div>
    <button type="submit" class="admin-btn" style="padding:12px 28px;font-size:15px">케이스 등록</button>
  </form>
</div>

<div class="admin-card">
  <h2 style="font-size:17px;font-weight:800;margin-bottom:18px;color:var(--brand-dark)">등록된 케이스 (${cases.length})</h2>
  <table class="admin-table">
    <thead><tr><th>ID</th><th>제목</th><th>카테고리</th><th>지역</th><th>담당</th><th>조회수</th><th>등록일</th><th></th></tr></thead>
    <tbody>
      ${cases.map((c) => html`
      <tr>
        <td>${c.id}</td>
        <td><a href="/cases/${c.id}" target="_blank" style="color:var(--brand);font-weight:600">${c.title}</a></td>
        <td>${c.category}</td><td>${c.region || '—'}</td>
        <td>${(DOCTORS.find((d) => d.slug === c.doctor_slug) || {}).name || '—'}</td>
        <td>${c.views}</td><td>${(c.created_at || '').slice(0, 10)}</td>
        <td><button class="admin-btn danger" onclick="if(confirm('삭제하시겠습니까?'))fetch('/api/admin/cases/${c.id}',{method:'DELETE'}).then(()=>location.reload())">삭제</button></td>
      </tr>`)}
    </tbody>
  </table>
</div>

<script src="/static/app.js"></script>
<script>
document.getElementById('case-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const btn = form.querySelector('[type=submit]');
  btn.disabled = true; btn.textContent = '업로드 중...';
  try {
    const res = await fetch('/api/admin/cases', { method: 'POST', body: fd });
    const d = await res.json();
    if (d.ok) { alert('등록되었습니다.'); location.reload(); }
    else alert(d.error || '오류가 발생했습니다.');
  } catch (err) { alert('네트워크 오류'); }
  btn.disabled = false; btn.textContent = '케이스 등록';
});
</script>`)
}

const EDITOR_SCRIPT = raw(`<script>
function execCmd(cmd, val) { document.execCommand(cmd, false, val || null); document.getElementById('editor').focus(); }
function insertHeading(tag) { document.execCommand('formatBlock', false, tag); }
async function uploadImage(file) {
  const fd = new FormData(); fd.append('image', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const d = await res.json();
  return d.url;
}
async function pickImage() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = async () => {
    if (!inp.files[0]) return;
    const url = await uploadImage(inp.files[0]);
    if (url) document.execCommand('insertImage', false, url);
  };
  inp.click();
}
document.addEventListener('DOMContentLoaded', () => {
  const ed = document.getElementById('editor');
  if (!ed) return;
  ed.addEventListener('dragover', (e) => { e.preventDefault(); ed.classList.add('dragover'); });
  ed.addEventListener('dragleave', () => ed.classList.remove('dragover'));
  ed.addEventListener('drop', async (e) => {
    e.preventDefault(); ed.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = await uploadImage(file);
      if (url) document.execCommand('insertImage', false, url);
    }
  });
});
</script>`)

export function adminPostsPage(posts: any[]) {
  return adminShell('posts', '원장 칼럼', html`
<h1>원장 칼럼 관리</h1>
<div class="admin-card">
  <h2 style="font-size:17px;font-weight:800;margin-bottom:18px;color:var(--brand-dark)">새 칼럼 작성</h2>
  <form id="post-form">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="form-group"><label>제목 *</label><input class="form-control" name="title" required></div>
      <div class="form-group"><label>슬러그 (URL) *</label><input class="form-control" name="slug" required placeholder="예: implant-care-guide (영문·숫자·하이픈)"></div>
      <div class="form-group"><label>작성자 *</label>
        <select class="form-control" name="author_slug">
          ${DOCTORS.map((d) => html`<option value="${d.slug}">${d.name} (${d.role})</option>`)}
        </select>
      </div>
      <div class="form-group"><label>관련 진료 카테고리</label>
        <select class="form-control" name="category">
          <option value="">없음</option>
          <option>임플란트</option><option>치아교정</option><option>심미보철 · 라미네이트</option>
          <option>충치 · 신경치료</option><option>보철치료</option><option>턱관절치료</option><option>피부미용 · 안티에이징</option>
        </select>
      </div>
    </div>
    <div class="form-group"><label>메타 설명 (검색 결과 노출용, 120~160자)</label><input class="form-control" name="meta_description" maxlength="170"></div>
    <div class="form-group">
      <label>본문 * <span style="font-weight:400;color:var(--ink-mute)">(이미지 드래그&드롭 삽입 가능)</span></label>
      <div class="editor-toolbar">
        <button type="button" onclick="insertHeading('h2')">H2</button>
        <button type="button" onclick="insertHeading('h3')">H3</button>
        <button type="button" onclick="insertHeading('p')">본문</button>
        <button type="button" onclick="execCmd('bold')"><b>B</b></button>
        <button type="button" onclick="execCmd('italic')"><i>I</i></button>
        <button type="button" onclick="execCmd('insertUnorderedList')">• 목록</button>
        <button type="button" onclick="execCmd('createLink', prompt('링크 URL'))">🔗 링크</button>
        <button type="button" onclick="pickImage()">🖼 사진</button>
      </div>
      <div id="editor" class="editor-area" contenteditable="true"></div>
    </div>
    <button type="submit" class="admin-btn" style="padding:12px 28px;font-size:15px">칼럼 발행</button>
  </form>
</div>

<div class="admin-card">
  <h2 style="font-size:17px;font-weight:800;margin-bottom:18px;color:var(--brand-dark)">발행된 칼럼 (${posts.length})</h2>
  <table class="admin-table">
    <thead><tr><th>ID</th><th>제목</th><th>작성자</th><th>조회수</th><th>발행일</th><th></th></tr></thead>
    <tbody>
      ${posts.map((p) => html`
      <tr>
        <td>${p.id}</td>
        <td><a href="/column/${p.slug}" target="_blank" style="color:var(--brand);font-weight:600">${p.title}</a></td>
        <td>${(DOCTORS.find((d) => d.slug === p.author_slug) || {}).name || '—'}</td>
        <td>${p.views}</td><td>${(p.created_at || '').slice(0, 10)}</td>
        <td><button class="admin-btn danger" onclick="if(confirm('삭제하시겠습니까?'))fetch('/api/admin/posts/${p.id}',{method:'DELETE'}).then(()=>location.reload())">삭제</button></td>
      </tr>`)}
    </tbody>
  </table>
</div>

${EDITOR_SCRIPT}
<script>
document.getElementById('post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const body = {
    title: form.title.value, slug: form.slug.value, author_slug: form.author_slug.value,
    category: form.category.value, meta_description: form.meta_description.value,
    content: document.getElementById('editor').innerHTML,
  };
  if (!body.content || body.content === '<br>') return alert('본문을 입력해주세요.');
  const res = await fetch('/api/admin/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await res.json();
  if (d.ok) { alert('발행되었습니다.'); location.reload(); } else alert(d.error || '오류');
});
</script>`)
}

export function adminNoticesPage(notices: any[]) {
  return adminShell('notices', '공지사항', html`
<h1>공지사항 관리</h1>
<div class="admin-card">
  <h2 style="font-size:17px;font-weight:800;margin-bottom:18px;color:var(--brand-dark)">새 공지 작성</h2>
  <form id="notice-form">
    <div class="form-group"><label>제목 *</label><input class="form-control" name="title" required></div>
    <div class="form-group"><label>내용 *</label><textarea class="form-control" name="content" required></textarea></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:end">
      <div class="form-group"><label>이미지 (선택)</label><input class="form-control" type="file" name="image" accept="image/*"></div>
      <label class="form-check" style="margin-bottom:22px"><input type="checkbox" name="pinned"> <span><strong>대표 공지로 상단 고정</strong></span></label>
    </div>
    <button type="submit" class="admin-btn" style="padding:12px 28px;font-size:15px">공지 등록</button>
  </form>
</div>

<div class="admin-card">
  <h2 style="font-size:17px;font-weight:800;margin-bottom:18px;color:var(--brand-dark)">등록된 공지 (${notices.length})</h2>
  <table class="admin-table">
    <thead><tr><th>ID</th><th>제목</th><th>대표</th><th>조회수</th><th>등록일</th><th></th></tr></thead>
    <tbody>
      ${notices.map((n) => html`
      <tr>
        <td>${n.id}</td>
        <td><a href="/notice/${n.id}" target="_blank" style="color:var(--brand);font-weight:600">${n.title}</a></td>
        <td>${n.pinned ? '📌' : '—'}</td><td>${n.views}</td><td>${(n.created_at || '').slice(0, 10)}</td>
        <td>
          <button class="admin-btn ghost" onclick="fetch('/api/admin/notices/${n.id}',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pinned:${n.pinned ? 0 : 1}})}).then(()=>location.reload())">${n.pinned ? '고정 해제' : '고정'}</button>
          <button class="admin-btn danger" onclick="if(confirm('삭제하시겠습니까?'))fetch('/api/admin/notices/${n.id}',{method:'DELETE'}).then(()=>location.reload())">삭제</button>
        </td>
      </tr>`)}
    </tbody>
  </table>
</div>

<script>
document.getElementById('notice-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch('/api/admin/notices', { method: 'POST', body: fd });
  const d = await res.json();
  if (d.ok) { alert('등록되었습니다.'); location.reload(); } else alert(d.error || '오류');
});
</script>`)
}

export function adminFeesPage(groups: { category: string; items: { name: string; price: string; note: string; is_published?: number }[] }[]) {
  const dataJson = raw(JSON.stringify(groups || []))
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
    h += '<input class="form-control" style="font-weight:800;font-size:16px;max-width:340px" value="'+esc(g.category)+'" oninput="FEES['+gi+'].category=this.value" placeholder="분류명 (예: 임플란트)">';
    h += '<button type="button" class="admin-btn danger" onclick="delGroup('+gi+')" style="margin-left:auto">분류 삭제</button>';
    h += '</div>';
    h += '<table class="admin-table"><thead><tr><th style="width:36%">항목</th><th style="width:22%">비용</th><th>비고</th><th style="width:70px;text-align:center">공개</th><th style="width:60px"></th></tr></thead><tbody>';
    g.items.forEach(function(it, ii){
      var checked = (it.is_published===0||it.is_published===false)?'':'checked';
      h += '<tr'+((it.is_published===0||it.is_published===false)?' style="opacity:.5"':'')+'>';
      h += '<td><input class="form-control" value="'+esc(it.name)+'" oninput="FEES['+gi+'].items['+ii+'].name=this.value" placeholder="항목명"></td>';
      h += '<td><input class="form-control" value="'+esc(it.price)+'" oninput="FEES['+gi+'].items['+ii+'].price=this.value" placeholder="예: 500,000원"></td>';
      h += '<td><input class="form-control" value="'+esc(it.note)+'" oninput="FEES['+gi+'].items['+ii+'].note=this.value" placeholder="비고 (선택)"></td>';
      h += '<td style="text-align:center"><input type="checkbox" '+checked+' onchange="FEES['+gi+'].items['+ii+'].is_published=this.checked?1:0;render()"></td>';
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
