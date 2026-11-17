# 구현 계획: 편집기형 녹화 재생 플레이어

**브랜치**: `028-editor-style-recording-player` | **일자**: 2026-11-17 | **명세**: [spec.md](./spec.md)

**입력**: `/specs/028-editor-style-recording-player/spec.md`의 기능 명세

## 1. 계획 요약

기존 `RecordingTimeline`을 단순 marker 표시 영역에서 편집기형 시간축 컴포넌트로 확장한다. 하루 전체를 고정한 overview 좌표계와 현재 선택 범위(work area), 현재 재생 위치(playhead)를 별도 상태로 관리한다. 마우스 포인터와 키보드 입력은 시간축 상태로 변환하며, 범위가 확정될 때만 기존 playback service를 호출한다. 외부 timeline library는 도입하지 않고 프로젝트의 Tailwind·React 구조에 맞춘 전용 컴포넌트로 구현한다.

## 2. 요구사항 추적

| 명세 항목 | 계획 반영 위치 | 비고 |
|-----------|----------------|------|
| FR-001~FR-005 | `RecordingTimeline` | 24시간 축, work area, playhead, marker |
| FR-006, FR-010 | `CameraFocus`, `RecordingControls` | 범위 확정 후 playback 요청 |
| FR-007 | `CameraFocus`, `RecordingTimeline` | marker/list 연계 |
| FR-008 | `FocusVideoStage`, `RecordingTimeline` | native video와 위치 동기화 |
| FR-009 | `RecordingControls` | 날짜 선택과 24시간 축 재계산 |
| FR-011, FR-012 | recording 상태 및 제외 범위 | 오류·비파괴 처리 |
| UX-001~UX-007 | `RecordingTimeline` | 편집기형 조작 및 접근성 |

## 3. 기술 컨텍스트

**언어/버전**: TypeScript, React

**주요 의존성**: 기존 React, Vitest, React Testing Library, Tailwind CSS

**저장소/상태 관리**: `CameraFocus` 로컬 상태, 기존 `PlaybackSessionDto`

**테스트**: Vitest, React Testing Library, frontend build

**대상 플랫폼**: 웹 브라우저, Windows 로컬 개발 환경

**프로젝트 유형**: full-stack web app; 이번 변경은 frontend 중심

**성능 목표**: 드래그 중 60fps에 가까운 시각 피드백, 범위 확정 후 5초 이내 플레이어 또는 오류 상태

**제약사항**: 실제 파일 편집·저장 제외, 기존 MP4 playback adapter 유지, 외부 timeline library 추가 제외

**규모/범위**: 화면 확대 보기 단일 timeline, 하루 24시간, 단일 카메라 트랙

## 4. 구현 범위와 제외 범위

### 구현 범위

- 24시간 timeline coordinate와 시간 눈금 표시
- work area 좌우 핸들·본체 드래그
- playhead mouse/keyboard seek
- 알람 marker와 알람 목록 연계
- 날짜 선택과 범위 확정 playback 요청
- native MP4 player 위치 동기화
- 테스트와 접근성 상태

### 제외 범위

- 실제 영상 파일 trimming/export/download
- 운영 녹화 availability API와 영상별 recording path 관리
- 다중 카메라 동기화 트랙
- 외부 timeline library 의존성 추가

## 5. 설계 접근

### 핵심 철학

1. **시간축 우선**: 사용자가 시간을 직접 입력하지 않아도 전체 시간축에서 원하는 장면을 찾는다.
2. **탐색과 재생 분리**: playhead는 현재 위치, work area는 조회 범위로 분리한다.
3. **비파괴 검토**: 모든 조작은 원본 녹화에 영향을 주지 않으며 playback URL만 새로 만든다.
4. **명시적 확정**: 드래그 중에는 UI만 갱신하고, 사용자가 재생/조회할 때 외부 영상 요청을 발생시킨다.
5. **업무 의미 보존**: 알람 marker와 녹화 가능 구간을 영상보다 먼저 이해할 수 있게 표시한다.

### 화면/컴포넌트 구조

- `RecordingTimeline`: 24시간 좌표계, tick, availability, work area, playhead, marker, pointer/keyboard interaction
- `RecordingControls`: 날짜 선택, 범위 요약, 재생/조회 확정, 오류 메시지
- `FocusVideoStage`: native video와 timeline 사이 currentTime/seek 상태 연결
- `CameraFocus`: draft work area와 requested playback range 분리, 날짜 변경 및 알람 연계

### 상태 및 상호작용 흐름

1. `dayRange`: 선택 날짜의 00:00~24:00
2. `workAreaDraft`: 드래그 중인 범위
3. `playbackRange`: 마지막으로 확정한 범위
4. `playhead`: 플레이어 현재 위치의 day-relative offset
5. `dragMode`: `start-handle`, `move`, `end-handle`, `playhead`
6. 범위 확정 버튼을 누르면 `playbackRange`가 바뀌고 기존 adapter가 URL을 재생성한다.

### 서비스 및 데이터 흐름

- timeline은 화면 좌표를 날짜 시각으로 변환한다.
- `workAreaDraft`는 API 호출 없이 즉시 화면에 반영한다.
- 확정된 range만 `getCameraPlayback`에 전달한다.
- availability가 없는 MVP에서는 선택된 playback range를 available로 표시하고, 후속 API에서 실제 segment를 주입한다.

## 6. 데이터 및 계약 계획

### 필요한 데이터

- 선택 날짜
- day range 시작·종료
- work area 시작·종료
- playhead 시각 또는 초 단위 offset
- timeline segments, alarm events

### 계약

- 기존 `CameraPlaybackRange`와 `PlaybackSessionDto` 유지
- 기존 `timelineSegments`를 availability 입력으로 사용
- playback protocol은 `mp4` 유지

### Fixture/Mock 계획

- 검증 영상: `/playback/video6.mp4`
- 기본 선택 범위: 기존 30초 구간
- 하루 축은 availability segment가 없더라도 항상 표시

## 7. 테스트 및 검증 계획

- **단위/컴포넌트 테스트**: 시간↔좌표 변환, 핸들 최소 범위, 경계 clamp, pointer/keyboard 조작
- **통합 테스트**: 범위 확정 시 playback URL의 start/end 변경, 알람 marker 선택
- **E2E/수동 검증**: 24시간 축에서 범위 이동·리사이즈·재생·알람 이동
- **빌드/정적 검증**: 관련 Vitest와 `npm run build`
- **회귀 확인**: 실시간 탭, 기존 native MP4 재생, 기존 HLS/WebRTC 분기

## 8. 프로젝트 구조

```text
specs/028-editor-style-recording-player/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/playback.md
└── tasks.md

frontend/src/components/CameraFocus/
├── RecordingTimeline.tsx
├── RecordingControls.tsx
└── FocusVideoStage.tsx
```

**구조 결정**: 현재 화면에 이미 존재하는 recording 경계를 유지하고 timeline 상호작용만 전용 컴포넌트로 확장한다.

## 9. 헌법 체크

- **한국어 우선 산출물**: 통과. 문서와 UI 메시지를 한국어로 작성한다.
- **기존 구조 존중**: 통과. 기존 CameraFocus와 playback contract를 확장한다.
- **Mock-First MVP**: 통과. availability 운영 API와 파일 편집은 제외한다.
- **계약 우선**: 통과. 기존 playback DTO와 `timelineSegments`를 유지한다.
- **테스트 가능한 증분**: 통과. timeline 조작을 독립 컴포넌트 테스트로 검증한다.
- **로컬 개발 환경 전체 실행**: 통과. 구현 후 frontend 검증 및 관련 화면 수동 확인을 수행한다.

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| 드래그 중 재렌더링 | 핸들 끊김·지연 | drag 중 외부 요청 금지, 로컬 draft만 갱신 |
| 하루 경계와 timezone | 알람·영상 구간 불일치 | 사용자 로컬 날짜를 단일 좌표계로 사용 |
| 실제 availability 미제공 | 공백 구간을 정확히 표시하지 못함 | contract segment를 후속 API로 확장 |
| 기존 player와 timeline 상태 불일치 | 잘못된 seek 표시 | video timeupdate를 단일 playhead source로 사용 |

## 11. 복잡도 추적

| 결정 | 필요한 이유 | 더 단순한 대안을 거부한 이유 |
|------|-------------|-------------------------------|
| 전용 React timeline 구현 | 영상 검토 UX와 work area 조작이 도메인 특화됨 | 일반 calendar/timeline library는 스타일·상호작용을 다시 덧씌워야 함 |
### 줌 설계 추가

- 상단에는 항상 24시간 전체 개요를 유지한다.
- 하단 상세 타임라인은 현재 작업 구간 중심의 `viewRange`를 기준으로 렌더링한다.
- 줌 단계는 `1x, 2x, 4x, 8x, 16x, 32x, 64x`로 고정하고, 작업 구간의 중심을 기준으로 확대한다.
- 상세 타임라인의 클릭·드래그 좌표는 전체 날짜 좌표가 아닌 `viewRange`에 매핑한다.
- 외부 타임라인 라이브러리를 추가하지 않고 기존 React 컴포넌트와 시간축 모델을 확장한다.
- 작업 구간 길이는 시작·종료 핸들의 차이로 계산하고, 빠른 설정은 현재 중심을 유지한 채 길이만 변경한다.
- 알람 진입 시 60초 구간이 설정될 수 있지만 이는 초기 작업 구간일 뿐이며 사용자가 즉시 재조절할 수 있어야 한다.
- 작업 구간 우클릭 메뉴는 브라우저 기본 메뉴 대신 애플리케이션 메뉴로 제공하고, `HH:mm:ss` 시각 입력과 초 단위 길이 입력을 지원한다.
- 녹화 화면의 하단 알람 목록은 제거하고 영상·타임라인 영역의 가시 공간을 우선한다.
- 녹화 플레이어 높이는 고정 360px이 아니라 화면 높이 기반의 반응형 영역으로 구성해 영상 중심의 화면 비중을 유지한다.
- `RecordingControls`를 녹화 화면에서 제거하고 날짜 이동과 재생 버튼을 `RecordingTimeline` 헤더에 통합한다.
- 동일한 타임라인의 `viewRange`만 변경해 24시간 보기와 상세 확대 보기를 처리한다.
- 작업 구간 길이 입력은 프리셋과 직접 초 입력을 함께 제공하고, 적용 시 현재 구간 중심을 유지한다.
- 네이티브 날짜 입력을 사용해 달력 선택과 키보드 직접 입력을 함께 지원한다.
- 작업 구간 변경은 드래그 중 draft만 갱신하고, 포인터를 놓는 시점에 committed playback range를 갱신한다.
