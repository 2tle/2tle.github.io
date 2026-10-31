---
name: S-TOP
summary: 성균관대학교 Cyber S-TOP 사이트의 백엔드 개발을 담당했습니다.
category: 백엔드
tools: Java, Spring Boot, MySQL
developmentPeriod: 2024
link: https://stringju.notion.site/Cyber-S-TOP-14218740dc6a8003bedee49ce5733476
hideLink: true
image: assets/images/projects/s-top/identity.png
imageLayout: wide
order: 40
---

## 프로젝트 소개

__S-TOP이란?__

- 성균관대학교 소프트웨어융합대학에서 주최하는 온라인 행사
- 소프트웨어융합대학 학생들이 만든 우수 작품 전시
- 기업 대표 등의 강의 시청
- 기업의 채용 정보를 제공
- 기업의 산학협력 프로젝트 문의와 과제 제안 접수
- 투표 및 퀴즈 이벤트 운영

__사용 기술 스택__

- 프론트엔드 → TypeScript / Next.js
- 백엔드 → Java / Spring Boot
- 데이터베이스 → MySQL / Notion

## 작업 내역

- 스타트업 대담 영상 및 잡페어 인터뷰 CRUD 구현
- 대담 영상의 퀴즈 CRUD 및 채점 기능 구현
- 관리자용 대담 영상의 퀴즈 제출 결과 Excel 다운로드 기능 구현

### 관리자용 대담 영상의 퀴즈 제출 결과 Excel 다운로드 기능 구현

__문제 상황__

- 관리자는 대담 영상의 퀴즈 제출 결과를 엑셀로 받아야 한다.
- 엑셀에는 학생 정보와 퀴즈 응시 내역이 포함되어야 한다.

__구현 방법__

1. 퀴즈 결과만 변환할 수 있는 엑셀 변환 코드를 작성한다.
   - 오직 퀴즈 데이터만 엑셀로 변환할 수 있음.
   - Java Reflection을 사용하지 않아 변환이 빠름
2. __여러 데이터 구조에 대응할 수 있는 공통 엑셀 변환 유틸리티를 만든다.__
   - 추후 다른 엑셀 변환 기능이 생길 수 있음
   - 공통 모듈로 만들어 코드 재사용성 증가
   - Java Reflection 사용

다른 기능에서도 엑셀 변환이 필요할 수 있어 2안을 선택함.

__개발 과정__

1. `@ExcelColumn`과 `@ExcelDownload` 어노테이션 추가
   - `ExcelColumn`
     - 엑셀의 각 열을 정의
     - 데이터 클래스의 필드에 붙임
     - 각 열의 이름을 지정할 수 있음
   - `ExcelDownload`
     - 엑셀로 변환할 수 있는 클래스임을 표시
     - 생성할 시트의 이름을 지정할 수 있음
     - 생성할 엑셀 파일명을 지정할 수 있음
2. `ExcelUtil` 유틸리티 클래스 제작
   - 클래스와 필드의 어노테이션에서 파일명, 시트명, 헤더명을 읽어옴
   - 헤더 목록을 만들고 `SXSSFWorkbook`에 작성
   - 데이터 목록을 순회하며 행을 만들고 값을 채움
   - 엑셀 유틸리티를 Bean으로 등록해 다른 Bean에서 주입받아 사용

__총평__

- `SXSSFWorkbook`으로 엑셀을 생성해 메모리를 효율적으로 사용
- 이후 다른 파트의 엑셀 변환 기능이 없어짐
- 결과적으로 오버 엔지니어링이 되었음

## 개선 과정

### 로그인을 해도 되고, 안 해도 되는 API가 있다.

__문제 상황__

- 기존 인증/인가 방식에서는 로그인 필수 API와 비로그인 API만 구분할 수 있었음
- 비로그인 상태에서도 GET 요청이 가능해야 한다.
- 로그인 상태에서는 사용자에 맞게 데이터를 가공해서 제공해야 한다.

__해결 과정__

- 기존 유저 권한 검사 로직에 Optional을 추가함
- 권한이 Optional인 API에 토큰 없이 요청하면 사용자 정보 대신 null을 전달
- 토큰이 있다면 Optional이어도 기존 토큰 검증과 권한 검사를 수행

### 프론트엔드에서 Optional 인가 방식이 작동하지 않는다.

__문제 상황__

- 앞서 만든 Optional 인가 방식이 제대로 동작하지 않음
- 프론트엔드에서 Optional 인가 방식을 쓰는 API 요청 시 리프레시 토큰 오류가 발생함

__원인__

- 프론트엔드에서 비로그인 상태로 API를 호출하면 `Authorization: Bearer null`이 전달됨
- 백엔드는 비로그인 요청에 Authorization 헤더가 없을 것으로 가정하고 개발함
- JWT 검사에서 인증 방식이 Optional이고 Authorization 헤더가 없는 경우에만 검증을 건너뛰고 있었음

__해결 과정__

- JWT 인증/인가 코드에서 토큰 여부를 확인하는 메서드를 수정
- Authorization 헤더가 없거나 값이 `Bearer null`이면 토큰이 없는 것으로 판단해 false를 반환
