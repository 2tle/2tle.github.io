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

- IT 개발자들을 위한 아티클 큐레이션 서비스
- 유저에게 맞춤형 IT 소식을 제공하는 서비스
- 안드로이드, iOS, 웹, 백엔드 등 여러 분야의 아티클과 최신 IT 소식 제공
- 당시 안드로이드 앱과 웹으로 베타 서비스 운영

### 기획 의도

- 초보 개발자는 개발 관련 정보를 찾기 어려움
- 다양한 분야의 전문적인 글을 한 번에 확인하고 싶음
- 최신 IT 기술에 대한 정보를 빠르게 찾아보고 싶음

### 구조 및 기술 스택

<figure>
  <img src="../assets/images/projects/dolpin/architecture.png" alt="돌핀의 웹, 모바일 클라이언트, 백엔드, DB, 크롤러와 배포 환경을 나타낸 구조도" width="1227" height="765" loading="lazy" decoding="async">
  <figcaption>돌핀 서비스 구조</figcaption>
</figure>

- 프론트엔드 → Next.js
- 모바일 앱 → Android Studio, Kotlin
- __백엔드 → TypeScript, Express__
- __데이터베이스 → MongoDB, Google Sheets(퀴즈)__
- 인증 서버 → Firebase Auth
- __배포 → GitHub Actions, CircleCI, Docker, AWS EC2__
- __크롤링 시스템 → Python__

## 주요 작업 내역

- 백엔드 개발 내역
  - 가중치 시스템 개발
    - 아티클을 조회하면 해당 글의 가중치 증가
    - 아티클을 공유하면 해당 글의 가중치 증가
    - 아티클을 북마크하면 해당 글의 가중치 증가
    - 오래된 아티클일수록 가중치 감소
    - 가중치가 높은 아티클부터 유저에게 제공
- 배포 관련 작업 내역
  - GitHub Actions를 이용한 프론트엔드 및 백엔드 CI/CD 적용
  - CircleCI를 이용한 아티클 크롤러 CI/CD 적용
- 아티클 크롤러 관련 작업 내역
  - DB 및 웹드라이버 공통 모듈 제작

## 서비스 개선 과정

### 서버 응답이 느리고 타임아웃이 자주 발생한다

__문제 상황__

- 수집된 아티클이 많아지면서 조회 API의 응답이 느려짐
- 아티클 목록을 한 번 조회하는 데 약 0.8 ~ 2초가 걸림
- 북마크가 많을수록 북마크한 아티클을 조회하는 데 걸리는 시간도 늘어남
- 로그인 과정에서도 타임아웃이 자주 발생

__가설__

1. Mongoose의 populate가 여러 쿼리를 실행하면서 조회가 느려지는 것일 수 있음
2. 유럽의 Heroku 서버와 서울의 MongoDB 사이의 거리 때문에 응답이 느려지는 것일 수 있음

__1. Mongoose 문제일 것이다.__

- 북마크 컬렉션에 저장된 id를 바탕으로 `populate`를 이용해 아티클을 가져오고 있었음
- `populate`는 RDB의 Join과는 달리 자바스크립트 단에서 합쳐주는 기능
- 데이터가 많아지거나 `populate`가 중첩되면 조회가 느려질 수 있다고 생각함
- 그래서 `populate` 대신 `aggregate`를 사용해보기로 함
- 하지만 차이는 0.00x초 정도로, 응답속도는 거의 나아지지 않음
- 타임아웃이 자주 발생하는 문제도 그대로였음

__2. Heroku 서버의 문제일 것이다__

- Heroku는 유럽 리전, MongoDB는 한국 리전에 위치함.
- API 요청을 보내면 한국 → 유럽 → 한국 → 유럽 → 한국으로 데이터가 전송됨
- Heroku는 약 30분 동안 요청이 없으면 슬립 상태로 전환됨
- 슬립 상태의 백엔드는 다시 실행되기까지 시간이 걸림
- 서버의 슬립 동작이 타임아웃의 원인일 것으로 추정함
- 이 문제를 해결하기 위해 백엔드를 AWS로 이전하기로 결정
- AWS 이전 후 테스트에서 API 응답속도가 개선됨
- 타임아웃 문제도 해결됨

<figure>
  <img src="../assets/images/projects/dolpin/response-before.png" alt="백엔드 이전 전 아티클 목록 API의 요청과 응답시간 기록" width="448" height="100" loading="lazy" decoding="async">
  <figcaption>AWS 이전 전 API 응답 기록</figcaption>
</figure>

<figure>
  <img src="../assets/images/projects/dolpin/response-after.png" alt="백엔드 이전 후 아티클 목록 API의 요청과 응답시간 기록" width="433" height="100" loading="lazy" decoding="async">
  <figcaption>AWS 이전 후 API 응답 기록</figcaption>
</figure>

### 아티클을 크롤링하는 속도가 매우 느리다

__현재 상황__

- 크롤러는 뉴스 사이트와 기술 블로그에서 아티클을 수집함
- 한 번 수집을 마치는 데 시간이 오래 걸림
- 실행 중 램 사용량도 높았음

__찾은 문제점과 해결 과정__

1. 코드가 2번 실행되고 있다.

   ```Python
   def solution():
   	...
   #some crawler..
   print(solution())

   if __name__ == "__main__":
   	outputs = solution()
   	print(outputs)
   ```

   - 각 사이트를 크롤링하는 개별 크롤러는 `solution()` 함수로 정의됨
   - 개발 중에는 파일 아래에서 함수를 호출해 결과를 확인했음
   - 협업 중 `__name__ == "__main__"` 조건 없이 함수를 호출하는 크롤러를 발견함
   - 이 때문에 일부 크롤러는 import할 때도 함수가 실행돼 불필요한 수집이 발생함
   - 테스트용 함수 호출 코드를 삭제해 해결함
   - 같은 문제가 반복되지 않도록 팀원들에게도 원인을 공유함

2. 각 크롤러가 무거운 크롬 웹드라이버를 따로 생성하고 있다.
   - 각 크롤러 함수에서 크롬 웹드라이버를 새로 만들어 사용하고 있었음
   - 여러 개의 크롬 웹드라이버가 생성되어 메모리 사용량이 급격히 증가함
   - 메인 함수에서 웹드라이버를 한 번 만들고 각 크롤러에 인자로 전달하도록 변경함

   <figure>
     <img src="../assets/images/projects/dolpin/browser-reference.png" alt="당시 참고한 브라우저별 실행시간 비교 자료" width="1907" height="1071" loading="lazy" decoding="async">
     <figcaption>브라우저 선택 시 참고한 외부 비교 자료</figcaption>
   </figure>

   - 참고한 [웹 브라우저 비교 영상](https://www.youtube.com/watch?v=YQcslo9OqtE)에서는 파이어폭스의 실행속도가 가장 빨랐음
   - 파이어폭스의 램 사용량은 높지만 빠르게 작업을 끝내는 게 더 중요하다고 생각함
   - 따라서 메인 함수에서 생성되는 드라이버를 파이어폭스 웹드라이버로 교체함

### 하나의 기사를 여러 카테고리에 함께 보여주고 싶다.

__문제 상황__

```JavaScript
// old schema of article
"_id": ObjectId,
"link": string,
"category": number,
"date": string,
"snippet": string,
"thumbnail": string,
"title": string,
"weight": number,
...
```
- 기존 아티클 스키마에는 카테고리의 타입이 `number`로 되어 있음.
- 따라서 하나의 아티클에는 카테고리를 하나만 지정할 수 있었음.
- 수집된 글을 보니 여러 카테고리에 해당하는 아티클이 있었음

__해결 과정__

- NoSQL은 고정된 스키마가 없어 자유롭게 문서의 형태를 수정할 수 있음.
- 이 장점을 살려 위 스키마에서 `category` 필드를 `categories` 필드로 변경함
- 필드의 타입도 `array<number>` 로 변경함
- 백엔드도 여러 개의 카테고리에 대응될 수 있도록 수정함.
- 단일 카테고리와 다중 카테고리를 가진 문서가 섞여 있어 `aggregate`를 사용함
- `category` 필드가 있으면 `categories` 필드를 만들고 `[category]` 값을 넣음
- 이후 `project`를 통해 `category` 필드를 결과값에서 삭제함
- 이미 `categories` 필드를 갖고 있으면 그대로 유지함
- 크롤러에도 수집한 아티클의 카테고리를 판별하는 함수를 추가함
- 카테고리별로 키워드를 정해두고, 제목에 해당 키워드가 있으면 그 카테고리에 글을 포함하도록 함
- 한 아티클을 관련된 여러 카테고리에서 보여줄 수 있게 됨

### 수동 배포가 번거롭고, 배포 환경도 나뉘어 있다.

__문제 상황__

- 프론트엔드는 프론트엔드 개발자 개인 AWS 계정을 통해 배포되고 있음
- 백엔드도 백엔드 개발자 개인 AWS 계정을 통해 배포되고 있음
- 두 서비스 모두 Git과 SSH로 코드를 직접 올리고 실행해야 했음
- 크롤러는 하루에 한 번 새 기사와 기술 블로그 글을 수집해야 함
- 하지만 메모리 사용량이 커서 클라우드에서 실행하기에는 비용 부담이 있었음
- 직접 실행하다 보니 수집을 잊는 경우도 있었음

__해결 과정__

- 팀 내 AWS 공용 계정을 만든다.
- Docker와 GitHub Actions로 배포를 자동화하고, EC2에서 컨테이너로 실행한다.
  - 프론트엔드와 백엔드는 Public Repository라 GitHub Actions를 이용할 수 있음
  1. GitHub Actions를 통해 소스코드를 빌드
  2. Docker 이미지를 빌드
  3. 빌드된 이미지를 Docker Hub로 push
  4. GitHub Actions에서 EC2 컨테이너로 접속
  5. Docker Hub에 있는 이미지를 pull 해 서비스를 실행
- 저전력 컴퓨터를 구입한 후 아티클 크롤러 시스템을 작동시킨다.
  - 32GB의 램을 장착하고 Rocky Linux를 설치해 세팅
  - 학교 보안정책상 외부에서 접속할 수 없음
  - Docker Hub까지만 올리고, 이후 컴퓨터에서 pull 하기로 결정
  - 아티클 크롤러 빌드에는 CircleCI를 이용함
  - 컴퓨터에는 `Crontab`을 통해 매일 2시에 pull 하여 크롤러를 돌림

__해결 후__

<figure>
  <img src="../assets/images/projects/dolpin/github-actions.png" alt="프론트엔드와 백엔드 저장소의 GitHub Actions 실행 내역" width="928" height="767" loading="lazy" decoding="async">
  <figcaption>GitHub Actions 실행 내역</figcaption>
</figure>

<figure>
  <img src="../assets/images/projects/dolpin/circleci.png" alt="아티클 크롤러의 CircleCI 파이프라인 실행 내역" width="961" height="773" loading="lazy" decoding="async">
  <figcaption>크롤러의 CircleCI 실행 내역</figcaption>
</figure>

- 개발자는 작업한 내용을 Repository의 `main` 브랜치에 push
- `develop` ← `main` Pull Request 열고 merge
- 이후 GitHub Actions와 CircleCI에서 코드 빌드, Docker 이미지 생성, 배포를 진행
- 코드를 수정할 때마다 수동으로 배포할 필요가 없어짐

### 아티클 크롤링 현황을 알 수 없다.

__문제 상황__

- 처음에는 크롤러가 시작됐는지, 성공했는지 실패했는지 알 수 없었음
- 수집 대상 사이트에 문제가 생겨도 원인을 확인하기 어려웠음
- 로그를 확인하지 못해 아티클 수집이 2주 넘게 멈췄는데도 팀에서 알아채지 못한 적이 있었음
- 크롤러 서버는 외부 접속이 막혀 있어 SSH로 로그를 확인할 수도 없었음

__해결 과정__

<figure>
  <img src="../assets/images/projects/dolpin/slack-channel.png" alt="크롤러 배포 로그를 모으기 위해 만든 Slack 채널" width="308" height="228" loading="lazy" decoding="async">
  <figcaption>로그를 모아보는 #deploy 채널</figcaption>
</figure>

<figure>
  <img src="../assets/images/projects/dolpin/slack-bot.png" alt="Slack 채널에서 사용하는 DeployBot 프로필" width="236" height="206" loading="lazy" decoding="async">
  <figcaption>알림을 보내는 DeployBot</figcaption>
</figure>

- 팀 메신저인 슬랙에 슬랙봇을 만들고, 로그를 보낼 채널을 생성함
- 크롤러 시스템이 시작/종료 시 `DeployBot`을 통해 `#deploy` 채널에 로그를 보내게 함
- 실행 중 오류가 나면 에러 로그도 같은 채널로 보내도록 함

<figure>
  <img src="../assets/images/projects/dolpin/slack-start.png" alt="DeployBot이 전송한 크롤러 시작 알림" width="647" height="204" loading="lazy" decoding="async">
  <figcaption>크롤러 시작 알림</figcaption>
</figure>

<figure>
  <img src="../assets/images/projects/dolpin/slack-error.png" alt="DeployBot이 전송한 크롤러 오류 알림과 오류 로그" width="746" height="594" loading="lazy" decoding="async">
  <figcaption>크롤러 오류 알림</figcaption>
</figure>

- 이후 매일 수집이 시작될 때 슬랙에서 알림을 받을 수 있게 됨
- 팀원들은 슬랙에서 오류를 확인하고 해당 크롤러를 수정할 수 있게 됨
