# Contract: UI State

## 독립 상태 영역

화면 확대 보기는 다음 영역을 독립적으로 로딩/오류/빈 상태 처리한다.

- camera metadata
- live stream
- playback session
- event list
- active alert
- title override

## Forbidden State

- 403/forbidden 상태는 일반 오류와 구분한다.
- forbidden 상태에서는 제한된 camera/event metadata를 렌더링하지 않는다.
- 오류 envelope에 data를 포함하지 않는다.

## Alert Dismiss State

- MVP에서는 route session 단위 dismiss를 기본값으로 한다.
- 토스트/배너 클릭 시 dismiss된다.
- dismiss motion은 즉시 사라짐이 아니라 자연스러운 exit transition을 사용한다.

## Theme State

- theme1, theme2, theme3 모두 제목, dialog, alert, recording UI의 텍스트 대비를 유지해야 한다.

