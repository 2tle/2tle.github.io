# stringju · 양현준

양현준의 경험, 기술, 프로젝트 기록을 담은 정적 포트폴리오입니다. GitHub Pages에서 동작하도록 HTML, CSS, JavaScript와 로컬 자산만 사용합니다.

## 실행

```sh
npm ci
npm run dev            # http://127.0.0.1:4173
npm run build          # 콘텐츠 동기화, 자산 해시 버전 처리, dist/ 생성
npm run preview        # dist/ 미리보기
npm test
```

## 콘텐츠 수정

`npm run build`는 아래 Markdown 데이터를 `index.html`의 지정된 마커로 안전하게 반영합니다.

- `content/experience.md`: 최근 경험, 역할, 세부 활동
- `content/skills.md`: Notion 이력서에서 가져온 기술 목록
- `content/projects.md`: 공개 저장소 프로젝트와 로컬 식별 이미지. 선택 필드 `category`와 `tools`로 용도와 사용 기술을 표시합니다.
- `content/education.md`: 학업 기록
- `content/timeline.md`: 이전 작업 기록

각 블록은 `---` 헤더와 본문 줄로 구성합니다. 프로젝트 링크는 HTTPS여야 하고 이미지는 `assets/images/` 아래의 로컬 파일만 허용합니다. 콘텐츠 생성기와 검증은 `scripts/build-content.mjs` 및 `tests/content.spec.mjs`에 있습니다.

한국어 문구를 수정한 뒤에는 다음 명령으로 자가 호스팅 Noto Sans KR 글리프를 갱신합니다.

```sh
node scripts/subset-font.mjs
npm run build
```

## 경험 설계

- 네 장의 방 일러스트가 페이지 전체의 배경으로 이어집니다. 스크롤에 따라 이미지가 같은 자리에서 부드럽게 겹쳐 전환되며, 계절 선택 없이 하나의 흐름으로 읽습니다.
- 따뜻한 아이보리와 올리브색, 열린 본문 열을 페이지 전체에 사용합니다. 경험은 타임라인, 기술과 프로젝트는 가는 구분선으로 정리하며 연락처까지 같은 배경이 이어집니다.
- 상단 고정 내비게이션 없이 첫 화면 링크, 기록장 바로가기, 하단의 맨 위로 이동 링크로 탐색합니다.
- 마우스가 있는 환경에서는 프로젝트 조명과 기울기가 포인터에 작게 반응합니다. 배경 전환은 기본 스크롤 위치에 연결되며, 다음 이미지가 준비되지 않으면 이전 그림을 유지합니다.
- 모바일에서는 상단 그림이 소개 문구로 자연스럽게 흐려지며, 본문은 반투명 아이보리 바탕으로 가독성을 확보합니다.
- `prefers-reduced-motion`에서는 배경 전환과 리빌이 꺼지고 봄 그림이 고정된 정적 문서가 됩니다.
- JavaScript가 없어도 봄 배경과 모든 이력, 프로젝트, 연락처를 읽고 이동할 수 있습니다.

## 자산과 근거

- `background/spring2.png`, `summer.png`, `fall.png`, `winter.png`: 페이지 전체에 이어지는 방 일러스트
- 프로젝트 식별 이미지: 해당 공개 저장소의 로고 또는 기존 사이트의 관계 표식
- `EVIDENCE.md`: 표시 가능한 외부 사실과 허용 문구
- `PRODUCT.md`, `DESIGN.md`, `PLAN.md`, `reference-study.md`: 콘텐츠, 시각 시스템, 구현 방향, 참고 연구 기록

공개 Notion 데이터베이스의 상세 수상 및 프로젝트 행은 조회 시 Cloudflare 제한으로 읽지 못했습니다. 그래서 상세를 추측하지 않고 페이지 블록에서 확인한 경험, 학력, 연락처와 기존 검증 프로젝트만 표시합니다.

## 검증

`npm test`는 콘텐츠 이스케이프, 여러 화면 폭의 오버플로, 네 장의 배경 전환과 역방향 복귀, 이미지 로딩 실패, 스크롤 효과의 안정성, 포인터 효과 해제, 터치 입력, 해시 딥링크, reduced motion, JavaScript 비활성화, 키보드 포커스, axe WCAG A/AA, 200% 확대, 고대비 모드와 인쇄 스타일을 확인합니다.

검증 과정에서 모바일·태블릿·데스크톱 섹션 및 가로 화면 스크린샷을 `artifacts/final/`에 생성합니다.

배포, 커밋, 푸시는 별도 요청이 있을 때만 수행합니다.
