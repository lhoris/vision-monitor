# 작업 목록: 통합 알람 관리

## 기반

- [X] T001 `TB_M26_CODE_DETAIL`, `TB_M26_USER_ALERT_PREF`, `TB_M26_ALARM_LOG` 확장 migration을 `backend/src/main/resources/db/migration/V033__extend_alarm_management.sql`에 작성한다.
- [X] T002 알람 정책 필드를 `backend/src/main/java/com/vision/entity/CodeDetail.java`, `backend/src/main/java/com/vision/entity/UserAlertPreference.java`, `backend/src/main/java/com/vision/entity/AlarmLog.java`에 반영한다.
- [X] T003 [P] API 계약을 `specs/025-alarm-management-settings/contracts/alarm-management.md`에 기록한다.

## 사용자 스토리 1 - 통합 정책 관리

- [X] T004 [US1] 정책·사용자·채널 DTO를 `backend/src/main/java/com/vision/dto/AlarmManagementDto.java`에 정의한다.
- [X] T005 [US1] 통합 조회와 정책 저장을 `backend/src/main/java/com/vision/service/AlarmManagementService.java`에 구현한다.
- [X] T006 [US1] 관리자 API를 `backend/src/main/java/com/vision/controller/AlarmManagementController.java`에 구현한다.
- [X] T007 [US1] API 호출 모듈을 `frontend/src/services/alarmManagementService.ts`에 구현한다.
- [X] T008 [US1] 통합 관리 화면을 `frontend/src/pages/AlarmManagement.tsx`에 구현한다.
- [X] T009 [US1] 라우팅·메뉴·다국어 키를 `frontend/src/pages/AdminPlaceholder.tsx`, `frontend/src/components/Layout/Sidebar.tsx`, `frontend/src/locales/ko.json`, `frontend/src/locales/en.json`에 추가한다.

## 사용자 스토리 2 - 수신자와 채널 적용

- [X] T010 [US2] 사용자별 수신자·채널 저장을 `backend/src/main/java/com/vision/service/AlarmManagementService.java`에 구현한다.
- [X] T011 [US2] 가입 요청 알람 정책 적용을 `backend/src/main/java/com/vision/service/AuthService.java`에 반영한다.
- [X] T012 [US2] 선택 사용자와 push·메일·Teams 토글 저장을 `frontend/src/pages/AlarmManagement.tsx`에 연결한다.

## 사용자 스토리 3 - 확인 범위

- [X] T013 [US3] 그룹별 확인 처리를 `backend/src/main/java/com/vision/controller/AlarmController.java`, `backend/src/main/java/com/vision/repository/AlarmLogRepository.java`에 반영한다.
- [X] T014 [US3] 공동·개별 확인 시나리오 테스트를 `backend/src/test/java/com/vision/service/AlarmManagementServiceTest.java`에 추가한다.

## 검증

- [X] T015 관련 백엔드 테스트와 프론트엔드 빌드를 실행하고 `specs/025-alarm-management-settings/quickstart.md`에 기록한다.
