---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 4.4: Playback 실패와 Events 실패의 독립 fallback

Status: review

## 목표

녹화 탭에서 playback session 조회와 events 조회 중 하나가 실패해도 성공한 영역은 계속 표시한다.

## Acceptance Criteria

1. playback session 실패 시 녹화 player/timeline 영역에 오류를 표시한다.
2. playback session 실패여도 events 조회가 성공하면 이벤트 목록은 표시한다.
3. events 조회 실패 시 이벤트 목록 영역에 오류를 표시한다.
4. events 조회 실패여도 playback session 조회가 성공하면 녹화 player/timeline은 표시한다.
5. 둘 다 실패하면 각 영역에 독립 오류가 표시된다.
6. retry button 상세 동작은 Story 6.1로 남긴다.

## 구현 범위

- playback session, timeline/player, event list 상태 분리.
- `FocusVideoStage` recording fallback 렌더링 개선.
- events error/loading 상태 전달.
- focused tests와 full regression/build 검증.

## 제외 범위

- 실제 retry 동작.
- event detail 실패 hardening.
- backend/VMS/media server 연동.

## 구현 순서

- [x] playback/events failure matrix tests를 먼저 작성한다.
- [x] playback 실패 시 events list를 유지한다.
- [x] events 실패 시 playback player/timeline을 유지한다.
- [x] both failure 상태를 독립 메시지로 표시한다.
- [x] focused tests, full regression, build를 통과시킨다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- FocusVideoStage --run` (red phase: failed before independent fallback rendering)
- `npm test -- FocusVideoStage --run` (green phase: 9 passed)
- `npm test -- --run` (full frontend regression: 205 passed)
- `npm run build` (TypeScript build and Vite production build passed; Vite chunk-size warning remains)

### Completion Notes List

- Split recording playback area and event list fallback rendering.
- Playback failure now shows a recording video error while preserving successful event list data.
- Event loading failure now shows an event-list error while preserving successful playback player/timeline data.
- Kept retry behavior out of scope for Story 6.1.

### File List

- `_bmad-output/implementation-artifacts/4-4-playback-events-independent-fallback.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/components/CameraFocus/__tests__/FocusVideoStage.test.tsx`

## Change Log

- 2026-08-15: Created Story 4.4 playback/events independent fallback story.
- 2026-08-15: Implemented Story 4.4 independent playback/events fallback rendering and tests.
