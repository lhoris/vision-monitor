# 공통코드 API 계약

## 일반 조회

### `GET /api/common-codes/bootstrap`

로그인 직후 또는 전체 캐시 갱신 시 호출한다.

```json
{
  "success": true,
  "data": {
    "version": "2026-09-11T00:00:00Z",
    "codes": {
      "VIDEO_PROTOCOL": {
        "code": "VIDEO_PROTOCOL",
        "description": "영상 프로토콜",
        "type": "SYSTEM",
        "items": [
          { "value": "HLS", "name": "HLS", "sortOrder": 1, "defaultValue": "N" }
        ]
      }
    }
  }
}
```

### `GET /api/common-codes/{codeName}`

특정 코드 그룹 하나를 조회한다. 존재하지 않거나 비활성 상태면 `CODE_NOT_FOUND`를 반환한다.

### `GET /api/common-codes?names=VIDEO_PROTOCOL,USER_STATUS`

화면 진입 시 필요한 코드 그룹만 조회한다. `names`가 없으면 bootstrap과 동일하게 전체 활성 목록을 반환한다.

## 관리자

관리자 CRUD API는 마스터와 상세값을 별도 요청으로 처리한다. 삭제 endpoint는 물리 삭제가 아니라 `DATA_END_STATUS='Y'`로 변경한다. 성공 응답은 저장된 최신 DTO를 반환하고, 중복 또는 필수값 오류는 `VALIDATION_ERROR` 또는 `DUPLICATE_CODE`/`DUPLICATE_CODE_VALUE`로 구분한다.

관리자 화면은 저장 성공 후 `GET /api/common-codes/bootstrap`을 다시 호출해 현재 클라이언트 메모리 캐시를 갱신한다.
