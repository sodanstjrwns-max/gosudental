# 고수치과의원 홈페이지 (GOSU DENTAL)

## 프로젝트 개요
- 고수치과의원 공식 홈페이지. 내포신도시 환자를 위한 병원 소개, 의료진·진료 콘텐츠, 회원 전용 사례, 상담 접수, 관리자 CMS.
- 대표원장 조원익 · 2026년 11월 2일 개원 예정.
- 주소: 충청남도 예산군 삽교읍 예학로 93, 5층.
- Hono + TypeScript + Cloudflare Pages, D1, R2, Vanilla JS. 수묵·한지 콘셉트 및 모바일 대응.

## URL 및 배포 상태
- 기존 프로덕션: https://gosudental.pages.dev (2026-09-13 메인 HTTP 200 확인).
- 개발 미리보기: https://3000-ibwcewnougzmi7rx3gacu-d0b9e1e2.sandbox.novita.ai
- **2026-09-13 사진·수가표·보안·CMS 수정은 로컬 검증 완료, 프로덕션 미배포.**
- 기존 문서상 배포 경로: 사용자 Cloudflare 계정(BYOK), Pages 프로젝트 `gosudental`, production branch `main`.
- D1: `gosudental-production` / binding `DB`.
- R2: `gosudental-bucket` / binding `R2`.
- 운영 배포 시 반드시 `0002_request_protection.sql`까지 원격 마이그레이션을 적용한 뒤 새 Worker를 배포해야 한다. 이번 작업은 원격 DB나 운영 secrets를 변경하지 않았다.

## 구현된 기능과 경로
| 경로 | 기능 |
|---|---|
| `/`, `/mission` | 메인·병원 미션 |
| `/doctors`, `/doctors/:slug` | 의료진 3인, 약력, 진료 및 사례 연결 |
| `/treatments`, `/treatments/:slug` | 진료 7과목 및 FAQ |
| `/cases`, `/cases/:id` | 치료 전후 비교, 치료 후 사진 로그인 필요 |
| `/column`, `/column/:slug` | 원장 칼럼, 정화된 HTML 본문 |
| `/encyclopedia`, `/encyclopedia/:slug` | 치과 용어, `?q=` 검색 |
| `/notice`, `/notice/:id` | 공지사항 |
| `/directions`, `/tour`, `/pricing` | 위치·공간·잠정수가 안내 |
| `/faq`, `/area/:slug` | 통합 FAQ·지역별 진료 안내 |
| `/auth/register`, `/auth/login`, `/auth/mypage` | 가입·로그인·회원 정보 |
| `/reservation` | 상담 희망일 접수 (즉시 예약 확정 아님) |
| `/privacy`, `/terms` | 개인정보·이용약관 |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` | 검색·AI 검색용 문서 |
| `/admin/login`, `/admin` | 관리자 로그인·대시보드 |
| `/admin/cases`, `/admin/posts`, `/admin/notices` | 등록·조회·수정·삭제 |
| `/admin/users`, `/admin/reservations` | 회원 삭제·예약 상태 변경 |

### API
- `POST /api/auth/register`, `/api/auth/login`, `/api/auth/logout` 및 `GET /api/auth/me`.
- `POST /api/reservation`: 이름·연락처·진료·희망일·메시지 및 `privacy_consent`.
- `GET /api/regions`: 지역 자동완성.
- `GET /api/case-image/:id/:field`: `pano_before`, `pano_after`, `photo_before`, `photo_after`. 비공개 사례는 관리자만, 치료 후 사진은 유효한 회원 또는 관리자만 접근.
- `GET /api/uploads/:key`: 칼럼·공지 이미지.
- `POST /api/admin/login`, `/api/admin/logout`.
- `GET/PUT/DELETE /api/admin/{cases|posts|notices}/:id`, `POST /api/admin/{cases|posts|notices}`.
- 사례·공지 저장: multipart FormData. 칼럼 저장: JSON. 공지 고정만 변경할 때는 PUT JSON `{pinned:0|1}`도 지원.
- `POST /api/admin/upload`: 이미지 업로드.
- `DELETE /api/admin/users/:id`, `PUT /api/admin/reservations/:id`.
- 모든 쓰기 API는 동일 출처 `Origin` 필수. 오류는 `{ok:false,error}` JSON으로 반환.

## 사진·수가표 출처 및 보류 사항
사용자가 제공한 폴더:
https://drive.google.com/drive/folders/1bG6StOrBpYS1UjsiMePMFSj8WfF6nBBX

- 조원익님4122.jpg: 메인 의료진 카드, 의료진 목록·개인 프로필에 적용. WebP 800×1200으로 최적화.
- 단체사진, 고수치과로고.jpg: 의료진 목록에 적용. WebP 1440×1800으로 최적화.
- 김경환·이민우 개인 사진 폴더는 확인 당시 비어 있어 기존 아이콘 유지. 단체사진 인물의 위치를 추정해 개인 사진으로 사용하지 않음.
- 수가표: `고수치과_수가표_잠정수가 9.9.docx`. 9개 분류, 106행을 `/pricing` 및 `/llms-full.txt`에 반영.
- 숫자만 적힌 금액은 문서 내 만원 표기에 맞춰 표시했으며 **최종 금액·단위 확인 필요**를 화면에 명시. 확정 고지로 표시하지 않음.
- 빈 금액은 확인 후 안내(보험 항목은 보험수가 적용). 코어톡스 50유닛 중복 행의 13만원 항목은 용량 확인 중, 레진 치경부 `4개 이상 6?`는 다수 치아 금액 확인 중, 부분교정 `임상기간 4만`은 조건 확인 중으로 표시.
- 부가세 별도 및 교정장치 추가비용 문구를 보존. `차아`, `o.3cc`, `o.5cc`, `Crwon` 등 명확한 오타만 정리.
- 원본 다운로드 및 작업용 이미지/문서는 `.reference/`에만 보관, Git·공개 정적 경로에서 제외.

## 데이터 및 보안
- D1: `users`, `cases`, `posts`, `notices`, `reservations`, `rate_limits`.
- R2: `cases/`에는 접근제어 이미지, `uploads/`에는 공개 칼럼·공지 이미지.
- 정적 의료 콘텐츠 및 수가: `src/data/site.ts`.
- 비밀번호: 무작위 salt + PBKDF2-SHA256, 기존 해시와 호환. 앞뒤 공백도 비밀번호 일부로 취급.
- HMAC 서명 HttpOnly/Secure/SameSite=Lax 쿠키: 회원 30일, 관리자 24시간.
- 하드코딩된 인증 기본값 제거. `SESSION_SECRET` 최소 32자, `ADMIN_PASSWORD` 최소 12자. 누락/짧은 설정이면 로그인 실패(503), 잘못된 토큰은 비인증 처리.
- 회원 인증 시 D1에서 회원 존재 여부 확인: 관리자 삭제 직후 기존 회원 쿠키로도 접근 불가.
- D1 기반 원자적 요청 제한: 회원 로그인 IP당 30회/15분 및 이메일당 10회/15분, 관리자 로그인 IP당 10회/15분, 가입·예약 각각 IP당 10회/시간. 초과 시 429 + Retry-After. 만료 식별자는 요청 시 정리. 운영 IP는 Cloudflare의 `CF-Connecting-IP`만 사용.
- 이름·전화·이메일·본문·슬러그·ID·카테고리·상태의 서버 검증. 잘못된 동의 값은 거절.
- 이미지: JPG/PNG/WebP, 파일당 5MB, 실제 시그니처와 MIME 일치 확인, UUID 파일명. SVG/HTML 및 위장 파일 거절. 요청 전체 21MB, 일반 JSON 16KB, 칼럼 JSON 256KB 제한.
- js-xss 기반 태그·속성 허용목록. 스크립트·이벤트 핸들러·위험 URL 제거. 저장·출력·관리자 편집 조회 시 정화, 본문 이미지는 병원 로컬 이미지 경로로 제한. JSON-LD 스크립트 탈출 방지.
- 쓰기 요청 Origin 검증으로 CSRF 방어. 콘텐츠 수정도 관리자 API 인증을 통과해야 함.
- 정적 자산은 재검증 캐시 + CSS/JS 버전 쿼리. 기존 1년 immutable 캐시를 우회. Worker 응답은 no-store.
- 사례 이미지 교체는 DB 저장 성공 후 이전 파일 삭제. 칼럼·공지 이미지는 공유 가능성을 고려해 삭제 시 자동 제거하지 않음(미사용 R2 정리 기능은 별도 필요).

## 관리자 사용법
1. `/admin/login`에서 설정된 관리자 비밀번호로 로그인.
2. 각 관리 메뉴에서 등록하거나 목록의 **수정** 버튼 선택.
3. 수정 폼에서 내용 변경 후 **변경사항 저장**.
4. 이미지는 새 파일 선택 시 교체, 삭제 체크 시 삭제, 아무 작업도 하지 않으면 유지.
5. **수정 취소 / 새로 작성**으로 신규 등록 모드 복귀.
6. 사례·칼럼은 공개/비공개 선택, 공지는 대표 고정 가능.

## 개발·검증
```bash
npm ci
npm run db:migrate:local
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000
npm run typecheck
npm test
npm run test:api
npm run test:browser
npm audit
```
- 테스트는 localhost 전용. `test:api`는 로컬 rate_limits를 초기화하며 테스트용 자료만 생성·삭제한다. 운영 URL에서 실행 금지.
- 브라우저 최초 준비: `npx playwright install --with-deps chromium`.
- 검증: 보안 단위 테스트, 실제 로컬 D1/R2 CRUD·접근제어 통합 테스트, 모바일 가입·상담 및 관리자 수정·취소·삭제 브라우저 테스트.
- `.dev.vars`에는 로컬 secrets만 저장. Git에 커밋하지 않는다. 운영은 Cloudflare secrets로 별도 설정.

## 남은 항목 / 다음 단계
- 잠정수가의 단위·중복 용량·조건을 병원에서 확정하고 의료광고·개인정보 운영 기준 최종 검토.
- 김경환·이민우 개인 프로필 사진 추가.
- 확정 전화번호·진료시간, 카카오/네이버예약·접수 알림 연동.
- 비밀번호 재설정·이메일/휴대폰 본인확인·예약 가능 시간표·전환 분석은 미구현.
- 장기적으로 관리자 권한 세분화·감사 로그·R2 미사용 파일 정리 권장.
- 운영 배포 방식 확인 후 원격 마이그레이션, secrets 점검, 배포 및 운영 동작 검증.

Last updated: 2026-09-13
