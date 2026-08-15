---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 2.2: CameraFocus Route and Page Shell

Status: review

## 목표

`/live/cameras/:cameraId?mode=live|recording&eventId=` route와 `CameraFocus` page shell을 추가한다. 이 Story는 URL param/query parsing과 새로고침 복원 가능한 초기 shell만 다룬다.

## Acceptance Criteria

1. `/live/cameras/:cameraId` route가 authenticated app routes에 추가된다.
2. `cameraId` route param은 number로 파싱된다.
3. `mode=live` 또는 mode 없음/invalid는 `live`로 보정된다.
4. `mode=recording`은 recording mode로 반영된다.
5. 유효한 `eventId` query는 selected event id로 반영된다.
6. invalid/missing `eventId`는 undefined로 반영된다.
7. page shell은 아직 player를 mount하지 않고 route state를 확인 가능한 기본 영역만 렌더링한다.
8. Spring Boot/DB/media/AI/server overlay 구현은 추가하지 않는다.

## 구현 범위

- `frontend/src/pages/CameraFocus.tsx` 추가.
- `frontend/src/pages/cameraFocusRoute.ts` route state parser 추가.
- `frontend/src/App.tsx` route 추가.
- route parser/page shell tests 추가.

## 제외 범위

- Focus layout/panel/player 구현.
- Live Grid tile click 연결.
- StreamPlayer 연결.
- Recording timeline/event list.

## 구현 순서

- [x] route parser/page shell tests를 먼저 작성한다.
- [x] route state parser를 구현한다.
- [x] `CameraFocus` page shell을 추가한다.
- [x] `App.tsx`에 route를 추가한다.
- [x] focused tests, full regression, build를 통과시킨다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- CameraFocus cameraFocusRoute --run` (red phase: failed before page/parser implementation)
- `npm test -- CameraFocus cameraFocusRoute --run` (green phase: 11 passed)
- `npm test -- --run` (full frontend regression: 179 passed)
- `npm run build` (TypeScript build and Vite production build passed)

### Completion Notes List

- Added `parseCameraFocusRouteState` for cameraId, mode, and eventId parsing.
- Added `CameraFocus` page shell with invalid camera handling and route state display.
- Added authenticated `/live/cameras/:cameraId` route in `App.tsx`.
- Added route parser and page shell tests and verified full regression/build.

### File List

- `_bmad-output/implementation-artifacts/2-2-camera-focus-route-page-shell.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/App.tsx`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/pages/cameraFocusRoute.ts`
- `frontend/src/pages/__tests__/CameraFocus.test.tsx`
- `frontend/src/pages/__tests__/cameraFocusRoute.test.ts`

## Change Log

- 2026-08-15: Created Story 2.2 CameraFocus route and page shell story.
- 2026-08-15: Implemented Story 2.2 route parser, page shell, app route, and tests.
