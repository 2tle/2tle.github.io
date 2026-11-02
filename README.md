# stringju · 양현준

프로젝트 갤러리와 프로젝트별 Markdown 상세 페이지로 구성한 정적 포트폴리오입니다. GitHub Pages에서 서버나 브라우저 JavaScript 없이 동작합니다.

## 실행

Node.js 22.16 이상을 사용합니다.

```sh
npm ci
npm run dev       # 빌드 후 http://127.0.0.1:4173
npm run build     # Markdown 자동 탐색, 목록·상세 페이지 생성, dist/ 출력
npm run preview   # dist/ 미리보기
npm run gen-pdf   # 최신 경험·프로젝트를 A4 PDF로 출력
npm run check    # 필수 검수: 빌드 + 서식 + 콘텐츠 검사 (브라우저 실행 없음)
npm test         # 화면 테스트 포함. 사용자 허용 시에만 실행
```

## 기업 제출용 PDF

```sh
npx playwright install chromium  # 최초 1회 (Linux: npx playwright install --with-deps chromium)
npm run gen-pdf
# 출력: artifacts/pdf/portfolio.pdf

npm run gen-pdf -- artifacts/pdf/양현준-포트폴리오.pdf  # 출력 경로 지정
```

- 먼저 사이트를 빌드한 뒤, 검증된 HTML에서 이름·연락처·경험과 모든 프로젝트를 가져옵니다. 웹사이트 디자인과 Markdown 원본은 변경하지 않습니다.
- 첫 장은 이름·연락처·경험·프로젝트 목차, 이후는 프로젝트별 새 페이지로 구성합니다. 프로젝트 순서는 웹사이트와 동일한 `order` 순서입니다. 경험이 길어지면 자연스럽게 다음 장으로 이어집니다.
- 원문을 자동 요약하지 않습니다. 개발·운영 기간, 기술, 상세 본문, 번호 목록, 코드, 이미지와 캡션을 유지합니다. 자기소개 본문·학력·수상·계절 장식은 PDF에 포함하지 않습니다.
- 기존 팔레트와 로컬 Pretendard를 사용하는 A4 전용 디자인입니다. 클릭 가능한 목차·외부 링크, 페이지 번호, PDF 북마크와 텍스트 선택을 지원합니다.
- 외부 네트워크 요청 없이 로컬 이미지와 글꼴 로딩을 기다린 뒤 인쇄합니다. 이미지나 글꼴 로딩에 실패하면 생성을 중단하고 기존 PDF는 유지합니다. 생성 과정은 Chromium의 PDF 인쇄이며, 화면 테스트·뷰포트 검사·사이트 스크린샷은 실행하지 않습니다.
- 함께 생성되는 같은 이름의 `.html`은 인쇄용 중간 파일입니다. 기업에는 **`.pdf` 파일 하나만** 제출하면 됩니다. `artifacts/`는 Git과 사이트 배포에서 제외됩니다.
- 사이트 하단의 `PDF 포트폴리오 보기` 버튼은 Git에 포함된 `assets/portfolio.pdf`를 엽니다. PDF를 갱신한 뒤 `cp artifacts/pdf/portfolio.pdf assets/portfolio.pdf`로 배포본을 교체하고 커밋합니다.
- 문서 스타일은 `scripts/portfolio-pdf.css`에서 조정합니다. `npm run test:pdf`는 브라우저 없이 원문·목록·코드·figure·이미지 경로 보존을 검사하며, `npm run check`에도 포함됩니다.

## 프로젝트 추가

`content/projects/my-project.md` 파일 하나를 추가하고 `npm run build`를 실행합니다. 목록 HTML이나 JavaScript를 직접 수정할 필요가 없습니다.

````markdown
---
name: 프로젝트 이름
summary: 갤러리에 표시할 한두 문장의 소개입니다.
category: Backend · Web service
tools: Java · Spring
developmentPeriod: 2023 ~ 2024
operationPeriod: 2024.01 ~ 2024.12
link: https://github.com/username/my-project
image: assets/images/api-mark.svg
order: 60
---
## 프로젝트 소개

어떤 문제를 해결하기 위해 만들었는지 설명합니다.

## 구현

- 맡은 역할
- 주요 기술 선택과 이유
- 실제로 확인한 결과

```java
System.out.println("Hello");
```

## 더 보기

[관련 기록](https://example.com)
````

### 작성 규칙

- 파일명은 영문 소문자·숫자·하이픈으로 작성합니다. `my-project.md` → `projects/my-project.html`.
- 상단 `---` 안은 **한 줄 `key: value` 메타데이터**입니다. YAML의 배열·중첩·여러 줄 값은 지원하지 않습니다. 따옴표는 필요 없습니다.
- 필수: `name`, `summary`, `link`(유효한 HTTPS 주소), 비어 있지 않은 Markdown 본문.
- 선택: `category`, `tools`, `image`, `imageScale`(0 초과 1 이하), `order`(0 이상 정수), `linkLabel`(상세 상단 링크 문구, 기본값: 저장소 보기), `hideLink`(true이면 외부 링크 버튼 숨김), `imageLayout`(wide이면 가로형 이미지).
- `developmentPeriod`, `operationPeriod`는 확인된 개발·운영 기간을 각각 한 줄로 작성합니다. 목록 카드와 상세 상단 메타데이터에 표시되며, 비어 있는 항목은 표시하지 않습니다. 운영 여부나 날짜는 개발 기간에서 추정하지 않습니다.
- `order` 오름차순으로 정렬합니다. 생략하면 100, 같으면 파일명 순입니다. 첫 항목은 대표 프로젝트로 크게 표시합니다.
- `image`는 실제 존재하는 `assets/images/` 내부의 SVG·WebP·PNG·JPG만 허용합니다. 생략해도 전시와 상세 페이지를 생성합니다.
- 본문은 `##`부터 시작하는 제목, 목록, 인용, 링크, 코드 블록, 표, 이미지를 지원합니다. 본문의 로컬 이미지는 `![설명](../assets/images/example.webp)`처럼 **생성된 상세 페이지 기준**으로 작성합니다.
- HTML은 `sanitize-html`로 정리하고 스크립트·이벤트 속성·위험한 URL을 제거합니다. Markdown 파싱에 사용하는 `marked`와 HTML 정리 라이브러리는 빌드에서만 실행됩니다.
- 파일을 수정·추가·삭제한 다음 다시 빌드하면 반영됩니다. 삭제한 파일의 생성 HTML도 제거합니다. 실행 중인 개발 서버에서도 재빌드 후 새로고침하면 됩니다.
- 프로젝트가 없어도 빈 상태 안내를 표시합니다. 잘못된 프로젝트 파일은 파일명과 원인을 출력하며 빌드에 실패합니다.

## 다른 콘텐츠 수정

- `content/introducing.md`: 소개
- `content/experience.md`: 경험과 역할, 활동별 링크
- `content/education.md`: 학력
- `content/awards.md`: 수상 기록

경험·학력·수상은 기존의 `---` 구분 블록 형식을 유지합니다. `npm run sync:content`는 콘텐츠만 동기화하고, `npm run build`는 스타일 캐시 버전과 배포 파일까지 갱신합니다.

## 구성과 배포

- `index.html`, `styles.css`: 프로젝트 중심 홈과 공통 스타일
- `content/projects/*.md`: 프로젝트 원본
- `projects/*.html`: 자동 생성된 상세 페이지. **직접 수정하지 않습니다.**
- `background/simple/`, `assets/`: 기존 사계절 그림, 로고와 로컬 Pretendard
- `dist/`: `.nojekyll`과 `CNAME`을 포함한 배포 결과

GitHub Pages에서 저장소 루트를 배포한다면 빌드 후 갱신된 `index.html`과 `projects/`도 함께 커밋합니다. Actions를 사용한다면 `npm ci && npm run build` 후 `dist/`를 업로드합니다. 별도 배포 설정 변경이나 푸시는 자동으로 수행하지 않습니다.

## 검증

**콘텐츠 변경 후 완료 보고 전에 `npm run check`를 반드시 통과해야 합니다.** 빌드만 성공한 것은 검수 완료로 간주하지 않습니다.

- `npm run build`: Markdown과 생성 HTML의 번호 목록, 중첩 구조, 코드 내용, figure 위치를 검사합니다. 오류가 있으면 생성을 중단합니다.
- `npm run test:format`: 서식 회귀 검사와 실제 5개 상세 페이지의 구조·로컬 이미지·dist 일치를 확인합니다.
- `npm run test:pdf`: 인쇄용 HTML의 콘텐츠·구조·로컬 자산 보존을 검사합니다. 브라우저는 실행하지 않습니다.
- `npm run test:content`: 브라우저나 웹 서버 없이 파일 기반 콘텐츠 테스트만 실행합니다.
- 번호 목록의 하위 목록과 코드·이미지는 해당 번호 항목의 본문 열에 맞춰 들여씁니다. 번호는 1, 2, 3 순서로 직접 기재합니다.
- 코드 블록은 여닫는 fence를 사용하고, figure는 이미지와 캡션을 한 쌍으로 둡니다.

`npm test`는 Markdown 파일 추가·수정·삭제, 정렬, HTML 안전성, 반복 빌드, 상세 페이지와 링크, 반응형·키보드 탐색·JS 비활성화·reduced motion·확대·axe 접근성을 확인합니다. 스크린샷은 `artifacts/final/`에 저장합니다.

## 노션 이미지의 로컬 보관

S-TOP·돌핀의 원본 이미지는 `assets/images/projects/`에 저장합니다. 본문에서 로컬 경로로 참조하므로 Notion 로그인이나 만료되는 이미지 URL에 의존하지 않습니다. `content/project-image-sources.json`은 원본 블록 ID와 파일 대응만 보관하며, 인증 정보와 서명 URL은 저장하지 않습니다.
