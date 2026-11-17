# 데이터 모델: 편집기형 녹화 재생 플레이어

## DayRange

| 항목 | 설명 |
|------|------|
| date | 사용자가 탐색하는 날짜 |
| from | 해당 날짜 00:00 |
| to | 다음 날 00:00 또는 화면상 24:00 |

## WorkArea

| 항목 | 설명 | 제약 |
|------|------|------|
| from | 재생 조회 시작 시각 | day range 안, 최소 길이 유지 |
| to | 재생 조회 종료 시각 | from 이후, day range 안 |
| source | `manual`, `alarm`, `default` | 현재 범위의 원인 표시용 |

## Playhead

| 항목 | 설명 |
|------|------|
| timestamp | 현재 재생 위치 |
| offsetSeconds | 선택 날짜 시작부터의 초 단위 위치 |

## 상태 전이

```text
day initialized
  -> work area draft changed (drag/keyboard)
  -> work area committed (조회/재생)
  -> playback loading
  -> playback ready / unavailable / error
```
