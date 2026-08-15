---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 2.4: Live Grid Focus Route Entry

Status: review

## 목표

Live Grid 카메라 타일에서 명시적 focus action으로 `/live/cameras/:cameraId?mode=live` route에 진입할 수 있게 한다.

## Acceptance Criteria

1. 카메라가 배치된 Grid cell에는 focus route 진입 버튼이 표시된다.
2. 버튼 클릭 시 `/live/cameras/{cameraId}?mode=live`로 이동한다.
3. drag handle과 focus click target은 분리된다.
4. 빈 cell의 add camera 동작은 유지된다.
5. Spring Boot/DB/media/AI/server overlay 구현은 추가하지 않는다.

## 구현 범위

- `DraggableCell` focus action prop/button 추가.
- `GridContainer`에서 navigate 연결.
- interaction tests 추가.

## 제외 범위

- Focus page 상세 UI 추가.
- StreamPlayer 연결.
- Keyboard/ARIA 최종 검증은 Story 6.4에서 수행.

## 구현 순서

- [x] DraggableCell focus action tests를 먼저 작성한다.
- [x] DraggableCell에 명시적 focus button을 추가한다.
- [x] GridContainer에서 route navigate를 연결한다.
- [x] focused tests, full regression, build를 통과시킨다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- DraggableCell --run` (red phase: failed before focus action implementation)
- `npm test -- DraggableCell --run` (green phase: 2 passed)
- `npm test -- --run` (full frontend regression: 183 passed)
- `npm run build` (TypeScript build and Vite production build passed)

### Completion Notes List

- Added explicit focus action button to occupied Grid camera cells.
- Wired `GridContainer` to navigate to `/live/cameras/{cameraId}?mode=live`.
- Kept drag handle and add-camera empty cell behavior separate.
- Added DraggableCell interaction tests and verified full regression/build.

### File List

- `_bmad-output/implementation-artifacts/2-4-live-grid-focus-route-entry.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/components/Grid/DraggableCell.tsx`
- `frontend/src/components/Grid/GridContainer.tsx`
- `frontend/src/components/Grid/__tests__/DraggableCell.test.tsx`

## Change Log

- 2026-08-15: Created Story 2.4 Live Grid focus route entry story.
- 2026-08-15: Implemented Story 2.4 Live Grid focus route entry button, navigation, and tests.
