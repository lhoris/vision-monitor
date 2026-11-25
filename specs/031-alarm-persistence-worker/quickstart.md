# 모델 서버 직접 알람 로그 입력 계약

Spring Boot가 일시적으로 중단되어도 모델 서버는 DB에 알람 로그를 직접 등록할 수 있다. Spring Boot가 다시 실행되면 내부 알람 워커가 `PENDING` 채널을 처리한다.

## 필수 입력

모델 서버는 `TB_M26_ALARM_LOG`에 수신자별 행을 생성한다.

```text
ALARM_TYPE
ALARM_SEVERITY
ALARM_MESSAGE
ALARM_SOURCE_TYPE = MODEL
ALARM_SOURCE_ID
SOURCE_EVENT_ID
OCCURRED_TIMESTAMP
TARGET_USER_ID
ACKNOWLEDGED_STATUS = N
APP_STATUS = PENDING 또는 SKIPPED
EMAIL_STATUS = PENDING 또는 SKIPPED
TEAMS_STATUS = PENDING 또는 SKIPPED
DATA_END_STATUS = N
```

`SOURCE_EVENT_ID`는 같은 모델 이벤트를 재전송해도 중복 저장되지 않도록 모델 서버에서 고유하게 생성해야 한다. 같은 이벤트를 여러 수신자에게 저장하는 경우 `SOURCE_EVENT_ID + TARGET_USER_ID` 조합이 유일해야 한다.

## 처리 규칙

- `PENDING`만 Spring Boot 내부 워커가 처리한다.
- 워커가 처리 중인 짧은 구간에는 `PROCESSING` 상태를 사용한다.
- 전송 성공은 `SENT`로 변경한다.
- 전송 실패는 `FAILED`로 변경하고 재시도하지 않는다.
- Spring Boot가 중단된 동안에는 전송하지 않고 DB에만 저장한다.
