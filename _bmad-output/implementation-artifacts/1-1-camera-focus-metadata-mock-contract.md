---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 1.1: Camera Focus Metadata Mock Contract

Status: done

## 목표

`GET /api/cameras/{cameraId}/focus`에 해당하는 카메라 집중 보기 메타데이터 계약을 프론트엔드 TypeScript DTO와 mock adapter로 고정한다.

이 Story는 실제 Spring Boot Backend API 구현이 아니다. MVP에서는 프론트엔드 mock service/mock adapter가 백엔드 응답을 대신하며, 이후 같은 DTO와 endpoint 의미를 유지한 채 Spring Boot API client로 교체 가능해야 한다.

## 사용자 가치

운영자는 집중 보기 화면 진입 시 선택한 카메라의 이름, 공정, 구역, 라인, 위치, 현재 상태, 녹화 가능 여부, 기능 지원 여부, 최근 이벤트 요약을 안정적으로 볼 수 있다. 후속 Focus 화면, live stream, recording, alert Story는 같은 첫 API 계약을 기반으로 백엔드 구현 없이 진행할 수 있다.

## Story

As an 운영자,
I want 선택한 카메라의 기본 정보와 현재 상태를 Focus 화면 계약으로 조회하고 싶다,
so that 집중 보기 화면에서 카메라 맥락과 영상 영역을 함께 확인할 수 있다.

## Acceptance Criteria

1. 유효한 `cameraId`에 대해 mock adapter는 `ApiResponse<CameraFocusDto>` 형태의 성공 응답을 반환한다.
2. 성공 응답의 `data`는 `cameraId`, `cameraName`, `processType`, `zoneName`, `lineName`, `location`, `status`, `recordingEnabled`, `capabilities`, `lastSeenAt`, `recentEventSummary`를 포함한다.
3. `capabilities`는 최소 `live`, `recording`, `ptz`, `overlay` boolean 필드를 가진 `CameraCapabilitiesDto`로 정의한다.
4. `recentEventSummary`는 최근 이벤트가 있는 경우 `lastEventId`, `lastSeverity`, `lastOccurredAt`, `openCount`를 제공하고, 최근 이벤트가 없는 경우에도 UI가 안전하게 처리할 수 있는 명시적 null/0 형태를 제공한다.
5. 존재하지 않는 `cameraId`는 `success: false`, `error: 'NOT_FOUND'`, message, timestamp를 포함한 mock error envelope를 반환하며 `data`를 포함하지 않는다.
6. 권한이 없는 `cameraId`는 `success: false`, `error: 'FORBIDDEN'`, message, timestamp를 포함한 mock error envelope를 반환하며 제한된 camera/event metadata를 `data`에 노출하지 않는다.
7. 모든 시간 필드는 ISO-8601 문자열을 사용하고, fixture는 Asia/Seoul 기준 표시로 변환 가능한 `+09:00` 값을 사용한다.
8. endpoint 문자열은 mock adapter 내부에서 `/api/cameras/{cameraId}/focus` 의미를 유지하되, 이 Story에서 실제 network call을 강제하지 않는다.
9. 타입과 mock adapter 테스트는 success, not found, forbidden, recent event 있음/없음 케이스를 검증한다.
10. 기존 `cameraService`의 `getAllCameras`, `getCameraDetail` 등 기존 동작은 변경되거나 깨지면 안 된다.

## 구현 범위

- Frontend 전용 DTO contract 추가.
- Focus metadata mock fixture 추가.
- `GET /api/cameras/{cameraId}/focus` 의미를 가진 mock adapter/service method 추가.
- 기존 `ApiResponse<T>` envelope와 camelCase JSON 필드 관례 유지.
- 후속 Story 1.2-1.4와 2.1에서 재사용 가능한 타입 export 정리.
- `cameraService`에 Focus 전용 method를 추가할 수 있다. 단, 2.1의 책임은 1.1-1.4 mock contract들을 UI가 직접 mock 구현체에 의존하지 않도록 통합하는 service/hook layer 정리로 남긴다.

## 제외 범위

- Spring Boot controller/service/repository/entity/DTO 구현.
- DB migration 또는 persistence-backed API.
- RTSP ingest, AI inference, media distribution, server-side overlay.
- live `streamUrl` 계약. 이는 Story 1.2 범위다.
- playback/events 계약. 이는 Story 1.3 범위다.
- active alert/event detail/acknowledge 계약. 이는 Story 1.4 범위다.
- Focus route/page shell 및 UI 렌더링. 이는 Epic 2 이후 범위다.

## DTO Contract

권장 위치: `frontend/src/types/cameraFocus.ts`

```ts
export type CameraFocusStatus =
  | 'online'
  | 'offline'
  | 'error'
  | 'maintenance'
  | 'forbidden'

export type EventSeverity = 'info' | 'warning' | 'critical'

export interface CameraCapabilitiesDto {
  live: boolean
  recording: boolean
  ptz: boolean
  overlay: boolean
}

export interface RecentEventSummaryDto {
  lastEventId: number | null
  lastSeverity: EventSeverity | null
  lastOccurredAt: string | null
  openCount: number
}

export interface CameraFocusDto {
  cameraId: number
  cameraName: string
  processType: string
  zoneName: string
  lineName: string
  location: string
  status: CameraFocusStatus
  recordingEnabled: boolean
  capabilities: CameraCapabilitiesDto
  lastSeenAt: string | null
  recentEventSummary: RecentEventSummaryDto
}
```

Success envelope 예시:

```ts
{
  success: true,
  data: {
    cameraId: 1,
    cameraName: 'Entry Zone CAM-01',
    processType: '가열',
    zoneName: 'Entry Zone',
    lineName: 'Line 1',
    location: '제조 구역 A',
    status: 'online',
    recordingEnabled: true,
    capabilities: {
      live: true,
      recording: true,
      ptz: false,
      overlay: false,
    },
    lastSeenAt: '2026-08-15T08:59:30+09:00',
    recentEventSummary: {
      lastEventId: 50001,
      lastSeverity: 'warning',
      lastOccurredAt: '2026-08-15T08:55:00+09:00',
      openCount: 2,
    },
  },
  error: undefined,
  message: undefined,
  timestamp: '2026-08-15T09:00:00+09:00',
}
```

Recent event가 없는 success envelope는 다음 형태를 사용한다.

```ts
recentEventSummary: {
  lastEventId: null,
  lastSeverity: null,
  lastOccurredAt: null,
  openCount: 0,
}
```

Forbidden mock은 제한 metadata를 넣지 않는다.

```ts
{
  success: false,
  error: 'FORBIDDEN',
  message: '이 카메라에 접근 권한이 없습니다.',
  timestamp: '2026-08-15T09:00:00+09:00',
}
```

Not found mock은 다음 형태를 사용한다.

```ts
{
  success: false,
  error: 'NOT_FOUND',
  message: '카메라를 찾을 수 없습니다.',
  timestamp: '2026-08-15T09:00:00+09:00',
}
```

## 관련 파일 후보

- `frontend/src/types/cameraFocus.ts`: 신규 Focus DTO 타입.
- `frontend/src/types/index.ts`: 신규 타입 re-export.
- `frontend/src/mocks/cameraFocus.ts`: 신규 Focus mock fixture/lookup.
- `frontend/src/services/cameraFocusMockAdapter.ts`: 신규 mock adapter.
- `frontend/src/services/cameraService.ts`: `getCameraFocus(cameraId)` 추가 가능. 기존 `getAllCameras`, `getCameraDetail` 동작 보존.
- `frontend/src/services/index.ts`: 필요한 경우 service export 추가.
- `frontend/src/services/__tests__/cameraService.test.ts`: 기존 service 테스트 확장 후보.
- `frontend/src/mocks/__tests__/cameraFocus.test.ts` 또는 `frontend/src/services/__tests__/cameraFocusMockAdapter.test.ts`: mock contract 전용 테스트 후보.

## 구현 순서

1. `frontend/src/types/cameraFocus.ts`에 Focus DTO 타입을 추가하고 `frontend/src/types/index.ts`에서 export한다.
2. `frontend/src/mocks/cameraFocus.ts`에 valid, not found, forbidden, recent event 없음 fixture를 만든다.
3. mock adapter 함수를 추가한다. 권장 시그니처는 `getCameraFocusMock(cameraId: number): Promise<ApiResponse<CameraFocusDto>>`다.
4. `cameraService.getCameraFocus(cameraId)`를 추가하는 경우 MVP에서는 mock adapter를 호출한다. 나중에 `apiClient.get<CameraFocusDto>(`/cameras/${cameraId}/focus`)`로 교체 가능한 경계를 유지한다.
5. forbidden/not found 응답 경로에서 `CameraFocusDto` 일부를 채워 반환하지 않도록 테스트로 고정한다.
6. 기존 camera service 테스트가 깨지지 않도록 focus 테스트는 독립 파일로 추가하거나 기존 파일에 명확히 분리한다.

## 테스트 기준

- `npm test -- cameraFocus` 또는 해당 테스트 파일 단위 실행이 통과한다.
- 가능하면 `npm test -- cameraService`가 기존 회귀 없이 통과한다.
- TypeScript build에서 신규 타입 export 충돌이 없어야 한다.
- 테스트는 다음을 검증한다.
  - valid camera 응답이 `ApiResponse<CameraFocusDto>` envelope를 따른다.
  - `capabilities`와 `recentEventSummary` 필드가 누락되지 않는다.
  - 최근 이벤트가 없는 camera는 `recentEventSummary`에 null/0 값을 반환한다.
  - 없는 camera는 `success: false`, `error: 'NOT_FOUND'`, message를 반환하고 `data`가 없다.
  - forbidden camera는 `success: false`, `error: 'FORBIDDEN'`, message를 반환하고 제한 metadata를 노출하지 않는다.
  - ISO-8601 `+09:00` fixture가 유지된다.

## Dev Notes

- 현재 코드베이스는 Frontend React/Vite PoC와 Backend Spring Boot skeleton 상태다. 이 Story는 backend skeleton을 확장하지 않는다.
- 기존 `frontend/src/types/api.ts`의 `ApiResponse<T>`는 `success`, `data?`, `error?`, `message?`, `timestamp` 구조다. 이 계약은 해당 envelope를 재사용한다.
- 기존 `frontend/src/services/cameraService.ts`는 `apiClient`와 `withServiceFallback` 패턴을 사용한다. Focus mock은 후속 HTTP client 교체가 가능하도록 service method 경계를 명확히 둔다.
- 기존 `frontend/src/mocks/liveMonitoring.ts`는 Live Grid용 mock camera/layout을 제공한다. Focus mock fixture는 여기에 무리하게 섞지 말고 Focus 계약 전용 파일로 분리한다.
- Architecture AD-1에 따라 Vision Monitor는 media/AI 책임을 갖지 않는다. 이 Story에서 `streamUrl`, `playbackUrl`, AI overlay 생성, RTSP 처리 코드를 만들지 않는다.
- Architecture convention에 따라 media URL은 opaque value다. 이 Story는 media URL 계약 자체를 다루지 않는다.
- MVP sprint 전제에 따라 Story 1.1-1.4는 frontend mock contract Story다. epics 원문에 남아 있는 backend 구현 표현보다 이 Story의 mock-only 범위를 우선한다.
- 이전 Story는 없다.

## Validation Notes

- Story 목표와 Acceptance Criteria는 현재 repo의 React/Vite, TypeScript, Vitest 구조에서 구현 가능하다.
- mock-only MVP 전제는 유지된다. Spring Boot, DB, RTSP, AI, media distribution, server-side overlay 구현은 명시적으로 제외된다.
- 관련 파일 후보는 실제 repo 구조와 맞는다. 신규 파일은 `frontend/src/types`, `frontend/src/mocks`, `frontend/src/services` 하위에 배치하는 것이 자연스럽다.
- 범위는 개발 가능한 크기다. 단, UI hook/page 구현은 포함하지 않고 DTO + fixture + mock adapter + 선택적 `cameraService.getCameraFocus` 경계까지만 수행해야 한다.
- 판정: PASS WITH CHANGES.

## References

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/sprint-plan-camera-focus-view-2026-08-15.md`
- `_bmad-output/planning-artifacts/prd-camera-focus-view.md`
- `_bmad-output/planning-artifacts/architecture/architecture-vision-monitor-2026-08-15/ARCHITECTURE-SPINE.md`
- `_bmad-output/planning-artifacts/architecture/architecture-vision-monitor-2026-08-15/BROWNFIELD-ARCHITECTURE.md`
- `_bmad-output/planning-artifacts/ux-designs/ux-vision-monitor-2026-08-15/DESIGN.md`
- `_bmad-output/planning-artifacts/ux-designs/ux-vision-monitor-2026-08-15/EXPERIENCE.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-08-15.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- cameraFocusMockAdapter cameraService --run` (red phase: failed before implementation)
- `npm test -- cameraFocusMockAdapter cameraService --run` (green phase: 10 passed)
- `npm test -- --run` (full regression: 134 passed)
- `npm run build` (TypeScript build and Vite production build passed)
- `npm run lint` (blocked: local `eslint` command is not installed)

### Completion Notes List

- Added the frontend Camera Focus DTO contract and re-exported it from the shared types barrel.
- Added Focus metadata fixtures with valid, no-recent-event, forbidden, and not-found lookup paths.
- Added the mock adapter boundary for `/api/cameras/{cameraId}/focus`, preserving error envelopes without `data`.
- Added `cameraService.getCameraFocus(cameraId)` as a mock-backed service method without changing existing camera service behavior.
- Added adapter and service tests covering success, recent event present/absent, 404, 403, endpoint path, and no network call from the mock-backed service method.

### File List

- `_bmad-output/implementation-artifacts/1-1-camera-focus-metadata-mock-contract.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/types/cameraFocus.ts`
- `frontend/src/types/index.ts`
- `frontend/src/mocks/cameraFocus.ts`
- `frontend/src/services/cameraFocusMockAdapter.ts`
- `frontend/src/services/cameraService.ts`
- `frontend/src/services/index.ts`
- `frontend/src/services/__tests__/cameraFocusMockAdapter.test.ts`
- `frontend/src/services/__tests__/cameraService.test.ts`

## Change Log

- 2026-08-15: Implemented Story 1.1 frontend DTO, fixture, mock adapter, optional camera service method, and focused contract tests.
