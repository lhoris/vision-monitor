# 작업 목록: 편집기형 녹화 재생 플레이어

**입력**: `/specs/028-editor-style-recording-player/`의 설계 문서

## Phase 1: 준비(공통 기반)

- [X] T001 기능 명세와 구현 계획을 검토하고 편집기형 비파괴 재생 범위를 `specs/028-editor-style-recording-player/spec.md`에 확정한다.
- [X] T002 [P] 시간축·work area·playhead 데이터 구조를 `specs/028-editor-style-recording-player/data-model.md`에 반영한다.
- [X] T003 [P] playback 범위 확정 계약을 `specs/028-editor-style-recording-player/contracts/playback.md`에 반영한다.

## Phase 2: 기반 작업

- [X] T004 [P] 날짜별 24시간 좌표 변환과 경계 clamp 유틸을 `frontend/src/components/CameraFocus/recordingTimelineModel.ts`에 구현한다.
- [X] T005 [P] work area 최소 길이·핸들 이동·본체 이동 계산 테스트를 `frontend/src/components/CameraFocus/__tests__/recordingTimelineModel.test.ts`에 작성한다.
- [X] T006 기존 녹화 범위 상태를 draft와 committed로 분리하도록 `frontend/src/pages/CameraFocus.tsx`를 확장한다.

## Phase 3: 사용자 스토리 1 - 하루 전체에서 녹화 구간 탐색 (P1) MVP

- [X] T007 [P] [US1] 24시간 눈금·녹화 구간·work area·playhead 렌더링 테스트를 `frontend/src/components/CameraFocus/__tests__/RecordingTimeline.test.tsx`에 추가한다.
- [X] T008 [US1] 편집기형 24시간 timeline과 시간 눈금을 `frontend/src/components/CameraFocus/RecordingTimeline.tsx`에 구현한다.
- [X] T009 [US1] work area 좌우 핸들과 본체 pointer drag를 `frontend/src/components/CameraFocus/RecordingTimeline.tsx`에 구현한다.
- [X] T010 [US1] playhead mouse/keyboard 이동과 접근성 slider 상태를 `frontend/src/components/CameraFocus/RecordingTimeline.tsx`에 구현한다.
- [X] T011 [US1] 날짜 선택·범위 요약·범위 확정 동작을 `frontend/src/components/CameraFocus/RecordingControls.tsx`에 연결한다.
- [X] T012 [US1] timeline draft와 playback request를 `frontend/src/pages/CameraFocus.tsx` 및 `frontend/src/components/CameraFocus/FocusVideoStage.tsx`에 연결한다.
- [X] T013 [US1] 사용자가 범위를 확정했을 때만 recording service가 호출되도록 `frontend/src/hooks/useCameraPlayback.ts`를 정리한다.
- [X] T014 [US1] 사용자 스토리 1 테스트와 frontend build를 실행한다.

## Phase 4: 사용자 스토리 2 - 알람 발생 구간 즉시 확인 (P2)

- [X] T015 [P] [US2] alarm marker 클릭과 work area 이동 테스트를 `frontend/src/components/CameraFocus/__tests__/RecordingTimeline.test.tsx`에 추가한다.
- [X] T016 [US2] marker 클릭 시 알람 범위와 playhead를 갱신하도록 `frontend/src/pages/CameraFocus.tsx`를 연결한다.
- [X] T017 [US2] 알람 목록 선택과 marker 선택의 공통 동작을 `frontend/src/components/CameraFocus/RecordingEventList.tsx`와 `RecordingTimeline.tsx`에 연결한다.
- [X] T018 [US2] 카메라 불일치·녹화 없음·날짜 변경 상태를 `frontend/src/components/CameraFocus/FocusVideoStage.tsx`에 반영한다.
- [X] T019 [US2] 사용자 스토리 2 테스트와 frontend build를 실행한다.

## Phase 5: 다듬기 및 검증

- [X] T020 [P] 드래그 tooltip·색상·핸들 가독성·키보드 focus 스타일을 `frontend/src/components/CameraFocus/RecordingTimeline.tsx`와 관련 스타일에 정리한다.
- [X] T021 [P] 설계 문서와 수동 검증 절차를 `specs/028-editor-style-recording-player/quickstart.md`에 갱신한다.
- [X] T022 전체 관련 테스트와 frontend build를 실행한다.

## 의존성 및 실행 순서

- Phase 1 완료 후 Phase 2를 시작한다.
- Phase 2 완료 후 US1을 독립 검증한다.
- US1 완료 후 US2를 구현한다.
- Phase 5는 US1·US2 완료 후 진행한다.
- T004~T005는 서로 다른 파일이므로 병렬 가능하다.
- T007과 T015는 각각 독립 테스트 파일 영역에서 병렬 가능하지만 동일 timeline 구현 전에는 완료할 수 없다.

## 구현 전략

1. 기존 MVP를 보존하면서 좌표·상태 모델을 먼저 분리한다.
2. P1의 24시간 timeline과 work area 조작을 완성한다.
3. P1 검증 후 알람 marker/list 연계를 추가한다.
4. 마지막에 시각 품질·접근성·회귀 검증을 수행한다.
- [X] T023 [P] 줌 단계·상세 viewRange·가시 구간 시간축 계산을 `frontend/src/components/CameraFocus/recordingTimelineModel.ts`와 `frontend/src/components/CameraFocus/__tests__/recordingTimelineModel.test.ts`에 반영한다.
- [X] T024 [US1] 24시간 개요와 확대 상세 타임라인을 `frontend/src/components/CameraFocus/RecordingTimeline.tsx`에 구성한다.
- [X] T025 [US1] 줌 버튼, 전체 보기, Ctrl/Command+휠 확대·축소와 가변 눈금을 `frontend/src/components/CameraFocus/RecordingTimeline.tsx`에 구현한다.
- [X] T026 [US1] 줌 상태 및 중복 타임라인 렌더링 회귀 테스트를 `frontend/src/components/CameraFocus/__tests__/RecordingTimeline.test.tsx`에 추가한다.
- [X] T027 프론트엔드 타임라인 테스트와 빌드를 실행해 확대·축소 기능을 검증한다.
- [X] T028 작업 구간 길이 계산·프리셋 변환을 `frontend/src/components/CameraFocus/recordingTimelineModel.ts`와 테스트에 반영한다.
- [X] T029 작업 구간 길이 표시·빠른 설정·핸들 기반 임의 길이 조절 안내를 `frontend/src/components/CameraFocus/RecordingTimeline.tsx`에 반영한다.
- [X] T030 작업 구간 길이 변경 회귀 테스트와 빌드를 실행한다.
- [X] T031 정밀 작업 구간 시각 포맷·파싱을 `frontend/src/components/CameraFocus/recordingTimelineModel.ts`와 테스트에 반영한다.
- [X] T032 작업 구간 우클릭 정밀 조정 메뉴와 외부 클릭 닫기를 `frontend/src/components/CameraFocus/RecordingTimeline.tsx`에 구현한다.
- [X] T033 우클릭 입력·적용 회귀 테스트와 프론트엔드 빌드를 실행한다.
- [X] T034 녹화 탭의 중복 알람 목록 렌더링을 `frontend/src/components/CameraFocus/FocusVideoStage.tsx`에서 제거한다.
- [X] T035 녹화 플레이어의 고정 높이를 반응형 높이로 변경해 `frontend/src/components/CameraFocus/FocusVideoStage.tsx`에서 영상 영역을 확대한다.
- [X] T036 별도 녹화 조회조건 영역을 제거하고 날짜 이동·재생 실행을 `frontend/src/components/CameraFocus/RecordingTimeline.tsx`에 통합한다.
- [X] T037 24시간 개요와 상세 타임라인을 하나의 메인 타임라인으로 통합하고 페이지·컴포넌트 테스트를 갱신한다.
- [X] T038 통합 타임라인 관련 테스트와 프론트엔드 빌드를 실행한다.
- [X] T039 작업 구간 직접 초 입력과 적용 동작을 `frontend/src/components/CameraFocus/RecordingTimeline.tsx` 및 테스트에 반영한다.
- [X] T040 타임라인 헤더에 달력 날짜 입력을 추가하고 날짜 이동 테스트를 보강한다.
- [X] T041 작업 구간 확정 시 자동 재생 범위 갱신을 `CameraFocus` 계층에 연결한다.
