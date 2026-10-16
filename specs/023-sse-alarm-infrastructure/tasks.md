# 작업 목록: 실시간 알람 SSE 인프라

## Phase 1: Setup

- [X] T001 [P] Create SSE feature contract and quick validation documents in `specs/023-sse-alarm-infrastructure/contracts/sse.md`
- [X] T002 [P] Add the feature directory mapping in `.specify/feature.json`

## Phase 2: Foundational

- [X] T003 Define the immutable alarm SSE payload in `backend/src/main/java/com/vision/sse/AlarmSseEvent.java`
- [X] T004 Implement concurrent user-scoped emitter lifecycle and heartbeat scheduling in `backend/src/main/java/com/vision/sse/AlarmSseBroker.java`
- [X] T005 Implement the alarm publisher boundary in `backend/src/main/java/com/vision/sse/AlarmEventPublisher.java`

## Phase 3: User Story 1 - 실시간 알람 수신

- [X] T006 [US1] Expose authenticated `GET /api/alarms/stream` in `backend/src/main/java/com/vision/controller/AlarmController.java`
- [X] T007 [US1] Add broker isolation and publish tests in `backend/src/test/java/com/vision/sse/AlarmSseBrokerTest.java`
- [X] T008 [US1] Add stream controller contract tests in `backend/src/test/java/com/vision/controller/AlarmControllerTest.java`

## Phase 4: User Story 2 - 연결 복구

- [X] T009 [US2] Implement authenticated fetch-based SSE parsing and bounded reconnect logic in `frontend/src/services/alarmSseService.ts`
- [X] T010 [US2] Add alarm event types and service exports in `frontend/src/types/alarm.ts` and `frontend/src/services/index.ts`
- [X] T011 [US2] Add parser, authorization, abort, and reconnect tests in `frontend/src/services/__tests__/alarmSseService.test.ts`

## Phase 5: User Story 3 - 보안 및 자원 정리

- [X] T012 [US3] Verify existing API auth interceptor covers the stream endpoint in `backend/src/main/java/com/vision/config/WebConfig.java`
- [X] T013 [US3] Add cleanup and heartbeat assertions to `backend/src/test/java/com/vision/sse/AlarmSseBrokerTest.java`

## Phase 6: Polish and validation

- [X] T014 Update local SSE usage and publisher handoff notes in `specs/023-sse-alarm-infrastructure/quickstart.md`
- [X] T015 Run backend tests, frontend tests, and frontend build; record results in the implementation handoff

## Phase 7: Model server alarm ingress

- [X] T016 Add the common model alarm payload in `backend/src/main/java/com/vision/dto/AlarmIngressRequest.java`
- [X] T017 Merge SSE stream and model ingress endpoints into `backend/src/main/java/com/vision/controller/AlarmController.java`
- [X] T018 Add service-key validation and model alarm fan-out in `backend/src/main/java/com/vision/sse/AlarmEventPublisher.java` and `backend/src/main/java/com/vision/sse/AlarmSseBroker.java`
- [X] T019 Exclude the model ingress route from user-session auth and configure `MODEL_SERVER_KEY` in `backend/src/main/java/com/vision/config/WebConfig.java` and `backend/src/main/resources/application.yml`
- [X] T020 Add ingress authentication and publish contract tests in `backend/src/test/java/com/vision/controller/AlarmControllerTest.java`
- [X] T021 Document the Python model server request contract in `specs/023-sse-alarm-infrastructure/quickstart.md` and `specs/023-sse-alarm-infrastructure/contracts/sse.md`

## Dependencies

`T003 → T004 → T005 → T006 → T007/T008`; `T009 → T010 → T011`; `T004 → T013`; all implementation tasks precede `T015`.

## MVP

MVP is US1 + US2 + US3: authenticated stream, user isolation, heartbeat/cleanup, frontend reconnect, and automated tests. Persistent event history and external broker remain out of scope.
