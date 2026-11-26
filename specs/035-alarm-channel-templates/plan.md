# 구현 계획: 알람 채널별 메시지 템플릿 관리

## 1. 계획 요약

기존 `TB_M26_ALARM_RULE`에 채널별 템플릿을 추가하고, 알람 기준 관리 API와 화면에서 이를 편집한다. 알람 요청은 발생 문맥을 JSON으로 보존하고, fan-out 시 기준 템플릿을 치환해 `TB_M26_ALARM_LOG`에 채널별 결과를 저장한다.

## 2. 기술 컨텍스트

- 백엔드: Java 21, Spring Boot, Spring Data JPA, Flyway, MariaDB/MySQL
- 프론트엔드: React, TypeScript, Vite, 기존 공통 그리드 및 다국어 구조
- 템플릿: 서버 측 단순 `{{variable}}` 치환
- 기존 구조: `AlarmRule` → `AlarmRequest` → `AlarmLog`, `AlarmRuleUser` 수신자 상세
- 검증: backend Maven test, frontend `npm run build`

## 3. 설계

### 데이터

- `TB_M26_ALARM_RULE`: `APP_MESSAGE_TEMPLATE`, `EMAIL_SUBJECT_TEMPLATE`, `EMAIL_BODY_TEMPLATE`, `TEAMS_MESSAGE_TEMPLATE` 추가
- `TB_M26_ALARM_REQ`: `ALARM_CONTEXT`를 JSON 문자열로 저장
- `TB_M26_ALARM_LOG`: 채널별 결과 보존을 위해 `EMAIL_SUBJECT`, `EMAIL_BODY`, `TEAMS_MESSAGE` 추가

### API

- 알람 기준 조회/생성/수정 DTO에 템플릿 필드 포함
- 모델/내부 알람 입력 계약은 기존 `metadata`를 문맥으로 사용
- 기존 API 경로는 유지하고 응답 필드만 확장

### UI

- 마스터 그리드에 채널별 템플릿 편집 영역을 추가한다.
- 긴 이메일 본문은 별도 텍스트 영역으로 제공한다.
- 저장·조회·오류 메시지는 기존 알람 기준 관리 패턴을 유지한다.
- 변수 도움말을 표시하고 템플릿을 저장할 수 있게 한다.

## 4. 헌법 검토

- 기존 구조 존중: 기존 알람 기준·요청·로그 테이블을 확장하고 새 템플릿 테이블은 만들지 않는다.
- 계약 우선: 기존 알람 입력 계약과 관리 API의 호환성을 유지한다.
- 테스트 가능성: 치환 서비스, fan-out, API DTO, 프론트 빌드를 검증한다.
- 한국어 우선: 화면 라벨과 오류 메시지는 한국어를 우선 제공한다.

## 5. 위험 및 대응

| 위험 | 대응 |
|---|---|
| 기존 migration에 컬럼이 없음 | 신규 Flyway migration에서 nullable 컬럼으로 추가 |
| 문맥 값이 없는 변수 | 빈 문자열로 치환하고 알람 처리는 계속 진행 |
| HTML 본문 저장 위험 | 발송 구현 전까지 저장·조회만 하고 렌더링은 이메일 어댑터 책임으로 제한 |
| 템플릿 길이 증가 | TEXT 컬럼 사용 |
