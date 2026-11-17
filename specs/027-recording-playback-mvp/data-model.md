# 데이터 모델: 화면 확대 보기 녹화 재생 MVP

## PlaybackSessionDto

기존 `frontend/src/types/cameraFocus.ts`의 playback 계약을 확장한다.

| 항목 | 설명 | 검증 |
|------|------|------|
| cameraId | 현재 녹화 대상 카메라 식별자 | 양의 정수 |
| playbackUrl | 시간 구간이 반영된 재생 URL | 비어 있지 않은 URL |
| playbackProtocol | `mp4` 또는 기존 재생 protocol | 지원 protocol만 허용 |
| availableFrom | 조회 시작 시각 | ISO 또는 local datetime 형식 |
| availableTo | 조회 종료 시각 | 시작 시각보다 늦어야 함 |
| seekable | 재생 위치 이동 가능 여부 | MVP는 true |
| timelineSegments | 녹화 가능 구간 | MVP는 조회 전체 구간을 available로 표시 |

## CameraPlaybackRange

| 항목 | 설명 | 검증 |
|------|------|------|
| from | 녹화 조회 시작 시각 | 필수 |
| to | 녹화 조회 종료 시각 | 필수, from 이후 |
| eventId | 선택된 알람/이벤트 식별자 | 선택 |

## 상태 전이

`idle → loading → ready(error 없음)` 또는 `idle → loading → error` 흐름을 사용한다. 카메라나 모드가 바뀌면 이전 요청 결과는 폐기한다.
