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

## 상태 전이

- 프로세스 상태: `RUNNING`, `STOPPED`, `STARTING`, `STOPPING`, `RESTARTING`, `ERROR`, `UNKNOWN`
- 제어 요청 상태: `REQUESTED` -> `RUNNING` -> `SUCCEEDED` 또는 `FAILED`/`TIMEOUT`
- 실제 Agent가 보고한 프로세스 상태와 제어 요청 상태는 서로 덮어쓰지 않는다.
