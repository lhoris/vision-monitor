---
name: "Vision Monitor Camera Focus View"
status: final
sources:
  - "_bmad-output/planning-artifacts/prd-camera-focus-view.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-vision-monitor-2026-08-15/ARCHITECTURE-SPINE.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-vision-monitor-2026-08-15/BROWNFIELD-ARCHITECTURE.md"
updated: 2026-08-15
colors:
  surface-base: "#101418"
  surface-panel: "#171D22"
  surface-raised: "#20272E"
  surface-subtle: "#27313A"
  ink-primary: "#F4F7FA"
  ink-secondary: "#B8C2CC"
  ink-muted: "#7F8C99"
  border-default: "#33404A"
  focus-ring: "#5DA9E9"
  status-live: "#45C48A"
  status-warning: "#F2C14E"
  status-critical: "#E35D5B"
  status-offline: "#8A96A3"
  timeline-event: "#5DA9E9"
typography:
  page-title:
    fontFamily: "Inter, Pretendard, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: "600"
    lineHeight: "1.3"
    letterSpacing: "0"
  section-title:
    fontFamily: "Inter, Pretendard, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: "600"
    lineHeight: "1.35"
    letterSpacing: "0"
  body:
    fontFamily: "Inter, Pretendard, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: "400"
    lineHeight: "1.45"
    letterSpacing: "0"
  meta:
    fontFamily: "Inter, Pretendard, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: "400"
    lineHeight: "1.35"
    letterSpacing: "0"
rounded:
  sm: 4px
  md: 6px
  lg: 8px
spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "5": 24px
  "6": 32px
components:
  video-stage:
    background: "{colors.surface-base}"
    border: "1px solid {colors.border-default}"
    radius: "{rounded.md}"
  metadata-panel:
    background: "{colors.surface-panel}"
    border: "1px solid {colors.border-default}"
    radius: "{rounded.md}"
  alert-banner-warning:
    background: "{colors.status-warning}"
    foreground: "#211A05"
    radius: "{rounded.sm}"
  status-badge-live:
    background: "{colors.status-live}"
    foreground: "#071B12"
    radius: "{rounded.sm}"
---

# Vision Monitor Camera Focus View - Design Spine

## Brand & Style

Vision Monitor의 카메라 집중 보기는 운영자가 여러 화면을 오가며 추론하지 않아도 현재 카메라의 영상, 상태, 이벤트 맥락을 한눈에 확인하는 작업형 화면이다. 시각 언어는 관제실과 제조 설비 운영 환경에 맞춘다. 장식보다 판독성, 강조보다 위계, 넓은 영상 영역과 촘촘한 메타데이터 스캔을 우선한다.

이 디자인은 마케팅 페이지가 아니라 반복 운영 도구다. 화면의 중심은 항상 영상이고, 색상은 상태와 위험을 구분하는 데에만 사용한다.

## Colors

- **Base surface (`{colors.surface-base}`)**: 대형 영상 주변과 전체 배경. 영상 프레임을 방해하지 않는 어두운 바탕.
- **Panel surface (`{colors.surface-panel}`)**: 우측 메타데이터 패널, 이벤트 리스트, 보조 영역.
- **Raised surface (`{colors.surface-raised}`)**: 탭, 리스트 row hover, 선택 row.
- **Primary ink (`{colors.ink-primary}`)**: 핵심 제목, 카메라명, 이벤트명.
- **Secondary ink (`{colors.ink-secondary}`)**: 필드 값, 상태 설명, 시간.
- **Muted ink (`{colors.ink-muted}`)**: 빈 값, 보조 라벨, 비활성 제어.
- **Live green (`{colors.status-live}`)**: 재생 중, 온라인, 정상.
- **Warning yellow (`{colors.status-warning}`)**: 활성 경고 배너와 warning severity.
- **Critical red (`{colors.status-critical}`)**: 치명 오류, critical severity, 재생 불가.
- **Timeline blue (`{colors.timeline-event}`)**: 녹화 타임라인 이벤트 marker와 선택 위치.

색상은 단일 hue 장식으로 쓰지 않는다. 노란색은 알람/경고 인지, 초록색은 정상 재생/온라인, 빨간색은 치명 오류에만 사용한다.

## Typography

운영 화면의 기본 글꼴은 `Inter, Pretendard, system-ui, sans-serif`다. 숫자, 시간, 카메라 ID, 이벤트 ID가 섞이는 화면이므로 장식 서체를 쓰지 않는다.

화면 내부 제목은 작고 명확해야 한다. `page-title`은 페이지 헤더와 선택 카메라명에만 사용한다. 패널 섹션 제목은 `section-title`, 일반 필드와 리스트는 `body`, 시각/ID/보조 설명은 `meta`를 사용한다.

## Layout & Spacing

기본 spacing scale은 4px 기반이다. 대형 운영 모니터 기준으로 한 화면에서 영상과 우측 데이터를 동시에 보는 것이 우선이다.

- 전체 shell: 상단 공정 탭, 경고 배너 영역, 실시간/녹화 탭, 본문 2-column.
- 본문 desktop 기준: 영상 영역 1fr, 우측 패널 360-420px.
- 1366x768: 우측 패널 최소 320px, 이벤트 리스트는 녹화 탭에서 접거나 하단 split으로 유지.
- 1024px 미만: 우측 패널은 영상 아래로 내려가며 탭 또는 accordion으로 camera/event/alert 정보를 전환한다.

## Elevation & Depth

깊이는 그림자보다 면과 border로 표현한다. 영상 영역, 패널, 리스트는 `1px` border와 surface tone 차이로 구분한다. shadow는 floating dialog가 필요한 후속 UX에서만 사용한다.

## Shapes

도구형 화면이므로 radius는 작게 유지한다. 영상 영역과 패널은 `{rounded.md}`, 경고 배너와 상태 badge는 `{rounded.sm}`를 사용한다. 과도한 pill 형태는 상태 badge처럼 짧은 텍스트에만 제한한다.

## Components

- **Video stage**: `{components.video-stage}`. 항상 화면의 시각 중심. 로딩/오류/권한 없음 상태도 같은 영역 안에서 표시한다.
- **Metadata panel**: `{components.metadata-panel}`. camera, event, alert mode를 같은 panel shell 안에서 교체한다.
- **Alert banner**: `{components.alert-banner-warning}`. 활성 경고가 있을 때 탭과 본문보다 위에 표시한다. 닫기 버튼은 아이콘 버튼이며, 닫힘은 현재 route session에만 적용한다.
- **Process tabs**: 공정 필터. 선택된 탭은 surface-raised와 focus-ring으로 구분한다.
- **Mode tabs**: 실시간/녹화 전환. URL query `mode`와 동기화되는 primary navigation이다.
- **Timeline**: 녹화 탭 전용. available/gap segment와 event marker를 같은 축에 표시한다.
- **Event list row**: 이벤트명, severity, 발생 시각, 상태를 한 줄 스캔 가능하게 표시한다. 선택 row는 timeline marker와 같은 `{colors.timeline-event}` 계열 강조를 사용한다.

## Do's and Don'ts

| Do | Don't |
| --- | --- |
| 영상 영역을 가장 크게 유지한다. | 메타데이터 패널이나 카드 장식이 영상보다 시각적으로 강해지게 하지 않는다. |
| 상태 색상은 의미에만 사용한다. | 노란색/초록색/빨간색을 장식 색으로 반복하지 않는다. |
| 영상 실패와 메타데이터 실패를 각 영역 안에서 분리 표시한다. | 하나의 API 실패로 전체 화면을 빈 오류 페이지로 바꾸지 않는다. |
| 시간, 상태, ID는 작은 글씨라도 충분한 대비를 유지한다. | 낮은 대비의 회색 텍스트로 운영 판단 정보를 숨기지 않는다. |
| 탭, 리스트, 버튼은 keyboard focus가 명확해야 한다. | hover-only affordance에 핵심 행동을 의존하지 않는다. |
