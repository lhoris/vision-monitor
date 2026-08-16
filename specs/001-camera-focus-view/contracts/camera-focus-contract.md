# Contract: Camera Focus Mock API

MVP에서는 frontend mock service/mock adapter가 아래 계약을 제공한다. 후속 Spring Boot API는 같은 의미 구조를 유지해야 한다.

## 공통 원칙

- 성공 응답은 필요한 data를 포함한다.
- 404/403 오류 응답은 보호된 data를 포함하지 않는다.
- media URL은 opaque URL로 취급한다.
- 시간 값은 ISO-8601 문자열을 사용한다.

## `GET /api/cameras/{cameraId}/focus`

반환 정보:

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

## `GET /api/cameras/{cameraId}/live-stream`

반환 정보:

- `cameraId`
- `streamUrl`
- `streamProtocol`
- `expiresAt`
- `status`
- `resolution`
- `fps`
- `metadata`

## `GET /api/cameras/{cameraId}/playback?from={from}&to={to}&eventId={eventId?}`

반환 정보:

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

## `GET /api/cameras/{cameraId}/events?from={from}&to={to}`

반환 정보 목록:

- `eventId`
- `cameraId`
- `eventType`
- `severity`
- `title`
- `occurredAt`
- `endedAt`
- `status`
- `playbackHint`
- `metadata`

## `GET /api/cameras/{cameraId}/alerts/active`

반환 정보 목록:

- `alertId`
- `cameraId`
- `severity`
- `message`
- `location`
- `startedAt`
- `status`
- `relatedEventId`
- `metadata`

