# Kubernetes platform-level narrative · 2026-10-31

- 초기 커밋까지 역추적해 플랫폼 ApplicationSet, 공통 Gateway/인증서, 모니터링, 중앙 로그, 공통 접근 정책과 렌더 검증을 본문 주제로 선정.
- 앱 등록·build_args·레거시 프록시·노드 DNS/라벨 변경 절 제거. 요약과 작업 방향, 주요 작업, 장점도 같은 범위로 수정.
- 초기 GitOps 설계는 초기 작업으로 서술. 책임 회피 문장·성과 수치 추가 없음.
- 독립 검토로 초기 ApplicationSet·공통 Gateway/인증서·모니터링·로그·공통 차트 기여 근거 확인. 접근 정책은 운영 HTTP 진입 경로로 명확히 표기.
- 사용자가 입력한 개발 기간은 유지. 첫 Git 커밋 날짜로 작업 시작일을 대체하지 않음.
- 다른 네 프로젝트, 쿠버네티스의 기간·이미지 메타데이터 보존 확인. 필수 npm run check의 47개 검사 통과. 화면 테스트 없음.

---

# Exhibition / Kubernetes narrative expansion · 2026-10-31

- 기존 프로젝트 설명의 소개·동기·주요 작업·구현 과정·장점 구조를 참고해 두 글 확장.
- 전시회 아키텍처 PNG를 먼저 사용자에게 제시한 뒤 본문에 삽입하고 실제 요청 경로·저장소·미디어 스트림과 대조.
- 쿠버네티스는 GitHub 계정에 연결된 작성 커밋과 현행 소스로 작업 범위를 확인. 모니터링·로그·CIDR·빌드/전시 배포·TLS 이전·Talos DNS/리스너 작업 중심으로 서술.
- 기존 다른 세 프로젝트의 파일 해시와 두 프로젝트의 개발·운영 기간 보존 확인.
- 이미지 추가에 맞춰 실제 이미지 16개·figure 11개 검사로 갱신하고 PNG 치수/경로/캡션 검사 추가.
- 독립 검토에서 RBAC의 수집 권한, CIDR 설정 파일 위치와 검증 범위, E2S 라벨 작업을 대조해 정확한 표현으로 수정.
- 필수 검수 npm run check: 서식·실제 콘텐츠 검사 19개와 콘텐츠 파일 검사 28개 통과. 브라우저 화면 테스트·사이트 스크린샷·원격 배포 명령은 실행하지 않음.

---

# Light wording edits · 2026-10-30

- 원문의 순서와 메모형 말투를 유지하며 중복 표현·어색한 조사·길어진 문장만 정리. 새로운 성과·기여·기간은 추가하지 않음.
- 수정 전후 Markdown AST의 목록 구조, 코드 원문, figure 부모 위치 일치 확인. 메타데이터와 figure HTML도 그대로 유지.
- 필수 검수 npm run check 실행. 브라우저 화면 테스트와 스크린샷은 실행하지 않음.

---

# List formatting regression and required checks · 2026-10-30

## 원인과 수정

- 원문을 옮기는 과정에서 2칸 들여쓴 하위 bullet이 번호 항목 밖으로 빠져나옴. 코드·figure도 항목 밖에 놓이면서 한 순서 목록이 여러 ol로 분리돼 1부터 반복됨.
- S-TOP의 구현 방법·개발 과정을 각각 하나의 2항목 ol로 수정. 돌핀의 가설·크롤러는 각각 2항목 ol, 배포 과정은 상위 항목 안의 5항목 ol로 수정.
- 크롤러 코드와 비교 이미지는 각각 1번·2번 li 안에 배치. 수정 전후를 번호 마커·들여쓰기·빈 줄을 제외하고 비교해 문구 동일 확인.

## 재발 방지

- build-content에서 Markdown AST와 HTML 트리 검증을 필수 실행. 반복 번호·분리된 번호 목록·잘못 들여쓴 코드·닫히지 않은 fence·제목 계층·목록 항목 수 및 깊이·코드 내용·figure/캡션과 부모 li 위치를 검사. 오류 시 빌드 실패.
- 실제 5개 프로젝트의 생성 HTML·dist 일치와 이미지 파일 존재 확인.
- npm run check 필수 검수 명령 추가. Project AGENTS.md와 README에 완료 전 실행 의무 기록.
- 브라우저 없는 서식 회귀 테스트 18개와 파일 기반 콘텐츠 테스트 28개 통과.
- 독립 소스 검토에서 현재 S-TOP·돌핀의 목록·코드·이미지 중첩 정상 확인. 검증기 누락에 대한 초기 지적은 재현되지 않아 검토자가 철회.
- 화면 테스트·사이트 스크린샷 실행 없음. 커밋·푸시·배포 없음.

---

# Original project wording · 2026-10-30

- S-TOP과 돌핀은 Notion 원문의 항목 순서·문제 상황·해결 과정·회고를 기준으로 가져오고 띄어쓰기와 일부 표현만 정리. 작성자가 남긴 세부 코드·설계 선택도 복원.
- 이전에 덧붙인 포장 문구·길어진 해설·사진 설명은 제거. 나머지 세 프로젝트도 기존 소개와 확인된 기능 범위에서 문장을 줄임.
- 다섯 프로젝트의 이름·요약·분류·기술 목록·본문·캡션에서 가운데점 제거. 돌핀 이름은 돌핀 (dolpin)으로 표시.
- 수정 전후 기간 필드 및 이미지 경로 일치 확인. 사용자가 추가한 세 프로젝트의 개발 기간도 그대로 유지.
- 기존 자기소개·경험·학력·수상 파일 SHA-256 일치.
- npm run build 통과, 로컬 이미지 파일 존재 및 소스·dist HTML 일치 확인. 화면 테스트·스크린샷·전체 테스트 스위트 실행 없음.

---

# Project period metadata · 2026-10-30

- developmentPeriod·operationPeriod 필드를 목록과 상세 상단에 별도 메타데이터로 표시. 비어 있는 항목은 생략.
- 확인된 개발 기간만 입력: S-TOP 2024, dolpin 2023 ~ 2024. 개발 기간과 운영 기간을 동일하게 추정하지 않음.
- S-TOP·돌핀 본문의 연도 중복 제거. 기간 상단 위치·목록 2개 표시·미확인 항목 생략·dist 일치를 소스 검사로 확인.
- npm run build와 git diff --check 확인. 화면 테스트·스크린샷·전체 테스트 스위트 실행 없음.

---

# Latest update: internal Notion images · 2026-10-30

- 노션 원본 이미지 12개를 로컬 사이트 자산으로 저장. 원본과 dist 자산의 SHA-256 일치 및 파일 크기 확인.
- S-TOP 로고 1개, 돌핀 대표 이미지 1개와 본문 figure 10개·캡션 10개. 본문 이미지 경로 모두 실제 로컬 파일로 확인.
- S-TOP·돌핀 상세 HTML에 노션 이동 버튼·노션 외부 링크 없음. 이미지 렌더링에 Notion 인증·서명 URL 불필요.
- npm run build 통과 및 스크립트 구문·git diff --check 확인.
- 사용자 요청대로 브라우저 화면 테스트·사이트 스크린샷을 실행하지 않음. 기존 테스트 소스만 새 링크 정책에 맞춰 갱신했고 테스트 스위트는 재실행하지 않음.
- 커밋·푸시·배포 없음.

---

# Latest project content update · 2026-10-30

- 요청한 5개만 순서대로 반영: 전시회 백엔드, Kubernetes One Repo, pi-provider-manager, S-TOP, dolpin.
- 각 프로젝트의 GitHub README 또는 Notion 하위 블록을 확인해 요약·상세 설명 작성.
- Macmagotchi와 Nether의 Markdown 및 생성 상세 페이지 제외.
- 기존 디자인, 소개·경험·학력·수상 원본 유지.
- npm run build 통과. 소스 및 dist의 5개 상세 페이지 일치 확인.
- 콘텐츠 테스트 26개와 서버 404 검사 1개 통과. 화면 테스트는 브라우저 실행 환경 문제로 수행되지 못했으며, 이후 사용자 요청에 따라 추가 실행하지 않음. 전체 화면 테스트 통과로 간주하지 않음.
- git diff --check 및 변경 스크립트 구문 검사 통과.
- 커밋·푸시·배포 없음.

---

## 이전 작업 기록 (이번 수정의 검증 결과가 아님)

# Portfolio exhibition verification

## Commands

- `npm test`: 45/45 passed, including the production build.
- Primary LSP diagnostics: no errors in build, content, server and test scripts.
- `lens_diagnostics(mode=all, severity=error)`: no blocking errors.
- `git diff --check`: passed.

## Content pipeline

- Existing 5 projects migrated to individual Markdown files.
- A new file creates a gallery card and standalone detail HTML without editing the home template.
- Body edits update detail pages; deletion removes stale generated pages.
- Sorting, optional image, Markdown lists/code/tables/images, metadata escaping and unsafe HTML/URL cleanup tested.
- Missing required fields, malformed headers, unsafe filenames, invalid links/images/scales/order and missing home markers fail explicitly.
- Empty directories and absent directories both produce an empty-state message, including a complete build.
- Repeated synchronization is idempotent. Root and dist detail pages match; CNAME is copied.

## Browser checks

- Chromium: 320, 375, 640, 768, 1024 and 1440px. No horizontal overflow, failed page-view asset requests or external runtime requests.
- Home and detail axe WCAG A/AA checks pass at 375 and 1440px. Links meet 44px target checks on home.
- Native navigation, initial deep links, list/detail round trips, skip link, focus outlines, JavaScript disabled, reduced motion and image failure tested.
- 200% text reflow on home/detail, short landscape viewport, print and forced colors tested.
- Desktop/mobile/tablet full-page and section screenshots saved under artifacts/final/. Desktop and mobile home, gallery, full page and detail screenshots visually inspected.

## Fixes from verification

- Explicit exhibition-panel width prevents aspect-ratio/min-height overflow at tablet widths.
- Email wrapping and grid child minimum widths prevent overflow at 200% text size.
- Mobile hero crop now preserves the character's head.
- White API logo strokes were changed to the existing ink token for contrast on light exhibition surfaces.
- Independent read-only reviewer identified missing-directory handling; fixed with a regression test.

## Boundaries

No commit, push or deployment. Dynamic content means rebuild-time discovery, not a CMS or live server. Chromium is the automated browser coverage; other browser engines were not exercised. Legacy designer helper scripts at ~/.omp/agent/extensions/designer/ are not installed; local Playwright, axe, LSP and visual checks were used instead.
