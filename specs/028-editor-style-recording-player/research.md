# 리서치: 편집기형 녹화 재생 플레이어

## 결정 1: 외부 timeline library 대신 전용 컴포넌트를 사용한다

- **결정**: 기존 React 구조 안에 CCTV 녹화 검토 전용 timeline을 구현한다.
- **근거**: 이 기능은 단순 일정 표시가 아니라 24시간 overview, work area 핸들, playhead, 녹화 availability, 알람 marker, playback 재조회가 함께 필요한 도메인 UI다.
- **대안**: `react-calendar-timeline`은 drag/resize/zoom을 제공하지만 캘린더·Gantt 성격이 강해 본 화면에 맞춘 추가 스타일과 상태 연결이 필요하다. `vis-timeline`도 이동·확대·범위 조작을 지원하지만 React 상태와 imperative lifecycle을 별도 관리해야 한다.

## 결정 2: playhead와 work area를 별도 상태로 둔다

- **결정**: playhead는 현재 재생 위치, work area는 외부 playback 요청 범위로 관리한다.
- **근거**: 영상 편집기와 VMS 모두 재생 위치와 선택 구간의 의미가 다르며, 두 상태를 합치면 드래그 중 불필요한 영상 요청이 발생한다.
- **대안**: 기존처럼 조회된 구간 하나만 timeline으로 쓰는 방식은 전체 날짜 탐색과 범위 이동을 표현할 수 없다.

## 결정 3: 실제 파일 편집은 하지 않는다

- **결정**: 이번 기능은 비파괴 녹화 검토와 playback URL 재조회까지만 제공한다.
- **근거**: 사용자 요구의 핵심은 녹화 장면 탐색·확인이며, 파일 export는 별도 보안·저장·권한 설계가 필요하다.
