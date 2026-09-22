# 알람 관리 화면 계약

## 조회 조건

화면은 다음 조건으로 알람 이력을 조회한다.

```ts
interface AlarmQuery {
  processCode?: string
  modelId?: string
  judgment?: 'OK' | 'NG'
  startDate?: string
  endDate?: string
}
```

조회 결과는 `AlarmHistoryItem[]` 형태이며, 현재 사용자별 확인 정보가 포함되어야 한다.

## 알람 상세 및 녹화 구간

알람 선택 시 다음 정보를 반환한다.

```ts
interface AlarmRecordingRequest {
  alarmId: number
  occurredAt: string
  beforeSeconds: number
  afterSeconds: number
}
```

결과는 `AlarmRecordingClip`이며 `requestedFrom`, `requestedTo`, 실제 이용 가능 범위, 재생 URL, 다운로드 URL을 포함한다.

## 확인 처리

```ts
interface AcknowledgeAlarmRequest {
  alarmId: number
  userId: number
}

interface AcknowledgeAlarmResponse {
  alarmId: number
  userId: number
  acknowledged: true
  acknowledgedAt: string
  acknowledgedByName: string
}
```

확인 처리는 현재 사용자에게만 적용된다.

## 클립 다운로드

다운로드 요청은 알람 전체 녹화가 아니라 `requestedFrom`부터 `requestedTo`까지의 구간을 대상으로 한다. 녹화가 `partial` 또는 `unavailable`이면 다운로드 동작을 비활성화하거나 실패 사유를 표시한다.
