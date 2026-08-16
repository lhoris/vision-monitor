# BMAD to GitHub Spec Kit Source Map

작성일: 2026-08-16

## 목적

이 문서는 기존 BMAD Method 산출물을 GitHub Spec Kit의 입력 소스로 재분류하기 위한 마이그레이션 작업 문서다. BMAD 폴더를 삭제하기 전에 필요한 제품 요구사항, 아키텍처 결정, UX 기준, 구현 상태를 Spec Kit artifact로 옮길 수 있게 정리한다.

## 현재 상태

- Spec Kit 구조는 이미 설치되어 있다.
  - `.specify/`
  - `.github/agents/speckit.*.agent.md`
  - `.github/prompts/speckit.*.prompt.md`
  - `.agents/skills/speckit-*`
  - `.claude/skills/speckit-*`
- BMAD 구조는 아직 남아 있다.
  - `_bmad/`
  - `_bmad-output/`
  - `.agents/skills/bmad-*`
  - `.claude/skills/bmad-*`
  - `.github/agents/bmad-*.agent.md`
- `.specify/memory/constitution.md`는 아직 템플릿 상태다.
- BMAD 원본 문서 일부는 mojibake가 있어 그대로 Spec Kit 입력으로 쓰기 어렵다. 이관 시 정상화된 요약을 기준으로 사용한다.

## BMAD Source Inventory

| BMAD source | 내용 | Spec Kit target | 처리 |
| --- | --- | --- | --- |
| `_bmad-output/planning-artifacts/prd-camera-focus-view.md` | Camera focus view PRD, FR/NFR/AC, MVP 경계 | `spec.md` | 요구사항과 acceptance scenario로 정규화 |
| `_bmad-output/planning-artifacts/epics.md` | 6개 Epic, 22개 Story, coverage matrix | `tasks.md` | 완료/미완료를 나눠 tasks 후보로 변환 |
| `_bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md` | 아키텍처 불변조건, route, API envelope, URL 계약 | `plan.md`, `research.md`, `contracts/` | 기술 제약과 contract 결정으로 변환 |
| `_bmad-output/planning-artifacts/architecture/.../BROWNFIELD-ARCHITECTURE.md` | 기존 frontend/backend 구조와 연결 지점 | `plan.md`, `quickstart.md` | brownfield context와 validation guide에 반영 |
| `_bmad-output/planning-artifacts/ux-designs/.../DESIGN.md` | 색상, typography, layout, component style | `plan.md`, `quickstart.md` | UX constraints와 visual validation 기준으로 반영 |
| `_bmad-output/planning-artifacts/ux-designs/.../EXPERIENCE.md` | 사용자 흐름, screen behavior, responsive/accessibility | `spec.md`, `tasks.md` | scenario와 UX acceptance criteria로 반영 |
| `_bmad-output/planning-artifacts/implementation-readiness-report-2026-08-15.md` | 조건부 통과, blocker/risk | `research.md`, `plan.md` | risk와 migration decision으로 반영 |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Story별 구현 상태 | `tasks.md` | 완료/남은 작업 판정의 근거로 사용 |
| `_bmad-output/implementation-artifacts/*.md` | 개별 story 파일 | `tasks.md` detail | 필요한 경우 세부 task 근거로 참조 |

## Spec Kit Artifact Mapping

### `.specify/memory/constitution.md`

BMAD에서 옮겨야 할 프로젝트 원칙:

1. Vision Monitor는 영상 플랫폼 UI이며, 외부 VMS/AI/Media Server가 제공하는 URL과 메타데이터를 표시한다.
2. MVP는 Spring Boot 실제 API 구현 없이 frontend mock service/mock adapter로 진행할 수 있다.
3. RTSP ingest, FFmpeg/transcoding, media distribution, AI inference, server-side overlay, 원본 영상 저장/보관은 Vision Monitor MVP 범위가 아니다.
4. `streamUrl`과 `playbackUrl`은 분리된 opaque URL 계약이다. Frontend는 URL 구조를 업무 로직으로 해석하지 않는다.
5. API 형태는 replaceable mock contract여야 하며, 이후 Spring Boot API로 교체 가능해야 한다.
6. 영상 실패, metadata 실패, playback 실패, events 실패, alerts 실패는 독립 fallback으로 처리한다.
7. UI는 운영 모니터링 화면이며 landing/marketing 페이지가 아니다.
8. 테스트는 user-facing behavior, contract adapter, route state, partial failure, accessibility 중심으로 작성한다.

### `specs/001-camera-focus-view/spec.md`

Spec Kit specify 입력으로 옮길 핵심:

- 사용자는 Live Grid에서 특정 카메라를 화면 확대 보기로 진입한다.
- 화면 확대 보기는 같은 하위 공정 탭의 카메라 목록을 유지한다.
- 사용자는 실시간 영상과 녹화 영상을 전환한다.
- 실시간 영상은 `streamUrl`, 녹화 영상은 `playbackUrl` 기반이다.
- 오른쪽 패널에는 카메라, 이벤트, 알람 관련 metadata가 표시된다.
- 녹화 화면에는 timeline, event marker, event list, event seek가 필요하다.
- 알람/경고는 영상 시야를 과도하게 방해하지 않는 toast/banner로 표시되고 사용자가 클릭해 dismiss할 수 있다.
- Rename한 카메라 제목은 grid와 focus view에서 일관되게 보여야 한다.
- 테마1/2/3에서 제목, dialog, recording UI 글자 대비가 유지되어야 한다.

### `specs/001-camera-focus-view/plan.md`

Plan에 옮길 기술 context:

- Frontend: React 19, Vite 8, TypeScript, React Router, Redux Toolkit.
- Stream components: `LiveStreamPlayer`, `StreamPlayerComponent`.
- Feature route: `/live/cameras/:cameraId?mode=live|recording&eventId={eventId}`.
- Additional route context: `tabId`, `subTabId`, `cameraIds`, `cameraNames`.
- API facade: `focusApiService`, `cameraService`, `eventService`, `recordingService`.
- Mock contracts:
  - `GET /api/cameras/{cameraId}/focus`
  - `GET /api/cameras/{cameraId}/live-stream`
  - `GET /api/cameras/{cameraId}/playback`
  - `GET /api/cameras/{cameraId}/events`
  - `GET /api/cameras/{cameraId}/alerts/active`
  - optional `POST /api/events/{eventId}/acknowledge`
- Public contract decision: frontend mock-first, Spring Boot follow-on.

### `specs/001-camera-focus-view/contracts/`

Contract candidates:

- `camera-focus.contract.md`
  - `CameraFocusDto`
  - `LiveStreamDto`
  - `PlaybackSessionDto`
  - `CameraEventDto`
  - `ActiveAlertDto`
  - `EventDetailDto`
- `focus-route.contract.md`
  - route params and query params
  - `mode=live|recording`
  - `eventId`
  - source grid context via `tabId`, `subTabId`, `cameraIds`, `cameraNames`
- `ui-state.contract.md`
  - independent loading/error state for camera, live stream, playback, events, alerts
  - alert dismiss state scoped to route session

### `specs/001-camera-focus-view/data-model.md`

Data model candidates:

- Camera focus metadata
- Live stream source
- Playback session
- Timeline segment
- Camera event
- Event detail metadata
- Active alert
- Grid source context
- Camera title override
- Route session dismiss state

### `specs/001-camera-focus-view/tasks.md`

BMAD story state should not be copied blindly. Use this split:

Likely completed or mostly implemented:

- Focus metadata mock contract
- Live stream URL mock contract
- Playback/events mock contract
- Active alert/event detail mock contract
- Focus API service/type layer
- Focus route/page shell
- Focus shell layout and metadata panel
- Live grid focus route entry
- Live mode stream player integration
- Live video state/failure isolation
- Recording playback session loading
- Recording timeline event markers
- Event list playback seek
- Active alert toast/banner display
- Camera tile title rename and focus title propagation
- Theme-aware title/dialog/recording UI polish

Likely remaining or needs verification:

- Alert dismiss state scoped exactly to route session
- Alert/event metadata panel priority when active alert has `relatedEventId`
- Area-specific retry UX
- Forbidden state protected metadata verification
- Responsive validation at 1920x1080, 1366x768, and mobile/tablet breakpoints
- Keyboard/ARIA pass for tabs, event list, alert toast, focus route entry
- Product boundary regression check
- Optional backend/Spring Boot API replacement plan

### `quickstart.md`

Validation scenarios to carry forward:

1. Open `/live`, select a camera, enter `/live/cameras/:cameraId?mode=live`.
2. Verify focus view uses only cameras from the source subtab.
3. Rename a camera tile, enter focus view, verify the title persists in focus tabs/player/metadata.
4. Switch live/recording mode and verify URL query updates.
5. Select a recording event and verify `eventId` query and playback seek target.
6. Trigger a manual test alert and dismiss it by click.
7. Switch theme1/theme2/theme3 and verify title, rename dialog, alert toast, recording timeline/event list contrast.
8. Simulate partial failures for camera, live stream, playback, events, and alerts.
9. Verify forbidden responses do not expose protected metadata.

## Deletion Candidates After Migration

Delete after Spec Kit artifacts are created and reviewed:

- `_bmad/`
- `_bmad-output/`
- `.agents/skills/bmad-*`
- `.claude/skills/bmad-*`
- `.github/agents/bmad-*.agent.md`

Keep:

- `.specify/`
- `.agents/skills/speckit-*`
- `.claude/skills/speckit-*`
- `.github/agents/speckit.*.agent.md`
- `.github/prompts/speckit.*.prompt.md`

## Migration Order

1. Commit unrelated UI cursor fix.
2. Create this source map and a normalized Spec Kit seed input.
3. Update `.specify/memory/constitution.md`.
4. Create `specs/001-camera-focus-view/spec.md` using the normalized seed.
5. Run Spec Kit plan/tasks flow.
6. Compare generated `tasks.md` against BMAD sprint status.
7. Delete BMAD folders and BMAD agent files.
8. Run test/build validation.
9. Commit migration.

