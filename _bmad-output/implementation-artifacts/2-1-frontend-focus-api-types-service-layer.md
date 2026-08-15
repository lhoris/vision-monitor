---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 2.1: Frontend Focus API Types and Service Layer

Status: review

## 목표

Focus 화면이 mock adapter 구현 세부사항을 직접 알지 않도록 `focusApiService` facade를 제공한다. UI는 `getCameraFocus`, `getCameraLiveStream`, `getCameraPlayback`, `getCameraEvents`, `getActiveAlerts`, `getEventDetail`를 typed response로 호출한다.

## Acceptance Criteria

1. `focusApiService.getCameraFocus(cameraId)`는 `ApiResponse<CameraFocusDto>`를 반환한다.
2. `focusApiService.getCameraLiveStream(cameraId)`는 `ApiResponse<LiveStreamDto>`를 반환한다.
3. `focusApiService.getCameraPlayback(cameraId, range)`는 `ApiResponse<PlaybackSessionDto>`를 반환한다.
4. `focusApiService.getCameraEvents(cameraId, range)`는 `ApiResponse<CameraEventListDto>`를 반환한다.
5. `focusApiService.getActiveAlerts(cameraId)`는 `ApiResponse<ActiveAlertDto[]>`를 반환한다.
6. `focusApiService.getEventDetail(eventId)`는 `ApiResponse<EventDetailDto>`를 반환한다.
7. UI layer는 mock adapter 파일을 직접 import하지 않아도 위 함수만 사용할 수 있다.
8. 기존 service method는 깨지지 않는다.
9. Spring Boot/DB/media/AI/server overlay 구현은 추가하지 않는다.

## 구현 범위

- `frontend/src/services/focusApiService.ts` 추가.
- `frontend/src/services/index.ts` export 추가.
- focused service facade tests 추가.

## 제외 범위

- UI route/page/shell 구현.
- Spring Boot API 구현.
- 기존 REST service fallback 구조 대규모 refactor.

## 구현 순서

- [x] facade service tests를 먼저 작성한다.
- [x] `focusApiService`를 추가한다.
- [x] services barrel export를 추가한다.
- [x] focused tests, full regression, build를 통과시킨다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- focusApiService --run` (red phase: failed before facade implementation)
- `npm test -- focusApiService --run` (green phase: 6 passed)
- `npm test -- --run` (full frontend regression: 173 passed)
- `npm run build` (TypeScript build and Vite production build passed)

### Completion Notes List

- Added `focusApiService` facade so Focus UI can use typed service methods without importing mock adapters directly.
- Exposed camera focus, live stream, playback, camera events, active alerts, and event detail methods from the facade.
- Re-exported `focusApiService` from the services barrel.
- Added focused facade tests and verified full regression/build.

### File List

- `_bmad-output/implementation-artifacts/2-1-frontend-focus-api-types-service-layer.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/services/focusApiService.ts`
- `frontend/src/services/index.ts`
- `frontend/src/services/__tests__/focusApiService.test.ts`

## Change Log

- 2026-08-15: Created Story 2.1 focus API facade service layer story.
- 2026-08-15: Implemented Story 2.1 focus API facade service layer and tests.
