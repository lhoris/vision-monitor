# 작업 목록: 로그인

**입력**: `/specs/001-login/`의 설계 문서

**사전 조건**: spec.md, plan.md 필수. contracts/, quickstart.md를 함께 참조한다.

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

## Phase 1: 준비

- [ ] T001 `specs/001-login/spec.md`와 `specs/001-login/plan.md`의 tester mock 및 non-tester API 호출 경계를 확인한다.
- [ ] T002 [P] `specs/001-login/contracts/login-api-contract.md`와 `frontend/src/services/authService.ts`의 endpoint와 response shape를 확인한다.
- [ ] T003 `frontend/package.json`의 test/build 명령과 `specs/001-login/quickstart.md`의 검증 명령을 일치시킨다.

---

## Phase 2: 기반 작업

- [ ] T004 [P] `frontend/src/services/authService.ts`에 tester mock success, invalid tester failure, non-tester API call을 구현한다.
- [ ] T005 [P] `frontend/src/store/slices/authSlice.ts`에 async login pending/fulfilled/rejected 상태를 구현한다.
- [ ] T006 `frontend/src/pages/Login.tsx`에서 form submit이 async login action을 사용하도록 연결한다.

---

## Phase 3: 사용자 스토리 1 - tester mock 계정으로 로그인 (우선순위: P1) MVP

**목표**: backend 없이 tester 계정으로 로그인한다.

**관련 요구사항**: FR-001, FR-002, FR-003, FR-004, FR-007, FR-010

**독립 테스트**: `tester / tester123` 로그인은 API 호출 없이 성공한다.

- [ ] T007 [P] [US1] `frontend/src/services/__tests__/authService.test.ts`에서 tester mock login이 API를 호출하지 않는지 검증한다.
- [ ] T008 [US1] `frontend/src/pages/Login.tsx`에서 tester login 성공 시 `/live`로 이동하는지 확인한다.
- [ ] T009 [US1] `frontend/src/App.tsx`에서 인증 전 보호 route 접근 시 `/login`으로 이동하는지 확인한다.
- [ ] T010 [US1] `cd frontend; npm test -- --run authService`를 실행해 US1 회귀를 확인한다.

---

## Phase 4: 사용자 스토리 2 - 비-tester 계정으로 로그인 API 호출 (우선순위: P2)

**목표**: tester가 아닌 계정은 backend 준비 여부와 관계없이 로그인 API를 호출한다.

**관련 요구사항**: FR-006, FR-007, FR-008, FR-009

**독립 테스트**: non-tester login은 `/auth/login`을 호출하고 성공/실패 상태를 처리한다.

- [ ] T011 [P] [US2] `frontend/src/services/__tests__/authService.test.ts`에서 non-tester 계정이 `/auth/login`을 호출하는지 검증한다.
- [ ] T012 [US2] `frontend/src/store/slices/authSlice.ts`에서 pending/fulfilled/rejected 상태 전환을 확인한다.
- [ ] T013 [US2] `frontend/src/pages/Login.tsx`에서 loading 중 버튼 disabled와 오류 표시를 확인한다.
- [ ] T014 [US2] `cd frontend; npm test -- --run authService`를 실행해 US2 회귀를 확인한다.

---

## Phase 5: 사용자 스토리 3 - 로그인 실패와 로그아웃 (우선순위: P3)

**목표**: 잘못된 tester 로그인과 로그아웃 상태 전환을 안정적으로 처리한다.

**관련 요구사항**: FR-005, FR-008, FR-011

**독립 테스트**: invalid tester는 API 호출 없이 실패하고 logout은 인증 상태와 token을 제거한다.

- [ ] T015 [P] [US3] `frontend/src/services/__tests__/authService.test.ts`에서 invalid tester password가 API를 호출하지 않는지 검증한다.
- [ ] T016 [US3] `frontend/src/store/slices/authSlice.ts`에서 logout 상태 초기화와 token 제거 흐름을 확인한다.
- [ ] T017 [US3] `frontend/src/components/Layout/Header.tsx`에서 logout 후 `/login` 이동을 확인한다.

---

## Phase 6: 마무리 및 공통 검증

- [ ] T018 [P] `specs/001-login/quickstart.md`의 수동 검증 절차가 실제 화면과 일치하는지 확인한다.
- [ ] T019 `cd frontend; npm test -- --run`을 실행해 전체 frontend test를 확인한다.
- [ ] T020 `cd frontend; npm run build`를 실행해 production build를 확인한다.

## 의존성 및 실행 순서

- Phase 1 -> Phase 2 -> US1 -> US2 -> US3 -> 마무리 순서로 진행한다.
- US1은 MVP이며, tester mock login이 깨지면 002/003 화면 접근도 검증할 수 없다.
- US2는 backend API가 실패하더라도 호출 발생 여부를 우선 검증한다.

## 병렬 실행 예시

```text
Task: "T004 authService 구현"
Task: "T005 authSlice async 상태 구현"
```

```text
Task: "T007 tester mock service test"
Task: "T011 non-tester API service test"
Task: "T015 invalid tester service test"
```

## 구현 전략

1. tester mock login을 먼저 보존한다.
2. non-tester API 호출 경계를 추가한다.
3. Login page를 async action에 연결한다.
4. service test와 전체 test/build로 회귀를 확인한다.

