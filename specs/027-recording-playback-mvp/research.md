# 리서치: 화면 확대 보기 녹화 재생 MVP

## 결정 1: 검증용 재생 URL은 frontend adapter에서 조합한다

- **결정**: 이번 MVP에서는 `/playback/video6.mp4`와 `start/end`를 기존 recording service 내부에서 조합한다.
- **근거**: 실제 호출 가능한 녹화 영상을 빠르게 검증하면서 Spring Boot와 DB 변경을 후속으로 분리할 수 있다.
- **대안**: Spring Boot playback endpoint를 먼저 구현하는 방식은 운영 구조에는 적합하지만 이번 MVP의 확인 범위를 늘린다.

## 결정 2: MP4는 native video controls로 재생한다

- **결정**: 기존 HLS/WebRTC 플레이어를 억지로 재사용하지 않고 MP4 protocol을 명시해 HTML5 video controls를 사용한다.
- **근거**: 사용자가 요구한 기본 재생바와 seek 동작을 가장 단순하게 제공할 수 있다.
- **대안**: custom StreamPlayer에 MP4 전용 클래스를 추가하는 방식은 공통화에는 유리하지만 MVP 복잡도가 증가한다.

## 결정 3: 알람 재생 범위는 발생 시각 앞뒤 30초다

- **결정**: 알람 선택 시 `occurredAt - 30초`부터 `occurredAt + 30초`까지 자동 조회한다.
- **근거**: 사용자가 알람 전후 상황을 확인할 수 있는 일반적인 기본값이며 수동 시간 조작으로 보완할 수 있다.
- **대안**: 알람 이벤트가 제공하는 playback hint를 우선 사용하는 방식은 후속 실제 이벤트 계약 연결 때 확장한다.
