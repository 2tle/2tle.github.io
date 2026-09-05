# stringju · 양현준

프로필, 프로젝트, 이력, 연락처만 담은 정적 개인 사이트. HTML/CSS로 동작하며 방문 시 JavaScript·외부 API·CDN을 사용하지 않습니다.

## 실행

```sh
npm ci
npm run dev            # http://127.0.0.1:4173
npm run build          # 콘텐츠 동기화 및 dist/ 생성
npm run preview        # dist/ 미리보기
npx playwright install chromium
npm test
```

서버는 공개 사이트 파일만 제공합니다. 기본 호스트는 `0.0.0.0`; 로컬 전용은 `HOST=127.0.0.1 npm run dev`. 포트는 `PORT=8080`으로 바꿀 수 있습니다.

## 수정

- `index.html`: stringju / 양현준 소개, 관심 분야, 연락 링크, 메타데이터.
- `content/projects.md`: `---`로 구분한 헤더에 `name`, `link`(HTTPS)를 적고, 헤더 뒤에 한 줄 설명.
- `content/timeline.md`: 헤더에 `date`, `dateEnd`(선택), `org`; 뒤에 역할·학과 설명. 날짜는 `YYYY.MM` 또는 `YYYY.MM.DD`.
- `npm run sync:content`: Markdown 목록을 `index.html`에 반영. 빌드도 자동 동기화합니다.
- `styles.css`: 디자인 토큰과 반응형 레이아웃.
- `PRODUCT.md`, `DESIGN.md`, `PLAN.md`: 요구사항과 구현 기준. `EVIDENCE.md`: 공개 사실과 이미지 출처.

표시 이름은 stringju지만 GitHub 계정과 메일 주소는 확인된 기존 주소를 유지합니다.

## 이미지와 폰트

- `npm run refresh:profile`: 기존 GitHub 계정의 사진만 갱신. 실패하면 현재 파일을 유지하며 소개·이력을 변경하지 않습니다.
- 한국어 문구 변경 후 `node scripts/subset-font.mjs`: Noto Sans KR 글리프 갱신. 갱신에만 인터넷이 필요합니다. OFL 라이선스는 `assets/fonts/OFL.txt`.
- 달: NASA / GSFC / LRO CGI Moon Kit 표면 자료를 정적 WebP로 가공. 출처: https://svs.gsfc.nasa.gov/4720/. 재생성은 선택 사항으로 `python3 scripts/render-moon.py` 사용(Pillow 필요).

## 배포

루트 정적 파일을 GitHub Pages 브랜치에서 제공하거나, `npm run build`로 만든 `dist/`를 배포합니다. 보관 폴더를 제외하려면 `dist/` 방식이 적합합니다. 이 수정에서 배포 설정, push, `.old_donotuse`는 변경하지 않습니다.

## 접근성

모든 내용은 기본 HTML에 있으며 스크롤 고정·등장 애니메이션이 없습니다. 키보드 건너뛰기 링크, 포커스 표시, 44px 링크 높이와 반응형 레이아웃을 제공합니다. 검증 결과는 `QA.md`에 기록합니다.
