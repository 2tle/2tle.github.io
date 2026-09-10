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

- 첫 화면은 사용자의 캐릭터가 머무는 방을 계절별로 보여줍니다. 현재 계절이 기본으로 열리며 봄, 여름, 가을, 겨울을 직접 선택할 수 있습니다.
- 페이지 본문은 방 안 책상에서 펼친 기록장처럼 구성합니다. 경험은 달력형 타임라인, 기술은 메모 묶음, 프로젝트는 책상 위 오브젝트, 연락은 엽서 형태입니다.
- 상단 고정 내비게이션 없이 첫 화면 링크, 기록장 바로가기, 하단의 맨 위로 이동 링크로 탐색합니다.
- 마우스가 있는 환경에서는 프로젝트 조명과 기울기가 포인터에 작게 반응합니다. 데스크톱 방 이미지는 원시 스크롤에 맞춰 미세하게 확대됩니다.
- 모바일은 계절 장면과 소개 카드를 위아래로 분리해 캐릭터와 내용을 모두 읽을 수 있게 재구성됩니다.
- `prefers-reduced-motion`에서는 파티클, 변환, 리빌이 모두 꺼지고 완전한 정적 문서가 됩니다.
- JavaScript가 없어도 봄 배경과 모든 이력, 프로젝트, 연락처를 읽고 이동할 수 있습니다.

## 자산과 근거

- `background/spring.png`, `summer.png`, `fall.png`, `winter.png`: 사용자가 제공한 캐릭터의 계절별 방 일러스트
- `assets/images/profile.jpg`: 사용자 제공 공개 Notion 이력서와 기존 사이트에서 사용한 프로필 사진
- 프로젝트 식별 이미지: 해당 공개 저장소의 로고 또는 기존 사이트의 관계 표식
- `EVIDENCE.md`: 표시 가능한 외부 사실과 허용 문구
- `PRODUCT.md`, `DESIGN.md`, `PLAN.md`, `reference-study.md`: 콘텐츠, 시각 시스템, 구현 방향, 참고 연구 기록

공개 Notion 데이터베이스의 상세 수상 및 프로젝트 행은 조회 시 Cloudflare 제한으로 읽지 못했습니다. 그래서 상세를 추측하지 않고 페이지 블록에서 확인한 경험, 학력, 연락처와 기존 검증 프로젝트만 표시합니다.

## 검증

`npm test`는 콘텐츠 이스케이프, 여러 화면 폭의 오버플로, 스크롤 효과의 최종 정렬과 안정성, 포인터 효과 해제, 터치 입력, 해시 딥링크, reduced motion, JavaScript 비활성화, 이미지 실패, 키보드 포커스, axe WCAG A/AA, 200% 확대, 고대비 모드와 인쇄 스타일을 확인합니다.

검증 과정에서 모바일·태블릿·데스크톱 섹션 및 가로 화면 스크린샷을 `artifacts/final/`에 생성합니다.

배포, 커밋, 푸시는 별도 요청이 있을 때만 수행합니다.
