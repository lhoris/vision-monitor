# 작업 목록: 알람 관리 화면 개정

**입력**: `specs/005-event-management-view/`의 spec, plan, data-model, contract 문서

## Phase 1: 준비

- [x] T001 기존 Events 화면, eventSlice, eventService, 녹화 재생 계약의 현재 동작을 확인하고 변경 지점을 정리한다: `frontend/src/pages/Events.tsx`, `frontend/src/store/slices/eventSlice.ts`, `frontend/src/services/eventService.ts`
- [x] T002 [P] 알람 이력, 녹화 클립, 오프셋, 사용자별 확인 계약을 타입 정의로 정리한다: `frontend/src/types/alarm.ts`, `frontend/src/types/api.ts`
- [x] T003 [P] 한국어/영어 알람 화면 문구의 변경 목록을 정리한다: `frontend/src/locales/ko.json`, `frontend/src/locales/en.json`

## Phase 2: 공통 기반

- [x] T004 알람 fixture에 공정, AI 모델, 판정, 발생 위치, 녹화 상태, 오프셋, 사용자별 확인 데이터를 추가한다: `frontend/src/services/eventsMockAdapter.ts`
- [x] T005 알람 조회와 오프셋 기반 녹화/다운로드 mock adapter를 추가한다: `frontend/src/services/alarmRecordingService.ts`, `frontend/src/services/eventsMockAdapter.ts`
- [ ] T006 현재 로그인 사용자 기준 확인 상태를 계산하고 확인 처리 결과를 반영하는 eventSlice 상태 흐름을 정리한다: `frontend/src/store/slices/eventSlice.ts`
- [x] T007 [P] 조회, 녹화, 확인, 다운로드 계약을 독립적으로 검증하는 fixture/service 테스트 기반을 추가한다: `frontend/src/services/__tests__/eventService.test.ts`, `frontend/src/services/__tests__/alarmRecordingService.test.ts`

## Phase 3: 사용자 스토리 1 - 조건별 알람 이력 조회 (P1)

**목표**: 운영자가 공정, AI 모델, 판정 결과로 알람 이력을 조회한다.

**독립 검증**: 조회 조건을 적용하면 조건에 맞는 행만 표시되고 조회 결과 수가 갱신된다.

- [ ] T008 [P] [US1] 조회 조건 컴포넌트를 구현한다: `frontend/src/components/Events/AlarmQueryBar.tsx`
- [ ] T009 [US1] 공정/AI 모델/판정 조건을 eventSlice와 조회 서비스에 연결한다: `frontend/src/store/slices/eventSlice.ts`, `frontend/src/services/eventService.ts`
- [ ] T010 [US1] 알람 이력 그리드의 업무 컬럼과 선택 행을 구현한다: `frontend/src/components/Events/AlarmHistoryTable.tsx`
- [x] T011 [US1] Events 화면을 조회 조건과 알람 이력 그리드 중심으로 재구성한다: `frontend/src/pages/Events.tsx`
- [ ] T012 [US1] 조건 조회, 행 선택, 빈 결과 상태를 검증하는 컴포넌트 테스트를 작성한다: `frontend/src/pages/__tests__/Events.test.tsx`, `frontend/src/components/Events/__tests__/AlarmHistoryTable.test.tsx`

## Phase 4: 사용자 스토리 2 - 알람 발생 영상 확인 (P1)

**목표**: 운영자가 선택한 알람의 발생 시점과 오프셋이 적용된 녹화 영상을 확인한다.

**독립 검증**: 알람 행을 선택하면 같은 알람의 상세, 판정, 발생 위치, 영상 구간이 우측 영역에 표시된다.

- [ ] T013 [P] [US2] 선택 알람 상세 및 판정 결과 영역을 구현한다: `frontend/src/components/Events/AlarmDetailPanel.tsx`
- [ ] T014 [P] [US2] 오프셋으로 계산된 녹화 구간을 재생하는 영상 영역을 구현한다: `frontend/src/components/Events/AlarmRecordingPanel.tsx`
- [ ] T015 [US2] 기존 StreamPlayer/PlaybackSession 구조와 알람 녹화 mock 계약을 연결한다: `frontend/src/hooks/useAlarmRecording.ts`, `frontend/src/services/alarmRecordingService.ts`
- [ ] T016 [US2] 녹화 없음, 부분 녹화, 재생 오류 상태를 영상 영역에 연결한다: `frontend/src/components/Events/AlarmRecordingPanel.tsx`
- [ ] T017 [US2] 선택 알람과 우측 상세/영상 동기화 동작을 검증한다: `frontend/src/components/Events/__tests__/AlarmRecordingPanel.test.tsx`, `frontend/src/pages/__tests__/Events.test.tsx`

## Phase 5: 사용자 스토리 3 - 사용자별 알람 확인 (P1)

**목표**: 현재 로그인 사용자만 자신의 미확인 알람을 확인 처리한다.

**독립 검증**: 사용자 A의 확인 처리 후 A의 상태만 확인으로 바뀌고 미확인 수가 갱신된다.

- [ ] T018 [US3] 행과 상세 영역에 사용자별 확인 여부, 확인자, 확인 시각을 표시한다: `frontend/src/components/Events/AlarmHistoryTable.tsx`, `frontend/src/components/Events/AlarmDetailPanel.tsx`
- [ ] T019 [US3] 단건 확인과 현재 조회 결과 일괄 확인을 사용자별 상태에 연결한다: `frontend/src/store/slices/eventSlice.ts`, `frontend/src/services/eventService.ts`
- [ ] T020 [US3] 상단 알림 배지와 알람 화면 미확인 수가 현재 사용자 기준으로 계산되는지 확인한다: `frontend/src/components/Layout/Header.tsx`, `frontend/src/pages/Events.tsx`
- [ ] T021 [US3] 사용자별 확인 처리와 확인자/시각 표시 테스트를 작성한다: `frontend/src/pages/__tests__/Events.test.tsx`, `frontend/src/components/Layout/__tests__/Header.accountMenu.test.tsx`

## Phase 6: 사용자 스토리 4 - 오프셋 영상 클립 받기 (P2)

**목표**: 운영자가 알람 시각 전후 오프셋에 해당하는 영상 클립만 받는다.

**독립 검증**: 다운로드 요청에 알람 시각과 설정된 before/after 오프셋이 전달되고, 이용 불가 영상에서는 받기 동작이 제한된다.

- [x] T022 [US4] 알람 규칙 mock 설정에서 before/after 오프셋을 읽고 요청 구간을 계산한다: `frontend/src/services/alarmRecordingService.ts`
- [x] T023 [US4] 영상 이력 그리드의 `받기` 동작과 진행/성공/실패 상태를 구현한다: `frontend/src/pages/Events.tsx`, `frontend/src/services/alarmRecordingService.ts`
- [x] T024 [US4] 오프셋 구간과 다운로드 상태를 검증하는 테스트를 작성한다: `frontend/src/services/__tests__/alarmRecordingService.test.ts`

## Phase 7: 다국어 및 통합 검증

- [x] T025 [P] 알람 화면의 공정, AI 모델, 판정, 영상, 확인, 다운로드, 녹화 상태 문구를 한국어/영어로 추가한다: `frontend/src/locales/ko.json`, `frontend/src/locales/en.json`
- [ ] T026 [P] 로딩, 빈 결과, 녹화 없음, 권한 없음, 다운로드 실패 상태의 접근성 레이블과 화면 문구를 점검한다: `frontend/src/components/Events/AlarmQueryBar.tsx`, `frontend/src/components/Events/AlarmRecordingPanel.tsx`
- [x] T027 알람 화면 전체 테스트와 frontend build를 실행해 기존 Events/Playback 회귀를 확인한다: `frontend/package.json`, `frontend/src/pages/__tests__/Events.test.tsx`
- [ ] T028 구현 결과와 수동 검증 절차를 quickstart에 반영한다: `specs/005-event-management-view/quickstart.md`

## 의존성 및 실행 순서

```text
T001 -> T002/T003 -> T004/T005/T006/T007
T004/T006 -> T008/T009/T010/T011 -> T012
T005 -> T013/T014/T015/T016 -> T017
T006 -> T018/T019/T020 -> T021
T005/T014 -> T022/T023 -> T024
T025/T026 -> T027 -> T028
```

독립적으로 진행할 수 있는 작업은 `[P]`로 표시했다. 공통 타입과 mock 계약을 먼저 확정해야 각 사용자 스토리의 테스트가 같은 데이터 구조를 사용한다.

## 구현 전략

1. 알람/녹화/확인 계약과 fixture를 먼저 만든다.
2. 조회와 목록을 MVP로 완성한다.
3. 선택 알람 상세와 오프셋 영상 재생을 연결한다.
4. 사용자별 확인 처리를 연결한다.
5. 클립 다운로드와 오류 상태를 추가한다.
6. 다국어, 접근성, 전체 회귀 테스트를 마무리한다.
