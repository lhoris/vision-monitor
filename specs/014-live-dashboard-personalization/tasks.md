# 작업 목록: 라이브 대시보드 개인화

**입력**: `/specs/014-live-dashboard-personalization/`의 설계 문서

**사전 조건**: spec.md, plan.md 필수. research.md, data-model.md, contracts/, quickstart.md를 함께 참조한다.

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

**테스트**: 사용자별 저장/복원, backend `/layouts/me`, frontend autosave, 실패 상태 처리가 포함되므로 backend service/controller 테스트와 frontend service/hook/slice 테스트 및 build 검증을 포함한다.

**구성 방식**: 작업은 사용자 스토리별로 묶고, 각 사용자 스토리가 독립 구현 및 독립 검증 가능하도록 작성한다.

> 이 문서는 한국어로 작성한다. 기술 용어, API 이름, 파일 경로, 코드 식별자, 명령어는 원문 또는 영문 표기를 유지할 수 있다.
> 작업 목록은 "어떤 파일을 어떤 순서로 변경할 것인가"를 정의한다. spec.md/plan.md에 없는 새 요구사항을 tasks.md에서 추가하지 않는다.

## Phase 1: 준비

**목적**: 기존 002 라이브 화면과 014 개인화 설계의 경계를 확인하고 구현 기준을 고정한다.

- [X] T001 `specs/014-live-dashboard-personalization/spec.md`, `specs/014-live-dashboard-personalization/plan.md`, `specs/014-live-dashboard-personalization/contracts/layout-personalization-api-contract.md`에서 `/api/layouts/me` snapshot 저장 경계를 확인한다.
- [X] T002 [P] `frontend/src/pages/Live.tsx`, `frontend/src/services/layoutService.ts`, `frontend/src/store/slices/layoutSlice.ts`에서 현재 mock layout 주입과 userId 고정 흐름을 확인한다.
- [X] T003 [P] `backend/src/main/java/com/vision/controller/LayoutController.java`, `backend/src/main/java/com/vision/service/LayoutService.java`, `backend/src/main/java/com/vision/repository/LayoutRepository.java`에서 기존 TODO와 repository 기능을 확인한다.
- [X] T004 [P] `backend/src/main/resources/db/migration/V002__add_user_layouts.sql`와 최신 migration 번호를 확인해 layout 보강 migration 번호를 확정한다.
- [X] T005 [P] `frontend/src/components/Grid/GridContainer.tsx`, `frontend/src/hooks/useLayout.ts`, `frontend/src/hooks/layoutMutations.ts`에서 저장 호출을 연결할 layout 변경 확정 지점을 확인한다.

---

## Phase 2: 기반 작업

**목적**: 모든 사용자 스토리에서 공유하는 layout 계약, normalize, 저장 상태, backend owner 기반을 준비한다.

**중요**: 이 Phase가 끝나기 전에는 사용자 스토리 구현을 시작하지 않는다.

- [X] T006 [P] `backend/src/main/resources/db/migration/V009__enforce_single_layout_per_user.sql`에서 `layouts.user_id` 단일 layout 보장 제약 또는 중복 정리 정책을 추가한다.
- [X] T007 `backend/src/main/java/com/vision/repository/UserAccountRepository.java`에서 `X-Actor-Username` 기반 현재 사용자 조회 method가 layout service에서 재사용 가능한지 확인하거나 보강한다.
- [X] T008 `backend/src/main/java/com/vision/dto/LayoutDto.java`에서 frontend `Layout` snapshot shape를 JSON string 변환 없이 받을 수 있는 request/response 구조 필요 여부를 확정하고 보강한다.
- [X] T009 [P] `frontend/src/types/layout.ts`에 `temporarySourceId`, `displayName`, `source`, `LayoutPersistStatus` 등 014 계약에 필요한 optional 타입을 추가한다.
- [X] T010 [P] `frontend/src/services/__tests__/layoutService.test.ts`에서 `/layouts/me` 조회/저장 성공과 실패 테스트 fixture를 준비한다.
- [X] T011 [P] `backend/src/test/java/com/vision/service/LayoutServiceTest.java`에서 현재 사용자 fixture, layout fixture, repository mock 기반을 준비한다.
- [X] T012 [P] `backend/src/test/java/com/vision/controller/LayoutControllerTest.java`에서 `/api/layouts/me` MockMvc 테스트 기반을 준비한다.
- [X] T013 `frontend/src/store/slices/layoutSlice.ts`에 저장 상태와 user change 초기화에 필요한 공통 state/action 구조를 추가한다.

**체크포인트**: `/layouts/me` 계약, layout 타입, 저장 상태, 현재 사용자 기반이 준비되어 각 사용자 스토리를 독립 구현할 수 있어야 한다.

---

## Phase 3: 사용자 스토리 1 - 내 대시보드 복원 (우선순위: P1) MVP

**목표**: 사용자가 로그인 후 라이브 대시보드에 진입하면 자신의 마지막 저장 layout 또는 기본 layout을 확인한다.

**관련 요구사항**: FR-001, FR-002, FR-003, FR-010, FR-014, UX-001, UX-004, SC-001, SC-004

**독립 테스트**: 저장된 layout이 있는 admin 계정은 저장 layout을 보고, 저장 layout이 없는 사용자는 기본 layout을 보며 즉시 편집할 수 있다.

### 사용자 스토리 1 테스트

- [X] T014 [P] [US1] `backend/src/test/java/com/vision/service/LayoutServiceTest.java`에서 현재 사용자 layout 조회 성공과 layout 없음 null 응답을 검증한다.
- [X] T015 [P] [US1] `backend/src/test/java/com/vision/controller/LayoutControllerTest.java`에서 `GET /api/layouts/me` 성공 응답과 actor 없음 실패 응답 shape를 검증한다.
- [X] T016 [P] [US1] `frontend/src/services/__tests__/layoutService.test.ts`에서 `getMyLayout()`이 `/layouts/me`를 호출하고 layout 없음/fallback을 처리하는지 검증한다.
- [X] T017 [P] [US1] `frontend/src/store/slices/__tests__/layoutSlice.test.ts`에서 fetched layout의 active tab normalize와 restore failure 상태를 검증한다.

### 사용자 스토리 1 구현

- [X] T018 [US1] `backend/src/main/java/com/vision/service/LayoutService.java`에서 `getMyLayout(String actorUsername)` 조회 로직과 actor 사용자 검증을 구현한다.
- [X] T019 [US1] `backend/src/main/java/com/vision/controller/LayoutController.java`에서 `GET /api/layouts/me` endpoint를 구현한다.
- [X] T020 [US1] `frontend/src/services/layoutService.ts`에 `getMyLayout()`을 추가하고 기존 `getUserLayout(userId)` fallback과의 사용 경계를 정리한다.
- [X] T021 [US1] `frontend/src/store/slices/layoutSlice.ts`에서 `fetchMyLayout` thunk, 복원 성공/실패 상태, 기본 layout fallback 반영을 구현한다.
- [X] T022 [US1] `frontend/src/pages/Live.tsx`에서 고정 `userId=1` mock fulfilled 주입을 제거하고 현재 인증 사용자 기준 `fetchMyLayout`을 호출한다.
- [X] T023 [US1] `frontend/src/components/Grid/GridContainer.tsx`에서 `userId` prop 고정 의존을 제거하거나 현재 layout owner 기준으로 정리한다.
- [X] T024 [US1] `cd backend; mvn test -Dtest=LayoutServiceTest,LayoutControllerTest`를 실행해 US1 backend 복원 경계를 확인한다.
- [X] T025 [US1] `cd frontend; npm test -- --run layoutService layoutSlice`를 실행해 US1 frontend 복원 경계를 확인한다.

**체크포인트**: 내 layout 복원 MVP가 동작하고 신규 사용자 기본 layout 진입이 가능해야 한다.

---

## Phase 4: 사용자 스토리 2 - 내 구성 저장 (우선순위: P1)

**목표**: 사용자가 탭, 그리드, 카메라 배치, Rename, 직접 영상 주소를 변경하면 전체 layout snapshot이 내 구성으로 저장된다.

**관련 요구사항**: FR-004, FR-005, FR-006, FR-007, FR-008, FR-012, FR-013, UX-002, UX-003, UX-007, SC-002, SC-007

**독립 테스트**: 사용자가 layout을 변경한 뒤 새로고침하거나 같은 계정으로 다시 로그인하면 변경 결과가 유지된다.

### 사용자 스토리 2 테스트

- [X] T026 [P] [US2] `backend/src/test/java/com/vision/service/LayoutServiceTest.java`에서 신규 layout 생성, 기존 layout 갱신, request userId 무시를 검증한다.
- [X] T027 [P] [US2] `backend/src/test/java/com/vision/controller/LayoutControllerTest.java`에서 `PUT /api/layouts/me` 성공과 invalid layout 실패 응답 shape를 검증한다.
- [X] T028 [P] [US2] `frontend/src/services/__tests__/layoutService.test.ts`에서 `saveMyLayout(layout)`이 `/layouts/me` PUT을 호출하고 저장 실패를 반환하는지 검증한다.
- [X] T029 [P] [US2] `frontend/src/hooks/__tests__/usePersistLayout.test.tsx`에서 layout 변경 debounce 저장, 같은 snapshot 중복 저장 방지, 저장 실패 state 유지를 검증한다.

### 사용자 스토리 2 구현

- [X] T030 [US2] `backend/src/main/java/com/vision/service/LayoutService.java`에서 `saveMyLayout(String actorUsername, LayoutDto layoutDto)` upsert와 owner 강제 지정 로직을 구현한다.
- [X] T031 [US2] `backend/src/main/java/com/vision/controller/LayoutController.java`에서 `PUT /api/layouts/me` endpoint를 구현한다.
- [X] T032 [US2] `backend/src/main/java/com/vision/service/LayoutService.java`에서 최소 tabs, activeTab, activeSubTab, gridConfig 기본 normalize를 구현한다.
- [X] T033 [US2] `frontend/src/services/layoutService.ts`에 `saveMyLayout(layout)`을 추가하고 저장 실패 fallback을 화면 state rollback 없이 처리하도록 정리한다.
- [X] T034 [US2] `frontend/src/hooks/usePersistLayout.ts`를 추가해 debounce, 중복 snapshot 비교, pending save 취소, retry 진입점을 구현한다.
- [X] T035 [US2] `frontend/src/store/slices/layoutSlice.ts`에서 `saveMyLayout` thunk 또는 persist action을 연결하고 저장 중/성공/실패 상태를 반영한다.
- [X] T036 [US2] `frontend/src/pages/Live.tsx`에서 `usePersistLayout`을 연결해 layout 변경 후 autosave가 작동하도록 한다.
- [X] T037 [US2] `frontend/src/components/Grid/GridContainer.tsx`에서 카메라 추가/삭제/드롭/Rename/직접 영상 주소 추가 후 layout 변경이 저장 대상 snapshot에 포함되는지 확인하고 보강한다.
- [X] T038 [US2] `frontend/src/hooks/useLayout.ts`에서 탭/세부탭/그리드 변경 후 저장 대상 layout이 일관되게 갱신되는지 확인하고 보강한다.
- [X] T039 [US2] `cd backend; mvn test -Dtest=LayoutServiceTest,LayoutControllerTest`를 실행해 US2 backend 저장 경계를 확인한다.
- [X] T040 [US2] `cd frontend; npm test -- --run layoutService usePersistLayout layoutSlice`를 실행해 US2 frontend autosave 경계를 확인한다.

**체크포인트**: 전체 layout snapshot 저장이 동작하고, 추가/삭제/이동/Rename/직접 영상 주소가 새로고침 뒤에도 유지되어야 한다.

---

## Phase 5: 사용자 스토리 3 - 사용자별 구성 분리 (우선순위: P2)

**목표**: admin, tester, tester1이 서로 다른 라이브 대시보드 구성을 저장하고 복원한다.

**관련 요구사항**: FR-001, FR-009, FR-011, FR-015, UX-005, SC-003

**독립 테스트**: 서로 다른 계정이 서로 다른 layout을 저장한 뒤 계정 전환을 해도 각자의 구성만 보인다.

### 사용자 스토리 3 테스트

- [X] T041 [P] [US3] `backend/src/test/java/com/vision/service/LayoutServiceTest.java`에서 두 사용자 layout 저장/조회 격리와 타 사용자 layout 덮어쓰기 방지를 검증한다.
- [X] T042 [P] [US3] `frontend/src/store/slices/__tests__/layoutSlice.test.ts`에서 logout/user change 시 layout state와 persist status 초기화를 검증한다.
- [X] T043 [P] [US3] `frontend/src/pages/__tests__/Live.personalization.test.tsx`에서 사용자별 layout fetch와 이전 사용자 layout 미노출을 검증한다.

### 사용자 스토리 3 구현

- [X] T044 [US3] `backend/src/main/java/com/vision/repository/LayoutRepository.java`에서 사용자별 단일 layout 조회/upsert에 필요한 repository method를 확정하거나 보강한다.
- [X] T045 [US3] `backend/src/main/java/com/vision/service/LayoutService.java`에서 actor별 layout 격리와 중복 layout 정리 정책을 적용한다.
- [X] T046 [US3] `frontend/src/store/slices/layoutSlice.ts`에서 logout 또는 auth user 변경 시 layout state, persist state, pending request token을 초기화한다.
- [X] T047 [US3] `frontend/src/hooks/usePersistLayout.ts`에서 사용자 변경 시 이전 사용자의 pending save 결과를 무시하도록 guard를 추가한다.
- [X] T048 [US3] `frontend/src/pages/Live.tsx`에서 현재 auth user가 바뀌면 해당 사용자 layout을 새로 조회하도록 dependency를 정리한다.
- [X] T049 [US3] `cd backend; mvn test -Dtest=LayoutServiceTest`를 실행해 사용자별 backend 격리를 확인한다.
- [X] T050 [US3] `cd frontend; npm test -- --run layoutSlice Live.personalization usePersistLayout`를 실행해 사용자 전환 회귀를 확인한다.

**체크포인트**: 계정 전환 시 이전 사용자의 layout이 노출되거나 저장되지 않아야 한다.

---

## Phase 6: 사용자 스토리 4 - 안전한 실패와 기본값 복구 (우선순위: P3)

**목표**: 저장/복원 실패나 깨진 layout 데이터가 있어도 사용자가 라이브 대시보드 업무를 계속할 수 있다.

**관련 요구사항**: FR-003, FR-012, FR-013, FR-014, UX-002, UX-003, UX-006, SC-005, SC-006

**독립 테스트**: 복원 실패 시 기본 layout이 표시되고, 저장 실패 시 현재 화면 변경이 유지되며 실패 상태가 표시된다.

### 사용자 스토리 4 테스트

- [X] T051 [P] [US4] `frontend/src/hooks/__tests__/usePersistLayout.test.tsx`에서 저장 실패 후 화면 state 유지와 재시도 동작을 검증한다.
- [X] T052 [P] [US4] `frontend/src/store/slices/__tests__/layoutSlice.test.ts`에서 깨진 activeTab/activeSubTab/tabs 없는 layout normalize를 검증한다.
- [X] T053 [P] [US4] `frontend/src/pages/__tests__/Live.personalization.test.tsx`에서 복원 실패 시 기본 layout과 오류 상태 표시를 검증한다.
- [X] T054 [P] [US4] `backend/src/test/java/com/vision/service/LayoutServiceTest.java`에서 invalid layout 저장 실패와 normalize 가능한 layout 보정을 검증한다.

### 사용자 스토리 4 구현

- [X] T055 [US4] `frontend/src/store/slices/layoutSlice.ts`에 layout normalize helper를 추가하거나 기존 active tab fallback을 깨진 layout 복구까지 확장한다.
- [X] T056 [US4] `frontend/src/components/Grid/LayoutPersistStatus.tsx`를 추가해 저장 중/저장됨/저장 실패/복원 실패 상태를 작게 표시한다.
- [X] T057 [US4] `frontend/src/pages/Live.tsx`에서 `LayoutPersistStatus`를 배치하고 theme1/theme2/theme3에서 읽히도록 연결한다.
- [X] T058 [US4] `frontend/src/hooks/usePersistLayout.ts`에서 저장 실패 후 retry와 다음 변경 시 재저장 흐름을 구현한다.
- [X] T059 [US4] `backend/src/main/java/com/vision/exception/GlobalExceptionHandler.java`에서 `INVALID_LAYOUT`, `LAYOUT_SAVE_FAILED`, `AUTH_REQUIRED` 응답 status와 shape를 정리한다.
- [X] T060 [US4] `cd frontend; npm test -- --run usePersistLayout layoutSlice Live.personalization`를 실행해 실패/복구 frontend 회귀를 확인한다.
- [X] T061 [US4] `cd backend; mvn test -Dtest=LayoutServiceTest,LayoutControllerTest`를 실행해 실패/복구 backend 회귀를 확인한다.

**체크포인트**: 저장/복원 실패가 발생해도 화면 조작 상태와 기본 감시 흐름이 유지되어야 한다.

---

## Phase 7: 마무리 및 공통 검증

**목적**: 014 개인화 구현과 기존 001/002 흐름의 전체 회귀를 확인한다.

- [X] T062 [P] `specs/014-live-dashboard-personalization/quickstart.md` 기준으로 API 검증 절차가 실제 `/api/layouts/me` 응답과 일치하는지 확인한다.
- [X] T063 [P] `specs/014-live-dashboard-personalization/contracts/layout-personalization-api-contract.md`와 실제 `LayoutController` 응답 shape가 일치하는지 확인한다.
- [X] T064 [P] `frontend/src/components/Grid/__tests__/GridContainer.focus.test.tsx` 또는 기존 002 테스트를 실행해 카메라 추가/삭제/이동/Rename/직접 영상 주소 흐름이 유지되는지 확인한다.
- [X] T065 `cd backend; mvn test`를 실행해 backend 전체 테스트를 확인한다.
- [X] T066 `cd frontend; npm test -- --run`을 실행해 frontend 전체 테스트를 확인한다.
- [X] T067 `cd frontend; npm run build`를 실행해 production build를 확인한다.
- [X] T068 `specs/014-live-dashboard-personalization/tasks.md`에 구현 결과와 남은 후속 보안 범위를 기록한다.

---

## 의존성 및 실행 순서

### Phase 의존성

- Phase 1 준비는 즉시 시작 가능하다.
- Phase 2 기반 작업은 모든 사용자 스토리를 차단한다.
- US1(P1) 복원은 MVP이며 Phase 2 완료 후 가장 먼저 구현한다.
- US2(P1) 저장은 US1의 조회/복원 경계 위에서 구현한다.
- US3(P2) 사용자별 격리는 US1/US2의 `/me` 저장/조회 흐름이 필요하다.
- US4(P3) 실패/복구는 US1/US2 저장/복원 흐름 위에서 보강한다.
- Phase 7은 US1~US4 완료 후 진행한다.

### 사용자 스토리 의존성

- **US1(P1)**: 내 대시보드 복원. 독립 MVP.
- **US2(P1)**: 내 구성 저장. US1의 `/me` 조회와 layout state 반영이 선행되면 독립 검증 가능.
- **US3(P2)**: 사용자별 구성 분리. US1/US2의 저장/조회 구현 필요.
- **US4(P3)**: 안전한 실패와 기본값 복구. 저장/복원 흐름 구현 후 보강.

### 병렬화 가능 지점

- T002~T005는 서로 다른 파일/검토 대상이라 병렬 가능하다.
- T006, T009, T010, T011, T012는 서로 다른 파일이라 병렬 가능하다.
- US1 테스트 T014~T017은 backend service, backend controller, frontend service, frontend slice로 나뉘어 병렬 가능하다.
- US2 테스트 T026~T029는 서로 다른 테스트 파일이라 병렬 가능하다.
- US3 테스트 T041~T043은 backend service, frontend slice, Live page 테스트로 병렬 가능하다.
- US4 테스트 T051~T054는 서로 다른 테스트 축이라 병렬 가능하다.

---

## 병렬 실행 예시

```text
Task: "T010 frontend layoutService /layouts/me 테스트 fixture 준비"
Task: "T011 backend LayoutServiceTest fixture 준비"
Task: "T012 backend LayoutControllerTest fixture 준비"
```

```text
Task: "T014 [US1] LayoutService 조회 테스트"
Task: "T015 [US1] LayoutController GET /me 테스트"
Task: "T016 [US1] frontend getMyLayout 테스트"
Task: "T017 [US1] layoutSlice restore 테스트"
```

```text
Task: "T026 [US2] backend save/upsert 테스트"
Task: "T028 [US2] frontend saveMyLayout 테스트"
Task: "T029 [US2] usePersistLayout debounce 테스트"
```

---

## 구현 전략

### MVP 우선

1. Phase 1과 Phase 2를 완료한다.
2. US1을 구현해 `GET /api/layouts/me`와 내 layout 복원을 완성한다.
3. 저장 layout이 없는 사용자는 기본 layout으로 라이브 화면에 진입할 수 있게 한다.
4. 이 시점에서 사용자별 복원 MVP를 독립 검증한다.

### 점진적 전달

1. US1: 내 layout 조회/복원
2. US2: 전체 layout snapshot 저장과 autosave
3. US3: 사용자별 격리와 사용자 전환 정리
4. US4: 실패 상태, retry, 깨진 layout 복구
5. 전체 test/build와 quickstart 검증

### 구현 원칙

- UI 조작은 먼저 Redux state에 반영하고 저장은 autosave hook에서 처리한다.
- 카메라 추가/삭제/이동별 API를 만들지 않고 전체 layout snapshot을 저장한다.
- backend는 요청 payload의 `userId`를 신뢰하지 않고 현재 actor 기준으로 owner를 결정한다.
- 저장 실패 시 화면 state를 rollback하지 않는다.
- 기존 002 라이브 대시보드 조작 흐름을 변경하지 않는 것을 회귀 기준으로 삼는다.

### 후속 보안 범위

- JWT 또는 session 기반 현재 사용자 검증
- layout 변경 감사 로그
- layout 버전 이력과 복구
- 관리자에 의한 사용자 layout 조회/초기화
- 대량 layout payload 제한과 schema versioning

---

## 구현 결과

- backend는 `GET /api/layouts/me`, `PUT /api/layouts/me`를 현재 `X-Actor-Username` 기준으로 구현했다.
- `layouts.user_id` 단일 layout 보장을 위해 `V009__enforce_single_layout_per_user.sql` migration을 추가했고 실제 개발 DB에 v009까지 적용했다.
- frontend는 `fetchMyLayout`, `saveMyLayout`, `usePersistLayout` 기반 autosave로 전체 layout snapshot을 저장한다.
- `tester`, `tester1` mock 계정은 backend 401을 피하기 위해 username별 local layout snapshot을 사용하고, `admin`은 backend `/layouts/me`를 사용한다.
- Rename과 직접 영상 주소 source는 `cameraPositions` 안에 포함되어 새로고침/재로그인 후 복원 가능한 snapshot 대상이 되었다.
- 검증 완료: `cd backend; mvn test`, `cd frontend; npm test -- --run`, `cd frontend; npm run build`.
- 실제 API 검증 완료: `PUT /api/layouts/me` 저장 성공, `GET /api/layouts/me` 저장 layout 복원 성공, actor 없는 요청 401 확인.

## 후속 보안 범위

- 개발용 `X-Actor-Username` 대신 JWT 또는 session 기반 현재 사용자 검증으로 교체한다.
- layout payload 크기 제한과 schema versioning을 추가한다.
- layout 변경 감사 로그와 관리자 초기화 기능은 별도 기능으로 분리한다.
