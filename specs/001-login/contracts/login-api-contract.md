# 계약: 로그인 API

## 1. 목적

tester 계열 mock 계정이 아닌 사용자가 로그인할 때 frontend가 호출하는 실제 backend API 계약을 정의한다. `tester / tester123`, `tester1 / tester123`은 frontend mock으로 처리하므로 이 API를 호출하지 않는다.

## 2. Endpoint

```http
POST /api/auth/login
Content-Type: application/json
```

## 3. Request

```json
{
  "username": "admin",
  "password": "admin"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `username` | string | yes | 사용자 계정명 |
| `password` | string | yes | 사용자 비밀번호 |

## 4. Success Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "permissions": ["admin:access"]
    },
    "token": "dev-auth-token-admin"
  },
  "timestamp": "2026-08-24T21:30:00"
}
```

규칙:
- `role`은 frontend auth state와 route guard가 사용하는 소문자 값을 반환한다.
- `ADMIN` 계정은 `role=admin`, `permissions=["admin:access"]`를 반환한다.
- 일반 계정은 `role=user`, `permissions=[]`를 반환한다.
- `token`은 개발용 opaque token이며 JWT가 아니다.

## 5. Failure Response

```json
{
  "success": false,
  "error": "AUTH_FAILED",
  "message": "Invalid username or password",
  "timestamp": "2026-08-24T21:30:00"
}
```

실패 조건:
- username 없음
- password 불일치
- `password_hash` 없음
- `enabled=false`
- `account_status`가 `active`가 아님
- `employment_status`가 `employed`가 아님
- 요청 body가 유효하지 않음

모든 실패 조건은 동일한 외부 메시지로 처리한다. 계정 존재 여부나 상태는 응답에 노출하지 않는다.

## 6. Frontend 규칙

- `tester / tester123`은 이 API를 호출하지 않고 관리자 mock user로 로그인한다.
- `tester1 / tester123`은 이 API를 호출하지 않고 비관리자 mock user로 로그인한다.
- `tester` 또는 `tester1`에 잘못된 password가 들어오면 이 API를 호출하지 않고 실패한다.
- 그 외 username은 이 API를 호출한다.
- 성공 응답에 `data.user`와 `data.token`이 모두 있어야 로그인 성공으로 처리한다.
- frontend API client는 로그인 이후 localStorage의 `authUsername`을 `X-Actor-Username` 헤더로 보낸다.
