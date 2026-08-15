---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 4.2: 녹화 타임라인과 Event Marker 표시

Status: review

## 목표

운영자가 녹화 탭에서 playback session의 녹화 가능 구간과 공백 구간, 같은 시간 범위의 이벤트 발생 시점을 한 타임라인에서 확인할 수 있게 한다.

## Acceptance Criteria

1. playback session의 `timelineSegments`를 available/gap 구간으로 구분해 표시한다.
2. gap 구간은 seek 불가 상태로 표시하고 accessible label에 이를 포함한다.
3. 같은 시간 범위의 이벤트 목록을 로드해 각 이벤트의 `occurredAt` 위치에 marker를 표시한다.
4. event marker는 색상만으로 의미를 전달하지 않고 accessible label로 시간과 이벤트명을 제공한다.
5. segments나 events가 비어 있어도 타임라인은 깨지지 않고 빈 상태를 표시한다.
6. 이벤트 선택과 player seek 연결은 Story 4.3으로 남긴다.

## 구현 범위

- `RecordingTimeline` 컴포넌트 추가.
- recording mode에서 playback session과 event list를 타임라인에 전달.
- event list 로딩을 위한 frontend hook 추가.
- component/page focused tests와 full regression/build 검증.

## 제외 범위

- event row/list UI와 선택 상태.
- marker click 시 route/event seek 연결.
- playback/events 실패 독립 fallback matrix.
- 실제 backend, VMS, media server 연동.

## 구현 순서

- [x] timeline segment/marker tests를 먼저 작성한다.
- [x] `RecordingTimeline`에서 segment와 gap 상태를 렌더링한다.
- [x] event marker 위치와 accessible label을 렌더링한다.
- [x] recording mode에서 camera events를 로드해 timeline에 전달한다.
- [x] focused tests, full regression, build를 통과시킨다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- RecordingTimeline --run` (red phase: failed before RecordingTimeline existed)
- `npm test -- RecordingTimeline FocusVideoStage CameraFocus useCameraFocusEvents --run` (focused regression: 27 passed)
- `npm test -- --run` (full frontend regression: 199 passed)
- `npm run build` (TypeScript build and Vite production build passed; Vite chunk-size warning remains)

### Completion Notes List

- Added `RecordingTimeline` with available/gap segment rendering and seek-disabled accessible labels for gap segments.
- Added event markers positioned by `occurredAt` with accessible labels containing event time and title.
- Added `useCameraFocusEvents` to load mock camera events only in recording mode.
- Connected recording mode playback session and events to the timeline under the playback player.
- Normalized camera event mock titles to readable Korean for marker labels.

### File List

- `_bmad-output/implementation-artifacts/4-2-recording-timeline-event-markers.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/components/CameraFocus/RecordingTimeline.tsx`
- `frontend/src/components/CameraFocus/index.ts`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- `frontend/src/components/CameraFocus/__tests__/RecordingTimeline.test.tsx`
- `frontend/src/hooks/useCameraFocusEvents.ts`
- `frontend/src/hooks/index.ts`
- `frontend/src/hooks/__tests__/useCameraFocusEvents.test.tsx`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/mocks/cameraEvents.ts`

## Change Log

- 2026-08-15: Created Story 4.2 recording timeline and event marker story.
- 2026-08-15: Implemented Story 4.2 recording timeline segments, gap labels, event markers, event hook, and tests.
