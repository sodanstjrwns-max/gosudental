# 고수치과의원 홈페이지 (GOSU DENTAL)

## 프로젝트 개요
- 내포신도시 고수치과의원 공식 홈페이지: 병원 소개, 의료진·진료 콘텐츠, 회원 전용 사례, 상담 접수, 관리자 CMS.
- 대표원장 조원익 · 2026년 11월 2일 개원 예정.
- 주소: 충청남도 예산군 삽교읍 예학로 93, 5층.
- Hono + TypeScript + Cloudflare Pages / D1 / R2 / Vanilla JS. 수묵·한지 콘셉트 및 모바일 대응.

## URL 및 배포 상태
- 기존 프로덕션: https://gosudental.pages.dev
- 개발 미리보기: https://3000-ibwcewnougzmi7rx3gacu-d0b9e1e2.sandbox.novita.ai
- **2026-09-13 사진 확대 적용·수가표·보안·CMS 수정은 미리보기 반영, 프로덕션 미배포.**
- 기존 배포 경로: 사용자 Cloudflare 계정(BYOK), Pages 프로젝트 `gosudental`, production branch `main`.
- D1: `gosudental-production` / binding `DB`; R2: `gosudental-bucket` / binding `R2`.
- 운영 배포 전 `0002_request_protection.sql`까지 원격 마이그레이션 적용 및 secrets 점검 필요. 이번 작업은 원격 DB·운영 secrets를 변경하지 않음.

## 완성된 페이지 및 기능
| 경로 | 기능 |
|---|---|
| `/` | 메인, 대표원장 진료복 사진·단체사진·3인 프로필·농구 일상 미리보기 |
| `/mission` | 미션, 대표원장 대체 프로필·개인 사진 스토리 |
| `/doctors` | 의료진 3인 사진, 단체사진, 조원익 사진 이야기 |
| `/doctors/:slug` | 개인 프로필·약력·진료·사례 연결 |
| `/doctors/cho-wonik#doctor-portraits` | 조원익 프로필 사진 5장 갤러리 |
| `/doctors/cho-wonik#doctor-life` | 조원익 농구·운동·일상 사진 7장 갤러리 |
| `/treatments`, `/treatments/:slug` | 진료 7과목 및 FAQ |
| `/cases`, `/cases/:id` | 치료 전후 비교, 치료 후 사진은 유효한 회원만 |
| `/column`, `/column/:slug` | 원장 칼럼, 정화된 HTML |
| `/encyclopedia`, `/encyclopedia/:slug` | 치과 용어 및 `?q=` 검색 |
| `/notice`, `/notice/:id` | 공지사항 |
| `/directions`, `/tour`, `/pricing` | 위치·공간·잠정수가 |
| `/faq`, `/area/:slug` | FAQ·지역별 진료 안내 |
| `/auth/register`, `/auth/login`, `/auth/mypage` | 회원가입·로그인·회원 정보 |
| `/reservation` | 상담 희망일 접수 (즉시 확정 예약 아님) |
| `/privacy`, `/terms` | 개인정보·이용약관 |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` | 검색·AI 검색 문서 |
| `/admin/login`, `/admin` | 관리자 로그인·대시보드 |
| `/admin/cases`, `/admin/posts`, `/admin/notices` | 등록·조회·수정·삭제 |
| `/admin/users`, `/admin/reservations` | 회원 삭제·예약 상태 변경 |

## 사진 출처와 배치
새 공유폴더: https://drive.google.com/drive/folders/1j2nk8xt5qYxZVLfBwDEhFy273T1lniJV

- 하위 폴더 전체 확인: 김경환 1개, 이민우 1개, 단체 2개, 조원익 폴더 13개 = 총 17개 파일.
- 조원익 폴더의 단체사진 1개는 단체 폴더 파일과 SHA-256이 동일. 이 중복만 제외하고 **16개 고유 이미지 모두 사용**.
- 조원익 개인 프로필 5장: 화이트 코트·진료복·좌석 및 대체 프로필. 메인, 미션, 의료진, 개인 프로필에 분산 사용.
- 조원익 일상 사진 7장: 농구 코트·경기·트로피·동료와의 기록·운동 프로필. `진료실 밖의 조원익`에 모두 배치. 스포츠 활동을 의료 수상·임상 실력으로 설명하지 않음.
- 김경환·이민우 원장은 새 폴더의 이름이 확인되는 실제 개인 사진으로 교체. 얼굴 인식으로 인물을 추정하지 않음.
- 단체사진은 로고 버전과 비로고 버전을 각각 의료진 소개와 메인에 사용.
- 데이터: `src/data/photos.ts`; 공통 사진 HTML: `src/photo-gallery.ts`; 확대 보기: `public/static/gallery.js`.
- 16장 모두 긴 변 최대 1600px WebP + 최대 640px 썸네일, 메타데이터 제거, 반응형 srcset 및 지연 로딩.
- 사진 갤러리는 원본 구도를 유지하며 클릭 확대, 이전/다음, 좌우 방향키, Escape 닫기, 터치 스와이프, 닫은 뒤 포커스 복귀 지원. JavaScript 없이도 이미지 링크 동작.
- 기존 페이지 전환 효과가 사진 확대 링크를 가로채지 않도록 처리.
- 원본 비교용 썸네일·폴더 목록·해시·작업자료는 `.reference/`에 보관하며 Git 및 공개 폴더에서 제외.

## 수가표 출처 및 확인 사항
기존 공유폴더: https://drive.google.com/drive/folders/1bG6StOrBpYS1UjsiMePMFSj8WfF6nBBX

- `고수치과_수가표_잠정수가 9.9.docx`: 9개 분류, 106행을 `/pricing` 및 `/llms-full.txt`에 반영.
- **9월 9일 잠정수가**로 표시. 숫자 금액은 문서 내 만원 표기에 맞춰 표시하고 최종 단위·금액·조건 확인 필요를 명시.
- 빈 금액은 확인 후 안내 또는 보험수가 적용.
- 코어톡스 50유닛 중복 행의 13만원 항목은 용량 확인 중, 레진 치경부 `4개 이상 6?`는 다수 치아 금액 확인 중, 부분교정 `임상기간 4만`은 조건 확인 중.
- 부가세 및 교정장치 추가비용 문구 보존. 명확한 오타만 정리. 최종 비급여 고지·의료광고 검토는 병원 확인 필요.

## 데이터와 보안
- D1: `users`, `cases`, `posts`, `notices`, `reservations`, `rate_limits`.
- R2: 접근제어 사례 이미지 `cases/`, 공개 칼럼·공지 이미지 `uploads/`.
- 정적 의료 콘텐츠·수가: `src/data/site.ts`.
- PBKDF2-SHA256 + 무작위 salt, 기존 해시 호환, 비밀번호 공백 보존.
- HMAC 서명 HttpOnly/Secure/SameSite=Lax 쿠키: 회원 30일 / 관리자 24시간.
- 인증 기본값 제거. `SESSION_SECRET` 최소 32자, `ADMIN_PASSWORD` 최소 12자. 미설정이면 인증 차단. 삭제된 회원은 기존 세션으로도 즉시 접근 불가.
- D1 원자적 요청 제한: 회원 로그인 IP당 30회/15분 + 이메일당 10회/15분, 관리자 로그인 10회/15분, 가입·상담 각각 10회/시간. 429 및 Retry-After 반환. Cloudflare의 `CF-Connecting-IP`만 신뢰, 해시 식별자 저장.
- 동의 필드 통일: `privacy_consent`, `marketing_consent`. 개인정보 동의 필수 및 입력 형식·길이·카테고리·상태 검증.
- 이미지: JPG/PNG/WebP, 파일당 5MB, MIME·시그니처 검사, UUID 파일명, SVG/HTML 거절. 요청 전체 21MB, 일반 JSON 16KB, 칼럼 JSON 256KB 제한.
- js-xss 허용목록 HTML 정화(저장·출력·관리자 편집 조회). JSON-LD 스크립트 탈출 방지. 쓰기 API 동일 출처 Origin 검증.
- 정적 자산 재검증 캐시 + CSS/JS 버전 쿼리. Worker 응답 no-store.
- 사례 이미지 교체는 DB 저장 후 이전 파일 삭제. 칼럼·공지 이미지 공유 가능성을 고려해 자동 삭제하지 않음.

## API 및 관리자 사용법
- `POST /api/auth/register|login|logout`, `GET /api/auth/me`, `POST /api/reservation`, `GET /api/regions`.
- `GET /api/case-image/:id/:field`: 비공개 사례는 관리자 전용, 치료 후 사진은 회원/관리자 인증 필요.
- `GET /api/uploads/:key`: 공개 이미지.
- `POST /api/admin/login|logout`.
- `POST /api/admin/{cases|posts|notices}` 및 `GET/PUT/DELETE /api/admin/{cases|posts|notices}/:id`.
- 사례·공지 저장은 multipart FormData, 칼럼은 JSON. 공지 고정 PUT JSON `{pinned:0|1}` 지원.
- `POST /api/admin/upload`, `DELETE /api/admin/users/:id`, `PUT /api/admin/reservations/:id`.
- 쓰기 API는 동일 출처 Origin 필수. 오류는 `{ok:false,error}`로 반환.
- 관리자 목록의 수정 → 기존 내용 불러오기 → 변경사항 저장. 사진은 새 파일 선택 시 교체, 삭제 체크 시 삭제, 선택하지 않으면 유지. 수정 취소 시 신규 등록 모드로 복귀.

## 개발과 검증
```bash
npm ci
npm run db:migrate:local
npm run build
pm2 start ecosystem.config.cjs
npm run typecheck
npm test
npm run test:api
npm run test:browser
npm audit
```
- 최초 브라우저 준비: `npx playwright install --with-deps chromium`.
- 단위 테스트 9개, 로컬 D1/R2 통합 테스트, 브라우저 테스트 4개(16개 이미지 사용·3인 프로필·모바일 너비·갤러리 키보드/닫기·가입/예약·관리자 CRUD).
- 쓰기 테스트는 localhost 전용이며 테스트 자료만 생성·삭제. API 테스트는 로컬 rate_limits를 초기화. 운영 URL에서 실행 금지.
- `.dev.vars`는 로컬 secrets 전용, Git 제외. 운영 secrets는 Cloudflare에서 별도 설정.

## 남은 항목
- 잠정수가의 단위·중복 용량·조건 확정 및 의료광고·개인정보 운영 기준 검토.
- 확정 전화번호·진료시간, 카카오/네이버예약·접수 알림 연동.
- 비밀번호 재설정·이메일/휴대폰 본인확인·예약 가능 시간표·전환 분석은 미구현.
- 관리자 권한 세분화·감사 로그·R2 미사용 파일 정리 권장.
- 운영 배포 방식 확인 후 원격 마이그레이션·secrets 점검·배포 및 운영 검증.

Last updated: 2026-09-13
