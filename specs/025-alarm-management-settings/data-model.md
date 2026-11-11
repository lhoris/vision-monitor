# 데이터 모델: 통합 알람 관리

## `TB_M26_ALARM_RULE`

알람 유형별 기본 정책을 관리하는 전용 테이블이다. 공통코드 상세 테이블에는 알람 정책 컬럼을 두지 않는다.

| 컬럼 | 설명 |
|---|---|
| `ALARM_RULE_ID` | 알람 규칙 PK |
| `ALARM_CODE` | 애플리케이션 알람 코드 |
| `ALARM_NAME`, `ALARM_NAME_KO`, `ALARM_NAME_EN` | 표시 명칭 |
| `ALARM_DESCRIPTION` | 알람 설명 |
| `ALARM_CATEGORY` | `GENERAL` 또는 `MODEL` |
| `RECIPIENT_SCOPE` | `ALL_ADMIN` 또는 `SELECTED_USER` |
| `ACKNOWLEDGEMENT_SCOPE` | `GROUP` 또는 `INDIVIDUAL` |
| `SAVE_STATUS` | 알람 로그 저장 여부 (`Y/N`) |
| `RECEIVE_STATUS` | 기본 수신 여부 (`Y/N`) |
| `PUSH_STATUS` | 기본 SSE 수신 여부 (`Y/N`) |
| `EMAIL_STATUS` | 기본 메일 수신 여부 (`Y/N`) |
| `TEAMS_STATUS` | 기본 Teams 수신 여부 (`Y/N`) |

## `TB_M26_USER_ALERT_PREF`

사용자별 알람 수신 및 채널 예외 설정이다. 설정이 없으면 `TB_M26_ALARM_RULE`의 기본 정책을 사용한다.

| 컬럼 | 설명 |
|---|---|
| `USER_ID` | 수신 사용자 |
| `ALARM_TYPE_CODE` | 알람 규칙의 `ALARM_CODE` |
| `RECEIVER_STATUS` | 알람 수신 여부 |
| `PUSH_ENABLED` | SSE 수신 여부 |
| `EMAIL_ENABLED` | 메일 수신 여부 |
| `TEAMS_ENABLED` | Teams 수신 여부 |

## `TB_M26_ALARM_LOG`

실제 발생한 알람과 사용자별 확인 상태를 저장한다. 공동 확인 알람은 동일한 `ALARM_GROUP_ID`를 사용한다.

## 마이그레이션

`V035__create_alarm_rule_and_remove_code_detail_alarm_columns.sql`은 기존 `ALARM_TYPE` 공통코드 상세의 정책 데이터를 `TB_M26_ALARM_RULE`로 이관한 뒤, `TB_M26_CODE_DETAIL`의 알람 정책 컬럼을 제거한다.
