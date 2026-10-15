# 작업 목록: 실시간 알람 SSE 인프라

## Phase 1: Setup

- [X] T001 [P] Create SSE feature contract and quick validation documents in `specs/023-sse-alarm-infrastructure/contracts/sse.md`
- [X] T002 [P] Add the feature directory mapping in `.specify/feature.json`

## Phase 2: Foundational

- [X] T003 Define the immutable alarm SSE payload in `backend/src/main/java/com/vision/sse/AlarmSseEvent.java`
- [X] T004 Implement concurrent user-scoped emitter lifecycle and heartbeat scheduling in `backend/src/main/java/com/vision/sse/AlarmSseBroker.java`
- [X] T005 Implement the alarm publisher boundary in `backend/src/main/java/com/vision/sse/AlarmEventPublisher.java`

## Phase 3: User Story 1 - 실시간 알람 수신

- [X] T006 [US1] Expose authenticated `GET /api/alarms/stream` in `backend/src/main/java/com/vision/controller/AlarmStreamController.java`
- [X] T007 [US1] Add broker isolation and publish tests in `backend/src/test/java/com/vision/sse/AlarmSseBrokerTest.java`
- [X] T008 [US1] Add stream controller contract tests in `backend/src/test/java/com/vision/controller/AlarmStreamControllerTest.java`

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

## Dependencies

`T003 → T004 → T005 → T006 → T007/T008`; `T009 → T010 → T011`; `T004 → T013`; all implementation tasks precede `T015`.

## MVP

MVP is US1 + US2 + US3: authenticated stream, user isolation, heartbeat/cleanup, frontend reconnect, and automated tests. Persistent event history and external broker remain out of scope.
