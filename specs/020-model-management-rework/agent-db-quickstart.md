# 모델 프로세스 Agent DB 연동 가이드

이 프로젝트의 VM Agent는 Backend API를 호출하지 않는다. Agent는 모델 프로세스가 실행되는 VM에서 공용 운영 DB에 직접 접속하고, 아래 순서로 `TB_M26_MODEL_COMMAND`와 `TB_M26_MODEL_PROCESS`를 처리한다.

## 1. 명령 polling

Agent는 자신의 VM IP를 `TARGET_SERVER_IP`로 사용하여 미처리 명령을 오래된 순서부터 조회한다.

```sql
SELECT MODEL_COMMAND_ID, MODEL_PROCESS_ID, TARGET_SERVER_IP, COMMAND_TYPE,
       REQUESTED_BY, REQUESTED_TIMESTAMP, RETRY_COUNT
  FROM TB_M26_MODEL_COMMAND
 WHERE TARGET_SERVER_IP = :serverIp
   AND COMMAND_STATUS = 'REQUESTED'
   AND DATA_END_STATUS = 'N'
 ORDER BY MODEL_COMMAND_ID
 LIMIT :batchSize;
```

## 2. 명령 선점

조회한 행을 실행하기 전에 조건부 UPDATE로 선점한다. 영향받은 행이 1건일 때만 실행하며, 0건이면 다른 Agent 또는 polling loop가 먼저 선점한 것이므로 건너뛴다.

```sql
UPDATE TB_M26_MODEL_COMMAND
   SET COMMAND_STATUS = 'PROCESSING',
       AGENT_ID = :agentId,
       CLAIMED_TIMESTAMP = CURRENT_TIMESTAMP(),
       LAST_UPDATED_OBJECT_TYPE = 'A',
       LAST_UPDATED_OBJECT_ID = :agentId,
       LAST_UPDATED_PROGRAM_ID = 'MODEL_AGENT'
 WHERE MODEL_COMMAND_ID = :commandId
   AND TARGET_SERVER_IP = :serverIp
   AND COMMAND_STATUS = 'REQUESTED'
   AND DATA_END_STATUS = 'N';
```

## 3. 배치 실행

`TB_M26_MODEL_PROCESS.PYTHON_PROJECT_PATH`를 프로젝트 루트로 사용한다.

| `COMMAND_TYPE` | 실행 파일 |
|---|---|
| `START` | `run.bat` |
| `STOP` | `stop.bat` |
| `RESTART` | `restart.bat` |

경로 탈출이나 임의 경로 실행을 막기 위해 프로젝트 루트 밖의 파일을 실행하지 않는다. 배치 종료 코드와 표준 출력/오류 요약을 명령 결과에 기록한다.

## 4. 명령 완료 기록

배치 결과에 따라 `SUCCEEDED`, `FAILED`, `TIMEOUT` 중 하나로 종료한다. 선점한 Agent만 완료할 수 있도록 `AGENT_ID`와 `COMMAND_STATUS = 'PROCESSING'`을 조건에 포함한다.

```sql
UPDATE TB_M26_MODEL_COMMAND
   SET COMMAND_STATUS = :status,
       RESULT_CODE = :resultCode,
       RESULT_MESSAGE = :resultMessage,
       PROCESSED_TIMESTAMP = CURRENT_TIMESTAMP(),
       LAST_UPDATED_OBJECT_TYPE = 'A',
       LAST_UPDATED_OBJECT_ID = :agentId,
       LAST_UPDATED_PROGRAM_ID = 'MODEL_AGENT'
 WHERE MODEL_COMMAND_ID = :commandId
   AND TARGET_SERVER_IP = :serverIp
   AND AGENT_ID = :agentId
   AND COMMAND_STATUS = 'PROCESSING'
   AND DATA_END_STATUS = 'N';
```

## 5. 프로세스 상태 갱신

Agent는 명령 polling과 별도로 Python 프로세스를 주기적으로 확인하고, 실제 OS 프로세스 상태를 `TB_M26_MODEL_PROCESS.PROCESS_STATUS`에 기록한다. 명령 접수만으로 `RUNNING`으로 바꾸지 않는다.

```sql
UPDATE TB_M26_MODEL_PROCESS
   SET PROCESS_STATUS = :processStatus,
       MONITORING_STATUS = :monitoringStatus,
       CONTROL_STATUS = :controlStatus,
       LAST_STATUS_TIMESTAMP = CURRENT_TIMESTAMP(),
       LAST_UPDATED_OBJECT_TYPE = 'A',
       LAST_UPDATED_OBJECT_ID = :agentId,
       LAST_UPDATED_PROGRAM_ID = 'MODEL_AGENT'
 WHERE MODEL_PROCESS_ID = :processId
   AND SERVER_IP = :serverIp
   AND DATA_END_STATUS = 'N';
```

## 6. 중복 실행 방지 규칙

- Backend는 같은 모델 프로세스에 `REQUESTED` 또는 `PROCESSING` 명령이 있으면 새 제어 요청을 등록하지 않는다.
- Agent는 반드시 조건부 선점 UPDATE를 성공한 뒤에만 배치를 실행한다.
- 명령의 실제 성공 여부는 배치 종료 코드가 아니라 Agent의 다음 상태 점검 결과와 함께 확인한다.
- Backend와 Agent 사이에 HTTP callback, Agent token, 별도 Agent API를 추가하지 않는다.
