# 구현 계획: 알람 저장 및 내부 전송 워커

## 1. 계획 요약

기존 `TB_M26_ALARM_RULE`, `TB_M26_USER_ALERT_PREF`, `TB_M26_ALARM_LOG`를 유지하면서 역할을 정리한다. 상위 기준의 수신대상범위와 저장 여부를 제거하고, 사용자별 설정 테이블을 수신자 목록으로 사용한다. 모든 알람은 공통 서비스에서 수신자별 로그로 저장하며, Spring Boot 내부 스케줄 워커가 채널별 `PENDING` 상태를 처리한다.

모델 서버가 Spring Boot 중단 중에도 직접 저장할 수 있도록 DB 입력 계약과 중복 방지 ID를 migration 및 문서로 제공한다. 앱 알람은 기존 SSE 브로커를 활용하되 전체 브로드캐스트를 제거하고 대상 사용자별로 전송한다.

## 2. 요구사항 추적

| 요구사항 | 구현 위치 |
|---|---|
| FR-001~FR-003 | `AlarmRule`, `UserAlertPreference`, 알람 관리 API/화면 |
| FR-004~FR-006 | `AlarmIngressService`, `TB_M26_ALARM_LOG`, 모델 서버 입력 계약 |
| FR-007~FR-010 | `AlarmLog`, `AlarmNotificationWorker`, migration |
| FR-011 | `AlarmEventPublisher`, 수신자별 SSE 전송 |
| FR-012 | 기존 확인 API와 채널 상태 컬럼 분리 |

## 3. 기술 방향

- Java 21, Spring Boot 3.5, Spring Data JPA를 사용한다.
- 워커는 Spring Boot 내부 `@Scheduled` 컴포넌트로 실행한다.
- 채널별 상태 갱신은 `PENDING` 조건부 UPDATE로 중복 처리를 방지한다.
- 처리 중 프로세스 장애를 고려해 선점 상태는 DB 잠금 또는 짧은 트랜잭션으로 관리한다.
- Python 직접 입력은 `SOURCE_EVENT_ID`를 포함한 DB 계약을 따른다.
- 기존 SSE 브로커와 알람 확인 API의 사용자별 계약을 유지한다.

## 4. 데이터 변경

`TB_M26_ALARM_LOG`에 다음을 추가한다.

- `SOURCE_EVENT_ID`
- `APP_STATUS`
- `EMAIL_STATUS`
- `TEAMS_STATUS`

`TB_M26_ALARM_RULE`에서 DB 저장 여부와 상위 수신자 범위·채널 기본값을 제거한다. `ACKNOWLEDGEMENT_SCOPE`는 유지한다.

`TB_M26_USER_ALERT_PREF`는 `(USER_ID, ALARM_TYPE_CODE)` 복합 유일성을 사용한다. 기존 사용자 단독 유일성은 제거한다.

## 5. 처리 흐름

1. Spring Boot 일반 알람 API 또는 모델 서버 DB 입력이 알람 등록을 요청한다.
2. 알람 등록 서비스가 알람 기준과 수신자 설정을 확인한다.
3. 수신자별 `TB_M26_ALARM_LOG` 행을 생성하고 채널 상태를 `PENDING` 또는 `SKIPPED`로 초기화한다.
4. 내부 워커가 채널별 `PENDING` 행을 선점한다.
5. 앱 알람은 수신자별 SSE로 전송하고 성공/실패 상태를 기록한다.
6. 메일·팀즈 어댑터가 준비된 경우 해당 채널을 전송하고 상태를 기록한다.
7. 실패 상태는 `FAILED`로 종료하며 재시도하지 않는다.

## 6. 검증 계획

- Backend: Maven test, 알람 등록·중복 방지·워커 상태 전이 단위 테스트
- Frontend: 알람 관리 화면 서비스 테스트 및 build
- Migration: Flyway migration test
- 수동: Spring Boot 중단 상태에서 모델 서버 DB 입력 후 재기동하여 알람 조회 확인

## 7. 위험 및 대응

| 위험 | 대응 |
|---|---|
| Spring Boot 중단 중 SSE 불가 | 로그를 DB에 저장하고 재기동 후 목록 조회로 보완 |
| 두 워커 처리 중복 | 조건부 상태 갱신으로 채널 선점 |
| Python과 JPA 필드 불일치 | DB 계약 문서와 migration 컬럼 코멘트 유지 |
| 메일·팀즈 전송 설정 부재 | 어댑터 미설정 채널을 `SKIPPED` 또는 명시적 `FAILED` 처리 |
