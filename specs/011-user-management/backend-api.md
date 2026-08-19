# 사용자 관리 backend API 설계

## 1. 목적과 범위

이 문서는 `/admin/users` 화면이 실제 Spring Boot API와 MariaDB를 사용하도록 전환할 때 필요한 API 계약을 정의한다. 화면 동작과 사용자 시나리오는 `spec.md`, 공통 도메인 모델은 `data-model.md`, DB 구조는 `backend-database-design.md`를 기준으로 한다.

모든 endpoint는 `/api/admin` 아래에 둔다. 관리자 여부는 frontend가 아니라 backend가 인증 정보와 권한으로 검증한다.

현재 저장소에는 공통 인증 모듈이 아직 없으므로 과도기 구현은 `X-Actor-Username` 요청 헤더를 통해 backend가 사용자 계정을 조회한다. 이 헤더는 인증 토큰을 대체하는 보안 수단이 아니며, JWT 또는 session 인증이 확정되면 인증 주체에서 username을 추출하도록 교체한다.

## 2. 공통 응답

성공:

```json
{
  "success": true,
  "data": {}
}
```

실패:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값을 확인하세요.",
    "fieldErrors": {
      "orgUnitId": "유효하지 않거나 비활성인 조직입니다."
    }
  }
}
```

## 3. 조직 조회

### `GET /api/admin/org-units`

사용자 등록·수정 화면에서 사용할 수 있는 조직 목록을 반환한다.

Query:

```text
parentId   선택. 특정 부모의 하위 조직만 조회
unitType   선택. SITE, DEPARTMENT, SECTION
activeOnly 기본 true
```

비활성 조직은 기존 사용자 상세 표시에는 포함할 수 있지만 신규 소속 선택지에서는 제외한다.

## 4. 사용자 목록

### `GET /api/admin/users`

Query:

```text
query              username, name, displayName 검색
orgUnitId          조직 ID
accountStatus      active, locked, disabled
employmentStatus   employed, leave, retired
page               1부터 시작
pageSize           기본 20, 최대 100
sort               허용된 컬럼과 방향만 허용
```

Response data:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "summary": {
    "activeCount": 0,
    "lockedCount": 0,
    "disabledCount": 0,
    "retiredCount": 0
  }
}
```

## 5. 사용자 CRUD

### `GET /api/admin/users/{userId}`

사용자 상세 정보와 주 소속 조직 정보를 반환한다.

### `POST /api/admin/users`

사용자를 등록한다.

```json
{
  "username": "operator01",
  "name": "운영자01",
  "displayName": "운영자01",
  "email": "operator01@example.com",
  "phone": "010-1111-2222",
  "orgUnitId": 3,
  "accountStatus": "active",
  "employmentStatus": "employed"
}
```

### `PUT /api/admin/users/{userId}`

기본 정보, 주 소속, 계정 상태, 재직 상태를 수정한다. 수정 대상의 `version` 또는 `updatedAt`이 변경된 경우 충돌을 반환한다.

## 6. 상태 변경

### `POST /api/admin/users/{userId}/lock`

계정을 잠근다.

### `POST /api/admin/users/{userId}/unlock`

잠긴 계정을 활성 상태로 복구한다.

### `POST /api/admin/users/{userId}/disable`

계정을 비활성화한다.

### `POST /api/admin/users/{userId}/retire`

재직 상태를 퇴사로 변경한다. 개인화 설정 처리 정책을 함께 받는다.

```json
{
  "reason": "퇴사 처리",
  "personalizationAction": "keep"
}
```

## 7. 삭제 요청

### `POST /api/admin/users/{userId}/delete-request`

즉시 물리 삭제하지 않고 삭제 요청 이력과 상태를 처리한다.

```json
{
  "reason": "오등록 사용자",
  "confirmedImpact": true
}
```

자기 계정, 마지막 관리자, 활성 상태의 사용자에 대한 위험 변경은 backend에서 차단하거나 추가 확인을 요구한다.

## 8. 오류 코드와 HTTP 상태

| HTTP | 코드 | 의미 |
|---:|---|---|
| 401 | `UNAUTHENTICATED` | 로그인 정보 없음 또는 만료 |
| 403 | `FORBIDDEN` | 관리자 권한 없음 |
| 404 | `USER_NOT_FOUND`, `ORG_UNIT_NOT_FOUND` | 대상 없음 |
| 409 | `DUPLICATE_USERNAME`, `LAST_ADMIN_RISK`, `VERSION_CONFLICT` | 충돌 또는 보호 규칙 위반 |
| 422 | `VALIDATION_ERROR` | 입력값 오류 |
| 500 | `INTERNAL_ERROR` | 서버 처리 오류 |

## 9. backend 처리 규칙

- 사용자 API는 frontend의 mock guard를 신뢰하지 않는다.
- `orgUnitId` 존재 여부와 active 여부를 service에서 검증한다.
- 외래키를 사용하지 않으므로 사용자 삭제·조직 비활성화 시 참조 영향을 service에서 확인한다.
- 마지막 관리자 보호와 자기 계정 보호는 트랜잭션 안에서 재검증한다.
- 비밀번호 hash와 인증 token은 사용자관리 응답에 포함하지 않는다.
- 사용자 변경 작업은 수행자, 대상, 변경 내용, 사유를 감사 로그와 연결할 수 있도록 설계한다.

## 10. 미정인 인증 정책

다음은 사용자관리 API 구현 전에 인증 명세와 함께 확정해야 한다.

- JWT 또는 session 방식
- 사용자 등록 시 초기 비밀번호 발급 방식
- 비밀번호 변경·초기화 API
- 로그인 실패 잠금 기준과 해제 방식
- SSO/MFA 연동 여부
