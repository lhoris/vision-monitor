# 작업 목록: DB 세션 영속화

**입력**: `specs/017-database-session-persistence/`의 설계 문서

## Phase 1: 준비

- [x] T001 현재 인증 흐름과 인메모리 세션 가정을 확인하고 구현 기준을 정리한다: `backend/src/main/java/com/vision/service/AuthSessionService.java`, `backend/src/test/java/com/vision/service/AuthSessionServiceTest.java`
- [x] T002 [P] 세션 계약과 데이터 모델이 구현 범위와 일치하는지 검토한다: `specs/017-database-session-persistence/contracts/auth-session-contract.md`, `specs/017-database-session-persistence/data-model.md`

## Phase 2: 공통 기반

- [x] T003 Flyway 마이그레이션으로 Audit 컬럼을 최상단에 둔 `TB_M26_AUTH_SESSION`을 생성하고 FK, UK, 별도 INDEX를 포함하지 않는다: `backend/src/main/resources/db/migration/V022__create_m26_auth_session.sql`
- [x] T004 세션 업무 컬럼과 기존 M26 Audit 컬럼을 매핑하는 엔티티를 추가한다: `backend/src/main/java/com/vision/entity/AuthSession.java`
- [x] T005 세션 생성, token hash 조회, 만료 조회, 논리 폐기를 위한 Repository를 추가한다: `backend/src/main/java/com/vision/repository/AuthSessionRepository.java`

## Phase 3: 사용자 스토리 1 - 재기동 후 유효 세션 유지 (P1)

**목표**: 로그인 세션이 DB에 저장되고 backend 재기동 후에도 8시간 이내라면 재검증된다.

**독립 검증**: 로그인 세션 생성, token hash 저장, 영속 저장소 기반 사용자 세션 조회를 테스트한다.

- [x] T006 [P] [US1] DB 세션 생성과 조회, 원문 token 비저장을 검증하는 단위 테스트를 작성한다: `backend/src/test/java/com/vision/service/AuthSessionServiceTest.java`
- [x] T007 [US1] token 생성, SHA-256 hash, 8시간 절대 만료 시각 저장을 DB 기반으로 구현한다: `backend/src/main/java/com/vision/service/AuthSessionService.java`
- [x] T008 [US1] 영속 세션 조회 후 기존 사용자 활성 상태와 권한 계산을 적용하도록 인증 서비스를 연결한다: `backend/src/main/java/com/vision/service/AuthSessionService.java`
- [x] T009 [US1] 로그인 성공 시 DB 세션이 생성되고 기존 `LoginResponse` 계약이 유지되는지 검증한다: `backend/src/test/java/com/vision/service/AuthServiceTest.java`

## Phase 4: 사용자 스토리 2 - 만료 및 폐기 세션 차단 (P1)

**목표**: 만료, 데이터 종료, 로그아웃 세션은 보호된 API에서 인증되지 않는다.

**독립 검증**: 각 상태의 세션으로 보호된 요청 시 인증 실패가 발생하는지 확인한다.

- [x] T010 [P] [US2] 만료, 폐기, 데이터 종료, 비활성 사용자 세션 거부 테스트를 추가한다: `backend/src/test/java/com/vision/service/AuthSessionServiceTest.java`
- [x] T011 [US2] 세션 폐기 동작과 데이터 종료/폐기 상태 검증을 구현한다: `backend/src/main/java/com/vision/service/AuthSessionService.java`, `backend/src/main/java/com/vision/service/AuthService.java`
- [x] T012 [US2] bearer token을 이용한 로그아웃 엔드포인트를 추가한다: `backend/src/main/java/com/vision/controller/AuthController.java`
- [x] T013 [US2] 로그아웃 후 동일 token 재사용이 차단되는 컨트롤러/서비스 테스트를 작성한다: `backend/src/test/java/com/vision/controller/AuthControllerTest.java`, `backend/src/test/java/com/vision/service/AuthSessionServiceTest.java`

## Phase 5: 사용자 스토리 3 - 새로고침 및 기존 클라이언트 흐름 유지 (P2)

**목표**: 브라우저 token으로 새로고침 검증을 수행하고 인증 실패 시 로컬 인증 정보를 정리한다.

**독립 검증**: 유효 token은 유지되고 만료/폐기 token은 로그인 상태에서 제거된다.

- [x] T014 [P] [US3] 인증 세션 검증 성공/실패와 로그아웃 localStorage 처리를 검증한다: `frontend/src/store/slices/__tests__/authSlice.test.ts`
- [x] T015 [US3] 로그아웃 시 서버 폐기를 호출하고 실패해도 브라우저 인증 정보를 제거하도록 연결한다: `frontend/src/services/authService.ts`, `frontend/src/store/slices/authSlice.ts`
- [x] T016 [US3] 기존 `/auth/session` 계약과 인증 실패 시 로그인 이동 동작을 검증한다: `frontend/src/services/__tests__/authService.test.ts`, `frontend/src/pages/__tests__/Login.test.tsx`

## Phase 6: 통합 검증 및 정리

- [x] T017 [P] Flyway 마이그레이션의 세션 테이블 규칙과 FK/UK/별도 INDEX 부재를 검증한다: `backend/src/test/java/com/vision/repository/FlywayMigrationScriptsTest.java`
- [x] T018 backend 인증 테스트와 frontend 인증 테스트를 실행하고 실패 원인을 수정한다: `backend/pom.xml`, `frontend/package.json`
- [x] T019 [P] 재기동, 만료, 로그아웃, 새로고침 검증 절차를 문서에 반영한다: `specs/017-database-session-persistence/quickstart.md`
- [x] T020 기존 로그인, 권한 메뉴, 보호된 API에 대한 회귀 영향을 최종 점검한다: `backend/src/main/java/com/vision/config/AuthSessionInterceptor.java`, `frontend/src/store/slices/authSlice.ts`

## 검증 결과

- Backend: `mvnw.cmd -q test` 통과
- Frontend: `npm run test -- --run` 통과, 66개 파일 / 330개 테스트
- Frontend build: `npm run build` 통과

## 실행 전략

데이터베이스 마이그레이션과 영속 세션 저장소를 먼저 적용한 뒤 인증 흐름과 로그아웃을 연결했다. 기존 bearer token, localStorage, `/auth/session` 계약은 유지했다.
