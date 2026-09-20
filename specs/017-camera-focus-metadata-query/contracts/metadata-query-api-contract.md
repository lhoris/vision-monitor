# Metadata Query API Contract

## 공통 규칙

- 모든 관계 ID는 논리 참조이며 물리 FK 제약조건을 사용하지 않는다.
- 기본 조회는 `DATA_END_STATUS = 'N'`이면서 사용 상태인 데이터만 반환한다.
- 인증된 요청만 허용하며 구성 변경은 관리자 권한이 필요하다.

## Query 목록

`GET /api/metadata/queries`

응답은 활성 Query의 `queryCode`, `queryName`, `description`, `resultSchema`, `enabled`를 반환한다. SQL Text는 관리자 관리 화면 외의 조회 응답에 포함하지 않는다.

## Query 실행

`POST /api/metadata/queries/{queryCode}/execute`

요청:

```json
{
  "sourceId": 2,
  "parameters": { "sourceId": 2 }
}
```

응답:

```json
{
  "queryCode": "camera.connection-status",
  "schema": [],
  "rows": [],
  "fetchedAt": "2026-09-19T10:00:00Z"
}
```

## 영상 소스 프로파일

`GET /api/metadata/profiles/{sourceId}`

`PUT /api/metadata/profiles/{sourceId}`

프로파일과 활성 섹션 목록을 반환·저장한다. 섹션에는 `sectionCode`, `title`, `type`, `order`, `visible`, `queryCode`, `refreshIntervalSec`, `defaultText`, `mapping`이 포함된다.

`POST /api/metadata/profiles/{sourceId}/reset`

해당 영상 소스의 기본 프로파일을 복원한다. 삭제는 논리 삭제로 처리한다.

## 오류 코드

- `METADATA_QUERY_NOT_FOUND`
- `METADATA_QUERY_DISABLED`
- `METADATA_QUERY_INVALID`
- `METADATA_QUERY_EXECUTION_FAILED`
- `METADATA_PROFILE_NOT_FOUND`
- `METADATA_SECTION_INVALID`
- `FORBIDDEN`
