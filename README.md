# 고수치과의원 홈페이지 (GOSU DENTAL)

## 프로젝트 개요
- **이름**: 고수치과의원 공식 홈페이지
- **목표**: bdbddc.com급 하이엔드 인터랙티브 풀스택 치과 홈페이지 — SEO/AEO 완비, 퍼널 설계, 의료광고법 준수
- **병원**: 고수치과의원 (대표원장 조원익) · 2026년 11월 2일 개원 예정
- **주소**: 충청남도 예산군 삽교읍 예학로 93, 5층 (내포신도시 주키즈소아청소년과 건물 5층)

## URLs
- **개발 미리보기**: https://3000-ibwcewnougzmi7rx3gacu-d0b9e1e2.sandbox.novita.ai
- **프로덕션**: 미배포 (배포 경로 결정 대기)
- **네이버 블로그**: https://blog.naver.com/vkdlxld0101

## 완성된 기능
### 공개 페이지 (149 URL, sitemap 기준)
| 경로 | 내용 |
|---|---|
| `/` | 메인 — 풀스크린 히어로, 스크롤 리빌, 카운트업, 핵심 진료 TOP3 |
| `/mission` | 병원 미션 (히어로급 연출) |
| `/doctors`, `/doctors/:slug` | 의료진 3인 (조원익·김경환·이민우) — 약력·연수·담당 케이스 연동 |
| `/treatments`, `/treatments/:slug` | 진료 7과목 (임플란트/교정/심미보철 핵심 3 + 4) — 부작용 고지, FAQ 스키마 |
| `/cases`, `/cases/:id` | 비포&애프터 — 4장 슬롯, 슬라이더 비교, **치료 후 사진 회원 전용(의료법)** |
| `/column`, `/column/:slug` | 원장 칼럼 (조회수, Article 스키마) |
| `/encyclopedia`, `/encyclopedia/:slug` | 치과 백과사전 103개 용어 |
| `/faq` | 통합 FAQ 90문항 + FAQPage 스키마 |
| `/notice`, `/notice/:id` | 공지사항 (대표 고정) |
| `/directions` `/tour` `/pricing` `/reservation` | 오시는 길 / 둘러보기 / 비급여 안내 / 상담 예약 |
| `/area/:slug` | 지역 SEO 18페이지 (내포·예산·홍성·삽교·덕산 × 임플란트·교정·심미보철) |
| `/sitemap.xml` `/robots.txt` `/llms.txt` | SEO/AEO 파일 |

### 회원 / 예약
- 이메일+전화 회원가입 (개인정보 필수동의 + 마케팅 선택동의), PBKDF2 해시, HMAC 세션 30일
- 로그인 / 마이페이지 / 로그아웃, 상담 예약 접수

### 관리자 (`/admin`, 비밀번호: `.dev.vars`의 ADMIN_PASSWORD)
- 대시보드(통계·조회수), 회원 관리, 예약 관리(상태 변경)
- 비포&애프터 CRUD — 4장 업로드(R2), 지역 자동완성 21곳, 담당 원장 연결
- 원장 칼럼 WYSIWYG(H2/H3/이미지 드래그&드롭), 공지 CRUD + 대표 고정
- 조회수 봇 제외 카운트

## 데이터 아키텍처
- **저장소**: Cloudflare D1 (users/cases/posts/notices/reservations) + R2 (케이스·칼럼 이미지)
- **정적 콘텐츠**: `src/data/site.ts` — 의료진, 진료 7과목(FAQ 86개), 백과사전 103용어, 지역 18조합, 비급여
- **인증**: Web Crypto HMAC 서명 쿠키 (회원 30일 / 관리자 24시간)

## 개발
```bash
npm run build                          # vite build → dist/
pm2 start ecosystem.config.cjs         # wrangler pages dev (D1+R2 --local)
npx wrangler d1 migrations apply webapp-production --local
npx wrangler d1 execute webapp-production --local --file=./seed.sql
```

## 배포 (미결정)
- **플랫폼**: Cloudflare Pages — BYOK(원장님 계정) 또는 Genspark 호스팅 중 선택 대기
- **주의**: 배포 후 `src/data/site.ts`의 `domain`을 실제 도메인으로 교체, `ADMIN_PASSWORD`/`SESSION_SECRET` 시크릿 등록 필요

## 미구현 / 개원 후 업데이트 항목
- 전화번호(개원 시 확정) → `site.ts`의 `SITE.tel`
- 진료시간 확정 → `SITE.hours`
- 비급여 수가 확정 고지 → `PRICING`
- 실제 의료진 프로필 사진 (현재 인테리어 렌더 기반)
- 카카오채널/네이버예약 연동 (선택)

## 기술 스택
Hono 4 + TypeScript + Cloudflare Pages (D1/R2) · Pretendard · 커스텀 CSS 디자인 시스템 (스크롤 리빌/패럴랙스/카운트업) · Vanilla JS

- **Last Updated**: 2026-08-31
