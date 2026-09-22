# 데이터 모델: DB 세션 영속화

## TB_M26_AUTH_SESSION

### Audit 컬럼

기존 M26 테이블과 동일하게 아래 컬럼을 업무 컬럼보다 먼저 배치한다.

`CREATED_OBJECT_TYPE`, `CREATED_OBJECT_ID`, `CREATED_PROGRAM_ID`, `CREATED_TIMESTAMP`, `LAST_UPDATED_OBJECT_TYPE`, `LAST_UPDATED_OBJECT_ID`, `LAST_UPDATED_PROGRAM_ID`, `LAST_UPDATED_TIMESTAMP`, `DATA_END_STATUS`, `DATA_END_OBJECT_TYPE`, `DATA_END_OBJECT_ID`, `DATA_END_PROGRAM_ID`, `DATA_END_TIMESTAMP`

### 업무 컬럼

| 컬럼 | 역할 | 규칙 |
|---|---|---|
| `AUTH_SESSION_ID` | 세션 식별자 | PK, 자동 증가 |
| `USER_ID` | 사용자 식별자 | 논리적 참조, FK 없음 |
| `TOKEN_HASH` | 세션 토큰 해시 | 원문 토큰 저장 금지 |
| `EXPIRES_TIMESTAMP` | 만료 시각 | 로그인 시각 + 8시간 |
| `LAST_ACCESSED_TIMESTAMP` | 마지막 검증 시각 | 유효 세션 검증 시 갱신 |
| `REVOKED_TIMESTAMP` | 폐기 시각 | 로그아웃 시 기록 |
| `REMARKS` | 비고 | 선택값 |

### 제약조건 규칙

- PK 외 UK를 만들지 않는다.
- 별도 INDEX를 만들지 않는다.
- FK를 만들지 않는다.
- `DATA_END_STATUS = 'N'`이고 `REVOKED_TIMESTAMP IS NULL`이며 `EXPIRES_TIMESTAMP > 현재 시각`인 세션만 유효 후보로 본다.

## 상태 전이

`ACTIVE -> EXPIRED`: 만료 시각 도달

`ACTIVE -> REVOKED`: 로그아웃

`ACTIVE -> ENDED`: 데이터 종료 처리

`EXPIRED`, `REVOKED`, `ENDED` 상태는 인증에 사용할 수 없다.
