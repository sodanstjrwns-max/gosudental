# 고수치과의원 홈페이지 (GOSU DENTAL)

## 프로젝트 개요
- 내포신도시 고수치과 홈페이지: 병원·의료진·진료 소개, 회원 전용 사례, 상담 접수, 관리자 CMS.
- 대표원장 조원익 · 2026년 11월 2일 개원 예정.
- 주소: 충청남도 예산군 삽교읍 예학로 93, 5층.
- Hono + TypeScript + Cloudflare Pages / D1 / R2 / Vanilla JS.
- 수묵 콘셉트 유지. 모바일에서는 고비용 SVG 필터를 줄이고 정보·예약 접근성을 우선.

## URL 및 배포 상태
- 프로덕션: https://gosudc.kr (https://gosudental.pages.dev 및 www 호스트는 공개 페이지를 운영 도메인으로 301 이동)
- 개발 미리보기: https://3000-ibwcewnougzmi7rx3gacu-d0b9e1e2.sandbox.novita.ai
- **2026-09-15 사용자 승인 후 사진·수가표·보안·CMS·최적화·AI 진료 카드를 실제 운영 배포하고 검증 완료.** 미리보기는 임시 실행 환경입니다.
- 사용자 Cloudflare 계정(BYOK), Pages 프로젝트 `gosudental`, production branch `main`.
- 최신 배포: https://960d1a45.gosudental.pages.dev · 배포 코드 커밋 `88fd8f7` (모바일·SEO·AEO 기본 구조).
- 농구 에디토리얼 배포 기록: https://f215e00f.gosudental.pages.dev · 코드 `d5c8799`.
- 사진·보안 통합 배포 기록: https://8b218d77.gosudental.pages.dev · 코드 `ec4f1c0`.
- Pages의 Git Provider는 연결되어 있지 않습니다. **GitHub push만으로 운영은 갱신되지 않습니다.** `npm run build` 후 `npx wrangler pages deploy dist --project-name gosudental --branch main`을 별도 실행하고 운영 URL을 검증해야 합니다.
- 운영 D1 백업 후 3개 미적용 마이그레이션(0002_request_protection, 0003_delivery_indexes, 0004_merge_supplied_fees) 적용. 예전 미수정 기본수가 11행을 제공자료 106행으로 전환. 기존 칼럼 2개·공지 1개 보존, R2 데이터 변경 없음.
- 운영 `ADMIN_PASSWORD`·`SESSION_SECRET` 유지. `STATS_TOKEN`·`MASTER_KEY`는 stdin으로 운영 secrets 등록, 키 기반 API 200 확인.
- 백업: 비공개 `.reference/production-before-deploy-20260915.sql` (권한 600, Git 제외, SQLite 복원 검증 완료). SHA-256 `db0d4710331cde8942b4cb4ad6d4f2c4d0d3539217e106604391c679e3337c2a`.
- 이전 배포 복구 참조: `f5baef4c-8e9a-4bc5-be8c-d1b98d2d402d` / 코드 `36178e1`. DB 복원은 신규 접수 데이터 손실 가능성을 검토한 후 별도 수행해야 합니다.
- `/handover`의 공개 관리자 비밀번호 출력을 배포 전에 제거. 비밀번호는 별도 전달하며 no-store/noindex/no-referrer 및 제한 CSP 유지. 실제 로그인 및 `/admin`, `/admin/fees`, `/admin/reservations` 200 확인.
- 운영 검증: 공개 12경로 200, 의료진 사진 및 AI 3종 포함 정적 자산 21개 SHA-256 일치, PC/모바일 사진 디코딩 성공·가로 넘침 없음·브라우저 오류 없음. 테스트 회원/예약은 운영에 생성하지 않음.

## Git 통합 및 재발 방지
- 기준 GitHub: https://github.com/sodanstjrwns-max/gosudental (`origin/main`). Genspark 자동백업(`genspark/main`)과 별개 저장소입니다.
- 공통 조상 `58a5dfe`에서 로컬 4커밋(`aa66946`), GitHub 6커밋(`36178e1`)으로 갈라진 이력을 merge로 통합. rebase/force push/reset 사용하지 않음.
- 복구 브랜치: `backup/local-before-sync-aa66946`, `backup/remote-before-sync-36178e1`, `backup/origin-before-fetch-58a5dfe`.
- 사진 16장·106행 수가·보안·CMS·최적화와 원격의 수가 편집기·통합 통계·GA4·Clarity·beacon·Google/Naver 인증 메타를 함께 유지.
- `/admin/fees`에서 분류·항목·금액·비고·공개 여부 편집, `POST /api/admin/fees`로 전체 저장. 256KB/30분류/300항목 제한과 선검증 적용. 모든 수가 비공개/삭제 시 `/pricing`, `/llms-full.txt`에서 기본 수가로 되돌아가지 않음.
- 기존 `0002_fees.sql`은 원격 적용 이력 보존을 위해 이름/내용을 유지. 번호가 겹치는 `0002_request_protection.sql`과 서로 다른 파일이며 둘 다 필요.
- `0004_merge_supplied_fees.sql`은 fees가 수정되지 않은 옛 11행 시드와 정확히 같을 때만 106행 잠정수가로 전환. 편집/비공개/삭제된 DB 수가는 변경하지 않음. 해당 4가지 조건 검증 완료. 2026-09-15 운영 DB의 조건 충족을 읽기 전용 쿼리로 확인 후 적용 완료.
- `/admin/stats`: 관리자 세션 또는 기존 키 인증을 유지. `/api/local-stats`: 최근/직전 28일 실예약 집계. `Authorization: Bearer ...` 권장, 기존 `?key=` 호환도 유지.
- **운영 설정 완료:** `STATS_TOKEN`, `MASTER_KEY`를 운영 secrets에 등록하고 키 기반 통계 API 응답을 검증했습니다. 코드에 있던 키는 제거하고 로컬 `.dev.vars`(Git 제외)로 이전. 이전 Git 이력에 남아 있으므로 운영 키 교체를 권장하며 중앙 대시보드와 함께 갱신해야 합니다. 키를 로그/문서/프런트엔드에 적지 말 것.
- 분석 스크립트는 운영 호스트(gosudental.pages.dev, gosudc.kr, www.gosudc.kr)의 공개 콘텐츠에서 동작. 로컬 QA·미리보기·로그인·예약·사례 화면은 분석 대상 제외. 운영 개인정보 정책과 분석 설정 확인 필요.
- `git fetch origin` 후 `git log --left-right HEAD...origin/main`으로 시작점 확인 → 변경 보존·병합 → 테스트 → 일반 `git push origin main` → `git ls-remote`로 실제 원격 해시 확인. 자동백업을 GitHub push로 간주하지 말 것.
- 다른 작업창에서도 변경을 커밋/보존한 뒤 `git fetch origin && git merge origin/main`으로 통합본 반영. 미커밋 변경을 `reset --hard`로 버리지 말 것.

## 2026-09-15 진료 카드 AI 이미지
- 사용자 요청 및 생성 승인 후 메인 `/`와 진료안내 `/treatments`의 핵심 진료 카드 3장 교체.
- 임플란트: 투명 치아 모형과 임플란트를 설명하는 장면. 치아교정: 투명교정 장치를 맞추는 장면. 심미보철·라미네이트: 자연스러운 치아와 미소 클로즈업.
- 심미보철은 색상표/손잡이 이미지의 부자연스러운 형태를 검수에서 제외하고, 기구 없는 미소 이미지로 최종 선정. 실제 환자/시술 결과를 재현한 사진이 아님.
- 각 카드의 ‘AI 생성 이미지’ 표기와 카드 아래 설명을 유지. 기존 의료진 실제 사진 16장과 인테리어 투어 사진은 변경하지 않음.
- `public/static/img/treatment-{implant|ortho|aesthetic}-ai-20260915.webp`: 1200×800. `-640.webp`: 640×427. 총 6파일 약 241KiB, srcset·지연 로딩·명시적 크기 적용.
- 생성 모델 GPT Image 2. 최종 원본 파일 ID: 임플란트 K5c7mU8G, 교정 YQlxUycw, 심미 CbS9l3uk. 원본/검수용 파일은 비공개 작업 폴더 `.reference/`(Git 제외)에 보존.
- 원격 최신 `2d86049`와 일치한 상태에서 이미지 작업 시작. 이미지 작업 당시 미배포였으며, 2026-09-15 통합 운영 배포에서 반영 완료.

## 2026-09-15 모바일 · SEO · AEO 기본 구조 정비
- 전체 로컬 사이트맵 146개 URL 감사: H1은 모두 1개, H 단계 건너뜀은 127페이지에서 0페이지로 개선. 헤딩 수준을 변경해도 기존 디자인을 유지하도록 CSS 선택자 동기화.
- canonical/OG URL을 운영 도메인의 정규 경로로 통일하고 query·fragment·끝 슬래시 제외. 공개 GET/HEAD의 끝 슬래시는 301로 통합(쿼리 보존), 관리자/API 쓰기 경로는 리다이렉트 대상 제외.
- 모든 공개 문서에 고유 `#webpage` 노드, WebSite·Dentist·BreadcrumbList 연결. 의료진 Person/ProfilePage, 용어 DefinedTerm/MedicalWebPage, 칼럼 BlogPosting 및 실제 DB 작성·수정 일시/작성자/이미지 메타 적용.
- 모든 시술을 NoninvasiveProcedure로 분류하던 오류, 확인되지 않은 reviewedBy/lastReviewed·학교 이력 자동 추정·중복 병원 엔터티·미확인 좌표 및 미래 설립일 제거. 개원 예정 문구 자체는 유지.
- 진료 상세에 화면에도 보이는 핵심 답변·담당 의료진·수가 링크·의료정보 주의사항·목차 추가. 의료진 기본 아이콘을 실제 사진으로 교체. 대표 이미지는 반응형 img/srcset/fetchpriority 사용하며 AI/설계 이미지 표기 유지.
- FAQ 스키마는 실제 표시되는 전체 질문과 일치. llms 문서에 진료·의료진·용어·공개 수가 원문 링크와 잠정/회원열람/진단 한계 명시. llms 파일은 보조 안내이지 AI 노출 보장 수단이 아님.
- 사례 상세·검색 결과 noindex를 HTML/HTTP에 일치시키고 사례 상세는 사이트맵 제외. 공개 업로드 이미지의 잘못된 noindex를 해제하되 인증 API·미존재 이미지·비공개 사례는 보호 유지.
- 320px 지도 iframe 넘침 수정, 모바일 의료진/관련 진료 카드 1열, 메뉴 동적 화면 높이·safe-area, 본문 표/이미지 리플로우, 목차/용어 링크 터치 영역, 앵커 헤더 가림 보완.
- 회귀 검사: sitemap의 200/H1/헤딩/canonical/OG/title/description/연결 스키마 전체 확인, JavaScript 없이 주요 상세 화면·FAQ 본문 일치 확인. 최종 점수나 실제 검색 노출 보장은 아님.
- 기준 문서: [Google AI 기능 가이드](https://developers.google.com/search/docs/appearance/ai-features), [구조화 데이터 정책](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [Article 가이드](https://developers.google.com/search/docs/appearance/structured-data/article).
- 운영 DB·수가·인증 secrets 및 사진 원본은 변경하지 않음. Search Console/네이버 실제 색인·운영 Core Web Vitals는 별도 모니터링 필요.
- 운영 배포 후 실제 사이트맵 149개 URL 전체(기존 칼럼 2개·공지 1개 포함)를 검증: HTTP 200, H1 1개, 헤딩 건너뜀 0, canonical/OG 일치, 메타 누락 0, 연결 스키마 오류 0, 중복 title 0. 자체 구조 검사 결과이며 Google 리치 결과 승인이나 노출을 뜻하지 않음.
- 운영 320/390/768px 진료 상세·지도·FAQ 화면 넘침 없음, 대표 이미지 디코딩·핵심 안내 표시 확인, 브라우저 스크립트 오류 0. 보고서 `.test-artifacts/seo-production.json` (Git 제외).

## 납품 최적화 결과
### 병합 이전 측정 (로컬 Lighthouse, 모바일 시뮬레이션, 동일 명령)
아래 수치는 `aa66946` 기준입니다. GitHub의 분석 스크립트 복원 후 운영 성능은 다시 측정해야 합니다.
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
| `/cases`, `/cases/:id` | 전후 비교, 치료 후 사진은 유효 회원/관리자 인증. 상세는 noindex·사이트맵 제외 |
| `/column`, `/column/:slug` | 원장 칼럼, 정화된 HTML |
| `/encyclopedia`, `/encyclopedia/:slug` | 용어 사전, `?q=` 검색 |
| `/notice`, `/notice/:id` | 공지사항 |
| `/directions`, `/tour`, `/pricing` | 위치·공간·잠정수가 |
| `/faq`, `/area/:slug` | FAQ·지역별 진료 안내 |
| `/auth/register`, `/auth/login`, `/auth/mypage` | 회원 기능 |
| `/reservation` | 상담 희망 접수 (즉시 확정 예약 아님) |
| `/privacy`, `/terms` | 개인정보·이용약관 |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` | 검색 안내 |
| `/handover` | 공개 납품 안내서, 비밀번호 미포함·검색 제외 |
| `/admin/fees`, `/admin/stats` | 수가 편집·통합 통계 |
| `/admin/login`, `/admin` | 관리자 로그인·대시보드 |
| `/admin/cases`, `/admin/posts`, `/admin/notices` | 등록·조회·수정·삭제 |
| `/admin/users`, `/admin/reservations` | 회원 삭제·예약 상태 변경 |

## 2026-09-15 농구 에디토리얼 리디자인
- 메인 `/#director-life-preview`를 단순 3열 사진 모음에서 먹색 배경의 농구 매거진 레이아웃으로 변경.
- 큰 경기 사진, 하늘색 제목, 폴라로이드형 인물 사진, 작은 경기 기록과 일상 연결 CTA. 원본 사진 3·5·10 및 전체 16개 사진 사용 유지.
- PC 2열 / 모바일 1열, 320·390·768·1024·1440px 화면과 3장 확대보기·방향키·Escape·포커스 복귀 회귀 테스트 추가.
- 새로운 이미지·외부 폰트·JavaScript 의존성 없음. 공통 CSS는 기존 빌드에서 압축 및 인라인 처리. DB·운영 secrets 변경 없음.
- 개인 농구 기록은 진료 성과·의료 수상으로 표현하지 않음. 삭제된 `#doctor-portraits`는 복구하지 않음.
- 운영 반영 완료. 실제 gosudc.kr에서 1440/390px 사진 3장 디코딩·확대보기·가로 넘침 없음 확인. 로컬 단위 13개·브라우저 12개 통과, 해당 섹션 axe 자동 접근성 위반 0.

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
- D1 `gosudental-production`, binding `DB`: users, cases, posts, notices, reservations, rate_limits, fees.
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
- 최종 검증: **단위 17개, 로컬 D1/R2 통합 2개, 브라우저 14개 모두 통과**, npm audit 알려진 취약점 0개.
- 브라우저: 16개 사진/삭제 섹션, 회원가입·예약·관리자 CRUD, 모바일/키보드, no-JS, 장애 응답 복구, SEO/캐시.
- axe WCAG 2A/2AA/2.1AA: 공개/로그인 9경로(390px), 인증된 관리자 7경로(수가 편집 포함, 390/1440px) 위반 0. 자동 검사 범위 내 결과이며 전체 접근성 인증을 의미하지 않음.
- 측정 파일 `.test-artifacts/lighthouse-before.json`, `lighthouse-after.json`, `axe-after.json`, `axe-admin-after.json`은 로컬 작업 산출물(Git 제외).
- 쓰기 테스트는 localhost 전용. 테스트 자료만 생성·삭제하며 API 테스트는 로컬 rate_limits 초기화. 운영 URL로 실행 금지.
- `.dev.vars` 및 `.env*`는 Git 제외. 운영 secrets는 별도 설정.
- 폰트 갱신(일반 빌드에는 불필요): Python `requests`, `fonttools[woff]`, `brotli` 설치 후 `python scripts/subset-fonts.py`, 이어서 `npm run build`.

## 납품·오픈 전 필수 확인
1. 확정 수가 단위·금액·중복 용량·부가세·적용 조건 승인.
2. 대표전화, 확정 진료시간, 지도 위치·주차 안내·개원일 확인.
3. 의료진 자격·이력과 의료광고 문구, 환자 사례 공개 동의/비식별화 검토.
4. 개인정보처리방침(문의 채널·보유/파기·클라우드 위탁/국외 처리 등 실제 운영 사항) 확정. 실제 개인정보 수집 전 운영 검토 필요.
5. BYOK 운영 배포·DB 백업·마이그레이션·secrets·이미지/관리자 접근 검증 완료. 후속 배포도 Git push와 별도로 실행하고 실기기 동작을 점검할 것.
6. 고객에게 관리자 접근정보를 안전한 별도 채널로 전달. 세션 전체 폐기 필요 시 SESSION_SECRET 교체. 이 저장소에 비밀번호를 적지 말 것.

## 미구현·권장 후속 작업
- 비밀번호 재설정, 이메일/휴대폰 본인확인, 회원 셀프 탈퇴, 예약 가능 시간표, 카카오/네이버예약·접수 알림. GA4·Clarity·중앙 통계 연결 코드는 병합으로 복원됨.
- 목록 서버 페이지네이션·검색은 미구현. 콘텐츠/회원이 늘어나면 우선 도입.
- 관리자 역할 세분화·감사 로그·R2 고아 파일 정리, 정기 백업/복구 훈련, uptime 모니터링 권장.
- 더 작은 첫 화면 전용 서체·스타일 분할 등 모바일 성능 후속 최적화 및 운영 필드 데이터 점검.

Last updated: 2026-09-15
