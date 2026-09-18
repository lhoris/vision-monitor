# 작업 목록: 영상소스별 Query 기반 메타데이터

**입력 문서**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/metadata-query-mock-contract.md`, `quickstart.md`

**구현 방식**: frontend mock-first MVP. 실제 Spring Boot API, DB migration, SQL 실행은 이번 작업에 포함하지 않는다.

## Phase 1: 준비 및 계약

- [X] T001 `specs/017-camera-focus-metadata-query/plan.md`와 `spec.md`의 범위, 제외 항목, 파일 계획을 대조하고 구현 기준을 확정한다.
- [X] T002 [P] `frontend/src/types/metadataConfig.ts`에 MetadataLayoutProfile, MetadataSectionConfig, MetadataQueryDefinition, MetadataQueryResult, mapping, section status 타입을 정의한다.
- [X] T003 [P] `frontend/src/mocks/metadataQueryRegistry.ts`에 enabled/disabled Query definition과 text/grid/chart용 mock schema 및 결과 fixture를 작성한다.
- [ ] T004 [P] `frontend/src/components/CameraFocus/Metadata/__tests__/metadataConfig.test.ts`에 schema field와 section mapping의 기본 타입/검증 fixture를 준비한다.
- [X] T005 `frontend/src/components/CameraFocus/Metadata` 디렉터리와 테스트 실행 범위를 기존 frontend 구조에 맞춰 확정한다.

## Phase 2: 공통 기반

- [X] T006 `frontend/src/services/metadataConfigurationService.ts`에 `userId + sourceId` 기준 profile 조회, 저장, 기본값 복원, 잘못된 localStorage 값 대체를 구현한다.
- [X] T007 `frontend/src/services/metadataQueryService.ts`에 Query 목록 조회와 Query ID 기반 mock 실행을 구현하고 disabled/미존재 Query 오류를 표준 오류로 변환한다.
- [X] T008 `frontend/src/hooks/useMetadataPolling.ts`에 섹션별 5/10/30/60초 polling, 초기 조회, active 상태, timer cleanup, AbortController cleanup을 구현한다.
- [X] T009 `frontend/src/hooks/useMetadataPolling.ts`에서 동일 섹션의 in-flight 요청 중복 실행을 방지하고 `loading`, `success`, `empty`, `error`, `stale` 상태를 제공한다.
- [ ] T010 [P] `frontend/src/services/__tests__/metadataConfigurationService.test.ts`에 사용자별·영상소스별 profile 격리, 저장, 복원, 잘못된 저장값 처리를 검증한다.
- [ ] T011 [P] `frontend/src/services/__tests__/metadataQueryService.test.ts`에 Query registry 조회, Query ID 오류, schema/rows 결과 계약을 검증한다.
- [ ] T012 [P] `frontend/src/hooks/__tests__/useMetadataPolling.test.ts`에 fake timer 기반 주기, 중복 방지, 오류 격리, unmount/source 변경 cleanup을 검증한다.

## Phase 3: 사용자 스토리 1 - 영상소스별 섹션 표시 (P1)

**목표**: 영상소스마다 서로 다른 metadata profile을 확대 보기에서 표시한다.

- [X] T013 [P] [US1] `frontend/src/mocks/metadataQueryRegistry.ts`에 최소 2개 source의 서로 다른 기본 profile을 추가한다.
- [ ] T014 [P] [US1] `frontend/src/components/CameraFocus/Metadata/__tests__/MetadataSectionRenderer.test.tsx`에 source별 섹션 조합과 순서 표시 테스트를 작성한다.
- [X] T015 [US1] `frontend/src/components/CameraFocus/Metadata/MetadataSectionRenderer.tsx`에 section type별 renderer 위임과 section 단위 오류 경계를 구현한다.
- [X] T016 [US1] `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`를 고정 3섹션 렌더링에서 user/source profile 로딩 및 renderer 기반 표시로 전환한다.
- [X] T017 [US1] `frontend/src/components/CameraFocus/CameraFocusShell.tsx`에서 현재 sourceId와 로그인 userId 범위의 metadata panel을 연결하고 기존 영상/알람 callback을 유지한다.
- [ ] T018 [US1] `frontend/src/pages/__tests__/CameraFocus.test.tsx`에 source 전환 시 profile이 바뀌고 이전 source polling이 중단되는 통합 테스트를 추가한다.

## Phase 4: 사용자 스토리 2 - Query 주기별 갱신 (P1)

**목표**: 섹션 설정 주기에 따라 mock Query를 갱신하고 화면을 벗어나면 중단한다.

- [ ] T019 [P] [US2] `frontend/src/components/CameraFocus/Metadata/__tests__/MetadataPolling.integration.test.tsx`에 5초와 10초 섹션이 각각의 주기로 갱신되는 테스트를 작성한다.
- [X] T020 [US2] `frontend/src/components/CameraFocus/Metadata/MetadataSectionRenderer.tsx`에서 섹션별 `useMetadataPolling` 상태와 마지막 성공 시각을 연결한다.
- [X] T021 [US2] `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`의 active 상태와 source 변경을 polling hook에 전달하고 화면 이탈 시 모든 요청을 정리한다.
- [X] T022 [US2] loading 중 이전 결과 유지, 빈 결과, Query 오류를 섹션별 상태 표시로 연결한다.
- [ ] T023 [US2] `specs/017-camera-focus-metadata-query/quickstart.md`의 자동 검증 명령으로 polling 관련 테스트를 실행하고 결과를 기록한다.

## Phase 5: 사용자 스토리 3 - Query 결과 시각화 (P1)

**목표**: 공통 Query 결과 schema를 text/grid/chart renderer에서 사용한다.

- [X] T024 [P] [US3] `frontend/src/components/CameraFocus/Metadata/TextMetadataSection.tsx`에 label/value mapping, loading, empty, error, stale 표시를 구현한다.
- [X] T025 [P] [US3] `frontend/src/components/CameraFocus/Metadata/GridMetadataSection.tsx`에 schema 기반 column, 문자열/숫자/일시 포맷, empty/error 상태를 구현한다.
- [X] T026 [P] [US3] `frontend/src/components/CameraFocus/Metadata/ChartMetadataSection.tsx`에 정의된 chart mapping을 사용하는 최소 시계열 mock 표시와 빈 상태를 구현한다.
- [X] T027 [US3] `frontend/src/components/CameraFocus/Metadata/MetadataSectionRenderer.tsx`에 text/grid/chart mapping 검증과 알 수 없는 type fallback을 연결한다.
- [ ] T028 [P] [US3] `frontend/src/components/CameraFocus/Metadata/__tests__/TextMetadataSection.test.tsx`와 `GridMetadataSection.test.tsx`에 schema mapping 및 상태 표시 테스트를 작성한다.
- [ ] T029 [P] [US3] `frontend/src/components/CameraFocus/Metadata/__tests__/ChartMetadataSection.test.tsx`에 chart mapping과 schema 오류 테스트를 작성한다.

## Phase 6: 사용자 스토리 7 - 기본 예시 profile (P1)

**목표**: 요구 이미지의 text 1개와 grid 2개에 해당하는 예시 profile을 제공한다.

- [X] T030 [P] [US7] `frontend/src/mocks/metadataQueryRegistry.ts`에 연결 상태 text Query, 설정 현황 grid Query, 이벤트 현황 grid Query와 결과를 추가한다.
- [X] T031 [US7] `frontend/src/components/CameraFocus/Metadata/GridMetadataSection.tsx`에 이벤트 row의 `playbackAvailable` 상태와 재생 액션 표시를 구현한다.
- [X] T032 [US7] `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`에서 이벤트 row action을 기존 영상 시점 이동 또는 event callback으로 연결한다.
- [ ] T033 [US7] `frontend/src/components/CameraFocus/Metadata/__tests__/EventMetadataSection.test.tsx`에 이벤트 grid 표시와 재생 callback 테스트를 작성한다.

## Phase 7: 사용자 스토리 4 - Query 상태 확인 (P1)

**목표**: 한 섹션의 실패가 다른 섹션에 영향을 주지 않으며 상태를 알아볼 수 있게 한다.

- [ ] T034 [P] [US4] `frontend/src/components/CameraFocus/Metadata/__tests__/MetadataErrorIsolation.test.tsx`에 한 Query 실패와 다른 Query 성공의 동시 표시를 검증한다.
- [X] T035 [US4] 각 renderer에 마지막 성공 데이터 유지, 마지막 갱신 시각, 오류 메시지, empty 상태의 공통 표시 규칙을 적용한다.
- [X] T036 [US4] Query ID 미존재와 mapping field 미존재를 구분하여 섹션 설정 오류로 표시한다.

## Phase 8: 사용자 스토리 5 - 섹션 순서 개인화 (P2)

**목표**: 사용자가 현재 source의 섹션 순서를 드래그앤드롭으로 바꾸고 다시 열었을 때 유지한다.

- [ ] T037 [P] [US5] `frontend/src/components/CameraFocus/Metadata/__tests__/MetadataSectionOrder.test.tsx`에 drag reorder와 사용자별 저장/복원을 검증한다.
- [X] T038 [US5] `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`에 기존 drag-and-drop UX를 profile sections와 연결하고 저장 후 order를 재정렬한다.
- [X] T039 [US5] `frontend/src/services/focusMetadataLayoutService.ts`의 기존 순서 저장과 새 profile 저장의 중복을 제거하거나 compatibility adapter로 전환한다.
- [ ] T040 [US5] 다른 사용자와 다른 source의 profile이 순서 변경 영향을 받지 않는지 통합 테스트를 추가한다.

## Phase 9: 사용자 스토리 6 - 섹션 구성 관리 (P1)

**목표**: 모든 사용자가 자신의 source profile에 섹션을 추가, 편집, 삭제, 복원한다.

- [ ] T041 [P] [US6] `frontend/src/components/CameraFocus/Metadata/__tests__/MetadataSectionEditor.test.tsx`에 Query ID 선택, type, title, mapping, interval 입력 검증을 작성한다.
- [X] T042 [US6] `frontend/src/components/CameraFocus/Metadata/MetadataSectionEditor.tsx`에 등록 Query ID 선택, type 선택, interval 선택, mapping 필드 선택 UI를 구현한다.
- [X] T043 [US6] `frontend/src/components/CameraFocus/Metadata/MetadataSectionEditor.tsx`에 현재 source profile 대상 추가/편집 저장과 잘못된 mapping 방지를 구현한다.
- [X] T044 [US6] `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`에 섹션 추가·삭제·기본 설정 복원 진입점과 삭제 확인을 연결한다.
- [X] T045 [US6] 삭제한 섹션을 같은 source의 추가 가능 목록에서 복원할 수 있게 하고, 다른 source profile에는 영향을 주지 않게 한다.
- [X] T046 [US6] 모든 section을 삭제한 경우 빈 상태와 섹션 추가 유도 UI를 구현한다.

## Phase 10: 마무리 검증

- [X] T047 [P] `frontend/src/components/CameraFocus/Metadata` 전체 테스트를 실행하고 실패 원인을 수정한다.
- [X] T048 [P] 기존 `frontend/src/pages/__tests__/CameraFocus.test.tsx` 및 FocusMetadataPanel 회귀 테스트를 실행한다.
- [X] T049 `cd frontend; npm run build`를 실행해 TypeScript와 Vite build를 검증한다.
- [ ] T050 `specs/017-camera-focus-metadata-query/quickstart.md`의 수동 시나리오를 수행하고 구현되지 않은 항목이 없는지 명세와 대조한다.
- [ ] T051 `git diff --check`를 실행하고 본 기능 산출물의 문서/코드 whitespace 오류를 정리한다.
- [X] T052 [US3] `frontend/src/components/CameraFocus/Metadata/MetadataSectionEditor.tsx`에서 text 유형의 선택적 Query ID, 기본 텍스트, 선택적 label/value field 설정을 지원한다.
- [X] T053 [US3] `frontend/src/components/CameraFocus/Metadata/TextMetadataSection.tsx`와 `frontend/src/hooks/useMetadataPolling.ts`에서 정적 텍스트, Query fallback, Query 미연결 상태를 처리한다.

## 의존성 및 병렬 실행

### 의존성

- Phase 2는 Phase 1의 타입과 fixture 이후 시작한다.
- US1, US2, US3는 Phase 2 이후 병렬로 시작할 수 있으나 `FocusMetadataPanel.tsx` 통합 작업은 같은 파일에서 순차 조정한다.
- US7은 US3 renderer와 query service 이후 진행한다.
- US5와 US6은 profile service 이후 진행하며, panel 파일 변경은 순차 통합한다.
- Phase 10은 모든 우선순위 스토리 구현 이후 진행한다.

### 병렬 실행 예시

- `T002`, `T003`, `T004`는 서로 다른 파일이므로 병렬 실행 가능하다.
- `T010`, `T011`, `T012`는 각각 다른 테스트 대상이므로 병렬 실행 가능하다.
- `T024`, `T025`, `T026`은 서로 다른 renderer 파일이므로 병렬 실행 가능하다.
- `T028`, `T029`는 renderer 테스트 파일이 달라 병렬 실행 가능하다.
- `T034`, `T037`, `T041`은 서로 다른 테스트 파일에서 시작할 수 있다.

## MVP 완료 기준

1. 최소 2개 영상소스가 서로 다른 text/grid profile을 표시한다.
2. Query ID와 schema mapping으로 text/grid 결과가 렌더링된다.
3. 5/10/30/60초 polling과 cleanup, 중복 방지, section error isolation이 동작한다.
4. 사용자가 source별 자신의 section을 추가/편집/삭제/복원하고 순서를 저장할 수 있다.
5. 기존 확대 보기의 영상 재생, 테스트 알람, 이벤트 이동 동작이 회귀하지 않는다.
6. 관련 테스트와 frontend build가 통과한다.
