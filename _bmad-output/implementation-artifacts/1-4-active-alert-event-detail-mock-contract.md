---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 1.4: Active Alert and Event Detail Mock Contract

Status: review

## 목표

`GET /api/cameras/{cameraId}/alerts/active`, `GET /api/events/{eventId}`, `POST /api/events/{eventId}/acknowledge`에 해당하는 active alert, event detail, acknowledge mock contract를 frontend TypeScript DTO, fixture, mock adapter로 고정한다.

이 Story는 실제 Spring Boot Backend API, DB, 서버 ACK workflow, 외부 VMS/AI 연동, media server, RTSP ingest, AI inference, server-side overlay를 구현하지 않는다.

## 사용자 가치

운영자는 Focus 화면에서 활성 알람 배너와 관련 이벤트 상세 metadata를 볼 수 있고, 이후 UI Story는 실제 backend 없이 alert/event 상태 흐름을 구현할 수 있다.

## Story

As an 운영자,  
I want 선택한 카메라의 활성 알람과 관련 이벤트 상세를 조회하고 싶다,  
so that 경고 발생 시 영상 옆에서 상황 정보를 즉시 확인할 수 있다.

## Acceptance Criteria

1. 활성 알람이 없는 `cameraId`는 `ApiResponse<ActiveAlertDto[]>` 성공 응답과 빈 배열을 반환한다.
2. 활성 알람이 있는 `cameraId`는 `alertId`, `cameraId`, `severity`, `message`, `location`, `startedAt`, `status`, `relatedEventId`, `metadata`를 포함한다.
3. 경고 message fixture는 `[경고!] Entry Zone 치입불 발생 중` 형식을 포함한다.
4. `GET /api/events/{eventId}` mock은 event 공통 필드, `playbackHint`, `metadata`를 포함한 `EventDetailDto`를 반환한다.
5. `POST /api/events/{eventId}/acknowledge` mock은 `eventId`, `status`, `acknowledgedBy`, `acknowledgedAt`를 반환한다.
6. acknowledge endpoint는 POST 계약을 기준으로 하며 기존 PUT 계약을 새 mock boundary로 확장하지 않는다.
7. 존재하지 않는 camera/event는 `success: false`, `error: 'NOT_FOUND'` envelope를 반환하고 `data`를 포함하지 않는다.
8. 권한 없는 camera/event는 `success: false`, `error: 'FORBIDDEN'` envelope를 반환하고 alert/event metadata를 노출하지 않는다.
9. endpoint 문자열은 `/api/cameras/{cameraId}/alerts/active`, `/api/events/{eventId}`, `/api/events/{eventId}/acknowledge` 형태를 유지한다.
10. 모든 시간 필드는 ISO-8601 `+09:00` 문자열 convention을 따른다.

## 구현 범위

- `ActiveAlertDto`, `EventDetailDto`, `EventPlaybackHintDto`, `AcknowledgeEventDto` 타입 추가.
- active alert fixture와 event detail fixture 추가.
- active alerts, event detail, event acknowledge mock adapter 추가.
- `eventService.getActiveCameraAlerts`, `eventService.getFocusEventDetail`, `eventService.acknowledgeFocusEvent` 추가.
- Vitest contract/service tests 추가.

## 제외 범위

- Spring Boot controller/service/repository/entity/DTO 구현.
- DB migration 또는 persistence-backed API.
- 서버 ACK/조치 workflow 실제 구현.
- SSE/WebSocket alert push.
- AI inference, media distribution, server-side overlay.
- alert banner UI, dismiss state, metadata panel UI. 이는 Epic 5 범위다.

## 관련 파일 후보

- `frontend/src/types/cameraFocus.ts`
- `frontend/src/mocks/cameraAlerts.ts`
- `frontend/src/mocks/eventDetails.ts`
- `frontend/src/services/cameraAlertsMockAdapter.ts`
- `frontend/src/services/eventDetailMockAdapter.ts`
- `frontend/src/services/eventService.ts`
- `frontend/src/services/index.ts`
- `frontend/src/services/__tests__/cameraAlertsMockAdapter.test.ts`
- `frontend/src/services/__tests__/eventDetailMockAdapter.test.ts`
- `frontend/src/services/__tests__/eventService.test.ts`

## 구현 순서

- [x] Alert/event detail DTO 타입을 추가한다.
- [x] Active alerts mock adapter tests를 먼저 작성한다.
- [x] Active alerts fixture와 mock adapter를 구현한다.
- [x] Event detail/acknowledge mock adapter tests를 먼저 작성한다.
- [x] Event detail fixture와 mock adapter를 구현한다.
- [x] `eventService` service boundary와 tests를 추가한다.
- [x] focused tests, full regression, build를 통과시킨다.

## 테스트 기준

- `npm test -- cameraAlertsMockAdapter eventDetailMockAdapter eventService --run` 통과.
- `npm test -- --run` 통과.
- `npm run build` 통과.
- 404/403 error envelope에 `data`와 제한 metadata가 노출되지 않음.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- cameraAlertsMockAdapter eventDetailMockAdapter eventService --run` (red phase: failed before adapter/service implementation)
- `npm test -- cameraAlertsMockAdapter eventDetailMockAdapter eventService --run` (green phase: 17 passed)
- `npm test -- --run` (full frontend regression: 167 passed)
- `npm run build` (TypeScript build and Vite production build passed)

### Completion Notes List

- Added active alert, event detail, playback hint, and acknowledge DTO contracts.
- Added active alert fixtures with warning message and metadata-rich related event context.
- Added event detail fixtures with playback hints and extensible metadata.
- Added active alerts, event detail, and acknowledge POST mock adapters.
- Added `eventService.getActiveCameraAlerts`, `eventService.getFocusEventDetail`, and `eventService.acknowledgeFocusEvent` mock-backed service boundaries.
- Added focused adapter/service tests and verified full regression/build.

### File List

- `_bmad-output/implementation-artifacts/1-4-active-alert-event-detail-mock-contract.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/types/cameraFocus.ts`
- `frontend/src/mocks/cameraAlerts.ts`
- `frontend/src/mocks/eventDetails.ts`
- `frontend/src/services/cameraAlertsMockAdapter.ts`
- `frontend/src/services/eventDetailMockAdapter.ts`
- `frontend/src/services/eventService.ts`
- `frontend/src/services/index.ts`
- `frontend/src/services/__tests__/cameraAlertsMockAdapter.test.ts`
- `frontend/src/services/__tests__/eventDetailMockAdapter.test.ts`
- `frontend/src/services/__tests__/eventService.test.ts`

## Change Log

- 2026-08-15: Created Story 1.4 as frontend mock-only active alert/event detail contract vertical slice.
- 2026-08-15: Implemented Story 1.4 active alert/event detail/acknowledge DTOs, fixtures, mock adapters, service boundaries, and tests.
