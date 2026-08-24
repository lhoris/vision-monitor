# 작업 목록: 로그인

**입력**: `/specs/001-login/`의 설계 문서

**사전 조건**: spec.md, plan.md 필수. research.md, data-model.md, contracts/, quickstart.md를 함께 참조한다.

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

**테스트**: 인증, DB, route guard 변경이 포함되므로 backend service/controller 테스트와 frontend authService/build 검증을 포함한다.

## Phase 1: 준비

**목적**: 실제 backend 로그인 구현 전에 현재 mock 경계, DB 상태, 계약을 확인한다.

- [X] T001 `specs/001-login/spec.md`, `specs/001-login/plan.md`, `specs/001-login/contracts/login-api-contract.md`에서 tester/tester1 mock과 실제 `admin/admin` backend 로그인 경계를 확인한다.
- [X] T002 [P] `backend/pom.xml`에서 BCrypt 검증에 사용할 `spring-security-crypto` 의존성 필요 여부를 확인한다.
- [X] T003 [P] `backend/src/main/resources/db/migration/`의 최신 Flyway version이 `V005` 이후인지 확인하고 신규 migration 번호를 확정한다.
- [X] T004 [P] `frontend/src/services/authService.ts`, `frontend/src/store/slices/authSlice.ts`, `frontend/src/services/api.ts`의 로그인 응답 shape와 `X-Actor-Username` 저장/전달 흐름을 확인한다.

---

## Phase 2: 기반 작업

**목적**: 실제 backend 로그인 API가 사용할 DB 필드, DTO, 공통 오류 처리를 준비한다.

**중요**: 이 Phase가 끝나기 전에는 실제 backend login endpoint 구현을 시작하지 않는다.

- [X] T005 [P] `backend/pom.xml`에 BCrypt 검증용 `org.springframework.security:spring-security-crypto` 의존성을 추가한다.
- [X] T006 [P] `backend/src/main/resources/db/migration/V006__add_user_password_hash.sql`에서 `users.password_hash` 컬럼을 nullable `VARCHAR(255)`로 추가한다.
- [X] T007 `backend/src/main/resources/db/migration/V007__seed_admin_password_hash.sql`에서 `admin` 계정의 BCrypt password hash를 초기 비밀번호 `admin` 기준으로 upsert한다.
- [X] T008 `backend/src/main/java/com/vision/entity/UserAccount.java`에 `passwordHash` 필드를 `password_hash` 컬럼으로 매핑한다.
- [X] T009 [P] `backend/src/main/java/com/vision/dto/LoginRequest.java`, `backend/src/main/java/com/vision/dto/LoginResponse.java`, `backend/src/main/java/com/vision/dto/AuthenticatedUserDto.java`를 추가한다.
- [X] T010 [P] `backend/src/test/java/com/vision/service/AuthServiceTest.java`에서 성공/실패 테스트 fixture를 만들 수 있도록 repository mock 기반을 준비한다.

**체크포인트**: DB migration과 DTO/entity 기반이 준비되어 실제 로그인 API를 독립 구현할 수 있어야 한다.

---

## Phase 3: 사용자 스토리 1 - tester mock 계정으로 로그인 (우선순위: P1) MVP

**목표**: 기존 `tester / tester123`, `tester1 / tester123` mock 로그인 흐름을 실제 backend 로그인 추가 후에도 유지한다.

**관련 요구사항**: FR-001, FR-002, FR-003, FR-004, FR-004a, FR-004b, FR-005, FR-007, FR-010

**독립 테스트**: tester/tester1 로그인은 backend API를 호출하지 않고 성공하며 tester는 관리자 권한, tester1은 비관리자 권한을 가진다.

### 사용자 스토리 1 테스트

- [X] T011 [P] [US1] `frontend/src/services/__tests__/authService.test.ts`에서 `tester / tester123`과 `tester1 / tester123`이 API를 호출하지 않고 성공하는지 검증한다.
- [X] T012 [P] [US1] `frontend/src/services/__tests__/authService.test.ts`에서 `tester` 또는 `tester1`의 잘못된 password가 API 호출 없이 실패하는지 검증한다.
- [X] T013 [P] [US1] `frontend/src/components/Layout/__tests__/Sidebar.admin.test.tsx`에서 tester 관리자 메뉴와 tester1 비관리자 메뉴 제한을 검증한다.

### 사용자 스토리 1 구현

- [X] T014 [US1] `frontend/src/services/authService.ts`에서 tester/tester1 mock 조건과 non-mock API 조건이 유지되는지 정리한다.
- [X] T015 [US1] `frontend/src/store/slices/authSlice.ts`에서 mock 로그인 성공 시 `role`, `permissions`, token, username 저장 흐름을 확인한다.
- [X] T016 [US1] `frontend/src/App.tsx`에서 인증 전 보호 route redirect와 관리자 route guard를 확인한다.
- [X] T017 [US1] `frontend/package.json` 기준으로 `cd frontend; npm test -- --run authService Sidebar.admin`를 실행해 US1 회귀를 확인한다.

**체크포인트**: mock 로그인 MVP는 실제 backend 작업과 독립적으로 계속 동작해야 한다.

---

## Phase 4: 사용자 스토리 2 - 실제 admin 계정으로 로그인 (우선순위: P2)

**목표**: `admin / admin` 입력 시 frontend가 `POST /api/auth/login`을 호출하고 backend가 DB의 BCrypt hash로 인증한다.

**관련 요구사항**: FR-006, FR-007, FR-008, FR-009, FR-012, FR-013, FR-014, FR-015

**독립 테스트**: backend가 `admin/admin`을 200으로 인증하고 frontend가 응답의 user/token을 저장한 뒤 관리자 메뉴 접근이 가능해야 한다.

### 사용자 스토리 2 테스트

- [X] T018 [P] [US2] `backend/src/test/java/com/vision/service/AuthServiceTest.java`에서 `admin/admin` 성공, 잘못된 password 실패, password_hash 없음 실패를 검증한다.
- [X] T019 [P] [US2] `backend/src/test/java/com/vision/controller/AuthControllerTest.java`에서 `POST /api/auth/login` 성공/실패 응답 shape를 검증한다.
- [X] T020 [P] [US2] `frontend/src/services/__tests__/authService.test.ts`에서 non-mock `admin/admin` API 성공 응답의 `role`, `permissions`, token 처리를 검증한다.

### 사용자 스토리 2 구현

- [X] T021 [US2] `backend/src/main/java/com/vision/service/AuthService.java`에서 username 조회, BCrypt 검증, 계정 상태 검증, 개발용 opaque token 생성을 구현한다.
- [X] T022 [US2] `backend/src/main/java/com/vision/controller/AuthController.java`에서 `POST /api/auth/login` endpoint를 구현한다.
- [X] T023 [US2] `backend/src/main/java/com/vision/repository/UserAccountRepository.java`에서 로그인 조회에 필요한 username case-insensitive 조회 method를 확인하거나 보강한다.
- [X] T024 [US2] `frontend/src/services/authService.ts`에서 실제 API 성공 응답의 `id`, `username`, `role`, `permissions`, `token` 유효성 검증을 확정한다.
- [X] T025 [US2] `frontend/src/services/api.ts`에서 로그인 후 localStorage의 `authUsername`이 `X-Actor-Username` 헤더로 전달되는지 확인한다.
- [X] T026 [US2] `backend/pom.xml` 기준으로 `cd backend; mvn test`를 실행해 backend 로그인 테스트와 기존 사용자관리 테스트를 확인한다.
- [X] T027 [US2] `frontend/package.json` 기준으로 `cd frontend; npm test -- --run authService`를 실행해 frontend 실제 API 경계를 확인한다.

**체크포인트**: `admin/admin` 실제 로그인이 성공하고 사용자관리 API actor로 `admin`을 사용할 수 있어야 한다.

---

## Phase 5: 사용자 스토리 3 - 실패 상태와 로그아웃 처리 (우선순위: P3)

**목표**: 로그인 실패와 로그아웃이 인증 상태를 남기지 않고 안전하게 처리된다.

**관련 요구사항**: FR-008, FR-011, FR-016

**독립 테스트**: 비활성/잠금/퇴사 계정과 잘못된 credential은 동일한 실패 메시지를 반환하고 logout은 token과 user state를 제거한다.

### 사용자 스토리 3 테스트

- [X] T028 [P] [US3] `backend/src/test/java/com/vision/service/AuthServiceTest.java`에서 `enabled=false`, `account_status=locked`, `employment_status=retired` 계정이 동일한 인증 실패로 처리되는지 검증한다.
- [X] T029 [P] [US3] `frontend/src/store/slices/authSlice.test.ts`에서 rejected login과 logout이 auth state와 localStorage를 정리하는지 검증한다.

### 사용자 스토리 3 구현

- [X] T030 [US3] `backend/src/main/java/com/vision/service/AuthService.java`에서 상태 제한 실패가 동일한 `AUTH_FAILED` 결과로 노출되도록 정리한다.
- [X] T031 [US3] `frontend/src/store/slices/authSlice.ts`에서 로그인 실패와 logout 시 token, username, user state 제거를 확인한다.
- [X] T032 [US3] `frontend/src/components/Layout/Header.tsx`에서 logout 후 `/login` 이동 흐름을 확인한다.
- [X] T033 [US3] `frontend/package.json` 기준으로 `cd frontend; npm test -- --run authSlice`를 실행해 실패/logout 회귀를 확인한다.

**체크포인트**: 실패 원인은 외부로 노출되지 않고 인증 상태는 일관되게 제거되어야 한다.

---

## Phase 6: 마무리 및 공통 검증

**목적**: 실제 backend 로그인과 기존 mock 로그인의 전체 회귀를 검증한다.

- [ ] T034 [P] `specs/001-login/quickstart.md` 기준으로 tester, tester1, admin 수동 로그인 시나리오를 브라우저에서 확인한다.
- [X] T035 [P] `specs/001-login/contracts/login-api-contract.md`와 실제 `AuthController` 응답 shape가 일치하는지 확인한다.
- [X] T036 `backend/pom.xml` 기준으로 `cd backend; mvn test`를 실행해 backend 전체 테스트를 확인한다.
- [X] T037 `frontend/package.json` 기준으로 `cd frontend; npm test -- --run`을 실행해 frontend 전체 테스트를 확인한다.
- [X] T038 `frontend/package.json` 기준으로 `cd frontend; npm run build`를 실행해 production build를 확인한다.
- [X] T039 구현 완료 후 `specs/001-login/tasks.md`에 구현 결과와 남은 후속 보안 범위를 기록한다.

---

## 의존성 및 실행 순서

### Phase 의존성

- Phase 1 준비는 즉시 시작 가능하다.
- Phase 2 기반 작업은 모든 backend 로그인 구현을 차단한다.
- US1은 Phase 2와 병렬 검토 가능하지만, 최종 회귀는 Phase 2 이후 수행한다.
- US2는 Phase 2 완료 후 시작한다.
- US3는 US2의 backend `AuthService` 구현 후 시작한다.
- Phase 6은 US1~US3 완료 후 진행한다.

### 사용자 스토리 의존성

- **US1(P1)**: 기존 mock 로그인 보존. 다른 스토리 의존성 없음.
- **US2(P2)**: 실제 backend 로그인. Phase 2 DB/DTO 기반이 필요하다.
- **US3(P3)**: 실패/logout 정책. US2의 실제 로그인 service가 필요하다.

### 병렬화 가능 지점

- T002, T003, T004는 서로 다른 파일/검토 대상이라 병렬 가능하다.
- T005, T006, T009, T010은 서로 다른 파일이라 병렬 가능하다.
- US1 테스트 T011~T013은 서로 다른 검증 축이라 병렬 가능하다.
- US2 테스트 T018~T020은 backend service, backend controller, frontend service로 나뉘어 병렬 가능하다.
- 최종 수동 검증 T034와 계약 점검 T035는 병렬 가능하다.

---

## 병렬 실행 예시

```text
Task: "T005 backend/pom.xml에 spring-security-crypto 의존성 추가"
Task: "T006 V006 password_hash migration 추가"
Task: "T009 로그인 DTO 추가"
```

```text
Task: "T018 AuthServiceTest 작성"
Task: "T019 AuthControllerTest 작성"
Task: "T020 frontend authService 실제 API 성공 테스트 작성"
```

---

## 구현 전략

### MVP 우선

1. Phase 1과 Phase 2를 완료한다.
2. US1로 tester/tester1 mock 로그인 회귀를 고정한다.
3. US2로 `admin/admin` 실제 backend 로그인을 완성한다.
4. 여기서 중지해 `/admin/users` 실제 API 진입을 검증할 수 있다.

### 점진적 전달

1. mock 로그인 회귀를 먼저 보존한다.
2. DB password_hash와 admin seed를 추가한다.
3. backend auth API를 구현한다.
4. frontend 실제 API 응답 처리를 확정한다.
5. 실패/logout 보안 동작을 보강한다.
6. 전체 test/build와 quickstart로 검증한다.

### 후속 보안 범위

- JWT 또는 session 기반 token 검증
- refresh token
- password reset
- 계정 잠금 횟수 정책
- 감사 로그와 로그인 이력

---

## 구현 결과

- backend는 `POST /api/auth/login` endpoint, `AuthService`, 로그인 DTO, BCrypt 검증, 동일 실패 응답(`AUTH_FAILED`)을 구현했다.
- Flyway migration은 `users.password_hash` 추가와 `admin/admin` BCrypt seed 보정을 포함한다. 현재 개발 DB는 `V008`까지 적용되어 `admin/admin` 로그인이 성공한다.
- frontend는 기존 `tester/tester123`, `tester1/tester123` mock 로그인을 유지하면서 non-mock 로그인 응답의 `user`, `permissions`, `token`, `authUsername` 저장 흐름을 검증했다.
- 검증 완료: `cd backend; mvn test`, `cd frontend; npm test -- --run`, `cd frontend; npm run build`.
- 미완료: T034 브라우저 수동 로그인 확인은 자동 테스트/API 검증으로 대체하지 않고 후속 확인 항목으로 남긴다.
