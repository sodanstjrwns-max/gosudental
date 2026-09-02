import { html } from 'hono/html'
import { Layout } from '../layout'

export function loginPage(next?: string) {
  const content = html`
<section class="section" id="login-section" style="padding-top:160px;min-height:80vh">
  <div class="auth-wrap">
    <div style="text-align:center;margin-bottom:32px">
      <img src="/static/img/logo-stack.png" alt="고수치과" width="120" style="margin:0 auto 16px">
      <h1 style="font-size:26px;font-weight:800;color:var(--brand-dark)">로그인</h1>
      <p style="font-size:14.5px;color:var(--ink-mute);margin-top:8px">치료 후 사진 열람은 의료법에 따라 <br>회원 로그인 후 가능합니다.</p>
    </div>
    <form class="form-card" data-ajax action="/api/auth/login${next ? '?next=' + encodeURIComponent(next) : ''}" method="POST">
      <div class="form-group">
        <label>이메일</label>
        <input class="form-control" name="email" type="email" required placeholder="example@email.com" autocomplete="email">
      </div>
      <div class="form-group">
        <label>비밀번호</label>
        <input class="form-control" name="password" type="password" required placeholder="비밀번호" autocomplete="current-password">
      </div>
      <button type="submit" class="btn-submit">로그인</button>
    </form>
    <p class="auth-links">아직 회원이 아니신가요? <a href="/auth/register">회원가입</a></p>
  </div>
</section>`

  return Layout(
    { title: '로그인 | 고수치과의원', description: '고수치과 회원 로그인', path: '/auth/login' },
    content
  )
}

export function registerPage() {
  const content = html`
<section class="section" id="register-section" style="padding-top:160px">
  <div class="auth-wrap">
    <div style="text-align:center;margin-bottom:32px">
      <img src="/static/img/logo-stack.png" alt="고수치과" width="120" style="margin:0 auto 16px">
      <h1 style="font-size:26px;font-weight:800;color:var(--brand-dark)">회원가입</h1>
      <p style="font-size:14.5px;color:var(--ink-mute);margin-top:8px">간편하게 가입하고 치료 케이스를 확인하세요.</p>
    </div>
    <form class="form-card" data-ajax action="/api/auth/register" method="POST">
      <div class="form-group">
        <label>이름 <span class="req">*</span></label>
        <input class="form-control" name="name" required placeholder="홍길동" autocomplete="name">
      </div>
      <div class="form-group">
        <label>이메일 <span class="req">*</span></label>
        <input class="form-control" name="email" type="email" required placeholder="example@email.com" autocomplete="email">
      </div>
      <div class="form-group">
        <label>전화번호 <span class="req">*</span></label>
        <input class="form-control" name="phone" type="tel" required placeholder="010-0000-0000" autocomplete="tel">
      </div>
      <div class="form-group">
        <label>비밀번호 <span class="req">*</span></label>
        <input class="form-control" name="password" type="password" required minlength="8" placeholder="8자 이상" autocomplete="new-password">
      </div>
      <label class="form-check">
        <input type="checkbox" name="privacy" required>
        <span>[필수] 개인정보 수집·이용에 동의합니다. (항목: 이름·이메일·전화번호 / 목적: 회원제 콘텐츠 제공·본인 확인 / 보유: 탈퇴 시까지) <a href="/privacy" target="_blank" style="color:var(--brand);font-weight:600">전문 보기</a></span>
      </label>
      <label class="form-check">
        <input type="checkbox" name="marketing">
        <span>[선택] 마케팅 정보 수신(이벤트·건강 정보 안내)에 동의합니다.</span>
      </label>
      <button type="submit" class="btn-submit">가입하기</button>
    </form>
    <p class="auth-links">이미 회원이신가요? <a href="/auth/login">로그인</a></p>
  </div>
</section>`

  return Layout(
    { title: '회원가입 | 고수치과의원', description: '고수치과 회원가입 — 치료 케이스 열람과 예약 관리를 한 번에.', path: '/auth/register' },
    content
  )
}

export function mypagePage(user: { name: string; email: string }) {
  const content = html`
<section class="section" id="mypage-section" style="padding-top:160px;min-height:70vh">
  <div class="auth-wrap" style="max-width:560px">
    <h1 style="font-size:26px;font-weight:800;color:var(--brand-dark);margin-bottom:24px">마이페이지</h1>
    <div class="form-card">
      <p style="font-size:17px;font-weight:700;color:var(--brand-dark)">${user.name}님, 안녕하세요 👋</p>
      <p style="font-size:14.5px;color:var(--ink-mute);margin:6px 0 24px">${user.email}</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        <a href="/cases" class="treat-sub"><h4><i class="fas fa-images" style="color:var(--brand);margin-right:8px"></i>비포 & 애프터 케이스 보기</h4><p>회원 전용 치료 후 사진까지 모두 열람하실 수 있습니다.</p></a>
        <a href="/reservation" class="treat-sub"><h4><i class="fas fa-calendar-check" style="color:var(--brand);margin-right:8px"></i>상담 예약하기</h4><p>원하는 진료와 시간을 남겨주세요.</p></a>
      </div>
      <button class="btn-submit" style="margin-top:24px;background:#eef2f5;color:var(--ink-soft);box-shadow:none" onclick="fetch('/api/auth/logout',{method:'POST'}).then(()=>location.href='/')">로그아웃</button>
    </div>
  </div>
</section>`

  return Layout(
    { title: '마이페이지 | 고수치과의원', description: '고수치과 마이페이지', path: '/auth/mypage' },
    content
  )
}

export function privacyPage() {
  const content = html`
<section class="section" id="privacy-section" style="padding-top:160px">
  <div class="section-narrow prose">
    <h1 class="h-display" style="font-size:32px">개인정보 처리방침</h1>
    <p>고수치과의원(이하 "병원")은 개인정보보호법 등 관련 법령에 따라 이용자의 개인정보를 보호하며, 다음과 같이 처리방침을 수립·공개합니다.</p>
    <h2>1. 수집하는 개인정보 항목</h2>
    <p>회원가입: 이름, 이메일, 전화번호, 비밀번호(암호화 저장) <br>상담 예약: 이름, 연락처, 이메일(선택), 상담 내용</p>
    <h2>2. 수집 및 이용 목적</h2>
    <p>회원제 콘텐츠(치료 사례 열람) 제공, 상담 예약 응대, 마케팅 정보 수신 동의자에 한한 안내(선택)</p>
    <h2>3. 보유 및 이용 기간</h2>
    <p>회원 탈퇴 또는 수집 목적 달성 시까지 보유하며, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관 후 파기합니다.</p>
    <h2>4. 동의 거부 권리</h2>
    <p>이용자는 개인정보 수집·이용 동의를 거부할 수 있으며, 필수 항목 동의 거부 시 회원가입 및 예약 서비스 이용이 제한될 수 있습니다.</p>
    <h2>5. 개인정보 보호책임자</h2>
    <p>대표원장 조원익 (문의: 대표전화 — 개원 시 안내)</p>
  </div>
</section>`
  return Layout({ title: '개인정보 처리방침 | 고수치과의원', description: '고수치과 개인정보 처리방침', path: '/privacy' }, content)
}

export function termsPage() {
  const content = html`
<section class="section" id="terms-section" style="padding-top:160px">
  <div class="section-narrow prose">
    <h1 class="h-display" style="font-size:32px">이용약관</h1>
    <h2>제1조 (목적)</h2>
    <p>본 약관은 고수치과의원 홈페이지가 제공하는 서비스의 이용 조건 및 절차에 관한 사항을 규정합니다.</p>
    <h2>제2조 (서비스 내용)</h2>
    <p>병원 소개, 진료 안내, 치료 사례 열람(회원), 상담 예약 접수, 의료 정보 콘텐츠 제공</p>
    <h2>제3조 (의료 정보의 한계)</h2>
    <p>본 홈페이지의 의료 정보는 일반적인 안내 목적이며, 개별 진단·처방을 대체하지 않습니다. 정확한 진단은 반드시 내원 상담을 통해 받으시기 바랍니다.</p>
    <h2>제4조 (회원의 의무)</h2>
    <p>회원은 타인의 정보를 도용하지 않으며, 서비스 이용 시 관련 법령을 준수해야 합니다.</p>
  </div>
</section>`
  return Layout({ title: '이용약관 | 고수치과의원', description: '고수치과 홈페이지 이용약관', path: '/terms' }, content)
}

export function notFoundPage() {
  const content = html`
<section class="section" id="notfound-section" style="padding-top:180px;min-height:75vh;text-align:center">
  <img src="/static/img/logo-3d.png" alt="고수치과 캐릭터" width="160" style="margin:0 auto 24px">
  <h1 style="font-size:40px;font-weight:800;color:var(--brand-dark);letter-spacing:-0.03em">페이지를 찾을 수 없습니다</h1>
  <p style="font-size:16px;color:var(--ink-mute);margin:14px 0 32px">주소가 변경되었거나 존재하지 않는 페이지입니다.</p>
  <a href="/" class="btn-brand" style="padding:14px 32px;font-size:16px">홈으로 돌아가기</a>
</section>`
  return Layout({ title: '404 — 페이지를 찾을 수 없습니다 | 고수치과의원', description: '요청하신 페이지를 찾을 수 없습니다.', path: '/404' }, content)
}
