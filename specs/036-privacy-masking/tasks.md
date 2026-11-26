# 작업 목록: 개인정보 표시 마스킹

## 1단계: 기반

- [X] T001 개인정보 기능 문서와 기존 사용자·알람 DTO의 노출 지점을 정리한다 in `specs/036-privacy-masking/`
- [X] T002 [P] 백엔드 공통 마스킹 규칙을 구현한다 in `backend/src/main/java/com/vision/util/PrivacyMasking.java`
- [X] T003 [P] 프론트엔드 공통 마스킹 규칙을 구현한다 in `frontend/src/utils/privacyMasking.ts`

## 2단계: 목록 표시

- [X] T004 [US1] 사용자 관리 목록에서 이름·이메일 표시값을 마스킹하고 전화번호 표시를 제외한다 in `frontend/src/components/UserManagement/UserManagementGrid.tsx`
- [X] T005 [US1] 알람 관리 수신자 이름 표시를 공통 마스킹 규칙에 연결한다 in `frontend/src/pages/AlarmManagement.tsx`
- [X] T006 [US1] 백엔드 알람 수신자 DTO 매핑에 마스킹 정책을 적용한다 in `backend/src/main/java/com/vision/service/AlarmManagementService.java`

## 3단계: 예외 화면

- [X] T007 [US2] 본인 프로필·연락처 설정은 원문을 유지하고 회귀 테스트를 추가한다 in `frontend/src/pages/AccountProfile.tsx`
- [X] T008 [US3] 가입 승인 담당자 안내는 업무 연락처 원문 예외를 유지한다 in `backend/src/main/java/com/vision/service/AuthService.java`
- [X] T009 [US4] 상세 화면의 본인·승인 담당자 예외와 기타 대상 마스킹을 검증한다 in `backend/src/main/java/com/vision/dto/SignupAdminContactDto.java`

## 4단계: 검증

- [X] T010 [P] 마스킹 규칙 단위 테스트를 추가한다 in `backend/src/test/java/com/vision/util/PrivacyMaskingTest.java`
- [X] T011 [P] 프론트엔드 마스킹 규칙 테스트를 추가한다 in `frontend/src/utils/__tests__/privacyMasking.test.ts`
- [X] T012 백엔드 테스트와 프론트엔드 빌드를 실행하고 수동 검증 체크리스트를 갱신한다 in `specs/036-privacy-masking/quickstart.md`
