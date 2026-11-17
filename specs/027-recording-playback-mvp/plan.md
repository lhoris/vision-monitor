# 구현 계획: 화면 확대 보기 녹화 재생 MVP

**브랜치**: `027-recording-playback-mvp` | **일자**: 2026-11-17 | **명세**: [spec.md](./spec.md)

**입력**: `/specs/027-recording-playback-mvp/spec.md`의 기능 명세

## 1. 계획 요약

화면 확대 보기의 기존 녹화 탭과 `useCameraPlayback` 흐름을 확장해 수동 시간 구간과 알람 기반 시간 구간을 모두 지원한다. MVP는 실제 검증용 MP4 녹화 URL을 frontend recording adapter에서 조합하고, 기존 플레이어 구조와 호환되는 native MP4 재생 경로를 추가한다. 시작·종료 시간은 화면 상태로 관리하며, 조회 요청마다 URL을 새로 구성한다. 기존 backend API와 DB는 변경하지 않고, 후속 운영 연동 시 동일한 playback contract를 backend API로 이동할 수 있도록 타입과 계약을 분리한다.

## 2. 요구사항 추적

| 명세 항목 | 계획 반영 위치 | 비고 |
|-----------|----------------|------|
| FR-001, FR-007 | `CameraFocusShell`, `CameraFocus` | 기존 모드/카메라 선택 흐름 유지 |
| FR-002, FR-003 | `RecordingControls`, `recordingService` | 수동 시간 범위와 MP4 URL 조합 |
| FR-004 | native MP4 video controls | 현재 조회 구간 내 seek 제공 |
| FR-005 | `CameraFocus`, `useCameraPlayback` | 알람 시각 기준 ±30초 자동 조회 |
| FR-006 | `FocusVideoStage`, recording adapter | 로딩·오류·빈 상태 메시지 |
| UX-001~UX-006 | CameraFocus 녹화 UI 및 기존 컴포넌트 | 실시간 흐름 회귀 방지 |

## 3. 기술 컨텍스트

**언어/버전**: TypeScript, React, Java 21/Spring Boot 기존 프로젝트

**주요 의존성**: React, React Router, Vitest, React Testing Library, 기존 StreamPlayer

**저장소/상태 관리**: `CameraFocus` 로컬 상태와 기존 playback DTO contract

**테스트**: Vitest, React Testing Library, frontend production build

**대상 플랫폼**: 웹 브라우저, Windows 로컬 개발 환경

**프로젝트 유형**: full-stack web app; 이번 MVP는 frontend 중심

**성능 목표**: 유효한 요청 후 5초 이내 플레이어 또는 명확한 오류 상태 표시

**제약사항**: mock-first MVP, 실제 backend/API/DB 추가 제외, 기존 UI 구조 유지

**규모/범위**: 화면 확대 보기 단일 화면, 검증용 `video6` 단일 녹화 경로

## 4. 구현 범위와 제외 범위

### 구현 범위

- `CameraFocus`에 녹화 시작·종료 시간 입력과 조회 동작 추가
- 실제 검증용 녹화 URL에 시간 파라미터를 조합하는 frontend adapter 추가
- MP4 재생을 위한 native video 경로 추가
- 알람 선택 시 알람 발생 시각 전후 30초 구간 자동 조회
- 기존 녹화 타임라인과 로딩·오류·빈 상태 연결
- 관련 component/service 테스트와 frontend build 검증

### 제외 범위

- Spring Boot 녹화 endpoint, DB migration, 영상 관리 화면의 `recording_path` 관리
- 녹화 서버 인증정보 운영 관리 및 다운로드
- 여러 녹화 서버·영상별 경로 일반화

## 5. 설계 접근

### 화면/컴포넌트 구조

- `CameraFocus`가 녹화 조회 범위의 source of truth가 된다.
- `CameraFocusShell`은 녹화 입력 영역을 `FocusVideoStage` 위에 배치한다.
- `FocusVideoStage`는 playback protocol이 `mp4`인 경우 native `<video controls>`를 사용하고 기존 HLS/WebRTC 흐름은 유지한다.
- `RecordingTimeline`은 플레이어 하단의 메인 타임라인으로 동작하며 녹화 가능 구간, 현재 재생 위치, 알람 marker를 표시하고 마우스 클릭·방향키 seek를 제공한다.

### 상태 및 상호작용 흐름

- 녹화 탭 진입 시 검증용 기본 구간을 표시한다.
- 사용자가 유효한 시작·종료 시각으로 조회하면 playback session과 URL을 갱신한다.
- 알람 선택 시 알람 발생 시각 기준 ±30초로 범위를 갱신하고 이벤트 선택 상태를 유지한다.
- 잘못된 범위는 요청하지 않고 한국어 안내를 표시한다.
- 카메라/모드가 바뀌면 이전 playback 요청 결과가 현재 화면을 덮어쓰지 않도록 취소 상태를 유지한다.

### 서비스 및 데이터 흐름

- `recordingService`는 MVP adapter에서 `recording_path`, `start`, `end`를 조합한다.
- `PlaybackSessionDto`에 `mp4` protocol을 추가한다.
- 운영 backend 연동 시 adapter 내부 호출만 API 호출로 교체할 수 있도록 `getCameraPlayback` 반환 형태는 유지한다.

## 6. 데이터 및 계약 계획

### 필요한 데이터

- 카메라 ID, 녹화 경로, 조회 시작·종료 시각
- playback URL, protocol, 사용 가능한 시간 구간
- 선택 알람의 camera ID와 발생 시각

### 계약

- frontend service: `getCameraPlayback(cameraId, range)`
- playback protocol: `mp4`
- 성공 응답: `PlaybackSessionDto`
- 오류 응답: `INVALID_RANGE`, `PLAYBACK_UNAVAILABLE`, `RECORDING_NOT_FOUND`

### Fixture/Mock 계획

- 기본 녹화 경로: `/playback/video6.mp4`
- 기본 시간 구간: `2026-11-17T07:29:31` ~ `2026-11-17T07:30:01`
- 알람 자동 구간: 발생 시각 기준 앞뒤 30초

## 7. 테스트 및 검증 계획

- **단위/컴포넌트 테스트**: 시간 범위 검증, URL 조합, 수동 조회, 알람 자동 범위, MP4 player 렌더링
- **단위/컴포넌트 테스트**: 시간 범위 검증, URL 조합, 수동 조회, 메인 타임라인 mouse/keyboard seek, 알람 자동 범위, MP4 player 렌더링
- **통합 테스트**: `CameraFocus`에서 녹화 탭과 알람 선택 흐름 연결
- **E2E/수동 검증**: 화면 확대 보기 → 녹화 → 조회 → native controls 조작, 알람 선택 후 구간 이동
- **빌드/정적 검증**: `npm run build`, 관련 Vitest 테스트
- **회귀 확인**: 기존 실시간 탭과 기존 HLS/WebRTC player 테스트

## 8. 프로젝트 구조

```text
specs/027-recording-playback-mvp/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/playback.md
└── tasks.md

frontend/src/
├── components/CameraFocus/
├── hooks/useCameraPlayback.ts
├── pages/CameraFocus.tsx
├── services/recordingService.ts
└── types/cameraFocus.ts
```

**구조 결정**: 기존 Camera Focus 경계와 recording service를 유지하고, MVP에 필요한 작은 UI·계약 확장만 추가한다.

## 9. 헌법 체크

- **한국어 우선 산출물**: 통과. 문서와 사용자 메시지는 한국어 우선이다.
- **기존 구조 존중**: 통과. 기존 CameraFocus, playback hook, player 경계를 재사용한다.
- **Mock-First MVP**: 통과. backend/DB와 외부 녹화 서버 운영 연동은 후속으로 둔다.
- **계약 우선**: 통과. `PlaybackSessionDto`와 playback service 반환 계약을 유지한다.
- **테스트 가능한 증분**: 통과. P1 수동 조회를 먼저 독립 검증하고 P2 알람 연계를 추가한다.
- **로컬 개발 환경 전체 실행**: 통과. 구현 후 frontend 테스트/build를 수행하고 필요 시 backend/frontend 동시 실행으로 수동 확인한다.

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| 녹화 서버 CORS 또는 인증 정책 | 브라우저에서 MP4 재생 실패 | 명확한 재생 오류를 표시하고 후속 backend proxy로 분리 |
| 녹화 URL의 시간 형식 불일치 | 영상 없음 또는 잘못된 구간 | `YYYY-MM-DDTHH:mm:ss` 형식을 고정하고 범위 검증 |
| 알람 시각과 현재 카메라 불일치 | 잘못된 영상 재생 | camera ID 일치 여부를 확인한 뒤 자동 적용 |
| 기존 player가 MP4를 스트리밍으로 오인 | 재생 초기화 실패 | `mp4` protocol을 명시해 native video 경로로 분기 |

## 11. 복잡도 추적

| 결정 | 필요한 이유 | 더 단순한 대안을 거부한 이유 |
|------|-------------|-------------------------------|
| MVP에서 frontend adapter로 검증 URL 조합 | 실제 녹화 영상을 즉시 확인해야 함 | backend/DB를 동시에 변경하면 MVP 검증 범위와 장애 지점이 커짐 |
