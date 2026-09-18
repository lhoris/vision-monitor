# 구현 계획: 영상소스별 Query 기반 메타데이터

**브랜치**: `main` | **작성일**: 2026-09-18 | **명세**: [spec.md](./spec.md)

## 1. 계획 요약

확대 보기의 고정 메타데이터 패널을 영상소스별·사용자별 layout profile 기반으로 전환한다. Query 기반 섹션은 등록된 Query ID와 결과 mapping을 사용하고, frontend mock service가 Query 결과를 주기적으로 반환한다. text 섹션은 Query 없이 정적 기본 텍스트만 표시하거나 Query·기본 텍스트·선택적 mapping을 조합할 수 있다. text와 grid를 MVP 필수 renderer로 구현하고 chart는 동일한 계약을 사용하는 확장 renderer로 둔다.

실제 Spring Boot API, DB migration, SQL 실행과 Query 관리 화면은 이번 범위에서 제외한다. 대신 mock contract와 데이터 모델을 먼저 고정해 후속 backend 연결 시 UI 계약을 바꾸지 않도록 한다.

## 2. 요구사항 추적

| 명세 범위 | 계획 반영 |
|---|---|
| FR-001~008, FR-025~035 | profile 모델, 섹션 편집, 추가/삭제/복원, 순서 저장, 기존 FocusMetadataPanel 통합 |
| FR-009~019, FR-036~038 | Query Registry, 결과 schema, 섹션별 polling, 오류/빈 상태/마지막 성공 상태 |
| FR-020~024, FR-031~033 | text/grid renderer, chart 확장 renderer, 이벤트 grid 재생 callback |
| UX-001~007, UX-012~016 | source별 독립 layout, drag-and-drop, 상태 표시, 반응형 grid, 이벤트 액션 |
| SC-001~009 | component/service/hook 테스트와 build 검증 |

## 3. 기술 컨텍스트

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **상태/저장**: 기존 React state 패턴과 localStorage mock adapter; Redux 전역 상태는 새 설정 저장의 단일 소스로 사용하지 않음
- **테스트**: Vitest, React Testing Library, fake timers
- **통합 경계**: `metadata-query-mock-contract.md`의 profile/query/result 계약
- **실제 backend**: MVP에서 구현하지 않음

## 4. 설계

### 4.1 컴포넌트 구조

`CameraFocus`는 현재 sourceId와 로그인 userId를 `FocusMetadataPanel`에 전달한다. 패널은 profile을 로드하고 순서대로 `MetadataSectionRenderer`를 렌더링한다. renderer는 type에 따라 `TextMetadataSection`, `GridMetadataSection`, `ChartMetadataSection`으로 위임한다.

패널 상단에는 섹션 설정 진입점과 기본 설정 복원 동작을 둔다. 설정 UI는 현재 source에 한정되며, 섹션 추가/편집/삭제 결과를 profile service에 저장한다. 기존 `focusMetadataLayoutService.ts`의 순서 전용 저장은 새 profile service로 흡수해 두 저장소가 충돌하지 않게 한다.

### 4.2 서비스와 polling

- `metadataConfigurationService`: profile 조회·저장·초기화, source/user 범위 검증
- `metadataQueryService`: enabled Query 목록과 mock 실행, Query/schema 오류 변환
- `useMetadataPolling`: section별 timer, AbortController cleanup, in-flight 중복 방지, active 상태 처리

화면 source가 변경되거나 unmount되면 모든 timer와 진행 중 요청을 정리한다. 새 조회 중 이전 성공 데이터가 있으면 `stale`로 표시하고, 실패해도 해당 섹션만 `error`로 전환한다.

### 4.3 기본 mock profile

최소 한 영상소스에는 다음 예시를 제공한다.

1. 연결/진행 상태를 보여주는 text section
2. 설정값을 보여주는 grid section
3. 이벤트 발생 현황을 보여주는 grid section과 재생 callback

다른 source에는 서로 다른 section 조합을 제공하여 source별 profile 격리를 검증한다.

### 4.4 데이터 흐름

`CameraFocus(sourceId, userId)` → `getMetadataProfile` → section list → `executeMetadataQuery(queryId, sourceId)` → `schema + rows` → type renderer → 상태/마지막 갱신 시각 표시. 설정 변경은 `saveMetadataProfile` 후 현재 profile과 renderer를 갱신한다.

## 5. 파일 계획

### 추가 또는 확장

- `frontend/src/types/metadataConfig.ts`: profile, section, query, schema, mapping 타입
- `frontend/src/mocks/metadataQueryRegistry.ts`: Query definition, source별 profile, mock result
- `frontend/src/services/metadataConfigurationService.ts`: user/source profile adapter
- `frontend/src/services/metadataQueryService.ts`: Query registry와 실행 adapter
- `frontend/src/hooks/useMetadataPolling.ts`: interval 및 상태 관리
- `frontend/src/components/CameraFocus/Metadata/MetadataSectionRenderer.tsx`
- `frontend/src/components/CameraFocus/Metadata/TextMetadataSection.tsx`
- `frontend/src/components/CameraFocus/Metadata/GridMetadataSection.tsx`
- `frontend/src/components/CameraFocus/Metadata/ChartMetadataSection.tsx`
- `frontend/src/components/CameraFocus/Metadata/MetadataSectionEditor.tsx`
- `frontend/src/components/CameraFocus/Metadata/__tests__/...`

### 수정

- `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`: 고정 섹션을 profile renderer로 교체하고 편집/순서/복원 연결
- `frontend/src/pages/CameraFocus.tsx`: sourceId와 userId 전달, 기존 이벤트 재생 callback 연결 유지
- `frontend/src/pages/__tests__/CameraFocus.test.tsx`: metadata profile 및 source 전환 검증 보강
- `frontend/src/services/focusMetadataLayoutService.ts`: 새 profile 저장소와 중복되지 않도록 제거 또는 compatibility adapter로 축소

## 6. 테스트 전략

- 타입/서비스: schema mapping 검증, Query ID 미존재, disabled Query, malformed storage, user/source 격리
- hook: 5초/10초 주기, fake timers, in-flight 중복 방지, active 해제 cleanup
- component: text/grid/chart rendering, loading/empty/error/stale, section add/edit/remove/reset, drag reorder
- 통합: CameraFocus source 전환, 이벤트 row playback callback, 기존 test alert와의 회귀
- 정적 검증: 관련 Vitest와 `npm run build`

## 7. 위험과 완화

| 위험 | 완화 |
|---|---|
| 기존 고정 3섹션과 새 profile 저장이 충돌 | profile service를 단일 저장소로 만들고 기존 service는 제거/adapter 처리 |
| polling timer 누수로 화면이 검게 되거나 오류 반복 | active/source effect cleanup, AbortController, fake timer 테스트 |
| Query mapping 오류가 전체 패널을 깨뜨림 | 섹션 경계 error state와 schema validation |
| 실제 backend 전환 시 계약 불일치 | schema/rows/queryId/fetchedAt 계약을 별도 문서로 고정 |

## 8. 구현 순서

1. 타입·mock registry·계약 테스트 기반을 만든다.
2. profile/query service와 polling hook을 구현한다.
3. text/grid renderer를 연결하고 기본 profile을 표시한다.
4. 섹션 편집, 추가/삭제/복원, drag reorder를 연결한다.
5. chart 확장 renderer와 이벤트 row action을 연결한다.
6. source/user 격리와 오류 상태를 통합 검증하고 build한다.
