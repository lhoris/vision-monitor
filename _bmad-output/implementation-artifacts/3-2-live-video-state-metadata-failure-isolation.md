---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 3.2: Live Video State and Metadata Failure Isolation

Status: review

## 목표

live stream 실패와 camera metadata 실패를 독립적으로 표시한다. 영상 실패가 metadata panel을 막지 않고, metadata 실패가 live player 표시를 막지 않아야 한다.

## Acceptance Criteria

1. live stream 실패 시 video stage에 오류 상태를 표시한다.
2. live forbidden 시 video stage에 권한 없음 메시지를 표시한다.
3. camera metadata 실패 시 metadata panel에 오류 상태를 표시한다.
4. live stream 성공과 metadata 실패를 독립적으로 처리한다.
5. metadata 성공과 live stream 실패를 독립적으로 처리한다.
6. 제한 metadata는 forbidden 상태에서 렌더링하지 않는다.

## 구현 범위

- `FocusVideoStage` live error/forbidden state 추가.
- `FocusMetadataPanel` error/forbidden state 추가.
- `CameraFocus` page에서 response error를 독립 state로 관리.
- focused component/page tests 추가.

## 제외 범위

- retry button 상세 구현. Story 6.1에서 진행.
- 권한 없음 전체 hardening. Story 6.2에서 진행.

## 구현 순서

- [x] failure state tests를 먼저 작성한다.
- [x] FocusVideoStage live error/forbidden state를 구현한다.
- [x] FocusMetadataPanel error/forbidden state를 구현한다.
- [x] CameraFocus page에서 독립 error state를 연결한다.
- [x] focused tests, full regression, build를 통과시킨다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- FocusVideoStage FocusMetadataPanel --run` (red phase: failed before isolated failure states)
- `npm test -- FocusVideoStage FocusMetadataPanel --run` (green phase: 9 passed)
- `npm test -- --run` (full frontend regression: 190 passed)
- `npm run build` (TypeScript build and Vite production build passed)

### Completion Notes List

- Added independent live stream error and forbidden states to FocusVideoStage.
- Added metadata error and forbidden states to FocusMetadataPanel without rendering restricted metadata.
- Connected CameraFocus page to separate `cameraError`, `liveError`, and `liveLoading` state.
- Verified video/metadata failure isolation with focused tests, full regression, and build.

### File List

- `_bmad-output/implementation-artifacts/3-2-live-video-state-metadata-failure-isolation.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- `frontend/src/components/CameraFocus/__tests__/FocusVideoStage.test.tsx`
- `frontend/src/components/CameraFocus/__tests__/FocusMetadataPanel.test.tsx`

## Change Log

- 2026-08-15: Created Story 3.2 live video and metadata failure isolation story.
- 2026-08-15: Implemented Story 3.2 independent live video and metadata failure states.
