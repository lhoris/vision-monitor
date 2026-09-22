# 인증 세션 계약

## 기존 로그인

`POST /api/auth/login`은 기존과 동일하게 사용자 정보와 opaque bearer token을 반환한다. 응답 구조와 오류 계약은 변경하지 않는다.

## 세션 확인

`GET /api/auth/session`은 `Authorization: Bearer <token>` 헤더의 영속 세션이 유효할 때 기존 사용자 정보를 반환한다.

세션이 없거나 만료/폐기/데이터 종료 상태이면 HTTP 401과 기존 인증 실패 오류를 반환한다.

## 로그아웃

`POST /api/auth/logout`은 현재 bearer token에 연결된 세션을 논리 폐기한다.

- 이미 만료되거나 폐기된 세션이어도 클라이언트 정리는 성공적으로 완료할 수 있다.
- 로그아웃 요청이 실패해도 프론트엔드는 localStorage 인증 정보를 제거한다.
- 로그아웃 이후 같은 token으로 보호된 요청을 보낼 수 없다.
