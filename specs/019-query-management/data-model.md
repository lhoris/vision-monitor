# 데이터 모델: 쿼리 관리 메뉴

## 적용 테이블

신규 테이블을 생성하지 않고 기존 `TB_M26_METADATA_QUERY`를 사용한다.

## TB_M26_METADATA_QUERY

| 컬럼 | 규칙 | 관리 화면 사용 |
|---|---|---|
| `METADATA_QUERY_ID` | PK, 자동 생성 | 읽기 전용 식별자 |
| `QUERY_CODE` | 필수, 논리적 고유값 | Query ID |
| `QUERY_NAME` | 필수 | Query 명칭 |
| `QUERY_DESCRIPTION` | 선택 | 설명 |
| `SQL_TEXT` | 필수, 조회 전용 검증 | Query SQL |
| `PARAMETER_SCHEMA` | 선택 JSON | 허용 파라미터 정의 |
| `RESULT_SCHEMA` | 선택 JSON | 결과 필드 정의 |
| `QUERY_TIMEOUT_SEC` | 양수, 기본 5초 | 조회 제한시간 |
| `USE_STATUS` | `Y`/`N` | 활성/비활성 |
| 표준 Audit 컬럼 | 프로젝트 규칙 준수 | 생성·수정·논리 삭제 추적 |

## 논리 참조

- `TB_M26_VIDEO_METADATA_SECTION.METADATA_QUERY_ID`가 Query를 논리적으로 참조한다.
- 물리 `FOREIGN KEY` 제약조건은 사용하지 않는다.
- Query 삭제 전 활성 또는 비활성 상태의 미종료 섹션 참조를 서비스에서 확인한다.
- `DATA_END_STATUS = 'Y'`인 Query는 신규 참조 목록에서 제외한다.
- Query ID는 수정하지 않으며 식별자 변경은 신규 Query 등록으로 처리한다.

## 상태 규칙

| 상태 | 목록 | 신규 참조 | 실행 |
|---|---|---|---|
| 활성 | 표시 | 허용 | 허용 |
| 비활성 | 상태 필터에서 표시 | 불가 | 기존 섹션에서도 실패/비활성 상태 |
| 논리 삭제 | 기본 목록 제외 | 불가 | 불가 |

## 저장 검증

- Query ID: 공백 없는 영문 대소문자, 숫자, `.`, `_`, `-`만 허용
- SQL: `SELECT` 또는 `WITH`로 시작하는 단일 조회 문장만 허용
- 차단 대상: 데이터 변경, DDL, 프로시저 호출, 다중 문장, 주석 기반 우회
- 제한시간: 1초 이상 시스템 최대값 이하
- JSON 필드: 파라미터와 결과 Schema가 유효한 JSON이어야 함
