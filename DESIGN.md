# DESIGN.md · stringju project gallery

## Direction

프로젝트를 감상하고 상세 기록으로 들어가는 전시형 개발자 포트폴리오. 기존 사계절 그림과 로컬 Pretendard를 재사용한다. 외부 디자인 시스템을 도입하지 않는 네이티브 CSS 구현이다.

## Dials

DESIGN_VARIANCE 6 / MOTION_INTENSITY 2 / VISUAL_DENSITY 4.

## Palette

기존 계절 팔레트를 계승한다. CSV 신규 팔레트가 아니라 저장소의 브랜드 색상이다.

| Role | Color |
| --- | --- |
| Paper / on accent | #FFFFFF |
| Ink | #493B36 |
| Muted | #685953 |
| Rule | #DED5CE |
| Primary / focus | #765055 |
| Spring surface | #F8ECEA |
| Summer surface / accent | #EEF3E7 / #557659 |
| Autumn surface / accent | #F8EFE4 / #9C684A |
| Winter surface / accent | #EEF1F6 / #65789C |

프로젝트 로고·일러스트 내부 색은 원본 자산을 그대로 유지한다. 다크 모드는 이번 범위에 없다.

## Typography and spacing

기존 로컬 Pretendard 가변 글꼴. Display 64–112px, h2 32–56px, h3 22–32px, body 16px/1.8, caption 13–14px/1.6. Headings tracking -0.05em, body 0.
컨테이너 최대 1200px, 좌우 24–64px. 섹션 간격 80–112px, 요소 간격 8/12/16/24/32/48px.

## Layout

- 헤더: 브랜드와 작업·소개·경험·연락 바로가기. 고정하지 않는다. 모바일은 두 줄의 명시적 탐색으로 접어 숨기지 않는다.
- Hero: 좌측 이름과 한 줄 소개, 우측 큰 봄 일러스트. 모바일에서 그림은 텍스트 아래. CTA는 그림 앞에 표시한다.
- Gallery: 2열, 첫 프로젝트는 전폭의 가로 전시. 나머지는 큰 로고 전시 면과 설명. 모바일은 모두 1열.
- 소개: 여름 일러스트와 원본 소개. 경험: 날짜와 역할의 읽기 쉬운 행.
- 학력·수상: 데스크톱 2열, 768px 아래 1열. 연락처: 겨울 일러스트와 큰 이메일 링크.
- 상세: 목록 복귀, 이름·요약·기술·저장소 링크, 읽기 폭 760px의 Markdown 본문. 표·코드는 자체 가로 스크롤.

## Components and motion

모든 전시 면과 버튼은 각진 모서리, 그림자 없음. 로고 면은 계절색 배경, 장식용 가짜 제품 화면 없음.
Hover: transform 160ms ease-out. Active: translateY(1px). 인위적인 진입 숨김·스크롤 감지·포인터 추적 없음.
기본 스크롤과 해시 이동은 브라우저의 즉시 이동을 사용한다. Reduced motion에서는 hover 전환을 끈다.

## Accessibility

본문 대비 4.5:1 이상, 3px focus outline, 링크 최소 높이·폭 44px. 단일 h1, 순서대로 h2/h3. 그림은 장식 alt 빈 값. JavaScript 없이 전체 콘텐츠와 링크 사용 가능.
인쇄에서는 내비게이션과 장식 그림을 숨기고 흰 배경의 단일 열을 출력한다.
