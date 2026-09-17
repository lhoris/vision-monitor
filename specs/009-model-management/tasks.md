# 작업 목록: 모델 관리

**입력**: `/specs/009-model-management/`의 설계 문서

**사전 조건**: spec.md, plan.md 필수. research.md, data-model.md, contracts/, quickstart.md를 함께 참조한다.

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

**테스트**: UI/상태 흐름 변경이므로 컴포넌트 테스트와 `npm run build` 검증을 포함한다.

**구성 방식**: 작업은 사용자 스토리별로 묶고, 각 사용자 스토리가 독립 구현 및 독립 검증 가능하도록 작성한다.

## Phase 1: 준비

**목적**: 기존 관리자 route, 표준 그리드, 문서 산출물을 확인하고 구현 경계를 확정한다.

- [X] T001 `specs/009-model-management/spec.md`, `plan.md`, `contracts/model-management-mock-contract.md`를 확인하고 mock-first 범위를 확정한다.
- [X] T002 [P] 모델 관리 원문 캡처와 assets 설명이 연결되어 있는지 확인한다: `specs/009-model-management/assets/README.md`
- [X] T003 [P] 기존 관리자 route 연결 지점을 확인한다: `frontend/src/App.tsx`, `frontend/src/pages/AdminPlaceholder.tsx`, `frontend/src/components/Layout/Sidebar.tsx`
- [X] T004 [P] 표준 그리드 구현 기준을 확인한다: `frontend/src/components/UserManagement/UserManagementGrid.tsx`, `docs/GRID_UX.md`
- [X] T005 검증 명령을 확인한다: `frontend/package.json`, `specs/009-model-management/quickstart.md`

## Phase 2: 기반 작업

**목적**: 모든 사용자 스토리가 공유하는 타입, fixture, service, 공통 UI를 만든다.

**중요**: 이 Phase가 끝나기 전에는 사용자 스토리 구현을 시작하지 않는다.

- [X] T006 [P] 모델 관리 타입을 정의한다: `frontend/src/types/modelManagement.ts`
- [X] T007 [P] 공정, 모델 프로세스, 이벤트 로그 mock fixture를 작성한다: `frontend/src/mocks/modelManagement.ts`
- [X] T008 mock contract에 맞는 service skeleton을 작성한다: `frontend/src/services/modelManagementService.ts`
- [X] T009 [P] 상태 label, indicator 색상, validation helper를 작성한다: `frontend/src/components/ModelManagement/modelManagementUi.ts`
- [X] T010 [P] 모델 관리 컴포넌트 export index를 만든다: `frontend/src/components/ModelManagement/index.ts`
- [X] T011 `/admin/model-management` 기준 route와 기존 route 호환을 연결한다: `frontend/src/pages/AdminPlaceholder.tsx`, `frontend/src/pages/ModelManagement.tsx`
- [X] T012 [P] 기본 테스트 파일과 fixture reset helper를 준비한다: `frontend/src/pages/__tests__/ModelManagement.test.tsx`

**체크포인트**: 타입, mock service, route skeleton이 준비되어 각 사용자 스토리를 독립적으로 구현할 수 있어야 한다.

## Phase 3: 사용자 스토리 1 - 공정별 모델 프로세스 조회 (P1, MVP)

**목표**: 관리자가 공정 다중 선택 필터로 모델 프로세스 목록을 조회한다.

**관련 요구사항**: FR-001~FR-008, FR-020, UX-001~UX-005, SC-001, SC-003

**독립 테스트**: 모델 관리 화면 진입, 전공정 조회, 가열+압연 다중 선택, 전공정 상태 유지, 빈 상태를 검증한다.

### 사용자 스토리 1 테스트

- [X] T013 [P] [US1] 관리자 접근과 공정 필터 렌더링 테스트를 작성한다: `frontend/src/pages/__tests__/ModelManagement.test.tsx`
- [X] T014 [P] [US1] 전공정과 복수 공정 선택 규칙 테스트를 작성한다: `frontend/src/pages/__tests__/ModelManagement.test.tsx`

### 사용자 스토리 1 구현

- [X] T015 [P] [US1] 공정 다중 선택 필터 컴포넌트를 구현한다: `frontend/src/components/ModelManagement/ProcessMultiSelectFilter.tsx`
- [X] T016 [P] [US1] 모델 프로세스 그리드 기본 컬럼과 빈 상태를 구현한다: `frontend/src/components/ModelManagement/ModelProcessGrid.tsx`
- [X] T017 [US1] `전공정`과 개별 공정 선택 상태 로직을 연결한다: `frontend/src/pages/ModelManagement.tsx`
- [X] T018 [US1] 관리자 route 접근과 모델 관리 화면 로딩/오류/빈 상태를 연결한다: `frontend/src/pages/ModelManagement.tsx`
- [X] T019 [US1] quickstart의 공정별 조회 시나리오를 브라우저 또는 테스트로 검증한다: `specs/009-model-management/quickstart.md`

**체크포인트**: 사용자 스토리 1만으로도 모델 관리 MVP 조회 화면을 시연할 수 있어야 한다.

## Phase 4: 사용자 스토리 2 - 모니터링 및 제어 연동 상태 확인 (P1)

**목표**: 관리자가 모델별 Python 프로세스 alive 상태와 제어 연동 상태를 구분한다.

**관련 요구사항**: FR-008~FR-011, FR-018~FR-019, UX-006, SC-002

**독립 테스트**: mock 상태 normal/failed/checking/unknown이 텍스트와 indicator로 표시되는지 검증한다.

### 사용자 스토리 2 테스트

- [X] T020 [P] [US2] 상태 badge 렌더링 테스트를 작성한다: `frontend/src/components/ModelManagement/__tests__/ModelStatusBadge.test.tsx`
- [X] T021 [P] [US2] 그리드에 모니터링 현황과 제어 연동 상태가 표시되는 테스트를 작성한다: `frontend/src/pages/__tests__/ModelManagement.test.tsx`

### 사용자 스토리 2 구현

- [X] T022 [P] [US2] 프로세스/모니터링/제어 연동 상태 badge를 구현한다: `frontend/src/components/ModelManagement/ModelStatusBadge.tsx`
- [X] T023 [US2] 상태 컬럼을 모델 프로세스 그리드에 연결한다: `frontend/src/components/ModelManagement/ModelProcessGrid.tsx`
- [X] T024 [US2] 상태별 mock fixture 케이스를 보강한다: `frontend/src/mocks/modelManagement.ts`
- [X] T025 [US2] quickstart의 모니터링/제어 연동 상태 확인 시나리오를 검증한다: `specs/009-model-management/quickstart.md`

**체크포인트**: 운영자가 상태 컬럼만 보고 정상/실패/확인 중을 구분할 수 있어야 한다.

## Phase 5: 사용자 스토리 3 - 모델 설정 수정 (P1)

**목표**: 관리자가 서버 IP와 Python 프로젝트 경로를 확인하고 mock으로 수정한다.

**관련 요구사항**: FR-013, FR-017, UX-009, SC-004

**독립 테스트**: 설정 팝업을 열고 IP/경로 수정, 필수값 오류, 저장 후 그리드 반영을 검증한다.

### 사용자 스토리 3 테스트

- [X] T026 [P] [US3] 설정 수정 팝업 validation 테스트를 작성한다: `frontend/src/pages/__tests__/ModelManagement.test.tsx`
- [X] T027 [P] [US3] mock service 설정 저장 테스트를 작성한다: `frontend/src/services/__tests__/modelManagementService.test.ts`

### 사용자 스토리 3 구현

- [X] T028 [P] [US3] 모델 설정 수정 dialog를 구현한다: `frontend/src/components/ModelManagement/ModelSettingsDialog.tsx`
- [X] T029 [US3] `updateSettings` mock service를 구현한다: `frontend/src/services/modelManagementService.ts`
- [X] T030 [US3] 설정 버튼과 저장 후 그리드 갱신을 연결한다: `frontend/src/pages/ModelManagement.tsx`, `frontend/src/components/ModelManagement/ModelProcessGrid.tsx`
- [X] T031 [US3] quickstart의 서버 IP와 Python 프로젝트 경로 수정 시나리오를 검증한다: `specs/009-model-management/quickstart.md`

**체크포인트**: 사용자는 특정 모델의 서버 IP와 Python 프로젝트 경로를 수정하고 즉시 목록에서 확인할 수 있어야 한다.

## Phase 6: 사용자 스토리 4 - 모델 프로세스 조작 (P2)

**목표**: 관리자가 시작, 정지, 재시작 조작을 mock 상태 변경으로 수행한다.

**관련 요구사항**: FR-014~FR-015, FR-018, UX-008, SC-006

**독립 테스트**: 확인 절차, 상태 전이, 중복 조작 차단을 검증한다.

### 사용자 스토리 4 테스트

- [X] T032 [P] [US4] start/stop/restart mock service 상태 전이 테스트를 작성한다: `frontend/src/services/__tests__/modelManagementService.test.ts`
- [X] T033 [P] [US4] 조작 확인과 상태 변경 UI 테스트를 작성한다: `frontend/src/pages/__tests__/ModelManagement.test.tsx`

### 사용자 스토리 4 구현

- [X] T034 [P] [US4] 프로세스 조작 버튼 그룹을 구현한다: `frontend/src/components/ModelManagement/ModelProcessActions.tsx`
- [X] T035 [US4] `controlProcess` mock service와 중복 조작 차단을 구현한다: `frontend/src/services/modelManagementService.ts`
- [X] T036 [US4] 조작 확인, 진행 상태, 완료 toast 또는 status feedback을 연결한다: `frontend/src/pages/ModelManagement.tsx`
- [X] T037 [US4] quickstart의 프로세스 시작/정지/재시작 시나리오를 검증한다: `specs/009-model-management/quickstart.md`

**체크포인트**: 실제 프로세스 제어 없이도 조작 UX와 상태 변화가 시연 가능해야 한다.

## Phase 7: 사용자 스토리 5 - 모니터링 이벤트 로그 조회 (P2)

**목표**: 관리자가 특정 모델의 이벤트 로그를 팝업으로 단순 조회한다.

**관련 요구사항**: FR-012, UX-007, SC-005

**독립 테스트**: 이벤트 로그 팝업 열기, 로그 목록, 빈 상태를 검증한다.

### 사용자 스토리 5 테스트

- [X] T038 [P] [US5] 이벤트 로그 팝업 목록/빈 상태 테스트를 작성한다: `frontend/src/pages/__tests__/ModelManagement.test.tsx`

### 사용자 스토리 5 구현

- [X] T039 [P] [US5] 이벤트 로그 dialog를 구현한다: `frontend/src/components/ModelManagement/ModelEventLogDialog.tsx`
- [X] T040 [US5] `listEventLogs` mock service를 구현한다: `frontend/src/services/modelManagementService.ts`
- [X] T041 [US5] 그리드의 이벤트 로그 진입 버튼과 팝업 상태를 연결한다: `frontend/src/pages/ModelManagement.tsx`, `frontend/src/components/ModelManagement/ModelProcessGrid.tsx`
- [X] T042 [US5] quickstart의 이벤트 로그 팝업 시나리오를 검증한다: `specs/009-model-management/quickstart.md`

**체크포인트**: 상태 이상 모델의 관련 mock 이벤트 로그를 현재 화면 위에서 확인할 수 있어야 한다.

## Phase 8: 사용자 스토리 6 - 신규 모델 추가 (P2)

**목표**: 관리자가 신규 모델을 추가하고 mock 그리드에서 확인한다.

**관련 요구사항**: FR-016~FR-017, SC-004

**독립 테스트**: 신규 모델 입력, 필수값 validation, 저장 후 목록 추가를 검증한다.

### 사용자 스토리 6 테스트

- [X] T043 [P] [US6] 신규 모델 추가 validation과 목록 반영 테스트를 작성한다: `frontend/src/pages/__tests__/ModelManagement.test.tsx`

### 사용자 스토리 6 구현

- [X] T044 [P] [US6] 신규 모델 추가 dialog를 구현한다: `frontend/src/components/ModelManagement/ModelCreateDialog.tsx`
- [X] T045 [US6] `createProcess` mock service를 구현한다: `frontend/src/services/modelManagementService.ts`
- [X] T046 [US6] 모델 추가 버튼과 저장 후 그리드 갱신을 연결한다: `frontend/src/pages/ModelManagement.tsx`
- [X] T047 [US6] quickstart의 신규 모델 추가 시나리오를 검증한다: `specs/009-model-management/quickstart.md`

**체크포인트**: 신규 모델을 mock으로 추가하고 공정 필터 조건에 따라 목록에서 확인할 수 있어야 한다.

## Phase 9: 다듬기 및 공통 검증

**목적**: 여러 사용자 스토리에 걸친 품질 검증과 회귀 확인을 수행한다.

- [X] T048 [P] 모델 관리 화면의 theme1/theme2/theme3 가독성과 반응형 배치를 확인한다: `frontend/src/pages/ModelManagement.tsx`, `frontend/src/components/ModelManagement/`
- [X] T049 [P] sidebar의 `모델 관리` 메뉴명과 route 접근 회귀를 확인한다: `frontend/src/components/Layout/__tests__/Sidebar.admin.test.tsx`
- [X] T050 [P] 문서의 quickstart 시나리오와 실제 UI 명칭이 일치하는지 확인한다: `specs/009-model-management/quickstart.md`
- [X] T051 모델 관리 테스트를 실행한다: `npm test -- --run src/pages/__tests__/ModelManagement.test.tsx src/services/__tests__/modelManagementService.test.ts`
- [X] T052 frontend production build를 실행한다: `npm run build`
- [X] T053 필요한 경우 `scripts\develop.bat`로 backend/frontend를 함께 재기동하고 `http://localhost:3000`, `http://localhost:8080/swagger-ui.html` 응답을 확인한다.

## 의존성 및 실행 순서

### Phase 의존성

- **Phase 1 준비**: 의존성 없음
- **Phase 2 기반 작업**: Phase 1 완료 후 시작, 모든 사용자 스토리를 차단함
- **Phase 3 US1**: Phase 2 완료 후 시작, MVP
- **Phase 4 US2**: Phase 2 완료 후 시작 가능, US1 그리드와 통합 필요
- **Phase 5 US3**: Phase 2 완료 후 시작 가능, 그리드 진입점은 US1과 통합
- **Phase 6~8 US4~US6**: Phase 2 완료 후 시작 가능, page 상태와 service 공유
- **Phase 9 다듬기**: 목표 사용자 스토리 완료 후 진행

### 사용자 스토리 의존성

- **US1(P1)**: 독립 MVP. 모델 관리 화면 골격과 공정 필터 제공
- **US2(P1)**: US1 그리드에 상태 컬럼을 확장하지만 상태 badge 자체는 독립 검증 가능
- **US3(P1)**: US1 그리드의 특정 행에서 설정 수정 흐름 추가
- **US4(P2)**: US1 그리드의 특정 행에서 프로세스 조작 흐름 추가
- **US5(P2)**: US1 그리드의 특정 행에서 이벤트 로그 팝업 추가
- **US6(P2)**: 공정 목록과 mock service 기반으로 신규 행 추가

### 병렬화 가능 지점

- Phase 2의 타입, fixture, UI helper는 서로 다른 파일이므로 병렬 가능
- US2의 상태 badge 테스트와 구현은 `ModelStatusBadge` 파일 중심으로 병렬 가능
- US3~US6의 dialog 컴포넌트는 서로 다른 파일이므로 기반 service shape 확정 후 병렬 가능
- 같은 파일인 `ModelManagement.tsx`, `modelManagementService.ts`, `ModelProcessGrid.tsx`를 동시에 수정하는 작업은 병렬 실행하지 않는다.

## 병렬 실행 예시

```text
Task: "T006 타입 정의: frontend/src/types/modelManagement.ts"
Task: "T007 mock fixture 작성: frontend/src/mocks/modelManagement.ts"
Task: "T009 UI helper 작성: frontend/src/components/ModelManagement/modelManagementUi.ts"
```

```text
Task: "T028 설정 dialog 구현: frontend/src/components/ModelManagement/ModelSettingsDialog.tsx"
Task: "T039 이벤트 로그 dialog 구현: frontend/src/components/ModelManagement/ModelEventLogDialog.tsx"
Task: "T044 신규 모델 추가 dialog 구현: frontend/src/components/ModelManagement/ModelCreateDialog.tsx"
```

## 구현 전략

### MVP 우선

1. Phase 1 준비 완료
2. Phase 2 기반 작업 완료
3. Phase 3 사용자 스토리 1 완료
4. 공정 필터와 모델 프로세스 그리드만으로 1차 시연

### 점진적 전달

1. US1 공정 조회와 그리드 완성
2. US2 상태 표시 추가
3. US3 서버 IP와 Python 프로젝트 경로 수정 추가
4. US4 프로세스 조작 추가
5. US5 이벤트 로그 팝업 추가
6. US6 신규 모델 추가 추가

### Mock-First 전략

1. 타입과 mock contract를 먼저 확정한다.
2. mock service가 실제 후속 API shape를 닮도록 작성한다.
3. UI는 mock service만 의존한다.
4. 실제 Spring Boot/API/DB/Agent 연동은 후속 feature로 분리한다.

