# 구현 계획: 로그인
**브랜치**: `001-login` | **일자**: 2026-08-24 | **명세**: [spec.md](spec.md)

## 1. 계획 요약

로그인 기능은 기존 frontend mock 로그인 흐름을 유지하면서 실제 backend 로그인 API를 추가하는 방식으로 확장한다. `tester / tester123`과 `tester1 / tester123`은 계속 frontend mock으로 처리하고 backend API를 호출하지 않는다. 그 외 계정은 `POST /api/auth/login`을 호출한다.

실제 backend 로그인은 MariaDB `users` 테이블의 `password_hash`를 BCrypt로 검증한다. 초기 개발 계정은 `admin / admin`이며, Flyway seed migration으로 `admin` 계정과 BCrypt hash를 생성한다. 로그인 성공 응답은 frontend route guard가 바로 사용할 수 있도록 `id`, `username`, `role`, `permissions`, 개발용 opaque token을 포함한다. JWT/session 기반 인증은 후속 보안 범위로 분리하고, 이번 범위에서는 기존 사용자관리 API와 맞춰 `X-Actor-Username` 헤더를 actor 식별에 사용한다.

## 2. 기술 컨텍스트

**언어/버전**: Java 21, TypeScript, React 19

**Backend**: Spring Boot 3.2, Spring Web, Spring Data JPA, Flyway, MariaDB

**Frontend**: Vite, React Router, Redux Toolkit, Axios, Vitest, React Testing Library

**DB**: MariaDB `jdbc:mariadb://192.168.0.11:3306/vms`

**인증 방식**: 이번 범위는 BCrypt password 검증 + 개발용 opaque token 반환. API actor 식별은 `X-Actor-Username` 유지.

**제약사항**:
- tester/tester1 mock 로그인은 backend 호출 없이 유지한다.
- plain text password는 DB에 저장하지 않는다.
- JWT, refresh token, session 저장소, 비밀번호 재설정, 계정 잠금 정책은 제외한다.
- 실제 backend 권한 검증은 현재 사용자관리 API의 `X-Actor-Username` 기반 임시 방식과 호환되어야 한다.

## 3. 헌법 체크

- **사용자 가치 우선**: 실제 `admin/admin` 로그인으로 사용자가 사용자관리 실제 API 흐름에 진입할 수 있게 한다.
- **한국어 우선 산출물**: spec, plan, tasks, quickstart, contract 문서는 한국어로 유지한다.
- **기존 구조 존중**: 기존 `authService`, `authSlice`, `apiClient`, Spring controller/service/repository 패턴을 따른다.
- **Mock-First MVP 유지**: tester/tester1 mock 경로는 유지하고 실제 backend 로그인은 non-mock 계정 경로에 추가한다.
- **계약 우선**: `contracts/login-api-contract.md`를 실제 backend 응답 shape 기준으로 갱신한다.
- **테스트 가능한 증분**: backend service/controller 테스트와 frontend authService 테스트로 독립 검증한다.

## 4. 구현 범위

### 포함

- `users.password_hash` migration
- `admin / admin` 초기 계정 seed migration
- `AuthController`의 `POST /api/auth/login`
- `AuthService`의 username/password 검증
- BCrypt password hashing/verification 구성
- 로그인 성공 DTO와 실패 오류 처리
- frontend `authService`의 실제 API 성공 응답 shape 검증
- backend unit/controller 수준 테스트
- quickstart 실제 로그인 시나리오 갱신

### 제외

- JWT 발급과 검증
- refresh token
- session persistence
- password reset
- 계정 잠금 횟수/만료 정책
- SSO/MFA
- 상세 권한 정책 CRUD

## 5. 설계 접근

### Backend

- `UserAccount` entity에 `passwordHash` 필드를 추가한다.
- Flyway `V006`에서 `users.password_hash` 컬럼을 nullable로 추가한다. 기존 mock/seed 없는 계정과의 호환을 위해 nullable로 시작한다.
- Flyway `V007`에서 `admin` 계정의 BCrypt hash를 넣거나 갱신한다.
- `AuthController`는 `/api/auth/login`을 제공한다.
- `AuthService`는 username으로 사용자를 조회하고 다음 조건을 모두 만족할 때만 로그인 성공 처리한다.
  - BCrypt password match
  - `enabled = true`
  - `account_status = active`
  - `employment_status = employed`
- 실패 시 username 존재 여부, 상태, 비밀번호 오류를 구분해 노출하지 않고 동일한 오류를 반환한다.
- token은 개발용 opaque token 문자열로 생성한다. 서버 저장 검증은 이번 범위에 포함하지 않는다.

### Frontend

- tester/tester1 mock 로그인 조건은 기존대로 유지한다.
- tester/tester1 외 계정은 `/api/auth/login`을 호출한다.
- 성공 응답의 `user.id`, `user.username`, `user.role`, `user.permissions`, `token`을 auth state와 localStorage에 저장한다.
- 실패 응답이나 invalid response는 기존 로그인 실패 흐름으로 처리한다.
- API 요청 interceptor는 localStorage의 `authUsername`을 `X-Actor-Username`으로 계속 전달한다.

## 6. 데이터 및 계약 산출물

- [data-model.md](data-model.md): LoginCredentials, AuthenticatedUser, LoginResult, UserAccount password/auth fields
- [contracts/login-api-contract.md](contracts/login-api-contract.md): `POST /api/auth/login` request/response/error
- [quickstart.md](quickstart.md): mock 로그인, 실제 `admin/admin` 로그인, 사용자관리 API 연계 검증

## 7. 테스트 및 검증 계획

- Backend
  - `AuthServiceTest`: 성공, 잘못된 비밀번호, 비활성/잠금/퇴사 계정 실패, password_hash 없음 실패
  - `AuthControllerTest` 또는 MVC 통합 테스트: `/api/auth/login` 성공/실패 응답 shape
  - `mvn test`
- Frontend
  - `authService.test.ts`: tester/tester1 mock no API, invalid tester no API, `admin/admin` API success shape
  - `authSlice` 상태 전환 확인
  - `npm test -- --run`
  - `npm run build`
- Manual
  - backend 실행 후 `admin/admin` 로그인
  - 로그인 후 `/admin/users` 진입 및 `X-Actor-Username: admin` 기반 사용자관리 API 동작 확인

## 8. 위험 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| 개발용 opaque token을 실제 보안 token으로 오해 | backend API 보호 수준 착각 | 문서와 코드 주석에 JWT/session 전환 전 임시 token임을 명시 |
| tester mock과 실제 admin 로그인 경로 혼동 | API 호출 여부 테스트 실패 | `authService` 테스트에서 tester 계열 no API, non-mock API 호출을 고정 |
| seed migration에 plain password 저장 | 보안 부채 | BCrypt hash만 저장하고 plain password는 quickstart에만 개발용 credential로 기록 |
| 계정 상태별 실패 메시지 노출 | 계정 enumeration 위험 | 모든 인증 실패를 동일 메시지로 처리 |

## 9. 구조 결정

기존 frontend auth 구조와 backend service/controller/repository 구조를 유지한다. 새 추상화는 실제 중복이 발생하는 지점에만 추가한다. BCrypt는 Spring Security 전체 도입 없이 `spring-security-crypto`의 `BCryptPasswordEncoder` 또는 동등한 검증 유틸을 사용한다.

## 10. 사후 헌법 체크

- 사용자-facing 동작은 `admin/admin` 실제 로그인과 mock tester 흐름으로 검증 가능하다.
- DB/API 경계는 contract에 명시된다.
- 기존 mock-first 원칙은 유지된다.
- 실제 보안 토큰은 후속 범위로 분리되어 범위가 과도하게 커지지 않는다.
