# 구현 계획: 사용자 관리

**브랜치**: `011-user-management` | **일자**: 2026-08-17 | **명세**: [spec.md](spec.md)

**입력**: `/specs/011-user-management/spec.md`의 사용자 관리 기능 명세

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

## 1. 계획 요약

사용자 관리는 기존 React frontend의 관리자 route 구조를 유지하면서 `/admin/users`에 실제 사용자관리 화면을 연결하는 방식으로 구현한다. 화면은 Tabulator 기반 그리드와 우측 또는 modal 기반 상세/편집 패널로 구성하고, 사용자 목록 조회, 검색/필터, 신규 등록, 수정, 역할 배정, 비활성화, 퇴사 처리, 삭제 요청 흐름을 제공한다. MVP의 데이터 처리는 로그인 사용자가 `tester` 또는 `tester1` 계정일 때만 frontend mock service와 fixture를 사용한다. `tester`는 관리자 mock 계정으로 사용자관리 화면 접근과 mock 변경이 가능하고, `tester1`은 비관리자 mock 계정으로 메뉴와 route 접근이 차단되어야 한다. tester 계열이 아닌 계정은 mock 우회 없이 실제 API 경계로 요청하는 구조를 남기되, 실제 Spring Boot/DB/SSO/MFA/비밀번호 정책 구현은 후속 범위로 둔다.

## 2. 요구사항 추적

| 명세 항목 | 계획 반영 위치 | 비고 |
|-----------|----------------|------|
| FR-001, FR-002 | 화면/route 구조, 권한 guard, quickstart | 관리자 전용 메뉴와 route 접근 |
| FR-003, FR-004, FR-005, FR-006 | 그리드 구조, 데이터 모델, 사용자 목록 계약 | Tabulator 기반 조회/검색/필터/정렬/페이지 |
| FR-007, FR-011, FR-012, FR-013 | 상세/편집 패널, 역할/권한 영향 표시 | 012/013 명세와 연결 |
| FR-008, FR-009, FR-010 | 사용자 등록 흐름, validation rules | 필수값/중복/이메일 형식 |
| FR-014, FR-015 | 상태 전이 모델 | 활성/잠금/비활성/퇴사 |
| FR-016, FR-017, FR-018 | 삭제 요청 흐름 | 비활성/퇴사 우선 안내 |
| FR-019, FR-020 | 위험 변경 방지 | 자기 계정, 마지막 관리자 보호 |
| FR-021, FR-022 | 개인화 설정 표시/처리 | 002 live grid 개인화 연동 기준 |
| FR-023, FR-024, FR-025 | 상태 처리와 동기화 | empty/error/loading/success |
| UX-001~UX-010 | 화면/상태/테마 검증 | 그리드 중심, 상태 배지, 위험 대화상자 |

## 3. 기술 컨텍스트

**언어/버전**: TypeScript 5.x, React 19

**주요 의존성**: React, React Router, Redux Toolkit, i18next, Tabulator, Vite

**저장소/상태 관리**: Redux auth state, frontend mock fixture, component local state

**테스트**: Vitest, React Testing Library, existing build script

**대상 플랫폼**: 브라우저 기반 frontend, Windows 개발 환경

**프로젝트 유형**: frontend 중심 web app, backend skeleton은 MVP 범위 밖

**성능 목표**: 관리자 화면 진입 후 3초 이내 주요 사용자 상태 파악, 검색/필터 조작 후 즉시 목록 갱신

**제약사항**: mock-first MVP, tester/tester1 계정에서만 frontend mock 처리, 기존 관리자 route/Sidebar 구조 존중, 실제 인증 저장소/DB/SSO/MFA 제외

**규모/범위**: 사용자 수십~수백 건 수준의 mock fixture와 그리드 검증, 후속 실제 API 연결 가능 계약 유지

## 4. 구현 범위와 제외 범위

### 구현 범위

- `/admin/users` route를 기존 `AdminPlaceholder`에서 사용자관리 화면으로 분기한다.
- 사용자관리 page/shell을 추가하고, 그리드 목록과 상세/편집 패널 또는 modal을 제공한다.
- 사용자 DTO, role/status/personnel status 타입, validation helper를 정의한다.
- `tester`/`tester1` mock 계정 기반 fixture와 mock adapter를 추가한다.
- `tester` 로그인 상태에서는 mock 사용자 목록 조회/등록/수정/상태 변경/삭제 요청을 처리한다.
- `tester1` 로그인 상태에서는 관리자 메뉴/route 접근이 차단되는 기존 guard를 유지하고 검증한다.
- tester 계열이 아닌 로그인 사용자의 경우 실제 API service 경계를 호출하도록 adapter 구조를 분리한다.
- 역할 관리와 권한 정책 관리의 데이터는 상세 구현 없이 사용자 역할 선택/영향 안내에 필요한 mock 참조 데이터로만 연결한다.
- 사용자의 개인화 설정 보유 여부와 유지/초기화 선택을 mock 상태로 표현한다.

### 초기 mock MVP 제외 범위

- 실제 Spring Boot controller/service/repository/entity 구현은 초기 mock MVP에서 제외하고 Phase 9에서 진행한다.
- 실제 DB migration과 사용자 영구 저장은 초기 mock MVP에서 제외하고 Phase 9에서 진행한다.
- 실제 비밀번호 초기화, MFA, SSO, 인사 시스템 연동
- 실제 backend 권한 검증과 감사 로그는 초기 mock MVP에서 제외하고 Phase 9 이후 진행한다.
- 역할 자체의 CRUD 구현
- 권한 정책 자체의 CRUD 구현
- 메뉴 접근 권한 상세 관리 구현
- 실제 개인정보 마스킹/암호화/보존 정책 구현

## 5. 설계 접근

### 화면/컴포넌트 구조

- `UserManagementPage`: `/admin/users`의 page entry. 권한, loading, empty/error 상태와 layout을 조합한다.
- `UserManagementGrid`: Tabulator 기반 사용자 목록. 검색/필터/정렬/페이지와 row selection을 담당한다.
- `UserDetailPanel`: 선택 사용자 상세, 역할/상태/개인화 설정 보유 여부를 표시한다.
- `UserEditDialog`: 신규 등록/수정 공용 입력 flow. 기본 정보, 조직 정보, 권한 정보, 계정 상태, 개인화 설정 영역으로 나눈다.
- `UserDangerDialog`: 비활성화, 퇴사 처리, 삭제 요청, 자기 계정 변경, 마지막 관리자 제거 위험을 확인한다.
- `UserStatusBadge`: 활성/잠금/비활성/퇴사 상태를 색상과 텍스트로 표시한다.

### 상태 및 상호작용 흐름

- page 진입 시 현재 auth user를 확인한다.
- `tester` 관리자 mock user면 mock service에서 사용자 목록과 role summary를 가져온다.
- `tester1` 비관리자 mock user면 기존 admin route guard에 의해 `/live`로 이동한다.
- tester 계열이 아닌 user면 service API 경계로 요청한다.
- 검색/필터/정렬/페이지는 그리드 상태로 처리하고, 선택 행은 상세 패널과 동기화한다.
- 추가/수정 저장 전 validation을 수행하고 실패 시 field-level error를 표시한다.
- 역할 변경 시 권한/메뉴 접근/영상그리드 개인화 영향 안내를 표시한다.
- 비활성화/퇴사/삭제 요청 전 위험 변경 검사를 수행한다.
- 저장 성공 후 목록과 상세 상태를 같은 user snapshot으로 갱신한다.

### 서비스 및 데이터 흐름

- `userManagementService`는 사용자관리 화면의 단일 service facade가 된다.
- `userManagementMockAdapter`는 `tester`/`tester1` 계정 전제의 mock data를 제공한다.
- 실제 API adapter는 같은 service contract를 공유하되 MVP에서 backend 구현을 요구하지 않는다.
- `authSlice.user.username` 또는 token/user 정보를 기준으로 mock adapter 사용 가능 여부를 판단한다.
- mock fixture는 tester 관리자, tester1 비관리자, 활성/잠금/비활성/퇴사 사용자, 개인화 설정 보유 사용자, 마지막 관리자 보호 케이스를 포함한다.

## 6. 데이터 및 계약 계획

### 필요한 데이터

- UserAccount: 사용자 기본 정보와 상태
- UserRoleAssignment: 사용자별 역할 배정
- UserPersonalizationSummary: 개인화 설정 보유/초기화 가능 여부
- UserManagementFilters: 검색/필터 조건
- UserMutationResult: 추가/수정/상태 변경/삭제 요청 결과
- UserValidationError: field-level validation 오류

### 계약

- [contracts/user-management-contract.md](contracts/user-management-contract.md)
- `GET /api/admin/users`
- `GET /api/admin/users/{userId}`
- `POST /api/admin/users`
- `PUT /api/admin/users/{userId}`
- `POST /api/admin/users/{userId}/disable`
- `POST /api/admin/users/{userId}/retire`
- `POST /api/admin/users/{userId}/delete-request`
- `POST /api/admin/users/{userId}/personalization/reset`

MVP에서는 위 endpoint를 실제 backend 구현 요구사항으로 보지 않고, frontend service/mock adapter의 계약 기준으로 사용한다.

### Fixture/Mock 계획

- `tester` 관리자 mock session: 사용자관리 전체 mock 흐름 허용
- `tester1` 비관리자 mock session: 사용자관리 접근 차단 검증
- 활성 관리자 2명 이상 fixture: 마지막 관리자 보호 테스트
- 마지막 관리자 fixture: 삭제/비활성화 차단 테스트
- 개인화 설정 보유 사용자 fixture: 퇴사/삭제 시 유지/초기화 선택 테스트
- 중복 사용자 ID, invalid email, required field missing validation fixture

## 7. 테스트 및 검증 계획

- **단위/서비스 테스트**: userManagementService adapter 선택, mock-only tester 조건, validation helper, 위험 변경 guard
- **컴포넌트 테스트**: UserManagementGrid, UserEditDialog, UserDangerDialog, UserStatusBadge
- **통합 테스트**: `/admin/users` route에서 tester는 사용자관리 화면 표시, tester1은 접근 차단
- **E2E/수동 검증**: quickstart.md의 조회, 검색/필터, 등록, 수정, 비활성/퇴사/삭제 요청 흐름
- **빌드/정적 검증**: `npm test`, `npm run build`
- **회귀 확인**: 기존 로그인, Sidebar 관리자 메뉴 노출/미노출, Live/Playback/Events route가 유지되는지 확인

## 8. 프로젝트 구조

### 문서 구조(이번 기능)

```text
specs/011-user-management/
├── assets/
├── checklists/
├── contracts/
│   └── user-management-contract.md
├── spec.md
├── plan.md
├── research.md
├── data-model.md
└── quickstart.md
```

### 소스 코드 구조

```text
frontend/src/
├── pages/
│   └── UserManagement.tsx
├── components/
│   └── UserManagement/
│       ├── UserManagementGrid.tsx
│       ├── UserDetailPanel.tsx
│       ├── UserEditDialog.tsx
│       ├── UserDangerDialog.tsx
│       └── UserStatusBadge.tsx
├── services/
│   ├── userManagementService.ts
│   └── userManagementMockAdapter.ts
├── mocks/
│   └── userManagement.ts
└── types/
    └── userManagement.ts
```

**구조 결정**: 기존 `pages`, `components`, `services`, `mocks`, `types` 패턴을 따른다. Tabulator는 `frontend/src/lib/tabulator`의 공통 wrapper를 재사용한다. frontend mock MVP와 실제 backend 확장 구조를 분리한다.

## 9. 헌법 체크

- **한국어 우선 산출물**: 통과. 모든 산출물을 한국어로 작성한다.
- **기존 구조 존중**: 통과. 기존 route, Sidebar, auth guard, service/mock 패턴을 유지한다.
- **Mock-First MVP**: 통과. tester/tester1 계정에서만 mock 처리하고 실제 backend 구현은 제외한다.
- **계약 우선**: 통과. 실제 API 구현 전 frontend service/mock contract를 문서화한다.
- **테스트 가능한 증분**: 통과. route 접근, service adapter, grid, mutation flow를 독립 검증 가능하게 나눈다.

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| mock 처리가 모든 계정에 적용되는 오류 | 실제 API 경계가 흐려짐 | tester/tester1 계정에서만 mock adapter 사용하도록 service adapter 선택 테스트 추가 |
| 자기 계정 또는 마지막 관리자 보호 누락 | 관리자 접근 불능 상태 발생 | 위험 변경 guard와 fixture 테스트 추가 |
| 사용자 상태와 재직 상태 혼동 | 활성/비활성/퇴사 의미 혼선 | AccountStatus와 EmploymentStatus를 분리 |
| Tabulator와 React 상태 동기화 문제 | 선택/수정 후 목록 불일치 | 저장 후 목록 snapshot과 selected user를 같은 source로 갱신 |
| 권한/개인화 연동 범위 과확장 | 012/013/002 기능과 범위 충돌 | 이번 기능은 사용자 기준 데이터와 영향 안내까지만 포함 |

## 11. 복잡도 추적

| 결정 | 필요한 이유 | 더 단순한 대안을 거절한 이유 |
|------|-------------|-------------------------------|
| 계정 상태와 재직 상태 분리 | 잠금/비활성은 계정 접근 상태이고 퇴사는 인사/운영 상태이므로 의미가 다름 | 단일 status로 합치면 퇴사지만 이력 참조가 필요한 계정 처리와 로그인 가능 여부가 혼동됨 |
| 삭제 요청을 별도 흐름으로 분리 | 삭제는 권한/개인화/이력 참조에 영향을 주는 위험 작업 | 단순 삭제 버튼은 운영 업무시스템에서 이력 보존과 감사 정책을 훼손할 수 있음 |

## 12. 실제 backend 확장 계획

기존 Phase 1~8은 frontend mock MVP를 대상으로 한다. 실제 DB/API 구현은 다음 문서를 기준으로 별도 backend phase에서 진행한다.

- [backend-database-design.md](backend-database-design.md)
- [backend-api.md](backend-api.md)
- [data-model.md](data-model.md)

### backend 구현 범위

- Flyway `V003__add_organization_units.sql` 적용 확인
- `org_units` 조회 API와 조직 계층 검증
- `users` Entity, Repository, Service, Controller 구현
- 사용자 목록의 검색·조직 필터·상태 필터·페이지 처리
- 사용자 등록·수정·잠금·해제·비활성화·퇴사·삭제 요청 API
- 관리자 권한의 backend 검증
- 자기 계정 및 마지막 관리자 보호
- frontend mock contract와 실제 API 응답의 일치 검증

### backend에서 제외하는 항목

- 역할 자체 CRUD와 세부 권한 정책 CRUD
- SSO/MFA 및 인사 시스템 연동
- 초기 비밀번호 발급 정책이 확정되기 전의 비밀번호 운영 화면
- 물리 외래키 생성

### 설계 결정을 기다리는 항목

- 사용자 다중 조직 소속 허용 여부
- 조직 코드 변경 및 조직 삭제 정책
- 초기 비밀번호 발급 방식
- JWT/session 방식과 로그인 실패 잠금 정책
