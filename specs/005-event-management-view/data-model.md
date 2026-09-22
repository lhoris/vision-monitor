# 데이터 모델: 알람 관리 화면

## AlarmHistoryItem

| 필드 | 설명 |
|---|---|
| `id` | 알람 식별자 |
| `processCode` | 공정 코드 |
| `processName` | 공정 표시명 |
| `occurredAt` | 알람 발생 시각 |
| `location` | 발생 위치 |
| `cameraId` | 연결 영상 카메라 식별자 |
| `modelName` | AI 모델명 |
| `judgment` | `OK` 또는 `NG` |
| `severity` | 알람 심각도 |
| `description` | 알람 설명 |
| `recording` | 녹화 가능 상태 및 재생 구간 정보 |
| `acknowledgement` | 현재 사용자 기준 확인 정보 |

## RecordingOffsetConfig

| 필드 | 설명 |
|---|---|
| `alarmRuleId` | 향후 알람 관리 화면에서 관리할 규칙 식별자 |
| `beforeSeconds` | 발생 시각 이전 녹화 구간, 0 이상 |
| `afterSeconds` | 발생 시각 이후 녹화 구간, 0 이상 |
| `source` | 설정 출처 또는 기본값 여부 |

## AlarmRecordingClip

| 필드 | 설명 |
|---|---|
| `status` | `available`, `partial`, `unavailable`, `loading`, `error` |
| `requestedFrom` | 오프셋 계산으로 요청한 시작 시각 |
| `requestedTo` | 오프셋 계산으로 요청한 종료 시각 |
| `availableFrom` | 실제 이용 가능한 시작 시각 |
| `availableTo` | 실제 이용 가능한 종료 시각 |
| `playbackUrl` | 재생 URL |
| `downloadUrl` | 오프셋 클립 다운로드 URL 또는 mock 식별자 |
| `durationSeconds` | 실제 이용 가능한 클립 길이 |

## UserAlarmAcknowledgement

| 필드 | 설명 |
|---|---|
| `alarmId` | 알람 식별자, 논리적 참조 |
| `userId` | 확인 사용자 식별자, 논리적 참조 |
| `acknowledged` | 확인 여부 |
| `acknowledgedAt` | 확인 시각 |
| `acknowledgedByName` | 확인 사용자 표시명 |

현재 화면의 계산 규칙:

- `requestedFrom = occurredAt - beforeSeconds`
- `requestedTo = occurredAt + afterSeconds`
- 현재 로그인 사용자의 acknowledgement만 미확인 수와 상태 배지에 반영한다.
- 녹화가 없으면 알람 이력과 판정 정보는 유지하고 영상 동작만 제한한다.
