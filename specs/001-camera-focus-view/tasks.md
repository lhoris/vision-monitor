# 작업 목록: 화면 확대 보기

**입력**: `specs/001-camera-focus-view/`의 설계 문서

**사전 조건**: spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

**테스트**: 현재 repo 구현 상태를 기준으로 완료/검증/후속 작업을 분류한다.

> 이 문서는 한국어로 작성한다. 기술 용어, API 이름, 파일 경로, 코드 식별자, 명령어는 원문 또는 영문 표기를 유지할 수 있다.

## Phase 1: 준비(공통 기반)

**목적**: BMAD 산출물을 Spec Kit artifact로 승격하고 migration 검증 기준을 고정한다.

- [x] T001 BMAD source map을 작성한다: `docs/migration/bmad-to-speckit-source-map.md`
- [x] T002 Spec Kit seed를 작성한다: `docs/migration/speckit-camera-focus-seed.md`
- [x] T003 화면 확대 보기 feature spec 디렉터리를 생성한다: `specs/001-camera-focus-view/`
- [x] T004 spec/plan/contracts/quickstart/tasks 산출물을 작성한다: `specs/001-camera-focus-view/`

---

## Phase 2: 기반 작업(차단 선행 조건)

**목적**: 화면 확대 보기를 가능하게 하는 mock contract/service/type 기반을 검증한다.

- [x] T005 [공통] camera focus type 정의 확인: `frontend/src/types/cameraFocus.ts`
- [x] T006 [공통] camera focus fixture 확인: `frontend/src/mocks/cameraFocus.ts`
- [x] T007 [공통] live stream fixture 확인: `frontend/src/mocks/cameraLiveStream.ts`
- [x] T008 [공통] playback/events/alerts fixture 확인: `frontend/src/mocks/cameraPlayback.ts`, `frontend/src/mocks/cameraEvents.ts`, `frontend/src/mocks/cameraAlerts.ts`
- [x] T009 [공통] focus/live/playback/events/alerts mock adapter 확인: `frontend/src/services/`
- [ ] T010 [공통] 403/forbidden fixture가 보호 metadata를 노출하지 않는지 테스트를 보강한다: `frontend/src/services/__tests__/`

**체크포인트**: mock 기반과 service 계층이 후속 backend API로 교체 가능한 contract shape를 유지해야 한다.

---

## Phase 3: 사용자 스토리 1 - 그리드에서 화면 확대 보기 진입 (우선순위: P1) MVP

**목표**: 카메라 그리드에서 화면 확대 보기로 진입하고 source grid camera context를 유지한다.

**관련 요구사항**: FR-001, FR-002, FR-008, SC-001, SC-003

**독립 테스트**: 특정 세부탭에서 확대 진입 시 화면 확대 보기 상단 카메라 목록이 해당 세부탭 카메라만 포함하는지 확인한다.

- [x] T011 [US1] focus route parser 테스트 확인: `frontend/src/pages/__tests__/cameraFocusRoute.test.ts`
- [x] T012 [US1] CameraFocus page shell 확인: `frontend/src/pages/CameraFocus.tsx`
- [x] T013 [US1] grid focus route entry 확인: `frontend/src/components/Grid/GridContainer.tsx`
- [x] T014 [US1] video-safe title/header 구조 확인: `frontend/src/components/Grid/DraggableCell.tsx`
- [ ] T015 [US1] source context 없는 진입의 fallback 정책 테스트를 보강한다: `frontend/src/pages/__tests__/CameraFocus.test.tsx`

---

## Phase 4: 사용자 스토리 2 - 실시간/녹화 영상 전환과 이벤트 탐색 (우선순위: P2)

**목표**: live/recording mode를 전환하고 녹화 이벤트 탐색을 지원한다.

**관련 요구사항**: FR-003, FR-004, FR-005, FR-010, SC-005

**독립 테스트**: 녹화 모드에서 이벤트를 선택하면 `eventId`, playback seek target, metadata panel이 갱신되는지 확인한다.

- [x] T016 [US2] live stream player integration 확인: `frontend/src/components/StreamPlayer/LiveStreamPlayer.tsx`
- [x] T017 [US2] recording service 테스트 확인: `frontend/src/services/__tests__/recordingService.test.ts`
- [x] T018 [US2] RecordingTimeline 테스트 확인: `frontend/src/components/CameraFocus/__tests__/RecordingTimeline.test.tsx`
- [x] T019 [US2] RecordingEventList 테스트 확인: `frontend/src/components/CameraFocus/__tests__/RecordingEventList.test.tsx`
- [ ] T020 [US2] event 선택 시 metadata panel 우선순위 테스트를 보강한다: `frontend/src/pages/__tests__/CameraFocus.test.tsx`

---

## Phase 5: 사용자 스토리 3 - 알람/경고 확인과 닫기 (우선순위: P3)

**목표**: 활성 알람/경고를 긴급하게 표시하고 클릭으로 자연스럽게 닫는다.

**관련 요구사항**: FR-005, FR-006, FR-009, SC-004

**독립 테스트**: 테스트 알람 dialog에서 입력한 메시지로 토스트가 표시되고 클릭으로 dismiss되는지 확인한다.

- [x] T021 [US3] FocusAlertBanner 컴포넌트와 테스트 확인: `frontend/src/components/CameraFocus/FocusAlertBanner.tsx`
- [x] T022 [US3] active alert mock adapter 확인: `frontend/src/services/cameraAlertsMockAdapter.ts`
- [x] T023 [US3] 테스트 알람 입력 dialog 확인: `frontend/src/pages/CameraFocus.tsx`
- [ ] T024 [US3] route-session scoped dismiss 정책 테스트를 보강한다: `frontend/src/pages/__tests__/CameraFocus.test.tsx`

---

## Phase 6: 사용자 스토리 4 - 카메라 제목 Rename 일관성 (우선순위: P3)

**목표**: Rename한 카메라 제목이 그리드와 화면 확대 보기에서 일관되게 표시된다.

**관련 요구사항**: FR-007, FR-009

**독립 테스트**: 그리드에서 Rename한 카메라가 focus view tab/player/metadata에 같은 제목으로 표시되는지 확인한다.

- [x] T025 [US4] grid Rename 동작 확인: `frontend/src/components/Grid/GridContainer.tsx`
- [x] T026 [US4] focus route title propagation 확인: `frontend/src/pages/cameraFocusRoute.ts`
- [x] T027 [US4] Rename dialog theme style 확인: `frontend/src/components/Grid/`
- [ ] T028 [US4] 긴 제목/빈 제목의 layout 회귀 테스트를 보강한다: `frontend/src/components/Grid/__tests__/GridContainer.focus.test.tsx`

---

## Phase N: 다듬기 및 공통 검증

- [ ] T029 quickstart 수동 검증을 실행하고 결과를 기록한다: `specs/001-camera-focus-view/quickstart.md`
- [ ] T030 theme1/2/3 contrast 수동 검증 결과를 기록한다: `specs/001-camera-focus-view/quickstart.md`
- [ ] T031 keyboard/ARIA 검증을 보강한다: `frontend/src/components/CameraFocus/`
- [x] T032 migration harness를 실행해 BMAD 삭제 가능 상태를 확인한다: `scripts/verify-speckit-migration.ps1`
- [x] T033 BMAD 실행 폴더와 agent 파일을 삭제한다: `_bmad/`, `_bmad-output/`, `.agents/skills/bmad-*`, `.claude/skills/bmad-*`, `.github/agents/bmad-*.agent.md`
- [x] T034 frontend 테스트와 build를 실행한다: `frontend/`

## 의존성 및 실행 순서

- Phase 1과 Phase 2는 모든 사용자 스토리의 기반이다.
- US1은 MVP이며 가장 먼저 검증한다.
- US2는 US1 route/page shell에 의존한다.
- US3과 US4는 US1 이후 독립 검증 가능하다.
- BMAD 삭제는 Spec Kit artifact와 migration harness가 통과한 뒤 수행한다.

## 구현 전략

1. BMAD 산출물을 Spec Kit artifact로 승격한다.
2. migration harness로 필수 Spec Kit artifact와 BMAD 잔여 참조를 확인한다.
3. 검증 가능한 pending task만 남기고 BMAD 실행 체계를 제거한다.
4. frontend test/build로 회귀를 확인한다.
