# 데이터 모델: 로그인

## 1. 개요

로그인 기능은 frontend 입력값, backend 인증 결과, `users` 테이블의 인증 관련 필드를 사용한다. 이번 범위는 실제 backend 로그인에 필요한 최소 데이터만 정의한다.

## 2. LoginCredentials

사용자가 로그인 화면에서 제출하는 입력이다.

| 필드 | 타입 | 규칙 |
|------|------|------|
| `username` | string | 필수, 앞뒤 공백 제거 후 비교 |
| `password` | string | 필수, backend 응답이나 로그에 원문을 남기지 않음 |

## 3. UserAccount 인증 필드

기존 `users` 테이블을 확장해 실제 backend 로그인에 사용한다.

| 필드 | 타입 | 규칙 |
|------|------|------|
| `id` | BIGINT | 사용자 식별자 |
| `username` | VARCHAR(255) | unique, case-insensitive 조회 기준 |
| `password_hash` | VARCHAR(255) NULL | BCrypt hash. 실제 backend 로그인 가능 계정은 값이 있어야 함 |
| `role` | VARCHAR(50) | `ADMIN` 또는 `USER` |
| `enabled` | BOOLEAN | `true`일 때만 로그인 가능 |
| `account_status` | VARCHAR(20) | `active`일 때만 로그인 가능 |
| `employment_status` | VARCHAR(20) | `employed`일 때만 로그인 가능 |

`password_hash`는 기존 데이터 호환을 위해 nullable로 추가한다. 값이 없는 계정은 실제 backend 로그인에 실패한다.

## 4. AuthenticatedUser

로그인 성공 후 frontend auth state에 저장되는 사용자 정보다.

| 필드 | 타입 | 규칙 |
|------|------|------|
| `id` | number | `users.id` |
| `username` | string | 로그인 계정명 |
| `role` | string | frontend route guard 기준. admin 계정은 `admin` |
| `permissions` | string[] | 관리자 메뉴 접근에는 `admin:access` 포함 |

## 5. LoginResult

`POST /api/auth/login` 성공 응답의 data payload다.

| 필드 | 타입 | 규칙 |
|------|------|------|
| `user` | AuthenticatedUser | role과 permissions 포함 |
| `token` | string | 개발용 opaque token. JWT가 아님 |

## 6. 상태 및 검증 규칙

- 로그인 성공 조건은 password match, `enabled=true`, `account_status=active`, `employment_status=employed`를 모두 만족해야 한다.
- 실패 원인이 username 없음, password mismatch, 상태 제한, password_hash 없음 중 무엇이든 frontend에는 동일한 로그인 실패 메시지를 표시한다.
- `tester`와 `tester1`은 frontend mock 전용 계정이며 backend DB seed의 대상이 아니다.
- `admin` 초기 계정은 Flyway seed migration으로 생성하고 초기 비밀번호 `admin`은 BCrypt hash로만 저장한다.
