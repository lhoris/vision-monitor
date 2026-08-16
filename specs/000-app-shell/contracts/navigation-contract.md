# 계약: Navigation

## 목적

왼쪽 사이드바가 제공하는 일반 메뉴, 관리자 메뉴, 활성 상태 판단 규칙을 정의한다.

## 일반 메뉴

| Path | Label key | 의미 |
|------|-----------|------|
| `/live` | `navigation.live` | 라이브 대시보드 |
| `/playback` | `navigation.playback` | 녹화 화면 |
| `/events` | `navigation.events` | 이벤트 화면 |

## 관리자 메뉴

### 통신 및 모델 수정

| Path | Label key | 의미 |
|------|-----------|------|
| `/admin/monitoring-communication` | `navigation.admin.monitoringCommunication` | 모니터링 통신 현황 |
| `/admin/control-communication` | `navigation.admin.controlCommunication` | 제어 연동 통신 현황 |
| `/admin/external-addresses` | `navigation.admin.externalAddresses` | 기타 주소 설정 현황 |
| `/admin/model-restart` | `navigation.admin.modelRestart` | 모델 재가동 |
| `/admin/video-models/new` | `navigation.admin.videoModelCreate` | 영상 모델 추가 |

### 접속 권한 관리

| Path | Label key | 의미 |
|------|-----------|------|
| `/admin/users` | `navigation.admin.users` | 사용자 관리 |
| `/admin/roles` | `navigation.admin.roles` | 역할 관리 |
| `/admin/permission-policies` | `navigation.admin.permissionPolicies` | 권한 정책 관리 |
| `/admin/menu-access` | `navigation.admin.menuAccess` | 메뉴 접근 권한 관리 |

## 제외 메뉴

| 메뉴 | 처리 |
|------|------|
| 화면 수정 | 사이드바에서 제공하지 않음 |
| 공정 추가 | 라이브 대시보드 내부 편집 기능으로 이동 |
| 세부 공정 수정 | 라이브 대시보드 내부 편집 기능으로 이동 |
| 화면 배치 수정 | 라이브 대시보드 내부 편집 기능으로 이동 |

## 활성 상태

- 현재 route path가 메뉴 path와 정확히 일치하면 해당 메뉴를 활성 상태로 표시한다.
- `/live/cameras/{cameraId}` 같은 상세 route의 활성 메뉴 표시 정책은 후속 UX 조정 대상이다.
- `/admin/*` 상세 route는 관리자 메뉴 그룹 안에서 활성 상태를 표시할 수 있어야 한다.

## 사이드바 동작

- 상단바 toggle로 열린다.
- overlay 클릭으로 닫힌다.
- 작은 화면에서는 메뉴 선택 후 닫힌다.
- 관리자 권한이 있는 사용자에게만 관리자 메뉴 그룹과 하위 메뉴를 표시한다.
- 관리자 권한이 없는 사용자에게는 관리자 메뉴 그룹과 하위 메뉴를 표시하지 않는다.
- 관리자 route 직접 접근 제한 정책은 후속 권한 기능에서 상세화한다.
