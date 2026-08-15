---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - _bmad-output/planning-artifacts/prd-camera-focus-view.md
  - _bmad-output/planning-artifacts/architecture/architecture-vision-monitor-2026-08-15/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-vision-monitor-2026-08-15/BROWNFIELD-ARCHITECTURE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-vision-monitor-2026-08-15/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-vision-monitor-2026-08-15/EXPERIENCE.md
  - _bmad-output/planning-artifacts/brownfield-project-summary.md
---

# vision-monitor - Epic Breakdown

## Overview

이 문서는 Vision Monitor의 "카메라 집중 보기 / 확대 보기" 기능을 PRD, Architecture, UX Design, Brownfield 현재 상태 기준으로 MVP 구현 가능한 Epic과 Story로 분해한다.

현재 저장소 기준은 Frontend PoC/Prototype과 Backend Spring Boot skeleton/schema 단계다. 따라서 Story는 API contract 고정, route 기반 Focus 화면, 기존 Grid/StreamPlayer 재사용, 녹화/이벤트/알람/메타데이터 UI 연결 순서로 구성한다.

제품 경계는 고정한다. Vision Monitor는 외부 VMS/AI/Media Server가 제공하는 `streamUrl`, `playbackUrl`, 이벤트 메타데이터, 알람 상태를 소비해 표시한다. RTSP ingest, AI inference, media distribution, server-side overlay, 영상 인코딩/트랜스코딩, 원본 영상 저장/보관은 구현하지 않는다.

## Requirements Inventory

### Functional Requirements

FR1: Live Grid의 카메라 타일에서 선택된 `cameraId` 기준으로 확대 보기 화면 또는 상태에 진입하고, 실시간 영상 URL과 메타데이터 조회 실패를 이해 가능한 오류 상태로 표시해야 한다.

FR2: 확대 보기 화면은 상단 공정 탭, 실시간/녹화 하위 탭, 대형 영상 영역, 우측 메타데이터 패널을 포함하고 운영 모니터 환경에서 영상 확인에 충분한 비율을 유지해야 한다.

FR3: 실시간 탭은 외부 Media Server가 제공한 `streamUrl`을 사용해 영상을 표시하고, 로딩/재생 중/끊김/오류/권한 없음 상태와 카메라 기본 정보/현재 상태/최근 이벤트 요약을 표시해야 한다.

FR4: 녹화 탭은 외부 Media Server 또는 VMS가 제공한 `playbackUrl` 기반 재생 UI, 타임라인, 이벤트 marker, 이벤트 목록을 표시하고 이벤트 선택 시 이벤트 시각 또는 pre-roll 시점으로 이동해야 한다.

FR5: 선택 카메라 또는 연관 공정에 활성 알람/경고가 있으면 상단 경고 배너를 표시하고, 배너에는 등급/메시지/위치/상태를 포함하며, MVP에서는 동일 화면 세션 내 수동 닫힘 상태를 유지해야 한다.

FR6: 우측 메타데이터 패널은 카메라 기본 정보, 공정 정보, 영상 상태, 이벤트/알람 상세 정보를 표시하고, 누락 필드는 `-` 또는 `정보 없음`으로 표시해야 한다.

FR7: 확대 보기 화면은 `cameraId`, 탭 상태, 선택 이벤트 ID를 URL 또는 라우팅 상태로 표현해 새로고침 복원과 Grid 뒤로가기를 지원해야 한다.

### NonFunctional Requirements

NFR1: 확대 보기 최초 진입 후 주요 UI는 2초 이내 표시되어야 하며 영상 재생 대기 중에도 로딩 상태를 즉시 표시해야 한다.

NFR2: 영상 URL, 이벤트 메타데이터, 카메라 정보 API 실패는 독립적으로 처리해야 한다.

NFR3: 영상 재생 실패가 우측 메타데이터 조회를 막아서는 안 된다.

NFR4: 알람/경고 배너는 운영자가 즉시 인지할 수 있도록 일반 상태와 명확히 구분되어야 한다.

NFR5: 화면은 1920x1080 운영 모니터에 최적화하고 1366x768에서도 핵심 정보 접근을 보장해야 한다.

NFR6: API 응답에는 권한 및 접근 제어 결과가 반영되어야 하며 UI는 권한 없음 상태를 명확히 표시해야 한다.

NFR7: 브라우저는 외부 영상 URL을 직접 표시하되 인증 토큰 또는 서명 URL이 노출될 경우 짧은 만료 시간이 있어야 한다.

NFR8: 이벤트 메타데이터는 서버 기준 시각을 포함하고 UI는 Asia/Seoul 표시 정책을 일관되게 유지해야 한다.

NFR9: 구조는 향후 다중 카메라 비교 보기, PTZ 제어, AI overlay 확장을 방해하지 않아야 한다.

### Additional Requirements

- 확대 보기는 route 중심 상태인 `/live/cameras/:cameraId?mode=live|recording&eventId={eventId}`로 구현한다.
- Live Grid는 `cameraId`를 넘겨 route 이동만 담당하고 상세 화면이 데이터 로딩과 탭 상태를 소유한다.
- 실시간 `streamUrl` 계약과 녹화 `playbackUrl` 계약을 분리한다.
- Spring Boot는 카메라, 이벤트, 녹화, 알람, 레이아웃, 공정 메타데이터의 정규화된 API contract와 persistence boundary를 제공한다.
- React는 media URL 재생 시에만 외부 Media Server URL을 직접 사용하고, URL 구조를 비즈니스 판단에 사용하지 않는다.
- `camera`, `liveStream`, `playback`, `events`, `alerts` 로딩/오류 상태는 프론트엔드에서 별도로 관리한다.
- 알람 배너 닫힘은 `alertId + route session` 단위의 클라이언트 UI 상태이며 서버 ACK와 동일시하지 않는다.
- API envelope는 기존 `ApiResponse<T>`의 `success`, `data`, `error`, `message`, `timestamp`를 유지한다.
- ID는 backend `Long`, frontend number, API JSON camelCase를 유지한다.
- 상태/시간/metadata/errors convention은 Architecture Spine의 규칙을 따른다.
- 현재 Backend는 controller/service/repository/entity skeleton 단계이므로 DTO, endpoint, service 구현과 최소 테스트가 Story 범위에 포함되어야 한다.
- 현재 Frontend는 Live Grid, mock camera/layout, StreamPlayer, CameraDetailView PoC가 있으므로 새 기능은 기존 컴포넌트 재사용과 분해를 전제로 한다.

### UX Design Requirements

UX-DR1: Focus 화면은 운영 도구형 화면으로 구현하며 별도 landing/설명 화면을 만들지 않는다.

UX-DR2: 화면 중심은 대형 영상 영역이며 우측 메타데이터 패널은 360-420px, 1366x768에서는 최소 320px로 유지한다.

UX-DR3: 1024px 미만에서는 우측 패널을 영상 아래로 이동하고 camera/event/alert 정보를 패널 내부 탭 또는 accordion으로 전환한다.

UX-DR4: 색상 토큰은 `surface-base`, `surface-panel`, `surface-raised`, `status-live`, `status-warning`, `status-critical`, `timeline-event` 의미를 따라 사용한다.

UX-DR5: 경고 배너는 노란색 warning treatment를 사용하고 닫기 버튼은 accessible name을 가진 아이콘 버튼으로 제공한다.

UX-DR6: Process tabs는 `ALL`, `가열`, `압연`, `냉각`, `시험`, `정정`을 표시하고 선택 상태와 keyboard focus가 명확해야 한다.

UX-DR7: Mode tabs는 `실시간`, `녹화`를 표시하고 URL query `mode`와 동기화해야 한다.

UX-DR8: Video stage는 live/playback 모두 loading, playing, interrupted, error, forbidden 상태를 stage 내부 fallback으로 표시해야 한다.

UX-DR9: Metadata panel은 동일 shell 안에서 camera, event, alert mode를 전환해야 한다.

UX-DR10: Recording timeline은 available/gap segment, event marker, 현재 재생 위치를 같은 시간축에 표시하고 marker는 색상만으로 구분하지 않는다.

UX-DR11: Event list row는 이벤트명, severity, 발생 시각, 상태를 한 줄 스캔 가능하게 표시하고 선택 row와 timeline marker는 상태를 공유해야 한다.

UX-DR12: 오류 문구는 짧고 상태 중심이어야 하며 영상 실패와 metadata 실패를 각 영역 안에서 분리 표시해야 한다.

UX-DR13: 권한 없음은 일반 오류와 구분하고 제한된 camera/event metadata를 노출하지 않아야 한다.

UX-DR14: 키보드만으로 실시간/녹화 전환, 이벤트 선택, alert 닫기, 뒤로가기가 가능해야 한다.

UX-DR15: 탭은 `role=tablist`, `role=tab`, `aria-selected`를 사용하고 경고 배너는 `role=alert` 또는 동등한 live region을 사용해야 한다.

### FR Coverage Map

FR1: Epic 1 - Backend contract와 route 기반 focus 진입을 통해 카메라 선택 후 확대 보기 진입을 제공한다.

FR2: Epic 2 - Camera Focus shell과 responsive layout으로 공정 탭, mode 탭, 영상 영역, 우측 패널을 제공한다.

FR3: Epic 3 - 실시간 mode와 기존 StreamPlayer 연동으로 `streamUrl` 기반 대형 영상을 제공한다.

FR4: Epic 4 - 녹화 mode, playback contract, 타임라인, 이벤트 목록, event seek를 제공한다.

FR5: Epic 5 - 활성 알람 배너와 route session 단위 닫힘 상태를 제공한다.

FR6: Epic 2, Epic 4, Epic 5 - 우측 메타데이터 패널이 camera/event/alert mode별 정보를 표시한다.

FR7: Epic 2, Epic 4 - route query 기반 `cameraId`, `mode`, `eventId` 동기화와 새로고침/뒤로가기 복원을 제공한다.

## Epic List

### Epic 1: Focus View API 계약과 Backend Skeleton 완성

운영자가 선택한 카메라의 확대 보기 화면에 필요한 카메라, 실시간 URL, 녹화 URL, 이벤트, 활성 알람 데이터를 Spring Boot API에서 일관된 계약으로 받을 수 있다.

**FRs covered:** FR1, FR3, FR4, FR5, FR6, FR7

**User value:** Frontend PoC가 mock/fallback만 의존하지 않고, 확대 보기의 핵심 데이터 계약을 하나의 backend boundary에서 조회할 수 있다.

**Natural dependency:** MVP의 모든 frontend story가 이 계약을 기준으로 타입과 서비스 레이어를 작성한다.

### Epic 2: Live Grid에서 Route 기반 Focus 화면 진입

운영자가 Live Grid에서 특정 카메라를 선택해 `/live/cameras/:cameraId` 확대 보기 화면으로 이동하고, 실시간/녹화 탭과 우측 패널이 있는 기본 Focus 화면을 볼 수 있다.

**FRs covered:** FR1, FR2, FR6, FR7

**User value:** 기존 Live Grid PoC에서 단일 카메라 집중 관제로 자연스럽게 이동할 수 있다.

**Natural dependency:** Epic 1 API 타입과 frontend service contract에 의존한다.

### Epic 3: 실시간 집중 보기와 StreamPlayer 연동

운영자가 실시간 탭에서 외부 Media Server의 `streamUrl`로 대형 영상을 확인하고, 영상 상태와 카메라 메타데이터를 독립적으로 확인할 수 있다.

**FRs covered:** FR3, FR6, FR7

**User value:** 이상 징후가 있는 카메라를 대형 화면으로 즉시 확인할 수 있다.

**Natural dependency:** Epic 2 Focus route/shell에 의존한다.

### Epic 4: 녹화 재생, 타임라인, 이벤트 선택 재생

운영자가 녹화 탭에서 `playbackUrl` 기반 녹화 영상을 확인하고, 타임라인과 이벤트 목록에서 특정 이벤트 시점으로 이동할 수 있다.

**FRs covered:** FR4, FR6, FR7

**User value:** 알람 전후 상황을 녹화 영상과 이벤트 메타데이터로 대조할 수 있다.

**Natural dependency:** Epic 2 Focus route/shell과 Epic 1 playback/events API 계약에 의존한다.

### Epic 5: 활성 알람 배너와 Alert/Event Metadata 대응

운영자가 선택 카메라 또는 연관 공정의 활성 알람을 즉시 인지하고, 배너 닫힘과 우측 alert/event 상세를 통해 상황 판단을 이어갈 수 있다.

**FRs covered:** FR5, FR6

**User value:** 긴급 상황을 영상과 데이터 맥락 안에서 확인하면서 화면 세션 내 불필요한 재표시를 제어할 수 있다.

**Natural dependency:** Epic 2 Focus shell, Epic 1 alerts/events API 계약에 의존한다.

### Epic 6: 영역별 실패, 권한 없음, 접근성/반응형 검증

운영자가 영상 실패, metadata 실패, 이벤트 실패, 알람 실패, 권한 없음 상태를 명확히 구분하고, 데스크톱/소형 화면/키보드 환경에서도 핵심 작업을 수행할 수 있다.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7

**User value:** 운영 중 부분 장애가 발생해도 가능한 정보는 유지되고, 접근성/반응형 기준을 만족하는 신뢰 가능한 화면이 된다.

**Natural dependency:** Epic 2-5의 주요 UI와 상태 흐름이 존재해야 최종 hardening이 가능하다.

## Epic 1: Focus View API 계약과 Backend Skeleton 완성

운영자가 선택한 카메라의 확대 보기 화면에 필요한 카메라, 실시간 URL, 녹화 URL, 이벤트, 활성 알람 데이터를 Spring Boot API에서 일관된 계약으로 받을 수 있다.

### Story 1.1: 카메라 Focus 메타데이터 API 제공

As a 운영자,
I want 선택한 카메라의 기본 정보와 현재 상태를 API로 조회하고 싶다,
So that 확대 보기 화면에서 카메라 맥락을 영상과 함께 확인할 수 있다.

**Acceptance Criteria:**

**Given** 유효한 `cameraId`가 존재하고 사용자가 접근 가능한 상태일 때  
**When** frontend가 `GET /api/cameras/{cameraId}/focus`를 호출하면  
**Then** API는 `cameraId`, `cameraName`, `processType`, `zoneName`, `lineName`, `location`, `status`, `recordingEnabled`, `capabilities`, `lastSeenAt`, `recentEventSummary`를 `ApiResponse<T>` envelope로 반환한다.  
**And** 시간 값은 ISO-8601 문자열이며 API JSON 필드는 camelCase다.

**Given** 카메라가 없거나 접근 권한이 없을 때  
**When** 같은 API를 호출하면  
**Then** 404 또는 403에 해당하는 명확한 오류 상태를 반환한다.  
**And** 403 응답은 제한 metadata가 노출되지 않도록 한다.

**Implementation Notes:**

- 제품 경계를 지킨다. 이 API는 외부 media/AI 처리를 호출하거나 구현하지 않고, 저장된 카메라/이벤트 요약 데이터를 조립한다.
- 기존 `CameraController`, `CameraService`, `CameraRepository`, `Camera`, `CameraDto` skeleton을 확장한다.
- 필요 시 `CameraFocusDto`, `CameraCapabilitiesDto`, `RecentEventSummaryDto`를 추가한다.
- DB migration은 이 story에 필요한 camera metadata 필드만 추가한다. 전체 recording/event schema를 한꺼번에 바꾸지 않는다.

**Test Notes:**

- controller/service 단위 테스트로 정상, 404, 403/forbidden 매핑을 검증한다.
- `ApiResponse<T>` envelope와 camelCase 직렬화를 검증한다.

**관련 파일 후보:**

- `backend/src/main/java/com/vision/controller/CameraController.java`
- `backend/src/main/java/com/vision/service/CameraService.java`
- `backend/src/main/java/com/vision/repository/CameraRepository.java`
- `backend/src/main/java/com/vision/entity/Camera.java`
- `backend/src/main/java/com/vision/dto/CameraDto.java`
- `backend/src/main/java/com/vision/dto/CameraFocusDto.java`
- `backend/src/main/resources/db/migration/*.sql`

**선후관계:** 첫 번째 backend story다. Story 1.2-1.4와 모든 frontend service story의 기준 DTO를 제공한다.

### Story 1.2: 실시간 Stream URL API 계약 제공

As a 운영자,
I want 선택한 카메라의 실시간 재생 URL을 API로 받고 싶다,
So that 브라우저에서 외부 Media Server stream을 확대 보기로 재생할 수 있다.

**Acceptance Criteria:**

**Given** 접근 가능한 카메라에 활성 live stream 계약이 있을 때  
**When** frontend가 `GET /api/cameras/{cameraId}/live-stream`을 호출하면  
**Then** API는 `cameraId`, `streamUrl`, `streamProtocol`, `expiresAt`, `status`, `resolution`, `fps`, `metadata`를 반환한다.  
**And** `streamUrl`은 opaque URL로 반환되며 backend가 proxy/transcode하지 않는다.

**Given** stream URL이 없거나 카메라가 점검/비활성 상태일 때  
**When** API를 호출하면  
**Then** UI가 구분 가능한 `inactive`, `maintenance`, `error`, `forbidden` 상태 중 하나를 반환한다.

**Implementation Notes:**

- `streamUrl`과 `playbackUrl`은 분리된 계약으로 유지한다.
- 기존 `Stream` entity 또는 `Camera.streamUrl` 중 현재 schema에 맞는 최소 경로를 사용한다.
- `streamProtocol` 값은 `stream_page`, `hls`, `webrtc`, `rtsp_bridge`, `unknown` 중 하나로 정규화한다.

**Test Notes:**

- signed URL이 있는 경우 `expiresAt`이 포함되는지 검증한다.
- backend에 RTSP ingest, FFmpeg, media distribution 코드가 추가되지 않았는지 리뷰 기준에 포함한다.

**관련 파일 후보:**

- `backend/src/main/java/com/vision/controller/CameraController.java`
- `backend/src/main/java/com/vision/service/CameraService.java`
- `backend/src/main/java/com/vision/entity/Stream.java`
- `backend/src/main/java/com/vision/repository/StreamRepository.java`
- `backend/src/main/java/com/vision/dto/LiveStreamDto.java`

**선후관계:** Story 1.1 이후. Epic 3의 StreamPlayer 연동이 이 계약에 의존한다.

### Story 1.3: 녹화 Playback과 이벤트 목록 API 계약 제공

As a 운영자,
I want 선택한 카메라의 녹화 재생 정보와 이벤트 목록을 조회하고 싶다,
So that 특정 이벤트 전후 영상을 확인할 수 있다.

**Acceptance Criteria:**

**Given** 요청 시간 범위에 녹화 playback session이 있을 때  
**When** frontend가 `GET /api/cameras/{cameraId}/playback?from={from}&to={to}&eventId={eventId?}`를 호출하면  
**Then** API는 `cameraId`, `playbackUrl`, `playbackProtocol`, `sessionId`, `expiresAt`, `availableFrom`, `availableTo`, `seekable`, `preRollSeconds`, `timelineSegments`를 반환한다.  
**And** 녹화가 없는 구간은 `timelineSegments.status = gap`으로 표시한다.

**Given** 같은 시간 범위의 이벤트가 있을 때  
**When** frontend가 `GET /api/cameras/{cameraId}/events?from={from}&to={to}`를 호출하면  
**Then** API는 `eventId`, `cameraId`, `eventType`, `severity`, `title`, `occurredAt`, `endedAt`, `status`, `metadata`를 포함한 목록을 반환한다.  
**And** `metadata`는 이벤트 유형별 확장 필드를 object로 유지한다.

**Implementation Notes:**

- `RecordingController` class mapping이 `/api/recordings`여도 소비자 URL은 `/api/cameras/{cameraId}/playback`으로 제공한다.
- 실제 외부 VMS playback session 발급이 없으면 persisted recording index 또는 mock-compatible provider adapter를 두되, media server 구현은 하지 않는다.
- `event_time` 등 기존 naming과 PRD의 `occurredAt` 차이를 DTO에서 정리한다.

**Test Notes:**

- playback 성공, gap 포함, playback 없음, event 목록 empty, metadata 확장 필드 보존을 검증한다.
- event 시간과 playback pre-roll 계산 기준을 고정한다.

**관련 파일 후보:**

- `backend/src/main/java/com/vision/controller/RecordingController.java`
- `backend/src/main/java/com/vision/controller/EventController.java`
- `backend/src/main/java/com/vision/service/RecordingService.java`
- `backend/src/main/java/com/vision/service/EventService.java`
- `backend/src/main/java/com/vision/entity/Recording.java`
- `backend/src/main/java/com/vision/entity/Event.java`
- `backend/src/main/java/com/vision/dto/PlaybackSessionDto.java`
- `backend/src/main/java/com/vision/dto/EventDto.java`

**선후관계:** Story 1.1 이후. Epic 4 전체가 이 story에 의존한다.

### Story 1.4: 활성 알람과 이벤트 상세 API 계약 제공

As a 운영자,
I want 선택한 카메라의 활성 알람과 관련 이벤트 상세를 조회하고 싶다,
So that 경고 발생 시 영상 옆에서 즉시 상황 정보를 확인할 수 있다.

**Acceptance Criteria:**

**Given** 선택 카메라에 활성 알람이 없을 때  
**When** frontend가 `GET /api/cameras/{cameraId}/alerts/active`를 호출하면  
**Then** API는 빈 배열 `[]`을 반환한다.

**Given** 활성 알람이 있을 때  
**When** 같은 API를 호출하면  
**Then** API는 `alertId`, `cameraId`, `severity`, `message`, `location`, `startedAt`, `status`, `relatedEventId`, `metadata`를 반환한다.  
**And** 메시지 형식 `[경고!] Entry Zone 치입불 발생 중`을 표현할 수 있다.

**Given** 관련 이벤트가 있을 때  
**When** frontend가 `GET /api/events/{eventId}`를 호출하면  
**Then** 상세 패널에 필요한 event 공통 필드, `playbackHint`, `metadata`를 반환한다.

**Implementation Notes:**

- MVP의 배너 닫힘은 client UI 상태다. 이 story에서 서버 acknowledge workflow를 필수 구현하지 않는다.
- `POST /api/events/{eventId}/acknowledge`는 선택 endpoint로 남기되 구현 시 `POST` 계약을 따른다.
- 알람은 event projection 또는 별도 alert projection으로 구현할 수 있으나 API 응답 모양은 고정한다.

**Test Notes:**

- active alerts empty, warning alert, critical alert, relatedEventId 있는 경우를 검증한다.
- ACK 미구현 상태에서도 배너 표시 API가 동작하는지 검증한다.

**관련 파일 후보:**

- `backend/src/main/java/com/vision/controller/CameraController.java`
- `backend/src/main/java/com/vision/controller/EventController.java`
- `backend/src/main/java/com/vision/service/EventService.java`
- `backend/src/main/java/com/vision/entity/Event.java`
- `backend/src/main/java/com/vision/dto/AlertDto.java`
- `backend/src/main/java/com/vision/dto/EventDto.java`

**선후관계:** Story 1.3 이후. Epic 5가 이 story에 의존한다.

## Epic 2: Live Grid에서 Route 기반 Focus 화면 진입

운영자가 Live Grid에서 특정 카메라를 선택해 `/live/cameras/:cameraId` 확대 보기 화면으로 이동하고, 실시간/녹화 탭과 우측 패널이 있는 기본 Focus 화면을 볼 수 있다.

### Story 2.1: Frontend Focus API 타입과 Service 레이어 추가

As a frontend 개발자,
I want Focus 화면이 사용할 API 타입과 service 함수를 먼저 정의하고 싶다,
So that UI 컴포넌트가 mock과 backend skeleton 사이에서 안정적인 계약을 사용할 수 있다.

**Acceptance Criteria:**

**Given** backend focus API 계약이 정의되어 있을 때  
**When** frontend service 레이어가 구현되면  
**Then** `getCameraFocus`, `getCameraLiveStream`, `getCameraPlayback`, `getCameraEvents`, `getActiveAlerts`, `getEventDetail` 함수가 typed response를 반환한다.  
**And** API 실패 시 기존 service fallback 패턴과 일관된 error object를 제공한다.

**Implementation Notes:**

- 기존 `cameraService.ts`, `eventService.ts`, `serviceUtils.ts` 패턴을 따른다.
- 신규 `recordingService.ts`와 `types/cameraFocus.ts` 또는 기존 type 확장을 추가한다.
- mock/fallback 데이터는 PoC 개발을 돕되 production boundary를 흐리지 않도록 service 내부 fixture로 제한한다.

**Test Notes:**

- Vitest로 각 service 함수의 success, failure, empty response를 검증한다.
- 타입이 backend camelCase 계약과 맞는지 확인한다.

**관련 파일 후보:**

- `frontend/src/services/cameraService.ts`
- `frontend/src/services/eventService.ts`
- `frontend/src/services/recordingService.ts`
- `frontend/src/services/serviceUtils.ts`
- `frontend/src/types/camera.ts`
- `frontend/src/types/cameraFocus.ts`
- `frontend/src/services/__tests__/*.test.ts`

**선후관계:** Epic 1 API 계약 이후. Story 2.2-2.3의 기반이다.

### Story 2.2: CameraFocus Route와 Page Shell 생성

As a 운영자,
I want 직접 URL로 카메라 확대 보기 화면을 열 수 있다,
So that 새로고침과 공유 링크에서도 같은 카메라 상태를 복원할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 `/live/cameras/1?mode=live`에 접근했을 때  
**When** React Router가 route를 매칭하면  
**Then** `CameraFocus` page가 표시되고 `cameraId=1`, `mode=live`를 파싱한다.  
**And** mode가 없거나 잘못되면 `live`로 보정한다.

**Given** 사용자가 `/live/cameras/1?mode=recording&eventId=50001`에 접근했을 때  
**When** page가 mount되면  
**Then** `mode=recording`과 `selectedEventId=50001`이 초기 상태로 반영된다.

**Implementation Notes:**

- `App.tsx`에 `/live/cameras/:cameraId` route를 추가하고 기존 `AppLayout` 안에서 렌더링한다.
- `CameraFocus.tsx`는 route/query parsing과 service hook 호출 orchestration만 담당한다.
- 이 story에서는 실제 player 연결을 placeholder 상태로 두고 shell과 URL 상태를 먼저 고정한다.

**Test Notes:**

- route param/query parsing 테스트를 추가한다.
- invalid mode fallback과 eventId parsing을 검증한다.

**관련 파일 후보:**

- `frontend/src/App.tsx`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/components/Layout/AppLayout.tsx`
- `frontend/src/types/cameraFocus.ts`

**선후관계:** Story 2.1 이후. Story 2.3, Epic 3-5의 기반이다.

### Story 2.3: Focus Shell Layout과 기본 Metadata Panel 구성

As a 운영자,
I want 확대 보기에서 공정 탭, 실시간/녹화 탭, 대형 영상 영역, 우측 패널을 한 화면에서 보고 싶다,
So that 단일 카메라를 운영 맥락 안에서 집중 확인할 수 있다.

**Acceptance Criteria:**

**Given** Focus page가 표시될 때  
**When** camera metadata loading이 시작되면  
**Then** 상단 공정 탭, mode 탭, video stage placeholder, 우측 metadata panel shell이 즉시 표시된다.  
**And** 주요 UI shell은 API 응답을 기다리지 않고 표시된다.

**Given** camera metadata가 로드되었을 때  
**When** 우측 패널이 camera mode일 때  
**Then** 카메라명, 공정, 구역, 라인, 상태, 최근 이벤트 요약을 표시한다.  
**And** 누락 필드는 `-` 또는 `정보 없음`으로 표시한다.

**Implementation Notes:**

- `CameraFocusShell`, `FocusVideoStage`, `FocusMetadataPanel`을 추가한다.
- design token에 맞춰 dark surface, 2-column layout, 360-420px panel 폭, 1366x768 최소 320px을 반영한다.
- `CameraDetailView` PoC에서 재사용 가능한 정보 표시 로직이 있으면 분해해 가져온다.

**Test Notes:**

- metadata loading/success/missing field 렌더링 테스트를 추가한다.
- responsive CSS는 Playwright 또는 viewport 기반 DOM/CSS assertion 후보로 남긴다.

**관련 파일 후보:**

- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- `frontend/src/components/CameraDetail/CameraDetailView.tsx`

**선후관계:** Story 2.2 이후. Epic 3-5가 이 shell 안에 기능을 채운다.

### Story 2.4: Live Grid 타일에서 Focus Route 진입 연결

As a 운영자,
I want Live Grid의 카메라 타일에서 확대 보기를 바로 열고 싶다,
So that 이상 징후를 본 즉시 단일 카메라 집중 화면으로 이동할 수 있다.

**Acceptance Criteria:**

**Given** Live Grid에 카메라 타일이 표시되어 있을 때  
**When** 사용자가 타일의 확대 액션을 실행하면  
**Then** 앱은 `/live/cameras/{cameraId}?mode=live`로 이동한다.  
**And** Grid에서 사용 중인 공정 탭/필터 상태는 뒤로가기 시 가능한 범위에서 유지된다.

**Given** 타일이 drag 가능한 상태일 때  
**When** 사용자가 drag handle을 조작하면  
**Then** route 이동이 발생하지 않는다.  
**And** 확대 액션은 hover-only가 아니라 click/keyboard로 접근 가능하다.

**Implementation Notes:**

- `GridContainer`에 tile action prop을 추가하거나 `DraggableCell`에 명시적 focus click target을 둔다.
- drag handle과 focus action target을 분리한다.
- 현재 mock camera/layout source는 유지 가능하되 `cameraId`는 route에 안정적으로 전달한다.

**Test Notes:**

- tile click route 이동, drag handle route 미발생, keyboard activation을 테스트한다.
- 기존 DnD 테스트가 깨지지 않는지 확인한다.

**관련 파일 후보:**

- `frontend/src/pages/Live.tsx`
- `frontend/src/components/Grid/GridContainer.tsx`
- `frontend/src/components/Grid/DraggableCell.tsx`
- `frontend/src/components/Grid/useGridDnd.ts`
- `frontend/src/mocks/liveMonitoring.ts`

**선후관계:** Story 2.2 이후. Epic 3 실시간 집중 보기의 실제 진입점이다.

## Epic 3: 실시간 집중 보기와 StreamPlayer 연동

운영자가 실시간 탭에서 외부 Media Server의 `streamUrl`로 대형 영상을 확인하고, 영상 상태와 카메라 메타데이터를 독립적으로 확인할 수 있다.

### Story 3.1: Live Mode에서 LiveStreamPlayer 연결

As a 운영자,
I want 실시간 탭에서 선택 카메라의 대형 영상을 보고 싶다,
So that Grid보다 큰 화면으로 현재 상황을 확인할 수 있다.

**Acceptance Criteria:**

**Given** `/live/cameras/{cameraId}?mode=live` 화면이 열렸을 때  
**When** `GET /api/cameras/{cameraId}/live-stream`이 성공하면  
**Then** `FocusVideoStage`는 기존 `LiveStreamPlayer` 또는 protocol에 맞는 `StreamPlayerComponent`에 `streamUrl`을 전달한다.  
**And** `streamUrl`은 URL 구조를 비즈니스 로직으로 파싱하지 않고 player adapter에만 전달된다.

**Given** live stream이 로딩 중일 때  
**When** player가 mount되는 동안  
**Then** video stage 내부에 `영상을 불러오는 중입니다.` 상태가 표시된다.

**Implementation Notes:**

- 기존 `LiveStreamPlayer`의 iframe stream page 흐름을 우선 재사용한다.
- `streamProtocol`에 따라 기존 HLS/WebRTC/player abstraction을 선택할 수 있게 하되 새 media server 구현은 하지 않는다.
- player status를 `idle/loading/playing/interrupted/error/forbidden`으로 bridge한다.

**Test Notes:**

- `streamUrl` 전달, loading state, player render fallback을 테스트한다.
- 기존 StreamPlayer 테스트 suite가 유지되는지 확인한다.

**관련 파일 후보:**

- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/StreamPlayer/LiveStreamPlayer.tsx`
- `frontend/src/components/StreamPlayer/StreamPlayerComponent.tsx`
- `frontend/src/components/StreamPlayer/useStreamPlayer.ts`
- `frontend/src/types/streamPlayer.ts`

**선후관계:** Story 2.3 이후. Story 3.2가 상태 처리를 확장한다.

### Story 3.2: 실시간 영상 상태와 메타데이터 실패 독립 처리

As a 운영자,
I want 영상과 메타데이터의 실패 상태를 분리해서 보고 싶다,
So that 영상이 실패해도 카메라 상태를 계속 판단할 수 있다.

**Acceptance Criteria:**

**Given** live stream API 또는 player가 실패했을 때  
**When** camera focus metadata API는 성공하면  
**Then** video stage에 오류/재시도 상태를 표시하고 우측 metadata panel은 계속 표시한다.

**Given** camera metadata API가 실패했을 때  
**When** live stream API는 성공하면  
**Then** 영상은 계속 표시되고 우측 패널에 `카메라 정보를 불러오지 못했습니다.`를 표시한다.

**Given** live stream status가 `forbidden`일 때  
**When** 화면이 표시되면  
**Then** video stage에 `이 카메라에 접근 권한이 없습니다.`를 표시한다.  
**And** 제한 metadata는 노출하지 않는다.

**Implementation Notes:**

- `cameraFocus`, `liveStream` 상태를 독립 hook 또는 local state로 유지한다.
- forbidden은 generic error와 별도 state로 처리한다.
- 재시도 버튼은 live stream refetch만 수행하고 metadata refetch와 묶지 않는다.

**Test Notes:**

- live error + metadata success, live success + metadata error, forbidden 상태를 조합 테스트한다.
- 오류 문구가 UX 문서의 tone을 따르는지 snapshot 또는 text assertion으로 검증한다.

**관련 파일 후보:**

- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/hooks/useCameraFocus.ts`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- `frontend/src/services/cameraService.ts`

**선후관계:** Story 3.1 이후. Epic 6에서 접근성/반응형 hardening으로 이어진다.

## Epic 4: 녹화 재생, 타임라인, 이벤트 선택 재생

운영자가 녹화 탭에서 `playbackUrl` 기반 녹화 영상을 확인하고, 타임라인과 이벤트 목록에서 특정 이벤트 시점으로 이동할 수 있다.

### Story 4.1: Recording Mode 전환과 Playback Session 로딩

As a 운영자,
I want 확대 보기에서 녹화 탭으로 전환하고 싶다,
So that 선택한 카메라의 과거 영상을 확인할 수 있다.

**Acceptance Criteria:**

**Given** Focus 화면이 열려 있을 때  
**When** 사용자가 `녹화` 탭을 선택하면  
**Then** URL query는 `mode=recording`으로 갱신된다.  
**And** frontend는 `GET /api/cameras/{cameraId}/playback?from&to`를 호출한다.

**Given** playback API가 성공했을 때  
**When** `playbackUrl`이 반환되면  
**Then** `FocusVideoStage`는 playback player에 `playbackUrl`을 전달한다.  
**And** live `streamUrl`을 playback에 재사용하지 않는다.

**Implementation Notes:**

- `useCameraPlayback` hook을 추가해 playback session 상태와 time range 기본값을 관리한다.
- 기본 조회 범위는 MVP에서 최근 1시간 또는 UX/제품 기준으로 고정 가능한 합리적 기본값을 사용한다.
- `playbackProtocol`에 따라 기존 `StreamPlayerComponent`를 재사용한다.

**Test Notes:**

- mode tab click 후 query 갱신과 playback service 호출을 테스트한다.
- live/playback URL 혼용이 없는지 unit test 또는 code review checklist로 확인한다.

**관련 파일 후보:**

- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/hooks/useCameraPlayback.ts`
- `frontend/src/services/recordingService.ts`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/StreamPlayer/StreamPlayerComponent.tsx`

**선후관계:** Story 2.3, Story 1.3 이후. Story 4.2-4.3의 기반이다.

### Story 4.2: 녹화 타임라인과 Event Marker 표시

As a 운영자,
I want 녹화 가능 구간과 이벤트 발생 시점을 타임라인에서 보고 싶다,
So that 어느 시점의 영상을 확인해야 하는지 빠르게 판단할 수 있다.

**Acceptance Criteria:**

**Given** playback session에 `timelineSegments`가 있을 때  
**When** 녹화 탭이 표시되면  
**Then** 타임라인은 available/gap 구간을 구분해 표시한다.  
**And** gap 구간은 seek 불가 상태로 표현한다.

**Given** 같은 시간 범위에 이벤트 목록이 있을 때  
**When** 타임라인이 표시되면  
**Then** 각 이벤트의 `occurredAt` 위치에 marker가 표시된다.  
**And** marker는 색상뿐 아니라 accessible label로 시간/이벤트명을 제공한다.

**Implementation Notes:**

- `RecordingTimeline` 컴포넌트를 추가한다.
- timeline은 영상 하단에 배치하고 1366x768에서도 접히거나 최소 높이로 접근 가능하게 한다.
- 현재 재생 위치 state는 이후 event seek와 공유할 수 있게 둔다.

**Test Notes:**

- available/gap segment 렌더링, event marker 위치 계산, label 제공을 테스트한다.
- empty events와 empty segments 상태를 검증한다.

**관련 파일 후보:**

- `frontend/src/components/CameraFocus/RecordingTimeline.tsx`
- `frontend/src/hooks/useCameraPlayback.ts`
- `frontend/src/types/cameraFocus.ts`
- `frontend/src/services/eventService.ts`

**선후관계:** Story 4.1 이후. Story 4.3이 marker/list 선택 상태를 연결한다.

### Story 4.3: 이벤트 목록 선택과 녹화 Player Seek 연결

As a 운영자,
I want 이벤트 목록에서 특정 이벤트를 선택하고 싶다,
So that 녹화 영상이 해당 이벤트 전후 시점으로 이동한다.

**Acceptance Criteria:**

**Given** 녹화 탭에 이벤트 목록이 표시되어 있을 때  
**When** 사용자가 이벤트 row를 선택하면  
**Then** URL query에 `eventId={eventId}`가 반영된다.  
**And** player seek target은 `playbackHint.seekAt`이 있으면 그 값을, 없으면 `occurredAt - preRollSeconds`를 사용한다.

**Given** 이벤트가 선택되었을 때  
**When** 우측 패널이 표시되면  
**Then** panel mode는 event로 전환되고 이벤트 상세 metadata를 표시한다.  
**And** 누락 metadata 필드는 `-` 또는 `정보 없음`으로 표시한다.

**Implementation Notes:**

- `RecordingEventList`를 추가한다.
- list row 선택 상태와 timeline marker 선택 상태를 공유한다.
- player API가 직접 seek method를 제공하지 않으면 컴포넌트 key/session time update 방식으로 MVP seek를 구현한다.

**Test Notes:**

- row click, keyboard Enter/Space, query 갱신, panel mode 전환을 테스트한다.
- pre-roll 계산과 `playbackHint.seekAt` 우선순위를 검증한다.

**관련 파일 후보:**

- `frontend/src/components/CameraFocus/RecordingEventList.tsx`
- `frontend/src/components/CameraFocus/RecordingTimeline.tsx`
- `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- `frontend/src/hooks/useCameraPlayback.ts`
- `frontend/src/services/eventService.ts`

**선후관계:** Story 4.2 이후. Epic 5의 alert related event 표시와 상태 모델을 공유한다.

### Story 4.4: Playback 실패와 Events 실패의 독립 fallback

As a 운영자,
I want 녹화 영상 또는 이벤트 목록 중 일부가 실패해도 나머지 정보를 보고 싶다,
So that 장애 상황에서도 확인 가능한 정보를 유지할 수 있다.

**Acceptance Criteria:**

**Given** playback API 또는 playbackUrl 재생이 실패했을 때  
**When** events API는 성공하면  
**Then** 녹화 player/timeline 영역에 오류와 재시도 상태를 표시하고 이벤트 목록은 유지한다.

**Given** events API가 실패했을 때  
**When** playback API는 성공하면  
**Then** playback player와 timeline은 유지하고 이벤트 목록 영역에 오류 상태를 표시한다.

**Implementation Notes:**

- playback session, timeline, events 상태를 분리한다.
- 재시도 버튼은 실패한 영역만 refetch한다.

**Test Notes:**

- playback failure + events success, playback success + events failure, both failure 상태를 테스트한다.

**관련 파일 후보:**

- `frontend/src/hooks/useCameraPlayback.ts`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/RecordingTimeline.tsx`
- `frontend/src/components/CameraFocus/RecordingEventList.tsx`

**선후관계:** Story 4.1-4.3 이후. Epic 6의 최종 실패 상태 검증으로 이어진다.

## Epic 5: 활성 알람 배너와 Alert/Event Metadata 대응

운영자가 선택 카메라 또는 연관 공정의 활성 알람을 즉시 인지하고, 배너 닫힘과 우측 alert/event 상세를 통해 상황 판단을 이어갈 수 있다.

### Story 5.1: 활성 알람 배너 표시

As a 운영자,
I want 확대 보기 상단에서 활성 경고를 즉시 보고 싶다,
So that 긴급 상황을 영상 확인 전에 놓치지 않는다.

**Acceptance Criteria:**

**Given** active alerts API가 하나 이상의 알람을 반환할 때  
**When** Focus 화면이 표시되면  
**Then** 상단에 warning treatment의 `FocusAlertBanner`가 표시된다.  
**And** 배너는 severity, message, location, status를 포함한다.

**Given** active alerts API가 빈 배열을 반환할 때  
**When** Focus 화면이 표시되면  
**Then** 알람 배너는 표시되지 않고 metadata panel은 camera mode를 유지한다.

**Implementation Notes:**

- `FocusAlertBanner` 컴포넌트를 추가한다.
- 배너는 공정 탭 아래, mode 탭 위에 배치한다.
- 색상은 `status-warning` 의미로만 사용한다.

**Test Notes:**

- active alert 있음/없음 렌더링을 테스트한다.
- 배너 문구와 location/status 표시를 검증한다.

**관련 파일 후보:**

- `frontend/src/components/CameraFocus/FocusAlertBanner.tsx`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/hooks/useCameraFocus.ts`
- `frontend/src/services/eventService.ts`

**선후관계:** Story 2.3, Story 1.4 이후. Story 5.2가 닫힘 상태를 추가한다.

### Story 5.2: Alert Banner 닫힘 상태를 Route Session 단위로 유지

As a 운영자,
I want 이미 확인한 경고 배너를 현재 화면 세션에서 닫고 싶다,
So that 같은 알람이 반복 조회되어도 작업을 방해하지 않는다.

**Acceptance Criteria:**

**Given** 경고 배너가 표시되어 있을 때  
**When** 사용자가 닫기 버튼을 누르면  
**Then** 해당 `alertId`는 현재 route session의 `dismissedAlertIds`에 저장되고 배너는 사라진다.  
**And** 같은 `alertId`는 refetch 이후에도 현재 route session에서 다시 표시되지 않는다.

**Given** 새로운 `alertId`가 도착했을 때  
**When** active alerts가 갱신되면  
**Then** 새 알람 배너는 표시된다.

**Implementation Notes:**

- 닫힘은 서버 ACK가 아니라 client UI state다.
- route가 다른 cameraId로 바뀌면 session 기준을 새로 잡는다.
- 닫기 버튼은 아이콘 버튼이되 accessible name `경고 배너 닫기`를 가진다.

**Test Notes:**

- dismiss 후 같은 alert 미표시, 새 alert 표시, camera route 변경 시 상태 초기화를 테스트한다.
- keyboard activation과 Escape 닫기 후보를 검증한다.

**관련 파일 후보:**

- `frontend/src/components/CameraFocus/FocusAlertBanner.tsx`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/types/cameraFocus.ts`

**선후관계:** Story 5.1 이후. Story 5.3이 panel mode 연동을 추가한다.

### Story 5.3: Alert/Event 상세 Metadata Panel 연동

As a 운영자,
I want 경고와 관련된 이벤트 상세를 우측 패널에서 보고 싶다,
So that 영상과 이벤트 원인을 한 화면에서 대조할 수 있다.

**Acceptance Criteria:**

**Given** active alert에 `relatedEventId`가 있을 때  
**When** Focus 화면이 표시되면  
**Then** 우측 panel은 alert 또는 related event detail을 우선 표시한다.  
**And** 제어 대응 현황, 소재 정보, 냉각 코드, 속도, 유지 시간 등 제공되는 metadata를 표시한다.

**Given** metadata 필드가 누락되었을 때  
**When** panel이 렌더링되면  
**Then** 값은 `-` 또는 `정보 없음`으로 표시된다.

**Implementation Notes:**

- `FocusMetadataPanel`에 camera/event/alert mode를 명시한다.
- alert detail은 active alert payload를 우선 사용하고, related event 상세가 필요하면 `getEventDetail`을 호출한다.
- 이벤트 ACK/조치 workflow는 구현하지 않는다.

**Test Notes:**

- alert metadata, event metadata, missing field fallback, panel mode 우선순위를 테스트한다.

**관련 파일 후보:**

- `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- `frontend/src/hooks/useCameraFocus.ts`
- `frontend/src/services/eventService.ts`
- `frontend/src/types/cameraFocus.ts`

**선후관계:** Story 5.2 이후. Epic 6의 권한/접근성 검증 대상이다.

## Epic 6: 영역별 실패, 권한 없음, 접근성/반응형 검증

운영자가 영상 실패, metadata 실패, 이벤트 실패, 알람 실패, 권한 없음 상태를 명확히 구분하고, 데스크톱/소형 화면/키보드 환경에서도 핵심 작업을 수행할 수 있다.

### Story 6.1: 영역별 실패 상태와 재시도 UX 정리

As a 운영자,
I want 실패한 영역만 오류로 표시되고 다른 정보는 유지되기를 원한다,
So that 부분 장애 상황에서도 운영 판단을 계속할 수 있다.

**Acceptance Criteria:**

**Given** `camera`, `liveStream`, `playback`, `events`, `alerts` 중 하나가 실패했을 때  
**When** Focus 화면이 표시되면  
**Then** 실패한 영역에만 오류 상태가 표시된다.  
**And** 성공한 영역은 계속 표시된다.

**Given** 실패한 영역에 재시도 버튼이 있을 때  
**When** 사용자가 재시도를 실행하면  
**Then** 해당 영역의 API만 다시 호출한다.

**Implementation Notes:**

- 공통 error state component를 만들 수 있지만, 각 영역의 문구와 행동은 UX 문서 tone을 따른다.
- alerts 실패는 배너 미표시와 작은 패널 상태로 처리한다.

**Test Notes:**

- 실패 조합별 rendering matrix를 테스트한다.
- 전체 blank error page로 전환되지 않는지 검증한다.

**관련 파일 후보:**

- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- `frontend/src/components/CameraFocus/RecordingEventList.tsx`
- `frontend/src/hooks/useCameraFocus.ts`
- `frontend/src/hooks/useCameraPlayback.ts`

**선후관계:** Epic 3-5 이후.

### Story 6.2: 권한 없음 상태와 제한 Metadata 보호

As a 운영자,
I want 접근 권한이 없는 카메라를 열었을 때 명확한 안내를 보고 싶다,
So that 시스템 오류와 권한 문제를 즉시 구분할 수 있다.

**Acceptance Criteria:**

**Given** focus 또는 live stream API가 401/403 또는 `status=forbidden`을 반환할 때  
**When** Focus 화면이 표시되면  
**Then** video stage에 `이 카메라에 접근 권한이 없습니다.`를 표시한다.  
**And** 제한된 camera/event metadata는 표시하지 않는다.

**Given** 권한 없음 상태일 때  
**When** 사용자가 뒤로가기를 선택하면  
**Then** 이전 Live Grid 또는 기본 Live Grid 화면으로 이동한다.

**Implementation Notes:**

- 현재 Spring Security/RBAC가 완성되지 않은 상태를 반영해 API status와 HTTP status 둘 다 처리한다.
- 권한 없음은 generic error와 분리된 UI state로 유지한다.

**Test Notes:**

- 401, 403, `forbidden` data status를 각각 테스트한다.
- 제한 metadata가 DOM에 렌더링되지 않는지 검증한다.

**관련 파일 후보:**

- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- `frontend/src/services/cameraService.ts`
- `backend/src/main/java/com/vision/controller/CameraController.java`

**선후관계:** Story 6.1 이후.

### Story 6.3: 반응형 레이아웃과 운영 모니터 기준 검증

As a 운영자,
I want 다양한 운영 화면 크기에서도 영상과 핵심 정보에 접근하고 싶다,
So that 관제실 모니터와 작은 브라우저 모두에서 기능을 사용할 수 있다.

**Acceptance Criteria:**

**Given** viewport가 1920x1080 이상일 때  
**When** Focus 화면이 표시되면  
**Then** 본문은 2-column layout이고 video stage가 최대 폭을 차지하며 metadata panel은 360-420px 폭을 유지한다.

**Given** viewport가 1366x768일 때  
**When** Focus 화면이 표시되면  
**Then** metadata panel은 최소 320px까지 축소되고 핵심 카메라/이벤트 정보가 접근 가능하다.

**Given** viewport가 1024px 미만일 때  
**When** Focus 화면이 표시되면  
**Then** metadata panel은 영상 아래로 이동하고 camera/event/alert 정보는 panel 내부 전환 UI로 접근 가능하다.

**Implementation Notes:**

- landing page나 설명 화면을 만들지 않는다.
- 카드 중첩을 피하고 video stage, panel, timeline의 안정적인 dimensions를 정의한다.

**Test Notes:**

- Playwright 또는 Testing Library + viewport smoke test로 주요 breakpoint를 검증한다.
- 텍스트 겹침, 버튼 overflow, 영상 영역 collapse가 없는지 확인한다.

**관련 파일 후보:**

- `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- `frontend/src/components/CameraFocus/FocusVideoStage.tsx`
- `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`
- `frontend/src/components/CameraFocus/RecordingTimeline.tsx`
- `frontend/src/index.css` 또는 관련 style 파일

**선후관계:** Story 2.3, 4.2, 5.1 이후.

### Story 6.4: Keyboard와 ARIA 접근성 기준 충족

As a 키보드 사용자,
I want Focus 화면의 주요 작업을 마우스 없이 수행하고 싶다,
So that 운영 환경과 접근성 요구를 모두 만족할 수 있다.

**Acceptance Criteria:**

**Given** Focus 화면이 표시되어 있을 때  
**When** 사용자가 `Tab`으로 이동하면  
**Then** focus 순서는 공정 탭, mode 탭, video controls, timeline, event list, metadata panel 순서를 따른다.

**Given** 탭 UI가 표시될 때  
**When** screen reader가 탭을 읽으면  
**Then** `role=tablist`, `role=tab`, `aria-selected` 상태를 인식할 수 있다.

**Given** 경고 배너가 표시될 때  
**When** screen reader가 화면을 읽으면  
**Then** 배너는 `role=alert` 또는 동등한 live region으로 인식된다.  
**And** 닫기 버튼은 `경고 배너 닫기` accessible name을 가진다.

**Implementation Notes:**

- hover-only 확대 진입을 금지한다.
- event row는 Enter/Space로 선택 가능해야 한다.
- timeline marker에는 시간/이벤트명 accessible label을 제공한다.

**Test Notes:**

- Testing Library의 role/name query로 tabs, alert, buttons, event rows를 검증한다.
- keyboard interaction 테스트를 추가한다.

**관련 파일 후보:**

- `frontend/src/components/Grid/DraggableCell.tsx`
- `frontend/src/components/CameraFocus/CameraFocusShell.tsx`
- `frontend/src/components/CameraFocus/FocusAlertBanner.tsx`
- `frontend/src/components/CameraFocus/RecordingTimeline.tsx`
- `frontend/src/components/CameraFocus/RecordingEventList.tsx`

**선후관계:** Story 2.4, 4.3, 5.2 이후.

### Story 6.5: 제품 경계와 회귀 방지 검증

As a 제품 책임자,
I want 구현 결과가 Vision Monitor의 제품 경계를 지키는지 확인하고 싶다,
So that 확대 보기 개발 중 media/AI/server overlay 책임이 내부로 회귀하지 않는다.

**Acceptance Criteria:**

**Given** 카메라 집중 보기 MVP가 구현되었을 때  
**When** 코드와 테스트를 리뷰하면  
**Then** backend에는 RTSP ingest, FFmpeg/transcoding, media distribution, AI inference, server-side overlay 구현이 추가되어 있지 않다.  
**And** frontend는 `streamUrl`과 `playbackUrl`을 opaque media URL로 player에 전달한다.

**Given** Story 1-5의 기능이 모두 연결되었을 때  
**When** 수동 smoke test를 수행하면  
**Then** Grid 진입, live 표시, recording 전환, event seek, alert dismiss, partial failure, forbidden 상태가 MVP 기준으로 동작한다.

**Implementation Notes:**

- 이 story는 구현보다 검증/회귀 방지 성격이 강하다.
- README나 docs 갱신이 필요하면 제품 경계 문구만 짧게 보강한다.

**Test Notes:**

- frontend test suite와 backend test suite를 실행한다.
- 가능하면 Playwright smoke test로 `/live`, `/live/cameras/:cameraId?mode=live`, `/live/cameras/:cameraId?mode=recording`을 검증한다.

**관련 파일 후보:**

- `frontend/src/pages/Live.tsx`
- `frontend/src/pages/CameraFocus.tsx`
- `frontend/src/components/CameraFocus/*`
- `frontend/src/components/StreamPlayer/*`
- `backend/src/main/java/com/vision/controller/*`
- `backend/src/main/java/com/vision/service/*`
- `docs/ARCHITECTURE.md`
- `_bmad-output/planning-artifacts/architecture/architecture-vision-monitor-2026-08-15/ARCHITECTURE-SPINE.md`

**선후관계:** Epic 1-5 완료 이후 MVP hardening 마지막 story다.

## Final Validation

### Story Coverage Matrix

| Story | Primary Coverage |
| --- | --- |
| Story 1.1 | FR1, FR6, FR7, NFR2, NFR6, NFR8 |
| Story 1.2 | FR1, FR3, NFR2, NFR3, NFR7, AD-1, AD-3 |
| Story 1.3 | FR4, FR6, FR7, NFR2, NFR8, AD-3, AD-4 |
| Story 1.4 | FR5, FR6, NFR4, AD-6 |
| Story 2.1 | FR1, FR3, FR4, FR5, FR6, NFR2 |
| Story 2.2 | FR1, FR7, UX-DR1, UX-DR7 |
| Story 2.3 | FR2, FR6, NFR1, NFR5, UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR6, UX-DR7, UX-DR9 |
| Story 2.4 | FR1, FR7, UX-DR14 |
| Story 3.1 | FR3, NFR3, NFR7, UX-DR8 |
| Story 3.2 | FR3, FR6, NFR2, NFR3, NFR6, UX-DR8, UX-DR12, UX-DR13 |
| Story 4.1 | FR4, FR7, AD-3 |
| Story 4.2 | FR4, UX-DR10, UX-DR14 |
| Story 4.3 | FR4, FR6, FR7, UX-DR9, UX-DR11, UX-DR14 |
| Story 4.4 | FR4, NFR2, NFR3, UX-DR12 |
| Story 5.1 | FR5, NFR4, UX-DR5, UX-DR15 |
| Story 5.2 | FR5, AD-6, UX-DR5, UX-DR14, UX-DR15 |
| Story 5.3 | FR5, FR6, UX-DR9, UX-DR12 |
| Story 6.1 | FR1, FR3, FR4, FR5, FR6, NFR2, NFR3, UX-DR12 |
| Story 6.2 | FR1, FR3, FR6, NFR6, UX-DR13 |
| Story 6.3 | FR2, NFR5, UX-DR2, UX-DR3 |
| Story 6.4 | FR1, FR2, FR4, FR5, UX-DR5, UX-DR6, UX-DR7, UX-DR10, UX-DR11, UX-DR14, UX-DR15 |
| Story 6.5 | FR3, FR4, FR5, FR7, NFR9, AD-1, AD-3, AD-5, AD-6 |

### Validation Result

- FR coverage: FR1-FR7 모두 Story acceptance criteria와 Story Coverage Matrix에 매핑되어 있다.
- NFR coverage: NFR1-NFR9 모두 API contract, 영역별 실패 처리, 성능/반응형/권한/시간/확장성 story에 반영되어 있다.
- UX-DR coverage: UX-DR1-UX-DR15 모두 Focus shell, video stage, metadata panel, timeline, alert banner, accessibility/hardening story에 반영되어 있다.
- Architecture compliance: starter template 요구는 없다. Brownfield React/Vite + Spring Boot skeleton 확장으로 작성되어 있다.
- Database/entity scope: Story 1.1-1.4에서 각 API에 필요한 최소 entity/DTO/migration만 다루도록 제한했다.
- Product boundary: RTSP ingest, AI inference, media distribution, server-side overlay, encoding, 원본 영상 저장/보관은 제외되며 Story 6.5에서 회귀 방지 검증으로 묶었다.
- Dependency flow: Story는 이전 Story 결과에만 의존하도록 작성되어 있고, future story dependency는 없다.
- File churn: Focus page와 CameraFocus 컴포넌트는 여러 Epic에서 반복 수정되지만, route shell, live, recording, alert, hardening의 사용자 가치와 검증 피드백 경계가 분리되어 있어 허용 가능한 overlap이다.
