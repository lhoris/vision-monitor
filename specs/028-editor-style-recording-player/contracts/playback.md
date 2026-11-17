# 녹화 재생 계약 확장

## 화면 상태와 외부 요청

- 화면은 `dayRange`, `workAreaDraft`, `playbackRange`, `playhead`를 분리한다.
- 외부 녹화 요청에는 확정된 `playbackRange.from`과 `playbackRange.to`만 전달한다.
- 드래그 중인 초안 범위는 외부 요청을 발생시키지 않는다.

## 응답

기존 `PlaybackSessionDto`를 사용한다.

- `availableFrom`, `availableTo`: 현재 응답의 실제 재생 범위
- `timelineSegments`: 녹화 가능/공백 구간
- `preRollSeconds`: 알람 재생 시 기본 앞 구간

## 오류

- `INVALID_RANGE`: 범위 역전 또는 최소 길이 위반
- `RECORDING_NOT_FOUND`: 선택 범위에 영상 없음
- `PLAYBACK_UNAVAILABLE`: 녹화 서버/재생 실패
