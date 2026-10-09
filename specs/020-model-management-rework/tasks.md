# 작업 목록: 모델 관리 대개편

**입력**: `specs/020-model-management-rework/`의 설계 문서

**사전 조건**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1: 준비

- [X] T001 기존 모델 관리 구현과 대개편 명세의 영향 범위를 비교하고 변경 대상 파일을 확정한다: `frontend/src/pages/ModelManagement.tsx`, `frontend/src/components/ModelManagement/`, `frontend/src/services/modelManagementService.ts`, `frontend/src/types/modelManagement.ts`
- [X] T002 [P] 대시보드 조회·제어 fixture와 상태별 fixture를 정의한다: `frontend/src/components/ModelManagement/__fixtures__/modelManagementDashboardFixtures.ts`
- [X] T003 [P] 대시보드 DTO와 제어 요청 계약 타입을 정의한다: `frontend/src/types/modelManagement.ts`
- [X] T004 기존 모델 관리 테스트와 frontend 검증 명령을 확인하고 대개편 회귀 기준을 기록한다: `specs/020-model-management-rework/quickstart.md`

## Phase 2: 기반 작업

- [X] T005 [P] VM 상태, 프로세스 상태, 제어 요청 상태의 라벨·색상·아이콘 매핑을 추가한다: `frontend/src/components/ModelManagement/modelManagementUi.ts`
- [X] T006 [P] 대시보드 조회·제어 요청 service adapter를 계약에 맞게 확장한다: `frontend/src/services/modelManagementService.ts`
- [X] T007 공통 loading, error, empty 상태와 보기 전환 상태를 페이지에서 관리할 수 있도록 정리한다: `frontend/src/pages/ModelManagement.tsx`
- [X] T008 대시보드 fixture 및 service adapter의 성공·오류 contract test를 작성한다: `frontend/src/services/__tests__/modelManagementService.test.ts`

## Phase 3: 사용자 스토리 1 - VM 및 모델 프로세스 운영 현황 확인 (P1) MVP

**목표**: 관리자가 모델 관리 진입 즉시 VM별 프로세스 운영 상태를 대시보드에서 파악한다.

**관련 요구사항**: 핵심 목표, 화면 방향, US1

**독립 테스트**: VM 1개에 여러 프로세스가 포함된 fixture를 표시하고 VM·프로세스 상태 및 빈/오류 상태를 확인한다.

- [X] T009 [P] [US1] VM 대시보드 컴포넌트를 구현한다: `frontend/src/components/ModelManagement/ModelVmDashboard.tsx`
- [X] T010 [P] [US1] VM 상태와 하위 프로세스 배치를 표현하는 카드를 구현한다: `frontend/src/components/ModelManagement/ModelVmCard.tsx`
- [X] T011 [P] [US1] 프로세스 상태, 모델명, 공정, 최근 갱신 시각을 표현하는 카드를 구현한다: `frontend/src/components/ModelManagement/ModelProcessCard.tsx`
- [X] T012 [US1] 모델 관리 페이지의 기본 진입 보기를 대시보드로 연결한다: `frontend/src/pages/ModelManagement.tsx`
- [X] T013 [US1] VM·프로세스 카드의 실행·중지·오류·확인 불가 및 빈 상태 테스트를 작성한다: `frontend/src/components/ModelManagement/__tests__/ModelVmDashboard.test.tsx`
- [X] T014 [US1] 관리자 로그인 상태에서 대시보드 조회와 렌더링을 검증한다: `frontend/src/pages/__tests__/ModelManagement.test.tsx`
- [X] T014A [US1] VM 내부 프로세스를 육각형 Honeycomb 셀로 배치하는 컴포넌트를 구현한다: `frontend/src/components/ModelManagement/ModelProcessHoneycomb.tsx`, `frontend/src/components/ModelManagement/ModelProcessCell.tsx`
- [X] T014B [US1] 셀 최소 크기, 반응형 재배치, `+ N개` 요약 셀 동작을 구현한다: `frontend/src/components/ModelManagement/ModelProcessHoneycomb.tsx`

## Phase 4: 사용자 스토리 2 - AI 모델 프로세스 제어 (P1)

**목표**: 관리자가 프로세스별 시작·중지·재시작을 요청하고 처리 상태를 확인한다.

**관련 요구사항**: 상태 및 제어, US2, 대시보드 계약

**독립 테스트**: 제어 버튼 선택, 공통 확인 모달, 요청 중, 성공·실패·시간 초과 상태를 확인한다.

- [X] T015 [P] [US2] 프로세스 카드의 시작·중지·재시작 제어 UI를 연결한다: `frontend/src/components/ModelManagement/ModelProcessCard.tsx`
- [X] T016 [P] [US2] 제어 요청 상태와 결과 메시지 표시를 구현한다: `frontend/src/components/ModelManagement/ModelProcessControlStatus.tsx`
- [X] T017 [US2] 공통 확인 모달을 거쳐 action service를 호출하고 중복 요청을 방지한다: `frontend/src/pages/ModelManagement.tsx`
- [X] T018 [US2] 제어 요청 성공·실패·시간 초과 상태 테스트를 작성한다: `frontend/src/components/ModelManagement/__tests__/ModelVmDashboard.test.tsx`
- [X] T019 [US2] 제어 요청 후 실제 프로세스 상태와 요청 상태가 분리 표시되는지 검증한다: `frontend/src/pages/__tests__/ModelManagement.test.tsx`
- [X] T019A [US2] 선택한 프로세스의 상세 패널과 제어 상태 표시를 연결한다: `frontend/src/components/ModelManagement/ModelProcessDetailPanel.tsx`, `frontend/src/pages/ModelManagement.tsx`

## Phase 5: 사용자 스토리 3 - VM 및 모델 프로세스 설정 관리 (P2)

**목표**: 관리자가 그리드에서 VM과 프로세스 설정을 등록·수정한다.

**관련 요구사항**: 편집 화면, 설정 관리, US3

**독립 테스트**: 신규 등록과 수정에서 필수값 검증, 저장 성공·실패, 저장되지 않은 변경 상태를 확인한다.

- [X] T020 [US3] 대시보드/그리드 보기 전환과 현재 필터 보존을 구현한다: `frontend/src/pages/ModelManagement.tsx`
- [X] T021 [P] [US3] 기존 VM 및 프로세스 설정 컬럼과 작업 메뉴를 관리 그리드 보기에서 재사용한다: `frontend/src/components/ModelManagement/ModelProcessGrid.tsx`
- [X] T022 [P] [US3] 기존 신규 등록·수정 입력 검증과 저장 상태를 관리 그리드 흐름에서 재사용한다: `frontend/src/components/ModelManagement/ModelCreateDialog.tsx`, `frontend/src/components/ModelManagement/ModelSettingsDialog.tsx`
- [X] T023 [US3] 등록·수정 service adapter와 저장 오류 처리를 연결한다: `frontend/src/services/modelManagementService.ts`
- [X] T024 [US3] 설정 입력·저장·취소 및 기존 그리드 회귀 테스트를 작성한다: `frontend/src/pages/__tests__/ModelManagement.test.tsx`
- [X] T024A [US3] 모델 설정 편집 모달과 VM 상세 모달이 선택·필터 상태를 유지하도록 검증한다: `frontend/src/components/ModelManagement/ModelSettingsDialog.tsx`, `frontend/src/pages/__tests__/ModelManagement.test.tsx`

## Phase 6: 사용자 스토리 4 - 운영 대상 검색 및 상세 확인 (P2)

**목표**: 관리자가 VM, 공정, 프로세스 상태로 대상을 검색하고 결과를 상세 확인한다.

**관련 요구사항**: US4, 후속 확정 항목의 검색·필터

**독립 테스트**: 각 필터 조합, 결과 없음, 상세 대상 선택 시 대시보드와 그리드의 결과 일관성을 확인한다.

- [X] T025 [P] [US4] VM 검색, 공정 다중 선택, 프로세스 상태 필터 UI를 구현한다: `frontend/src/components/ModelManagement/ModelManagementFilters.tsx`, `frontend/src/components/ModelManagement/ProcessMultiSelectFilter.tsx`
- [X] T026 [US4] 필터 상태를 대시보드와 그리드 조회 조건에 연결한다: `frontend/src/pages/ModelManagement.tsx`
- [X] T027 [US4] 필터 조합, 결과 없음, 대상 선택 상태 테스트를 작성한다: `frontend/src/components/ModelManagement/__tests__/ModelManagementFilters.test.tsx`

## Phase 7: 다듬기 및 공통 검증

- [ ] T028 [P] 다국어 상태 라벨과 제어 문구를 추가·검토한다: `frontend/src/i18n/`
- [ ] T029 [P] 대시보드 카드의 반응형 레이아웃과 접근성 속성을 검토한다: `frontend/src/components/ModelManagement/`
- [ ] T029A [P] Honeycomb 셀의 hover, focus, 선택 강조, 툴팁 및 키보드 접근성을 검토한다: `frontend/src/components/ModelManagement/ModelProcessCell.tsx`
- [X] T030 기존 모델 관리 관련 테스트와 전체 frontend 테스트를 실행한다: `frontend/`
- [X] T031 frontend production build를 실행하고 결과를 기록한다: `frontend/`
- [ ] T032 대시보드, 제어, 그리드 편집, 검색 시나리오를 quickstart 기준으로 수동 검증한다: `specs/020-model-management-rework/quickstart.md`

## 의존성 및 실행 순서

- Phase 1은 즉시 시작할 수 있습니다.
- Phase 2는 Phase 1 완료 후 모든 사용자 스토리를 차단합니다.
- US1은 Phase 2 완료 후 독립적으로 MVP 검증할 수 있습니다.
- US2는 US1의 프로세스 카드가 필요합니다.
- US3와 US4는 Phase 2 완료 후 시작할 수 있으며, 페이지 보기 상태를 공유하므로 같은 파일의 병렬 수정은 금지합니다.
- Phase 7은 모든 사용자 스토리 완료 후 수행합니다.

## 병렬화 가능 지점

- T002와 T003
- T005와 T006
- T009, T010, T011
- T015와 T016
- T021과 T022
- T025
- T028과 T029

## 구현 전략

1. 공통 타입·fixture·계약 adapter를 준비합니다.
2. US1 대시보드만 먼저 완성하고 독립 검증합니다.
3. US2 제어 흐름을 추가하고 실제 상태와 요청 상태의 분리를 검증합니다.
4. US3 그리드 편집과 US4 검색을 추가합니다.
5. 다국어·접근성·빌드·회귀 검증을 수행합니다.
