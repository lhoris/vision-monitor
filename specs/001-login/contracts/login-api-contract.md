# 계약: 로그인 API

## 목적

tester mock 계정이 아닌 사용자가 로그인할 때 frontend가 호출하는 임시 로그인 API 계약을 정의한다. backend와 DB가 아직 완성되지 않았더라도 frontend는 이 endpoint를 호출해야 한다.

## Request

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "operator",
  "password": "secret"
}
```

## Success Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 12,
      "username": "operator"
    },
    "token": "access-token"
  },
  "timestamp": "2026-08-16T00:00:00.000Z"
}
```

## Failure Response

```json
{
  "success": false,
  "error": "Invalid username or password",
  "timestamp": "2026-08-16T00:00:00.000Z"
}
```

## Frontend 규칙

- `tester / tester123`은 이 API를 호출하지 않는다.
- `tester` username에 잘못된 password가 들어오면 이 API를 호출하지 않는다.
- username이 `tester`가 아니면 API 구현 여부와 관계없이 이 API를 호출한다.
- 성공 응답에 `data.user`와 `data.token`이 모두 있어야 로그인 성공으로 본다.
- 실패 또는 유효하지 않은 응답은 인증 상태를 만들지 않는다.

