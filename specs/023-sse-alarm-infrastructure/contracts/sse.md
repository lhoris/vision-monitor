# SSE 알람 계약

## Endpoint

`GET /api/alarms/stream`

- 인증: `Authorization: Bearer <session-token>` 필수
- 성공: HTTP 200, `Content-Type: text/event-stream`
- 실패: 인증 실패 시 HTTP 401, 기존 API 오류 형식
- 연결은 클라이언트가 Abort/페이지 종료할 때 닫는다.

## Events

### connected

```text
event: connected
data: {"connectionId":"..."}

```

### heartbeat

```text
event: heartbeat
data: {"sentAt":"2026-10-16T12:00:00Z"}

```

### alarm

```json
{
  "id": 101,
  "cameraId": 7,
  "type": "PERSON_DETECTED",
  "severity": "critical",
  "description": "Restricted area detected",
  "timestamp": "2026-10-16T12:00:00Z",
  "acknowledged": false,
  "metadata": {"zone": "A-01"}
}
```

Publisher는 사용자명과 위 payload를 받아 `alarm` event로 전송한다.
