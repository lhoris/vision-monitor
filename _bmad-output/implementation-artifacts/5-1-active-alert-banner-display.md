---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 5.1: 활성 알람 배너 표시

Status: review

## 목표

Camera Focus 화면 상단에서 선택 카메라의 active alert를 즉시 확인할 수 있게 한다.

## Acceptance Criteria

1. active alerts mock API가 하나 이상의 alert를 반환하면 Focus 화면 상단에 `FocusAlertBanner`를 표시한다.
2. banner는 severity, message, location, status를 포함한다.
3. active alerts mock API가 빈 배열을 반환하면 banner를 표시하지 않는다.
4. banner가 없어도 metadata panel은 camera mode를 유지한다.
5. dismiss 동작은 Story 5.2로 남긴다.

## 구현 범위

- `FocusAlertBanner` 컴포넌트 추가.
- active alerts hook 추가.
- `CameraFocus` page와 `CameraFocusShell`에 alert banner 연결.
- focused tests와 full regression/build 검증.

## 제외 범위

- alert dismiss/session state.
- alert detail panel 우선순위.
- server ACK.

## 구현 순서

- [x] active alert banner tests를 먼저 작성한다.
- [x] `FocusAlertBanner`를 추가한다.
- [x] active alerts hook을 추가하고 Focus page에 연결한다.
- [x] 빈 alert 배열에서는 banner를 숨긴다.
- [x] focused tests, full regression, build를 통과시킨다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- FocusAlertBanner --run` (red phase: failed before FocusAlertBanner existed)
- `npm test -- FocusAlertBanner CameraFocus --run` (focused regression: 35 passed)
- `npm test -- --run` (full frontend regression: 207 passed)
- `npm run build` (TypeScript build and Vite production build passed; Vite chunk-size warning remains)

### Completion Notes List

- Added `FocusAlertBanner` to show active alert severity, message, location, and status.
- Added `useActiveCameraAlerts` and connected CameraFocus to the focus API active alert facade.
- Displayed the alert banner between the Focus header and content area.
- Kept empty alert arrays silent so metadata panel remains in camera mode.
- Normalized active alert mock text to readable Korean.

### File List

- `_bmad-output/implementation-artifacts/5-1-active-alert-banner-display.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/components/CameraFocus/FocusAlertBanner.tsx`
- `frontend/src/components/CameraFocus/index.ts`
- `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- `frontend/src/components/CameraFocus/__tests__/FocusAlertBanner.test.tsx`
- `frontend/src/hooks/useActiveCameraAlerts.ts`
- `frontend/src/hooks/index.ts`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/pages/__tests__/CameraFocus.test.tsx`
- `frontend/src/mocks/cameraAlerts.ts`

## Change Log

- 2026-08-15: Created Story 5.1 active alert banner display story.
- 2026-08-15: Implemented Story 5.1 active alert banner display, active alert hook, Focus page connection, and tests.
