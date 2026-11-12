# 작업 목록

## 기반 및 데이터

- [ ] T001 [P] `backend/src/main/resources/db/migration/V036__add_class_code_to_users_and_video_sources.sql`에 공통코드와 사용자·영상 컬럼 migration 작성
- [ ] T002 [P] `backend/src/main/java/com/vision/entity/UserAccount.java`와 `backend/src/main/java/com/vision/entity/VideoSource.java`에 반 필드 추가
- [ ] T003 [P] `backend/src/main/java/com/vision/dto/SignupRequest.java`, `VideoSourceDto.java`, `UserAccountDto.java`, `AuthenticatedUserDto.java` 계약 확장

## US1 회원가입

- [ ] T004 [US1] `backend/src/main/java/com/vision/service/AuthService.java`에서 반 코드 검증·저장 처리
- [ ] T005 [US1] `frontend/src/services/authService.ts`와 로그인 회원가입 모달에 반 선택 필드 연결

## US2 사용자 관리

- [ ] T006 [US2] `backend/src/main/java/com/vision/service/UserManagementService.java`에서 반 조회·생성·수정 처리
- [ ] T007 [US2] `frontend/src/types/userManagement.ts`와 `UserManagementGrid.tsx`에 반 컬럼·편집 셀 연결

## US3 영상 관리

- [ ] T008 [US3] `backend/src/main/java/com/vision/service/VideoSourceService.java`에서 반 저장·공통코드 검증 처리
- [ ] T009 [US3] `frontend/src/types/videoSource.ts`와 `VideoManagement.tsx`에 반 컬럼·필터·입력 연결

## US4 라이브 영상 추가

- [ ] T010 [US4] `backend/src/main/java/com/vision/controller/VideoSourceController.java`와 서비스에 세션 사용자 기준 영상 접근 제한 추가
- [ ] T011 [US4] `frontend/src/components/Grid/AddCameraDialog.tsx`에 사용자 반 자동 필터 및 공통 사용자용 반 선택 추가
- [ ] T012 [US4] 로그인 세션의 반 정보를 라이브 화면과 영상 추가 팝업까지 전달

## 검증

- [ ] T013 `backend/src/test/java/com/vision/service/AuthServiceTest.java`, 사용자·영상 서비스 테스트에 반 시나리오 추가
- [ ] T014 `frontend/src/components/Grid/__tests__/AddCameraDialog.test.tsx`에 반별 필터 시나리오 추가
- [ ] T015 백엔드 테스트, 프론트 테스트·빌드, migration 정합성 검증
