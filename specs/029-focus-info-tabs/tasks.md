# 작업 목록: 화면 확대 보기 정보 탭

**입력**: [spec.md](spec.md), [plan.md](plan.md)

## Phase 1: 기반 및 계약

- [X] T001 기존 `FocusMetadataPanel`, `CameraFocusShell`, `CameraFocus`의 이벤트 전달 흐름을 확인하고 구현 범위를 확정한다: `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`, `frontend/src/components/CameraFocus/CameraFocusShell.tsx`, `frontend/src/pages/CameraFocus.tsx`
- [X] T002 [P] 정보 탭에 필요한 한국어/영어 번역 키를 정의한다: `frontend/src/locales/ko.json`, `frontend/src/locales/en.json`

## Phase 2: 사용자 스토리 1 - 모드별 기본 탭

**목표**: 실시간은 모델기본정보, 녹화는 알람 이력이 기본으로 표시된다.

- [X] T003 [US1] 정보 패널에 모델기본정보/알람 이력 탭과 선택 상태를 추가한다: `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- [X] T004 [US1] 모드·카메라 변경 시 기본 탭을 초기화하고 탭별 콘텐츠를 전환한다: `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- [X] T005 [US1] 모드별 기본 탭과 탭 전환을 검증하는 컴포넌트 테스트를 작성한다: `frontend/src/components/CameraFocus/__tests__/FocusMetadataPanel.test.tsx`

## Phase 3: 사용자 스토리 2 - 기존 기능 유지 및 알람 이력 표시

**목표**: 모델기본정보 편집을 유지하고 알람 이력 목록을 우측 탭에서 제공한다.

- [X] T006 [US2] 패널에 이벤트 목록, 오류, 선택 이벤트 전달 props를 연결한다: `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- [X] T007 [US2] 알람 이력 탭에서 기존 `RecordingEventList`를 렌더링하고 빈 상태·오류 상태를 표시한다: `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`, `frontend/src/components/CameraFocus/RecordingEventList.tsx`
- [X] T008 [US2] 모델기본정보 탭에서 기존 섹션 추가·편집·삭제 흐름이 유지되는지 테스트한다: `frontend/src/components/CameraFocus/__tests__/FocusMetadataPanel.test.tsx`

## Phase 4: 사용자 스토리 3 - 알람 선택과 녹화 이동

**목표**: 알람 이력 선택이 기존 상세·녹화 이동 흐름과 연결된다.

- [X] T009 [US3] 알람 이력 항목 선택 callback을 패널에서 상위 화면으로 연결한다: `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`, `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- [X] T010 [US3] 알람 항목 선택과 선택 상태 갱신을 검증하는 테스트를 보강한다: `frontend/src/components/CameraFocus/__tests__/FocusMetadataPanel.test.tsx`

## Phase 5: 마무리 및 검증

- [X] T011 [P] 다국어 키와 탭 접근성 라벨을 검증한다: `frontend/src/locales/ko.json`, `frontend/src/locales/en.json`, `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- [X] T012 기존 CameraFocus 관련 테스트와 전체 프론트엔드 빌드를 실행한다: `frontend/src/pages/__tests__/CameraFocus.test.tsx`, `frontend/src/components/CameraFocus/__tests__/FocusVideoStage.test.tsx`
- [X] T013 구현 결과와 명세·계획·작업 목록의 일치 여부를 확인하고 작업 완료 상태를 갱신한다: `specs/029-focus-info-tabs/spec.md`, `specs/029-focus-info-tabs/plan.md`, `specs/029-focus-info-tabs/tasks.md`

## 의존성 및 실행 순서

- T001~T002 완료 후 T003~T005를 진행한다.
- T003~T005 완료 후 T006~T008을 진행한다.
- T006~T008 완료 후 T009~T010을 진행한다.
- T011은 UI 구현과 병렬 진행할 수 있고, T012~T013은 모든 구현 작업 완료 후 진행한다.

## MVP 범위

T003~T008까지를 핵심 MVP로 보고, 모드별 기본 탭·직접 전환·기존 모델기본정보 유지·알람 이력 표시를 우선 검증한다.
