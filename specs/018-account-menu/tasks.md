# 작업 목록: 계정 메뉴

**입력**: `specs/018-account-menu/`의 `spec.md`, `plan.md`

**테스트**: 인증·저장·라우팅 경계의 사용자 영향과 보안 위험 때문에 관련 단위/컴포넌트 테스트를 포함한다.

## Phase 1: 기반 및 계약 확인

**목적**: 기존 사용자 데이터 및 개인화 저장 경계를 파악하고, 모든 스토리가 재사용할 라우트/인증 계약을 확정한다.

- [X] T001 [P] `backend/src/main/java/com/vision/controller/AuthController.java`, `backend/src/main/java/com/vision/service/AuthService.java`, `backend/src/main/java/com/vision/dto/ChangePasswordRequest.java`에서 현재 비밀번호 변경 검증 및 테스트 위치를 확인하고 요청 계약 변경 범위를 기록한다.
- [X] T002 [P] 사용자 관리 API/DTO와 `frontend/src/store/slices/authSlice.ts`를 확인해 프로필 화면에서 실제 사용 가능한 필드와 수정 가능한 필드를 확정한다.
- [X] T003 [P] `frontend/src/services/layoutService.ts` 및 레이아웃 상태 저장 코드를 확인해 사용자별 설정 영속성/namespace 재사용 경로를 기록한다.
- [X] T004 `frontend/src/App.tsx`에서 기존 인증 라우트 경계를 확인하고 `/settings` 카메라 설정을 유지하는 새 계정 경로 등록 위치를 확정한다.

## Phase 2: 공통 기반

**목적**: 계정 메뉴 이동과 공통 다국어/화면 구조를 준비한다.

- [X] T005 `frontend/src/components/Layout/Header.tsx`의 계정 메뉴 항목을 `/account/profile`, `/account/settings`, `/help` 이동에 연결하고 이동 시 드롭다운을 닫는다.
- [X] T006 `frontend/src/App.tsx`에 세 인증 전용 경로를 등록하고 현재 `AppLayout` 및 세션 만료 흐름을 적용한다.
- [X] T007 [P] `frontend/src/locales/ko.json` 및 `frontend/src/locales/en.json`에 계정 메뉴, 프로필, 개인 설정, 도움말의 필요한 문구를 추가한다.

## Phase 3: 사용자 스토리 1 - 내 프로필과 비밀번호 관리 (우선순위: P1)

**목표**: 로그인한 사용자가 본인 계정 정보를 확인하고 현재 비밀번호 검증을 거쳐 비밀번호를 변경한다.

**관련 요구사항**: My Profile, 비밀번호 보안, 인증 및 오류 처리

**독립 테스트**: 프로필은 현재 세션 사용자만 표시하며, 잘못된 현재 비밀번호로는 변경이 거부되고 올바른 입력은 성공 안내를 제공한다.

- [X] T008 [P] `frontend/src/pages/__tests__/AccountProfile.test.tsx`에 프로필 정보 렌더링, 서버 오류, 비밀번호 검증 및 성공/실패 UI 테스트를 작성한다.
- [X] T009 [P] `backend/src/test/java/com/vision/service/AuthServiceTest.java`와 관련 controller 테스트에 현재 비밀번호 불일치, 성공, 입력 검증 테스트를 추가한다.
- [X] T010 `backend/src/main/java/com/vision/dto/ChangePasswordRequest.java`에 현재 비밀번호 필드를 추가하고 기존 새 비밀번호 검증을 유지한다.
- [X] T011 `backend/src/main/java/com/vision/service/AuthService.java`에서 인증된 사용자 계정의 현재 비밀번호를 검증한 뒤에만 새 비밀번호를 저장한다.
- [X] T012 `backend/src/main/java/com/vision/controller/AuthController.java`의 변경 요청 DTO 연결을 갱신하고 응답/오류를 기존 API 형식으로 유지한다.
- [X] T013 `frontend/src/services/authService.ts`의 `changePassword`가 현재 비밀번호와 새 비밀번호를 전송하도록 계약을 갱신한다.
- [X] T014 `frontend/src/pages/AccountProfile.tsx`에 현재 세션 기반 프로필 표시와 현재/새 비밀번호 입력 폼을 구현한다.
- [X] T015 `frontend/src/App.tsx`와 `frontend/src/pages/__tests__/AccountProfile.test.tsx`를 확인해 직접 URL/새로고침 시 인증이 적용되고 다른 사용자의 프로필 데이터가 노출되지 않는지 검증한다.

## Phase 4: 사용자 스토리 2 - 도움말 및 지원 정보 확인 (우선순위: P2)

**목표**: 사용자가 실제 안내, FAQ, 확인 가능한 버전/환경 정보를 찾는다.

**관련 요구사항**: Help & Support, 다국어, 확정 정보만 노출

**독립 테스트**: 한국어/영어 도움말을 표시하고 운영 지원 연락처가 설정되지 않았을 때 임의 연락처를 노출하지 않는다.

- [X] T016 [P] `frontend/src/pages/__tests__/HelpSupport.test.tsx`에 안내 콘텐츠, 다국어, 연락처 미설정, 버전 정보 렌더링 테스트를 작성한다.
- [X] T017 `frontend/src/pages/HelpSupport.tsx`에 정적 사용 안내/FAQ와 출처가 확인된 버전/환경 정보를 표시한다.
- [X] T018 `frontend/src/locales/ko.json` 및 `frontend/src/locales/en.json`에 도움말 콘텐츠 번역을 추가하고 지원 연락처 값이 없는 경우 해당 영역을 숨긴다.

## Phase 5: 사용자 스토리 3 - 개인 환경설정 관리 (우선순위: P3)

**목표**: 사용자가 지원되는 개인 설정을 저장하고 재방문 시 자신의 값으로 복원한다.

**관련 요구사항**: 사용자별 설정 저장, 기존 헤더/레이아웃 기능 재사용, 저장·오류 상태

**독립 테스트**: 계정별 설정이 서로 섞이지 않고 저장 후 재방문해 복원되며 저장 실패 시 입력값이 유지된다.

- [X] T019 [P] `frontend/src/services/__tests__/accountSettingsService.test.ts`에 사용자별 격리, 조회/저장/복원 및 오류 테스트를 작성한다.
- [X] T020 [P] `frontend/src/pages/__tests__/AccountSettings.test.tsx`에 설정 초기화, 저장 상태, 오류 및 미저장 이탈 확인 테스트를 작성한다.
- [X] T021 `frontend/src/services/accountSettingsService.ts`에 기존 저장 패턴을 재사용하는 사용자별 설정 조회/저장 기능을 구현한다.
- [X] T022 `frontend/src/pages/AccountSettings.tsx`에 실제 지원 가능한 개인 설정을 표시하고 기존 언어/테마/레이아웃 상태를 중복 생성하지 않고 연결한다.
- [X] T023 `frontend/src/App.tsx`에서 `/account/settings`를 개인 설정 페이지에 연결하고 `/settings` 기존 동작이 유지되는지 검증한다.

## Phase 6: 통합 및 최종 검증

**목적**: 메뉴부터 각 화면까지 통합 흐름과 기존 기능 회귀를 확인한다.

- [X] T024 [P] `frontend/src/components/Layout/__tests__/Header.accountMenu.test.tsx`에 세 메뉴 목적지 이동 및 메뉴 닫힘 테스트를 추가한다.
- [X] T025 [P] `frontend/src/pages/__tests__/AccountRoutes.test.tsx`에 인증된 직접 URL 접근, 비인증 리다이렉트, 뒤로 가기/경로 갱신 동작을 검증한다.
- [X] T026 `frontend/src/pages/Settings.tsx` 관련 테스트를 실행해 기존 카메라/시스템 설정의 `/settings` 동작 회귀가 없는지 확인한다.
- [X] T027 frontend 테스트와 `npm run build`, backend 관련 테스트와 `mvn test`를 실행하고 실패를 해결한다.
- [X] T028 `specs/018-account-menu/spec.md`, `plan.md`, `tasks.md`의 범위 일치 여부를 확인하고 `git diff --check`를 실행한다.

## 의존성

```text
T001-T004 -> T005-T007
T005-T007 -> US1 / US2 / US3
US1, US2, US3 -> T024-T028
```

- **US1(P1)**: 공통 기반 이후 독립 구현 가능. 비밀번호 변경은 backend 계약 갱신 포함.
- **US2(P2)**: 공통 기반 이후 독립 구현 가능.
- **US3(P3)**: T003 저장 패턴 확인 및 공통 기반 이후 독립 구현 가능.
- 서로 다른 테스트/서비스 파일을 다루는 `[P]` 작업은 병렬 진행할 수 있다. 같은 파일을 수정하는 작업은 병렬 진행하지 않는다.

## MVP 및 실행 전략

1. T001-T007로 데이터 원천과 라우트/메뉴 기반을 확정한다.
2. P1인 내 프로필 조회 및 현재 비밀번호 검증이 있는 비밀번호 변경을 완료하고 관련 frontend/backend 테스트를 통과시킨다.
3. P2 도움말을 독립 제공한다.
4. P3 개인 환경설정을 구현하되 기존 `/settings`, 헤더 언어/테마, 레이아웃 저장 상태와 중복되지 않는지 확인한다.
5. 마지막 통합 검증에서 기존 카메라 설정과 인증 흐름의 회귀를 확인한다.
## UI Refinement: Account Center Modal

- [X] Replace account dropdown navigation with a single modal opened by the header account button.
- [X] Provide Profile, Personal Settings, and Help & Support as accessible tabs; support close button, backdrop, and Escape dismissal.
- [X] Remove standalone account route navigation and cover modal tab switching/dismissal in frontend tests.
## UX Correction

- [X] Remove the browser-local landing-page preference and return the authenticated root route to `/live`.
- [X] Restore the account dropdown; Settings opens `/settings`, while Profile and Help open their modal content only after selection.
- [X] Verify dropdown, modal selection, Settings navigation, root redirect, and existing system settings with frontend tests.

## Settings Scope Correction

- [X] Replace Settings camera/recording mock controls with account-scoped email/SMS alert subscriptions.
- [X] Add persisted user email/phone fields and audited `TB_M26_USER_ALERT_PREF` storage without an FK; validate optional user contacts.
- [X] Display account contacts read-only and prevent enabling a channel without its contact.
- [X] Route `/admin/videos` to the existing Video Management page; remove camera setup from Settings.
- [X] Add backend preference service and frontend Settings tests.
- [X] Verify Flyway V021, backend tests, frontend tests, build, and documentation consistency.
