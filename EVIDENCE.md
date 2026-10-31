# EVIDENCE.md

| Claim | Source | Confidence | Allowed wording | Usage |
| --- | --- | --- | --- | --- |
| 이름 양현준, 활동명 stringju, 백엔드·인프라 관심 | content/introducing.md | high | 저장된 소개 내용 | Hero, About |
| CareerNote, 한봄고등학교, SCG, MIDAS IT 경험 | content/experience.md | high | 저장된 기간·조직·역할·상세 | Experience |
| 성균관대학교·선린인터넷고등학교 학력 | content/education.md | high | 저장된 학력 | Education |
| ICT AWARD KOREA 등 수상 3건 | content/awards.md | high | 저장된 날짜·이름·결과 | Awards |
| Kubernetes의 Talos Linux·GitOps 운영 | 기존 content/projects.md 및 content/experience.md | high | 저장된 프로젝트 범위만 사용 | Gallery, detail |
| Exhibition BE의 멀티테넌시 백엔드 | 기존 content/projects.md 및 content/experience.md | high | Java·Spring, 멀티테넌시 지원 | Gallery, detail |
| pi-provider-manager의 Provider 관리 확장 | 기존 content/projects.md | high | TypeScript, OpenAI-Compatible Provider 관리 | Gallery, detail |
| 사계절 그림과 자캐 정체성 | 기존 PRODUCT.md와 background/simple/ | high | 기존 이미지 재사용 | Illustrations |
| 이메일·외부 프로필 | 기존 index.html | high | 기존 주소 그대로 사용 | Contact |
| 사용자 수·성과 수치·숙련도·고객사·추천사 | missing | 0 | MUST NOT USE | 없음 |

현재 프로젝트 원본은 content/projects/*.md다. 상세 본문은 기존에 확인된 설명만 옮겼으며, 구체적인 구현 성과·기여 비율·운영 상태는 추가로 주장하지 않는다.

## 프로젝트 선정 및 자료 확인 · 2026-10-30

사용자 지정 순서: 전시회 백엔드, Kubernetes One Repo, pi-provider-manager, S-TOP, dolpin. Macmagotchi와 Nether는 전시 및 생성 상세 페이지에서 제외.

- 전시회 백엔드: https://github.com/SystemConsultantGroup/exhibition-backend README. 멀티테넌시 API, 도메인 구조, JPA·QueryDSL·MinIO, 대량 업로드 처리. 프로젝트 기능으로 기술하고 전체 기능을 개인 단독 기여로 표현하지 않음.
- Kubernetes One Repo: https://github.com/SystemConsultantGroup/kubernetes README. Talos·Cilium·Argo CD·Nix, 단일 클러스터 desired state, GitOps 운영 범위.
- pi-provider-manager: https://github.com/2tle/pi-provider README. Provider·모델 관리, 모델 한도 재정의, 키 분리 저장, npm 설치 명령.
- S-TOP: https://stringju.notion.site/Cyber-S-TOP-14218740dc6a8003bedee49ce5733476 의 접힌 하위 블록까지 확인. 2024, CRUD·퀴즈·Excel·Optional 인증 구현 및 과도한 공통화에 대한 회고.
- dolpin: https://stringju.notion.site/14218740dc6a8162a6a4ee609819e784 의 접힌 하위 블록까지 확인. 2023~2024, 백엔드·Python 크롤러·CI/CD, AWS 이전, 다중 카테고리, Slack 로그 알림. 현재 서비스 가용성·정량 성과를 별도 검증한 것으로 표현하지 않음.
- 기존 소개·경험·학력·수상 원본은 변경하지 않음. 새 SVG는 로고가 아닌 프로젝트 주제를 나타내는 자체 제작 아이콘.

## 내부 이미지 전시로 수정 · 2026-10-30

- 사용자 정정: 노션 외부 링크가 아니라 노션의 사진과 내용을 사이트 내부에서 읽도록 구성. 화면 테스트 금지 유지.
- S-TOP 원본 로고 1개, 돌핀 원본 소개 이미지·구조도·요청 기록·참고 자료·CI/CD·Slack 기록 11개를 다운로드하여 assets/images/projects/에 저장.
- 원본 블록과 파일 대응은 content/project-image-sources.json에 기록. 서명 URL·인증 정보는 저장하지 않음.
- 돌핀의 본문 사진 10개는 해당 설명 아래 figure/figcaption으로 배치하고, 소개 이미지 1개는 대표 이미지로 사용. S-TOP 로고도 대표 이미지로 사용.
- 브라우저 비교 이미지는 노션에 인용된 외부 영상의 참고 자료로 명시. 돌핀 자체 측정 결과로 표현하지 않음.
- API 요청 이미지는 당시 개별 요청 기록으로 표기. 원본 노션의 과거 수치와 최근 포트폴리오 수치가 달라 고정된 성능 개선 배수를 주장하지 않음.
- S-TOP·돌핀 상세 페이지의 노션 버튼과 본문 노션 외부 링크 제거. GitHub 기반 프로젝트의 코드 링크는 보조 자료로 유지.

## 기간 메타데이터 · 2026-10-30

S-TOP의 노션 개발년도 2024, 돌핀의 개발년도 2023·2024를 developmentPeriod로 이동했습니다. operationPeriod는 별도 지원하되, 현재 확인된 운영 기간이 없어 입력하지 않았습니다. 나머지 프로젝트의 날짜도 저장소 생성일이나 활동 기간으로 추정하지 않았습니다.

## 사용자 원문 기준 편집 · 2026-10-30

S-TOP과 돌핀의 Notion 하위 블록을 다시 읽고 사용자의 문장·항목·회고를 기준으로 복원했습니다. 이전에 덧붙인 해설과 캡션은 줄였습니다. 원문의 과거 운영 상태는 당시 기록으로 표시하고, 서로 다른 응답시간 수치는 개선 배수로 다시 인용하지 않았습니다. Reflection의 속도 비교 문구는 사용 사실만 남겼고, private 저장소의 Actions 사용 불가라는 일반화는 CircleCI 사용 사실로 한정했습니다. 나머지 세 프로젝트는 기존 content/projects.md 소개와 이미 확인한 README 범위 안에서 문구를 다듬었습니다. 기간과 사진 파일은 변경하지 않았습니다.

## 두 프로젝트 확장과 아키텍처 · 2026-10-31

- 전시회 백엔드 main 59afe73b4c618447be3c148aef936b584994f551 기준 실제 구현과 Git 이력을 확인. GitHub API에서 Hyunjun Yang, Stringju, stringju 작성 커밋이 2tle 계정에 연결되는 것을 확인. 사용자도 백엔드 대부분을 직접 개발했다고 명시.
- 구조·기능: ExhibitionTenantInterceptor의 Origin/Host 처리, AdminExhibitionInterceptor의 X-Exhibition-Id, AdminAuthorizationService의 전시 관리자 검사, ItemBulkUploadService의 사전 검증·saveAll·조회 캐시, MediaService의 제한 풀·중복 전송 제거·롤백 정리·Resource 스트림을 확인.
- 기여 근거: 5e0f58f 초기 구성, f688df1 전시·카테고리·작품·이미지 API, 315302d 로그인, f2b3aaf 좋아요, 0f4f36c 엑셀 등록, 701c325 관리자 테넌시, 22d40bb 대량 저장·미디어 전송, b9bb9ab 미디어 스트리밍.
- 아키텍처 이미지를 생성해 채팅에 먼저 제시한 뒤 코드와 최종 대조. 관리자 업로드는 브라우저 → Next.js 매니저 → Spring Boot → MinIO, 전시/파일 정보는 MySQL, 파일 본문은 MinIO로 표현. 공개 사이트와 스토리지의 직접 연결 및 테넌트별 별도 DB는 그리지 않음.
- 이미지: assets/images/projects/exhibition-backend/architecture.png. 제시한 PNG와 SHA-256 일치. 1586×992. 원본 다운로드 파일은 artifacts/exhibition-backend-architecture.png.
- Kubernetes main 4fde031a8d850a49bcbc8842606f04368583f1e6 기준 코드와 2tle에 연결된 main 이력 확인. 직접 작성한 기능의 커밋과 현행 코드를 대조해 본문 구성.
  - Prometheus/Grafana: 1dabca8760fa82fb51a8215f08c8bf9dbc16542c, 634bc0b8adcc66b85cb69a46029fc39053e6ff7a. argocd/platform/monitoring/의 배포·대시보드·Dex 설정.
  - Loki/Alloy: 5a154fdd7f59135949b76c6376508a50b0ac6b60, e20c7c50de96890bef0a4ce20abb28ac890e4a09, 7435362efc3d415160d3429edb4b6844beb1681d. 로그 수집·환경 라벨·RBAC·보관 설정.
  - CIDR: 5e2e14d7f81d7470a60e2f20cd6cb391121cc2b2, 24a9b0d7ddfc488f20fa56d6a6b60a6bf5ddf271. 공통 Helm routing/helper와 Envoy SecurityPolicy, 미러/복수 백엔드 검증.
  - build_args와 전시 관리 서비스: 09a37825041c30479d38dadb63cf8f5b64efe236, 31f08c62e79cc4b309933cadb422350774ed47b2, 727e487284b2998687bac23accfa41bd948e8dbf.
  - 이전 과정의 TLS 패스스루: 59c6cb400da9dfb5908d01df7b2173d29df239e1, d0223e0219cd75919013976a5b43cb6727fde2b0. 과거 전환 작업으로 서술.
  - Talos DNS와 E2S 리스너: 13b9f95482c5c0cba4f517413d7a198ed71d982c, a6c0678fb868d76f16c9a9f5d8013ae16ed3108a.
- 본문은 확인된 기능과 작업을 긍정형으로 서술하고, 새 성과 수치·운영 실적·책임을 제한하는 후행 문구는 추가하지 않음.

- 최종 독립 대조: Alloy RBAC는 수집 권한으로 표기. CIDR 허용 목록은 applications/exhibition/meta.yaml, 이미지 digest·revision은 instances/production.yaml에 기록됨을 구분. 중복 이름 검사는 CIDR 적용 운영 HTTPRoute 규칙 범위로 기재. E2S 작업은 리스너 대상 노드 라벨 추가로 표현.

## Kubernetes 플랫폼 작업 중심 재구성 · 2026-10-31

- 사용자가 지적한 앱별 배포, build_args, 이전용 프록시, 개별 노드 DNS/라벨 조정은 프로젝트 본문에서 제거. 초기 플랫폼 구조와 여러 서비스가 함께 사용하는 운영 기능을 중심으로 재작성.
- 15b0dedd533f11b2ceb320f36dd40f3e4fb41b37: clusters/scg/applicationsets/platform.yaml의 platform/*/meta.yaml 파일 generator, Helm/Kustomize 분기, values·추가 manifest 조합, 자동 동기화·prune·selfHeal. clusters/scg/kustomization.yaml에서 project와 applicationsets 조합.
- 같은 초기 커밋: platform/gateway/gateway.yaml의 공통 HTTPS Gateway와 namespace 라벨 연결 규칙, platform/cert-manager의 Helm metadata 및 발급자/인증서 리소스. 초기 설계로 시점을 명시해 서술.
- 1dabca8760fa82fb51a8215f08c8bf9dbc16542c: 모니터링 chart·노드 dashboard·Talos 수집 설정·Dex 역할 연결·초기화 및 repository.sh 검증 통합.
- 5a154fdd7f59135949b76c6376508a50b0ac6b60 및 e20c7c50de96890bef0a4ce20abb28ac890e4a09: Loki/Alloy 독립 lifecycle, namespace 공통 라벨 기반 모든 애플리케이션 환경 로그 발견, Grafana 조회·수집 권한·보관 정책과 검사.
- 5e2e14d7f81d7470a60e2f20cd6cb391121cc2b2: allowCIDRs 스키마·공통 Helm helper/routing·production 규칙별 SecurityPolicy·복수 backend/mirror 일치·중복 이름 검사 및 repository.sh 렌더 검증.
