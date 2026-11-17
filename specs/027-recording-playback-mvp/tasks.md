# 작업 목록: 화면 확대 보기 녹화 재생 MVP

**입력**: `/specs/027-recording-playback-mvp/`의 설계 문서

**사전 조건**: spec.md, plan.md, research.md, data-model.md, contracts/playback.md, quickstart.md

## Phase 1: 준비(공통 기반)

- [X] T001 기능 명세·계획·계약 문서를 검토하고 MVP 범위를 `specs/027-recording-playback-mvp/spec.md`와 `plan.md`에 확정한다.
- [X] T002 [P] 녹화 playback 데이터와 검증 시나리오를 `specs/027-recording-playback-mvp/data-model.md`와 `quickstart.md`에 정리한다.
- [X] T003 [P] 녹화 재생 입력·성공·오류 계약을 `specs/027-recording-playback-mvp/contracts/playback.md`에 정리한다.

## Phase 2: 기반 작업(차단 선행 조건)

- [X] T004 [P] [공통] MP4 playback protocol과 수동 조회 범위를 표현할 타입을 `frontend/src/types/cameraFocus.ts`에 추가한다.
- [X] T005 [공통] 검증용 녹화 URL을 시간 구간과 조합하는 adapter를 `frontend/src/services/recordingService.ts`에 구현한다.
- [X] T006 [공통] playback hook이 외부 요청 취소와 범위 변경을 처리하도록 `frontend/src/hooks/useCameraPlayback.ts`를 확장한다.

## Phase 3: 사용자 스토리 1 - 시간 구간을 지정해 녹화 영상 재생 (우선순위: P1) MVP

**목표**: 사용자가 화면 확대 보기에서 직접 start/end를 지정하고 검증용 녹화 영상을 재생한다.

**관련 요구사항**: FR-001~FR-004, FR-006~FR-007, UX-001~UX-003, UX-005~UX-006

**독립 테스트**: 녹화 탭에서 시간 범위를 수정하고 조회하면 native MP4 player와 기본 재생바가 표시되는지 확인한다.

- [X] T007 [P] [US1] 시간 범위 검증과 녹화 URL 조합 테스트를 `frontend/src/services/__tests__/recordingService.test.ts`에 추가한다.
- [X] T008 [P] [US1] 녹화 입력·조회·오류 상태 테스트를 `frontend/src/components/CameraFocus/__tests__/RecordingControls.test.tsx`에 추가한다.
- [X] T009 [US1] 녹화 시작/종료 입력과 조회 버튼을 `frontend/src/components/CameraFocus/RecordingControls.tsx`에 구현한다.
- [X] T010 [US1] 화면 상태와 recording controls를 `frontend/src/pages/CameraFocus.tsx` 및 `frontend/src/components/CameraFocus/CameraFocusShell.tsx`에 연결한다.
- [X] T011 [US1] MP4 protocol 재생을 `frontend/src/components/CameraFocus/FocusVideoStage.tsx`에 연결하고 기존 HLS/WebRTC 분기를 보존한다.
- [X] T012 [US1] 녹화 URL과 시간 범위가 플레이어 및 타임라인에 반영되는지 `frontend/src/components/CameraFocus/__tests__/FocusVideoStage.test.tsx`와 `RecordingTimeline.test.tsx`에 검증한다.
- [X] T013 [US1] 사용자 스토리 1 검증을 위해 관련 Vitest 테스트와 `npm run build`를 실행한다.

## Phase 4: 사용자 스토리 2 - 알람에서 관련 녹화 구간으로 이동 (우선순위: P2)

**목표**: 알람 선택 시 알람 시각 전후의 녹화 구간이 자동 조회된다.

**관련 요구사항**: FR-005~FR-007, UX-004~UX-005

**독립 테스트**: 알람 선택 후 start/end가 ±30초로 설정되고 플레이어가 알람 구간을 표시하는지 확인한다.

- [X] T014 [P] [US2] 알람 시각 기준 ±30초 범위 계산 테스트를 `frontend/src/pages/__tests__/CameraFocus.test.tsx`에 추가한다.
- [X] T015 [US2] 알람 선택 시 playback range를 갱신하도록 `frontend/src/pages/CameraFocus.tsx`를 구현한다.
- [X] T016 [US2] 알람 선택 상태와 타임라인 marker가 녹화 조회 범위에 맞게 표시되도록 `frontend/src/components/CameraFocus/RecordingTimeline.tsx`를 보강한다.
- [X] T017 [US2] 알람과 카메라가 불일치하거나 녹화가 없는 상태의 안내를 `frontend/src/components/CameraFocus/FocusVideoStage.tsx`에 반영한다.
- [X] T018 [US2] 사용자 스토리 2 검증을 위해 관련 Vitest 테스트와 `npm run build`를 실행한다.

## Phase 5: 다듬기 및 공통 검증

- [X] T019 [P] 한국어 안내 문구와 접근성 레이블을 `frontend/src/components/CameraFocus/RecordingControls.tsx` 및 관련 컴포넌트에 정리한다.
- [X] T020 [P] 녹화 MVP 사용법을 `specs/027-recording-playback-mvp/quickstart.md`에 구현 결과 기준으로 갱신한다.
- [X] T021 `frontend` 관련 테스트와 production build를 실행하고 회귀 결과를 기록한다.
- [ ] T022 backend/frontend 동시 실행 환경에서 실시간 탭 회귀와 녹화 탭 수동 검증 결과를 확인한다.

## 의존성 및 실행 순서

- Phase 1 완료 후 Phase 2를 시작한다.
- Phase 2 완료 후 US1을 먼저 완료·검증한다.
- US1 완료 후 US2를 구현한다.
- 모든 사용자 스토리 완료 후 Phase 5를 진행한다.
- T004~T006은 같은 contract를 공유하므로 순차 실행한다.
- T007~T008, T014는 서로 다른 테스트 파일이므로 병렬 실행 가능하다.

## 구현 전략

1. 기존 playback contract를 MP4와 수동 범위까지 확장한다.
2. P1 수동 시간 조회와 native player를 먼저 완성한다.
3. P2 알람 자동 범위를 연결한다.
4. 테스트와 build, backend/frontend 동시 실행 환경에서 검증한다.
5. 운영용 backend proxy와 영상 관리 `recording_path`는 후속 기능으로 분리한다.
