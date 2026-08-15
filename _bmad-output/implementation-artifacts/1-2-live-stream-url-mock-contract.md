---
baseline_commit: 9ed9e63c58bd4c7cbf7d686391077882f46c851c
---

# Story 1.2: Live Stream URL Mock Contract

Status: done

## 목표

`GET /api/cameras/{cameraId}/live-stream`에 해당하는 실시간 영상 URL 계약을 프론트엔드 TypeScript DTO와 mock adapter로 고정한다.

이 Story는 실제 Spring Boot Backend API, DB, RTSP ingest, AI inference, media distribution, server-side overlay를 구현하지 않는다. MVP에서는 프론트엔드 mock service/mock adapter가 백엔드 응답을 대체하며, 이후 같은 DTO와 endpoint 의미를 유지한 채 Spring Boot API client로 교체할 수 있어야 한다.

## 사용자 가치

운영자는 Focus 화면의 실시간 모드에서 선택한 카메라의 browser-playable stream source를 즉시 받을 수 있다. 개발팀은 후속 Live View Story가 실제 media/backend 구현 없이도 `streamUrl` 계약만으로 기존 StreamPlayer 계층을 연결할 수 있다.

## Story

As an 운영자,
I want 선택한 카메라의 실시간 스트림 URL 계약을 조회하고 싶다,
so that 집중 보기 화면에서 외부 VMS/Media Server가 제공한 실시간 영상을 재생할 수 있다.

## Acceptance Criteria

1. 유효하고 접근 가능한 `cameraId`에 대해 mock adapter는 `ApiResponse<LiveStreamDto>` 형태로 성공 응답을 반환한다.
2. 성공 응답의 `data`는 `cameraId`, `streamUrl`, `streamProtocol`, `expiresAt`, `status`, `resolution`, `fps`, `metadata`를 포함한다.
3. `streamUrl`은 opaque URL이다. mock/test는 URL 내부 구조를 비즈니스 로직으로 파싱하거나 특정 provider path에 결합하지 않는다.
4. `streamProtocol`은 최소 `stream_page`, `hls`, `webrtc`, `rtsp_bridge`, `unknown` 중 하나로 타입을 제한한다.
5. signed URL 성격의 fixture는 `expiresAt`을 ISO-8601 `+09:00` 문자열로 제공한다.
6. live stream이 없는 카메라 또는 live capability가 없는 카메라는 `success: false` 또는 명시적 inactive/error envelope를 반환하며, 호출자가 video stage 실패 상태로 구분할 수 있다.
7. 권한이 없는 `cameraId`는 `success: false`, `error: 'FORBIDDEN'` envelope를 반환하고 `streamUrl`을 노출하지 않는다.
8. 존재하지 않는 `cameraId`는 `success: false`, `error: 'NOT_FOUND'` envelope를 반환하고 `data`를 포함하지 않는다.
9. endpoint 문자열은 mock adapter 내부에서 `/api/cameras/{cameraId}/live-stream` 의미를 유지한다.
10. 기존 Story 1.1의 `CameraFocusDto.capabilities.live`와 충돌하지 않는다. live capability가 false인 fixture는 성공 stream URL을 반환하지 않는다.

## 구현 범위

- Frontend 전용 `LiveStreamDto` contract 추가.
- live stream mock fixture 추가.
- `/api/cameras/{cameraId}/live-stream` 의미를 가진 mock adapter 추가.
- 필요 시 `cameraService.getCameraLiveStream(cameraId)` 또는 명확히 동등한 service method 추가.
- Story 1.1에서 생성된 Focus mock fixture와 일관된 camera id, forbidden id, timestamp convention 재사용.
- Vitest 기반 contract test 추가.

## 제외 범위

- Spring Boot controller/service/repository/entity/DTO 구현.
- DB migration 또는 persistence-backed API.
- RTSP ingest, FFmpeg/transcoding, media distribution, media proxy, Media Server 구현.
- AI inference 또는 server-side overlay 생성.
- Playback URL 계약. 이는 Story 1.3 범위다.
- Focus page route, video stage UI, `LiveStreamPlayer` mount. 이는 Epic 2/3 범위다.
- URL 만료 refresh UX. 이 Story는 `expiresAt` fixture와 타입 계약까지만 고정한다.

## DTO Contract

권장 타입 위치는 Story 1.1의 `frontend/src/types/cameraFocus.ts`를 확장하거나, Focus 관련 타입이 커진다면 `frontend/src/types/cameraStream.ts`로 분리한다. 후속 story에서 찾기 쉽도록 `frontend/src/types/index.ts`에서 re-export한다.

```ts
export type LiveStreamProtocol =
  | 'stream_page'
  | 'hls'
  | 'webrtc'
  | 'rtsp_bridge'
  | 'unknown'

export type LiveStreamStatus =
  | 'active'
  | 'inactive'
  | 'maintenance'
  | 'error'
  | 'forbidden'

export interface LiveStreamDto {
  cameraId: number
  streamUrl: string
  streamProtocol: LiveStreamProtocol
  expiresAt: string | null
  status: LiveStreamStatus
  resolution: string | null
  fps: number | null
  metadata: {
    provider: string
    latencyClass: 'live' | 'near-live' | 'unknown'
    [key: string]: unknown
  }
}
```

Success envelope 예시:

```ts
{
  success: true,
  data: {
    cameraId: 1,
    streamUrl: 'http://media.example.local/stream.html?src=video_high1',
    streamProtocol: 'stream_page',
    expiresAt: '2026-08-15T09:05:00+09:00',
    status: 'active',
    resolution: '1920x1080',
    fps: 30,
    metadata: {
      provider: 'external-vms',
      latencyClass: 'live',
    },
  },
  timestamp: '2026-08-15T09:00:00+09:00',
}
```

Forbidden envelope는 stream URL을 절대 포함하지 않는다.

```ts
{
  success: false,
  error: 'FORBIDDEN',
  message: 'You do not have permission to access this camera stream.',
  timestamp: '2026-08-15T09:00:00+09:00',
}
```

## 관련 파일 후보

- `frontend/src/types/cameraFocus.ts` 또는 `frontend/src/types/cameraStream.ts`: `LiveStreamDto` 타입 후보.
- `frontend/src/types/index.ts`: 신규 타입 re-export.
- `frontend/src/mocks/cameraFocus.ts`: camera id, timestamp convention 참고. 직접 섞기보다 live stream fixture 파일 분리 권장.
- `frontend/src/mocks/cameraLiveStream.ts`: 신규 live stream fixture/lookup 후보.
- `frontend/src/services/cameraLiveStreamMockAdapter.ts`: 신규 mock adapter 후보.
- `frontend/src/services/cameraService.ts`: `getCameraLiveStream(cameraId)` 추가 후보.
- `frontend/src/services/index.ts`: 필요한 경우 service export.
- `frontend/src/services/__tests__/cameraLiveStreamMockAdapter.test.ts`: contract test 후보.
- `frontend/src/services/__tests__/cameraService.test.ts`: service method 회귀 테스트 확장 후보.
- `frontend/src/streaming/config.ts`: 기존 stream page URL builder 참고만 한다. Live stream mock이 이 helper에 과도하게 결합되지 않게 한다.

## 구현 순서

1. `LiveStreamDto`, `LiveStreamProtocol`, `LiveStreamStatus` 타입을 추가하고 barrel export를 정리한다.
2. `frontend/src/mocks/cameraLiveStream.ts`에 valid, signed URL expiry, inactive/no-live-capability, forbidden, not-found fixture를 만든다.
3. `buildCameraLiveStreamEndpoint(cameraId)`와 `getCameraLiveStreamMock(cameraId)`를 가진 mock adapter를 추가한다.
4. mock adapter는 `/api/cameras/{cameraId}/live-stream` endpoint template를 상수로 노출해 후속 Spring Boot client 전환 경계를 분명히 한다.
5. 필요 시 `cameraService.getCameraLiveStream(cameraId)`를 추가하고 MVP에서는 mock adapter를 호출하게 한다. 기존 camera service 메서드는 변경하지 않는다.
6. forbidden/not-found 응답에는 `data`와 `streamUrl`이 없음을 테스트로 고정한다.
7. live capability가 false인 camera fixture는 성공 stream URL을 반환하지 않도록 Story 1.1의 capability 의미와 맞춘다.

## 테스트 기준

- `npm test -- cameraLiveStreamMockAdapter --run` 또는 해당 테스트 파일 단위 실행이 통과한다.
- 가능하면 `npm test -- cameraService --run`이 기존 회귀 없이 통과한다.
- TypeScript build에서 신규 타입 export 충돌이 없어야 한다.
- 테스트는 다음을 검증한다.
  - valid camera 응답이 `ApiResponse<LiveStreamDto>` envelope를 따른다.
  - `streamUrl`, `streamProtocol`, `expiresAt`, `status`, `resolution`, `fps`, `metadata.provider`가 존재한다.
  - `expiresAt`이 있는 fixture는 ISO-8601 `+09:00` 문자열을 사용한다.
  - not found는 `success: false`, `error: 'NOT_FOUND'`, no `data`다.
  - forbidden은 `success: false`, `error: 'FORBIDDEN'`, no `data`, no `streamUrl`이다.
  - inactive/no-live-capability fixture는 active stream URL 성공 응답을 반환하지 않는다.
  - endpoint template는 `/api/cameras/{cameraId}/live-stream`로 유지된다.

## Dev Notes

- 현재 코드베이스는 Frontend React/Vite PoC와 Backend Spring Boot skeleton 상태다. 이 Story는 backend skeleton을 건드리지 않는다.
- Story 1.1은 done이며 다음 경계를 만들었다.
  - `frontend/src/types/cameraFocus.ts`
  - `frontend/src/mocks/cameraFocus.ts`
  - `frontend/src/services/cameraFocusMockAdapter.ts`
  - `cameraService.getCameraFocus(cameraId)`
  - `ApiResponse<T>` success/error envelope 테스트
- Story 1.1 fixture의 `FORBIDDEN_CAMERA_FOCUS_ID = 403`, `CAMERA_FOCUS_MOCK_TIMESTAMP = '2026-08-15T09:00:00+09:00'` 관례를 참고하되, live stream 전용 이름으로 분리하면 test intent가 더 선명하다.
- 기존 `frontend/src/mocks/liveMonitoring.ts`와 `frontend/src/streaming/config.ts`는 Live Grid PoC용 stream page URL을 만든다. 1.2 mock contract는 외부 Media Server가 준 URL을 흉내 내는 것이며, URL 구조를 비즈니스 로직으로 파싱하지 않는다.
- `streamProtocol: 'rtsp_bridge'`는 RTSP를 직접 처리하라는 뜻이 아니다. browser-playable wrapper/page 또는 기존 player adapter로 전달할 opaque 계약값이다.
- Architecture/SPRINT 전제에 따라 `streamUrl`과 나중의 `playbackUrl`은 분리된 계약이다. 이 Story에서 playback 관련 타입을 추가하지 않는다.
- 후속 Story 3.1에서 `LiveStreamPlayer` 연결이 이루어진다. 이 Story는 UI mount가 아니라 mock contract foundation이다.

## Validation Notes

- Story 크기는 DTO + fixture + adapter + optional service method + tests로 제한된 vertical slice다.
- MVP mock-only 전제를 따른다.
- Spring Boot, DB, RTSP, AI, media distribution, server-side overlay 구현은 명시적으로 제외했다.
- Story 1.1의 완료 결과와 같은 service/mock/test 패턴을 이어받는다.

## References

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/sprint-plan-camera-focus-view-2026-08-15.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/implementation-artifacts/1-1-camera-focus-metadata-mock-contract.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- cameraLiveStreamMockAdapter cameraService --run` (red phase: failed once due to a missing test-file closing parenthesis)
- `npm test -- cameraLiveStreamMockAdapter cameraService --run` (green phase: 13 passed)
- `npm test -- --run` (full frontend regression: 142 passed)
- `npm run build` (TypeScript build and Vite production build passed; existing chunk-size warning only)

### Completion Notes List

- Added `LiveStreamDto`, protocol/status metadata types, and shared type exports through the existing `cameraFocus` type module.
- Added live stream mock fixtures for active stream-page/HLS responses, unavailable maintenance state, forbidden, not found, and invalid id paths.
- Added `/api/cameras/{cameraId}/live-stream` mock adapter with replaceable endpoint template and no `data` exposure on 403/404/error envelopes.
- Added `cameraService.getCameraLiveStream(cameraId)` as a mock-backed service boundary without calling `apiClient`.
- Added contract tests for success, opaque URL handling, unavailable stream, 404, 403, invalid ids, endpoint path, and service boundary.
- Applied review fixes: unavailable fixture no longer masquerades as `LiveStreamDto`, active fixture uses HTTPS, invalid ids are rejected, unavailable checks trim URL text, and 404 tests guard against stream/provider leakage.

### File List

- `_bmad-output/implementation-artifacts/1-2-live-stream-url-mock-contract.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `frontend/src/types/cameraFocus.ts`
- `frontend/src/mocks/cameraLiveStream.ts`
- `frontend/src/services/cameraLiveStreamMockAdapter.ts`
- `frontend/src/services/cameraService.ts`
- `frontend/src/services/__tests__/cameraLiveStreamMockAdapter.test.ts`
- `frontend/src/services/__tests__/cameraService.test.ts`

## Change Log

- 2026-08-15: Implemented Story 1.2 frontend live stream DTO, fixture, mock adapter, camera service boundary, and contract tests.
- 2026-08-15: Review pass tightened unavailable/forbidden/not-found envelopes and invalid-id handling.

## Suggested Review Order

**Adapter Boundary**

- Main contract behavior
  [`cameraLiveStreamMockAdapter.ts:19`](../../frontend/src/services/cameraLiveStreamMockAdapter.ts#L19)

- Replaceable endpoint path
  [`cameraLiveStreamMockAdapter.ts:12`](../../frontend/src/services/cameraLiveStreamMockAdapter.ts#L12)

- Invalid id guard
  [`cameraLiveStreamMockAdapter.ts:65`](../../frontend/src/services/cameraLiveStreamMockAdapter.ts#L65)

**Fixture Shape**

- Live stream fixtures
  [`cameraLiveStream.ts:13`](../../frontend/src/mocks/cameraLiveStream.ts#L13)

- Success-only DTO guard
  [`cameraLiveStream.ts:51`](../../frontend/src/mocks/cameraLiveStream.ts#L51)

**Service Boundary**

- Mock-backed service method
  [`cameraService.ts:37`](../../frontend/src/services/cameraService.ts#L37)

**Types And Tests**

- Live stream DTO contract
  [`cameraFocus.ts:43`](../../frontend/src/types/cameraFocus.ts#L43)

- Contract coverage
  [`cameraLiveStreamMockAdapter.test.ts:10`](../../frontend/src/services/__tests__/cameraLiveStreamMockAdapter.test.ts#L10)
