# 구현 계획: 앱 기본 뼈대

**브랜치**: `000-app-shell` | **일자**: 2026-08-16 | **명세**: [spec.md](spec.md)

**입력**: `/specs/000-app-shell/spec.md`의 기능 명세

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

> 이 문서는 한국어로 작성한다. 기술 용어, API 이름, 파일 경로, 코드 식별자, 명령어는 원문 또는 영문 표기를 유지할 수 있다.
> 구현 계획은 "어떻게 구현할 것인가"를 정의한다. 기능 경계는 spec.md를 기준으로 하며, plan.md에서 새 기능 요구사항을 추가하지 않는다.

## 1. 계획 요약

앱 기본 뼈대는 기존 React frontend의 `App`, `AppLayout`, `Header`, `Sidebar`, `uiSlice`를 기준으로 정리한다. 인증 여부에 따라 로그인 route와 보호 route를 분리하고, 보호 route는 모두 동일한 layout shell 안에서 렌더링한다. 상단바는 제품명, 사이드바 토글, theme/language/profile 메뉴를 제공한다. 사이드바는 일반 모니터링 메뉴와 관리자 메뉴를 구분하고, 관리자 메뉴에는 통신 및 모델 수정과 접속 권한 관리 영역을 포함한다. 화면 수정 계열 작업은 사이드바에서 제거하고 002 라이브 대시보드 내부 편집 기능으로 연결한다.

## 2. 요구사항 추적

| 명세 항목 | 계획 반영 위치 | 비고 |
|-----------|----------------|------|
| FR-001 | 5. 화면/컴포넌트 구조 | protected layout |
| FR-002 | 5. 화면/컴포넌트 구조 | header/sidebar/main |
| FR-003 | 5. 화면/컴포넌트 구조 | product identity |
| FR-004 | 5. 상태 및 상호작용 흐름 | sidebar toggle |
| FR-005 | 5. 화면/컴포넌트 구조 | profile menu |
| FR-006 | 5. 상태 및 상호작용 흐름 | logout |
| FR-007 | 5. 상태 및 상호작용 흐름 | theme selector |
| FR-008 | 5. 상태 및 상호작용 흐름 | language selector |
| FR-009 | 5. 화면/컴포넌트 구조 | notification entry |
| FR-010 | 5. 화면/컴포넌트 구조 | general nav items |
| FR-011 | 5. 상태 및 상호작용 흐름 | active route |
| FR-012 | 5. 화면/컴포넌트 구조 | overlay sidebar |
| FR-013 | 5. 상태 및 상호작용 흐름 | small screen close |
| FR-014 | 5. 상태 및 상호작용 흐름 | unauth redirect |
| FR-015 | 5. 상태 및 상호작용 흐름 | unknown route fallback |
| FR-016 | 5. 화면/컴포넌트 구조 | screen edit menu removal |
| FR-017 | 5. 서비스 및 데이터 흐름 | live dashboard edit boundary |
| FR-018 | 5. 화면/컴포넌트 구조 | admin menu |
| FR-019 | 6. 계약 | communication/model menu |
| FR-020 | 5. 화면/컴포넌트 구조 | access management menu |
| FR-021 | 6. 계약 | user/role/permission menu |
| FR-022 | 6. 데이터 및 계약 계획 | permission influence |
| FR-023 | 5. 상태 및 상호작용 흐름 | admin-only visibility |
| FR-024 | 5. 상태 및 상호작용 흐름 | non-admin hidden admin menu |

## 3. 기술 컨텍스트

**언어/버전**: TypeScript, React 19, Vite 8

**주요 의존성**: React Router, Redux Toolkit, React i18next, Vitest, React Testing Library

**저장소/상태 관리**: Redux auth slice, Redux ui slice, i18n state, document theme attribute

**테스트**: Vitest, React Testing Library, production build

**대상 플랫폼**: 웹 브라우저, 운영 모니터 화면 중심

**프로젝트 유형**: frontend 중심 web app

**성능 목표**: route 전환과 사이드바/메뉴 토글은 즉시 반응한다.

**제약사항**: 기존 layout 구조 존중, backend 의존 없음, 화면 수정 메뉴는 sidebar 제외, 권한별 동작 상세 구현 제외

**규모/범위**: Header, Sidebar, AppLayout, protected routes, general/admin navigation, theme/language/profile menu

## 4. 구현 범위와 제외 범위

### 구현 범위

- `frontend/src/App.tsx` 인증 기반 route 분기와 보호 route fallback
- `frontend/src/components/Layout/AppLayout.tsx` 공통 header/sidebar/main 구조
- `frontend/src/components/Layout/Header.tsx` 제품명, sidebar toggle, theme/language/profile/logout
- `frontend/src/components/Layout/Sidebar.tsx` 일반 메뉴, 관리자 메뉴 navigation과 overlay
- `frontend/src/store/slices/uiSlice.ts` sidebar, theme, notification, modal 공통 UI state
- i18n navigation label 연결
- 관련 unit/component tests

### 제외 범위

- 001 로그인 form/API 상세 동작
- 002 라이브 메인 화면 상세 기능
- 003 화면 확대 보기 상세 기능
- 알림 목록/상세/push 수신
- 권한별 메뉴 제어
- 화면 수정 메뉴의 sidebar 노출

## 5. 설계 접근

### 화면/컴포넌트 구조

- `AppRoutes`는 인증 상태를 기준으로 login routes와 protected routes를 분리한다.
- protected route는 `AppLayout`으로 감싸서 Header, Sidebar, main content 구조를 공유한다.
- `Header`는 왼쪽에 menu toggle과 제품 identity를 두고, 오른쪽에 theme/language/notification/profile controls를 둔다.
- `Sidebar`는 overlay와 fixed nav panel로 구성한다.
- `Sidebar`의 일반 메뉴는 라이브 대시보드, 녹화, 이벤트 중심으로 구성한다.
- `Sidebar`의 관리자 메뉴는 통신 및 모델 수정, 접속 권한 관리 그룹으로 구성한다.
- 화면 수정, 공정 추가, 세부공정 수정, 화면 배치 수정은 sidebar 메뉴에 넣지 않는다.
- `main` 영역은 header 아래 남은 높이를 사용하고 overflow scroll을 허용한다.

### 상태 및 상호작용 흐름

- `ui.sidebarOpen`이 true면 overlay와 sidebar를 표시한다.
- overlay click은 sidebar를 닫는다.
- 작은 화면에서는 nav item click 후 sidebar를 닫는다.
- `ui.themeMode` 변경 시 document root에 `data-theme`와 dark class를 반영한다.
- 언어 변경은 i18n state를 갱신하고 메뉴 label을 다시 렌더링한다.
- profile/logout은 auth state와 route 이동을 연결한다.
- 관리자 메뉴 표시 여부는 사용자 역할/권한의 관리자 여부와 연결한다.
- 관리자 권한이 없는 사용자에게는 관리자 메뉴 그룹과 하위 메뉴를 렌더링하지 않는다.

### 서비스 및 데이터 흐름

- 앱 기본 뼈대는 backend API를 직접 호출하지 않는다.
- 사용자 정보는 auth state에서 읽는다.
- 알림 개수는 ui state의 notifications를 읽는다.
- navigation label은 translation key를 통해 표시한다.
- 권한 관리 메뉴 구조는 후속 RBAC/API 설계의 입력으로 사용한다.
- 라이브 대시보드 개인화 기능은 권한 관리 결과의 영향을 받을 수 있으므로, 000에서는 메뉴/권한 경계만 남긴다.

## 6. 데이터 및 계약 계획

### 필요한 데이터

- AuthState
- UIState
- ThemeMode
- Notification
- NavItem
- NavGroup
- AdminNavItem
- Current route
- Language
- Permission summary

### 계약

- [contracts/app-route-contract.md](contracts/app-route-contract.md)
- [contracts/navigation-contract.md](contracts/navigation-contract.md)
- [contracts/ui-shell-state-contract.md](contracts/ui-shell-state-contract.md)
- [contracts/admin-menu-contract.md](contracts/admin-menu-contract.md)

### Fixture/Mock 계획

- authenticated user state
- unauthenticated state
- sidebar open/closed state
- theme1/theme2/theme3 state
- 한국어/영어 label state
- administrator role state
- non-administrator role state

## 7. 테스트 및 검증 계획

- **단위/상태 테스트**: `uiSlice` sidebar/theme/notification/modal state
- **컴포넌트 테스트**: Header menu toggle, theme/language/profile menu, Sidebar general/admin navigation
- **route 테스트**: authenticated route shell, unauthenticated redirect, unknown route fallback
- **E2E/수동 검증**: quickstart.md의 sidebar, navigation, theme, language, logout
- **빌드/정적 검증**: `npm test -- --run`, `npm run build` in `frontend/`
- **회귀 확인**: 001 login, 002 live, 003 camera focus가 AppLayout 안에서 정상 표시

## 8. 프로젝트 구조

### 문서 구조(이번 기능)

```text
specs/000-app-shell/
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
│   ├── App.tsx
│   ├── components/Layout/
│   ├── store/slices/uiSlice.ts
│   ├── store/slices/authSlice.ts
│   └── i18n/

backend/
└── 해당 없음
```

**구조 결정**: 모든 보호 화면은 `AppLayout`을 공유하고, 개별 기능 화면은 main content 안에만 렌더링한다.

## 9. 헌법 체크

- **한국어 우선 산출물**: 통과. 산출물을 한국어로 작성한다.
- **기존 구조 존중**: 통과. 기존 Layout/App/uiSlice 구조를 기준으로 한다.
- **Mock-First MVP**: 통과. backend 의존이 없다.
- **계약 우선**: 통과. route/navigation/ui state 계약을 문서화한다.
- **테스트 가능한 증분**: 통과. layout, navigation, theme, auth redirect를 독립 검증할 수 있다.

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| 000 공통 뼈대와 개별 기능 spec 경계 혼동 | 요구사항 중복 | 001/002/003 상세 기능은 제외 범위에 명시 |
| 권한별 메뉴 제어 부재 | 운영 환경 권한 정책 미반영 | 000은 관리자 메뉴 표시/미표시 경계를 정의하고 상세 권한 CRUD/API는 후속 기능으로 분리 |
| 원문 이미지의 화면 수정 메뉴가 최신 요구사항과 충돌 | sidebar 범위 오염 | 화면 수정 메뉴는 deprecated 처리하고 002 live dashboard edit boundary로 분리 |
| 메뉴/테마/언어 popover 충돌 | UI 조작 혼란 | 바깥 클릭 닫기와 단일 상태 검증 강화 |

## 11. 복잡도 추적

| 결정 | 필요한 이유 | 단순성을 유지할 근거 |
|------|-------------|-----------------------|
| overlay sidebar 유지 | 작은 화면과 모니터 화면 양쪽에서 단순한 navigation 제공 | 기존 구현을 유지하고 responsive drawer만 사용 |
| AppRoutes에서 인증 분기 유지 | 보호 화면 노출 방지 | route guard library 도입 없이 현재 구조로 충분 |
