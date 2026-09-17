# 데이터 모델: 모델 관리

## ProcessArea

공정 다중 선택 필터의 항목이다.

| 필드 | 타입 | 설명 | 검증 |
|------|------|------|------|
| `id` | string | 공정 식별자. 예: `all`, `heating`, `rolling` | 필수 |
| `name` | string | 화면 표시명. 예: ALL, 가열, 압연 | 필수 |
| `sortOrder` | number | 표시 순서 | 0 이상 |
| `isAll` | boolean | 전체 조회 옵션 여부 | `ALL`만 true |

## ModelProcess

모델 관리 그리드의 한 행이다.

| 필드 | 타입 | 설명 | 검증 |
|------|------|------|------|
| `id` | string | 모델 프로세스 식별자 | 필수 |
| `processId` | string | 소속 공정 ID | `ProcessArea.id` 참조 |
| `processName` | string | 소속 공정 표시명 | 필수 |
| `modelName` | string | 모델명 | 필수 |
| `automationName` | string | 조업 자동화 기술명 | 필수 |
| `serverIp` | string | 모델 서버 IP | 필수, IP 형식 권장 |
| `pythonProjectPath` | string | Python 프로젝트 경로 | 필수 |
| `processStatus` | `running` \| `stopped` \| `error` \| `restarting` \| `unknown` | 모델 프로세스 조작 상태 | 필수 |
| `monitoringStatus` | `normal` \| `failed` \| `checking` \| `unknown` | Python 프로세스 alive DB 상태 | 필수 |
| `controlStatus` | `normal` \| `failed` \| `checking` \| `unknown` | 제어 연동 통신 DB 상태 | 필수 |
| `lastStatusAt` | string | 최근 상태 갱신 시각 | 선택 |
| `description` | string | 비고 또는 설명 | 선택 |

## ModelEventLog

이벤트 로그 팝업에서 조회하는 단순 로그 항목이다.

| 필드 | 타입 | 설명 | 검증 |
|------|------|------|------|
| `id` | string | 로그 식별자 | 필수 |
| `modelProcessId` | string | 관련 모델 프로세스 ID | 필수 |
| `occurredAt` | string | 발생 시각 | 필수 |
| `severity` | `info` \| `warning` \| `error` | 로그 등급 | 필수 |
| `message` | string | 로그 메시지 | 필수 |
| `detectionSummary` | string | 감지 결과 요약 | 선택 |

## ModelSettingsInput

모델 설정 수정 입력값이다.

| 필드 | 타입 | 설명 | 검증 |
|------|------|------|------|
| `serverIp` | string | 모델 서버 IP | 필수 |
| `pythonProjectPath` | string | Python 프로젝트 경로 | 필수 |

## ModelCreateInput

신규 모델 추가 입력값이다.

| 필드 | 타입 | 설명 | 검증 |
|------|------|------|------|
| `processId` | string | 공정 ID | 필수 |
| `modelName` | string | 모델명 | 필수 |
| `automationName` | string | 조업 자동화 기술명 | 필수 |
| `serverIp` | string | 모델 서버 IP | 필수 |
| `pythonProjectPath` | string | Python 프로젝트 경로 | 필수 |

## 상태 전이

### ProcessStatus

```text
stopped --start--> running
running --stop--> stopped
running --restart--> restarting --> running
error --restart--> restarting --> running
unknown --start/restart--> running
```

### 공정 선택 상태

```text
초기 상태: selectedProcessIds = ["all"]

전공정 클릭:
  selectedProcessIds = ["all"]

전공정 상태에서 개별 공정 클릭:
  selectedProcessIds = ["all"]

개별 공정 모드에서 공정 추가:
  selectedProcessIds = [...기존, processId]

개별 공정 모드에서 마지막 공정 해제:
  selectedProcessIds = ["all"]
```
