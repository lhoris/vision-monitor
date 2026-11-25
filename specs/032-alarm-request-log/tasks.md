# 작업 목록: 알람 요청 원장과 수신자 로그 분리

## Phase 1: 데이터 기반

- [X] T001 [P] Flyway migration `backend/src/main/resources/db/migration/V043__create_alarm_request_and_link_alarm_log.sql` 작성
- [X] T002 [P] 요청 원장 엔티티 `backend/src/main/java/com/vision/entity/AlarmRequest.java` 작성
- [X] T003 요청 저장소 `backend/src/main/java/com/vision/repository/AlarmRequestRepository.java` 작성
- [X] T004 알람 로그에 요청 ID를 추가하고 저장소 중복 조회를 보완: `backend/src/main/java/com/vision/entity/AlarmLog.java`, `backend/src/main/java/com/vision/repository/AlarmLogRepository.java`

## Phase 2: 사용자 스토리 1·3 - 요청 생성과 기준 검증

- [X] T005 [US1] [US3] 요청 입력 DTO와 원장 생성 서비스 계약 갱신: `backend/src/main/java/com/vision/dto/AlarmIngressRequest.java`, `backend/src/main/java/com/vision/service/AlarmIngressService.java`
- [X] T006 [US1] [US3] 활성 알람 기준 누락 및 원천 이벤트 중복 테스트 작성: `backend/src/test/java/com/vision/service/AlarmIngressServiceTest.java`
- [X] T007 [US1] [US3] 모델 알람 입력 API가 요청 원장 생성 결과를 사용하도록 연결: `backend/src/main/java/com/vision/controller/AlarmController.java`

## Phase 3: 사용자 스토리 2 - 수신자별 팬아웃

- [X] T008 [US2] 팬아웃 워커 구현: `backend/src/main/java/com/vision/service/AlarmRequestFanoutWorker.java`
- [X] T009 [US2] 요청별 수신자 계산과 로그 중복 방지 테스트 작성: `backend/src/test/java/com/vision/service/AlarmRequestFanoutWorkerTest.java`
- [X] T010 [US2] 팬아웃 처리의 수신 설정·공동 확인 그룹 ID 연결 검증

## Phase 4: 사용자 스토리 4 - 기존 기능 연계

- [X] T011 [US4] 채널 전송 워커가 팬아웃 로그만 처리하도록 조회 조건 검토: `backend/src/main/java/com/vision/service/AlarmNotificationWorker.java`
- [X] T012 [US4] 알람 확인·조회 API의 요청 ID 기반 공동 확인 회귀 검증: `backend/src/main/java/com/vision/controller/AlarmController.java`
- [X] T013 [US4] Python 직접 입력 계약과 migration 컬럼 문서화: `specs/032-alarm-request-log/quickstart.md`

## Phase 5: 검증 및 문서

- [X] T014 [P] 요구사항 체크리스트 작성 및 완료: `specs/032-alarm-request-log/checklists/requirements.md`
- [X] T015 Maven 테스트와 프론트엔드 빌드 실행
- [X] T016 `git diff --check`와 migration 구문 검증 후 문서 상태 갱신

## 의존성

- Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
- T001~T004가 완료되어야 T005 이후 구현을 시작한다.

## MVP 범위

T001~T010까지를 MVP로 하여 요청 원장 생성, 기준 검증, 수신자별 로그 분배를 완성한다. 채널 전송 회귀와 Python 계약 문서는 T011~T016에서 마무리한다.
