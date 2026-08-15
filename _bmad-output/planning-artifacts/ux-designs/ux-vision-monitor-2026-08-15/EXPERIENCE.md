---
name: "Vision Monitor Camera Focus View"
status: final
sources:
  - "_bmad-output/planning-artifacts/prd-camera-focus-view.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-vision-monitor-2026-08-15/ARCHITECTURE-SPINE.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-vision-monitor-2026-08-15/BROWNFIELD-ARCHITECTURE.md"
updated: 2026-08-15
---

# Vision Monitor - 카메라 집중 보기 / 확대 보기 Experience Spine

## Foundation

단일 responsive web 운영 화면이다. 기본 대상은 1920x1080 이상의 관제/운영 모니터이며, 1366x768에서도 핵심 영상과 상태 판단 정보가 접근 가능해야 한다.

시각 기준은 `DESIGN.md`가 소유한다. 이 문서는 정보 구조, 동작, 상태, 접근성, 주요 흐름을 정의한다. 구현은 React Router 기반 route 상태를 따르며, MVP의 기본 route는 `/live/cameras/:cameraId?mode=live|recording&eventId={eventId}`다.

제품 경계는 architecture spine을 따른다. Vision Monitor는 외부 VMS/AI/Media Server가 제공하는 `streamUrl`, `playbackUrl`, 이벤트 메타데이터, 알람 상태를 표시한다. RTSP ingest, media distribution, AI inference, server-side overlay는 구현하지 않는다.

## Information Architecture

| Surface | Reached from | Purpose |
| --- | --- | --- |
| Live Grid | 기존 Live navigation | 여러 카메라 상태를 스캔하고 집중 보기 대상 선택 |
| Camera Focus - 실시간 | Grid tile click / `/live/cameras/:cameraId?mode=live` | 단일 카메라 실시간 영상과 현재 메타데이터 확인 |
| Camera Focus - 녹화 | Focus mode tab / `/live/cameras/:cameraId?mode=recording` | 녹화 영상, 타임라인, 이벤트 목록 확인 |
| Event-focused playback | Event row click / `eventId` query | 특정 이벤트 시각으로 녹화 이동, 우측 패널을 이벤트 상세로 전환 |
| Permission / failure state | 같은 route 내 영역별 fallback | 접근 불가, 영상 실패, 메타데이터 실패를 분리 표시 |

Camera Focus 화면 구성:

| 영역 | 내용 | MVP 우선순위 |
| --- | --- | --- |
| 상단 공정 탭 | `ALL`, `가열`, `압연`, `냉각`, `시험`, `정정` | 포함 |
| 경고 배너 | 활성 알람 메시지, 위치, 상태, 닫기 | 포함 |
| 하위 mode 탭 | `실시간`, `녹화` | 포함 |
| 대형 영상 영역 | live player 또는 playback player | 포함 |
| 우측 메타데이터 패널 | camera / event / alert mode | 포함 |
| 녹화 타임라인 | available/gap segment, 이벤트 marker, 현재 재생 위치 | 포함 |
| 이벤트 리스트 | 이벤트명, 발생 시각, 심각도, 상태, 공정/구역 | 포함 |

## Voice and Tone

운영 화면의 문구는 짧고 상태 중심이어야 한다. 판단을 유도하는 감정적 문구를 피하고, 원인과 다음 행동을 구분해 보여준다.

| Do | Don't |
| --- | --- |
| `영상을 불러오는 중입니다.` | `잠시만 기다려주세요!` |
| `이 카메라에 접근 권한이 없습니다.` | `권한 오류` |
| `메타데이터를 불러오지 못했습니다. 영상은 계속 표시됩니다.` | `데이터 로드 실패` |
| `[경고!] Entry Zone 치입불 발생 중` | `위험합니다! 즉시 확인하세요!` |
| `녹화 구간 없음` | `No data` |

## Component Patterns

| Component | Use | Behavioral rules |
| --- | --- | --- |
| Grid camera tile focus action | Live Grid | 타일 클릭 또는 명시적 확대 버튼으로 진입한다. drag 가능한 tile이면 drag handle과 focus click target을 분리한다. |
| Process tabs | Focus 상단 | 선택 시 같은 화면에서 공정 컨텍스트를 바꾼다. 현재 camera가 선택 공정에 속하지 않으면 카메라 선택 목록/컨텍스트를 갱신하되 임의로 다른 카메라를 자동 선택하지 않는다. |
| Mode tabs | Focus 상단 | `실시간`과 `녹화`를 전환한다. 선택 값은 URL query `mode`와 동기화한다. |
| Video stage | Focus 본문 | 실시간은 `streamUrl`, 녹화는 `playbackUrl`만 사용한다. loading, playing, interrupted, error, forbidden을 구분한다. |
| Metadata panel | 우측 | 기본은 camera mode. 활성 alert가 있으면 alert/event detail 우선. 녹화 이벤트 선택 시 event mode로 전환한다. |
| Alert banner | Focus 최상단 | 활성 알람이 있고 해당 `alertId`가 route session에서 닫히지 않았을 때 표시한다. 닫기는 UI 상태이며 서버 ACK가 아니다. |
| Recording timeline | 녹화 탭 | available/gap segment와 event marker를 같은 시간축에 표시한다. marker 선택은 event list 선택과 같은 상태를 공유한다. |
| Event list | 녹화 탭 | row 선택 시 `eventId` query를 갱신하고 player를 `occurredAt - preRollSeconds` 또는 `playbackHint.seekAt`으로 이동한다. |

## State Patterns

### 영상 실패

| State | Trigger | Treatment |
| --- | --- | --- |
| live loading | `/live-stream` 조회 중 또는 player mount 중 | video stage 중앙에 loading indicator와 `영상을 불러오는 중입니다.` 표시 |
| live interrupted | player가 재생 중 끊김 감지 | 영상 영역에 `연결이 불안정합니다.` 표시, 우측 metadata는 유지 |
| live error | `streamUrl` 없음, player 오류, 외부 URL 실패 | 영상 영역에 오류 상태와 재시도 버튼 표시 |
| playback error | `/playback` 실패 또는 playbackUrl 실패 | 녹화 player와 timeline 영역에 오류 표시, 이벤트 목록은 성공 시 유지 |
| recording gap | timeline segment `gap` | 해당 구간을 비활성 segment로 표시하고 seek 불가 |

### 메타데이터 실패

| State | Trigger | Treatment |
| --- | --- | --- |
| camera metadata error | `/focus` 실패 | 우측 패널에 `카메라 정보를 불러오지 못했습니다.` 표시. 영상 API가 성공하면 영상은 유지 |
| events error | `/events` 실패 | 이벤트 리스트 영역에 오류 표시. timeline은 playback segments가 있으면 유지 |
| alerts error | `/alerts/active` 실패 | 배너는 표시하지 않는다. 우측 패널에 작은 상태로 `알람 상태를 확인하지 못했습니다.` 표시 |
| missing metadata field | 외부 시스템이 field 미제공 | 값 위치에 `-` 또는 `정보 없음` 표시 |

### 권한 없음

권한 없음은 단순 오류와 다르게 다룬다. 401/403 또는 `status=forbidden`이면 영상 영역에 `이 카메라에 접근 권한이 없습니다.`를 표시한다. 제한된 camera/event metadata는 노출하지 않는다. 화면은 route shell을 유지하되, 카메라명처럼 허용된 최소 식별 정보만 표시한다.

권한 없음 상태에서 제공할 행동은 다음으로 제한한다.

| Action | Behavior |
| --- | --- |
| 뒤로가기 | 이전 Live Grid로 복귀 |
| 공정 탭 전환 | 접근 가능한 다른 공정 컨텍스트 탐색 |
| 새로고침 | 같은 route 재검증 |

### 알람/경고 배너

| State | Behavior |
| --- | --- |
| active alert 없음 | 배너 미표시, panel은 camera mode |
| active alert 있음 | 배너 표시, 관련 이벤트가 있으면 panel은 alert 또는 event detail 우선 |
| operator dismiss | `dismissedAlertIds`에 `alertId` 저장, 현재 route session에서 재표시 안 함 |
| 새 alertId 도착 | 닫힘 상태와 별개로 새 배너 표시 |
| alerts API 실패 | 배너 미표시, panel에 상태만 작게 표시 |

## Interaction Primitives

- Click/tap: Grid tile focus, tab 전환, event row 선택, alert 닫기.
- Keyboard: `Tab` 순서는 공정 탭 → mode 탭 → video controls → timeline → event list → metadata panel 순서다.
- Escape: alert banner focus 상태에서 닫기, panel 내 임시 popover 닫기.
- Arrow keys: 탭 그룹과 이벤트 리스트 row 탐색에 사용한다.
- Enter/Space: 현재 focus된 탭, 버튼, 이벤트 row 실행.
- Back navigation: Grid에서 진입한 경우 이전 Grid 화면으로 돌아간다. 직접 URL 진입이면 app의 Live Grid 기본 화면으로 fallback할 수 있다.

금지할 상호작용:

| Pattern | Reason |
| --- | --- |
| hover-only 확대 진입 | 터치/키보드 접근성과 운영 안정성이 낮다. |
| route 밖 임시 modal만으로 focus view 구현 | 새로고침 복원, event deep link, 뒤로가기 요구사항을 만족하기 어렵다. |
| 영상 실패 시 전체 화면 오류 | architecture AD-5와 PRD NFR-3에 위배된다. |
| alert 닫기를 서버 acknowledge로 처리 | MVP의 배너 닫힘은 화면 세션 UI 상태다. |

## Accessibility Floor

- WCAG 2.2 AA를 목표로 한다. 대비 기준은 `DESIGN.md` 색상 토큰에서 보장한다.
- 모든 아이콘 버튼은 accessible name을 가진다. 예: `경고 배너 닫기`, `녹화 재시도`.
- 탭은 `role=tablist`, `role=tab`, `aria-selected`를 사용한다.
- 영상 상태 변화는 필요한 경우 `aria-live=polite`로 알린다. 경고 배너는 `role=alert` 또는 동등한 라이브 영역을 사용한다.
- 이벤트 리스트는 row 선택 상태를 screen reader가 알 수 있어야 한다.
- 키보드만으로 실시간/녹화 전환, 이벤트 선택, alert 닫기, 뒤로가기가 가능해야 한다.
- 타임라인 event marker는 색상만으로 구분하지 않는다. marker에 시간/이벤트명을 accessible label로 제공한다.
- 영상 자동 재생이 실패해도 controls와 오류 문구가 keyboard focus로 접근 가능해야 한다.

## Responsive & Platform

| Viewport | Layout behavior |
| --- | --- |
| 1920x1080 이상 | 본문 2-column. 대형 영상 영역은 가능한 최대 폭, 우측 패널 360-420px 고정 폭. 녹화 타임라인은 영상 하단, 이벤트 리스트는 우측 패널 하단 또는 영상 아래 보조 영역. |
| 1366x768 | 본문 2-column 유지. 우측 패널은 320px까지 축소. 이벤트 리스트는 녹화 탭에서 접힘 가능한 영역으로 제공. |
| 1024px 미만 | 우측 패널을 영상 아래로 이동. camera/event/alert 정보를 panel 내부 탭으로 전환. |
| Mobile | 운영 주 표면은 아니지만 열람 가능해야 한다. video → tabs → metadata → events 순서의 단일 column. |

## Key Flows

### Flow 1 - Live Grid에서 실시간 집중 보기

1. 운영자 민수는 Live Grid에서 전체 공정 카메라를 스캔한다.
2. Entry Zone CAM-01 타일에서 이상 징후를 보고 타일의 확대 액션을 실행한다.
3. 화면은 `/live/cameras/1?mode=live`로 이동한다.
4. 대형 영상 영역은 즉시 loading 상태를 표시하고, 우측 패널은 카메라명, 공정, 구역, 라인, 현재 상태를 불러온다.
5. 활성 알람이 있으면 상단 경고 배너가 표시된다.
6. **Climax:** 민수는 대형 영상과 우측 이벤트 메타데이터를 동시에 보며 지금 조치가 필요한 카메라인지 판단한다.

Failure: 영상 로딩이 실패해도 우측 패널은 유지한다. 패널 실패 시 영상은 계속 표시한다.

### Flow 2 - 실시간에서 녹화 이벤트 확인

1. 운영자 지연은 집중 보기 화면에서 경고 배너를 확인한다.
2. `녹화` 탭을 선택한다.
3. 화면은 `/live/cameras/1?mode=recording`으로 갱신되고 playback session, timeline, events를 불러온다.
4. 이벤트 리스트에서 `[경고] Entry Zone 치입불 발생` row를 선택한다.
5. URL에 `eventId=50001`이 반영되고 player는 이벤트 발생 시각의 pre-roll 지점으로 이동한다.
6. 우측 패널은 이벤트 상세 mode로 바뀌며 제어 대응 현황, 소재 정보, 냉각 코드, 속도, 유지 시간을 표시한다.
7. **Climax:** 지연은 이벤트 전후 영상을 보며 알람 원인과 설비 상태를 한 화면에서 대조한다.

Failure: 녹화 playbackUrl이 실패하면 이벤트 리스트와 상세 패널은 유지하고, 영상 영역에 재시도 상태를 표시한다.

### Flow 3 - 권한 없는 카메라 접근

1. 운영자 현우는 공유받은 URL `/live/cameras/22?mode=live`를 연다.
2. API가 403 또는 `forbidden` 상태를 반환한다.
3. video stage는 권한 없음 상태를 표시한다.
4. 우측 패널은 제한된 정보를 숨기고, 접근 가능한 최소 안내와 뒤로가기 행동만 제공한다.
5. **Climax:** 현우는 문제가 시스템 오류인지 권한 문제인지 즉시 구분하고 이전 Grid로 돌아간다.

## MVP Screen Composition

MVP 첫 화면은 실제 기능 화면이어야 하며 별도 landing/설명 화면을 만들지 않는다.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 공정 탭: ALL | 가열 | 압연 | 냉각 | 시험 | 정정                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ [경고!] Entry Zone 치입불 발생 중                         [닫기]              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 실시간 | 녹화                                                               │
├───────────────────────────────────────────────┬─────────────────────────────┤
│                                               │ Camera / Event / Alert       │
│              대형 영상 영역                    │ Metadata Panel               │
│        live stream 또는 playback player        │                             │
│                                               │ - 카메라명                    │
│                                               │ - 공정/구역/라인              │
│                                               │ - 상태/최근 이벤트            │
├───────────────────────────────────────────────┤                             │
│ 녹화 탭: 타임라인 + 이벤트 marker              │ 녹화 탭: 이벤트 리스트         │
└───────────────────────────────────────────────┴─────────────────────────────┘
```

MVP 포함:

| UX area | MVP behavior |
| --- | --- |
| Grid 진입 | 타일 클릭 또는 명시적 확대 버튼으로 route 이동 |
| 실시간 탭 | `streamUrl` 기반 대형 영상, camera metadata, active alert |
| 녹화 탭 | `playbackUrl`, timeline, event marker, event list |
| 우측 패널 | camera / event / alert mode |
| 경고 배너 | 활성 알람 표시, 수동 닫기, route session 닫힘 유지 |
| 실패 상태 | 영상 실패, metadata 실패, events 실패, alerts 실패, 권한 없음 분리 |
| URL 복원 | `cameraId`, `mode`, `eventId` 복원 |

MVP 제외:

| UX area | Reason |
| --- | --- |
| 다중 카메라 비교 집중 보기 | 단일 카메라 focus의 route/state/panel 패턴 이후 확장 |
| PTZ 제어 | 외부 VMS command 권한과 audit UX 필요 |
| AI overlay toggle | 외부 overlay/source sync 정책 필요 |
| 알람 서버 ACK/조치 workflow | 배너 닫힘과 운영 확인 이력을 분리해야 함 |
| 운영자별 레이아웃 저장 | 사용자 preference persistence 필요 |
| SSE/WebSocket push | polling/refetch MVP 이후 실시간 갱신으로 확장 |

## Follow-On UX Extensions

| Extension | UX direction |
| --- | --- |
| 다중 카메라 비교 보기 | route에 cameraId list를 도입하고, 대형 primary camera + 보조 camera strip 또는 2-up 비교 layout 제공 |
| PTZ 제어 | 영상 영역 위 floating control이 아니라 우측 패널의 명시적 `PTZ` mode로 제공. 권한, 조작 중 상태, 실패, audit 문구 필요 |
| AI detection overlay | overlay on/off, event type filter, confidence 표시를 영상 control bar 근처에 추가. 영상 원본과 overlay source의 시간 동기화 상태를 표시 |
| 이벤트 북마크/코멘트 | event detail panel에 comment stream과 bookmark action 추가. 목록 row에는 comment count만 표시 |
| 이벤트 확인/조치 이력 | 배너 닫기와 별도로 `확인`, `조치 중`, `완료` 상태 전이를 제공. 서버 ACK와 audit trail 필요 |
| 알람 push | SSE/WebSocket 연결 상태를 작게 표시하고, 새 alertId 도착 시 닫힌 배너와 별개로 새 배너 표시 |
| 공정별 메타데이터 템플릿 | `가열`, `압연`, `냉각`별 panel field schema를 서버에서 받아 우선순위와 라벨을 변경 |
| 키보드 운영 UX | `g l` Live Grid, `1-6` 공정 탭, `r` 녹화, `l` 실시간, `j/k` 이벤트 row 이동 같은 단축키를 도움말 dialog와 함께 제공 |
| 외부 VMS deep link | event detail에 `VMS에서 열기` secondary action 추가. 현재 시간/카메라 context를 외부 URL에 전달 |

## Implementation Notes for UX Handoff

- route 기반 focus view가 기본이다. modal-only 확대 보기는 MVP 요구사항의 새로고침 복원과 event deep link에 약하다.
- `camera`, `liveStream`, `playback`, `events`, `alerts` 상태는 독립 로딩/오류로 모델링한다.
- 영상 영역 fallback은 항상 video stage 내부에서 처리한다.
- 우측 패널은 data shape가 달라도 shell을 유지한다. panel mode만 camera/event/alert로 전환한다.
- alert banner dismiss는 `alertId + route session` 단위 client state다.
- 모든 시간 표시는 서버 기준 ISO-8601을 Asia/Seoul 표시 정책으로 일관 변환한다.
