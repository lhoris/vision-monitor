# 계약: 사용자 관리

## 목적

사용자관리 화면과 service/mock adapter가 공유할 데이터 계약을 정의한다. MVP에서는 실제 backend 구현 요구사항이 아니라 frontend mock contract 기준이다. 단, tester 계열이 아닌 계정에서는 같은 경계로 실제 API 호출을 시도할 수 있게 유지한다.

## Mock 사용 조건

| 로그인 계정 | 처리 |
|-------------|------|
| `tester / tester123` | 관리자 mock 계정. 사용자관리 mock 조회/변경 허용 |
| `tester1 / tester123` | 비관리자 mock 계정. 사용자관리 메뉴/route 접근 차단 |
| 그 외 계정 | 사용자관리 mock 사용 금지. 실제 API 경계 호출 |

## 공통 응답

### 성공

```json
{
  "success": true,
  "data": {}
}
```

### 실패

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값을 확인하세요.",
    "fieldErrors": {
      "username": "이미 사용 중인 사용자 ID입니다."
    }
  }
}
```

권한 없음, 찾을 수 없음, validation 실패 응답에는 `data`를 포함하지 않는다.

## UserAccountDto

```json
{
  "id": 1,
  "username": "tester",
  "name": "테스터",
  "displayName": "테스터 관리자",
  "department": "개발",
  "position": "관리자",
  "email": "tester@example.com",
  "phone": "010-0000-0000",
  "roles": [
    {
      "id": "admin",
      "name": "관리자",
      "isAdminRole": true
    }
  ],
  "accountStatus": "active",
  "employmentStatus": "employed",
  "lastLoginAt": "2026-08-17T09:00:00+09:00",
  "createdAt": "2026-08-01T09:00:00+09:00",
  "createdBy": "system",
  "updatedAt": "2026-08-17T09:00:00+09:00",
  "updatedBy": "tester",
  "personalization": {
    "hasGridLayout": true,
    "layoutCount": 3,
    "canReset": true,
    "lastUpdatedAt": "2026-08-16T18:00:00+09:00"
  }
}
```

## 목록 조회

`GET /api/admin/users`

### Query

| 이름 | 설명 |
|------|------|
| `query` | 사용자 ID, 이름, 표시명 검색 |
| `department` | 부서/소속 |
| `roleId` | 역할 |
| `accountStatus` | `active`, `locked`, `disabled` |
| `employmentStatus` | `employed`, `leave`, `retired` |
| `page` | 페이지 번호 |
| `pageSize` | 표시 건수 |

### Response data

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "summary": {
    "activeCount": 10,
    "lockedCount": 1,
    "disabledCount": 2,
    "retiredCount": 3,
    "adminCount": 2
  }
}
```

## 상세 조회

`GET /api/admin/users/{userId}`

### Response data

`UserAccountDto`

## 신규 등록

`POST /api/admin/users`

### Request

```json
{
  "username": "operator01",
  "name": "운영자01",
  "displayName": "운영자01",
  "department": "냉각",
  "position": "운영자",
  "email": "operator01@example.com",
  "phone": "010-1111-2222",
  "roleIds": ["operator"],
  "accountStatus": "active",
  "employmentStatus": "employed"
}
```

## 수정

`PUT /api/admin/users/{userId}`

신규 등록 request와 같은 shape를 사용한다.

## 비활성화

`POST /api/admin/users/{userId}/disable`

```json
{
  "reason": "장기 미사용"
}
```

## 퇴사 처리

`POST /api/admin/users/{userId}/retire`

```json
{
  "retiredAt": "2026-08-17",
  "personalizationAction": "keep"
}
```

`personalizationAction`: `keep`, `reset`

## 삭제 요청

`POST /api/admin/users/{userId}/delete-request`

```json
{
  "reason": "오등록 사용자",
  "confirmedImpact": true
}
```

## 개인화 초기화

`POST /api/admin/users/{userId}/personalization/reset`

```json
{
  "reason": "퇴사 처리"
}
```

## 오류 코드

| 코드 | 의미 |
|------|------|
| `FORBIDDEN` | 관리자 권한 없음 |
| `USER_NOT_FOUND` | 사용자를 찾을 수 없음 |
| `DUPLICATE_USERNAME` | 사용자 ID 중복 |
| `VALIDATION_ERROR` | 입력값 오류 |
| `SELF_LOCKOUT_RISK` | 자기 계정 잠금 위험 |
| `LAST_ADMIN_RISK` | 마지막 관리자 제거 위험 |
| `MOCK_NOT_ALLOWED` | tester/tester1 외 계정에서 mock 사용 시도 |
