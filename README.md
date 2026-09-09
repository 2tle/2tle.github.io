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
- `content/projects.md`: 공개 저장소 프로젝트와 로컬 식별 이미지
- `content/education.md`: 학업 기록
- `content/timeline.md`: 이전 작업 기록

각 블록은 `---` 헤더와 본문 줄로 구성합니다. 프로젝트 링크는 HTTPS여야 하고 이미지는 `assets/images/` 아래의 로컬 파일만 허용합니다. 콘텐츠 생성기와 검증은 `scripts/build-content.mjs` 및 `tests/content.spec.mjs`에 있습니다.

한국어 문구를 수정한 뒤에는 다음 명령으로 자가 호스팅 Noto Sans KR 글리프를 갱신합니다.

```sh
node scripts/subset-font.mjs
npm run build
```

## 경험 설계

- 데스크톱에서는 큰 달 이미지가 하나의 고정 스크롤 장면을 구성합니다. 원시 스크롤을 가로채지 않습니다.
- 경험, 기술, 프로젝트는 각기 다른 레이아웃과 작은 일회성 변환 애니메이션을 사용합니다.
- 모바일은 고정 장면 없이 일반 세로 흐름으로 재구성됩니다.
- `prefers-reduced-motion`에서는 고정, 변환, 리빌이 모두 꺼지고 완전한 정적 문서가 됩니다.
- JavaScript가 없어도 모든 이력, 프로젝트, 내비게이션, 연락처를 읽고 이동할 수 있습니다.

## 자산과 근거

- `assets/images/profile.jpg`: 사용자 제공 공개 Notion 이력서와 기존 사이트에서 사용한 프로필 사진
- `assets/images/moon.webp`: NASA / GSFC / LRO CGI Moon Kit 표면 자료를 로컬 WebP로 가공한 이미지. 원본 출처는 https://svs.gsfc.nasa.gov/4720/ 입니다.
- 프로젝트 식별 이미지: 해당 공개 저장소의 로고 또는 기존 사이트의 관계 표식
- `EVIDENCE.md`: 표시 가능한 외부 사실과 허용 문구
- `PRODUCT.md`, `DESIGN.md`, `PLAN.md`, `reference-study.md`: 콘텐츠, 시각 시스템, 구현 방향, 참고 연구 기록

공개 Notion 데이터베이스의 상세 수상 및 프로젝트 행은 조회 시 Cloudflare 제한으로 읽지 못했습니다. 그래서 상세를 추측하지 않고 페이지 블록에서 확인한 경험, 학력, 연락처와 기존 검증 프로젝트만 표시합니다.

## 검증

`npm test`는 콘텐츠 이스케이프, 여러 화면 폭의 오버플로, 실제 스크롤 변환, 해시 딥링크, reduced motion, JavaScript 비활성화, 이미지 실패, 키보드 포커스, axe WCAG A/AA, 200% 확대, 인쇄 스타일을 확인합니다.

배포, 커밋, 푸시는 별도 요청이 있을 때만 수행합니다.
