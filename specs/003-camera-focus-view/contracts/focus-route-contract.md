# Contract: Focus Route

## Primary Route

```text
/live/cameras/:cameraId?mode=live|recording&eventId={eventId}
```

## Route Parameters

- `cameraId`: 화면 확대 보기의 기준 카메라 식별자

## Query Parameters

- `mode`: `live` 또는 `recording`
- `eventId`: recording mode에서 선택된 이벤트 식별자
- `tabId`: 진입 전 상위 공정 탭
- `subTabId`: 진입 전 세부공정 탭
- `cameraIds`: 진입 전 그리드에 표시된 카메라 ID 목록
- `cameraNames`: Rename 적용 표시명 map

## 동작 원칙

- `cameraIds`가 있으면 상단 카메라 전환 목록은 이 목록을 우선 사용한다.
- `cameraNames`가 있으면 카메라 표시명은 Rename 적용명을 우선 사용한다.
- `mode`가 없으면 `live`로 간주한다.
- `eventId`는 recording mode의 선택 이벤트와 playback seek target에만 영향을 준다.

