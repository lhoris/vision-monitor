---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 1.3: Playback and Events Mock Contract

Status: review

## 목표

`GET /api/cameras/{cameraId}/playback`과 `GET /api/cameras/{cameraId}/events`에 해당하는 녹화 재생 세션과 이벤트 목록 계약을 frontend TypeScript DTO, fixture, mock adapter로 고정한다.

이 Story는 실제 Spring Boot Backend API, DB, 외부 VMS playback session 발급, media server, RTSP ingest, AI inference, server-side overlay를 구현하지 않는다. MVP에서는 frontend mock service/mock adapter가 backend 응답을 대체하며, 이후 같은 DTO와 endpoint 의미를 유지한 채 실제 Spring Boot API client로 교체할 수 있어야 한다.

## 사용자 가치

운영자는 녹화 탭에서 선택 카메라의 playback URL, seek 가능 여부, timeline segment, 이벤트 목록과 이벤트별 metadata를 확인할 수 있다. 이후 녹화 UI Story는 실제 media/backend 구현 없이도 이 계약을 기준으로 타임라인과 이벤트 선택 흐름을 연결할 수 있다.

## Story

As an 운영자,  
I want 선택한 카메라의 녹화 playback session과 같은 시간 범위의 이벤트 목록을 조회하고 싶다,  
so that 특정 이벤트 전후 영상을 확인하고 이벤트 metadata와 대조할 수 있다.

## Acceptance Criteria

1. 유효하고 접근 가능한 `cameraId`, `from`, `to`에 대해 playback mock adapter는 `ApiResponse<PlaybackSessionDto>` 성공 응답을 반환한다.
2. 성공 응답의 `data`는 `cameraId`, `playbackUrl`, `playbackProtocol`, `sessionId`, `expiresAt`, `availableFrom`, `availableTo`, `seekable`, `preRollSeconds`, `timelineSegments`를 포함한다.
3. `playbackUrl`은 opaque URL이다. mock/test는 URL 내부 구조를 비즈니스 로직으로 파싱하거나 provider path에 결합하지 않는다.
4. `timelineSegments`는 최소 `available`과 `gap` 상태를 표현하며, gap segment는 seek 불가 구간으로 구분 가능해야 한다.
5. 같은 시간 범위에 대해 camera events mock adapter는 `ApiResponse<CameraEventListDto>` 또는 동등한 envelope로 이벤트 목록을 반환한다.
6. 이벤트 목록 항목은 `eventId`, `cameraId`, `eventType`, `severity`, `title`, `occurredAt`, `endedAt`, `status`, `metadata`를 포함한다.
7. 이벤트 metadata는 이벤트 유형별 확장 필드를 object로 보존한다.
8. 이벤트가 없는 시간 범위는 성공 응답과 빈 목록을 반환한다.
9. 존재하지 않는 `cameraId`는 `success: false`, `error: 'NOT_FOUND'` envelope를 반환하고 `data`를 포함하지 않는다.
10. 권한 없는 `cameraId`는 `success: false`, `error: 'FORBIDDEN'` envelope를 반환하고 `playbackUrl`, event metadata, `data`를 노출하지 않는다.
11. endpoint 문자열은 mock adapter 내부에서 `/api/cameras/{cameraId}/playback`과 `/api/cameras/{cameraId}/events` 형태를 유지한다.
12. 모든 시간 필드는 ISO-8601 `+09:00` 문자열 convention을 따른다.

## 구현 범위

- Frontend 전용 `PlaybackSessionDto`, `TimelineSegmentDto`, `CameraEventDto`, `CameraEventListDto` 타입 추가.
- playback session mock fixture 추가.
- camera events mock fixture 추가.
- `/api/cameras/{cameraId}/playback` mock adapter 추가.
- `/api/cameras/{cameraId}/events` mock adapter 추가.
- `recordingService.getCameraPlayback(cameraId, params)` 추가.
- `eventService.getCameraFocusEvents(cameraId, params)` 추가.
- Vitest contract/service tests 추가.

## 제외 범위

- Spring Boot controller/service/repository/entity/DTO 구현.
- DB migration 또는 persistence-backed API.
- 외부 VMS playback session 실제 발급.
- media server, RTSP ingest/transcoding, media proxy.
- AI inference 또는 server-side overlay 생성.
- 녹화 UI route/page/player/timeline rendering. 이는 Epic 4 범위다.
- event detail, active alerts, acknowledge POST. 이는 Story 1.4 범위다.

## 관련 파일 후보

- `frontend/src/types/cameraFocus.ts`
- `frontend/src/types/index.ts`
- `frontend/src/mocks/cameraPlayback.ts`
- `frontend/src/mocks/cameraEvents.ts`
- `frontend/src/services/cameraPlaybackMockAdapter.ts`
- `frontend/src/services/cameraEventsMockAdapter.ts`
- `frontend/src/services/recordingService.ts`
- `frontend/src/services/eventService.ts`
- `frontend/src/services/index.ts`
- `frontend/src/services/__tests__/cameraPlaybackMockAdapter.test.ts`
- `frontend/src/services/__tests__/cameraEventsMockAdapter.test.ts`
- `frontend/src/services/__tests__/recordingService.test.ts`
- `frontend/src/services/__tests__/eventService.test.ts`

## 구현 순서

- [x] Playback/events DTO 타입과 barrel export를 추가한다.
- [x] Playback fixture와 mock adapter tests를 먼저 작성한다.
- [x] Playback fixture와 mock adapter를 구현한다.
- [x] Camera events fixture와 mock adapter tests를 먼저 작성한다.
- [x] Camera events fixture와 mock adapter를 구현한다.
- [x] `recordingService.getCameraPlayback`와 `eventService.getCameraFocusEvents` service boundary 및 tests를 추가한다.
- [x] focused tests, full regression, build를 통과시킨다.

## 테스트 기준

- `npm test -- cameraPlaybackMockAdapter cameraEventsMockAdapter recordingService eventService --run` 통과.
- `npm test -- --run` 통과.
- `npm run build` 통과.
- 404/403 error envelope에 `data`, `playbackUrl`, event metadata가 노출되지 않음.
- backend/media/AI/server overlay 구현이 추가되지 않음.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- cameraPlaybackMockAdapter cameraEventsMockAdapter recordingService eventService --run` (red phase: failed before adapter/service implementation)
- `npm test -- cameraPlaybackMockAdapter cameraEventsMockAdapter recordingService eventService --run` (green phase: 17 passed)
- `npm test -- --run` (full frontend regression: 155 passed)
- `npm run build` (TypeScript build and Vite production build passed)

### Completion Notes List

- Added playback session DTOs and camera event list DTOs to the shared camera focus contract module.
- Added playback fixtures with opaque `playbackUrl`, available/gap timeline segments, and unavailable/forbidden/not-found paths.
- Added camera event fixtures with empty-list and metadata-rich event paths.
- Added `/api/cameras/{cameraId}/playback` and `/api/cameras/{cameraId}/events` mock adapters.
- Added `recordingService.getCameraPlayback` and `eventService.getCameraFocusEvents` mock-backed service boundaries.
- Added focused adapter/service tests and verified full regression/build.

### File List

- `_bmad-output/implementation-artifacts/1-3-playback-events-mock-contract.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/types/cameraFocus.ts`
- `frontend/src/mocks/cameraPlayback.ts`
- `frontend/src/mocks/cameraEvents.ts`
- `frontend/src/services/cameraPlaybackMockAdapter.ts`
- `frontend/src/services/cameraEventsMockAdapter.ts`
- `frontend/src/services/recordingService.ts`
- `frontend/src/services/eventService.ts`
- `frontend/src/services/index.ts`
- `frontend/src/services/__tests__/cameraPlaybackMockAdapter.test.ts`
- `frontend/src/services/__tests__/cameraEventsMockAdapter.test.ts`
- `frontend/src/services/__tests__/recordingService.test.ts`
- `frontend/src/services/__tests__/eventService.test.ts`

## Change Log

- 2026-08-15: Created Story 1.3 as frontend mock-only playback/events contract vertical slice.
- 2026-08-15: Implemented Story 1.3 playback/events DTOs, fixtures, mock adapters, service boundaries, and tests.
