---
name: Kubernetes One Repo
summary: GitOps 플랫폼의 초기 구조를 구성하고, 공통 모니터링과 로그 수집, 접근 제어를 확장했습니다.
category: 인프라
tools: Kubernetes, Argo CD, Prometheus, Grafana, Loki, Alloy
developmentPeriod: 2026.06 ~
link: https://github.com/SystemConsultantGroup/kubernetes
image: assets/images/kubernetes.svg
order: 20
---
## 프로젝트 소개

성균관대학교 시스템컨설턴트그룹의 온프레미스 쿠버네티스 클러스터를 관리하는 저장소입니다. Talos Linux와 Argo CD를 사용해 플랫폼 구성과 애플리케이션 배포 상태를 Git으로 관리합니다.

## 아키텍처

<figure>
  <img src="../assets/images/k8sonerepo.png" alt="Kubernetes One Repo 아키텍처 구조도" width="4370" height="3110" loading="lazy" decoding="async">
  <figcaption>Kubernetes One Repo 아키텍처</figcaption>
</figure>

## 작업 방향

플랫폼 구성 요소의 설치와 변경을 Git에서 관리하는 초기 구조를 만들었습니다. 이후 클러스터의 메트릭과 애플리케이션 로그를 모으고, 서비스들이 함께 사용할 수 있는 접근 제어와 설정 검증을 추가했습니다.

## 주요 작업

- 메타데이터 기반 ApplicationSet으로 플랫폼 구성 요소를 관리하는 GitOps 구조 설계
- 공통 게이트웨이와 인증서 발급 리소스 구성
- Prometheus와 Grafana를 이용한 클러스터 모니터링 구축
- Loki와 Alloy를 이용한 중앙 로그 수집과 조회 환경 구성
- 공통 Helm 차트의 CIDR 접근 제어와 배포 전 검증 추가

## 구현 과정

### 플랫폼 구성 요소를 메타데이터로 관리

초기 저장소에서는 플랫폼 구성 요소마다 `meta.yaml`을 두고, ApplicationSet이 `platform/*/meta.yaml`을 읽어 Argo CD Application을 생성하도록 만들었습니다.

Kustomize로 관리하는 구성과 Helm 차트를 같은 방식으로 등록할 수 있게 했습니다. Helm 차트는 저장소에 있는 values 파일과 추가 매니페스트를 함께 사용할 수 있도록 구성했습니다.

클러스터 루트에 AppProject와 ApplicationSet을 모아두고, 생성되는 Application에 자동 동기화, pruning, self-healing을 적용했습니다. Git의 설정과 클러스터 상태를 맞추도록 한 구성입니다.

### 공통 게이트웨이와 인증서 관리

초기 플랫폼의 외부 진입점은 Cilium Gateway로 구성하고, HTTPS 리스너와 인증서를 함께 관리했습니다. cert-manager의 발급자와 인증서 리소스도 GitOps 관리 대상에 포함했습니다.

서비스의 Route가 공통 Gateway에 연결될 수 있는지는 네임스페이스 라벨로 구분했습니다. 이를 통해 외부에 노출할 서비스가 따라야 할 공통 연결 방식을 정했습니다.

### 클러스터 모니터링과 조직 권한 연동

kube-prometheus-stack을 Argo CD 관리 대상에 추가하고, 노드와 워크로드의 메트릭을 수집하도록 구성했습니다. Talos 환경에서 수집할 수 있는 지표에 맞춰 수집 대상과 경보를 조정하고, CPU, 메모리, 네트워크, 디스크 상태를 한곳에서 볼 수 있는 대시보드를 만들었습니다.

Grafana는 Dex와 연결해 조직 계정으로 로그인하도록 했습니다. 플랫폼 운영자는 관리자 권한을, 개발자는 조회 권한을 갖도록 역할을 연결하고, 대시보드 정의도 Git에서 관리하도록 했습니다.

### 공통 라벨을 기준으로 애플리케이션 로그 수집

각 노드의 Alloy가 파드 로그를 수집해 Loki로 보내고, Grafana에서 조회하는 구조를 만들었습니다. 메트릭과 로그를 같은 화면에서 확인하되, Loki와 Alloy는 모니터링과 별도의 Argo CD Application으로 구성해 따로 관리하도록 했습니다.

로그 수집 대상은 네임스페이스의 공통 라벨로 찾습니다. 애플리케이션 이름과 운영, 테스트, 프리뷰 등의 실행 환경을 기준으로 수집하고, 워크로드와 파드, 컨테이너별로 검색할 수 있도록 라벨을 정리했습니다.

로그 보관 기간과 저장 공간, 수집기의 RBAC와 Loki 접근 정책도 함께 설정했습니다. 새 애플리케이션이 공통 라벨을 사용하면 같은 수집 체계에 들어올 수 있도록 했습니다.

### 접근 정책과 배포 전 검증을 공통화

운영 HTTP 진입 경로의 IP 접근 정책을 공통 차트에서 선언할 수 있도록 `allowCIDRs`를 추가했습니다. 차트가 HTTPRoute 규칙에 맞는 Envoy SecurityPolicy를 생성해 허용한 IP 대역의 요청을 받도록 구현했습니다.

한 경로에 여러 백엔드나 미러 대상이 연결되면 허용 목록이 서로 일치하는지 검사합니다. 정책을 적용할 규칙 이름이 중복되는 경우에도 템플릿 렌더링을 중단하도록 했습니다.

모니터링과 로그 수집 구성을 추가할 때도 저장소 검사를 함께 작성했습니다. Helm 차트를 렌더링한 결과에서 수집 대상, 보관 설정, 권한 매핑, 내부 서비스의 외부 노출 여부 등을 확인해 잘못된 설정을 배포 전에 잡도록 했습니다.

## 장점

플랫폼 구성 요소를 메타데이터와 Git으로 관리하고, 클러스터 메트릭과 애플리케이션 로그를 공통 관측 환경에서 확인할 수 있습니다. 접근 정책도 공통 차트에서 선언하고 검증할 수 있어, 여러 서비스에 같은 운영 기준을 적용할 수 있게 했습니다.

## 관련 링크

- [GitHub 저장소](https://github.com/SystemConsultantGroup/kubernetes)
- [초기 GitOps 플랫폼 구성](https://github.com/SystemConsultantGroup/kubernetes/commit/15b0dedd533f11b2ceb320f36dd40f3e4fb41b37)
- [모니터링 플랫폼 구성](https://github.com/SystemConsultantGroup/kubernetes/commit/1dabca8760fa82fb51a8215f08c8bf9dbc16542c)
- [중앙 로그 수집 구성](https://github.com/SystemConsultantGroup/kubernetes/commit/5a154fdd7f59135949b76c6376508a50b0ac6b60)
- [공통 차트의 CIDR 접근 제어](https://github.com/SystemConsultantGroup/kubernetes/commit/5e2e14d7f81d7470a60e2f20cd6cb391121cc2b2)
