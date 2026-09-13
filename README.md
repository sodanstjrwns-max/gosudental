# 고수치과의원 홈페이지 (GOSU DENTAL)

## 프로젝트 개요
- 내포신도시 고수치과 홈페이지: 병원·의료진·진료 소개, 회원 전용 사례, 상담 접수, 관리자 CMS.
- 대표원장 조원익 · 2026년 11월 2일 개원 예정.
- 주소: 충청남도 예산군 삽교읍 예학로 93, 5층.
- Hono + TypeScript + Cloudflare Pages / D1 / R2 / Vanilla JS.
- 수묵 콘셉트 유지. 모바일에서는 고비용 SVG 필터를 줄이고 정보·예약 접근성을 우선.

## URL 및 배포 상태
- 기존 프로덕션: https://gosudental.pages.dev
- 개발 미리보기: https://3000-ibwcewnougzmi7rx3gacu-d0b9e1e2.sandbox.novita.ai
- **2026-09-13 사진·수가표·보안·CMS·납품 최적화는 미리보기 반영, 프로덕션 미배포.** 미리보기는 임시 실행 환경입니다.
- 기존 운영 기록: 사용자 Cloudflare 계정(BYOK), Pages 프로젝트 `gosudental`, production branch `main`.
- 이번 작업은 원격 DB, 운영 secrets, 운영 사이트를 변경하지 않았습니다.
- 운영 배포 경로를 사용자와 확인한 뒤 `0002_request_protection.sql`, `0003_delivery_indexes.sql`을 포함한 미적용 마이그레이션과 secrets를 점검해야 합니다.

## 납품 최적화 결과
### 측정 (로컬 Lighthouse, 모바일 시뮬레이션, 동일 명령)
| 항목 | 이전 | 최종 |
|---|---:|---:|
| 성능 | 55 | 65 |
| 접근성 | 98 | 100 |
| 권장사항 | 100 | 100 |
| SEO | 100 | 100 |
| FCP (초기 표시) | 16.0초 | 5.0초 |
| LCP (주요 화면 표시) | 17.6초 | 6.3초 |
| 전송량 | 2,873KiB | 944KiB |
| CLS | 0.003 | 0 |
| TBT | 0ms | 0ms |

- 실사용자 데이터나 운영 성능 보장 수치가 아닙니다. 모바일 LCP는 아직 개선 여지가 있으며 운영 HTTPS·실제 휴대폰에서 재측정해야 합니다.
- 초기 표시 약 69%, LCP 약 64%, 전송량 약 67% 감소.
- Google/CDN 외부 폰트 CSS 제거. 기존 서체의 필요한 글자와 Font Awesome 아이콘만 로컬 WOFF2로 제공.
- 폰트 라이선스는 `public/static/fonts/*-LICENSE.txt` 보존. 수정 서체 이름 변경. 느린 연결에서는 `font-display:optional`로 시스템 대체 서체를 사용하여 늦은 글꼴 교체를 피함.
- 정적 문구 이외의 글자는 시스템 폰트로 대체될 수 있음. 정적 콘텐츠를 대폭 수정하면 폰트 서브셋을 다시 생성할 것.
- 인테리어 JPEG 12개는 원본을 유지하고 WebP를 추가: 총 1,859,257 → 1,079,710 bytes. 모바일 첫 화면 별도 경량 이미지와 반응형 preload.
- 빌드 시 CSS/JS 압축. 렌더 차단 CSS 요청을 없애기 위해 압축된 공통 스타일을 서버 HTML에 포함. `src/styles.generated.ts`는 빌드 스크립트가 생성하며 직접 수정하지 않음.

### 사용성·접근성
- 공개/관리자 입력 필드에 명시적 label 연결, 검색·예약 상태 선택·본문 편집기 이름 제공.
- 모바일 메뉴: aria-controls, 열림 상태, Escape 닫기, 키보드 순환, 본문/푸터/하단 메뉴 inert 처리.
- 치료 사례 필터: 잘못된 tablist 대신 그룹·aria-pressed. 전후 비교: 방향키, Home, End 지원.
- 관리자 표에 키보드 가로 스크롤 접근 제공. 모바일 관리자 폼 한 열 배치, 일부 낮은 명암비 수정.
- 회원가입·로그인·예약 폼의 로딩/결과/오류를 aria-live 영역에 표시. 중복 클릭 차단, 20초 요청 대기 제한, 실패 시 입력 유지.
- 관리자 저장 요청은 45초 대기 제한. 미저장 변경사항이 있을 때 페이지 이탈 경고. 시간 초과는 서버 취소를 보장하지 않으므로 저장 여부를 확인한 뒤 재시도.
- JavaScript가 없어도 소개·수가·통계는 표시. 온라인 접수는 JavaScript 필요 안내.
- reduced-motion 대응. 사진 16장 활용 및 거절된 프로필 모음 섹션 삭제 상태 유지.

### SEO·콘텐츠·안정성
- 회원·관리자·404·오류 페이지 noindex, 검색어 결과도 noindex.
- 상대 OG 이미지 주소를 절대 URL로 정규화, 칼럼 article 타입, 임의 이미지에 고정 1200×630 크기를 붙이지 않음.
- 사이트맵에 공지 상세 포함. XML 이스케이프, 근거 없는 매일 lastmod 갱신 제거. robots의 봇별 상충 규칙 통합.
- 미확정 진료시간 구조화 데이터 제거. 근거 없는 심의 준수·유일·최대 표현과 자동 reviewedBy 표현 제거.
- 의료진/진료 통계는 등록 데이터에 맞게 정정. 교육·학술 활동 26건은 등록된 이력 항목 수이며 전부 교육 수료 횟수로 표현하지 않음.
- 메인 인테리어는 설계 이미지임을 명시. 잠정수가를 확정 고지로 표현하지 않음.
- 공개 콘텐츠 DB 장애를 빈 목록이나 가짜 404로 감추지 않고 503/재시도 안내. 관리자 통계는 단일 쿼리로 조회하며 장애를 0건으로 표시하지 않음.
- 조회 패턴별 비파괴 인덱스 추가. 의료진/진료 연계 사례 쿼리에 썸네일·나이대 필드 보완.
- 최소 CSP(object-src/base-uri/frame-ancestors/form-action), Permissions-Policy 보강. 완전한 nonce 기반 script-src CSP는 미구현.
- R2 제공 시 JPG/PNG/WebP MIME 허용목록 검사. 사례·개인화·관리자/API/오류는 no-store, 공용 HTML은 재검증, 공개 업로드 이미지는 1시간 캐시.
- 회원 세션에는 ID만 저장. 비정상 비밀번호 해시 안전 거절. 회원과 관리자 로그아웃 쿠키 분리.

## 페이지 및 기능
| 경로 | 기능 |
|---|---|
| `/` | 메인, 대표원장·단체·3인 프로필·농구 일상 미리보기 |
| `/mission` | 미션, 대표원장 대체 프로필·개인 사진 스토리 |
| `/doctors`, `/doctors/:slug` | 의료진 소개·약력·진료·사례 |
| `/doctors/cho-wonik#doctor-life` | 농구·운동·일상 사진 7장 |
| `/treatments`, `/treatments/:slug` | 진료 7분야 및 FAQ |
| `/cases`, `/cases/:id` | 전후 비교, 치료 후 사진은 유효 회원/관리자 인증 |
| `/column`, `/column/:slug` | 원장 칼럼, 정화된 HTML |
| `/encyclopedia`, `/encyclopedia/:slug` | 용어 사전, `?q=` 검색 |
| `/notice`, `/notice/:id` | 공지사항 |
| `/directions`, `/tour`, `/pricing` | 위치·공간·잠정수가 |
| `/faq`, `/area/:slug` | FAQ·지역별 진료 안내 |
| `/auth/register`, `/auth/login`, `/auth/mypage` | 회원 기능 |
| `/reservation` | 상담 희망 접수 (즉시 확정 예약 아님) |
| `/privacy`, `/terms` | 개인정보·이용약관 |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` | 검색 안내 |
| `/admin/login`, `/admin` | 관리자 로그인·대시보드 |
| `/admin/cases`, `/admin/posts`, `/admin/notices` | 등록·조회·수정·삭제 |
| `/admin/users`, `/admin/reservations` | 회원 삭제·예약 상태 변경 |

## 사진 출처와 배치
- 공유폴더: https://drive.google.com/drive/folders/1j2nk8xt5qYxZVLfBwDEhFy273T1lniJV
- 김경환 1개, 이민우 1개, 단체 2개, 조원익 폴더 13개 = 17개 파일. SHA-256이 같은 단체사진 1개 제외 후 **16개 고유 이미지 모두 사용**.
- 조원익 프로필 5장은 메인·미션·의료진·대표 소개에 분산. 사용자 요청으로 별도 ‘사진으로 만나는 조원익 원장’ 섹션은 삭제. `#doctor-portraits` 재추가 금지.
- 일상 7장은 농구·트로피·동료·운동 기록이며 의료 수상/임상 실력으로 설명하지 않음.
- 각 이미지 최대 1600px WebP + 최대 640px 썸네일, 메타데이터 제거, srcset·lazy loading.
- native dialog 확대 보기: 좌우 방향키, Escape, 터치 스와이프, 닫은 뒤 포커스 복귀. JavaScript 없이 원본 링크 제공.
- 메타데이터 `src/data/photos.ts`, 템플릿 `src/photo-gallery.ts`, 상호작용 `public/static/gallery.js`.
- 원본 조사 자료는 `.reference/`에 있으며 Git 및 공개 디렉터리 제외.

## 수가표 출처 및 확인 사항
- 원본 폴더: https://drive.google.com/drive/folders/1bG6StOrBpYS1UjsiMePMFSj8WfF6nBBX
- `고수치과_수가표_잠정수가 9.9.docx`: 9분류 106행을 `/pricing`, `/llms-full.txt`에 반영.
- **9월 9일 잠정수가**. 숫자 금액은 문서의 만원 표기를 참고하되 최종 단위·금액·조건 확인 필요를 명시.
- 코어톡스 50유닛 중복 13만원 항목은 용량 확인 중, 레진 치경부 `4개 이상 6?`는 적용금액 확인 중, 부분교정 `임상기간 4만`은 조건 확인 중.
- 빈 금액 확인 후 안내/보험수가 적용. 부가세 및 교정장치 추가비용 문구 보존.

## 데이터와 보안
- D1 `gosudental-production`, binding `DB`: users, cases, posts, notices, reservations, rate_limits.
- R2 `gosudental-bucket`, binding `R2`: 인증 기반 사례 이미지 `cases/`, 공개 칼럼·공지 이미지 `uploads/`.
- 정적 의료 콘텐츠·수가 `src/data/site.ts`.
- PBKDF2-SHA256, 무작위 salt, 100,000회. HMAC 서명 HttpOnly/Secure/SameSite=Lax 쿠키: 회원 30일, 관리자 24시간.
- `SESSION_SECRET` 최소 32자, `ADMIN_PASSWORD` 최소 12자. 하드코딩 fallback 없음. 삭제 회원은 기존 세션도 즉시 차단.
- D1 원자적 요청 제한: 회원 로그인 IP 30회/15분 + 이메일 10회/15분, 관리자 10회/15분, 가입·상담 각각 10회/시간. 429/Retry-After.
- 개인정보 동의 필수, 마케팅 동의 별도. 쓰기 API Origin 검증, 입력 형식/길이/카테고리/상태 검증.
- 이미지 파일당 5MB, 전체 요청 21MB, 일반 JSON 16KB, 칼럼 JSON 256KB. MIME과 magic bytes 검사.
- js-xss 허용목록 정화(저장·출력·관리자 조회), JSON-LD 스크립트 탈출 방지.
- 사례 사진 교체는 DB 성공 후 이전 파일 삭제. 공유 가능성이 있는 칼럼·공지 이미지는 자동 삭제하지 않음.

## API 및 관리자 사용법
- `POST /api/auth/register|login|logout`, `GET /api/auth/me`, `POST /api/reservation`, `GET /api/regions`.
- `GET /api/case-image/:id/:field`: 비공개 사례는 관리자 전용, after는 회원/관리자 인증 필요.
- `GET /api/uploads/:key`: 공개 이미지.
- `POST /api/admin/login|logout`.
- `POST /api/admin/{cases|posts|notices}`, `GET/PUT/DELETE /api/admin/{cases|posts|notices}/:id`.
- 사례·공지는 multipart, 칼럼은 JSON. 공지 고정은 PUT JSON `{pinned:0|1}`.
- `POST /api/admin/upload`, `DELETE /api/admin/users/:id`, `PUT /api/admin/reservations/:id`.
- API 오류는 `{ok:false,error}`. 페이지 오류는 HTML 안내.
- 관리자 로그인 → 목록 ‘수정’ → 기존 정보 수정 → ‘변경사항 저장’. 새 사진을 선택하지 않으면 기존 사진 유지. 삭제 체크 시에만 명시적 삭제.
- 상담은 관리자 예약 목록에서 확인·상태 변경. 별도 접수 알림 연동은 없으므로 담당자가 주기적으로 목록 확인 필요.

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
- 기존 서버 재시작 전 3000 포트 정리, build 후 PM2 사용. 실제 실행은 `ecosystem.config.cjs` 참고.
- 최초 브라우저 준비: `npx playwright install --with-deps chromium`.
- 최종 검증: **단위 11개, 로컬 D1/R2 통합 1개, 브라우저 10개 모두 통과**, npm audit 알려진 취약점 0개.
- 브라우저: 16개 사진/삭제 섹션, 회원가입·예약·관리자 CRUD, 모바일/키보드, no-JS, 장애 응답 복구, SEO/캐시.
- axe WCAG 2A/2AA/2.1AA: 공개/로그인 9경로(390px), 인증된 관리자 6경로(390/1440px) 위반 0. 자동 검사 범위 내 결과이며 전체 접근성 인증을 의미하지 않음.
- 측정 파일 `.test-artifacts/lighthouse-before.json`, `lighthouse-after.json`, `axe-after.json`, `axe-admin-after.json`은 로컬 작업 산출물(Git 제외).
- 쓰기 테스트는 localhost 전용. 테스트 자료만 생성·삭제하며 API 테스트는 로컬 rate_limits 초기화. 운영 URL로 실행 금지.
- `.dev.vars` 및 `.env*`는 Git 제외. 운영 secrets는 별도 설정.
- 폰트 갱신(일반 빌드에는 불필요): Python `requests`, `fonttools[woff]`, `brotli` 설치 후 `python scripts/subset-fonts.py`, 이어서 `npm run build`.

## 납품·오픈 전 필수 확인
1. 확정 수가 단위·금액·중복 용량·부가세·적용 조건 승인.
2. 대표전화, 확정 진료시간, 지도 위치·주차 안내·개원일 확인.
3. 의료진 자격·이력과 의료광고 문구, 환자 사례 공개 동의/비식별화 검토.
4. 개인정보처리방침(문의 채널·보유/파기·클라우드 위탁/국외 처리 등 실제 운영 사항) 확정. 실제 개인정보 수집 전 운영 검토 필요.
5. 운영 배포 경로 확인 → DB/R2 백업·마이그레이션·운영 secrets 점검 → 배포 → 실기기/폼/이미지 접근 재검증.
6. 고객에게 관리자 접근정보를 안전한 별도 채널로 전달. 세션 전체 폐기 필요 시 SESSION_SECRET 교체. 이 저장소에 비밀번호를 적지 말 것.

## 미구현·권장 후속 작업
- 비밀번호 재설정, 이메일/휴대폰 본인확인, 회원 셀프 탈퇴, 예약 가능 시간표, 카카오/네이버예약·접수 알림, 전환 분석.
- 목록 서버 페이지네이션·검색은 미구현. 콘텐츠/회원이 늘어나면 우선 도입.
- 관리자 역할 세분화·감사 로그·R2 고아 파일 정리, 정기 백업/복구 훈련, uptime 모니터링 권장.
- 더 작은 첫 화면 전용 서체·스타일 분할 등 모바일 성능 후속 최적화 및 운영 필드 데이터 점검.

Last updated: 2026-09-13
