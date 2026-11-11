# 데이터 모델: 통합 알람 관리

새 테이블은 만들지 않고 기존 세 테이블을 확장한다.

## `TB_M26_CODE_DETAIL`

공통코드 `ALARM_TYPE` 상세코드의 기본 정책을 저장한다.

| 컬럼 | 의미 |
|---|---|
| `ALARM_CATEGORY` | `GENERAL` 또는 `MODEL` |
| `DEFAULT_SAVE_STATUS` | 로그 기본 저장 여부 (`Y/N`) |
| `DEFAULT_RECEIVE_STATUS` | 기본 수신 여부 (`Y/N`) |
| `RECIPIENT_SCOPE` | `ALL_ADMIN` 또는 `SELECTED_USER` |
| `DEFAULT_PUSH_STATUS` | 기본 SSE/push 여부 |
| `DEFAULT_EMAIL_STATUS` | 기본 메일 여부 |
| `DEFAULT_TEAMS_STATUS` | 기본 Teams 여부 |
| `ACKNOWLEDGEMENT_SCOPE` | `GROUP` 또는 `INDIVIDUAL` |

## `TB_M26_USER_ALERT_PREF`

사용자와 알람 유형 조합별 예외 정책이다. 행이 없으면 유형 기본값을 사용한다.

| 컬럼 | 의미 |
|---|---|
| `USER_ID` | 수신 사용자 |
| `ALARM_TYPE_CODE` | `ALARM_TYPE` 상세코드, 기존 전체 기본값은 `*` |
| `RECEIVER_STATUS` | 수신자 포함 여부 |
| `PUSH_ENABLED` | SSE/push 여부 |
| `EMAIL_ENABLED` | 메일 여부 |
| `TEAMS_ENABLED` | Teams 여부 |

유일키는 `(USER_ID, ALARM_TYPE_CODE)`다. 기존 `SMS_ENABLED`는 하위 호환을 위해 유지한다.

## `TB_M26_ALARM_LOG`

`ALARM_TYPE`, `TARGET_USER_ID`, `ACKNOWLEDGED_STATUS`는 기존 의미를 유지한다. 공동 확인 알람은 같은 발생 건의 모든 수신자 로그에 같은 `ALARM_GROUP_ID`를 저장한다.

## 적용 우선순위

1. 사용자별 행이 있으면 수신자·채널 값을 우선한다.
2. 사용자별 행이 없으면 유형 기본값을 사용한다.
3. `ALL_ADMIN`은 활성 최고관리자를 후보로 하고 `SELECTED_USER`는 `RECEIVER_STATUS=Y` 사용자만 후보로 한다.
4. 로그 저장과 push 전달은 독립적으로 계산한다.
