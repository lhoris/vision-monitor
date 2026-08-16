# Spec Kit Seed: Camera Focus View

이 문서는 BMAD 산출물을 기반으로 정리한 GitHub Spec Kit 입력 초안이다. `/speckit-specify` 또는 feature spec 작성 시 starting prompt/source로 사용한다.

## Feature Name

Camera Focus View / 화면 확대 보기

## Feature Goal

운영자가 Live Grid에서 특정 카메라를 선택해 큰 화면으로 실시간 영상 또는 녹화 영상을 확인하고, 관련 카메라/이벤트/알람 메타데이터를 같은 화면에서 볼 수 있게 한다.

## Product Boundary

Vision Monitor는 외부 VMS, AI system, Media Server가 제공하는 media URL과 metadata를 표시하는 frontend 중심 모니터링 UI다.

MVP에서 직접 구현하지 않는다:

- RTSP ingest
- FFmpeg/transcoding
- Media distribution
- AI inference
- Server-side overlay
- 원본 영상 저장/보관
- PTZ control
- 다중 카메라 비교 보기
- 서버 ACK 기반 알람 워크플로우

MVP는 frontend mock service/mock adapter를 기준으로 한다. Spring Boot API 실제 구현은 follow-on scope다. Mock contract는 이후 Spring Boot API로 교체 가능해야 한다.

## User Scenarios

### Scenario 1: Grid에서 화면 확대 보기 진입

Given 사용자가 Live Grid 화면을 보고 있다.
When 사용자가 특정 카메라의 확대 버튼을 선택한다.
Then `/live/cameras/:cameraId?mode=live` 화면으로 이동한다.
And 큰 영상 영역에 해당 카메라의 live stream loading/playing/error state가 표시된다.
And 오른쪽 metadata panel에 해당 카메라 정보가 표시된다.

### Scenario 2: Source grid camera context 유지

Given 사용자가 특정 공정/세부공정 탭의 grid에서 화면 확대 보기에 진입했다.
When focus view가 열린다.
Then 상단 camera tab list에는 진입 전 세부공정 grid에 있던 카메라만 표시된다.
And 다른 세부공정의 카메라는 표시되지 않는다.

### Scenario 3: Rename title consistency

Given 사용자가 grid camera tile에서 Rename으로 제목을 변경했다.
When 같은 카메라를 화면 확대 보기로 연다.
Then focus view의 camera tab, player title, metadata display에서 변경된 제목이 일관되게 표시된다.

### Scenario 4: Live와 Recording 전환

Given 사용자가 focus view에 있다.
When 사용자가 `실시간` 또는 `녹화` mode tab을 선택한다.
Then URL query `mode`가 `live` 또는 `recording`으로 갱신된다.
And 선택한 mode에 맞는 video stage가 표시된다.

### Scenario 5: Recording event seek

Given 사용자가 recording mode에 있다.
And playback session과 event list가 표시된다.
When 사용자가 event row를 선택한다.
Then URL query에 `eventId`가 반영된다.
And player는 event detail의 `playbackHint.seekAt` 또는 `occurredAt - preRollSeconds` 기준으로 이동한다.
And metadata panel은 선택한 event detail을 표시한다.

### Scenario 6: Alert toast/banner

Given 선택한 카메라에 active alert가 있다.
When focus view가 표시된다.
Then 영상 시야를 과도하게 방해하지 않는 위치에 긴급 경고 toast/banner가 표시된다.
And toast/banner는 click으로 dismiss 가능하다.
And dismiss는 현재 route session에만 적용된다.

### Scenario 7: Partial failure isolation

Given camera metadata, live stream, playback, event list, alert 중 일부 요청이 실패한다.
When focus view가 표시된다.
Then 실패한 영역만 fallback/error state를 표시한다.
And 성공한 영역은 계속 사용할 수 있다.

### Scenario 8: Forbidden metadata protection

Given mock service가 403/forbidden response를 반환한다.
When focus view가 표시된다.
Then 사용자는 권한 없음 상태를 명확히 볼 수 있다.
And 제한된 camera/event metadata는 DOM에 노출되지 않는다.

### Scenario 9: Theme contrast

Given 사용자가 theme1, theme2, theme3를 전환한다.
When grid와 focus view를 사용한다.
Then camera title bar, rename dialog, alert toast/banner, recording timeline, event list의 글자 대비가 유지된다.

## Functional Requirements

1. Grid camera tile은 focus view로 진입하는 확대 action을 제공해야 한다.
2. Focus view route는 `cameraId`, `mode`, optional `eventId`, source grid context를 URL 또는 route state로 표현해야 한다.
3. Focus view는 source grid의 camera list를 유지해야 한다.
4. Live mode는 `streamUrl` 기반 player를 표시해야 한다.
5. Recording mode는 `playbackUrl` 기반 player, timeline, event marker, event list를 표시해야 한다.
6. Event 선택은 route query와 playback seek target을 갱신해야 한다.
7. Metadata panel은 camera mode와 event detail mode를 전환 표시해야 한다.
8. Active alert는 toast/banner로 표시되고 사용자가 dismiss할 수 있어야 한다.
9. Camera title rename은 grid와 focus view 사이에서 일관되게 유지되어야 한다.
10. Loading, empty, error, forbidden state는 영역별로 독립 표시되어야 한다.
11. Theme1/2/3에서 주요 UI text contrast가 유지되어야 한다.
12. Keyboard와 screen reader가 주요 tab/button/event interaction을 인식할 수 있어야 한다.

## Non-Functional Requirements

1. Focus view 진입 후 주요 shell UI는 2초 이내 표시되어야 한다.
2. Video loading은 media server 성능에 의존할 수 있으나 loading state는 즉시 표시되어야 한다.
3. Player failure가 metadata panel 또는 event list 표시를 막아서는 안 된다.
4. Metadata failure가 player 표시를 막아서는 안 된다.
5. 권한 없음 상태는 일반 오류와 구분되어야 한다.
6. Media URL은 opaque URL로 취급해야 한다.
7. 시간 값은 ISO-8601 기반 fixture/contract를 사용하고 UI 표시는 일관되게 처리해야 한다.
8. UI는 1920x1080 운영 모니터에 최적화하되 1366x768에서도 핵심 정보 접근이 가능해야 한다.
9. 향후 Spring Boot API, PTZ, AI overlay, WebSocket/SSE alert push 확장을 방해하지 않아야 한다.

## Mock API Contracts

Use frontend mock service/mock adapter for MVP.

### Camera Focus

`GET /api/cameras/{cameraId}/focus`

Returns:

- `cameraId`
- `cameraName`
- `processType`
- `zoneName`
- `lineName`
- `location`
- `status`
- `recordingEnabled`
- `capabilities`
- `lastSeenAt`
- `recentEventSummary`

### Live Stream

`GET /api/cameras/{cameraId}/live-stream`

Returns:

- `cameraId`
- `streamUrl`
- `streamProtocol`
- `expiresAt`
- `status`
- `resolution`
- `fps`
- `metadata`

### Playback Session

`GET /api/cameras/{cameraId}/playback?from={from}&to={to}&eventId={eventId?}`

Returns:

- `cameraId`
- `playbackUrl`
- `playbackProtocol`
- `sessionId`
- `expiresAt`
- `availableFrom`
- `availableTo`
- `seekable`
- `preRollSeconds`
- `timelineSegments`

### Camera Events

`GET /api/cameras/{cameraId}/events?from={from}&to={to}`

Returns list of:

- `eventId`
- `cameraId`
- `eventType`
- `severity`
- `title`
- `occurredAt`
- `endedAt`
- `status`
- `metadata`

### Active Alerts

`GET /api/cameras/{cameraId}/alerts/active`

Returns list of:

- `alertId`
- `cameraId`
- `severity`
- `message`
- `location`
- `startedAt`
- `status`
- `relatedEventId`
- `metadata`

## Route Contract

Primary route:

`/live/cameras/:cameraId?mode=live|recording&eventId={eventId}`

Additional source context:

- `tabId`
- `subTabId`
- `cameraIds`: comma-separated source grid camera IDs
- `cameraNames`: JSON encoded map of camera ID to renamed display name

## Implementation Status Carried From BMAD

Already implemented or mostly implemented:

- Focus route shell
- Live stream mock contract and integration
- Playback/events mock contract and recording mode
- Timeline/event marker/event list
- Alert toast/banner test trigger and dismiss-by-click behavior
- Camera tile title outside video area
- Rename dialog
- Rename title propagation into focus view
- Theme-aware grid title/rename dialog/focus recording UI
- Source subtab camera list in focus view

Needs verification or follow-up:

- Route-session scoped alert dismiss semantics
- Alert related-event metadata panel priority
- Forbidden metadata non-exposure
- Responsive validation
- Keyboard/ARIA pass
- Product-boundary regression check

## Acceptance Criteria

1. From `/live`, selecting a camera focus action opens `/live/cameras/{id}?mode=live`.
2. Focus view camera tabs include only cameras from the source subtab.
3. Renamed camera title is visible in grid and focus view.
4. Live mode uses `streamUrl`; recording mode uses `playbackUrl`.
5. Recording timeline renders available/gap segments and event markers.
6. Selecting an event updates `eventId` and playback seek target.
7. Alert toast/banner is visible for active alert and can be dismissed by click.
8. Partial failures affect only their own UI region.
9. Forbidden responses do not show protected metadata.
10. Theme1/2/3 keep readable text in title bars, dialogs, alert UI, timeline, and event list.
11. Core flows pass automated tests and production build.

