# stringju 개인 포트폴리오

## Brief
- Source: user: 나를 소개하는 웹사이트. GitHub 프로필 사진 사용.
- Source: user: 우주 배경과 Apple 제품 페이지에서 영감을 받은 스크롤 경험.
- Source: user: 동료·협업자가 주요 방문자. GitHub 공개 정보로 먼저 진행 승인.
- Source: user (이번 수정): 불필요한 텍스트와 요소를 전체적으로 과감히 제거한다.
- Source: user: 표시 이름은 stringju, 실명은 양현준. 소개에 실명을 사용한다.
- Source: user (최신 수정): Apple 스크롤 웹페이지 형식은 유지하고, 단순하지만 확실히 보이는 애니메이션을 넣는다. 직전의 작은 정적 목록형 화면은 원한 결과가 아니다.
- Scope: 한국어 단일 페이지. 전면 우주·프로필 장면 → 프로젝트 쇼케이스 → 간단한 이력 → 연락 링크.
- Voice: 담백한, 짧은, 구체적인.
- Approval: 추가 승인 없이 구현 진행.

## Verified public facts
- 사이트 표시 이름 stringju와 실명 양현준은 사용자 제공. GitHub 계정 2tle과 사진 URL은 기존 공개 자료.
- GitHub 저장소·메일 주소는 검증된 기존 주소를 유지한다. 브랜딩 변경만으로 URL을 추측하지 않는다.
- GitHub 프로필 README: 백엔드, 네이티브 앱, ML을 공부하고 개발.
- 성균관대학교 컴퓨터공학과 2024.02 시작; 선린인터넷고 소프트웨어과 2021.03~2024.02.
- Team LogCat 백엔드 2022.12~2024.12; MIDAS IT 동계 인턴 2023.02.06~02.24.
- Survirun Android·백엔드 2021.10~2022.12.
- 프로젝트: Nether (초기 Rust 데스크톱 터미널), Macmagotchi (macOS 메뉴 막대 반려동물), SurvirunAPI (운동 앱 API).
- 공개 메일 iam@2tle.io; 블로그 https://stringju.tistory.com.
- 세부 출처와 허용 문구: EVIDENCE.md.

## Content gaps
- 수상 내역: [NEEDS INPUT], 섹션과 수치 표시하지 않음.
- 프로젝트 성과·사용자 수·정확한 개인 기여 범위: [NEEDS INPUT], 추측하지 않음.
- 현재 재학/재직 상태: [NEEDS INPUT], 확인된 시작·종료 시점만 표시.
- 문구 제약: 슬로건, 장식 캡션, 중복 소개, 기술 태그, 긴 설명과 불필요한 버튼은 되살리지 않는다.
- 연출 제약: 작은 정적 목록으로 축소하지 않는다. 큰 달 비주얼, 한 번의 데스크톱 고정 장면과 확대·퇴장, 프로젝트 비주얼의 스크롤 진입을 사용한다.
- 모바일은 고정 없이 작은 범위의 스크롤 애니메이션을 유지한다. 모션 감소·JS 실패 시에는 완전한 정적 레이아웃으로 대체한다.

## Constraints
- .old_donotuse와 기존 sunrinlife_build 삭제 상태는 변경하지 않음.
- GitHub Pages 호환 정적 HTML/CSS/JS. 실행 중 API나 CDN 의존 없음.
- 기본 HTML에 모든 콘텐츠 포함. JavaScript 실패 시에도 읽고 이동 가능.
- 키보드, 모바일, reduced motion, 200% 글자 확대 대응.
- 배포나 커밋은 별도 요청 전 수행하지 않음.
