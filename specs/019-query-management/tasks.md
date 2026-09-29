# 작업 목록: 쿼리 관리 메뉴

**입력**: `specs/019-query-management/`의 spec.md, plan.md, data-model.md, contracts/, quickstart.md

**구현 방식**: backend DB 관리 API를 먼저 완성한 뒤 frontend 관리자 화면과 메타데이터 연계를 연결한다.

## Phase 1: 준비 및 계약

- [ ] T001 `specs/019-query-management/plan.md`와 기존 `specs/017-camera-focus-metadata-query/`의 Query 계약을 검토하고 구현 대상 파일 목록을 확정한다.
- [ ] T002 [P] 관리 API 요청·응답 오류 코드를 계약 문서와 일치시키는 backend DTO 목록을 정리한다: `backend/src/main/java/com/vision/dto/`
- [ ] T003 [P] Query 관리 화면의 한국어·영어 문구 키를 정의한다: `frontend/src/locales/ko.json`, `frontend/src/locales/en.json`
- [ ] T004 기존 `TB_M26_METADATA_QUERY`와 Audit 컬럼을 검증하고 신규 Migration 불필요 여부를 테스트로 고정한다: `backend/src/test/java/com/vision/repository/FlywayMigrationScriptsTest.java`

## Phase 2: Backend 기반

- [ ] T005 [P] Query 관리 목록·상세·저장용 DTO를 추가한다: `backend/src/main/java/com/vision/dto/MetadataQueryAdminDto.java`, `backend/src/main/java/com/vision/dto/MetadataQueryAdminRequest.java`
- [ ] T006 [P] Query 관리 예외 코드와 검증 오류를 공통 API 오류 응답에 연결한다: `backend/src/main/java/com/vision/exception/`
- [ ] T007 조회 전용 SQL, Query ID, 제한시간, JSON Schema 검증을 재사용 가능한 서비스 경계로 정리한다: `backend/src/main/java/com/vision/service/MetadataQueryValidationService.java`
- [ ] T008 Query 관리 권한과 현재 인증 사용자 Audit 값을 확인하는 공통 검증을 구성한다: `backend/src/main/java/com/vision/service/MetadataQueryAdminService.java`
- [ ] T009 Query 관리 API 계약을 Spring MVC 기준으로 연결할 컨트롤러 경로를 확정한다: `backend/src/main/java/com/vision/controller/MetadataQueryAdminController.java`

## Phase 3: 사용자 스토리 1 - Query 목록 확인 (P1)

**목표**: 권한 있는 관리자가 Query 목록을 검색하고 상태와 참조 여부를 확인한다.

**독립 검증**: 관리자 계정으로 목록·검색·상태 필터를 확인하고 논리 삭제 데이터가 기본 목록에서 제외되는지 검증한다.

- [ ] T010 [P] [US1] Query 목록·상세 조회 서비스와 활성/비활성/논리 삭제 필터를 구현한다: `backend/src/main/java/com/vision/service/MetadataQueryAdminService.java`
- [ ] T011 [P] [US1] Query 참조 상태 조회를 구현한다: `backend/src/main/java/com/vision/repository/MetadataQueryReferenceRepository.java`
- [ ] T012 [US1] 관리자 Query 목록·상세 API를 구현한다: `backend/src/main/java/com/vision/controller/MetadataQueryAdminController.java`
- [ ] T013 [P] [US1] frontend Query 관리 타입과 API service를 추가한다: `frontend/src/types/metadataManagement.ts`, `frontend/src/services/metadataManagementService.ts`
- [ ] T014 [US1] 표준 그리드 기반 Query 목록과 검색·상태 필터를 구현한다: `frontend/src/pages/QueryManagement.tsx`, `frontend/src/components/QueryManagement/QueryGrid.tsx`
- [ ] T015 [US1] 관리자 라우트와 사이드바 Query 관리 메뉴를 연결한다: `frontend/src/App.tsx`, `frontend/src/components/Layout/Sidebar.tsx`, `frontend/src/pages/AdminPlaceholder.tsx`
- [ ] T016 [P] [US1] 목록·검색·권한·논리 삭제 필터 backend 테스트를 작성한다: `backend/src/test/java/com/vision/service/MetadataQueryAdminServiceTest.java`, `backend/src/test/java/com/vision/controller/MetadataQueryAdminControllerTest.java`
- [ ] T017 [P] [US1] Query 목록 화면의 로딩·빈 상태·검색·권한 상태 frontend 테스트를 작성한다: `frontend/src/pages/__tests__/QueryManagement.test.tsx`, `frontend/src/services/__tests__/metadataManagementService.test.ts`

## Phase 4: 사용자 스토리 2 - 조회 전용 Query 등록·수정 (P1)

**목표**: 관리자가 메타데이터에 사용할 Query를 안전하게 등록하고 수정한다.

**독립 검증**: 유효한 SELECT/WITH Query는 저장되고, 변경 SQL·다중 문장·중복 ID는 저장 전에 거부된다.

- [ ] T018 [P] [US2] Query 등록·수정 요청 검증과 Audit 값 반영을 구현한다: `backend/src/main/java/com/vision/service/MetadataQueryAdminService.java`
- [ ] T019 [US2] Query 등록·수정 API를 구현한다: `backend/src/main/java/com/vision/controller/MetadataQueryAdminController.java`
- [ ] T020 [P] [US2] Query 편집 모달과 SQL textarea, Schema/파라미터 입력 필드를 구현한다: `frontend/src/components/QueryManagement/QueryEditorDialog.tsx`
- [ ] T021 [US2] Query 등록·수정 저장, 중복 ID, SQL 검증 오류 표시를 연결한다: `frontend/src/pages/QueryManagement.tsx`, `frontend/src/services/metadataManagementService.ts`
- [ ] T022 [P] [US2] 조회 전용 SQL·파라미터·제한시간·중복 ID backend 테스트를 작성한다: `backend/src/test/java/com/vision/service/MetadataQueryValidationServiceTest.java`, `backend/src/test/java/com/vision/service/MetadataQueryAdminServiceTest.java`
- [ ] T023 [P] [US2] Query 편집 모달 입력 검증과 저장 오류 frontend 테스트를 작성한다: `frontend/src/components/QueryManagement/__tests__/QueryEditorDialog.test.tsx`

## Phase 5: 사용자 스토리 3 - 상태 변경 및 논리 삭제 (P1)

**목표**: 관리자가 Query 사용 상태를 관리하고 참조 중인 Query의 삭제를 안전하게 차단한다.

**독립 검증**: 비활성화는 기존 참조를 유지하고 신규 선택에서 제외하며, 참조 중 삭제는 공통 확인 후에도 거부된다.

- [ ] T024 [US3] 활성화·비활성화·논리 삭제와 메타데이터 섹션 참조 검증을 구현한다: `backend/src/main/java/com/vision/service/MetadataQueryAdminService.java`
- [ ] T025 [US3] 상태 변경·논리 삭제 API를 구현한다: `backend/src/main/java/com/vision/controller/MetadataQueryAdminController.java`
- [ ] T026 [P] [US3] Query 상태 변경과 삭제에 대한 공통 확인 모달을 연결한다: `frontend/src/pages/QueryManagement.tsx`, `frontend/src/components/Common/ConfirmModal.tsx`
- [ ] T027 [US3] 상태 변경 후 목록과 기존 metadata Query 선택 목록을 갱신한다: `frontend/src/services/metadataManagementService.ts`, `frontend/src/services/metadataQueryService.ts`, `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- [ ] T028 [P] [US3] 참조 중 삭제, 논리 삭제, 상태 변경, Audit backend 테스트를 작성한다: `backend/src/test/java/com/vision/service/MetadataQueryAdminServiceTest.java`, `backend/src/test/java/com/vision/controller/MetadataQueryAdminControllerTest.java`
- [ ] T029 [P] [US3] 확인 모달, 비활성 상태, 삭제 오류 frontend 테스트를 작성한다: `frontend/src/pages/__tests__/QueryManagement.test.tsx`

## Phase 6: 마무리 및 검증

- [ ] T030 [P] 다국어 Query 관리 메뉴·목록·편집·오류 문구를 반영한다: `frontend/src/locales/ko.json`, `frontend/src/locales/en.json`
- [ ] T031 Query 관리 화면의 반응형·키보드 접근성·SQL 입력 영역을 점검한다: `frontend/src/pages/QueryManagement.tsx`, `frontend/src/components/QueryManagement/QueryEditorDialog.tsx`
- [ ] T032 기존 메타데이터 목록·실행 API가 Query 관리 변경 후에도 동작하는지 통합 테스트를 추가한다: `backend/src/test/java/com/vision/controller/MetadataQueryControllerTest.java`, `frontend/src/services/__tests__/metadataQueryService.test.ts`
- [ ] T033 [P] 구현 결과와 실행 절차를 문서에 반영한다: `specs/019-query-management/quickstart.md`
- [ ] T034 backend 테스트와 frontend 테스트를 실행한다: `backend/pom.xml`, `frontend/package.json`
- [ ] T035 backend package와 frontend production build를 실행하고 기존 관리자 메뉴 회귀를 확인한다: `backend/pom.xml`, `frontend/package.json`, `frontend/src/components/Layout/__tests__/Sidebar.admin.test.tsx`

## 의존성 및 병렬 실행

### 의존성

1. Phase 1 → Phase 2
2. Phase 2 → US1
3. US1의 API/타입 기반 완료 → US2
4. US1·US2의 기본 Query 저장 계약 완료 → US3
5. US3 완료 → Phase 6

### 병렬 실행 예시

- T002, T003, T004는 서로 다른 문서·검증 영역이므로 병렬 진행할 수 있다.
- T005, T006, T007은 서로 다른 backend 기반 파일에서 병렬 준비할 수 있다.
- US1의 T011, T013, T016, T017은 API 계약이 확정된 뒤 병렬 진행할 수 있다.
- US2의 T020, T022, T023은 backend 서비스 계약이 확정된 뒤 병렬 진행할 수 있다.
- US3의 T026, T028, T029는 상태 API 계약이 확정된 뒤 병렬 진행할 수 있다.

## 구현 전략

1. 기존 테이블·검증·권한 경계를 먼저 고정한다.
2. Query 목록과 관리자 권한 검증을 MVP 첫 수직 슬라이스로 완성한다.
3. 등록·수정과 조회 전용 SQL 검증을 추가한다.
4. 상태 변경·참조 보호·논리 삭제를 추가한다.
5. 기존 화면 확대 보기의 Query 선택 목록과 회귀 테스트를 확인한다.
