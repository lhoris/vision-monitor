# 구현 계획: 모델 관리

**브랜치**: `009-model-management` | **일자**: 2026-09-17 | **명세**: [spec.md](spec.md)

**입력**: `/specs/009-model-management/spec.md`의 기능 명세

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

> 이 문서는 한국어로 작성한다. 기술 용어, API 이름, 파일 경로, 코드 식별자, 명령어는 원문 또는 영문 표기를 유지할 수 있다.
> 구현 계획은 "어떻게 구현할 것인가"를 정의한다. 기능 경계는 spec.md를 기준으로 하며, plan.md에서 새 기능 요구사항을 추가하지 않는다.

## 1. 계획 요약

모델 관리는 이번 단계에서 frontend 화면 퍼블리싱과 mock 상태 흐름으로 구현한다. 기준 route는 `/admin/model-management`로 사용하고, 기존 `/admin/model-restart`는 호환 경로로 유지한다. 모델 목록은 프로젝트 표준 그리드 경험을 따르며, 공정 선택은 탭이 아니라 다중 선택 필터로 구현한다. Python 프로세스 alive, 제어 연동 상태, 프로세스 시작/정지/재시작, 이벤트 로그, 서버 IP와 Python 프로젝트 경로 수정은 모두 frontend mock service와 fixture를 통해 표현한다. Spring Boot API, DB migration, VM Agent, 실제 프로세스 제어는 후속 범위로 분리한다.

## 2. 요구사항 추적

| 명세 항목 | 계획 반영 위치 | 비고 |
|-----------|----------------|------|
| FR-001, FR-002 | 화면/컴포넌트 구조, 테스트 계획 | 관리자 route와 기존 sidebar 접근 제어 사용 |
| FR-003~FR-006 | 공정 선택 컴포넌트, 상태 흐름 | 탭 금지, 다중 선택 필터 |
| FR-007, UX-005 | 표준 그리드 구현 | 사용자 관리 그리드의 셀/헤더/필터 UX를 기준으로 함 |
| FR-008~FR-011, FR-018~FR-019 | 데이터 모델, mock fixture, 상태 badge | DB 기준 상태는 후속 범위, MVP는 mock |
| FR-012, UX-007 | 이벤트 로그 팝업 | 단순 조회와 빈 상태 |
| FR-013, UX-009 | 설정 수정 UI | 서버 IP와 Python 프로젝트 경로 mock 저장 |
| FR-014~FR-015, UX-008 | 프로세스 조작 UI | 시작/정지/재시작 mock 상태 변경 |
| FR-016~FR-017 | 신규 모델 추가 UI | mock 목록에 추가 |
| FR-020 | 빈 상태와 조건 없음 상태 | 컴포넌트 테스트와 quickstart 검증 |

## 3. 기술 컨텍스트

**언어/버전**: TypeScript, React, Java 21은 기존 backend 유지

**주요 의존성**: React, Redux Toolkit, Vite, Vitest, React Testing Library, Tailwind CSS

**저장소/상태 관리**: frontend component state와 mock service fixture. backend 저장소 변경 없음

**테스트**: Vitest, React Testing Library, `npm run build`

**대상 플랫폼**: 웹 브라우저, Windows 로컬 개발 환경

**프로젝트 유형**: full-stack repository 안의 frontend 중심 MVP

**성능 목표**: 공정 필터 변경 후 1초 이내 mock 목록 갱신 체감, 상태 식별 3초 이내

**제약사항**: Mock-First MVP, 실제 VM Agent/API/DB/프로세스 제어 제외, 기존 관리자 route와 sidebar 구조 존중

**규모/범위**: 모델 관리 화면 1개, 공정 필터 1개, 모델 그리드, 설정 팝업, 이벤트 로그 팝업, 신규 모델 추가 팝업, mock service/fixture

## 4. 구현 범위와 제외 범위

### 구현 범위

- `frontend/src/pages/AdminPlaceholder.tsx`에서 `/admin/model-management`에 모델 관리 화면 연결 및 기존 route 호환
- `frontend/src/pages/ModelManagement.tsx` 신규 화면 구현
- `frontend/src/types/modelManagement.ts` 타입 정의
- `frontend/src/mocks/modelManagement.ts` mock 공정, 모델, 이벤트 로그 fixture 작성
- `frontend/src/services/modelManagementService.ts` mock service 작성
- `frontend/src/components/ModelManagement/` 하위 컴포넌트 작성
- `frontend/src/pages/__tests__/ModelManagement.test.tsx` 또는 컴포넌트 테스트 작성
- Spec Kit 산출물: `research.md`, `data-model.md`, `contracts/model-management-mock-contract.md`, `quickstart.md`, `tasks.md`

### 제외 범위

- Spring Boot controller/service/repository 구현
- MariaDB schema와 Flyway migration
- VM Agent, 프로세스 alive 수집, 제어 연동 통신 실행
- 실제 Python 프로세스 시작/정지/재시작
- 이벤트 로그 다운로드, 확인 처리, 통계 분석
- 모델 배포, 버전 교체, 학습 기능

## 5. 설계 접근

### 화면/컴포넌트 구조

- `ModelManagement` page가 전체 화면 상태와 mock service 호출을 관리한다.
- `ProcessMultiSelectFilter`는 `전공정`과 개별 공정의 선택 규칙을 캡슐화한다.
- `ModelProcessGrid`는 표준 그리드 스타일로 모델 목록, 상태, 조작 버튼, 설정/로그 진입점을 표시한다.
- `ModelStatusBadge`는 Python 프로세스 상태, 모니터링 현황, 제어 연동 상태를 텍스트와 indicator로 표현한다.
- `ModelSettingsDialog`는 서버 IP와 Python 프로젝트 경로를 수정한다.
- `ModelEventLogDialog`는 특정 모델의 mock 이벤트 로그를 단순 조회한다.
- `ModelCreateDialog`는 신규 모델을 mock 목록에 추가한다.

### 상태 및 상호작용 흐름

- 초기 진입 시 공정 목록과 모델 목록을 mock service에서 로드한다.
- 기본 선택은 `전공정`이며, 전체 모델을 표시한다.
- `전공정` 선택 상태에서 개별 공정을 누르면 전체 조회 상태를 유지한다.
- 개별 공정 선택 모드에서는 하나 이상의 공정을 선택할 수 있고, 선택 공정이 모두 해제되면 `전공정`으로 복귀한다.
- 설정 저장은 mock 목록의 해당 모델 서버 IP와 Python 프로젝트 경로를 갱신한다.
- 시작/정지/재시작은 확인 후 mock 상태를 변경하고, 재시작은 일시적인 `restarting` 상태를 표현한다.
- 이벤트 로그 팝업은 선택 모델의 로그 목록 또는 빈 상태를 표시한다.

### 서비스 및 데이터 흐름

- `modelManagementService`는 `listProcesses`, `updateSettings`, `controlProcess`, `listEventLogs`, `createProcess` 메서드를 제공한다.
- MVP에서는 service 내부가 in-memory fixture를 갱신한다.
- contract 문서는 후속 API 전환 시 shape를 유지하기 위한 기준으로 사용한다.

## 6. 데이터 및 계약 계획

### 필요한 데이터

- `ProcessArea`: 공정 ID, 이름, 정렬 순서, 전체 선택 여부
- `ModelProcess`: 모델 ID, 공정 ID/이름, 모델명, 조업 자동화 기술명, 서버 IP, Python 프로젝트 경로, 프로세스 상태, 모니터링 alive 상태, 제어 연동 상태, 최근 갱신 시각
- `ModelEventLog`: 로그 ID, 모델 ID, 발생 시각, 등급, 메시지, 감지 결과 요약
- `ModelSettingsInput`: 서버 IP, Python 프로젝트 경로
- `ModelCreateInput`: 공정, 모델명, 기술명, 서버 IP, Python 프로젝트 경로
- `ModelControlAction`: `start`, `stop`, `restart`

### 계약

- [contracts/model-management-mock-contract.md](contracts/model-management-mock-contract.md)
- 타입 파일: `frontend/src/types/modelManagement.ts`
- service 파일: `frontend/src/services/modelManagementService.ts`
- mock fixture: `frontend/src/mocks/modelManagement.ts`

### Fixture/Mock 계획

- 원문 캡처의 압연/냉각 예시를 포함한 5개 이상 모델 프로세스
- 정상, 중지, 오류, 확인 중 상태를 모두 포함
- 모니터링 현황 성공/실패/확인 중, 제어 연동 성공/실패/확인 중 포함
- 이벤트 로그 있음/없음 모델 각각 포함
- 신규 모델 추가와 설정 수정이 화면 state에 반영되는 in-memory fixture

## 7. 테스트 및 검증 계획

- **단위/컴포넌트 테스트**: 공정 필터 선택 규칙, 상태 badge, 모델 그리드, 팝업 열기/닫기, mock 상태 변경
- **통합 테스트**: `ModelManagement` 화면에서 조회, 필터, 설정 수정, 이벤트 로그, 시작/정지/재시작, 신규 추가 흐름 검증
- **E2E/수동 검증**: quickstart 시나리오를 브라우저에서 확인
- **빌드/정적 검증**: `cd frontend && npm run build`
- **회귀 확인**: sidebar 관리자 메뉴의 `모델 관리`, 사용자 관리 표준 그리드, 영상 관리 그리드가 깨지지 않는지 확인

## 8. 프로젝트 구조

### 문서 구조(이번 기능)

```text
specs/009-model-management/
├── assets/
├── contracts/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### 소스 코드 구조

```text
frontend/
├── src/
│   ├── components/
│   │   └── ModelManagement/
│   ├── mocks/
│   │   └── modelManagement.ts
│   ├── pages/
│   │   ├── ModelManagement.tsx
│   │   └── __tests__/
│   ├── services/
│   │   └── modelManagementService.ts
│   └── types/
│       └── modelManagement.ts

backend/
└── N/A
```

**구조 결정**: 현재 기능은 화면 퍼블리싱과 mock 상태 흐름이므로 frontend에 타입, fixture, service, page, component를 추가한다. backend는 후속 API 전환 전까지 변경하지 않는다.

## 9. 헌법 체크

- **한국어 우선 산출물**: 통과. plan/tasks 등 산출물을 한국어로 작성한다.
- **기존 구조 존중**: 통과. 기존 `pages`, `components`, `services`, `mocks`, `types` 패턴을 따른다.
- **Mock-First MVP**: 통과. 실제 Agent/API/DB/프로세스 제어는 제외하고 mock contract를 먼저 작성한다.
- **계약 우선**: 통과. mock contract와 타입을 정의한 뒤 UI를 구현한다.
- **테스트 가능한 증분**: 통과. 사용자 스토리별 독립 테스트와 quickstart를 둔다.
- **로컬 개발 환경 전체 실행**: 통과. 최종 검증은 `scripts\develop.bat` 또는 frontend build를 사용하고, 서버 실행 필요 시 backend/frontend 동시 실행을 따른다.

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| 공정 선택 UI가 탭처럼 구현될 위험 | 사용자 요구와 다른 화면 동작 | 컴포넌트명과 테스트를 `MultiSelectFilter` 기준으로 작성 |
| 실제 상태 기준과 mock 상태 의미가 어긋날 위험 | 후속 API 전환 시 혼선 | contract에 DB 기준 alive/control status 의미를 명시 |
| 표준 그리드 스타일 불일치 | 관리자 화면 일관성 저하 | 사용자 관리 그리드의 헤더/셀/우클릭 필터 패턴을 참고 |
| 조작 버튼이 실제 제어처럼 오해될 위험 | 운영 위험 | mock 상태 변경과 확인 메시지를 명확히 표시 |

## 11. 복잡도 추적

| 결정 | 필요한 이유 | 더 단순한 대안을 거부한 이유 |
|------|-------------|-------------------------------|
| 신규 `ModelManagement` 컴포넌트 묶음 도입 | 이벤트 로그, 설정, 프로세스 조작, 공정 필터가 한 화면에 공존 | 단일 파일에 모두 작성하면 표준 그리드와 팝업 흐름 테스트가 어려움 |
