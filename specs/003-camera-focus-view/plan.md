# 구현 계획: 화면 확대 보기

**브랜치**: `003-camera-focus-view` | **일자**: 2026-08-16 | **명세**: [spec.md](spec.md)

**입력**: `/specs/003-camera-focus-view/spec.md`의 기능 명세

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

> 이 문서는 한국어로 작성한다. 기술 용어, API 이름, 파일 경로, 코드 식별자, 명령어는 원문 또는 영문 표기를 유지할 수 있다.
> 구현 계획은 "어떻게 구현할 것인가"를 정의한다. 기능 경계는 spec.md를 기준으로 하며, plan.md에서 새 기능 요구사항을 추가하지 않는다.

## 1. 계획 요약

화면 확대 보기는 기존 React frontend의 카메라 그리드, stream player, mock service 계층을 확장해 구현한다. MVP는 Spring Boot 실제 API 없이 frontend mock adapter와 fixture를 사용하며, contract shape는 후속 backend 교체가 가능하도록 유지한다. 영상 제목/상태 UI는 영상 바깥 header로 분리하고, 알람/경고 토스트는 화면 확대 보기의 영상 시야를 과도하게 방해하지 않는 위치에 표시한다. 이미 구현된 focus route, mock contract, playback/event, alert toast, rename/title propagation 기능은 Spec Kit tasks에서 검증 중심으로 승격한다. BMAD 산출물은 migration source로만 보존하고, 실행 체계는 제거한다.

## 2. 요구사항 추적

| 명세 항목 | 계획 반영 위치 | 비고 |
|-----------|----------------|------|
| FR-001 | 5. 화면/컴포넌트 구조, tasks US1 | 기존 grid focus entry 검증 |
| FR-002 | 5. 상태 및 상호작용 흐름, tasks US1 | source grid context 유지 |
| FR-003 | 5. 화면/컴포넌트 구조, 6. 계약 | live/recording mode |
| FR-004 | 6. 데이터 및 계약 계획, tasks US2 | playback/events/timeline |
| FR-005 | 5. 설계 접근, 6. 계약 | metadata/event/alert panel |
| FR-006 | 5. 상태 및 상호작용 흐름, tasks US3 | toast/banner dismiss |
| FR-007 | 5. 상태 및 상호작용 흐름, tasks US4 | title override propagation |
| FR-008 | 5. 화면/컴포넌트 구조 | video-safe header layout |
| FR-009 | 7. 테스트 및 검증 계획 | theme contrast 검증 |
| FR-010 | 7. 테스트 및 검증 계획 | partial failure isolation |
| FR-011 | 7. 테스트 및 검증 계획 | forbidden metadata non-exposure |

## 3. 기술 컨텍스트

**언어/버전**: TypeScript, React 19, Vite 8

**주요 의존성**: React Router, Redux Toolkit, Vitest, React Testing Library, hls.js, video.js

**저장소/상태 관리**: frontend state, route state/query, mock fixture

**테스트**: Vitest, React Testing Library, production build

**대상 플랫폼**: 웹 브라우저, 운영 모니터 화면 중심

**프로젝트 유형**: frontend 중심 web app, backend skeleton은 MVP에서 변경하지 않음

**성능 목표**: 화면 확대 보기 shell은 진입 후 빠르게 표시되고, 영상 로딩은 독립 loading state로 표시

**제약사항**: mock-only MVP, 외부 VMS/Media Server/AI 직접 구현 제외, 기존 Grid/StreamPlayer 구조 존중

**규모/범위**: 카메라 그리드, 화면 확대 보기, live/recording, event/alert metadata, theme1/2/3

## 4. 구현 범위와 제외 범위

### 구현 범위

- `frontend/src/pages/CameraFocus.tsx` 및 focus route 흐름
- `frontend/src/components/CameraFocus/` 하위 shell, video stage, metadata panel, alert banner, recording timeline/list
- `frontend/src/services/*MockAdapter.ts`, `focusApiService`, `recordingService`, `cameraService`
- `frontend/src/mocks/*` fixture와 `frontend/src/types/*` 타입
- `frontend/src/components/Grid/`의 focus 진입, Rename, title/header UI
- 관련 unit/component/service tests

### 제외 범위

- Spring Boot 실제 API/controller/service/repository/entity 구현
- DB migration과 서버 저장소
- RTSP ingest, transcoding, media distribution
- AI inference, server-side overlay
- 서버 ACK 기반 알람 workflow, WebSocket/SSE push

## 5. 설계 접근

### 화면/컴포넌트 구조

- Grid camera tile은 title/status/action header와 video body를 분리한다.
- focus entry는 `cameraId`, `mode`, source context를 route query/state로 전달한다.
- CameraFocus page는 shell layout, video stage, metadata panel, camera tab list, live/recording mode control을 조합한다.
- recording mode는 timeline, event marker, event list를 video stage와 metadata panel에 연결한다.
- alert toast/banner는 focus view 내 별도 overlay layer로 관리하되 영상 판독을 방해하지 않는 위치와 motion을 사용한다.

### 상태 및 상호작용 흐름

- camera metadata, live stream, playback session, events, active alerts는 독립 loading/error/fallback state를 가진다.
- Rename title override는 grid와 focus view 양쪽에서 같은 source of truth를 사용한다.
- focus camera tab list는 진입 전 source grid camera IDs를 우선 사용한다.
- active alert dismiss는 현재 route session 단위로 우선 처리하고, 장기 저장은 후속 범위로 둔다.
- forbidden response는 일반 error와 분리하고, 보호된 metadata를 렌더링하지 않는다.

### 서비스 및 데이터 흐름

- UI는 `focusApiService`, `cameraService`, `recordingService`, alert/event hooks를 통해 mock adapter를 호출한다.
- `streamUrl`과 `playbackUrl`은 opaque URL로 취급한다.
- mock adapter는 성공/404/403/failure fixture를 제공한다.
- 후속 Spring Boot API는 동일 contract shape를 유지하면서 mock adapter를 교체한다.

## 6. 데이터 및 계약 계획

### 필요한 데이터

- Camera focus metadata
- Live stream source
- Playback session과 timeline segment
- Camera event와 event detail
- Active alert
- Grid source context
- Camera title override

### 계약

- [contracts/camera-focus-contract.md](contracts/camera-focus-contract.md)
- [contracts/focus-route-contract.md](contracts/focus-route-contract.md)
- [contracts/ui-state-contract.md](contracts/ui-state-contract.md)

### Fixture/Mock 계획

- 정상 camera/live/playback/events/alerts fixture
- 404 not found fixture
- 403 forbidden fixture, data 미노출
- partial failure fixture
- theme/long title/empty title 검증 fixture

## 7. 테스트 및 검증 계획

- **단위/컴포넌트 테스트**: focus route parsing, FocusVideoStage, FocusMetadataPanel, FocusAlertBanner, RecordingTimeline, RecordingEventList
- **서비스/계약 테스트**: focusApiService, cameraService, cameraFocus/liveStream/playback/events/alerts mock adapters
- **E2E/수동 검증**: quickstart.md의 그리드 진입, live/recording 전환, alert dismiss, theme contrast
- **빌드/정적 검증**: `npm test -- --run`, `npm run build` in `frontend/`
- **회귀 확인**: 기존 grid tab/subtab, Rename dialog, StreamPlayer 기본 동작

## 8. 프로젝트 구조

### 문서 구조(이번 기능)

```text
specs/003-camera-focus-view/
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
│   ├── components/CameraFocus/
│   ├── components/Grid/
│   ├── components/StreamPlayer/
│   ├── hooks/
│   ├── mocks/
│   ├── pages/
│   ├── services/
│   └── types/

backend/
└── MVP에서 변경하지 않음
```

**구조 결정**: 기존 frontend 구현 구조를 유지하고, backend 실제 구현은 후속 범위로 분리한다.

## 9. 헌법 체크

- **한국어 우선 산출물**: 통과. 산출물은 한국어로 작성한다.
- **기존 구조 존중**: 통과. 기존 React/Grid/StreamPlayer/service 구조를 유지한다.
- **Mock-First MVP**: 통과. backend/API/DB 직접 구현은 제외한다.
- **계약 우선**: 통과. mock contract를 contracts/에 분리한다.
- **테스트 가능한 증분**: 통과. 사용자 스토리별 독립 검증 task를 작성한다.

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| BMAD 산출물과 실제 구현 상태 불일치 | tasks.md가 과거 상태를 반영할 수 있음 | 현재 repo 파일 존재 여부와 테스트 결과를 기준으로 tasks를 재분류 |
| 알람 dismiss scope 미확정 | UX/상태 유지 정책 변경 가능 | route session 기준을 MVP 가정으로 두고 미정 사항 유지 |
| 외부 VMS/Media Server 계약 부재 | 실제 영상 재생과 mock 간 차이 가능 | URL opaque contract 유지, 실제 연동은 후속 범위 |
| theme2/theme3 대비 회귀 | 운영 화면 가독성 저하 | quickstart와 component tests에 contrast 수동 검증 포함 |

## 11. 복잡도 추적

| 결정 | 필요한 이유 | 더 단순한 대안을 거부한 이유 |
|------|-------------|-------------------------------|
| mock contract를 contracts/로 분리 | BMAD 산출물을 제거해도 API 경계를 유지해야 함 | 구현 코드만 보면 후속 backend 교체 기준이 불명확함 |
| active/superseded/deprecated 원문 자료 상태 도입 | PPT 화면 초안이 요구 변경으로 과거 자료가 될 수 있음 | 단순 링크 목록은 현재 해석 근거와 이력 자료를 구분하지 못함 |

