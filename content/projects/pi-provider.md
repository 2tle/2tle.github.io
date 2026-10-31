---
name: pi-provider-manager
summary: Pi Agent에서 OpenAI-Compatible Provider를 쉽게 관리할 수 있는 Pi Extension
category: 개발 도구
tools: TypeScript, Pi Agent
developmentPeriod: 2026.08
link: https://github.com/2tle/pi-provider
image: assets/images/api-mark.svg
order: 30
---
## 프로젝트 소개

Pi Agent에서 OpenAI-Compatible Provider를 쉽게 관리할 수 있는 Pi Extension입니다.

## 개발 동기

기존에 Pi Agent에서 로컬 LLM이나 사설 게이트웨이를 이용하려면 직접 models.json을 수정해야 하는 불편함이 있었습니다.
또한 해당 게이트웨이에서 사용 가능한 모델 카탈로그가 업데이트되어도 에이전트에 바로 반영되지 않는 불편함이 있었습니다.


## 주요 기능

- Provider 추가, 조회, 수정, 삭제
- Provider별 모델 목록 새로고침
- 모델별 컨텍스트 크기와 최대 출력 토큰 수 설정
- Provider 설정과 API 키를 별도 파일에 저장

## 장점

기존처럼 직접 json 파일을 수정하지 않고 에이전트 TUI 내부에서 쉽게 Provider를 관리할 수 있게 되었습니다.
모델 카탈로그 업데이트나 API 키 업데이트의 경우에도 에이전트 TUI 에서 바로 업데이트 할 수 있습니다.

## 설치

```sh
pi install npm:@2tle/pi-provider-manager
```

## 관련 링크

- [GitHub 저장소](https://github.com/2tle/pi-provider)
- [npm 패키지](https://www.npmjs.com/package/@2tle/pi-provider-manager)
