# Query 관리 API 계약

Query 관리 API는 인증된 관리자 또는 Query 관리 권한 사용자만 호출할 수 있다. 응답은 프로젝트 공통 `ApiResponse` 계약을 따른다.

## 목록 조회

`GET /api/admin/metadata/queries`

Query ID, 명칭, 설명, 사용 여부, 수정일시, 참조 상태를 반환한다. 기본적으로 논리 삭제 데이터는 제외한다.

Query SQL 전문은 관리자 관리 화면에서 필요한 경우에만 상세 응답으로 제공한다.

## 상세 조회

`GET /api/admin/metadata/queries/{queryId}`

등록·수정 화면에 필요한 Query 정의, SQL, 파라미터 Schema, 결과 Schema, 제한시간, 사용 여부와 참조 상태를 반환한다.

## 등록

`POST /api/admin/metadata/queries`

요청에는 Query ID, 명칭, 설명, SQL, 파라미터 Schema, 결과 Schema, 제한시간, 사용 여부를 포함한다. 저장 전 Query ID 중복과 SQL 조회 전용 여부를 검증한다.

## 수정

`PUT /api/admin/metadata/queries/{queryId}`

Query ID는 경로 식별자로만 사용하며 변경할 수 없다. SQL이나 Schema 변경 후 기존 메타데이터 섹션의 Query ID 연결은 유지한다.

## 활성화·비활성화

- `POST /api/admin/metadata/queries/{queryId}/activate`
- `POST /api/admin/metadata/queries/{queryId}/deactivate`

비활성화는 참조 중인 섹션이 있어도 허용한다. 신규 메타데이터 Query 선택 목록에서는 제외한다.

## 논리 삭제

`POST /api/admin/metadata/queries/{queryId}/delete`

참조 중인 Query는 `METADATA_QUERY_REFERENCED` 오류로 거부한다. 삭제 확인은 frontend 공통 확인 모달에서 수행하고, backend는 항상 논리 삭제만 처리한다.

## 오류 코드

- `FORBIDDEN`: Query 관리 권한 없음
- `METADATA_QUERY_NOT_FOUND`: Query 없음 또는 논리 삭제됨
- `METADATA_QUERY_DUPLICATE`: Query ID 중복
- `METADATA_QUERY_INVALID`: SQL, Schema, 파라미터 또는 제한시간 검증 실패
- `METADATA_QUERY_REFERENCED`: 메타데이터 섹션에서 참조 중
- `METADATA_QUERY_SAVE_FAILED`: 저장 실패
