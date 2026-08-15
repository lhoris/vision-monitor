---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 4.1: Recording Mode 전환과 Playback Session 로딩

Status: review

## 목표

운영자가 Camera Focus 화면에서 `녹화` 탭으로 전환하면 URL query를 `mode=recording`으로 동기화하고, 선택 카메라의 mock playback session을 로드해 `playbackUrl` 기반 녹화 player를 표시한다.

## Acceptance Criteria

1. Focus 화면에서 `녹화` 탭을 선택하면 URL query가 `mode=recording`으로 갱신된다.
2. recording mode에서는 `GET /api/cameras/{cameraId}/playback?from&to` 의미의 frontend mock service가 호출된다.
3. playback API 성공 시 `FocusVideoStage`가 playback player에 `playbackUrl`을 전달한다.
4. live `streamUrl`은 playback player source로 재사용하지 않는다.
5. recording mode 진입 시 기본 time range는 최근 1시간으로 고정된다.
6. Spring Boot/DB/RTSP ingest/AI inference/media distribution/server overlay 구현은 추가하지 않는다.

## 구현 범위

- `useCameraPlayback` hook 추가.
- `CameraFocus` page에서 recording mode playback session load 연결.
- `CameraFocusShell` mode tab click을 route query 갱신에 연결.
- `FocusVideoStage` recording mode에서 `StreamPlayerComponent`를 playback source로 렌더링.
- focused tests와 full regression/build 검증.

## 제외 범위

- 타임라인 segment 시각화와 event marker. Story 4.2에서 진행.
- 이벤트 선택과 seek/remount 전략. Story 4.3에서 진행.
- playback/events 독립 fallback matrix. Story 4.4에서 진행.
- 실제 backend, VMS, media server 연동.

## 구현 순서

- [x] recording mode tests를 먼저 작성한다.
- [x] `useCameraPlayback` hook으로 playback session 상태와 기본 range를 관리한다.
- [x] `CameraFocus` page에서 recording mode에만 playback session을 로드한다.
- [x] mode tab click으로 query를 갱신한다.
- [x] `FocusVideoStage`에서 playback player에 opaque `playbackUrl`을 전달한다.
- [x] focused tests, full regression, build를 통과시킨다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- CameraFocus FocusVideoStage --run` (red phase: failed before recording playback implementation)
- `npm test -- CameraFocus FocusVideoStage --run` (green phase: 22 passed)
- `npm test -- CameraFocus FocusVideoStage useCameraPlayback --run` (focused regression: 24 passed)
- `npm test -- --run` (full frontend regression: 194 passed)
- `npm run build` (TypeScript build and Vite production build passed; Vite chunk-size warning remains)

### Completion Notes List

- Added `useCameraPlayback` to load the mock playback session only when recording mode is active.
- Connected CameraFocus recording mode to the playback session state while keeping live stream state separate.
- Added mode tab click handling so the focus route query updates to `mode=recording` or `mode=live`.
- Rendered recording playback through `StreamPlayerComponent` using opaque `playbackUrl`; live `streamUrl` is not reused.
- Normalized CameraFocus shell/video labels to readable Korean while preserving the existing layout.

### File List

- `_bmad-output/implementation-artifacts/4-1-recording-mode-playback-session-loading.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/hooks/useCameraPlayback.ts`
- `frontend/src/hooks/index.ts`
- `frontend/src/hooks/__tests__/useCameraPlayback.test.tsx`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/pages/__tests__/CameraFocus.test.tsx`
- `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/__tests__/FocusVideoStage.test.tsx`

## Change Log

- 2026-08-15: Created Story 4.1 recording mode playback session loading story.
- 2026-08-15: Implemented Story 4.1 recording mode playback session loading, route query switching, and tests.
