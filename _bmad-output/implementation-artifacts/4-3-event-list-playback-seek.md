---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 4.3: 이벤트 목록 선택과 녹화 Player Seek 연결

Status: review

## 목표

운영자가 녹화 탭의 이벤트 목록에서 이벤트를 선택하면 URL query에 `eventId`가 반영되고, 녹화 player가 해당 이벤트 전후 시점으로 이동할 준비를 하며, 우측 패널이 이벤트 상세 metadata를 표시한다.

## Acceptance Criteria

1. 녹화 탭 이벤트 row 선택 시 URL query에 `eventId={eventId}`가 반영된다.
2. keyboard Enter/Space로도 이벤트 row를 선택할 수 있다.
3. player seek target은 `playbackHint.seekAt`이 있으면 그 값을 우선 사용한다.
4. `playbackHint.seekAt`이 없으면 `occurredAt - preRollSeconds`를 사용한다.
5. 이벤트가 선택되면 metadata panel은 event mode로 전환하고 이벤트 상세 metadata를 표시한다.
6. 누락 metadata 필드는 `-`로 표시한다.

## 구현 범위

- `RecordingEventList` 컴포넌트 추가.
- `RecordingTimeline` marker 선택 상태와 목록 선택 상태 공유.
- CameraFocus route query의 `eventId` 갱신 연결.
- selected event detail load와 metadata panel event mode 표시.
- playback player seek target 계산과 remount key/source label 연결.

## 제외 범위

- 실제 player imperative seek API.
- event detail 실패 fallback matrix. Story 4.4/6.x에서 확장.
- alert 관련 event detail 우선순위. Epic 5에서 진행.
- 실제 backend, VMS, media server 연동.

## 구현 순서

- [x] event list, query update, seek target tests를 먼저 작성한다.
- [x] `RecordingEventList`를 추가하고 row/button 선택을 구현한다.
- [x] `CameraFocus`에서 event selection query 갱신과 detail load를 연결한다.
- [x] `FocusVideoStage`에서 selected event detail 기반 seek target을 player에 전달한다.
- [x] `FocusMetadataPanel`에서 event mode metadata를 표시한다.
- [x] focused tests, full regression, build를 통과시킨다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- RecordingEventList FocusVideoStage CameraFocus --run` (red phase: failed before event list/seek integration)
- `npm test -- RecordingEventList FocusVideoStage CameraFocus --run` (green phase: 31 passed)
- `npm test -- --run` (full frontend regression: 203 passed)
- `npm run build` (TypeScript build and Vite production build passed; Vite chunk-size warning remains)

### Completion Notes List

- Added `RecordingEventList` with click and keyboard event selection.
- Connected event selection to CameraFocus route query as `eventId={eventId}`.
- Loaded selected event detail from the focus API facade and rendered event metadata in the right panel.
- Added playback seek target calculation using `playbackHint.seekAt` first, with pre-roll fallback.
- Passed seek target through the playback source label and remount key for MVP playback behavior.

### File List

- `_bmad-output/implementation-artifacts/4-3-event-list-playback-seek.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/components/CameraFocus/RecordingEventList.tsx`
- `frontend/src/components/CameraFocus/index.ts`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- `frontend/src/components/CameraFocus/__tests__/RecordingEventList.test.tsx`
- `frontend/src/components/CameraFocus/__tests__/FocusVideoStage.test.tsx`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/pages/__tests__/CameraFocus.test.tsx`
- `frontend/src/mocks/eventDetails.ts`

## Change Log

- 2026-08-15: Created Story 4.3 event list playback seek story.
- 2026-08-15: Implemented Story 4.3 event selection, route query update, event detail panel, and playback seek target.
