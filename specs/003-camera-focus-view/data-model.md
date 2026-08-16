# 데이터 모델: 화면 확대 보기

이 문서는 `spec.md`의 "필요한 정보"를 구현 가능한 데이터 단위로 정리한다. 실제 타입/DTO 이름은 기존 코드와 contract 문서를 따른다.

## Camera Focus Metadata

- 카메라 식별자
- 표시명/Rename 적용명
- 공정/세부공정/위치
- 온라인 상태
- 녹화 가능 여부
- 마지막 수신 시각
- 최근 이벤트 요약

## Live Stream Source

- 카메라 식별자
- 실시간 영상 URL
- stream protocol
- 만료 시각
- 해상도/fps
- 재생 상태

## Playback Session

- 카메라 식별자
- 녹화 영상 URL
- playback protocol
- session 식별자
- 조회 가능 시작/종료 시각
- seek 가능 여부
- 이벤트 pre-roll 기준
- timeline segment 목록

## Camera Event

- 이벤트 식별자
- 카메라 식별자
- 이벤트 유형
- 심각도
- 제목/설명
- 발생/종료 시각
- 상태
- 재생 hint

## Active Alert

- 알람 식별자
- 카메라 식별자
- 심각도
- 메시지
- 위치
- 시작 시각
- 상태
- 관련 이벤트 식별자

## Grid Source Context

- 진입 전 상위 공정 탭
- 진입 전 세부공정 탭
- 진입 전 그리드에 표시된 카메라 ID 목록
- Rename 적용 카메라명 map

## UI Session State

- live/recording mode
- 선택된 eventId
- route session 단위 alert dismiss state
- 영역별 loading/error/empty/forbidden state

