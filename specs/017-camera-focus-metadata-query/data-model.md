# 데이터 모델: 화면 확대 보기 메타데이터 Query 구성

## 공통 원칙

- 모든 테이블은 `TB_M26_*` 명명 규칙을 따른다.
- 테이블 간 관계는 논리 참조만 사용한다. 물리 `FOREIGN KEY` 제약조건은 생성하지 않는다.
- 논리 참조 컬럼은 명시적인 ID 컬럼명과 인덱스로 관계를 표현하고, 존재 여부·활성 여부·`DATA_END_STATUS`는 서비스에서 검증한다.
- 삭제는 물리 삭제가 아닌 `DATA_END_STATUS = 'Y'`와 삭제 Audit 컬럼 갱신으로 처리한다.
- 모든 관리성 테이블은 생성·수정·종료 Audit 컬럼 전체 세트를 가진다.

## 공통 Audit 컬럼

```text
CREATED_OBJECT_TYPE VARCHAR(1)
CREATED_OBJECT_ID VARCHAR(22)
CREATED_PROGRAM_ID VARCHAR(22)
CREATED_TIMESTAMP DATETIME
LAST_UPDATED_OBJECT_TYPE VARCHAR(1)
LAST_UPDATED_OBJECT_ID VARCHAR(22)
LAST_UPDATED_PROGRAM_ID VARCHAR(22)
LAST_UPDATED_TIMESTAMP DATETIME
DATA_END_STATUS VARCHAR(1)
DATA_END_OBJECT_TYPE VARCHAR(1)
DATA_END_OBJECT_ID VARCHAR(22)
DATA_END_PROGRAM_ID VARCHAR(22)
DATA_END_TIMESTAMP DATETIME
```

## TB_M26_METADATA_QUERY

Query 정의와 실행 정책을 관리한다.

| 컬럼 | 타입 | 규칙 |
|---|---|---|
| `METADATA_QUERY_ID` | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| `QUERY_CODE` | VARCHAR(100) | 필수, 논리 식별자, UNIQUE 인덱스 |
| `QUERY_NAME` | VARCHAR(200) | 필수 |
| `QUERY_DESCRIPTION` | VARCHAR(1000) | 선택 |
| `SQL_TEXT` | LONGTEXT | 필수, 조회 전용 검증 대상 |
| `PARAMETER_SCHEMA` | LONGTEXT | JSON 문자열 |
| `RESULT_SCHEMA` | LONGTEXT | JSON 문자열 |
| `QUERY_TIMEOUT_SEC` | INT UNSIGNED | 기본 5, 양수 |
| `USE_STATUS` | VARCHAR(1) | 기본 `Y` |
| 공통 Audit | - | 필수 |

## TB_M26_VIDEO_METADATA_PROFILE

영상 소스에 적용되는 섹션 묶음이다.

| 컬럼 | 타입 | 규칙 |
|---|---|---|
| `METADATA_PROFILE_ID` | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| `VIDEO_SOURCE_ID` | BIGINT UNSIGNED | 영상 소스 논리 참조, FK 없음 |
| `PROFILE_NAME` | VARCHAR(200) | 필수 |
| `DEFAULT_STATUS` | VARCHAR(1) | 기본 프로파일 여부 |
| `USE_STATUS` | VARCHAR(1) | 기본 `Y` |
| 공통 Audit | - | 필수 |

인덱스: `(VIDEO_SOURCE_ID, USE_STATUS, DATA_END_STATUS)`.

## TB_M26_VIDEO_METADATA_SECTION

프로파일 내부의 표시 섹션을 관리한다.

| 컬럼 | 타입 | 규칙 |
|---|---|---|
| `METADATA_SECTION_ID` | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| `METADATA_PROFILE_ID` | BIGINT UNSIGNED | 프로파일 논리 참조, FK 없음 |
| `SECTION_CODE` | VARCHAR(100) | 프로파일 내 논리 식별자 |
| `SECTION_TITLE` | VARCHAR(200) | 필수 |
| `SECTION_TYPE` | VARCHAR(20) | `TEXT`, `GRID`, `CHART` |
| `TEXT_DISPLAY_MODE` | VARCHAR(20) | `TEXT` 유형에서 `FREE` 또는 `LABEL_VALUE`, 기본 `FREE` |
| `SORT_ORDER` | INT UNSIGNED | 기본 0 |
| `VISIBLE_STATUS` | VARCHAR(1) | 기본 `Y` |
| `METADATA_QUERY_ID` | BIGINT UNSIGNED | Query 논리 참조, 선택 |
| `REFRESH_INTERVAL_SEC` | INT UNSIGNED | 5, 10, 30, 60 중 하나 |
| `DEFAULT_TEXT` | VARCHAR(4000) | 선택 |
| `SECTION_OPTIONS` | LONGTEXT | JSON 문자열 |
| 공통 Audit | - | 필수 |

인덱스: `(METADATA_PROFILE_ID, SORT_ORDER, DATA_END_STATUS)`.

## TB_M26_METADATA_SECTION_FIELD

그리드 컬럼, 텍스트 필드, 차트 축과 계열 등 결과 매핑을 관리한다.

| 컬럼 | 타입 | 규칙 |
|---|---|---|
| `SECTION_FIELD_ID` | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| `METADATA_SECTION_ID` | BIGINT UNSIGNED | 섹션 논리 참조, FK 없음 |
| `FIELD_ROLE` | VARCHAR(30) | `LABEL`, `VALUE`, `COLUMN`, `X_AXIS`, `SERIES` 등 |
| `SOURCE_FIELD_NAME` | VARCHAR(100) | Query 결과 필드명 |
| `DISPLAY_LABEL` | VARCHAR(200) | 화면 표시명 |
| `DISPLAY_ORDER` | INT UNSIGNED | 기본 0 |
| `FORMAT_TYPE` | VARCHAR(30) | `TEXT`, `NUMBER`, `DATETIME`, `BOOLEAN` |
| `FORMAT_PATTERN` | VARCHAR(100) | 선택 |
| `CHART_COLOR` | VARCHAR(20) | 선택 |
| 공통 Audit | - | 필수 |

인덱스: `(METADATA_SECTION_ID, DISPLAY_ORDER, DATA_END_STATUS)`.

## 논리 관계 검증

1. 프로파일 저장 시 영상 소스 ID의 활성 여부를 서비스에서 확인한다.
2. 섹션 저장 시 프로파일 ID가 존재하고 활성인지 서비스에서 확인한다.
3. Query ID가 입력된 섹션은 Query 정의가 존재하고 사용 상태인지 서비스에서 확인한다.
4. 필드 매핑 저장 시 섹션의 Query 결과 Schema에 필드가 존재하는지 검증한다.
5. 모든 목록 조회는 `DATA_END_STATUS = 'N'`을 기본 조건으로 사용한다.
