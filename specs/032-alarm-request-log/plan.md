# 구현 계획: 알람 요청 원장과 수신자 로그 분리

**기능 브랜치**: `032-alarm-request-log`  
**명세**: `specs/032-alarm-request-log/spec.md`

## 1. 계획 요약

기존 알람 등록 서비스의 즉시 수신자 로그 생성 책임을 요청 원장 생성으로 분리한다. `TB_M26_ALARM_REQ`와 JPA 엔티티·저장소를 추가하고, 팬아웃 워커가 활성 알람 기준과 수신 설정을 읽어 `TB_M26_ALARM_LOG` 상세를 생성한다. 기존 채널 전송 워커와 확인 API는 로그 상세를 계속 사용한다.

## 2. 기술 방향

- Java 21, Spring Boot, Spring Data JPA, Flyway를 사용한다.
- 요청 생성은 알람 기준 조회와 원장 저장을 하나의 트랜잭션으로 처리한다.
- 기준 누락은 `ALARM_RULE_NOT_FOUND` 오류로 차단한다.
- 요청 중복은 원천 이벤트 ID의 유일성으로 차단한다.
- 로그 중복은 `(ALARM_REQ_ID, TARGET_USER_ID)` 유일성으로 차단한다.
- 팬아웃 워커와 채널 전송 워커는 같은 Spring Boot 프로세스의 스케줄 작업으로 유지한다.

## 3. 데이터 변경

### `TB_M26_ALARM_REQ`

- `ALARM_REQ_ID` PK
- `ALARM_RULE_ID` FK
- `ALARM_CODE`, `ALARM_SEVERITY`, `ALARM_MESSAGE`
- `ALARM_SOURCE_TYPE`, `ALARM_SOURCE_ID`, `SOURCE_EVENT_ID`
- `ALARM_GROUP_ID`, `OCCURRED_TIMESTAMP`, `ALARM_CONTEXT`
- 공통 감사 컬럼

### `TB_M26_ALARM_LOG`

- `ALARM_REQ_ID` FK 추가
- 기존 수신자별 확인·채널 상태 컬럼 유지
- 기존 데이터는 요청 원장과의 연결이 불가능하므로 레거시 로그로 보존한다.

## 4. 처리 흐름

1. API 또는 Python DB 입력이 알람 코드와 원천 이벤트 정보를 제출한다.
2. 등록 서비스가 활성 알람 기준을 조회한다.
3. 기준이 없으면 트랜잭션을 중단하고 오류를 반환한다.
4. 기준이 있으면 요청 원장을 저장한다.
5. 팬아웃 워커가 요청별 수신자를 계산하고 로그 상세를 생성한다.
6. 채널 전송 워커가 로그의 채널별 `PENDING` 상태를 처리한다.

## 5. 검증 계획

- `AlarmIngressServiceTest`: 기준 누락 차단, 원장 생성, 중복 요청
- `AlarmRequestFanoutWorkerTest`: 관리자·사용자별 수신자 분배, 중복 로그 방지
- `AlarmNotificationWorkerTest`: 기존 채널 전송 회귀
- Maven 테스트, 프론트엔드 빌드, Flyway 애플리케이션 구동 검증
