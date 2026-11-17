# 녹화 재생 계약

## 입력

`getCameraPlayback(cameraId, { from, to, eventId? })`

- `cameraId`: 양의 정수
- `from`, `to`: `YYYY-MM-DDTHH:mm:ss` 형식
- `to`는 `from`보다 이후여야 한다.

## MVP 성공 응답

```json
{
  "cameraId": 1,
  "playbackUrl": "http://172.18.86.42/playback/video6.mp4?start=...&end=...&user=...&password=...",
  "playbackProtocol": "mp4",
  "sessionId": "mvp-video6-<range>",
  "expiresAt": null,
  "availableFrom": "2026-11-17T07:29:31",
  "availableTo": "2026-11-17T07:30:01",
  "seekable": true,
  "preRollSeconds": 30,
  "timelineSegments": []
}
```

실제 비밀번호 값은 문서에 기록하지 않고 코드의 단일 adapter 상수에서만 사용한다.

## 오류

- `INVALID_CAMERA_ID`
- `INVALID_RANGE`
- `RECORDING_NOT_FOUND`
- `PLAYBACK_UNAVAILABLE`
