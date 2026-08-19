# 작업 목록: 사용자 관리

**기능**: `011-user-management`

**구현 원칙**: `tester / tester123`만 관리자 mock 흐름과 mock 변경을 사용한다. `tester1 / tester123`은 비관리자 접근 제한을 검증한다. 그 외 계정은 mock을 사용하지 않고 실제 API 경계를 호출한다. Spring Boot, DB, SSO, MFA 구현은 제외한다.

## Phase 1: 준비

- [X] T001 기존 관리자 route와 `/admin/users` 연결 지점을 확인한다: `frontend/src/App.tsx`, `frontend/src/pages/AdminPlaceholder.tsx`, `frontend/src/components/Layout/Sidebar.tsx`
- [X] T002 기존 Tabulator wrapper와 formatter 재사용 지점을 확인한다: `frontend/src/lib/tabulator/useTabulator.ts`, `frontend/src/lib/tabulator/formatters.ts`
- [X] T003 인증 상태에서 username, role, permission을 읽는 기준을 확인한다: `frontend/src/services/authService.ts`, `frontend/src/store/slices/authSlice.ts`
- [X] T004 frontend test/build 명령을 확인한다: `frontend/package.json`

## Phase 2: 공통 기반

- [X] T005 [P] 사용자, 역할, 개인화, 필터, mutation 타입을 정의한다: `frontend/src/types/userManagement.ts`
- [X] T006 [P] 활성·잠금·비활성·퇴사와 개인화 케이스 fixture를 작성한다: `frontend/src/mocks/userManagement.ts`
- [X] T007 사용자관리 계약 응답과 오류 타입을 정리한다: `frontend/src/types/userManagement.ts`
- [X] T008 `tester`만 mock adapter를 선택하도록 service 경계를 구현한다: `frontend/src/services/userManagementService.ts`
- [X] T009 [P] 목록·상세·등록·수정·상태 변경·삭제 요청 mock adapter를 구현한다: `frontend/src/services/userManagementMockAdapter.ts`
- [X] T010 [P] mock/API 경계와 오류 envelope를 검증한다: `frontend/src/services/__tests__/userManagementService.test.ts`
- [X] T011 중복 ID, 필수값, 이메일, 자기 계정, 마지막 관리자 보호를 구현한다: `frontend/src/services/userManagementValidation.ts`
- [X] T012 [P] 공통 UI 상태 helper를 작성한다: `frontend/src/components/UserManagement/userManagementUi.ts`

## Phase 3: 사용자 스토리 1 - 그리드 조회와 검색 (P1, MVP)

- [X] T013 [P] page의 로딩·오류·권한 없음·빈 상태를 구현한다: `frontend/src/pages/UserManagement.tsx`
- [X] T014 [US1] Tabulator 사용자 목록과 주요 컬럼을 구현한다: `frontend/src/components/UserManagement/UserManagementGrid.tsx`
- [X] T015 [US1] 검색·역할·계정 상태·재직 상태·페이지 필터를 연결한다: `frontend/src/components/UserManagement/UserManagementGrid.tsx`
- [X] T016 [US1] 행 선택과 상세 조회 상태를 연결한다: `frontend/src/pages/UserManagement.tsx`
- [X] T017 [US1] 상태 텍스트와 색상, 긴 텍스트 formatter를 구현한다: `frontend/src/components/UserManagement/UserStatusBadge.tsx`
- [X] T018 [P] 관리자 접근, 목록, 검색·필터·빈 상태를 검증한다: `frontend/src/components/UserManagement/__tests__/UserManagementGrid.test.tsx`
- [ ] T019 [US1] quickstart의 조회·검색·접근 제한 시나리오를 브라우저에서 실행한다: `specs/011-user-management/quickstart.md`

## Phase 4: 사용자 스토리 2 - 신규 등록 (P1, MVP)

- [X] T020 [P] 등록·수정 공용 입력 dialog를 구현한다: `frontend/src/components/UserManagement/UserEditDialog.tsx`
- [X] T021 [US2] 필수값·중복 ID·이메일·역할 validation을 연결한다: `frontend/src/components/UserManagement/UserEditDialog.tsx`
- [X] T022 [US2] 신규 등록 submit과 처리 상태를 연결한다: `frontend/src/pages/UserManagement.tsx`
- [X] T023 [US2] 등록 성공 후 목록·상세를 갱신한다: `frontend/src/services/userManagementMockAdapter.ts`
- [X] T024 [P] 신규 등록 validation과 결과를 검증한다: `frontend/src/services/__tests__/userManagementService.test.ts`
- [ ] T025 [US2] quickstart의 신규 등록 시나리오를 브라우저에서 실행한다: `specs/011-user-management/quickstart.md`

## Phase 5: 사용자 스토리 3 - 정보와 역할 수정 (P1, MVP)

- [X] T026 [US3] 사용자 상세와 역할·개인화 정보를 표시한다: `frontend/src/components/UserManagement/UserDetailPanel.tsx`
- [X] T027 [US3] 상세에서 수정 dialog를 여는 흐름을 연결한다: `frontend/src/pages/UserManagement.tsx`
- [X] T028 [US3] 역할 변경의 메뉴·권한·개인화 영향 안내를 표시한다: `frontend/src/components/UserManagement/UserEditDialog.tsx`
- [X] T029 [US3] 수정 성공 후 grid·상세·fixture를 동기화한다: `frontend/src/services/userManagementService.ts`
- [X] T030 [P] 상세·역할 영향·수정 결과를 검증한다: `frontend/src/services/__tests__/userManagementService.test.ts`
- [ ] T031 [US3] quickstart의 역할 수정 시나리오를 브라우저에서 실행한다: `specs/011-user-management/quickstart.md`

## Phase 6: 사용자 스토리 4 - 비활성화와 퇴사 처리 (P2)

- [X] T032 [P] 비활성화·퇴사·개인화 유지/초기화 dialog를 구현한다: `frontend/src/components/UserManagement/UserDangerDialog.tsx`
- [X] T033 [US4] 계정 상태와 재직 상태를 분리해 표시한다: `frontend/src/components/UserManagement/UserStatusBadge.tsx`
- [X] T034 [US4] 자기 계정과 마지막 관리자 보호를 적용한다: `frontend/src/services/userManagementValidation.ts`
- [X] T035 [US4] 상태 변경과 개인화 초기화를 mock adapter에 연결한다: `frontend/src/services/userManagementMockAdapter.ts`
- [X] T036 [US4] 처리 결과와 grid·상세 갱신을 연결한다: `frontend/src/pages/UserManagement.tsx`
- [X] T037 [P] 비활성화·퇴사·위험 변경 보호를 검증한다: `frontend/src/services/__tests__/userManagementService.test.ts`
- [ ] T038 [US4] quickstart의 상태 변경 시나리오를 브라우저에서 실행한다: `specs/011-user-management/quickstart.md`

## Phase 7: 사용자 스토리 5 - 삭제 요청과 위험 변경 (P3)

- [X] T039 [US5] 삭제 영향과 비활성화 우선 안내를 표시한다: `frontend/src/components/UserManagement/UserDangerDialog.tsx`
- [X] T040 [US5] 삭제 요청을 mock adapter에 연결한다: `frontend/src/services/userManagementMockAdapter.ts`
- [X] T041 [US5] 자기 계정 및 마지막 관리자 삭제를 차단한다: `frontend/src/services/userManagementValidation.ts`
- [X] T042 [US5] 삭제 요청 처리 상태와 데이터 보존을 표시한다: `frontend/src/pages/UserManagement.tsx`
- [X] T043 [P] 삭제 영향·보호·실패 상태를 검증한다: `frontend/src/services/__tests__/userManagementService.test.ts`
- [ ] T044 [US5] quickstart의 삭제 요청 시나리오를 브라우저에서 실행한다: `specs/011-user-management/quickstart.md`

## Phase 8: 마무리 및 교차 검증

- [ ] T045 [P] theme1·theme2·theme3에서 텍스트와 dialog 가독성을 브라우저로 확인한다: `frontend/src/components/UserManagement/`, `frontend/src/styles/`
- [ ] T046 [P] tester 관리자와 tester1 비관리자의 메뉴·직접 route 접근을 통합 검증한다: `frontend/src/__tests__/admin-access.test.tsx`
- [X] T047 [P] tester/tester1 외 계정이 실제 API 경계를 호출하는지 검증한다: `frontend/src/services/__tests__/userManagementService.test.ts`
- [X] T048 전체 frontend 테스트를 실행한다: `npm test -- --run`
- [X] T049 production build를 실행한다: `npm run build`
- [ ] T050 quickstart 전체 시나리오와 `/live`, `/playback`, `/events` 회귀를 브라우저에서 최종 확인한다: `specs/011-user-management/quickstart.md`

## 구현 결과

- MVP 구현 완료: Phase 1~5의 사용자 조회·검색·등록·수정
- 후속 흐름 구현 완료: 비활성화·퇴사·삭제 요청·위험 변경 보호
- 자동 검증: 테스트 파일 40개, 테스트 228개 통과
- 빌드 검증: `npm run build` 통과
- 남은 항목: 브라우저 기반 quickstart, 세 테마 시각 검증, 전체 route 수동 회귀

## Phase 9: 실제 backend 사용자관리 API

아래 작업은 frontend mock MVP 완료 후 진행하는 후속 backend phase다.

- [X] T051 `backend-database-design.md` 기준으로 `users` 확장 필드와 `org_units` migration을 검토한다: `backend/src/main/resources/db/migration/`
- [X] T052 `org_units` Entity와 Repository를 구현한다. DB 외래키 없이 부모 조직과 활성 상태를 service에서 검증한다: `backend/src/main/java/com/vision/entity/OrgUnit.java`, `backend/src/main/java/com/vision/repository/OrgUnitRepository.java`
- [X] T053 `UserAccount` Entity와 Repository를 기존 `users` 테이블에 맞춰 구현한다: `backend/src/main/java/com/vision/entity/UserAccount.java`, `backend/src/main/java/com/vision/repository/UserAccountRepository.java`
- [X] T054 조직 목록과 사용자 목록·상세 조회 API를 구현한다: `backend/src/main/java/com/vision/controller/UserManagementController.java`
- [X] T055 사용자 등록·수정 API와 입력 validation을 구현한다.
- [X] T056 잠금·해제·비활성화·퇴사·삭제 요청 API와 상태 전이 검증을 구현한다.
- [X] T057 관리자 권한, 자기 계정 보호, 마지막 관리자 보호를 backend service에서 구현한다.
- [X] T058 `orgUnitId` 존재·활성·계층 규칙을 검증하는 service 테스트를 작성한다.
- [ ] T059 사용자관리 API의 controller/service/repository 통합 테스트와 migration 검증을 추가한다.
- [X] T060 frontend 실제 API adapter를 backend 응답 계약에 맞춰 전환하고 mock 회귀를 확인한다.

> T059는 실제 MariaDB에 연결해 Flyway `V003`, `V004`를 적용하는 환경 검증이 필요하므로 미완료로 남긴다. 현재 backend 컴파일과 service 단위 테스트는 통과했다.
