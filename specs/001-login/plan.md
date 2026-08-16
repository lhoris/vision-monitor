# 구현 계획: 로그인

**브랜치**: `001-login` | **일자**: 2026-08-16 | **명세**: [spec.md](spec.md)

**입력**: `/specs/001-login/spec.md`의 기능 명세

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

> 이 문서는 한국어로 작성한다. 기술 용어, API 이름, 파일 경로, 코드 식별자, 명령어는 원문 또는 영문 표기를 유지할 수 있다.
> 구현 계획은 "어떻게 구현할 것인가"를 정의한다. 기능 경계는 spec.md를 기준으로 하며, plan.md에서 새 기능 요구사항을 추가하지 않는다.

## 1. 계획 요약

로그인은 기존 React frontend의 `Login` page와 `authSlice`를 유지하되, 인증 판단을 service/thunk 경계로 분리한다. `tester / tester123`은 frontend mock 인증으로 즉시 성공 처리하고, `tester`가 아닌 계정은 backend가 아직 준비되지 않았더라도 `/auth/login` API를 호출한다. 로그인 성공 시 사용자 정보와 token을 인증 상태에 반영하고 `/live`로 이동한다. 실패 시 인증 상태를 만들지 않고 form 근처에 오류를 표시한다.

## 2. 요구사항 추적

| 명세 항목 | 계획 반영 위치 | 비고 |
|-----------|----------------|------|
| FR-001 | 5. 화면/컴포넌트 구조 | username/password 입력 |
| FR-002 | 5. 상태 및 상호작용 흐름 | username 필수값 |
| FR-003 | 5. 상태 및 상호작용 흐름 | password 필수값 |
| FR-004 | 5. 서비스 및 데이터 흐름, tasks US1 | tester mock bypass |
| FR-005 | 5. 서비스 및 데이터 흐름, tasks US3 | invalid tester no API |
| FR-006 | 6. 계약, tasks US2 | non-tester API call |
| FR-007 | 5. 상태 및 상호작용 흐름 | success auth state |
| FR-008 | 5. 상태 및 상호작용 흐름 | failure error |
| FR-009 | 5. 화면/컴포넌트 구조 | loading button |
| FR-010 | 5. 상태 및 상호작용 흐름 | protected route redirect |
| FR-011 | 5. 상태 및 상호작용 흐름 | logout |

## 3. 기술 컨텍스트

**언어/버전**: TypeScript, React 19, Vite 8

**주요 의존성**: React Router, Redux Toolkit, Axios, Vitest, React Testing Library

**저장소/상태 관리**: Redux auth slice, browser localStorage token

**테스트**: Vitest, React Testing Library, production build

**대상 플랫폼**: 웹 브라우저

**프로젝트 유형**: frontend 중심 web app, backend skeleton은 MVP에서 변경하지 않음

**성능 목표**: tester mock 로그인은 즉시 완료되고, API 로그인은 요청 중 상태를 표시한다.

**제약사항**: tester mock 유지, non-tester API 호출, 실제 DB/auth backend 구현 제외

**규모/범위**: login page, auth service, auth slice, protected route, logout

## 4. 구현 범위와 제외 범위

### 구현 범위

- `frontend/src/pages/Login.tsx` form validation, loading, success/failure 처리
- `frontend/src/services/authService.ts` tester mock과 non-tester API 호출 경계
- `frontend/src/store/slices/authSlice.ts` async login state
- `frontend/src/App.tsx` 인증 상태 기반 route 보호
- `frontend/src/components/Layout/Header.tsx` logout 연결
- 관련 service/slice/page tests

### 제외 범위

- 실제 Spring Boot auth API 구현
- 사용자 DB 설계와 migration
- refresh token과 session 만료 연장
- 역할별 권한 제어
- 비밀번호 재설정과 계정 잠금 정책

## 5. 설계 접근

### 화면/컴포넌트 구조

- `Login` page는 username/password 입력과 demo credential 안내를 유지한다.
- submit 시 필수값을 먼저 검증하고, 검증 통과 후 `loginUser` async action을 dispatch한다.
- loading 중에는 버튼 text를 진행 상태로 바꾸고 disabled 처리한다.
- 오류는 form 하단 alert 영역에 표시한다.

### 상태 및 상호작용 흐름

- 인증 전 사용자가 보호 route에 접근하면 `/login`으로 이동한다.
- 로그인 성공 시 `isAuthenticated=true`, `user` 저장, token 저장 후 `/live`로 이동한다.
- 로그인 실패 시 `isAuthenticated=false`, `user=null`, token 제거, 오류 메시지를 표시한다.
- logout 시 인증 상태를 해제하고 `/login`으로 이동한다.

### 서비스 및 데이터 흐름

- `authService.login`은 tester credential이면 mock `LoginResult`를 반환한다.
- username이 `tester`지만 password가 다르면 API를 호출하지 않고 실패한다.
- username이 `tester`가 아니면 `POST /auth/login`을 호출한다.
- API 응답에 `user` 또는 `token`이 없으면 실패로 처리한다.

## 6. 데이터 및 계약 계획

### 필요한 데이터

- LoginCredentials
- User
- LoginResult
- AuthState
- Login API response

### 계약

- [contracts/login-api-contract.md](contracts/login-api-contract.md)

### Fixture/Mock 계획

- tester success fixture
- invalid tester failure
- non-tester API success
- non-tester API failure
- invalid API response

## 7. 테스트 및 검증 계획

- **단위/서비스 테스트**: `authService` tester bypass, invalid tester no API, non-tester API call
- **상태 테스트**: `authSlice` pending/fulfilled/rejected 상태 전환
- **컴포넌트 테스트**: `Login` required validation, loading, success navigation, failure message
- **E2E/수동 검증**: quickstart.md의 tester login, non-tester API call, protected route redirect
- **빌드/정적 검증**: `npm test -- --run`, `npm run build` in `frontend/`
- **회귀 확인**: 로그인 후 `/live`, 로그아웃 후 `/login`

## 8. 프로젝트 구조

### 문서 구조(이번 기능)

```text
specs/001-login/
├── assets/
├── spec.md
├── plan.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### 소스 코드 구조

```text
frontend/
├── src/
│   ├── pages/Login.tsx
│   ├── services/authService.ts
│   ├── store/slices/authSlice.ts
│   ├── App.tsx
│   └── components/Layout/Header.tsx

backend/
└── MVP에서 변경하지 않음
```

**구조 결정**: 인증 판단을 page reducer에 두지 않고 service/thunk 경계로 분리해 실제 API 연동으로 교체하기 쉽게 한다.

## 9. 헌법 체크

- **한국어 우선 산출물**: 통과. 산출물을 한국어로 작성한다.
- **기존 구조 존중**: 통과. 기존 Login/Auth/App route 구조를 유지한다.
- **Mock-First MVP**: 통과. tester mock은 유지하고 backend 구현은 제외한다.
- **계약 우선**: 통과. `/auth/login` 계약을 별도 문서로 둔다.
- **테스트 가능한 증분**: 통과. tester mock과 non-tester API 호출을 독립 테스트로 고정한다.

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| backend 로그인 응답 shape 미확정 | 실제 연동 시 수정 필요 | `login-api-contract.md`를 임시 계약으로 고정 |
| tester mock과 실제 API 경계 혼동 | 개발 중 API 호출 여부 오해 | service test로 tester는 no API, non-tester는 API 호출을 검증 |
| reducer side effect 증가 | 상태 예측 가능성 저하 | token 저장/삭제 책임을 명확히 분리하는 후속 개선 task 유지 |

## 11. 복잡도 추적

| 결정 | 필요한 이유 | 단순성을 유지할 근거 |
|------|-------------|-----------------------|
| authService 추가 | tester mock과 실제 API 호출 경계를 분리해야 함 | page와 reducer의 조건문을 줄이고 실제 API 교체가 쉬움 |
| loginUser async thunk 사용 | loading/success/failure 상태가 필요함 | Redux Toolkit 기존 패턴 사용, 새 상태 관리 도입 없음 |

