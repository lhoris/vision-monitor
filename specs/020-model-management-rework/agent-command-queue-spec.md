# 모델 프로세스 Agent 명령 큐 명세

## 문서 목적

모델 관리 화면에서 요청한 시작, 중지, 재시작 명령을 DB에 저장하고, 각 VM에서 동작하는 Agent가 자신의 명령을 주기적으로 조회하여 Python 모델 프로세스를 제어하는 흐름을 정의한다.

이 문서는 `spec.md`의 모델 프로세스 제어 요구사항을 구체화하는 보완 명세서다.

## 핵심 목표

- 관리자의 제어 요청과 실제 Python 프로세스 상태를 분리한다.
- Backend는 제어 요청을 명령 큐에 등록하고, 원격 VM의 프로세스를 직접 실행하지 않는다.
- VM Agent는 자기 VM에 해당하는 미처리 명령을 주기적으로 조회한다.
- Agent는 Python 프로젝트의 `run.bat`, `stop.bat`, `restart.bat`를 실행한다.
- Agent는 명령 처리 결과와 실제 프로세스 상태를 DB에 갱신한다.
- 모델 관리 화면은 DB에 저장된 최신 상태를 조회하여 표시한다.

## Agent 통신 방식

Backend와 VM Agent 사이에는 별도 HTTP API 통신을 사용하지 않는다. Agent는 운영 DB에 직접 접속하여 `TB_M26_MODEL_COMMAND`를 polling하고, 명령 상태와 `TB_M26_MODEL_PROCESS`의 실제 상태를 직접 갱신한다. Backend의 역할은 관리자 요청을 명령 큐에 등록하고 화면 조회 결과를 제공하는 것으로 제한한다.

## 범위

### 포함 범위

- 모델 프로세스별 시작, 중지, 재시작 명령 등록
- VM Agent의 명령 polling 및 처리 상태 변경
- 명령 처리 결과와 오류 메시지 저장
- Python 프로세스 실제 상태의 주기적 점검
- `TB_M26_MODEL_PROCESS` 상태 갱신
- Agent heartbeat 및 모니터링 상태 갱신
- 제어 명령 및 상태 변경 이벤트 로그 기록

### 제외 범위

- Agent 자체의 배포 및 자동 업데이트
- 운영체제 서비스 등록 방식
- Python 프로젝트 내부의 `run.bat`, `stop.bat`, `restart.bat` 구현
- VM 전용 관리 테이블 신설
- 메시지 브로커 도입

## 운영 흐름

```text
관리자 화면
  -> Backend 제어 요청 API
  -> TB_M26_MODEL_COMMAND에 명령 등록
  -> Agent가 대상 VM 명령 polling
  -> 명령 선점(PROCESSING)
  -> run.bat / stop.bat / restart.bat 실행
  -> 명령 성공 또는 실패 결과 저장
  -> Agent가 실제 Python 프로세스 상태 점검
  -> TB_M26_MODEL_PROCESS.PROCESS_STATUS 갱신
  -> 모델 관리 화면이 최신 상태 조회
```

## 상태 정의

### Python 프로세스 실제 상태

`TB_M26_MODEL_PROCESS.PROCESS_STATUS`에는 Agent가 확인한 실제 상태만 저장한다.

- `RUNNING`: Python 프로세스가 실행 중
- `STOPPED`: Python 프로세스가 실행 중이 아님
- `STARTING`: 시작 명령 처리 직후, 실제 상태 확인 전
- `STOPPING`: 중지 명령 처리 직후, 실제 상태 확인 전
- `RESTARTING`: 재시작 명령 처리 직후, 실제 상태 확인 전
- `ERROR`: 프로세스 오류 또는 상태 점검 오류
- `UNKNOWN`: Agent가 아직 상태를 보고하지 않았거나 상태 확인 불가

관리자 요청만으로 `RUNNING` 또는 `STOPPED`를 확정하지 않는다.

### 명령 상태

명령은 다음 상태를 순서대로 가질 수 있다.

```text
REQUESTED -> PROCESSING -> SUCCEEDED
                         -> FAILED
                         -> TIMEOUT
```

- `REQUESTED`: Backend가 명령을 등록했으나 Agent가 아직 선점하지 않음
- `PROCESSING`: Agent가 명령을 선점하고 실행 중
- `SUCCEEDED`: 실행 명령이 성공적으로 완료됨
- `FAILED`: 배치 파일 실행 실패 또는 실행 결과 오류
- `TIMEOUT`: 정해진 시간 안에 Agent 처리 결과가 보고되지 않음

명령 상태와 프로세스 실제 상태는 서로 덮어쓰지 않는다. 예를 들어 명령이 `SUCCEEDED`여도 Python 프로세스가 실제로 실행되지 않았다면 `PROCESS_STATUS`는 `ERROR` 또는 `STOPPED`로 남을 수 있다.

### Agent 모니터링 상태

- `NORMAL`: 최근 heartbeat와 상태 보고가 정상
- `CHECKING`: 초기 연결 또는 일시적인 상태 확인 중
- `FAILED`: Agent heartbeat가 기준 시간을 초과했거나 상태 보고 실패
- `UNKNOWN`: Agent 상태를 확인할 수 없음

## 데이터 모델

### TB_M26_MODEL_COMMAND

모든 Audit 컬럼은 프로젝트 규칙에 따라 업무 컬럼보다 앞에 배치한다.

| 컬럼 | 설명 |
|---|---|
| CREATED_OBJECT_TYPE | 생성 객체 유형 |
| CREATED_OBJECT_ID | 생성 객체 식별자 |
| CREATED_PROGRAM_ID | 생성 프로그램 식별자 |
| CREATED_TIMESTAMP | 생성 시각 |
| LAST_UPDATED_OBJECT_TYPE | 최종 수정 객체 유형 |
| LAST_UPDATED_OBJECT_ID | 최종 수정 객체 식별자 |
| LAST_UPDATED_PROGRAM_ID | 최종 수정 프로그램 식별자 |
| LAST_UPDATED_TIMESTAMP | 최종 수정 시각 |
| DATA_END_STATUS | 논리 삭제 상태 |
| DATA_END_OBJECT_TYPE | 종료 객체 유형 |
| DATA_END_OBJECT_ID | 종료 객체 식별자 |
| DATA_END_PROGRAM_ID | 종료 프로그램 식별자 |
| DATA_END_TIMESTAMP | 종료 시각 |
| MODEL_COMMAND_ID | 명령 식별자, PK |
| MODEL_PROCESS_ID | 대상 모델 프로세스 식별자, 논리 참조 |
| TARGET_SERVER_IP | 명령 대상 VM 주소 |
| COMMAND_TYPE | `START`, `STOP`, `RESTART` |
| COMMAND_STATUS | 명령 처리 상태 |
| REQUESTED_BY | 요청 사용자 식별자 |
| REQUESTED_TIMESTAMP | 요청 시각 |
| CLAIMED_TIMESTAMP | Agent 선점 시각 |
| PROCESSED_TIMESTAMP | 처리 완료 시각 |
| AGENT_ID | 처리 Agent 식별자 |
| RESULT_CODE | 처리 결과 코드 |
| RESULT_MESSAGE | 처리 결과 또는 오류 메시지 |
| RETRY_COUNT | 재시도 횟수 |

`MODEL_PROCESS_ID`는 논리적 참조만 유지하며 물리적 FK 제약조건은 생성하지 않는다.

VM을 별도로 관리하는 테이블은 만들지 않는다. 대상 VM은 모델 프로세스의 `SERVER_IP`와 명령의 `TARGET_SERVER_IP`를 기준으로 식별한다.

## Backend 동작

### 명령 등록

관리자가 시작, 중지 또는 재시작을 요청하면 Backend는 다음을 수행한다.

1. 대상 모델 프로세스가 활성 데이터인지 확인한다.
2. 허용된 명령 유형인지 확인한다.
3. 대상 프로세스의 `SERVER_IP`를 명령에 복사한다.
4. `COMMAND_STATUS = REQUESTED`로 명령을 등록한다.
5. 명령 식별자와 접수 상태를 반환한다.
6. 이 시점에는 `MODEL_PROCESS.PROCESS_STATUS`를 실제 완료 상태로 변경하지 않는다.

### 중복 명령 방지

- 동일 프로세스에 `REQUESTED` 또는 `PROCESSING` 상태의 동일 명령이 있으면 중복 등록 정책을 적용한다.
- 기본 정책은 중복 요청을 거부하고 기존 명령 식별자를 안내하는 방식으로 한다.
- `RESTART`는 기존 시작 또는 중지 요청과 별도의 명령으로 취급하되, 처리 중인 명령이 있으면 등록을 제한한다.

### 명령 만료

- `REQUESTED` 상태가 허용 대기 시간을 초과하면 `TIMEOUT`으로 변경할 수 있어야 한다.
- `PROCESSING` 상태가 허용 실행 시간을 초과하면 `TIMEOUT`으로 변경하고 Agent 재시작 이후 중복 실행 여부를 점검한다.
- 시간 초과 명령은 자동으로 `RUNNING` 또는 `SUCCEEDED`로 변경하지 않는다.

## Agent 동작

### 명령 polling

Agent는 설정된 주기로 다음 조건의 명령을 조회한다.

- `TARGET_SERVER_IP`가 자신의 VM 주소와 일치
- `COMMAND_STATUS = REQUESTED`
- `DATA_END_STATUS = 'N'`

Agent는 한 번에 처리할 명령 수를 제한할 수 있어야 하며, 동일 모델 프로세스의 명령은 동시에 두 개 이상 실행하지 않는다.

### 명령 선점

Agent는 실행 전에 명령을 `PROCESSING`으로 변경하고 `AGENT_ID`, `CLAIMED_TIMESTAMP`를 기록한다. 선점에 실패한 명령은 실행하지 않는다.

이를 통해 여러 polling 주기가 동일 명령을 중복 실행하지 않도록 한다.

### 배치 실행

Agent는 모델 프로세스의 `PYTHON_PROJECT_PATH`를 기준으로 다음 파일을 실행한다.

| 명령 | 실행 파일 |
|---|---|
| `START` | `run.bat` |
| `STOP` | `stop.bat` |
| `RESTART` | `restart.bat` |

실행 전 프로젝트 경로와 배치 파일 존재 여부를 확인한다. 실행 결과의 종료 코드, 표준 출력 요약, 표준 오류 요약을 명령 결과에 기록한다.

### 실제 상태 점검

Agent는 polling과 별개로 모든 활성 모델 프로세스의 Python 프로세스 상태를 주기적으로 확인한다.

- 프로세스가 발견되면 `PROCESS_STATUS = RUNNING`
- 프로세스가 발견되지 않으면 `PROCESS_STATUS = STOPPED`
- 점검 자체가 실패하면 `PROCESS_STATUS = UNKNOWN` 또는 `ERROR`
- 상태가 변경되거나 오류가 발생하면 `LAST_STATUS_TIMESTAMP`를 갱신한다.

명령 실행 직후에는 일시적으로 `STARTING`, `STOPPING`, `RESTARTING`을 사용할 수 있으며, 다음 상태 점검 결과로 최종 상태를 확정한다.

### Heartbeat

Agent는 정해진 주기로 자신의 heartbeat와 마지막 상태 보고 시각을 DB에 기록한다. Backend 또는 화면은 마지막 heartbeat 시각을 기준으로 Agent 모니터링 상태를 판단한다.

## 오류 및 재시도

- 대상 프로젝트 경로가 없으면 `FAILED`
- 배치 파일이 없으면 `FAILED`
- 배치 파일 종료 코드가 실패이면 `FAILED`
- Agent가 명령을 선점한 뒤 응답하지 않으면 `TIMEOUT`
- 일시적인 DB 오류는 Agent가 재접속 후 재조회한다.
- 이미 처리 완료된 명령은 재실행하지 않는다.
- 재시도 가능한 오류와 즉시 실패할 오류는 결과 코드로 구분한다.

## 권한 및 감사

- 모델 프로세스 제어 권한이 있는 사용자만 명령 등록이 가능하다.
- 모든 명령에는 요청 사용자와 요청 시각을 기록한다.
- Agent가 처리한 Agent ID, 선점 시각, 완료 시각, 결과 메시지를 기록한다.
- 명령 처리 결과와 프로세스 상태 변경은 모델 이벤트 로그에서 추적 가능해야 한다.

## 사용자 시나리오 및 검증

### US1. 프로세스 시작 요청

관리자가 모델 프로세스의 시작을 요청하면 명령이 접수 상태로 표시되고, Agent가 `run.bat`를 실행한 후 실제 프로세스가 실행 중인지 확인하여 상태를 갱신한다.

**검증 기준**

- 명령 등록 직후 `PROCESS_STATUS`가 임의로 `RUNNING`으로 확정되지 않는다.
- Agent 처리 전 명령은 `REQUESTED`로 조회된다.
- 실행 성공 및 상태 점검 후 명령과 모델 프로세스 상태가 각각 갱신된다.

### US2. 프로세스 중지 또는 재시작 요청

관리자가 중지 또는 재시작을 요청하면 해당 배치 파일이 실행되고, 결과와 실제 상태가 분리되어 표시된다.

**검증 기준**

- 명령 유형에 맞는 배치 파일이 선택된다.
- 실패한 배치 실행은 `FAILED`와 결과 메시지를 남긴다.
- 재시작 후 실제 프로세스가 실행되지 않으면 명령 성공 여부와 관계없이 실제 상태에 오류가 표시된다.

### US3. Agent 장애 확인

Agent가 heartbeat를 갱신하지 않으면 관리자는 해당 VM의 모니터링 상태가 비정상임을 확인할 수 있어야 한다.

**검증 기준**

- 마지막 heartbeat 기준 시간이 화면에 반영된다.
- Agent가 중단된 경우 모델 프로세스 상태를 최신 확정 상태로 오인하지 않는다.

## 성공 기준

- 관리자의 제어 요청이 실제 프로세스 완료 상태와 구분되어 표시된다.
- Agent가 정상인 환경에서 제어 요청의 접수부터 결과 기록까지의 흐름을 추적할 수 있다.
- 명령 중복 실행이 발생하지 않는다.
- Agent 장애 또는 배치 실행 실패를 모델 상태와 명령 결과에서 구분할 수 있다.
- 모델 관리 화면은 새로고침 후에도 DB에 저장된 명령 및 실제 프로세스 상태를 일관되게 표시한다.

## 가정 및 결정 사항

- Agent는 각 VM에서 하나만 활성화되어 있다고 가정한다.
- Agent와 Backend는 공통 DB에 접근할 수 있다고 가정한다.
- Python 프로젝트는 명령 실행에 필요한 배치 파일을 제공한다.
- 명령 polling 주기와 timeout 값은 운영 환경 설정값으로 관리한다.
- 물리적 FK 제약조건은 생성하지 않는다.
- 1차 구현에서는 DB polling을 사용하며 별도 메시지 브로커는 도입하지 않는다.

## 후속 구현 항목

- `TB_M26_MODEL_COMMAND` Flyway migration 작성
- 명령 등록 및 명령 결과 조회 Backend API 작성
- Agent의 DB polling 및 선점 규칙 정의
- Agent의 DB 상태 갱신 계약 정의
- 기존 모델 제어 API의 직접 상태 변경 제거
- 명령 및 상태 전이 테스트 작성
