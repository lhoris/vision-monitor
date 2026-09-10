# M26 데이터베이스 설계 규칙

이 문서는 M26 업무 테이블의 공통 물리 설계 규칙을 정의한다. 신규 테이블과 기존 테이블 재설계 시 이 규칙을 기준으로 DDL, Entity, API DTO를 함께 작성한다.

## 1. 컬럼 배치 순서

모든 M26 업무 테이블의 컬럼은 다음 순서로 배치한다.

```text
공통 Audit 컬럼 -> PK 컬럼 -> Attribute 컬럼
```

공통 Audit 컬럼은 모든 업무 테이블의 최상단에 두며, PK는 Audit 컬럼 다음에 둔다. Attribute 컬럼은 업무 의미와 조회/입력 흐름을 기준으로 배치한다.

## 2. 공통 Audit 컬럼

아래 컬럼명, 순서, 타입, 기본값을 공통 표준으로 사용한다.

```sql
CREATED_OBJECT_TYPE       VARCHAR(1)  DEFAULT NULL COMMENT '생성Object유형',
CREATED_OBJECT_ID         VARCHAR(22) DEFAULT NULL COMMENT '생성ObjectID',
CREATED_PROGRAM_ID        VARCHAR(22) DEFAULT NULL COMMENT '생성프로그램ID',
CREATED_TIMESTAMP          DATETIME    DEFAULT CURRENT_TIMESTAMP() COMMENT '생성일시',
LAST_UPDATED_OBJECT_TYPE  VARCHAR(1)  DEFAULT NULL COMMENT '최종변경Object유형',
LAST_UPDATED_OBJECT_ID    VARCHAR(22) DEFAULT NULL COMMENT '최종변경ObjectID',
LAST_UPDATED_PROGRAM_ID   VARCHAR(22) DEFAULT NULL COMMENT '최종변경프로그램ID',
LAST_UPDATED_TIMESTAMP    DATETIME    DEFAULT CURRENT_TIMESTAMP() COMMENT '최종변경일시',
DATA_END_STATUS            VARCHAR(1)  DEFAULT 'N' COMMENT '데이터종료여부',
DATA_END_OBJECT_TYPE       VARCHAR(1)  DEFAULT NULL COMMENT '데이터종료Object유형',
DATA_END_OBJECT_ID         VARCHAR(22) DEFAULT NULL COMMENT '데이터종료ObjectID',
DATA_END_PROGRAM_ID        VARCHAR(22) DEFAULT NULL COMMENT '데이터종료프로그램ID',
DATA_END_TIMESTAMP         DATETIME    DEFAULT NULL COMMENT '데이터종료일시'
```

## 3. 데이터 종료 정책

- `DATA_END_STATUS = 'N'`: 현재 사용 가능한 데이터
- `DATA_END_STATUS = 'Y'`: 종료된 데이터
- 종료 처리는 물리 삭제보다 논리 종료를 우선한다.
- 일반 조회는 기본적으로 `DATA_END_STATUS = 'N'`인 데이터만 조회한다.
- 종료 처리 시 `DATA_END_OBJECT_TYPE`, `DATA_END_OBJECT_ID`, `DATA_END_PROGRAM_ID`, `DATA_END_TIMESTAMP`를 함께 기록한다.
- 생성/최종변경/종료 주체의 Object ID와 Program ID는 최대 22자의 문자열 식별자로 관리한다.

## 4. PK와 Attribute 규칙

- PK는 공통 Audit 컬럼 다음에 배치한다.
- PK 명칭과 타입은 테이블별 업무 식별 정책을 먼저 확정한 뒤 결정한다.
- 업무 Attribute에는 DB 컬럼명을 사용하며, Entity와 API DTO에서만 프로젝트 언어 규칙에 맞게 변환한다.
- 상태, 유형, 코드성 값은 임의의 문자열을 추가하지 않고 공통 코드 체계 또는 테이블별 명세로 관리한다.
- 다른 업무 테이블과의 관계는 FK 여부와 관계없이 컬럼명, 참조 대상, 삭제/종료 정책을 설계 문서에 명시한다.

## 5. 적용 원칙

현재 `TB_M26_USERS`를 포함한 기존 테이블은 이 규칙을 완전히 따르지 않는다. 기존 테이블을 신규 표준으로 전환할 때는 기존 migration을 임의 수정하지 않고, 별도 migration으로 다음을 함께 처리한다.

1. 테이블명과 컬럼명 변경
2. 공통 Audit 컬럼 추가 및 기존 시간/주체 컬럼의 통합
3. 논리 종료 컬럼과 조회 조건 반영
4. Entity, Repository, Service, DTO, frontend contract 동기화
5. 기존 데이터 변환 및 rollback 가능성 검토

## 6. M26 기준 테이블 목록

기존에 임시로 생성한 `TB_M26_USERS` 및 그 확장 구조는 최종 모델로 사용하지 않는다. 사용자/권한/개인화 영역은 아래 테이블을 기준으로 재설계한다.

모든 테이블은 `공통 Audit 컬럼 -> PK -> Attribute 컬럼` 순서를 따른다.

### 6.1 공통코드: `TB_M26_CODE`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `CODE_ID` | `INT(15) UNSIGNED AUTO_INCREMENT` | 공통코드ID |
| `CODE_NAME` | `VARCHAR(50)` | 공통코드명 |
| `CODE_DESCRIPTION` | `VARCHAR(120)` | 공통코드설명 |
| `CODE_TYPE` | `VARCHAR(20)` | 공통코드유형 |
| `REMARKS` | `VARCHAR(4000)` | 비고 |

### 6.2 공통코드상세: `TB_M26_CODE_DETAIL`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `CODE_DETAIL_ID` | `INT(15) UNSIGNED AUTO_INCREMENT` | 공통코드상세ID |
| `CODE_ID` | `INT(15) UNSIGNED` | 공통코드ID |
| `CODE_VALUE` | `VARCHAR(30)` | 공통코드값 |
| `CODE_VALUE_NAME` | `VARCHAR(100)` | 공통코드값명 |
| `CODE_VALUE_DESCRIPTION` | `VARCHAR(1000)` | 공통코드값설명 |
| `SORT_ORDER` | `INT(2)` | 정렬순서 |
| `DEFAULT_VALUE` | `VARCHAR(30)` | 기본값 |
| `REMARKS` | `VARCHAR(4000)` | 비고 |

### 6.3 사용자: `TB_M26_USER`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `USER_ID` | `INT(15) UNSIGNED AUTO_INCREMENT` | ERP User Internal ID |
| `USER_EMP_NO` | `VARCHAR(20) NOT NULL` | 사용자직번 |
| `USER_NAME` | `VARCHAR(100)` | ERP 시스템 사용자명 |
| `ENCRYPTED_FOUNDATION_PASSWORD` | `VARCHAR(100) NULL` | 업무담당자 비밀번호. 비밀번호 초기화 시 `NULL`로 전환 |
| `REMARKS` | `VARCHAR(4000)` | 비고 |

### 6.4 권한: `TB_M26_AUTH`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `AUTH_ID` | `INT(15) UNSIGNED AUTO_INCREMENT` | 권한ID |
| `AUTH_CODE` | `VARCHAR(30)` | 권한코드 |
| `AUTH_NAME` | `VARCHAR(100)` | 권한명 |
| `AUTH_TYPE` | `VARCHAR(8)` | 권한유형 |
| `AUTH_DESCRIPTION` | `VARCHAR(1000)` | 권한설명 |
| `REMARKS` | `VARCHAR(4000)` | 비고 |

### 6.5 사용자별 권한: `TB_M26_USER_AUTH`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `USER_AUTH_ID` | `INT(15) UNSIGNED AUTO_INCREMENT` | 사용자권한ID |
| `USER_ID` | `INT(15) UNSIGNED` | 사용자ID |
| `AUTH_ID` | `INT(15) UNSIGNED` | 권한ID |
| `GRANT_START_DT` | `VARCHAR(8)` | 권한 시작일, `YYYYMMDD` |
| `GRANT_END_DT` | `VARCHAR(8)` | 권한 종료일, `YYYYMMDD` |
| `REMARKS` | `VARCHAR(4000)` | 비고 |

### 6.6 사용자별 개인화: `TB_M26_USER_PERSONAL`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `USER_PERSONAL_ID` | `INT(15) UNSIGNED AUTO_INCREMENT` | 사용자개인화ID |
| `USER_ID` | `INT(15) UNSIGNED` | 사용자ID |
| `PERSONAL_NAME` | `VARCHAR(100)` | 개인화명 |
| `PERSONAL_DATA` | `JSON` | 개인화 데이터 |
| `SORT_ORDER` | `INT(2)` | 정렬순서 |
| `REMARKS` | `VARCHAR(4000)` | 비고 |

## 7. 제약조건 및 애플리케이션 검증

- `USER_EMP_NO`는 업무적으로 중복되지 않지만 DB UNIQUE 제약조건은 두지 않는다.
- `TB_M26_USER_AUTH`의 사용자·권한 중복 및 권한 기간 중복은 DB UNIQUE 제약조건으로 막지 않는다.
- 사용자번호 중복과 권한 중복 허용 여부는 애플리케이션 영역에서 검증하고 결정한다.
- `GRANT_START_DT`, `GRANT_END_DT`는 날짜만 저장하며 `YYYYMMDD` 8자리 문자열로 관리한다.
- `GRANT_START_DT`와 `GRANT_END_DT`의 형식 및 기간 유효성은 애플리케이션에서 검증한다.
- 각 PK의 `INT(15) UNSIGNED` 사용은 제공된 기준을 따른다.
- `DATA_END_STATUS`가 모든 관계 테이블에도 적용되는지는 전체 테이블 DDL 작성 시 확정한다.
