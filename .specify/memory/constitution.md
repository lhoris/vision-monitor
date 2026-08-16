# Vision Monitor 헌법

> 이 문서는 Spec Kit 산출물의 기준 문서다. 모든 산출물은 한국어로 작성하되, 기술 용어, API 이름, 파일 경로, 코드 식별자는 원문 또는 영문 표기를 유지할 수 있다.

## 핵심 원칙

### I. 사용자 가치 우선
모든 기능은 사용자가 독립적으로 확인할 수 있는 화면, 흐름, 상태 변화 또는 운영 가치에서 출발한다. 사용자에게 보이지 않는 내부 작업만으로 기능 완료를 선언하지 않는다.

### II. 한국어 우선 산출물
모든 프롬프트 응답은 한국어로 작성한다. 모든 Spec Kit 산출물, 기능 명세, 계획, 작업 목록, 체크리스트, 검증 보고서는 한국어로 작성한다. 단, 기술 용어, API 이름, 파일 경로, 코드 식별자, 명령어, 로그 원문은 정확성을 위해 영문 또는 원문 표기를 유지할 수 있다.

### III. 기존 구조 존중
새 기능은 기존 frontend/backend 구조, 컴포넌트 경계, 서비스 패턴, 테스트 방식을 우선 따른다. 대규모 재구성이나 새 추상화는 명확한 중복 제거, 복잡도 감소, 또는 기존 패턴과의 정합성이 있을 때만 도입한다.

### IV. Mock-First MVP
MVP 단계에서는 Spring Boot 실제 API, DB migration, RTSP ingest, AI inference, media distribution, server-side overlay 직접 구현을 기본 범위로 삼지 않는다. 필요한 backend/API 동작은 frontend mock service, fixture, DTO contract로 먼저 표현한다.

### V. 계약 우선
frontend/backend/external system 경계는 명시적 계약으로 기록한다. `streamUrl`과 `playbackUrl`, focus view metadata, event acknowledge 같은 계약은 mock 구현에서도 실제 연동 가능성을 해치지 않도록 유지한다.

### VI. 테스트 가능한 증분
각 사용자 스토리는 독립 구현 및 독립 검증 가능해야 한다. 테스트 범위는 변경 위험과 사용자 영향도에 맞춘다. UI 변경은 가능한 경우 unit/component test 또는 build 검증을 포함한다.

## 제품 경계

- 영상 확대 보기, 카메라 그리드, 알람/경고 토스트, 녹화/실시간 UI는 frontend 중심으로 구현한다.
- 외부 VMS, Media Server, RTSP ingest, AI inference, server-side overlay는 명시적으로 요청되기 전까지 직접 구현하지 않는다.
- backend API는 MVP에서 mock contract 기준으로 다루며, 실제 Spring Boot 구현은 후속 범위로 분리한다.
- 기존 기능과 작업 중인 사용자 변경분은 되돌리지 않는다.

## 개발 워크플로우

- 기본 Spec Kit 흐름은 `specify -> plan -> tasks -> implement`다.
- `clarify`는 요구사항이 애매할 때만 선택적으로 실행한다.
- `plan`과 `tasks`는 승인 게이트 없이 기계적으로 진행하되, 산출물에 모순이나 미정 항목이 있으면 구현 전에 정리한다.
- 구현 후에는 관련 테스트, 빌드, 또는 최소한의 정적 검증을 수행하고 결과를 기록한다.

## 거버넌스

이 헌법은 Spec Kit 산출물과 구현 판단의 기본 기준이다. 헌법을 변경할 때는 변경 이유와 영향을 커밋 또는 문서에 남긴다. 복잡도가 증가하는 결정은 더 단순한 대안을 왜 거부했는지 기록한다.

**버전**: 1.0.0 | **비준일**: 2026-08-16 | **마지막 개정일**: 2026-08-16
