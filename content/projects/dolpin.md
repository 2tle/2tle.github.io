---
name: 돌핀 (dolpin)
summary: 개발자를 위한 아티클 큐레이션 서비스입니다. 백엔드와 크롤러 개발을 담당했습니다.
category: 백엔드
tools: TypeScript, Express, MongoDB, Python, Docker
developmentPeriod: 2023 ~ 2024
link: https://stringju.notion.site/14218740dc6a8162a6a4ee609819e784
hideLink: true
image: assets/images/projects/dolpin/cover.webp
imageLayout: wide
order: 50
---

## 프로젝트 소개

돌핀은 IT 개발자들을 위한 아티클 큐레이션 서비스입니다. 다양한 분야의 전문적인 글과 최신 IT 소식을 한 번에 확인할 수 있도록 만들었습니다. 당시 안드로이드 앱과 웹으로 베타 서비스를 운영했고, 저는 백엔드와 크롤러 개발을 담당했습니다.

## 서비스 구조

<figure>
  <img src="../assets/images/projects/dolpin/architecture.png" alt="돌핀의 웹, 모바일 클라이언트, 백엔드, DB, 크롤러와 배포 환경을 나타낸 구조도" width="1227" height="765" loading="lazy" decoding="async">
  <figcaption>돌핀 서비스 구조</figcaption>
</figure>

## 주요 작업

유저가 아티클을 조회하거나 공유하거나 북마크하면 가중치를 높이고, 오래된 아티클일수록 가중치를 낮추는 시스템을 개발했습니다. 유저에게는 가중치가 높은 아티클부터 보여주도록 했습니다. 서비스를 운영하면서 API 응답속도와 크롤러의 문제를 고치고, 배포도 자동화했습니다.

### 서버 응답이 느리고 타임아웃이 자주 발생한다

아티클이 많아지면서 목록을 한 번 조회하는 데 약 0.8 ~ 2초가 걸렸고, 로그인 과정에서도 타임아웃이 자주 발생했습니다.

처음에는 Mongoose의 `populate`를 의심해 `aggregate`로 바꿔봤습니다. 하지만 차이는 0.00x초 정도로 응답속도는 거의 나아지지 않았고, 타임아웃도 그대로였습니다.

다음으로 서버의 위치와 슬립 동작을 살펴봤습니다. Heroku는 유럽 리전, MongoDB는 한국 리전에 있어 요청할 때마다 데이터가 두 리전을 오갔습니다. Heroku는 약 30분 동안 요청이 없으면 슬립 상태로 전환돼, 백엔드가 다시 실행되기까지 시간도 걸렸습니다.

슬립 동작이 타임아웃의 원인일 것으로 추정해 백엔드를 AWS로 이전했습니다. 이전 후 테스트에서 API 응답속도가 개선됐고, 타임아웃 문제도 해결됐습니다.

<figure>
  <img src="../assets/images/projects/dolpin/response-before.png" alt="백엔드 이전 전 아티클 목록 API의 요청과 응답시간 기록" width="448" height="100" loading="lazy" decoding="async">
  <figcaption>AWS 이전 전 API 응답 기록</figcaption>
</figure>

<figure>
  <img src="../assets/images/projects/dolpin/response-after.png" alt="백엔드 이전 후 아티클 목록 API의 요청과 응답시간 기록" width="433" height="100" loading="lazy" decoding="async">
  <figcaption>AWS 이전 후 API 응답 기록</figcaption>
</figure>

### 하나의 기사를 여러 카테고리에 함께 보여주고 싶다

기존에는 `category`가 `number` 타입이라 한 아티클에 카테고리를 하나만 지정할 수 있었습니다. 여러 카테고리에 해당하는 글도 있어, 필드를 `categories`로 바꾸고 타입도 `array<number>`로 변경했습니다.

기존 문서와 새 문서가 섞여 있어 조회할 때는 `aggregate`를 사용했습니다. `category`만 있는 문서는 `[category]`를 담은 `categories` 필드를 만들고 기존 필드는 결과값에서 삭제했습니다. 이미 `categories`가 있으면 그대로 유지했습니다.

크롤러에는 제목의 키워드로 카테고리를 판별하는 함수를 추가해, 한 아티클을 관련된 여러 카테고리에서 보여주도록 했습니다.

### 크롤러와 배포 과정에서 불편했던 점을 고쳤다

크롤러는 수집 시간이 오래 걸리고 램 사용량도 높았습니다. import할 때 테스트용 함수까지 실행되는 코드를 찾아 정리했고, 각 크롤러에서 따로 만들던 웹드라이버는 메인 함수에서 한 번만 만들어 인자로 전달하도록 바꿨습니다.

개인 AWS 계정에 따로 배포하던 프론트엔드와 백엔드는 팀 공용 계정으로 옮기고, Docker와 GitHub Actions로 배포를 자동화했습니다. 크롤러는 클라우드 비용 부담 때문에 저전력 컴퓨터에서 실행했습니다. 학교 보안정책상 외부 접속이 막혀 있어 CircleCI로 빌드한 이미지를 Docker Hub에 올리고, `Crontab`으로 매일 2시에 pull해 크롤러를 돌렸습니다.

수집이 2주 넘게 멈췄는데도 알아채지 못한 적이 있어 슬랙 알림도 추가했습니다. `DeployBot`이 `#deploy` 채널로 크롤러의 시작과 종료, 에러 로그를 보내도록 했고, 팀원들은 슬랙에서 오류를 확인하고 해당 크롤러를 수정할 수 있게 됐습니다.
