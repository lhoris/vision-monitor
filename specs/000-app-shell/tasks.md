# 작업 목록: 앱 기본 뼈대

**입력**: `/specs/000-app-shell/`의 설계 문서

**사전 조건**: spec.md, plan.md 필수. contracts/, quickstart.md를 함께 참조한다.

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

## Phase 1: 준비

- [X] T001 `specs/000-app-shell/spec.md`와 `specs/000-app-shell/plan.md`의 공통 layout/관리자 메뉴 경계가 001/002/003 상세 기능과 중복되지 않는지 확인한다.
- [X] T002 [P] `specs/000-app-shell/contracts/app-route-contract.md`와 `frontend/src/App.tsx`의 route 분기가 일치하는지 확인한다.
- [X] T003 [P] `specs/000-app-shell/contracts/navigation-contract.md`와 `frontend/src/components/Layout/Sidebar.tsx`의 메뉴 구성이 일치하는지 확인한다.
- [X] T004 [P] `specs/000-app-shell/contracts/ui-shell-state-contract.md`와 `frontend/src/store/slices/uiSlice.ts`의 state shape가 일치하는지 확인한다.
- [X] T005 [P] `specs/000-app-shell/contracts/admin-menu-contract.md`의 관리자 메뉴와 원문 이미지 해석 기준이 일치하는지 확인한다.

---

## Phase 2: 기반 작업

- [X] T006 [P] `frontend/src/components/Layout/AppLayout.tsx`에서 Header, Sidebar, main content 구조가 모든 보호 화면에 공통 적용되는지 확인한다.
- [X] T007 [P] `frontend/src/App.tsx`에서 인증 전/후 route fallback이 계약과 일치하는지 확인한다.
- [X] T008 [P] `frontend/src/store/slices/uiSlice.ts`에서 sidebar, theme, notification, modal reducer를 검증한다.
- [X] T009 `frontend/src/App.tsx`에서 themeMode 변경 시 document root theme attribute와 dark class가 반영되는지 확인한다.

---

## Phase 3: 사용자 스토리 1 - 로그인 후 공통 앱 레이아웃 보기 (우선순위: P1) MVP

**목표**: 인증된 사용자가 공통 앱 레이아웃 안에서 보호 화면을 사용한다.

**관련 요구사항**: FR-001, FR-002, FR-003, FR-014, FR-015

**독립 테스트**: 인증 상태에서 보호 route는 AppLayout을 표시하고, 미인증 상태에서는 로그인으로 이동한다.

- [X] T010 [P] [US1] 필요 시 `frontend/src/__tests__/AppRoutes.test.tsx`를 추가해 인증 전 `/live` 접근이 `/login`으로 이동하는지 검증한다.
- [X] T011 [P] [US1] 필요 시 `frontend/src/components/Layout/__tests__/AppLayout.test.tsx`를 추가해 Header/main 구조를 검증한다.
- [X] T012 [US1] `frontend/src/components/Layout/AppLayout.tsx`의 main overflow와 full-height 구조를 확인한다.
- [X] T013 [US1] `frontend/src/App.tsx`의 unknown protected route fallback을 확인한다.

---

## Phase 4: 사용자 스토리 2 - 사이드바 일반 메뉴로 주요 화면 이동 (우선순위: P2)

**목표**: 사용자가 사이드바로 주요 업무 화면을 이동한다.

**관련 요구사항**: FR-004, FR-010, FR-011, FR-012, FR-013, FR-016, FR-017

**독립 테스트**: sidebar toggle, overlay close, nav item route 이동, active menu 표시, 화면 수정 메뉴 미노출을 확인한다.

- [X] T014 [P] [US2] 필요 시 `frontend/src/components/Layout/__tests__/Sidebar.test.tsx`를 추가해 일반 메뉴 목록과 active 상태를 검증한다.
- [X] T015 [US2] `frontend/src/components/Layout/Header.tsx`에서 sidebar toggle button이 `toggleSidebar`를 호출하는지 확인한다.
- [X] T016 [US2] `frontend/src/components/Layout/Sidebar.tsx`에서 overlay 클릭 close와 작은 화면 메뉴 선택 close를 확인한다.
- [X] T017 [US2] `frontend/src/components/Layout/Sidebar.tsx`에서 Live/Playback/Events 메뉴 path와 label key를 확인한다.
- [X] T018 [US2] `frontend/src/components/Layout/Sidebar.tsx`에서 화면 수정, 공정 추가, 세부 공정 수정, 화면 배치 수정 메뉴가 노출되지 않는지 확인한다.

---

## Phase 5: 사용자 스토리 3 - 관리자 메뉴 구조 확인 (우선순위: P2)

**목표**: 관리자가 통신/모델 수정과 접속 권한 관리 메뉴를 확인한다.

**관련 요구사항**: FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-024

**독립 테스트**: 관리자 메뉴 그룹에 최신 하위 메뉴가 표시되고 화면 수정 계열 메뉴는 제외되는지 확인한다.

- [X] T019 [P] [US3] 필요 시 `frontend/src/components/Layout/__tests__/Sidebar.admin.test.tsx`를 추가해 관리자 권한 사용자에게 관리자 메뉴 그룹이 표시되는지 검증한다.
- [X] T020 [US3] `frontend/src/components/Layout/Sidebar.tsx`에서 통신 및 모델 수정 그룹과 하위 메뉴를 추가한다.
- [X] T021 [US3] `frontend/src/components/Layout/Sidebar.tsx`에서 접속 권한 관리 그룹과 사용자/역할/권한/메뉴 접근 하위 메뉴를 추가한다.
- [X] T022 [US3] `frontend/src/App.tsx`에서 관리자 메뉴 route placeholder 또는 fallback 정책을 확인한다.
- [X] T023 [US3] `frontend/src/i18n` 관련 translation 리소스에 관리자 메뉴 label key를 추가한다.
- [X] T024 [US3] `frontend/src/components/Layout/Sidebar.tsx`에서 관리자 권한이 없는 사용자에게 관리자 메뉴와 하위 메뉴가 렌더링되지 않도록 처리한다.

---

## Phase 6: 사용자 스토리 4 - 상단바의 공통 도구 사용 (우선순위: P3)

**목표**: 사용자가 테마, 언어, 사용자 메뉴, 로그아웃을 상단바에서 사용한다.

**관련 요구사항**: FR-005, FR-006, FR-007, FR-008, FR-009

**독립 테스트**: theme/language/profile 메뉴가 열리고, 바깥 클릭으로 닫히며, logout이 인증 상태 해제를 유발하는지 확인한다.

- [X] T025 [P] [US4] `frontend/src/store/slices/__tests__/uiSlice.test.ts`에서 theme/sidebar reducer 검증을 확인한다.
- [X] T026 [P] [US4] 필요 시 `frontend/src/components/Layout/__tests__/Header.test.tsx`를 추가해 theme/language/profile menu interaction을 검증한다.
- [X] T027 [US4] `frontend/src/components/Layout/Header.tsx`에서 theme swatch/label과 language menu label이 표시되는지 확인한다.
- [X] T028 [US4] `frontend/src/components/Layout/Header.tsx`에서 logout이 `logoutUser`와 `/login` 이동을 실행하는지 확인한다.
- [X] T029 [US4] `frontend/src/components/Layout/Header.tsx`에서 바깥 클릭으로 열린 메뉴가 닫히는지 확인한다.

---

## Phase 7: 마무리 및 공통 검증

- [X] T030 [P] `specs/000-app-shell/quickstart.md`의 수동 검증 절차가 실제 화면과 일치하는지 확인한다.
- [X] T031 [P] `specs/000-app-shell/contracts/`의 계약이 spec.md와 plan.md 요구사항을 모두 추적하는지 확인한다.
- [X] T032 theme1, theme2, theme3에서 Header, Sidebar, profile menu, navigation text 대비를 수동 확인한다.
- [X] T033 `cd frontend; npm test -- --run`을 실행해 전체 frontend test를 확인한다.
- [X] T034 `cd frontend; npm run build`를 실행해 production build를 확인한다.

## 의존성 및 실행 순서

- Phase 1 -> Phase 2 -> US1 -> US2/US3 -> US4 -> 마무리 순서로 진행한다.
- US1은 MVP이며, 공통 layout이 깨지면 001/002/003 화면 접근도 검증할 수 없다.
- US2, US3, US4는 Phase 2 이후 병렬 검토가 가능하다.

## 병렬 실행 예시

```text
Task: "T002 app route contract 확인"
Task: "T003 navigation contract 확인"
Task: "T004 ui shell state contract 확인"
Task: "T005 admin menu contract 확인"
```

```text
Task: "T014 Sidebar 일반 메뉴 test 필요 여부 확인"
Task: "T019 Sidebar 관리자 메뉴 test 필요 여부 확인"
Task: "T025 Header test 필요 여부 확인"
```

## 구현 전략

1. 공통 AppLayout과 route guard를 먼저 고정한다.
2. Sidebar 일반 메뉴에서 화면 수정 계열 메뉴를 제외한다.
3. Sidebar 관리자 메뉴 구조를 추가한다.
4. Header 공통 도구를 검증한다.
5. 전체 test/build로 001/002/003 회귀를 확인한다.
