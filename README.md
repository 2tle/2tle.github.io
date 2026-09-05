# 2tle · Hyunjun Yang

우주 배경과 스크롤 내러티브를 담은 정적 개인 포트폴리오입니다. React나 런타임 API 없이 HTML/CSS/JavaScript로 동작합니다.

## 로컬 실행

```sh
npm ci
npm run dev
```

http://127.0.0.1:4173 에서 확인합니다. 포트·호스트를 바꾸려면 `PORT=8080 HOST=0.0.0.0 npm run dev`. 서버는 공개 사이트 파일(index.html, styles.css, main.js, assets/)만 제공하며 기본적으로 `0.0.0.0`에 바인딩되어 같은 네트워크 기기에서 접근할 수 있습니다. 로컬 전용으로 제한하려면 `HOST=127.0.0.1`을 사용하세요.

```sh
npm run build          # 배포용 dist/ 생성 및 로컬 HTML 참조 검사
npm run preview        # dist/ 확인
npx playwright install chromium
npm test               # 브라우저·접근성·모션·반응형 테스트
```

## 내용 수정

- `content/projects.md`: 프로젝트 카드. `---` 헤더 안에 `name`, `kind`, `year`, `headline`, `tech`, `link`를 적고, 헤더 닫는 `---` 뒤에 소개 문장을 씁니다.
  - `art`: `orbit`(상단 대형 카드), `pixel`(로고 아이콘 카드), `diagram`(API 구조도 카드) 중 하나
  - `art: orbit`/`pixel`이면 `logo`(파일 경로)와 `caption`이 필요하고, `diagram`이면 `diagram-top`, `diagram-center`, `diagram-branches`, `aria`가 필요합니다
  - `featured: true`이면 전체 폭 카드로 표시됩니다
- `content/timeline.md`: 발자취 항목. `date`, `dateEnd`(선택), `category`, `org`를 적고 뒤에 한 줄 설명을 씁니다.
- 수정 후 `npm run sync:content`를 실행하면 `index.html`의 표시 영역에 주입됩니다. `npm run build`도 자동으로 동기화합니다.
- `index.html`: 자기소개·연락처 등 프로젝트/발자취를 제외한 나머지 문구. 모든 내용이 기본 HTML에 있어 JavaScript 없이도 읽을 수 있습니다.
- `styles.css`: 디자인 토큰과 반응형 스타일.
- `main.js`: 달 스크롤 전환, 메뉴, 모션 설정, 이메일 복사.
- `assets/images/profile.jpg`: GitHub에서 받은 원본 프로필 사진.
- `npm run build` 실행 시 `content/*.md` → `index.html` 주입 → 참조 검사 → `dist/` 생성 순서로 동작합니다.
- `EVIDENCE.md`: 공개 정보 출처와 이미지 크레딧. 확인되지 않은 수상과 성과 수치는 넣지 않았습니다.
- `PRODUCT.md`, `DESIGN.md`, `PLAN.md`: 기획과 구현 기준.

사진을 다시 가져오려면 `npm run refresh:profile`을 실행합니다. GitHub API에서 사진 URL을 파싱해 다운로드하며, API 오류 시 기존 사진을 유지합니다. 소개와 이력은 자동으로 덮어쓰지 않습니다.

한국어 문구를 바꾼 뒤 `node scripts/subset-font.mjs`를 실행하면 본문에 필요한 글리프를 포함한 Noto Sans KR 폰트를 다시 생성합니다. 폰트 갱신에는 인터넷이 필요하지만 페이지 열람에는 필요 없습니다. 포함되지 않은 새 글자는 시스템 글꼴로 표시됩니다. OFL 라이선스는 `assets/fonts/OFL.txt`에 있습니다.

달 이미지는 NASA CGI Moon Kit 표면 자료로 만든 정적 WebP입니다. 선택적으로 `python3 scripts/render-moon.py`로 재생성할 수 있습니다(Pillow 필요). Python은 사이트 실행과 빌드에 필요하지 않습니다.

## GitHub Pages

두 가지 방식 중 하나를 선택할 수 있습니다.

1. **브랜치 배포:** GitHub Settings → Pages → Deploy from a branch → 해당 브랜치의 `/ (root)`. 루트의 정적 파일이 그대로 동작합니다.
2. **Actions 배포:** `npm ci && npm run build` 후 `dist/`만 Pages artifact로 업로드합니다.

이 작업에서는 배포 설정 변경, push, 실제 배포를 수행하지 않았습니다. 개발용 서버는 공개 파일만 제공합니다. `.old_donotuse`는 기존 보관 폴더로 수정하거나 사용하지 않았습니다. 기존 보관 폴더를 배포 대상에서 확실히 제외하려면 `dist/` 배포 방식을 사용하세요.

## 접근성 / 동작

- 기본 스크롤을 가로채지 않습니다. 모바일과 모션 감소 환경에서는 고정 장면을 해제합니다.
- 시스템 모션 감소 설정을 우선하며, 하단 버튼으로도 모션을 줄일 수 있습니다.
- 방문 시 GitHub API, Google Fonts, 분석 도구에 요청하지 않습니다.
