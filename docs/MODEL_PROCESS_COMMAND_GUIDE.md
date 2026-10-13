# 모델 프로세스 제어 명령 입력 가이드

## 1. 문서 목적

이 문서는 Vision Monitor에서 AI 모델 프로세스를 시작, 중지, 재시작하는 명령을 입력하고 처리 결과를 확인하는 방법을 설명한다.

모델 프로세스 제어는 Backend가 VM에서 Python 프로세스를 직접 실행하는 방식이 아니다.

이 기능에서 사용하는 명령 큐는 `TB_M26_MODEL_COMMAND` 하나이다. Vision Monitor의 모델 관리 화면에서 등록한 명령을 이 테이블에 저장하고, local-runtime-agent도 같은 테이블을 polling한다. `TB_M26_COMMAND`라는 별도 테이블은 사용하지 않는다.

```text
관리자 화면
  -> Backend 제어 요청
  -> TB_M26_MODEL_COMMAND에 PENDING 명령 저장
  -> VM Agent가 운영 DB를 polling
  -> Agent가 대상 VM의 배치 파일 실행
  -> Agent가 명령 결과와 실제 프로세스 상태를 DB에 갱신
```

Backend와 VM Agent 사이에는 별도 HTTP API를 사용하지 않는다. Agent는 자신이 실행 중인 VM의 IP와 일치하는 명령만 처리한다.

## 2. 사전 설정

`TB_M26_MODEL_PROCESS`에 대상 모델 프로세스 정보가 등록되어 있어야 한다.

| 항목 | 설명 |
|---|---|
| `MODEL_PROCESS_ID` | 모델 프로세스 식별자 |
| `SERVER_IP` | Python 프로세스가 실행되는 VM의 IP 주소 |
| `PYTHON_PROJECT_PATH` | 배치 파일이 있는 Python 프로젝트 루트 경로 |
| `DATA_END_STATUS` | 사용 중인 모델 프로세스는 `N` |

Python 프로젝트 루트에는 아래 배치 파일이 있어야 한다.

```text
<PYTHON_PROJECT_PATH>\start.bat
<PYTHON_PROJECT_PATH>\stop.bat
<PYTHON_PROJECT_PATH>\restart.bat
```

배치 파일은 해당 프로젝트 폴더를 작업 디렉터리로 실행해도 정상 동작하도록 작성해야 한다. Agent는 명령을 처리할 때 `PYTHON_PROJECT_PATH`를 기준으로 파일을 실행한다.

## 3. 화면에서 입력하는 방법

1. **관리자 메뉴 > 통신 및 모델 설정 > 모델 관리**로 이동한다.
2. 대시보드에서 제어할 모델 프로세스를 선택한다.
3. 모델 프로세스를 더블클릭해 **AI 모델 프로세스 제어** 창을 연다.
4. **시작**, **중지**, **재시작** 중 하나를 선택한다.
5. 확인창에서 요청을 승인한다.
6. Backend가 명령을 `PENDING` 상태로 저장하면 화면에 접수 상태가 표시된다.
7. Agent가 명령을 처리한 후 **새로고침**을 눌러 명령 상태와 실제 프로세스 상태를 확인한다.

화면의 버튼과 DB에 저장되는 `COMMAND_TYPE`, 실행 파일의 관계는 다음과 같다.

| 화면 동작 | `COMMAND_TYPE` | Agent 실행 파일 |
|---|---|---|
| 시작 | `START` | `start.bat` |
| 중지 | `STOP` | `stop.bat` |
| 재시작 | `RESTART` | `restart.bat` |

명령이 `COMPLETED`가 되었다고 해서 Python 프로세스가 반드시 정상 실행 중이라는 뜻은 아니다. Agent가 OS 프로세스를 확인하여 `TB_M26_MODEL_PROCESS.PROCESS_STATUS`를 갱신한 뒤 실제 상태를 확인해야 한다.

## 4. Backend API로 입력하는 방법

화면의 버튼은 아래 API를 호출한다. 인증 세션이 필요하다.

```http
POST /api/model-processes/{MODEL_PROCESS_ID}/actions/start
POST /api/model-processes/{MODEL_PROCESS_ID}/actions/stop
POST /api/model-processes/{MODEL_PROCESS_ID}/actions/restart
```

예를 들어 `MODEL_PROCESS_ID`가 `101`인 프로세스를 시작하려면 다음과 같이 요청한다.

```bash
curl -X POST "http://localhost:8080/api/model-processes/101/actions/start" \
  -H "Cookie: VISION_SESSION=<로그인_세션>"
```

API는 해당 프로세스의 `SERVER_IP`로 등록된 `TB_M26_AGENT.AGENT_ID`를 찾아 명령의 `AGENT_ID`로 기록한다. 처리 중인 명령(`PENDING` 또는 `PROCESSING`)이 이미 있으면 중복 제어를 막기 위해 새 명령을 등록하지 않는다.

## 5. DB에서 명령을 직접 입력하는 방법

일반적인 운영에서는 관리자 화면 또는 Backend API를 사용한다. 장애 분석이나 Agent 연동 테스트처럼 DB에 직접 입력해야 하는 경우에만 아래 방식을 사용한다.

### 5.1 대상 프로세스 확인

```sql
SELECT MODEL_PROCESS_ID,
       MODEL_NAME,
       SERVER_IP,
       PYTHON_PROJECT_PATH,
       PROCESS_STATUS,
       DATA_END_STATUS
  FROM TB_M26_MODEL_PROCESS
 WHERE MODEL_PROCESS_ID = 101
   AND DATA_END_STATUS = 'N';
```

`SERVER_IP`와 `PYTHON_PROJECT_PATH`가 실제 Agent와 배치 파일 위치에 맞는지 먼저 확인한다.

### 5.2 처리 중인 명령 확인

```sql
SELECT COMMAND_ID,
       MODEL_PROCESS_ID,
       COMMAND_TYPE,
       COMMAND_STATUS,
       COMMAND_PARAMETERS,
       PROCESSED_AT,
       AGENT_ID,
       FAILED_REASON
  FROM TB_M26_MODEL_COMMAND
 WHERE MODEL_PROCESS_ID = '101'
   AND DATA_END_STATUS = 'N'
 ORDER BY CREATED_TIMESTAMP DESC;
```

`PENDING` 또는 `PROCESSING` 명령이 있으면 새 명령을 입력하지 않는다.

### 5.3 시작 명령 입력 예시

```sql
INSERT INTO TB_M26_MODEL_COMMAND (
    CREATED_OBJECT_TYPE,
    CREATED_OBJECT_ID,
    CREATED_PROGRAM_ID,
    LAST_UPDATED_OBJECT_TYPE,
    LAST_UPDATED_OBJECT_ID,
    LAST_UPDATED_PROGRAM_ID,
    COMMAND_ID,
    AGENT_ID,
    MODEL_PROCESS_ID,
    COMMAND_TYPE,
    COMMAND_STATUS,
    COMMAND_PARAMETERS
)
SELECT 'U',
       'DB',
       'MODEL_COMMAND',
       'U',
       'DB',
       'MODEL_COMMAND',
       UUID(),
       a.AGENT_ID,
       MODEL_PROCESS_ID,
       'START',
       'PENDING',
       '{}'
  FROM TB_M26_MODEL_PROCESS p
  JOIN TB_M26_AGENT a ON a.IP_ADDRESS = p.SERVER_IP AND a.DATA_END_STATUS = 'N'
 WHERE p.MODEL_PROCESS_ID = 101
   AND p.DATA_END_STATUS = 'N';
```

### 5.4 중지 및 재시작 명령

5.3의 `INSERT ... SELECT` 문에서 `COMMAND_TYPE` 값만 다음과 같이 변경한다.

```sql
-- stop.bat 실행 요청
       'STOP',
       'PENDING',
       '{}'

-- restart.bat 실행 요청
       'RESTART',
       'PENDING',
       '{}'
```

즉, 5.3의 `'START'`를 `'STOP'` 또는 `'RESTART'`로 바꾸어 실행한다. Audit 컬럼과 `AGENT_ID`는 생략하지 않는다.

## 6. 명령 처리 상태

```text
PENDING   -> PROCESSING -> COMPLETED
                         -> FAILED
```

| 상태 | 의미 |
|---|---|
| `PENDING` | Backend 또는 운영자가 명령을 등록했지만 Agent가 아직 선점하지 않음 |
| `PROCESSING` | Agent가 명령을 선점하여 배치 파일을 실행하는 중 |
| `COMPLETED` | 배치 파일이 성공 종료됨 |
| `FAILED` | 배치 파일을 찾지 못했거나 실행 결과가 실패함 |

Agent는 `PENDING` 명령을 처리한 뒤 `COMMAND_STATUS`를 `COMPLETED` 또는 `FAILED`로 변경하고, 처리 완료 시각과 실패 사유를 `PROCESSED_AT`, `FAILED_REASON`에 저장한다.

현재 Agent의 `TB_M26_MODEL_COMMAND` 처리 결과는 성공 시 `COMMAND_STATUS = 'COMPLETED'`, 실패 시 `COMMAND_STATUS = 'FAILED'`로 기록된다. `PENDING`은 아직 처리되지 않은 요청이며, `SUCCEEDED`, `REQUESTED`, `TIMEOUT`은 이 공유 큐의 현재 Agent 구현에서 사용하는 상태값이 아니다.

## 7. 처리 결과 확인

```sql
SELECT COMMAND_ID,
       MODEL_PROCESS_ID,
       COMMAND_TYPE,
       COMMAND_STATUS,
       AGENT_ID,
       PROCESSED_AT,
       FAILED_REASON
  FROM TB_M26_MODEL_COMMAND
 WHERE MODEL_PROCESS_ID = '101'
   AND DATA_END_STATUS = 'N'
 ORDER BY CREATED_TIMESTAMP DESC
 LIMIT 1;
```

실제 Python 프로세스 상태와 Agent 상태는 별도로 확인한다.

```sql
SELECT MODEL_PROCESS_ID,
       PROCESS_STATUS,
       MONITORING_STATUS,
       CONTROL_STATUS,
       LAST_STATUS_TIMESTAMP
  FROM TB_M26_MODEL_PROCESS
 WHERE MODEL_PROCESS_ID = 101
   AND DATA_END_STATUS = 'N';
```

`LAST_STATUS_TIMESTAMP`가 오래되었거나 비어 있으면 Agent가 최근 상태를 갱신하지 않은 것이므로 `PROCESS_STATUS`만 보고 정상으로 판단하지 않는다.

## 8. 오류 점검 순서

1. `TB_M26_MODEL_PROCESS.SERVER_IP`가 Agent가 실행 중인 VM의 IP와 같은지 확인한다.
2. `PYTHON_PROJECT_PATH`가 실제 프로젝트 루트인지 확인한다.
3. 해당 경로에 `start.bat`, `stop.bat`, `restart.bat`가 있는지 확인한다.
4. Agent가 운영 DB에 접속할 수 있는지 확인한다.
5. 명령이 `PENDING`에서 `COMPLETED` 또는 `FAILED`로 변경되는지 확인한다.
6. `RESULT_MESSAGE`에서 배치 파일 경로, 종료 코드, 표준 오류를 확인한다.
7. 명령 결과와 별도로 `PROCESS_STATUS`, `MONITORING_STATUS`, `LAST_STATUS_TIMESTAMP`를 확인한다.

`TB_M26_MODEL_PROCESS.PROCESS_STATUS`를 관리자가 직접 `RUNNING` 또는 `STOPPED`로 변경하지 않는다. 실제 OS 프로세스 상태는 Agent가 확인하여 갱신해야 한다.

## 9. 커스텀 명령

Backend의 명령 입력값은 영문 대문자, 숫자, `_`, `-` 조합을 허용한다. 따라서 Agent가 지원하도록 구성된 경우 `CUSTOM1` 명령은 다음 배치 파일로 연결할 수 있다.

```text
<PYTHON_PROJECT_PATH>\custom1.bat
```

커스텀 명령을 사용하기 전에는 Agent가 해당 명령을 `<COMMAND_TYPE 소문자>.bat` 규칙으로 실행하도록 구현되어 있는지 확인한다. Agent가 지원하지 않는 명령을 DB에 등록하면 명령은 실패할 수 있다.
