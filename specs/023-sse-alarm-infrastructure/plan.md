# 구현 계획: 실시간 알람 SSE 인프라

**기능**: [spec.md](spec.md)  
**작성일**: 2026-10-16

## 1. 계획 요약

Spring MVC의 `SseEmitter`를 사용자 이름 기준으로 관리하는 인메모리 broker를 백엔드에 추가한다. 인증 interceptor가 설정한 사용자 attribute를 endpoint에서 사용하고, publisher는 사용자 이름 또는 전체 사용자 대상으로 알람 메시지를 발행한다. 프론트엔드는 fetch streaming reader로 `text/event-stream`을 읽어 기존 `Event` 타입으로 변환하며 재연결과 해제를 관리한다.

## 2. 요구사항 추적

| 요구사항 | 반영 위치 |
|---|---|
| FR-001~FR-006 | `AlarmSseBroker`, `AlarmStreamController`, backend tests |
| FR-007~FR-008 | `alarmSseService.ts`, frontend tests |
| FR-009 | `AlarmEventPublisher` |
| FR-010 | 기존 이벤트 저장소와 UI 변경 없이 contract boundary만 제공 |

## 3. 기술 컨텍스트

- 백엔드: Java 21, Spring Boot 3.5, Spring MVC, JUnit/MockMvc
- 프론트엔드: React 19, TypeScript, Vite, Vitest
- 인증: 기존 `AuthSessionInterceptor`의 bearer session과 request attribute
- 데이터: 인메모리 concurrent map; persistence/broker는 후속 범위

## 4. 설계

### 백엔드

- `AlarmSseEvent`: SSE event name과 JSON data로 직렬화되는 불변 payload.
- `AlarmSseBroker`: `ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>>`로 사용자별 구독을 관리한다. 등록 시 초기 `connected` 이벤트를 보내고, 주기 heartbeat를 전송한다.
- `AlarmEventPublisher`: 알람 생성원이 호출할 공개 경계. 사용자 대상 발행과 전체 사용자 발행을 제공한다.
- `AlarmStreamController`: `GET /api/alarms/stream`, `produces = text/event-stream`, 인증 user attribute를 이용해 broker를 구독한다.
- cleanup은 emitter completion/timeout/error callback과 전송 예외에서 동일하게 수행한다.

### 프론트엔드

- `alarmSseService.subscribe(onEvent, onStatus)`가 `fetch('/api/alarms/stream')`로 연결한다.
- 요청 interceptor와 동일한 localStorage bearer token을 Authorization 헤더에 넣는다.
- SSE framing(`event:`, `data:`, blank line)을 파싱하고 `alarm` 이벤트만 JSON decode한다. `connected`/`heartbeat`는 상태 이벤트로만 처리한다.
- AbortController로 해제하며, 네트워크 종료는 1/2/4/8/16초 지연으로 최대 5회 재시도한다.

## 5. 계약

상세 계약은 [contracts/sse.md](contracts/sse.md)에 둔다. 핵심 endpoint는 `GET /api/alarms/stream`이며, 이벤트 data는 프론트 `Event`가 이해할 수 있는 alarm envelope을 사용한다.

## 6. 검증 계획

- 백엔드 단위 테스트: 사용자 격리, 발행, heartbeat, cleanup
- 백엔드 controller 테스트: 인증 user attribute 기반 emitter 응답 설정
- 프론트 단위 테스트: SSE frame 파싱, bearer header, abort, 재연결 제한
- 전체 검증: `backend/mvnw.cmd test`, `frontend/npm test -- --run`, `frontend/npm run build`

## 7. 리스크와 완화

| 리스크 | 완화 |
|---|---|
| 다중 인스턴스에서 이벤트 유실 | MVP 가정으로 명시하고 broker 도입 시 adapter 교체 경계를 유지 |
| EventSource의 인증 header 제한 | fetch 기반 reader 사용 |
| 느린/죽은 클라이언트가 emitter를 점유 | heartbeat, timeout, callback cleanup, 전송 예외 제거 |
