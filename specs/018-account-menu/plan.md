# 구현 계획: 계정 메뉴

**브랜치**: `018-account-menu` | **일자**: 2026-09-20 | **명세**: [spec.md](spec.md)

**입력**: `specs/018-account-menu/spec.md`

## 1. 계획 요약

상단 계정 드롭다운의 세 항목을 각각 인증된 화면으로 연결하고, 사용자 프로필/비밀번호, 개인 환경설정, 도움말을 점진적으로 제공한다. 프로필과 비밀번호를 우선 구현하며, 비밀번호 변경은 현재 비밀번호를 서버에서 검증하도록 기존 인증 API 계약을 보강한다. 기존 `/settings`의 카메라/시스템 설정은 유지하고 계정별 환경설정은 별도 경로로 분리한다.

## 2. 요구사항 추적

| 명세 항목 | 계획 반영 위치 | 비고 |
|---|---|---|
| My Profile | US1, 라우트 및 인증 서비스 | 사용자 관리/인증 응답에서 확보되는 정보만 표시하고 수정 가능 필드는 API 지원 확인 후 결정 |
| 비밀번호 변경 및 보안 | US1, 인증 API 계약 및 테스트 | 현재 비밀번호 확인을 서버에서 수행 |
| Settings | US3, 사용자별 환경설정 서비스 | 헤더 언어/테마와 기존 레이아웃 개인화 상태 재사용 |
| Help & Support | US2, 도움말 페이지 | 지원 연락처는 확정된 운영 정보가 있을 때만 표시 |
| 인증·직접 URL·새로고침 | 기반 작업 및 최종 검증 | 미인증은 기존 세션 만료/로그인 경로 사용 |
| 다국어·접근성·오류 상태 | 공통 및 각 사용자 스토리 | 기존 i18n, 공통 확인/알림 UI 패턴 재사용 |

## 3. 기술 컨텍스트

- **Frontend**: React, TypeScript, Vite, React Router, Redux Toolkit, i18next
- **Backend**: Spring Boot, 기존 인증 API 및 서비스, MariaDB
- **인증 상태**: Bearer 토큰, `/auth/session` 세션 재검증
- **현재 비밀번호 API**: `POST /auth/password`는 현재 `newPassword`만 받으므로 요청 DTO와 서비스 검증을 확장해야 한다.
- **프로필 데이터**: frontend `User` 및 `/auth/session`은 id/username/role/permissions 중심이다. 표시 이름·연락처의 원천과 본인 수정 API는 구현 전 확인한다.
- **설정 저장**: 기존 개인 레이아웃 저장 방식과 사용자 구분을 확인해 재사용한다. 새 설정 백엔드/테이블은 현 단계에서 기본 도입하지 않는다.
- **테스트**: Vitest/React Testing Library, 기존 Spring Boot 테스트 및 frontend production build
- **제약**: 기존 `/settings`의 카메라/시스템 설정 기능을 대체하거나 제거하지 않는다. 서버가 없는 mock fallback을 새로 추가하지 않는다.

## 4. 범위

### 구현 범위

- 인증된 계정 메뉴 이동과 `/account/profile`, `/account/settings`, `/help` 라우트
- 본인 프로필 표시 및 현재 비밀번호 검증을 포함한 비밀번호 변경
- 사용자별로 구분되는 개인 설정의 조회·저장
- 사용 안내, FAQ, 버전/환경 정보를 제공하는 도움말
- 한국어/영어 문구, 로딩/오류/저장 상태, 키보드 접근성 및 관련 테스트

### 제외 범위

- 관리자 사용자/역할/권한 관리
- 기존 카메라/시스템 설정 화면 재구성
- FAQ·지원 담당자 정보를 편집하는 관리 도구
- 확정되지 않은 지원 연락처 노출
- 기존 헤더의 언어/테마 및 레이아웃 개인화 기능을 별도 상태로 복제

## 5. 설계 접근

### 화면 및 라우트

- `Header.tsx`에서 메뉴 선택 시 드롭다운을 닫고 `useNavigate`로 해당 경로를 연다.
- 프로필, 개인 설정, 도움말 페이지는 각각 독립된 page component로 구성하고 기존 `AppLayout` 및 프로젝트의 공통 페이지 스타일을 사용한다.
- `/settings`는 기존 화면에 그대로 유지한다. 인증된 새 라우트는 앱의 현재 세션 검증 흐름을 공유한다.

### 데이터 흐름

- 프로필 요약은 인증된 `/auth/session` 결과를 기본 원천으로 한다. 추가 프로필 필드와 수정 API는 기존 사용자 관리 계약을 조사한 뒤 지원 범위만 구현한다.
- 비밀번호 변경 요청은 `{ currentPassword, newPassword }` 계약으로 보내고, backend가 로그인 사용자 계정의 해시와 현재 비밀번호를 검증한 뒤 변경한다. 평문 비밀번호를 로그에 남기지 않는다.
- 개인 설정은 기존 저장소/레이아웃 개인화 API 패턴을 우선 재사용한다. 사용자 ID는 서버가 인증 정보에서 결정하거나 frontend 저장 시 현재 로그인 계정으로 namespace를 격리한다.
- 도움말 콘텐츠는 정적 다국어 콘텐츠로 제공한다. 버전 정보는 package/build 설정 등 신뢰 가능한 기존 원천을 확인해 노출하며, 원천이 없다면 임의의 버전 문자열을 만들지 않는다.

## 6. 계약 및 데이터 계획

- 기존 `POST /auth/password` 요청을 현재 비밀번호와 새 비밀번호를 받도록 확장한다. 오류 응답은 기존 API 오류 형식과 일치시킨다.
- `/auth/session`을 프로필 요약에 재사용한다. 프로필 수정 endpoint는 저장소 조사 후 필요성과 기존 사용자 관리 규칙을 확인하기 전에는 추가하지 않는다.
- 개인 설정은 우선 기존 브라우저 저장/개인화 경계를 활용한다. 새 DB 테이블은 요구사항 및 backend 소유권 계약이 확정되기 전에는 만들지 않는다.
- 별도 entity/table/FK migration은 계획하지 않는다.

## 7. 테스트 및 검증 계획

- 비밀번호 변경 서비스/컨트롤러 테스트: 현재 비밀번호 불일치, 정책 위반, 성공, 평문 로그 미노출 확인
- 페이지 테스트: 프로필 데이터/실패 상태, 저장 성공·실패 및 미저장 이탈 확인
- 라우팅 테스트: 메뉴 이동, 새로고침/직접 URL, 미인증 리다이렉트 및 기존 `/settings` 회귀 확인
- 환경설정 테스트: 사용자별 격리, 재방문 복원, 저장 오류 처리
- 도움말 테스트: 한국어/영어, 운영 연락처가 설정되지 않은 상태, 버전 정보의 출처 확인
- frontend 관련 테스트 및 `npm run build`, backend 관련 테스트 및 `mvn test`

## 8. 프로젝트 구조

```text
frontend/src/
├── components/Layout/Header.tsx
├── pages/AccountProfile.tsx
├── pages/AccountSettings.tsx
├── pages/HelpSupport.tsx
├── services/authService.ts
├── services/accountSettingsService.ts
├── locales/ko.json
└── locales/en.json

backend/src/main/java/com/vision/
├── controller/AuthController.java
├── dto/ChangePasswordRequest.java
└── service/AuthService.java
```

실제 사용자 관리 API, 테스트 디렉터리와 기존 개인화 저장소 경로는 작업 시 저장소 구조에 맞춰 재사용한다. 새 모듈이나 DB 계층은 도입하지 않는다.

## 9. 헌법 체크

- **한국어 우선 산출물**: 통과. 계획과 작업은 한국어로 작성한다.
- **기존 구조 존중**: 통과. 기존 라우팅, 서비스, i18n, 공통 UI를 확장한다.
- **Mock-First MVP**: 제한적 예외. 신규 설정/프로필 mock fallback과 일반 backend 기능은 추가하지 않는다. 실제 비밀번호 변경은 인증 정보를 바꾸는 보안 기능이므로 기존 인증 backend에서 현재 비밀번호를 검증하도록 최소 확장한다.
- **계약 우선**: 통과. 비밀번호 변경 요청 계약과 프로필/환경설정 데이터 경계를 작업 전에 확인한다.
- **테스트 가능한 증분**: 통과. 프로필, 도움말, 설정을 스토리별로 독립 검증한다.
- **로컬 개발 환경 전체 실행**: 통과. 최종 UI 확인이 필요하면 backend와 frontend를 함께 실행한다.

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|---|---|---|
| 프로필 상세 필드 원천/API 부재 | 이름/연락처 표시·수정 범위 제한 | 기존 사용자 관리 계약을 먼저 확인하고 미지원 필드는 임의 데이터로 채우지 않는다. |
| 비밀번호 변경의 인증 계약 확장 | 기존 호출자 호환성 또는 오류 처리 영향 | 로그인 강제 변경 흐름과 기존 API 테스트를 함께 갱신한다. |
| 개인 설정의 저장 범위 불명확 | 계정 간 설정 혼합 또는 기기별 차이 | 기존 레이아웃 저장 구현을 조사하고 사용자 namespace 및 영속성 한계를 명시한다. |
| `/settings` 경로 충돌 | 기존 카메라 설정 회귀 | 새 개인 설정은 `/account/settings`로 분리하고 기존 라우트를 회귀 테스트한다. |

## 11. 복잡도 추적

추가 계층이나 DB 스키마를 만들지 않는다. 비밀번호 변경 요청에 현재 비밀번호 필드를 추가하는 것은 서버 측 사용자 검증이라는 보안 요구사항을 만족하기 위해 필요하다.

## 12. Settings 범위 결정

- Settings는 계정별 알람 이메일/SMS 수신 여부만 관리하고, 주소/전화번호는 사용자 계정 정보를 읽기 전용으로 표시한다.
- 연락처는 User Management가 수정 원천이며 `TB_M26_USER.USER_EMAIL`, `USER_PHONE`에 저장한다. 채널별 수신 설정은 감사 항목을 포함한 `TB_M26_USER_ALERT_PREF`에 저장한다. 사용자 ID는 논리적 연결이며 FK는 생성하지 않는다.
- 주소가 없으면 해당 채널 수신을 켤 수 없다. 발송 사업자 연동 및 실제 발송은 이번 범위에서 제외한다.
- 카메라 관리는 기존 DB 기반 Video Management 페이지를 `/admin/videos`에서 사용한다. Settings의 mock 카메라 CRUD/첫 카메라 추가와 녹화 설정은 제거한다.
- 개발 및 검증 시 Flyway V021 적용과 Settings API/UI, 영상 관리 경로를 확인한다.
## Account Center Modal UX Update

The header account button opens `AccountCenterModal`. Profile, Personal Settings, and Help & Support are tab panels inside the same modal; they do not navigate to standalone routes. The shared `Modal` handles dialog semantics and dismissal, while the existing page components are reused as tab content. The legacy account routes are removed; `/settings` remains the camera/system settings page.
## Product Decision Update

Do not persist a first-screen preference in browser storage. Root navigation after login defaults to `/live`. Restore the account dropdown; route Settings to the existing `/settings` page and use the account modal for Profile or Help after explicit menu selection.
