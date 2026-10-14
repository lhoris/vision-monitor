# 모델 관리 대개편 데이터 모델

## 설계 원칙

- 모든 테이블의 표준 Audit 컬럼을 가장 앞에 배치한다.
- 테이블 사이의 관계는 논리적으로만 관리하며 물리적 FK 제약조건을 추가하지 않는다.
- 이번 1차 화면 개편에서는 기존 모델 관리 테이블을 재사용할 수 있는지 먼저 검토하고, 신규 테이블은 Agent 계약이 확정된 뒤 추가한다.

## 논리 엔티티

### VM 운영 대상

| 필드 | 설명 |
|---|---|
| vmId | VM 식별자 |
| vmName | 화면 표시용 VM 이름 |
| hostAddress | VM 주소 또는 호스트명 |
| connectionStatus | 연결 상태 |
| lastHeartbeatAt | 마지막 상태 갱신 시각 |
| processCount | VM에 배치된 프로세스 수 |
| processes | 하위 AI 모델 프로세스 목록 |

### AI 모델 프로세스

| 필드 | 설명 |
|---|---|
| processId | 프로세스 식별자 |
| vmId | 논리적 VM 참조 |
| processName | Python 프로세스 이름 |
| modelName | AI 모델 이름 |
| processArea | 공정 또는 업무 영역 |
| pythonProjectPath | Python 프로젝트 경로 |
| processStatus | 실제 프로세스 상태 |
| controlRequestStatus | 최근 제어 요청 상태 |
| lastStatusAt | 마지막 상태 갱신 시각 |
| enabled | 관리 대상 활성화 여부 |

### 제어 요청

| 필드 | 설명 |
|---|---|
| requestId | 요청 식별자 |
| processId | 논리적 프로세스 참조 |
| action | START, STOP, RESTART |
| requestStatus | REQUESTED, RUNNING, SUCCEEDED, FAILED, TIMEOUT |
| requestedBy | 요청 사용자 |
| requestedAt | 요청 시각 |
| completedAt | 완료 시각 |
| resultMessage | 처리 결과 메시지 |

### 모델 운영 이벤트 로그

`TB_M26_MODEL_EVENT_LOG`는 모델 프로세스의 등록·설정·제어·상태 변화를 append-only로 보존하는 이력 엔티티다. `MODEL_PROCESS_ID`는 논리적 참조만 유지하고 물리적 FK는 생성하지 않는다.

| 필드 | 설명 |
|---|---|
| modelEventLogId | 이벤트 로그 식별자 |
| modelProcessId | 대상 모델 프로세스 식별자 |
| occurredTimestamp | 이벤트 발생 시각 |
| severity | `INFO`, `WARNING`, `ERROR` |
| eventType | `MODEL_REGISTERED`, `MODEL_SETTINGS_CHANGED`, `CONTROL_REQUESTED`, `COMMAND_PROCESSING`, `CONTROL_COMPLETED`, `CONTROL_FAILED`, `PROCESS_STATUS_CHANGED`, `MONITORING_STATUS_CHANGED` |
| message | 운영자가 읽을 수 있는 이벤트 내용 |
| detectionSummary | 처리 결과 또는 상태 상세 |
| eventSource | 현재 스키마에서는 `CREATED_OBJECT_TYPE`으로 기록하며 `U`, `A`, `S`를 사용 |
| eventActorId | 현재 스키마에서는 `CREATED_OBJECT_ID` 또는 `CREATED_PROGRAM_ID`로 기록 |
| commandId | 현재 스키마에 전용 컬럼이 없으므로 `DETECTION_SUMMARY`에 기록 |

이벤트 로그는 등록·설정 변경·제어 요청 시 Backend가 기록하고, 명령 처리 및 상태 변경 시 Agent가 기록한다. 동일 명령의 동일 단계는 `COMMAND_ID + EVENT_TYPE` 조합을 `DETECTION_SUMMARY`에서 확인하여 중복 기록하지 않는다. 향후 전용 컬럼을 추가할 경우에도 이 논리 계약은 유지한다.

## 상태 전이

- 프로세스 상태: `RUNNING`, `STOPPED`, `STARTING`, `STOPPING`, `RESTARTING`, `ERROR`, `UNKNOWN`
- 제어 요청 상태: `REQUESTED` -> `RUNNING` -> `SUCCEEDED` 또는 `FAILED`/`TIMEOUT`
- 실제 Agent가 보고한 프로세스 상태와 제어 요청 상태는 서로 덮어쓰지 않는다.
