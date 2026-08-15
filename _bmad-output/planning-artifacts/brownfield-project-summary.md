# Vision Monitor Brownfield Project Summary

작성일: 2026-08-13  
작성 기준: Repository 읽기 전용 분석, 기존 문서 대조, BOK 1회 온보딩 결과  
문서 목적: BMAD Method로 후속 Product Brief, PRD, Architecture, Epic/Story를 진행하기 위한 현재 상태 기준선

## 1. Executive Summary

Vision Monitor VMS는 제조 공정 CCTV 영상을 기반으로 실시간 관제, AI 이벤트 감지, 알람, 녹화 재생, 사용자별 영상 레이아웃을 제공하려는 웹 기반 VMS 프로젝트이다.

현재 Repository는 Frontend PoC/Prototype 구현이 가장 많이 진행되어 있고, Backend는 Spring Boot 기반의 schema/API skeleton 단계이다. 기존 문서에는 RTSP ingest, AI model, server-side overlay, FFmpeg, WebRTC/WHEP, Media Distribution, SSE, 인증/RBAC 등이 넓게 설계되어 있으나, 실제 Runtime 코드에서는 대부분 아직 통합되지 않았다.

제품 경계는 사용자 확인으로 확정되었다. Vision Monitor는 외부 VMS, AI, Media Server가 제공하는 영상과 이벤트를 관제하는 Dashboard/API이며, RTSP ingest, AI inference, media distribution, server-side overlay, encoding을 직접 책임지지 않는다.

BMAD 관점의 현재 단계는 "Brownfield Project Documentation / Discovery"이다. 구현 착수 전에 외부 시스템별 interface contract, 인증/권한 모델, MVP 범위를 확정해야 한다.

## 2. Confirmed

### 2.1 Project Purpose

기존 문서와 README는 프로젝트 목적을 제조 공정 CCTV 기반 AI Monitoring Dashboard/VMS로 설명한다.

사용자 확인 기준의 제품 범위:

- 외부 VMS/AI/Media Server가 제공하는 영상과 이벤트를 관제한다.
- Vision Monitor는 운영 Dashboard, 업무 API, DB 저장/조회, 사용자별 Layout, 이벤트 확인 워크플로를 담당한다.
- Vision Monitor는 영상 처리, AI 추론, Media Server, server-side overlay, encoding을 직접 구현하지 않는다.

확인 근거:

- `README.md`: Manufacturing AI Monitoring Dashboard, Vision Monitor VMS 설명
- `docs/PLAN.md`: CCTV stream 수신, AI 객체 탐지 overlay, 웹 기반 VMS 시각화 목표
- `docs/ARCHITECTURE.md`: CCTV, Frontend, Backend, Database, Streaming Infrastructure, 외부 L2/EAI 경계 설명
- `docs/RESEARCH.md`: VMS, WebRTC/WHEP, RTSP/HLS/WebRTC, AI monitoring 조사

### 2.2 Current Repository Structure

```text
vision-monitor/
  frontend/       React/Vite/TypeScript frontend
  backend/        Spring Boot/Maven backend
  docs/           기존 연구, 설계, API, 화면, 구현 계획 문서
  scripts/        개발/배포/DB 초기화 스크립트
  _bmad/          BMAD Method 설정
  .agents/        BMAD/agent skill 정의
  _bmad-output/   BMAD 산출물 출력 위치
  bok/            BOK Brownfield 분석 산출물
```

### 2.3 Technology Stack

Frontend:

| Category | Technology | Version / Evidence |
|---|---|---|
| Language | TypeScript | `typescript ^5.3.3` |
| Framework | React | `react ^19.0.0` |
| Bundler | Vite | `vite ^8.2.0` |
| Routing | React Router | `react-router-dom ^7.18.2` |
| State | Redux Toolkit | `@reduxjs/toolkit ^1.9.7` |
| HTTP | Axios | `axios ^1.6.8` |
| Styling | Tailwind CSS | `tailwindcss ^3.4.1` |
| Streaming | hls.js, video.js, browser WebRTC APIs | `hls.js ^1.4.15`, `video.js ^8.6.1`, `RTCPeerConnection` usage |
| i18n | i18next | `i18next`, `react-i18next` |
| Tests | Vitest, Testing Library | 18 test files, 128 tests passed |

Backend:

| Category | Technology | Version / Evidence |
|---|---|---|
| Language | Java | Java 21 |
| Framework | Spring Boot | `spring-boot-starter-parent 3.2.0` |
| API | Spring MVC REST | controllers under `com.vision.controller` |
| ORM | Spring Data JPA / Hibernate | `spring-boot-starter-data-jpa` |
| Database | MariaDB | `mariadb-java-client 3.3.0` |
| Migration | Flyway | `flyway-core`, `flyway-mysql` |
| API Docs | Springdoc OpenAPI | `springdoc-openapi-starter-webmvc-ui 2.0.4` |
| Tests | Maven/Surefire | `mvn test` build success, no meaningful backend tests observed |

### 2.4 Frontend Structure

Confirmed frontend areas:

- `src/pages`: `Login`, `Live`, `Playback`, `Events`, `Settings`
- `src/components/Grid`: grid container, tabs, subtabs, draggable cells, camera selector
- `src/components/StreamPlayer`: abstract player, HLS, WebRTC/WHEP, RTSP/JSMpeg-style player, React hook/component
- `src/store/slices`: auth, camera, event, layout, ui slices
- `src/services`: axios client and camera/event/layout services
- `src/mocks`: live monitoring mock camera/layout data
- `src/streaming`: external stream page URL construction and detection
- `src/locales`: Korean/English locale resources

Important runtime fact:

```text
Live.tsx
  -> createMockCameras()
  -> createMockLayout()
  -> GridContainer
  -> DraggableCell
  -> LiveStreamPlayer
  -> iframe stream page or StreamPlayerComponent
```

The current live page does not use backend camera/layout API as the source of truth.

### 2.5 Backend Structure

Confirmed backend areas:

- `controller`: Camera, Stream, Event, Recording, AlertSetting, Layout controllers
- `service`: Camera, Event, Recording, Layout services
- `repository`: Camera, Stream, Event, Recording, Layout, AlertSetting repositories
- `entity`: Camera, Stream, Event, Recording, Layout, AlertSetting entities
- `resources/db/migration`: Flyway migrations `V001__init.sql`, `V002__add_user_layouts.sql`
- `application.yml`: MariaDB, JPA validate, Flyway, Springdoc, logging, management endpoints

Backend implementation status:

- Entity/schema layer exists.
- Repository interfaces exist.
- Several controllers and services are TODO stubs.
- Camera and Layout controllers return empty/null/echo values.
- Stream, Event, Recording, AlertSetting controllers have no meaningful endpoints beyond class-level mappings.

### 2.6 Database

Confirmed tables from Flyway migrations:

- `cameras`
- `streams`
- `events`
- `recordings`
- `alert_settings`
- `users`
- `audit_logs`
- `layouts`

Known schema limitations:

- `users` has no password/hash fields in migration.
- `layouts` stores grid/tab data as JSON.
- `streams` references `cameras`.
- Event, recording, and audit log partitioning is described in architecture docs but not implemented in migrations.

### 2.7 Media / Streaming Code

Confirmed frontend streaming code:

- HLS playback class using `hls.js`
- WebRTC playback class using browser `RTCPeerConnection` and WHEP-style POST/answer flow
- RTSP player wrapper that converts `rtsp://` URL to WebSocket URL and dynamically loads JSMpeg from CDN
- `LiveStreamPlayer` iframe path for go2rtc-style stream pages
- `VITE_STREAM_PAGE_BASE_URL` with default `http://220.81.187.50:1984`
- Mock cameras map `video_high1` through `video_high7` into `/stream.html?src=...`

Not confirmed in runtime code:

- MediaMTX server config
- go2rtc config file
- FFmpeg ingest process manager
- RTSP to WebRTC/HLS server-side transcoding
- Server-side AI overlay/encode pipeline
- Browser-to-backend stream session negotiation

### 2.8 Existing PoCs and Demo Code

Confirmed PoC/demo areas:

- Demo login: `tester` / `tester123`
- Live monitoring mock cameras/layout
- Events page mock event data
- Playback page UI-only player placeholder
- Service fallback behavior returning default/null/empty values when API calls fail
- go2rtc-style external stream page iframe integration

### 2.9 Existing Documentation

Important existing docs:

- `docs/RESEARCH.md`: VMS, WebRTC/WHEP, protocols, AI monitoring research
- `docs/ARCHITECTURE.md`: intended architecture and data flows
- `docs/API.md`: planned REST API specification
- `docs/SCREENS.md`: UI/screen design
- `docs/PLAN.md`, `docs/IMPLEMENTATION_PLAN_v2.md`: planning docs
- `docs/IMPLEMENTATION_PLAN_FINAL_2026-08-11.md`: claims frontend completion and future backend/integration
- `docs/IMPLEMENTATION_SCHEDULE_REVISED_2026-08-11_TO_2026-09-30.md`: future backend/WebRTC/user management schedule
- `docs/REFACTORING_SUMMARY_2026-08-13.md`: current live monitoring and streaming boundary summary
- `frontend/STREAMPLAYER_IMPLEMENTATION.md`: StreamPlayer implementation note
- `frontend/STATE_MANAGEMENT_SUMMARY.md`: state management notes

## 3. Inferred

The project appears to have evolved from an architecture/planning phase into a frontend-heavy PoC phase. The frontend currently demonstrates the target UX and several media player abstractions, while the backend provides the planned application skeleton and database schema for later integration.

The most likely intended deployment shape is multi-part:

```text
React Application
  -> Spring Boot Application
  -> MariaDB

React Application
  -> external Media Distribution Server, currently go2rtc-style stream page

Future:
  External VMS/AI/Media Server
    -> stream URL / playback URL / event payload
    -> Vision Monitor Dashboard/API

Future:
  AI or VMS
    -> Spring Boot API/event ingestion
    -> MariaDB
    -> React events/alarm UI
```

The repo uses an external go2rtc-style server as the current live video PoC boundary. This aligns with the confirmed product boundary: Vision Monitor consumes external streams/events rather than implementing full RTSP ingest/transcode/media distribution.

## 4. Needs Confirmation

Key questions before PRD/Architecture updates:

1. Is the current go2rtc endpoint a temporary PoC, the planned production media distribution server, or just a developer test server?
2. Should MediaMTX be used instead of, or in addition to, go2rtc?
3. What is the AI Model Server contract: REST, WebSocket, gRPC, message queue, file drop, or VMS event webhook?
4. Is object detection overlay already included in externally provided streams, or should Vision Monitor render metadata overlay in the Browser?
5. What is the target latency for live monitoring, and how many cameras must play simultaneously?
6. What browser/network environment must be supported: internal LAN only, remote access, firewall/NAT, TURN server availability?
7. What authentication source is required: local users, JWT, SSO, LDAP/AD, or external IAM?
8. What roles and permissions are actually required for operators, supervisors, admins, and viewers?
9. Are camera credentials stored in this application, or managed by external VMS/media infrastructure?
10. What is the retention policy and storage system for recordings?
11. Which existing docs are authoritative when they conflict with code: final plan, revised schedule, architecture, or current repo state?

## 5. Current Architecture

### 5.1 Code-Confirmed Runtime Architecture

```text
Browser
  React App
    Login Page
      -> hard-coded demo auth in Redux
    Live Page
      -> mock cameras/layout
      -> Grid UI
      -> LiveStreamPlayer
        -> iframe to external go2rtc-style stream.html page
        OR
        -> HLS/WebRTC/RTSP frontend player
    Events Page
      -> mock event list
    Playback Page
      -> UI-only playback placeholder
    Settings Page
      -> camera/settings UI and service layer

Spring Boot App
  Controllers/Services
    -> mostly TODO skeletons
  JPA Entities/Repositories
    -> MariaDB schema target

MariaDB
  Flyway-created schema
```

### 5.2 Intended Architecture From Existing Docs

```text
CCTV / External VMS / AI / Media Server
  -> video stream URL
  -> alarm/event payload
  -> recording playback URL or metadata
  -> Browser

React
  -> Spring Boot REST API
  -> MariaDB

External AI or VMS
  -> Spring Boot event ingestion
  -> MariaDB
  -> React alarm/event UI
```

### 5.3 Difference Between Intended and Actual

| Boundary | Intended / Documented | Actual Code State |
|---|---|---|
| CCTV | Managed by external VMS/Media infrastructure | No camera ingest implementation by design |
| VMS / Video Processing | External responsibility | Not implemented in backend; outside product boundary |
| AI Model Server | External event/detection provider | Integration contract still needed |
| Overlay | External stream overlay or browser metadata overlay | Representation strategy still needs definition |
| Encode | External media responsibility | Outside product boundary |
| Media Distribution | External Media Server or VMS-provided stream URL | External go2rtc-style stream page URL used by frontend |
| Spring Boot App | API/business logic/event ingestion | Schema and TODO API skeleton |
| React App | Live grid, events, playback, settings | Frontend prototype with mock/fallback data |
| Database | MariaDB with operational schema | Base schema exists, advanced partitioning/security missing |
| External Systems | L2/EAI, email/SMS/webhook | Documented only |

## 6. Capability Status

| Capability | Status | Evidence / Reason |
|---|---|---|
| Login | PoC Only | Hard-coded `tester/tester123`, no backend auth |
| User / Permission | Planned | `users` table exists, no auth/user API or RBAC implementation |
| Admin Screen | Partially Implemented | Settings UI exists; admin authorization not implemented |
| CCTV Live Monitoring | PoC Only | Live page uses mock cameras and external stream pages |
| 3x2 / 3x3 Grid | Implemented | Grid UI supports configured rows/cols and tests exist |
| WebRTC Player | Partially Implemented | WHEP-style frontend client exists; server/media integration unconfirmed |
| HLS Player | Partially Implemented | Frontend player exists; production HLS source/server unconfirmed |
| RTSP Player | PoC Only | Browser-side wrapper assumes RTSP-over-WS/JSMpeg path; no server bridge in repo |
| MediaMTX | Unknown/Planned | Mentioned in research context; no config/runtime code found |
| go2rtc | PoC Only | External `stream.html?src=...` integration exists |
| RTSP Processing | Out of Scope / External | No backend FFmpeg/RTSP ingest implementation; external media stack owns it |
| AI Model Integration | Planned | External AI/VMS event contract not implemented |
| Server-side Overlay | Out of Scope / External | Vision Monitor does not own server-side video overlay |
| Alarm Event | PoC Only | Mock events UI; event DB schema; backend TODO |
| Recording Playback | PoC Only | Playback UI placeholder; recording DB schema; backend TODO |
| Camera Management | Partially Implemented | Schema/service/controller/service client exist; backend persistence missing |
| User-specific Layout | Partially Implemented | Frontend Redux/fallback and DB table exist; backend persistence TODO |
| Drag & Drop Dashboard | Implemented/PoC | Frontend DnD implemented; persistence not complete |
| i18n | Partially Implemented | Korean/English resources and i18n setup exist |
| Tests | Partially Implemented | Frontend tests exist; backend behavior tests missing |

## 7. Gap Analysis

| Gap | Category | Current State | Impact |
|---|---|---|---|
| Backend API skeleton returns empty/null/TODO | Architecture Gap | Controllers/services are mostly stubs | Frontend cannot use backend as source of truth |
| Live monitoring uses mock data | Product Requirement Gap | `Live.tsx` injects mock layout/cameras | Demo can work without proving real camera/layout workflow |
| External media contract not finalized | Architecture Gap | go2rtc-style URL exists; MediaMTX/go2rtc/external VMS decision unclear | Streaming architecture cannot be hardened |
| External stream contract undefined | Integration Gap | No production stream/playback URL contract | Browser playback and camera metadata cannot be finalized |
| AI interface undefined | Integration Gap | Docs mention AI events; no contract/code | Alarm/event workflow cannot be specified precisely |
| Overlay representation undefined | Product Requirement Gap | External overlay vs browser metadata overlay not decided | Event-to-video UX cannot be specified precisely |
| WebRTC server/WHEP endpoint absent | Infrastructure Gap | Frontend WHEP client only | End-to-end WebRTC cannot be validated |
| Authentication is demo-only | Technical Risk | Hard-coded credentials, no backend security | Not production-safe; affects all APIs |
| User/RBAC requirements unclear | Product Requirement Gap | Roles documented but not implemented | Admin/operator/viewer behavior cannot be tested |
| Recording storage undefined | Operational Risk | DB schema/UI placeholder only | Playback/retention/download cannot be planned safely |
| Event source unclear | Integration Gap | Events page mock data; backend event API TODO | AI/VMS alarm flow not executable |
| Browser/network constraints unvalidated | Technical Risk | WebRTC/TURN/firewall assumptions unknown | Multi-camera live monitoring may fail in target network |
| Docs overstate implementation | Operational Risk | Some docs mark features complete while code is PoC | Planning risk; stories may start from wrong baseline |
| Backend tests absent | Technical Risk | `mvn test` compiles but no behavior coverage | API implementation will need focused test baseline |
| Frontend dependency health needs review | Technical Risk | Existing summary notes lint/dependency/audit issues | Build/tooling risk before production hardening |

## 8. Known Constraints

- Do not assume documented target architecture equals implemented architecture.
- Do not treat mock/demo flows as production-ready capabilities.
- Browser cannot play raw RTSP without bridge/transcoding.
- WebRTC success depends on media server, signaling/WHEP endpoint, ICE/STUN/TURN, firewall/NAT constraints.
- Current Spring Boot application has no Spring Security dependency/config despite docs describing JWT/RBAC.
- Current database schema is a starting point, not a fully validated production data model.

## 9. Known Technical Risks

- Real-time multi-camera streaming may be bandwidth/CPU/GPU constrained in browser and network.
- WHEP client implementation needs validation against the chosen media server.
- RTSP-over-WebSocket/JSMpeg path depends on a server bridge not present in the repo.
- Browser metadata overlay can introduce synchronization and UX risks if external streams do not already include overlay.
- AI detection/event timing must be synchronized with video stream timestamps.
- JSON fields in `layouts` simplify prototyping but may complicate validation, migration, querying, and audit.
- Current demo auth creates false confidence around protected routes.

## 10. Recommended BMAD Workflow

Recommended next workflow order:

```text
1. Project Documentation
2. Product Brief
3. Brownfield PRD
4. Architecture
5. ADR set
6. Epic / Story breakdown
7. Implementation Readiness Check
```

### 10.1 Project Documentation

Use this document as the current code-fact baseline. Reuse existing docs instead of rewriting them wholesale:

- Reuse `docs/RESEARCH.md` for technology research.
- Reuse `docs/ARCHITECTURE.md` as intended architecture input, but mark it as target/design, not current implementation.
- Reuse `docs/API.md` as planned API catalog, then reconcile against actual backend controllers.
- Reuse `docs/REFACTORING_SUMMARY_2026-08-13.md` for latest frontend streaming boundary.

### 10.2 Product Brief

Use confirmed product boundary:

- This is an operational dashboard consuming streams/events from external VMS, AI, and Media Server.
- It is not a full VMS/media/AI processing product.

### 10.3 Brownfield PRD

Define MVP requirements using code-aware status:

- Real camera source of truth
- Real layout persistence
- Auth/RBAC
- Alarm event ingestion/display
- Media server integration
- Recording playback

### 10.4 Architecture

Resolve system boundaries and data flows:

- External VMS/AI/Media Server interface contracts
- Media server selection
- AI event contract
- Overlay representation strategy
- Browser/network constraints
- Spring Boot responsibilities
- Database model and migration policy

### 10.5 ADR Candidates

Recommended ADRs:

1. Media Distribution Server: go2rtc vs MediaMTX vs external VMS-provided URLs
2. Live Video Protocol Strategy: WebRTC primary, HLS fallback, RTSP bridge handling
3. Overlay Representation Strategy: externally composited stream vs browser metadata overlay
4. AI Event Interface: push API vs message queue vs VMS webhook
5. Auth Model: local JWT/RBAC vs external SSO/IAM
6. Layout Persistence Model: JSON blob vs normalized schema
7. Recording Storage and Playback Strategy

## 11. Current Development Stage

BMAD classification:

```text
Brownfield project
  -> existing planning/design docs
  -> frontend-heavy PoC/prototype
  -> backend skeleton/schema
  -> media integration PoC through external go2rtc-style stream page
  -> not yet implementation-ready for full production feature work
```

BOK readiness result:

- Purpose: understand
- Target: R2
- Current result: R0 / NOT READY
- Main reason: business rules, data model, runtime behavior, deployment, security, and integration boundaries need human confirmation and stronger documentation.

## 12. Immediate Next Actions

Before writing implementation stories:

1. Choose or confirm media server strategy.
2. Define AI/VMS event ingestion contract.
3. Define stream/playback URL contract from external VMS/Media Server.
4. Reconcile `docs/API.md` with actual Spring Boot controller plan.
5. Decide auth/RBAC requirements.
6. Convert confirmed scope into Brownfield PRD.
7. Update architecture around external integration contracts.
