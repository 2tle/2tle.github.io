# Portfolio exhibition refactor

## Scope

- 프로젝트 중심 홈으로 재배치하고 기존 사계절 일러스트를 유지한다.
- content/projects/*.md에서 목록과 상세 HTML을 자동 생성한다.
- 기존 소개·경험·학력·수상 Markdown과 GitHub Pages 배포 방식을 유지한다.

## Implementation

1. 일반 HTML 앵커로 탐색하고 CSS Grid로 대표 프로젝트와 2열 갤러리를 구성한다.
2. 파일명에서 상세 주소를 만들고 order와 파일명으로 정렬한다. 파일 추가·수정·삭제를 빌드에 반영한다.
3. marked와 sanitize-html은 빌드에서만 실행한다. 런타임 스크립트와 스크롤·포인터 추적은 제거한다.
4. 빌드가 루트 HTML, projects/와 dist/를 함께 갱신한다. 스타일 해시는 상세 페이지에도 동일하게 사용한다.

## Risks and checks

| Risk | Mitigation |
| --- | --- |
| Markdown에 실행 가능한 HTML·URL 포함 | HTML 정리, 메타데이터 이스케이프, HTTPS·로컬 이미지 검증 |
| 프로젝트 삭제 후 오래된 상세 페이지 잔류 | 생성 HTML 정리와 삭제 회귀 테스트 |
| 프로젝트가 없거나 Git이 빈 디렉터리를 생략 | ENOENT만 빈 목록으로 처리하고 빈 안내 생성 |
| 텍스트 확대와 카드 비율에 따른 가로 넘침 | 명시적 이미지 면 너비, 그리드 최소 폭, 200% 확대 테스트 |
| 자동 생성기가 홈 내용을 덮어씀 | 기존 content 마커 유지, 마커 누락 시 쓰기 전에 실패 |
| 직접 배포 시 생성 파일 누락 | README에 루트 배포와 dist 배포 방법 명시 |

## Boundaries

CMS·관리 화면·검색·필터·런타임 Markdown 파싱은 추가하지 않는다. 기존 공개 설명 이상의 성과나 기여도는 만들지 않는다. 커밋·푸시·배포는 수행하지 않는다.
