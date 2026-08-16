# 작업 목록: 라이브 메인 화면

**입력**: `/specs/002-live-main-view/`의 설계 문서

**사전 조건**: spec.md, plan.md 필수. research.md, data-model.md, contracts/, quickstart.md를 함께 참조한다.

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

**테스트**: 현재 기능은 이미 상당 부분 구현되어 있으므로, 작업은 구현 보강과 회귀 검증을 함께 포함한다.

## Phase 1: 준비

**목적**: 002 산출물과 현재 코드 기준을 맞춘다.

- [ ] T001 `specs/002-live-main-view/spec.md`와 `specs/002-live-main-view/plan.md`의 기능 경계가 003 화면 확대 보기와 중복되지 않는지 확인한다.
- [ ] T002 [P] `specs/002-live-main-view/contracts/layout-contract.md`의 layout shape와 `frontend/src/types/layout.ts`가 일치하는지 확인한다.
- [ ] T003 [P] `specs/002-live-main-view/contracts/focus-entry-contract.md`의 query 계약과 `frontend/src/components/Grid/GridContainer.tsx`의 확대 진입 로직이 일치하는지 확인한다.
- [ ] T004 `frontend/package.json`의 테스트/빌드 명령을 확인하고 quickstart 검증 명령과 일치시키다.

---

## Phase 2: 기반 작업

**목적**: 모든 사용자 스토리에서 공유하는 layout, camera fixture, 상태 변경 helper를 안정화한다.

- [ ] T005 [P] `frontend/src/mocks/liveMonitoring.ts`에서 Production Line A/B mock layout과 camera fixture가 002 명세의 기본 데이터와 일치하는지 검증한다.
- [ ] T006 [P] `frontend/src/services/layoutService.ts`에서 API 실패 시 fallback layout이 사용자 조작을 막지 않는지 검증한다.
- [ ] T007 [P] `frontend/src/hooks/layoutMutations.ts`와 `frontend/src/store/slices/layoutSlice.ts`에서 active tab/subtab fallback 규칙을 점검한다.
- [ ] T008 [P] `frontend/src/components/Grid/useGridDnd.ts`에서 이동, swap, 제거 helper가 row/col 규칙을 지키는지 검증한다.
- [ ] T009 `frontend/src/components/Grid/GridContainer.tsx`에서 현재 active subtab 기준으로 used camera ids와 cellsData를 계산하는지 확인한다.

**체크포인트**: layout과 camera position 기반이 각 사용자 스토리에서 독립적으로 사용할 수 있어야 한다.

---

## Phase 3: 사용자 스토리 1 - 공정/세부공정별 영상 그리드 보기 (우선순위: P1) MVP

**목표**: 사용자가 공정탭과 세부공정탭을 전환하며 해당 그리드의 카메라 영상을 확인한다.

**관련 요구사항**: FR-001, FR-002, FR-004, FR-012, FR-013, FR-017

**독립 테스트**: 공정탭/세부공정탭 전환 후 선택된 탭의 카메라 타일이 일정한 비율로 표시되고, 타이틀/상태점이 영상 바깥 header에 표시되는지 확인한다.

### 사용자 스토리 1 테스트

- [ ] T010 [P] [US1] `frontend/src/components/Grid/__tests__/DraggableCell.test.tsx`에서 타일 header가 영상 영역을 침범하지 않고 `online` 텍스트 중복이 없는지 검증한다.
- [ ] T011 [P] [US1] `frontend/src/mocks/__tests__/liveMonitoring.test.ts`에서 mock layout의 공정탭/세부공정탭/카메라 수를 검증한다.

### 사용자 스토리 1 구현

- [ ] T012 [US1] `frontend/src/pages/Live.tsx`에서 mock layout 초기화와 `GridContainer` 렌더링 흐름을 확인한다.
- [ ] T013 [US1] `frontend/src/components/Grid/TabsBar.tsx`와 `frontend/src/components/Grid/SubTabsBar.tsx`에서 활성/비활성 탭 표시와 pointer cursor를 확인한다.
- [ ] T014 [US1] `frontend/src/components/Grid/DraggableCell.tsx`에서 카메라 title/status header와 video body 분리 구조를 유지한다.
- [ ] T015 [US1] `frontend/src/components/Grid/DraggableCell.tsx`에서 Add Camera 셀과 영상 타일이 같은 aspect ratio를 사용하는지 확인한다.
- [ ] T016 [US1] `cd frontend; npm test -- --run DraggableCell liveMonitoring`을 실행해 US1 회귀를 확인한다.

**체크포인트**: 사용자는 라이브 메인 화면에서 선택한 공정/세부공정의 영상 그리드를 안정적으로 볼 수 있다.

---

## Phase 4: 사용자 스토리 2 - 그리드 구성과 카메라 배치 편집 (우선순위: P2)

**목표**: 사용자가 그리드 크기를 바꾸고 빈 셀에 카메라를 추가하거나 카메라 위치를 이동한다.

**관련 요구사항**: FR-005, FR-006, FR-007, FR-008, FR-016

**독립 테스트**: 그리드 크기 변경, Add Camera, used camera filtering, drag/drop 이동과 swap이 현재 세부공정탭에만 반영되는지 확인한다.

### 사용자 스토리 2 테스트

- [ ] T017 [P] [US2] `frontend/src/components/Grid/__tests__/useGridDnd.test.ts`에서 cell 좌표, 이동, swap, 제거 helper를 검증한다.
- [ ] T018 [P] [US2] `frontend/src/hooks/__tests__/layoutMutations.test.ts`에서 grid config와 camera positions가 선택된 세부공정탭에만 반영되는지 검증한다.
- [ ] T019 [P] [US2] 필요 시 `frontend/src/components/Grid/__tests__/CameraSelector.test.tsx`를 추가해 used camera filtering과 검색/빈 상태를 검증한다.

### 사용자 스토리 2 구현

- [ ] T020 [US2] `frontend/src/components/Grid/LayoutSelector.tsx`에서 선택 가능한 grid option과 현재 grid label 표시를 확인한다.
- [ ] T021 [US2] `frontend/src/components/Grid/CameraSelector.tsx`에서 사용 중인 카메라 제외, 검색, 빈 상태 처리를 확인한다.
- [ ] T022 [US2] `frontend/src/components/Grid/GridContainer.tsx`에서 `placeCameraAtCell`, `moveCameraPosition`, `removeCameraPosition` 연결을 확인한다.
- [ ] T023 [US2] 그리드 크기 변경 시 화면 밖 camera position 처리 정책이 필요한지 `frontend/src/components/Grid/useGridLayout.ts`와 `frontend/src/store/slices/layoutSlice.ts`에서 점검한다.
- [ ] T024 [US2] `cd frontend; npm test -- --run useGridDnd layoutMutations`을 실행해 US2 회귀를 확인한다.

**체크포인트**: 사용자는 현재 세부공정탭의 영상 배치를 독립적으로 편집할 수 있다.

---

## Phase 5: 사용자 스토리 3 - 탭과 카메라 타일 관리 (우선순위: P3)

**목표**: 사용자가 탭 구조와 카메라 타일 표시명을 운영 현장에 맞게 조정한다.

**관련 요구사항**: FR-003, FR-009, FR-010, FR-011, FR-017

**독립 테스트**: 탭 추가/삭제/정렬, 카메라 Remove, Rename dialog와 제목 반영을 확인한다.

### 사용자 스토리 3 테스트

- [ ] T025 [P] [US3] `frontend/src/components/Grid/__tests__/DraggableCell.test.tsx`에서 Rename dialog, Save, 빈 제목 방지, Remove 메뉴를 검증한다.
- [ ] T026 [P] [US3] 필요 시 `frontend/src/components/Grid/__tests__/TabsBar.test.tsx`와 `frontend/src/components/Grid/__tests__/SubTabsBar.test.tsx`를 추가해 탭 추가/삭제/정렬을 검증한다.

### 사용자 스토리 3 구현

- [ ] T027 [US3] `frontend/src/components/Grid/TabsBar.tsx`에서 공정탭 추가/삭제/정렬 interaction과 마지막 탭 삭제 방지 흐름을 확인한다.
- [ ] T028 [US3] `frontend/src/components/Grid/SubTabsBar.tsx`에서 세부공정탭 추가/삭제/정렬 interaction과 마지막 세부탭 삭제 방지 흐름을 확인한다.
- [ ] T029 [US3] `frontend/src/components/Grid/DraggableCell.tsx`에서 context menu의 Rename/Remove 동작과 theme-aware dialog 스타일을 확인한다.
- [ ] T030 [US3] `frontend/src/components/Grid/GridContainer.tsx`에서 Rename override가 현재 카메라 표시명에 반영되는지 확인한다.
- [ ] T031 [US3] `cd frontend; npm test -- --run DraggableCell layoutSlice`를 실행해 US3 회귀를 확인한다.

**체크포인트**: 사용자는 라이브 메인 화면의 탭과 카메라 타일을 업무 용어에 맞게 관리할 수 있다.

---

## Phase 6: 사용자 스토리 4 - 화면 확대 보기로 연결 (우선순위: P3)

**목표**: 사용자가 현재 그리드 맥락을 유지한 채 특정 카메라를 003 화면 확대 보기로 연다.

**관련 요구사항**: FR-014, FR-015

**독립 테스트**: 확대 버튼 실행 시 현재 세부공정탭의 camera ids와 Rename title override가 route query에 포함되는지 확인한다.

### 사용자 스토리 4 테스트

- [ ] T032 [P] [US4] `frontend/src/components/Grid/__tests__/GridContainer.focus.test.tsx`에서 현재 세부공정탭의 camera ids만 전달되는지 검증한다.
- [ ] T033 [P] [US4] `frontend/src/components/Grid/__tests__/GridContainer.focus.test.tsx`에서 Rename title override가 focus route query에 포함되는지 검증한다.

### 사용자 스토리 4 구현

- [ ] T034 [US4] `frontend/src/components/Grid/DraggableCell.tsx`에서 확대 버튼이 hover/focus 상태에서 드러나고 accessible name을 제공하는지 확인한다.
- [ ] T035 [US4] `frontend/src/components/Grid/GridContainer.tsx`에서 `mode`, `tabId`, `subTabId`, `cameraIds`, `cameraNames` query 생성이 `contracts/focus-entry-contract.md`와 일치하는지 확인한다.
- [ ] T036 [US4] `cd frontend; npm test -- --run GridContainer.focus`를 실행해 US4 회귀를 확인한다.

**체크포인트**: 002에서 003으로 이동할 때 현재 그리드 맥락이 누락되거나 과포함되지 않는다.

---

## Phase 7: 마무리 및 공통 검증

- [ ] T037 [P] `specs/002-live-main-view/quickstart.md`의 수동 검증 절차가 실제 화면과 일치하는지 확인한다.
- [ ] T038 [P] `specs/002-live-main-view/contracts/`의 계약이 spec.md와 plan.md 요구사항을 모두 추적하는지 확인한다.
- [ ] T039 theme1, theme2, theme3에서 공정탭, 세부공정탭, 타일 header, Rename dialog, Add Camera 셀의 대비를 수동 확인한다.
- [ ] T040 `cd frontend; npm test -- --run`을 실행해 전체 frontend test를 확인한다.
- [ ] T041 `cd frontend; npm run build`를 실행해 production build를 확인한다.

## 의존성 및 실행 순서

### Phase 의존성

- **Phase 1 준비**: 즉시 시작 가능
- **Phase 2 기반 작업**: Phase 1 이후 시작
- **US1**: Phase 2 이후 시작, MVP
- **US2**: Phase 2 이후 시작 가능하나 US1의 기본 그리드 구조 확인 후 진행 권장
- **US3**: Phase 2 이후 시작 가능
- **US4**: US1과 003 route 계약 확인 후 진행
- **마무리**: 모든 사용자 스토리 확인 후 진행

### 사용자 스토리 의존성

- **US1(P1)**: 기본 라이브 메인 화면으로 MVP 범위
- **US2(P2)**: US1의 그리드 표시 구조 위에서 편집 기능 검증
- **US3(P3)**: US1/US2와 독립적으로 일부 병렬 가능
- **US4(P3)**: 003 화면 확대 보기 계약과 연결

## 병렬 실행 예시

```text
Task: "T002 layout contract 확인"
Task: "T003 focus entry contract 확인"
Task: "T005 liveMonitoring fixture 검증"
Task: "T008 useGridDnd helper 검증"
```

```text
Task: "T017 useGridDnd test 확인"
Task: "T018 layoutMutations test 확인"
Task: "T019 CameraSelector test 필요 여부 확인"
```

## 구현 전략

### MVP 우선

1. Phase 1, Phase 2 완료
2. US1 완료
3. 전체 화면에서 공정/세부공정별 영상 그리드가 안정적으로 보이는지 검증

### 점진적 전달

1. US1: 기본 라이브 그리드 보기
2. US2: 그리드 구성과 카메라 배치 편집
3. US3: 탭/타일 관리와 Rename
4. US4: 003 화면 확대 보기 진입 계약
5. 공통 theme/build/test 검증

### Mock-First 전략

1. 실제 backend 저장 구현 전까지 mock layout과 fallback service를 기준으로 검증한다.
2. route와 layout 계약은 후속 backend 연동이 가능하도록 문서로 고정한다.
3. backend/API/DB 작업은 이 tasks.md에서 직접 구현하지 않는다.

