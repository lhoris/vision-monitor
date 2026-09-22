# 구현 계획: [기능]

**브랜치**: `[###-feature-name]` | **일자**: [DATE] | **명세**: [link]

**입력**: `/specs/[###-feature-name]/spec.md`의 기능 명세

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

> 이 문서는 한국어로 작성한다. 기술 용어, API 이름, 파일 경로, 코드 식별자, 명령어는 원문 또는 영문 표기를 유지할 수 있다.
> 구현 계획은 "어떻게 구현할 것인가"를 정의한다. 기능 경계는 spec.md를 기준으로 하며, plan.md에서 새 기능 요구사항을 추가하지 않는다.

## 1. 계획 요약

<!--
  목적:
  spec.md의 기능 요구사항과 제외 범위를 바탕으로 구현 접근을 짧게 요약한다.

  작성 원칙:
  - 3~7문장으로 작성한다.
  - 새 요구사항을 추가하지 않는다.
  - frontend/backend/external system 책임 경계를 명확히 한다.
-->

[기능 요구사항을 만족하기 위한 구현 접근을 요약한다.]

## 2. 요구사항 추적

<!--
  목적:
  spec.md의 FR/UX/필요한 정보가 plan.md에서 어디에 반영되는지 추적한다.
  모든 FR은 최소 하나 이상의 계획 항목 또는 제외/후속 범위와 연결되어야 한다.
-->

| 명세 항목 | 계획 반영 위치 | 비고 |
|-----------|----------------|------|
| FR-001 | [관련 설계/구현 계획 섹션] | [구현 또는 제외 근거] |
| UX-001 | [관련 설계/구현 계획 섹션] | [구현 또는 제외 근거] |

## 3. 기술 컨텍스트

<!--
  작성 필요:
  프로젝트의 실제 기술 정보를 반영한다. 불필요한 항목은 N/A로 표시한다.
-->

**언어/버전**: [예: TypeScript 5.x, Java 21 또는 NEEDS CLARIFICATION]

**주요 의존성**: [예: React, Vite, Spring Boot 또는 NEEDS CLARIFICATION]

**저장소/상태 관리**: [예: 브라우저 상태, mock fixture, PostgreSQL 또는 N/A]

**테스트**: [예: Vitest, React Testing Library, Playwright 또는 NEEDS CLARIFICATION]

**대상 플랫폼**: [예: 웹 브라우저, Windows 운영 환경, Linux 서버 또는 NEEDS CLARIFICATION]

**프로젝트 유형**: [예: frontend, backend, full-stack web app 또는 NEEDS CLARIFICATION]

**성능 목표**: [예: 60 fps, p95 200ms 이하 또는 NEEDS CLARIFICATION]

**제약사항**: [예: mock-only MVP, 외부 VMS 직접 구현 제외, 기존 UI 구조 유지 또는 NEEDS CLARIFICATION]

**규모/범위**: [예: 카메라 9개 그리드, 화면 3개, 이벤트 100건 또는 NEEDS CLARIFICATION]

## 4. 구현 범위와 제외 범위

<!--
  목적:
  이번 구현에서 실제로 변경할 범위와 명시적으로 하지 않을 범위를 구분한다.
-->

### 구현 범위

- [이번 기능에서 실제 구현할 frontend/backend/service/UI 범위]
- [mock service, fixture, DTO contract 등 필요한 계약 범위]
- [기존 기능과 연결되는 범위]

### 제외 범위

- [spec.md의 제외 범위를 구현 관점에서 재확인한다.]
- [후속 기능 또는 외부 시스템 책임으로 남길 항목]

## 5. 설계 접근

<!--
  목적:
  기능을 구현하기 위한 컴포넌트, 서비스, 상태, 데이터 흐름의 설계를 설명한다.
  코드 수준으로 과도하게 상세하게 쓰기보다 tasks.md로 분해 가능한 수준까지 작성한다.
-->

### 화면/컴포넌트 구조

- [관련 화면, 컴포넌트, 라우트, 레이아웃 구조]
- [기존 컴포넌트 재사용 또는 신규 컴포넌트 필요성]

### 상태 및 상호작용 흐름

- [사용자 동작에 따른 상태 변화]
- [로딩, 오류, 빈 상태, 권한/접근 불가 등 처리]

### 서비스 및 데이터 흐름

- [frontend service, mock adapter, fixture, API boundary]
- [external system 또는 backend와의 책임 경계]

## 6. 데이터 및 계약 계획

<!--
  목적:
  spec.md의 "필요한 정보"를 구현 가능한 데이터 구조와 계약으로 변환한다.
  상세 계약 파일이 필요하면 contracts/ 아래에 작성한다.
-->

### 필요한 데이터

- [화면/기능이 필요로 하는 데이터]
- [상태 판단에 필요한 데이터]

### 계약

- [API/mock contract 이름 또는 경로]
- [DTO 또는 타입 이름]
- [성공/오류 응답 경계]

### Fixture/Mock 계획

- [MVP에서 사용할 mock 데이터]
- [오류, 빈 상태, 권한 제한 등 테스트 fixture]

## 7. 테스트 및 검증 계획

<!--
  목적:
  구현 완료 여부를 어떻게 검증할지 정의한다.
  테스트는 위험도와 사용자 영향도에 맞게 선택한다.
-->

- **단위/컴포넌트 테스트**: [대상과 목적]
- **통합 테스트**: [대상과 목적]
- **E2E/수동 검증**: [사용자 흐름 검증 방법]
- **빌드/정적 검증**: [lint, typecheck, build 등]
- **회귀 확인**: [기존 기능에서 깨지면 안 되는 흐름]

## 8. 프로젝트 구조

### 문서 구조(이번 기능)

```text
specs/[###-feature]/
├── assets/         # 참고 이미지 및 원문 자료
├── spec.md         # 기능 명세
├── plan.md         # 구현 계획
├── research.md     # 필요 시 리서치 결과
├── data-model.md   # 필요 시 데이터 모델
├── quickstart.md   # 필요 시 검증 절차
├── contracts/      # 필요 시 API/mock contract
└── tasks.md        # 작업 목록 (/speckit-tasks 산출물)
```

### 소스 코드 구조

<!--
  작성 필요:
  실제 변경 대상 경로만 남긴다. 사용하지 않는 예시는 삭제한다.
-->

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── test/

backend/
└── [MVP에서 변경하지 않는 경우 N/A로 표시]
```

**구조 결정**: [선택한 구조와 실제 디렉터리 근거를 기록한다.]

## 9. 헌법 체크

<!--
  `.specify/memory/constitution.md` 기준으로 위반 여부를 점검한다.
-->

- **한국어 우선 산출물**: [통과/위반 및 근거]
- **기존 구조 존중**: [통과/위반 및 근거]
- **Mock-First MVP**: [통과/위반 및 근거]
- **계약 우선**: [통과/위반 및 근거]
- **테스트 가능한 증분**: [통과/위반 및 근거]
- **로컬 개발 환경 전체 실행**: [통과/위반 및 근거. 로컬 서버 검증이 필요한 경우 backend/frontend 동시 실행 또는 예외 사유를 기록]

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| [예: 외부 시스템 계약 미정] | [구현/검증 영향] | [mock contract 또는 후속 범위로 분리] |
| [예: 기존 UI 회귀 가능성] | [사용자 영향] | [검증 방법] |

## 11. 복잡도 추적

> 헌법 체크 위반이 있거나 복잡도가 증가하는 설계 결정을 했을 때만 작성한다.

| 결정 | 필요한 이유 | 더 단순한 대안을 거부한 이유 |
|------|-------------|-------------------------------|
| [예: 신규 상태 관리 계층 도입] | [현재 필요한 이유] | [기존 방식으로 부족한 이유] |
# 구현 계획: DB 세션 영속화

**브랜치**: `017-database-session-persistence` | **작성일**: 2026-09-22 | **명세**: [spec.md](spec.md)

## 1. 계획 요약

현재 `AuthSessionService`는 세션을 JVM 메모리의 Map에만 저장하므로 백엔드 재기동 시 모든 로그인이 무효화된다. 세션 저장소를 `TB_M26_AUTH_SESSION` 기반의 영속 저장소로 교체하고, 로그인/세션 검증/로그아웃 흐름을 기존 인증 계약 안에서 유지한다.

## 2. 기술 맥락

| 항목 | 결정 |
|---|---|
| 백엔드 | Java 21, Spring Boot 기반 기존 backend |
| 데이터베이스 | MariaDB, Flyway 마이그레이션, JPA/JdbcTemplate 기존 패턴 활용 |
| 세션 식별 | 브라우저에는 기존 opaque bearer token을 유지하고 DB에는 token hash만 저장 |
| 세션 만료 | 로그인 시점 기준 8시간의 절대 만료 |
| 폐기 | 로그아웃 시 `DATA_END_STATUS` 및 폐기 시각을 기록하는 논리 폐기 |
| 스키마 규칙 | `TB_M26_AUTH_SESSION`, Audit 컬럼 최상단, FK/UK/별도 INDEX 없음 |
| 프론트엔드 | 기존 localStorage 토큰과 새로고침 시 `/auth/session` 검증 흐름 유지 |
| 테스트 | 기존 JUnit 5/Mokito 및 Flyway 스크립트 검증 패턴 활용 |

## 3. 범위

### 구현 범위

- 다음 Flyway 마이그레이션에 `TB_M26_AUTH_SESSION` 생성
- 기존 프로젝트 Audit 컬럼을 업무 컬럼보다 앞에 배치
- 세션 생성, 조회, 만료 검증, 논리 폐기 기능을 영속 저장소로 변경
- 로그아웃 시 서버 세션 폐기 처리 추가
- 백엔드 재기동, 만료, 폐기, 비활성 사용자 검증 테스트 추가
- 기존 프론트엔드 새로고침 및 인증 실패 처리와의 호환성 검증

### 제외 범위

- Redis 등 별도 세션 캐시 도입
- 운영자용 세션 조회/강제 종료 화면
- 로그인 화면 및 비밀번호 정책 변경
- FK, UK, 별도 INDEX 추가
- 세션 활동에 따른 만료 시각 연장

## 4. 설계

### 4.1 데이터 구조

`TB_M26_AUTH_SESSION`은 Audit 표준 컬럼 13개를 가장 먼저 두고, 다음 업무 컬럼을 둔다.

- `AUTH_SESSION_ID`: 세션 식별자, PK
- `USER_ID`: 사용자 식별자, 논리적 참조
- `TOKEN_HASH`: 원문 토큰 대신 저장하는 해시
- `EXPIRES_TIMESTAMP`: 절대 만료 시각
- `LAST_ACCESSED_TIMESTAMP`: 마지막 검증 시각
- `REVOKED_TIMESTAMP`: 로그아웃 폐기 시각
- `REMARKS`: 비고

기본키 외의 UK 및 별도 INDEX는 생성하지 않는다. 조회량이 증가해 성능 문제가 확인되면 별도 변경 요청으로 다룬다.

### 4.2 인증 흐름

1. 로그인 성공 시 기존과 같은 opaque token을 생성한다.
2. token hash, 사용자 ID, 현재 시각 + 8시간의 만료 시각을 세션 테이블에 저장한다.
3. 보호된 요청마다 bearer token을 hash하여 활성 세션을 조회한다.
4. 세션이 없거나 만료/폐기/데이터 종료 상태면 401을 반환한다.
5. 세션이 유효하면 기존 사용자 상태 및 권한 확인을 수행한다.
6. 로그아웃 요청은 해당 세션을 논리 폐기하고 프론트엔드는 기존처럼 localStorage 인증 정보를 제거한다.

### 4.3 코드 구조

- `backend/src/main/resources/db/migration/V022__create_m26_auth_session.sql`: 테이블 생성
- `backend/src/main/java/com/vision/entity/AuthSession.java`: 세션 엔티티와 Audit/업무 필드
- `backend/src/main/java/com/vision/repository/AuthSessionRepository.java`: 세션 조회/저장/폐기 접근
- `backend/src/main/java/com/vision/service/AuthSessionService.java`: 토큰 생성, 해시, 만료/폐기 검증
- `backend/src/main/java/com/vision/service/AuthService.java`: 로그인과 로그아웃 서비스 연결
- `backend/src/main/java/com/vision/controller/AuthController.java`: 로그아웃 요청 처리
- `backend/src/main/java/com/vision/config/AuthSessionInterceptor.java`: 영속 세션 검증 유지

프론트엔드 API 계약은 기존 bearer token과 `/auth/session` 검증을 유지한다. 로그아웃 호출 실패 시에도 브라우저 인증 정보는 제거되어야 한다.

## 5. 헌법 준수 점검

- **기존 구조 우선**: 기존 인증 서비스, 인터셉터, JPA/Flyway 구조를 확장한다.
- **계약 우선**: 기존 로그인 응답과 세션 검증 동작을 유지하고 로그아웃만 서버 폐기를 추가한다.
- **감사 가능성**: Audit 컬럼과 `DATA_END_STATUS`를 기존 M26 테이블 규칙으로 적용한다.
- **FK 금지 원칙**: `USER_ID`는 논리적 참조로만 둔다.
- **검증 가능성**: 단위 테스트, 마이그레이션 검사, 인증 흐름 테스트로 재기동/만료/폐기를 검증한다.
- **보안**: DB에는 원문 토큰을 저장하지 않는다.

## 6. 위험과 대응

| 위험 | 영향 | 대응 |
|---|---|---|
| UK/INDEX 없이 토큰 조회 | 세션 수 증가 시 조회 비용 증가 | 현 요구사항대로 시작하고 실제 병목 확인 후 별도 변경 |
| 기존 테스트의 수동 서비스 생성 | 컴파일/테스트 실패 | 저장소 의존성을 생성자와 테스트 픽스처에 명시적으로 반영 |
| 백엔드 재기동 중 DB 접근 실패 | 일시적인 인증 실패 | 사용자에게 일반 인증 실패만 반환하고 원인은 서버 로그에 기록 |
| 만료 세션 누적 | 테이블 데이터 증가 | 인증 조회 시 만료 세션을 무효 처리하며 물리 삭제 배치는 범위에서 제외 |

## 7. 구현 순서

1. 데이터 모델 및 Flyway 마이그레이션 추가
2. 세션 저장소 접근 계층 추가
3. `AuthSessionService`를 DB 기반으로 교체
4. 로그인/인터셉터/로그아웃 흐름 연결
5. 백엔드 인증 테스트와 마이그레이션 검증
6. 프론트엔드 인증 실패 및 로그아웃 호환성 테스트
7. 전체 빌드와 회귀 테스트

## 8. 완료 기준

- 유효 세션이 백엔드 재기동 후에도 유지된다.
- 8시간이 지난 세션은 인증되지 않는다.
- 로그아웃한 세션은 재사용할 수 없다.
- `TB_M26_AUTH_SESSION`이 기존 스키마 규칙을 위반하지 않는다.
- 기존 로그인/새로고침/로그인 실패 흐름이 회귀하지 않는다.
