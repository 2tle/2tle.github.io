# PRODUCT.md

## What it is

양현준(stringju)의 공개 프로젝트를 중심으로 경험과 연락처를 보여주는 한국어 포트폴리오 전시 사이트.

## Target audience

채용 담당자와 개발 협업자. 작업물을 먼저 둘러보고, 상세 구현과 공개 저장소를 확인한다.

## Brand voice

차분한, 명료한, 개인적인.

## User-provided requirements

- Source: user: 사이트 전체를 포트폴리오 전시용으로 리팩토링한다.
- Source: user: 각 프로젝트를 Markdown으로 관리하고 동적으로 추가할 수 있게 한다.
- Source: user: 현재 디자인은 유지하고, 에이전트가 추가한 장식성 문구만 제거한다.
- Source: user: 사용자가 작성한 자기소개·이력은 줄이거나 다시 쓰지 않는다. 자기소개는 프로젝트 아래에 원문 그대로 유지한다.
- Source: existing brief: 사계절 일러스트와 자캐는 사이트의 개인적인 정체성이다.
- Source: user: 현재 웹사이트 형태와 디자인을 유지하면서 `npm run gen-pdf`와 같은 명령으로 experience와 project를 기업 제출용 PDF로 생성한다. PDF에도 유려한 디자인을 포함한다.

## Working assumptions

- 동적 추가는 GitHub Pages에 맞춰 빌드 시 Markdown 디렉터리를 자동 탐색하는 방식이다. 별도 CMS나 서버는 두지 않는다.
- 프로젝트 파일 하나가 갤러리 항목과 상세 페이지 하나가 된다.
- 프로젝트 갤러리 → 소개 → 경험 → 학력·수상 → 연락처 순으로 읽는다.
- 사계절 그림은 유지하되 화면 단위의 빈 스크롤 구간과 고정 배경 효과는 제거한다.
- 상단 내비게이션은 고정하지 않고 모바일에서도 바로 사용할 수 있다.

## Content and constraints

- 사실은 기존 content/ 파일을 유지한다. 성과 수치, 프로젝트 상태, 기여 범위는 추측하지 않는다.
- content/projects/*.md의 파일명은 주소, 메타데이터는 전시 정보, 본문은 상세 설명이다.
- 누락된 사례 분석은 꾸며 쓰지 않고 현재 확인 가능한 설명만 싣는다.
- 정적 HTML/CSS, 로컬 이미지와 Pretendard. 런타임 외부 요청 없음.
- Markdown 파싱과 HTML 정리는 빌드에서만 수행한다.
- 키보드 탐색, 44px 터치 영역, reduced motion, JavaScript 없는 읽기와 인쇄 지원.
- 배포·커밋·푸시는 별도 요청 시 수행한다.
