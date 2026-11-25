# 작업 목록: 알람 저장 및 내부 전송 워커

## Phase 1: 설계 및 공통 기반

- [X] T001 [P] `specs/031-alarm-persistence-worker/spec.md`의 요구사항과 기존 알람 계약을 검토한다.
- [X] T002 [P] `specs/031-alarm-persistence-worker/plan.md`의 데이터·처리 흐름을 구현 대상 파일과 대조한다.
- [X] T003 `backend/src/main/resources/db/migration/V042__alarm_channel_delivery_status.sql` migration을 작성한다.

## Phase 2: 알람 데이터 모델과 수신자 설정

- [X] T004 `backend/src/main/java/com/vision/entity/AlarmRule.java`에서 저장 여부·상위 수신범위·상위 채널 기본값 필드를 제거한다.
- [X] T005 `backend/src/main/java/com/vision/entity/UserAlertPreference.java`의 알람 유형별 수신자·채널 필드를 정리한다.
- [X] T006 `backend/src/main/java/com/vision/entity/AlarmLog.java`에 소스 이벤트 ID와 채널별 상태 필드를 추가한다.
- [X] T007 `backend/src/main/java/com/vision/repository/UserAlertPreferenceRepository.java`의 알람 유형별 복합 설정 조회·저장 계약을 보완한다.
- [X] T008 [P] `backend/src/main/java/com/vision/repository/AlarmLogRepository.java`에 채널별 PENDING 조회와 조건부 선점 쿼리를 추가한다.

## Phase 3: 알람 등록과 모델 서버 직접 입력 (US2)

- [X] T009 [US2] `backend/src/main/java/com/vision/service/AlarmIngressService.java`를 추가하여 Spring Boot 알람과 모델 알람의 공통 등록 흐름을 구현한다.
- [X] T010 [US2] `backend/src/main/java/com/vision/dto/AlarmIngressRequest.java`와 관련 DTO에 source event ID와 저장 계약을 반영한다.
- [X] T011 [US2] `backend/src/main/java/com/vision/controller/AlarmController.java`의 모델 알람 API가 SSE만 전송하지 않고 공통 등록 서비스를 호출하도록 변경한다.
- [X] T012 [US2] `backend/src/main/java/com/vision/service/AuthService.java`의 회원가입 알람을 DB 저장·워커 처리 흐름으로 전환한다.
- [X] T013 [P] [US2] 모델 서버 직접 DB 입력 계약을 `specs/031-alarm-persistence-worker/quickstart.md`에 문서화한다.
- [X] T014 [US2] `backend/src/test/java/com/vision/service/AlarmIngressServiceTest.java`에 일반·모델 알람 저장과 중복 방지 테스트를 추가한다.

## Phase 4: 내부 채널 전송 워커 (US3)

- [X] T015 [US3] `backend/src/main/java/com/vision/service/AlarmNotificationWorker.java`를 추가하여 Spring Boot 내부 스케줄 처리를 구현한다.
- [X] T016 [US3] `AlarmNotificationWorker`와 기존 `AlarmEventPublisher`를 연결하여 수신자별 SSE 전송을 처리한다.
- [X] T017 [US3] 메일·팀즈 채널의 미설정 상태를 재시도 없이 `SKIPPED` 또는 `FAILED`로 종료하는 정책을 구현한다.
- [X] T018 [US3] `backend/src/test/java/com/vision/service/AlarmNotificationWorkerTest.java`에 채널별 상태 전이·실패 무재시도·동시성 선점 테스트를 추가한다.

## Phase 5: 알람 기준·수신자 관리 화면 (US1)

- [X] T019 [US1] `backend/src/main/java/com/vision/dto/AlarmManagementDto.java`에서 상위 수신범위·DB 저장·상위 채널 기본값 DTO를 제거한다.
- [X] T020 [US1] `backend/src/main/java/com/vision/service/AlarmManagementService.java`를 하위 수신자 목록 중심으로 변경한다.
- [X] T021 [US1] `frontend/src/services/alarmManagementService.ts`의 계약을 알람 기준·수신자별 채널 설정 구조로 변경한다.
- [X] T022 [US1] `frontend/src/pages/AlarmManagement.tsx`에서 상위 수신대상범위·DB 저장 컬럼을 제거하고 하위 수신자 목록과 채널 토글을 표시한다.
- [X] T023 [P] [US1] `frontend/src/locales/ko.json` 및 `frontend/src/locales/en.json`의 알람 관리 문구를 갱신한다.

## Phase 6: 기존 확인 기능 통합 및 검증

- [X] T024 [US4] `backend/src/main/java/com/vision/controller/AlarmController.java`의 개별·공동 확인 기능이 새 로그 구조에서도 동작하도록 검증한다.
- [X] T025 [P] `backend/src/test/java/com/vision/controller/AlarmControllerTest.java`의 기존 알람 등록·확인·공동 확인 테스트를 통과시킨다.
- [X] T026 [P] `frontend/src/pages/__tests__/Events.test.tsx`와 관련 알람 서비스 계약을 빌드로 검증한다.
- [X] T027 `mvn test`와 `npm run build`를 실행하고 결과를 확인한다.
- [X] T028 `git diff --check`와 migration 정합성을 확인하고 문서의 작업 상태를 갱신한다.

## 의존성

1. Phase 1 → Phase 2
2. Phase 2 → Phase 3 및 Phase 4
3. Phase 3 → Phase 4
4. Phase 2 → Phase 5
5. Phase 3~5 → Phase 6

## MVP 범위

MVP는 모든 알람의 DB 저장, Spring Boot 재기동 후 내부 워커 처리, 앱 알람 SSE 전송, 채널별 상태 저장, 알람 기준별 수신자 관리까지로 한다. 실제 메일·팀즈 외부 연동은 설정 가능한 어댑터 경계까지 구현하고 운영 연동은 별도 설정으로 둔다.
