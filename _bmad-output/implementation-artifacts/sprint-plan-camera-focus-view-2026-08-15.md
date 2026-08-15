# Vision Monitor 카메라 집중 보기 / 확대 보기 MVP Sprint Plan

**Date:** 2026-08-15  
**Project:** vision-monitor  
**Status:** draft for implementation  
**Tracking:** `_bmad-output/implementation-artifacts/sprint-status.yaml`

## MVP 전제

- MVP에서는 Spring Boot Backend API를 실제 구현하지 않는다.
- Backend API는 frontend mock service 또는 mock adapter로 처리한다.
- 단, mock endpoint와 DTO contract는 나중에 실제 Spring Boot API로 교체 가능하도록 고정한다.
- `GET /api/cameras/{cameraId}/focus`는 집중 보기 aggregate mock API로 사용한다.
- `GET /api/cameras/{cameraId}`는 기본 카메라 상세 mock API로 유지한다.
- `POST /api/events/{eventId}/acknowledge`는 이벤트 확인 mock API로 사용한다. 기존 `PUT` 호출은 service layer에서 `POST` 기준으로 맞춘다.
- Vision Monitor는 RTSP ingest, AI inference, media distribution, server-side overlay를 직접 구현하지 않는다.

## Sprint 0: 시작 전 정리

| Task | Dependency | Acceptance Criteria | Test Target |
| --- | --- | --- | --- |
| 문서 인코딩 정상화 | 없음 | PRD, Architecture, UX, Epics, Readiness 문서를 UTF-8 정상 표시본으로 확인한다. 구현자는 깨진 한글 없이 FR/NFR/UX-DR/Story를 읽을 수 있다. | 문서 열람 smoke check, 주요 키워드 검색 |
| MVP mock contract freeze | 문서 정리 | Focus, camera detail, live-stream, playback, events, alerts, acknowledge mock endpoint와 DTO를 한 표로 고정한다. Spring Boot 구현은 후속 범위로 표시한다. | TypeScript type review, service method signature review |

## Sprint Ordering

### Sprint Slice 1: Mock Contract Foundation

| Story | MVP Scope | Dependency | Acceptance Criteria | Test Target |
| --- | --- | --- | --- | --- |
| 1.1 카메라 Focus 메타데이터 API 제공 | Backend 구현 대신 `CameraFocusDto`, `CameraCapabilitiesDto`, `RecentEventSummaryDto`와 `GET /api/cameras/{cameraId}/focus` mock adapter를 만든다. | Sprint 0 | valid/404/forbidden mock 응답이 `ApiResponse<T>` 형태로 반환된다. 제한 metadata는 forbidden에서 노출되지 않는다. | `cameraFocus` type tests, mock adapter tests |
| 1.2 실시간 Stream URL API 계약 제공 | `GET /api/cameras/{cameraId}/live-stream` mock adapter와 `LiveStreamDto`를 만든다. | 1.1 | `streamUrl`, `streamProtocol`, `expiresAt`, `status`, `resolution`, `fps`가 opaque URL 계약으로 반환된다. | live-stream fixture tests, signed URL expiry fixture |
| 1.3 녹화 Playback과 이벤트 목록 API 계약 제공 | `GET /api/cameras/{cameraId}/playback`, `GET /api/cameras/{cameraId}/events` mock adapter와 DTO를 만든다. | 1.1 | playback session, gap segment, empty events, event metadata 확장 필드를 mock으로 제공한다. | playback/events fixture tests |
| 1.4 활성 알람과 이벤트 상세 API 계약 제공 | `GET /api/cameras/{cameraId}/alerts/active`, `GET /api/events/{eventId}`, `POST /api/events/{eventId}/acknowledge` mock adapter를 만든다. | 1.3 | active alert 없음/있음, related event detail, acknowledge mock response가 POST 기준으로 동작한다. | alert/event detail/ack mock tests |
| 2.1 Frontend Focus API 타입과 Service 레이어 추가 | mock adapter를 실제 service 인터페이스 뒤에 숨긴다. | 1.1-1.4 | UI는 mock 구현체를 직접 알지 않고 service method만 호출한다. 나중에 Spring Boot client로 교체 가능한 구조다. | `cameraService`, `eventService`, `recordingService` tests |

### Sprint Slice 2: Route와 Focus Shell

| Story | MVP Scope | Dependency | Acceptance Criteria | Test Target |
| --- | --- | --- | --- | --- |
| 2.2 CameraFocus Route와 Page Shell 생성 | `/live/cameras/:cameraId?mode=live|recording&eventId=` route와 page shell을 만든다. | 2.1 | route param/query가 `cameraId`, `mode`, `eventId`로 파싱되고 새로고침 시 복원된다. | route rendering tests |
| 2.3 Focus Shell Layout과 기본 Metadata Panel 구성 | 공정 탭, mode 탭, 대형 영상 영역, 우측 metadata panel shell을 구성한다. | 2.2 | 2-column desktop layout, 360-420px panel, camera 기본 정보 표시, missing field fallback이 동작한다. | layout/component tests |
| 2.4 Live Grid 타일에서 Focus Route 진입 연결 | Grid tile의 explicit focus action 또는 click target을 route navigation에 연결한다. | 2.2 | drag handle과 focus click target이 충돌하지 않고, 진입 후 뒤로가기가 Live Grid로 돌아간다. | Grid/DraggableCell interaction tests |

### Sprint Slice 3: Live View

| Story | MVP Scope | Dependency | Acceptance Criteria | Test Target |
| --- | --- | --- | --- | --- |
| 3.1 Live Mode에서 LiveStreamPlayer 연결 | mock `streamUrl`을 기존 `LiveStreamPlayer`/`StreamPlayerComponent`에 전달한다. | 2.3, 1.2 | live mode에서 player가 mount되고 loading/playing/error/forbidden 상태를 stage 안에 표시한다. | FocusVideoStage tests, StreamPlayer integration smoke |
| 3.2 실시간 영상 상태와 메타데이터 실패 독립 처리 | live stream 실패와 camera metadata 실패를 분리한다. | 3.1 | 영상 실패가 metadata panel을 막지 않고, metadata 실패가 영상 표시를 막지 않는다. | failure matrix tests |

### Sprint Slice 4: Recording Playback

| Story | MVP Scope | Dependency | Acceptance Criteria | Test Target |
| --- | --- | --- | --- | --- |
| 4.1 Recording Mode 전환과 Playback Session 로딩 | recording mode에서 mock playback session을 로드하고 player source를 연결한다. | 2.3, 1.3 | `mode=recording` query가 반영되고 `playbackUrl` 기반 player/timeline 기본 영역이 표시된다. | recording route tests |
| 4.2 녹화 타임라인과 Event Marker 표시 | `RecordingTimeline`에 available/gap segment와 event marker를 표시한다. | 4.1 | gap은 seek 불가로 표시되고 marker는 색상 외 accessible label을 가진다. | timeline segment/marker tests |
| 4.3 이벤트 목록 선택과 녹화 Player Seek 연결 | event row 선택, query 갱신, player seek/remount 전략을 연결한다. | 4.2 | `eventId` query가 갱신되고 `playbackHint.seekAt` 또는 pre-roll 계산이 적용된다. panel mode는 event로 전환된다. | row click, keyboard, seek target tests |
| 4.4 Playback 실패와 Events 실패의 독립 fallback | playback/events 상태를 분리하고 실패 영역만 retry한다. | 4.1-4.3 | playback failure + events success, events failure + playback success, both failure가 각각 구분된다. | playback/events failure matrix tests |

### Sprint Slice 5: Alert Banner와 Alert/Event Metadata

| Story | MVP Scope | Dependency | Acceptance Criteria | Test Target |
| --- | --- | --- | --- | --- |
| 5.1 활성 알람 배너 표시 | mock active alerts로 `FocusAlertBanner`를 표시한다. | 2.3, 1.4 | active alert가 있으면 warning banner가 표시되고, 없으면 banner가 숨겨진다. | banner render tests |
| 5.2 Alert Banner 닫힘 상태를 Route Session 단위로 유지 | `dismissedAlertIds`를 route session UI state로 관리한다. | 5.1 | 같은 `alertId`는 dismiss 후 refetch에도 재표시되지 않고, 새 `alertId`는 표시된다. | dismiss/refetch tests, keyboard close tests |
| 5.3 Alert/Event 상세 Metadata Panel 연동 | alert 또는 related event detail을 panel mode에 연결한다. | 5.2, 4.3 | alert/event metadata 우선순위가 동작하고 누락 필드는 `-` 또는 `정보 없음`으로 표시된다. ACK workflow는 구현하지 않는다. | panel mode priority tests |

### Sprint Slice 6: Hardening and Regression

| Story | MVP Scope | Dependency | Acceptance Criteria | Test Target |
| --- | --- | --- | --- | --- |
| 6.1 영역별 실패 상태와 재시도 UX 정리 | `camera`, `liveStream`, `playback`, `events`, `alerts` 실패를 영역별로 통합 점검한다. | 3.2, 4.4, 5.3 | 실패한 영역만 fallback을 표시하고, retry는 해당 mock service만 다시 호출한다. | area failure matrix tests |
| 6.2 권한 없음 상태와 제한 Metadata 보호 | mock 401/403/`forbidden` 상태를 UI에 연결한다. | 6.1 | forbidden 상태는 일반 오류와 구분되고 제한 metadata가 DOM에 렌더링되지 않는다. | forbidden state tests |
| 6.3 반응형 레이아웃과 운영 모니터 기준 검증 | 1920x1080, 1366x768, 1024px 미만 layout을 검증한다. | 2.3, 4.2, 5.1 | panel width, video stage 비율, mobile column 전환이 UX-DR2/3 기준을 만족한다. | viewport smoke tests |
| 6.4 Keyboard와 ARIA 접근성 기준 충족 | tabs, event rows, alert dismiss, back action을 keyboard/ARIA로 검증한다. | 2.4, 4.3, 5.2 | tabs는 `role=tablist/tab`, alert는 `role=alert`, 주요 동작은 keyboard로 가능하다. | Testing Library role/name tests |
| 6.5 제품 경계와 회귀 방지 검증 | Spring Boot 구현 없이 frontend mock 기반 MVP가 제품 경계를 지키는지 점검한다. | 1.1-6.4 | RTSP ingest, AI inference, media distribution, server-side overlay 구현이 추가되지 않는다. `streamUrl`/`playbackUrl`은 opaque URL로 player에 전달된다. | code review checklist, MVP smoke test |

## 후속 범위로 내린 작업

- Spring Boot controller/service/repository/entity 실제 구현.
- DB migration 및 persistence-backed API.
- 외부 VMS/Media Server 실제 연동.
- SSE/WebSocket alert push.
- 서버 ACK/조치 workflow.
- PTZ, AI overlay, 다중 카메라 비교 보기.

## 실행 메모

- Story 1.1-1.4는 원래 backend contract story였지만, MVP에서는 frontend mock contract story로 재정의한다.
- 실제 endpoint 문자열은 mock adapter 내부에서도 public contract와 동일하게 유지한다.
- service layer는 `mock` 구현과 향후 `http` 구현을 교체할 수 있도록 provider boundary를 둔다.
- 모든 fixture 시각은 ISO-8601 + Asia/Seoul 표시 정책을 따른다.
- mock URL은 실제 media 처리를 흉내내되 URL 구조를 business logic으로 파싱하지 않는다.
