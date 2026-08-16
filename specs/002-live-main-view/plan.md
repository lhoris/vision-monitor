# 구현 계획: 라이브 메인 화면

**브랜치**: `002-live-main-view` | **일자**: 2026-08-16 | **명세**: [spec.md](spec.md)

**입력**: `/specs/002-live-main-view/spec.md`의 기능 명세

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

> 이 문서는 한국어로 작성한다. 기술 용어, API 이름, 파일 경로, 코드 식별자, 명령어는 원문 또는 영문 표기를 유지할 수 있다.
> 구현 계획은 "어떻게 구현할 것인가"를 정의한다. 기능 경계는 spec.md를 기준으로 하며, plan.md에서 새 기능 요구사항을 추가하지 않는다.

## 1. 계획 요약

라이브 메인 화면은 기존 React frontend의 `Live` page, Grid 컴포넌트, layout store, mock camera/layout fixture를 기준으로 정리한다. MVP는 Spring Boot 실제 API 없이 frontend mock fallback과 Redux state를 사용하며, layout persistence API는 후속 backend 연동을 위한 계약 형태만 유지한다. 공정탭/세부공정탭/그리드/카메라 타일 조작은 현재 구현된 동작을 Spec Kit 기준 산출물로 승격하고, 남은 작업은 회귀 검증과 문서화 중심으로 분리한다. 003 화면 확대 보기는 이 기능의 하위 구현이 아니라, 선택 카메라와 현재 세부공정탭 카메라 목록을 전달받는 별도 기능으로 연결한다.

## 2. 요구사항 추적

| 명세 항목 | 계획 반영 위치 | 비고 |
|-----------|----------------|------|
| FR-001 | 5. 화면/컴포넌트 구조, tasks US1 | 공정탭 전환 |
| FR-002 | 5. 화면/컴포넌트 구조, tasks US1 | 세부공정탭 전환 |
| FR-003 | 5. 상태 및 상호작용 흐름, tasks US3 | 탭 추가/삭제/정렬 |
| FR-004 | 5. 화면/컴포넌트 구조, tasks US1 | 일정한 영상 셀 비율 |
| FR-005 | 5. 상태 및 상호작용 흐름, tasks US2 | grid layout selector |
| FR-006 | 5. 화면/컴포넌트 구조, tasks US2 | Add Camera |
| FR-007 | 6. 데이터 및 계약 계획, tasks US2 | used camera filtering |
| FR-008 | 5. 상태 및 상호작용 흐름, tasks US2 | drag/drop, swap |
| FR-009 | 5. 상태 및 상호작용 흐름, tasks US3 | Remove |
| FR-010 | 5. 상태 및 상호작용 흐름, tasks US3 | Rename |
| FR-011 | 6. 데이터 및 계약 계획, tasks US3 | title override |
| FR-012 | 5. 화면/컴포넌트 구조, tasks US1 | video-safe header |
| FR-013 | 5. 화면/컴포넌트 구조, tasks US1 | status dot only |
| FR-014 | 5. 화면/컴포넌트 구조, tasks US4 | hover/focus action |
| FR-015 | 6. 계약, tasks US4 | focus route contract |
| FR-016 | 7. 테스트 및 검증 계획 | empty/fallback state |
| FR-017 | 7. 테스트 및 검증 계획 | theme contrast |

## 3. 기술 컨텍스트

**언어/버전**: TypeScript, React 19, Vite 8

**주요 의존성**: React Router, Redux Toolkit, Vitest, React Testing Library, hls.js, video.js

**저장소/상태 관리**: Redux layout slice, frontend component state, mock fixture

**테스트**: Vitest, React Testing Library, production build

**대상 플랫폼**: 웹 브라우저, 운영 모니터 화면 중심

**프로젝트 유형**: frontend 중심 web app, backend skeleton은 MVP에서 변경하지 않음

**성능 목표**: 탭 전환과 그리드 조작은 즉시 반응하고, 영상 재생 상태는 개별 타일 단위로 격리한다.

**제약사항**: mock-only MVP, backend 저장 미구현, 외부 VMS/Media Server/AI 직접 구현 제외, 기존 Grid/StreamPlayer 구조 존중

**규모/범위**: 공정탭, 세부공정탭, 2x3/3x3/3x2/2x4/4x2/4x4 그리드, 카메라 7개 mock fixture, 003 route 진입

## 4. 구현 범위와 제외 범위

### 구현 범위

- `frontend/src/pages/Live.tsx` 라이브 메인 화면 진입
- `frontend/src/components/Grid/`의 탭, 세부탭, 그리드 컨테이너, 셀, 레이아웃 선택, 카메라 선택
- `frontend/src/store/slices/layoutSlice.ts`의 layout state와 탭/세부탭/그리드/카메라 위치 reducer
- `frontend/src/hooks/useLayout.ts`, `frontend/src/hooks/layoutMutations.ts`, `frontend/src/components/Grid/useGridLayout.ts`, `frontend/src/components/Grid/useGridDnd.ts`
- `frontend/src/mocks/liveMonitoring.ts` mock cameras/layout
- `frontend/src/services/layoutService.ts` frontend fallback contract
- `frontend/src/components/StreamPlayer/LiveStreamPlayer.tsx`와 그리드 타일 연결
- `/live/cameras/:cameraId`로 이동하기 위한 route query/state 계약

### 제외 범위

- 실제 Spring Boot layout API 구현
- DB migration과 사용자별 layout 영속 저장
- RTSP ingest, transcoding, media distribution
- AI inference와 server-side overlay
- 003 화면 확대 보기의 메타데이터/녹화/알람 상세 구현
- 001 로그인/권한 화면 구현

## 5. 설계 접근

### 화면/컴포넌트 구조

- `Live` page는 mock cameras와 layout 초기화 후 `GridContainer`를 렌더링한다.
- `GridContainer`는 상위 공정탭, 하위 세부공정탭, grid layout selector, camera cells, camera selector modal을 조합한다.
- `DraggableCell`은 타일 header와 video body를 분리하고, 카메라 제목/상태점/확대 action을 header에 둔다.
- 빈 셀은 `Add Camera` 상태로 렌더링하되, 실제 영상 타일과 같은 aspect ratio를 사용한다.
- `TabsBar`와 `SubTabsBar`는 클릭/추가/삭제/정렬 동작을 제공한다.

### 상태 및 상호작용 흐름

- layout state는 active tab과 각 tab의 active subtab을 가진다.
- grid config 변경은 현재 active subtab에만 적용한다.
- camera position 변경은 현재 active subtab의 `cameraPositions`에만 적용한다.
- 카메라 이동은 비어 있는 셀 이동과 점유 셀 swap을 구분한다.
- Rename title override는 현재 그리드 화면에서 카메라 표시명에 반영하고, 화면 확대 보기 진입 시 query 정보로 전달한다.
- 마지막 공정탭 또는 마지막 세부공정탭 삭제는 방지한다.

### 서비스 및 데이터 흐름

- MVP에서는 `createMockLayout`, `createMockCameras`를 기본 데이터로 사용한다.
- `layoutService`는 API 호출 실패 시 default development layout으로 fallback한다.
- `LiveStreamPlayer`는 카메라의 `streamUrl`과 `streamProtocol`을 사용하며, 타일 단위로 렌더링된다.
- 화면 확대 보기 진입은 `cameraId`, `mode=live`, `tabId`, `subTabId`, `cameraIds`, `cameraNames` query를 전달한다.

## 6. 데이터 및 계약 계획

### 필요한 데이터

- Layout
- Tab
- SubTab
- GridConfig
- CameraPosition
- Camera
- Camera title override
- Focus route entry context

### 계약

- [contracts/layout-contract.md](contracts/layout-contract.md)
- [contracts/grid-interaction-contract.md](contracts/grid-interaction-contract.md)
- [contracts/focus-entry-contract.md](contracts/focus-entry-contract.md)

### Fixture/Mock 계획

- Production Line A: Equipment 1/2, 3x3, 7개 camera positions
- Production Line B: Equipment 1, 2x2, 2개 camera positions
- Camera 1~7 live stream fixture
- layout API 실패 시 fallback default layout
- 빈 grid, 마지막 탭 삭제 방지, duplicate camera filtering fixture

## 7. 테스트 및 검증 계획

- **단위/컴포넌트 테스트**: `DraggableCell`, `GridContainer`, `TabsBar`, `SubTabsBar`, `LayoutSelector`, `CameraSelector`
- **서비스/계약 테스트**: `layoutService`, `liveMonitoring` fixture, route query 생성
- **상태 로직 테스트**: `layoutSlice`, `layoutMutations`, `useGridDnd`, `useGridLayout`
- **E2E/수동 검증**: quickstart.md의 탭 전환, 그리드 변경, 카메라 추가/이동/삭제/Rename, 확대 진입
- **빌드/정적 검증**: `npm test -- --run`, `npm run build` in `frontend/`
- **회귀 확인**: 003 화면 확대 보기 진입 시 카메라 목록 수와 Rename 제목 전달

## 8. 프로젝트 구조

### 문서 구조(이번 기능)

```text
specs/002-live-main-view/
├── assets/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### 소스 코드 구조

```text
frontend/
├── src/
│   ├── components/Grid/
│   ├── components/StreamPlayer/
│   ├── hooks/
│   ├── mocks/
│   ├── pages/
│   ├── services/
│   ├── store/slices/
│   └── types/

backend/
└── MVP에서 변경하지 않음
```

**구조 결정**: 현재 구현된 frontend 구조를 유지하고, backend 실제 구현은 후속 범위로 분리한다.

## 9. 헌법 체크

- **한국어 우선 산출물**: 통과. 모든 Spec Kit 산출물을 한국어로 작성한다.
- **기존 구조 존중**: 통과. 기존 `Live`, `Grid`, `StreamPlayer`, `layoutSlice` 구조를 기준으로 한다.
- **Mock-First MVP**: 통과. 실제 backend 구현 없이 mock fixture와 fallback service를 사용한다.
- **계약 우선**: 통과. layout, grid interaction, focus entry 계약을 별도 문서로 분리한다.
- **테스트 가능한 증분**: 통과. 사용자 스토리별 독립 테스트와 기존 테스트 파일을 연결한다.

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| layout state와 실제 backend 저장 계약 불일치 | 후속 backend 연동 시 재작업 | `layout-contract.md`로 MVP 계약을 고정 |
| 화면 확대 보기로 전달되는 cameraIds가 현재 세부탭과 불일치 | 003 화면에서 잘못된 카메라 목록 표시 | `focus-entry-contract.md`와 `GridContainer.focus.test.tsx`로 검증 |
| theme2/theme3에서 타일 제목 또는 dialog 글자 대비 부족 | 운영 화면 가독성 저하 | component test와 수동 theme quickstart 검증 |
| 그리드 크기 변경 시 기존 카메라 위치가 범위를 벗어남 | 영상 타일 누락 또는 빈 화면 | tasks에서 범위 밖 position 처리 기준 점검 |

## 11. 복잡도 추적

| 결정 | 필요한 이유 | 단순성을 유지할 근거 |
|------|-------------|-----------------------|
| Redux layout state 유지 | 탭/세부탭/그리드 상태가 여러 컴포넌트에 공유됨 | 기존 구현이 이미 Redux 기반이며 새 상태 관리 도입 없음 |
| route query로 focus entry context 전달 | 003 화면과 느슨하게 연결해야 함 | 별도 전역 store 추가 없이 현재 route 계약으로 충분 |

