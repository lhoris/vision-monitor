# 구현 계획: 모델 프로세스 Agent 명령 큐

**대상 명세**: [agent-command-queue-spec.md](./agent-command-queue-spec.md)

## 1. 목표

모델 관리 화면의 시작, 중지, 재시작 요청을 DB 명령 큐에 등록하고, VM Agent가 자신의 명령을 polling하여 Python 프로젝트의 배치 파일을 실행하도록 전환한다. Agent는 실행 결과와 주기적인 프로세스 점검 결과를 각각 DB에 반영한다.

## 2. 현재 구조와 변경 방향

현재는 `ModelProcessService.control()`이 `TB_M26_MODEL_PROCESS.PROCESS_STATUS`를 직접 변경한다. 이 동작을 제거하고, Backend는 `TB_M26_MODEL_COMMAND`에 `REQUESTED` 명령만 등록한다.

```text
현재: 화면 -> Backend -> MODEL_PROCESS 상태 직접 변경
변경: 화면 -> Backend -> MODEL_COMMAND 등록 -> Agent 실행 -> 상태 보고
```

## 3. 설계 결정

- 명령 큐 테이블명은 `TB_M26_MODEL_COMMAND`로 한다.
- Audit 컬럼은 업무 컬럼보다 앞에 둔다.
- `MODEL_PROCESS_ID`는 논리적 참조만 사용하며 FK는 생성하지 않는다.
- VM 테이블은 만들지 않고 `TARGET_SERVER_IP`로 Agent의 대상 VM을 구분한다.
- 명령 상태와 실제 프로세스 상태를 분리한다.
- Agent는 `REQUESTED` 명령을 원자적으로 `PROCESSING`으로 선점한 뒤 실행한다.
- 실제 `PROCESS_STATUS`는 Agent의 프로세스 점검 결과로만 확정한다.
- 1차 구현은 DB polling이며 메시지 브로커는 도입하지 않는다.

## 4. 데이터 설계

### 명령 엔티티

주요 업무 컬럼은 다음과 같다.

| 컬럼 | 내용 |
|---|---|
| `MODEL_COMMAND_ID` | 명령 PK |
| `MODEL_PROCESS_ID` | 대상 프로세스 논리 참조 |
| `TARGET_SERVER_IP` | 명령 대상 VM |
| `COMMAND_TYPE` | `START`, `STOP`, `RESTART` |
| `COMMAND_STATUS` | `REQUESTED`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `TIMEOUT` |
| `REQUESTED_BY` | 요청 사용자 |
| `REQUESTED_TIMESTAMP` | 요청 시각 |
| `CLAIMED_TIMESTAMP` | Agent 선점 시각 |
| `PROCESSED_TIMESTAMP` | 처리 완료 시각 |
| `AGENT_ID` | 처리 Agent |
| `RESULT_CODE` | 결과 코드 |
| `RESULT_MESSAGE` | 결과 메시지 |
| `RETRY_COUNT` | 재시도 횟수 |

### 상태 책임

- `MODEL_COMMAND.COMMAND_STATUS`: 개별 제어 요청의 처리 상태
- `MODEL_PROCESS.PROCESS_STATUS`: Agent가 확인한 Python 프로세스의 실제 상태
- `MODEL_PROCESS.MONITORING_STATUS`: Agent heartbeat 기반 모니터링 상태
- `MODEL_PROCESS.CONTROL_STATUS`: 최근 제어 연동 결과 요약

## 5. Backend 설계

1. Flyway migration으로 명령 테이블을 생성한다.
2. 명령 등록 service를 추가한다.
3. 기존 제어 API는 명령 접수 결과를 반환한다.
4. Agent는 DB에서 대상 IP와 `REQUESTED` 조건으로 명령을 polling한다.
5. Agent는 DB에서 명령을 `PROCESSING`으로 원자적으로 선점한다.
6. Agent는 실행 결과와 처리 시각을 DB에 직접 기록한다.
7. Agent는 heartbeat와 Python 프로세스 상태를 DB에 직접 반영한다.
8. timeout job 또는 조회 시 timeout 판정으로 장기 미처리 명령을 종료한다.

## 6. Agent 계약

Agent는 다음 LOOP를 수행한다.

```text
heartbeat 기록
-> 대상 VM의 REQUESTED 명령 조회
-> 명령 선점
-> run.bat / stop.bat / restart.bat 실행
-> 명령 결과 보고
-> 모든 활성 Python 프로세스 상태 점검
-> MODEL_PROCESS 상태 보고
-> polling 주기 대기
```

선점에 실패한 명령은 실행하지 않는다. 배치 파일의 존재 여부, 종료 코드, 실행 오류를 결과에 기록한다.

## 7. Frontend 설계

- 제어 버튼은 명령 접수 상태를 표시한다.
- 실제 프로세스 상태는 Agent 상태 조회 결과로 표시한다.
- 접수 성공을 프로세스 실행 성공으로 표현하지 않는다.
- `PROCESSING`, `TIMEOUT`, `FAILED` 상태를 사용자가 구분할 수 있어야 한다.
- 새로고침 후에도 DB의 명령 상태와 실제 프로세스 상태를 다시 조회한다.

## 8. 테스트 및 검증

- migration 적용 및 기본 데이터 조회
- 명령 등록과 유효하지 않은 명령 거부
- 동일 프로세스 중복 명령 방지
- 명령 선점 경쟁 상황
- 명령 성공, 실패, timeout
- Agent heartbeat 중단
- 프로세스 상태 실행 중, 중지, 오류 보고
- 기존 모델 관리 화면 회귀 테스트
- Backend 테스트와 Frontend 테스트, production build

## 9. 단계적 적용

1. 명령 테이블과 계약을 추가한다.
2. Agent가 직접 DB를 polling하고 상태를 갱신하는 실행 규칙을 확정한다.
3. Backend 제어 API를 명령 등록 방식으로 전환한다.
4. Frontend 상태 표시를 명령 상태와 실제 상태로 분리한다.
5. 기존 직접 상태 변경 로직을 제거한다.
6. 폐쇄망 환경을 가정한 polling, timeout, 재시작 검증을 수행한다.

## 10. 위험 관리

| 위험 | 대응 |
|---|---|
| 명령 중복 실행 | 선점 성공 여부 확인 후 실행 |
| Agent 실행 중단 | `PROCESSING` timeout 및 재처리 정책 |
| 배치 성공 후 프로세스 미기동 | 후속 상태 점검 결과를 최종 상태로 사용 |
| 오래된 상태 표시 | heartbeat 기준 모니터링 상태 별도 표시 |
