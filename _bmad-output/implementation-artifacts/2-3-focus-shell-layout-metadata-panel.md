---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 2.3: Focus Shell Layout and Basic Metadata Panel

Status: review

## 목표

Camera Focus page에 운영 도구형 shell layout을 추가한다. 화면은 공정 탭, 실시간/녹화 mode 탭, 대형 영상 영역 placeholder, 우측 metadata panel을 포함한다.

## Acceptance Criteria

1. Focus shell은 landing/설명 화면 없이 바로 운영 화면을 표시한다.
2. Process tabs는 `ALL`, `가열`, `압연`, `냉각`, `시험`, `정정`을 표시한다.
3. Mode tabs는 `실시간`, `녹화`를 표시하고 route mode와 동기화된다.
4. Desktop layout은 video 영역과 360-420px 우측 metadata panel을 가진다.
5. Metadata panel은 camera focus metadata를 표시한다.
6. 누락 값은 `-`로 표시한다.
7. Video stage는 아직 player를 mount하지 않고 mode별 placeholder를 표시한다.
8. Spring Boot/DB/media/AI/server overlay 구현은 추가하지 않는다.

## 구현 범위

- `components/CameraFocus/CameraFocusShell.tsx`
- `components/CameraFocus/FocusMetadataPanel.tsx`
- `components/CameraFocus/FocusVideoStage.tsx`
- `CameraFocus` page에서 camera metadata load 및 shell 연결
- component/page tests

## 제외 범위

- 실제 StreamPlayer 연결.
- Recording timeline/event list.
- Alert banner.
- Grid tile click 진입.

## 구현 순서

- [x] layout/metadata panel tests를 먼저 작성한다.
- [x] CameraFocus shell components를 추가한다.
- [x] CameraFocus page에서 focus metadata를 로드해 shell에 연결한다.
- [x] focused tests, full regression, build를 통과시킨다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- CameraFocus FocusMetadataPanel --run` (red phase: failed before shell component implementation)
- `npm test -- CameraFocus FocusMetadataPanel --run` (green phase: 13 passed)
- `npm test -- --run` (full frontend regression: 181 passed)
- `npm run build` (TypeScript build and Vite production build passed)

### Completion Notes List

- Added CameraFocus shell with process tabs, mode tabs, video stage placeholder, and right metadata panel.
- Added FocusMetadataPanel with camera focus metadata and dash fallback for missing values.
- Added FocusVideoStage placeholders for live and recording modes.
- Connected CameraFocus page to `focusApiService.getCameraFocus`.
- Added component/page tests and verified full regression/build.

### File List

- `_bmad-output/implementation-artifacts/2-3-focus-shell-layout-metadata-panel.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/pages/__tests__/CameraFocus.test.tsx`
- `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/index.ts`
- `frontend/src/components/CameraFocus/__tests__/FocusMetadataPanel.test.tsx`

## Change Log

- 2026-08-15: Created Story 2.3 focus shell layout and metadata panel story.
- 2026-08-15: Implemented Story 2.3 focus shell layout, metadata panel, video placeholders, and tests.
