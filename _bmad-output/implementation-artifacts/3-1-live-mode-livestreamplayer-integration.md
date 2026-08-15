---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 3.1: Live Mode LiveStreamPlayer Integration

Status: review

## 목표

Camera Focus live mode에서 `GET /api/cameras/{cameraId}/live-stream` mock contract를 로드하고 기존 `LiveStreamPlayer`에 `streamUrl`을 전달한다.

## Acceptance Criteria

1. live mode에서 live stream mock contract를 로드한다.
2. 성공 시 `FocusVideoStage`가 기존 `LiveStreamPlayer`를 렌더링한다.
3. `streamUrl`은 opaque URL로 player에 전달되며 business logic으로 파싱하지 않는다.
4. loading 중에는 `영상을 불러오는 중입니다.` 상태가 표시된다.
5. recording mode에서는 live player를 mount하지 않는다.
6. Spring Boot/DB/media/AI/server overlay 구현은 추가하지 않는다.

## 구현 범위

- `FocusVideoStage` live stream rendering 추가.
- `CameraFocus` page에서 live stream load 연결.
- focused tests 추가.

## 제외 범위

- player status bridge의 상세 실패 matrix. 이는 Story 3.2 범위다.
- recording playback player.
- media server 구현.

## 구현 순서

- [x] FocusVideoStage live player tests를 먼저 작성한다.
- [x] CameraFocus page에서 live stream state를 로드한다.
- [x] FocusVideoStage에서 LiveStreamPlayer를 렌더링한다.
- [x] focused tests, full regression, build를 통과시킨다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- FocusVideoStage --run` (red phase: failed before live stream integration)
- `npm test -- FocusVideoStage --run` (green phase: 3 passed)
- `npm test -- --run` (full frontend regression: 186 passed)
- `npm run build` (TypeScript build and Vite production build passed)

### Completion Notes List

- Connected CameraFocus page to `focusApiService.getCameraLiveStream` for live mode.
- Extended FocusVideoStage to render loading state and existing LiveStreamPlayer with opaque stream URL.
- Mapped focus/live stream DTOs to the existing Camera player shape without adding media/backend responsibilities.
- Added FocusVideoStage live integration tests and verified full regression/build.

### File List

- `_bmad-output/implementation-artifacts/3-1-live-mode-livestreamplayer-integration.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/__tests__/FocusVideoStage.test.tsx`

## Change Log

- 2026-08-15: Created Story 3.1 live mode LiveStreamPlayer integration story.
- 2026-08-15: Implemented Story 3.1 live mode stream loading and LiveStreamPlayer integration.
