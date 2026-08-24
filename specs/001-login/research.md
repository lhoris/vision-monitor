# 연구: 로그인

## 1. BCrypt password_hash

**Decision**: 실제 backend 로그인은 `users.password_hash` 컬럼의 BCrypt hash로 비밀번호를 검증한다.

**Rationale**: plain text password 저장은 개발 단계에서도 보안 부채가 크다. BCrypt는 password 저장에 널리 쓰이는 검증 방식이고, Spring Boot 환경에서 구현과 테스트가 단순하다.

**Alternatives considered**:
- plain text password 컬럼: 빠르지만 보안 기준에 맞지 않아 제외.
- 코드 상수 `admin/admin`: DB 기반 사용자관리과 연결되지 않아 제외.

## 2. 로그인 성공 응답 shape

**Decision**: 성공 응답의 `user` 객체는 `id`, `username`, `role`, `permissions`를 포함한다.

**Rationale**: frontend는 이미 `role`과 `permissions`로 관리자 메뉴와 보호 route를 판단한다. 로그인 직후 별도 권한 조회 API를 추가하지 않아도 사용자관리 화면으로 이동할 수 있다.

**Alternatives considered**:
- `role`만 반환: 권한 확장 시 frontend 추론이 늘어난다.
- `id`, `username`만 반환: 별도 권한 조회 API가 필요해 이번 범위가 커진다.

## 3. 개발용 opaque token

**Decision**: 로그인 성공 시 개발용 opaque token을 반환하고, API actor 식별은 기존 `X-Actor-Username` 헤더를 유지한다.

**Rationale**: 현재 사용자관리 backend API가 `X-Actor-Username` 기반으로 동작한다. JWT/session을 지금 도입하면 보안 범위가 커지고 사용자관리 검증 병목이 늘어난다.

**Alternatives considered**:
- JWT: 장기적으로 적합하지만 이번 증분에는 과하다.
- token 없음: frontend의 기존 auth state와 API client 계약을 약화시킨다.

## 4. 초기 관리자 seed

**Decision**: `admin/admin` 초기 계정은 Flyway seed migration으로 관리하고 비밀번호는 BCrypt hash만 저장한다.

**Rationale**: schema와 seed를 같은 Flyway 흐름으로 관리하면 로컬 DB 재생성과 환경 검증이 반복 가능하다.

**Alternatives considered**:
- 수동 SQL 입력: 재현성이 낮다.
- 앱 시작 시 자동 생성: application runtime에 seed 책임이 섞인다.

## 5. 제한 상태 계정의 실패 처리

**Decision**: `active + employed + enabled=true` 계정만 로그인 허용하고, 그 외 상태는 동일한 로그인 실패 메시지를 표시한다.

**Rationale**: 로그인 화면에서 계정 존재 여부나 상태를 드러내면 계정 enumeration 위험이 생긴다.

**Alternatives considered**:
- 상태별 상세 메시지: 사용자 안내는 좋아지지만 보안 노출이 커진다.
- locked 상태 무시: 사용자관리의 account lifecycle과 충돌한다.
