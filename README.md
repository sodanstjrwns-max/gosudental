# 고수치과의원 공식 홈페이지

## 프로젝트 개요
- **이름**: 고수치과의원 (GOSU DENTAL) 홈페이지
- **목표**: bdbddc.com급 하이엔드 인터랙티브 풀스택 치과 홈페이지 — SEO/AEO 완비, 환자 퍼널 설계 반영
- **병원**: 충청남도 예산군 삽교읍 예학로 93, 5층 (내포신도시 주키즈소아청소년과 건물) — **2026년 11월 2일 개원 예정**
- **의료진**: 조원익 대표원장 · 김경환 교정과 전문의(보건복지부 인증) · 이민우 진료원장

## URL
- **개발 미리보기**: https://3000-ibwcewnougzmi7rx3gacu-d0b9e1e2.sandbox.novita.ai (샌드박스, 임시)
- **프로덕션**: 미배포 (배포 경로 확정 대기)
- **관리자**: `/admin` (비밀번호 로그인 — `.dev.vars`의 ADMIN_PASSWORD, 기본 `gosu2026!admin`)

## 완성된 기능
### 공개 페이지 (~150 URL)
| 경로 | 내용 |
|---|---|
| `/` | 메인 — 풀스크린 히어로, 스크롤 reveal/카운트업, 핵심진료 TOP3, 의료진, 장비 |
| `/mission` | 병원 미션 (히어로급 연출) |
| `/doctors`, `/doctors/:slug` | 의료진 목록 + 개별 페이지 (Person 스키마, 담당 케이스 상호링크) |
| `/treatments`, `/treatments/:slug` ×7 | 진료 안내 — 임플란트/교정/심미보철(핵심 3 = 1,500자+ & FAQ 20개) + 4개 진료 (MedicalProcedure + FAQPage 스키마, 부작용 고지) |
| `/cases`, `/cases/:id` | 비포&애프터 — 카테고리 필터, 슬라이더 비교, **치료 후 사진 회원 전용(의료법)**, 지역/담당의 표기 |
| `/column`, `/column/:slug` | 원장 칼럼 (Article 스키마, 조회수) |
| `/encyclopedia`, `/encyclopedia/:slug` | 치과 백과사전 ~100 용어 (DefinedTerm 스키마, 관련 진료 상호링크) |
| `/faq` | 통합 FAQ (진료별 92+ 항목, FAQPage 스키마) |
| `/notice`, `/notice/:id` | 공지사항 (대표 고정) |
| `/directions` `/tour` `/pricing` `/reservation` | 오시는 길 / 둘러보기(3D 렌더 18장) / 비급여 안내 / 상담 예약 |
| `/area/:slug` ×18 | 지역 SEO — 내포·예산·홍성·삽교·덕산 × 임플란트·교정·심미보철 |
| `/auth/*` | 회원가입(개인정보+마케팅 동의, 이메일+전화 검증) / 로그인 / 마이페이지 |
| `/privacy` `/terms` | 개인정보처리방침 / 이용약관 |

### SEO / AEO
- 페이지별 고유 title·description·canonical·OG, JSON-LD(Dentist, Person, MedicalProcedure, MedicalWebPage, FAQPage, DefinedTerm, BreadcrumbList)
- `/sitemap.xml` (149+ URL, DB 콘텐츠 자동 반영) · `/robots.txt` · `/llms.txt`
- 봇 트래픽 조회수 제외 필터

### 관리자 (`/admin`)
- 대시보드(통계) / 비포&애프터(4컷 업로드+지역 자동완성) / 칼럼(WYSIWYG, 이미지 드래그&드롭 → R2) / 공지(고정) / 회원 / 예약 관리

## 데이터 아키텍처
- **저장소**: Cloudflare D1 (users·cases·posts·notices·reservations) + R2 (케이스/칼럼 이미지)
- **인증**: HMAC-SHA256 서명 쿠키 세션 (회원 30일 / 관리자 24시간), PBKDF2 100k 비밀번호 해시
- **의료법 게이팅**: `photo_after`/`pano_after` 이미지는 로그인 회원 또는 관리자만 열람 (403)

## 로컬 개발
```bash
npm run build
npx wrangler d1 migrations apply webapp-production --local
npx wrangler d1 execute webapp-production --local --file=./seed.sql
pm2 start ecosystem.config.cjs   # port 3000
```

## 미구현 / 다음 단계
- [ ] 프로덕션 배포 (BYOK 또는 Genspark 호스팅 — 사용자 선택 대기)
- [ ] 실제 도메인 연결 후 `src/data/site.ts`의 `domain` 교체
- [ ] 전화번호·진료시간 확정 시 `site.ts` 업데이트
- [ ] 의료진 프로필 사진 수령 시 교체 (현재 이니셜 아바타)
- [ ] 네이버 서치어드바이저 / 구글 서치콘솔 등록

## 배포
- **플랫폼**: Cloudflare Pages (Hono + D1 + R2)
- **상태**: 🟡 샌드박스 미리보기만 활성
- **기술 스택**: Hono 4 + TypeScript + Vite + Cloudflare D1/R2, Pretendard, 바닐라 JS 인터랙션
- **최종 업데이트**: 2026-08-31
