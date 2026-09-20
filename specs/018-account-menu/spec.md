# 계정 메뉴 기능 명세

## 개요

상단 계정 메뉴의 `My Profile`, `Settings`, `Help & Support` 항목을 실제 사용할 수 있는 기능으로 정의한다. 현재 이 항목들은 메뉴만 표시하고 화면 이동이나 동작은 제공하지 않는다.

## 목표

- 로그인한 사용자가 자신의 프로필과 비밀번호를 확인·관리할 수 있다.
- 사용자가 개인 환경설정을 관리할 수 있다.
- 사용자가 서비스 사용 안내와 지원 정보를 찾을 수 있다.
- 화면 언어·테마 등 기존 헤더 기능 및 관리자 설정과 중복되는 입력을 만들지 않는다.

## 범위

### My Profile

- 현재 로그인 사용자의 로그인 ID, 표시 이름, 역할 및 등록된 연락처 정보를 표시한다.
- 사용자는 본인 프로필만 조회할 수 있다. 다른 사용자의 프로필을 조회하거나 역할·권한을 변경하는 기능은 제공하지 않는다.
- 표시 이름과 연락처의 수정 가능 여부는 사용자 관리 정책 및 백엔드의 본인 프로필 API 지원에 따른다. 수정이 허용되면 현재 로그인 사용자 정보만 수정한다.
- 비밀번호 변경을 제공한다. 현재 비밀번호 확인, 새 비밀번호 및 확인 입력, 정책 검증, 성공·실패 안내를 포함한다.
- 비밀번호 변경 요청은 인증된 백엔드 API로 처리하며 비밀번호 원문을 클라이언트 저장소나 로그에 저장하지 않는다.

### Settings

- 이 메뉴는 계정별 개인 환경설정으로 한정한다.
- 알람 알림 수신 등 실제 제공 가능한 사용자별 환경설정을 관리하고, 설정은 사용자별로 저장·복원한다.
- 언어와 테마는 현재 헤더의 기능을 단일 입력으로 유지한다. 별도 설정 화면에서 중복 제어를 만들 경우 같은 상태를 공유해야 한다.
- 라이브 대시보드 기본 레이아웃 등 이미 개인화 기능으로 제공되는 항목은 기존 저장 기능을 재사용한다.
- 카메라 관리, 시스템 공통 설정, 사용자/역할/권한 관리는 이 화면의 범위가 아니다.

### Help & Support

- 사용자가 주요 화면과 기본 업무 흐름을 확인할 수 있는 사용 안내 및 FAQ를 제공한다.
- 지원 담당자 연락처나 지원 채널은 실제 운영 정보가 정해진 경우에만 노출한다. 미확정 연락처를 임의로 표시하지 않는다.
- 애플리케이션 버전 및 현재 실행 환경 정보를 확인할 수 있다.

## 탐색 및 접근

- 계정 메뉴 항목 선택 시 해당 화면으로 이동하고 드롭다운을 닫는다.
- 제안 경로는 프로필 `/account/profile`, 개인 설정 `/account/settings`, 도움말 `/help`이다.
- 현재 `/settings`는 기존 카메라/시스템 설정 경로이므로 계정별 개인 설정 경로와 혼용하거나 기존 동작을 조용히 대체하지 않는다.
- 모든 화면은 인증된 사용자만 접근할 수 있다. 세션이 만료되면 기존 인증 만료 흐름을 따른다.
- 브라우저 뒤로 가기, 직접 URL 진입, 새로고침에도 현재 경로와 인증 상태가 일관되게 동작한다.

## 사용자 경험 및 상태

- 조회·저장 중 상태, 저장 성공, 검증 오류, 서버 오류를 사용자에게 명확히 표시한다.
- 저장 실패 시 사용자가 입력한 값을 유지하고 재시도할 수 있어야 한다.
- 저장되지 않은 변경사항이 있는 상태에서 화면을 벗어나려 하면 확인을 제공한다.
- 폼은 키보드만으로 조작할 수 있고, 입력 항목에는 연결된 라벨과 오류 안내가 있어야 한다.
- 화면 문구는 프로젝트의 한국어·영어 다국어 정책을 따른다.

## 보안 및 데이터 원칙

- 백엔드는 요청 사용자의 인증 정보를 기준으로 본인 프로필과 개인 설정의 소유자를 결정한다. 클라이언트가 전달한 사용자 ID만 신뢰해 대상 사용자를 선택하지 않는다.
- 비밀번호 변경은 현재 비밀번호 검증을 포함하도록 인증 API 계약을 정의한다. 검증 실패 시 비밀번호를 변경하지 않는다.
- 프로필과 환경설정 API는 적절한 인증 및 입력 검증을 적용한다. 다른 사용자의 데이터 접근은 거부한다.
- 비밀번호와 인증 토큰은 화면, 로그, 프로필 응답에 포함하지 않는다.
- 사용자별로 영속화하는 설정은 사용자 계정 간에 섞이지 않아야 한다.

## 제외 사항

- 관리자용 사용자 계정 생성·수정·삭제
- 역할 및 권한 정책 관리
- 전체 시스템 설정과 카메라 설정의 재구성
- 운영 지원 연락처나 FAQ 콘텐츠의 관리 도구
- 기존 헤더의 언어·테마 기능을 대체하는 별도 설정 체계

## 완료 기준

- 계정 메뉴의 세 항목이 각각 올바른 화면으로 이동한다.
- 프로필 화면은 인증된 현재 사용자의 정보만 표시한다.
- 비밀번호 변경은 백엔드에서 현재 비밀번호를 확인하고 결과를 정확히 안내한다.
- 개인 환경설정은 저장 후 재접속해도 사용자별로 복원된다.
- 도움말 화면에서 안내 및 실제로 설정된 지원·버전 정보를 확인할 수 있다.
- 비인증 접근, 잘못된 입력, 네트워크 오류가 안전하고 일관된 화면 상태로 처리된다.
## Account Center Modal UX

The account avatar opens one modal instead of a dropdown that navigates to separate account pages. The modal provides Profile, Personal Settings, and Help & Support as tabs, reusing the existing content components. Users can dismiss it with the close button, backdrop click, or Escape. The account-specific routes `/account/profile`, `/account/settings`, and `/help` are not part of this experience; the existing `/settings` system settings route remains unchanged.
## Product Decision Update

The browser-local first-screen preference is removed because account preferences must be account-scoped and this preference is not required now. After login, the application root always opens `/live`. The header account button opens a dropdown with My Profile, Settings, Help & Support, and Sign out. Settings opens the existing system settings route `/settings`; Profile and Help open the account modal only after the corresponding menu item is selected.

## Settings Scope Correction

- `/settings` is the signed-in account's alarm notification subscription page. It only stores whether that account opts into email and SMS alerts.
- The email address and phone number belong to the user account and are managed through User Management. Settings displays these values read-only; it does not collect alternate notification destinations. Missing contact information disables opting into that channel.
- Persist user email and phone on `TB_M26_USER`. Persist channel preferences in `TB_M26_USER_ALERT_PREF`, keyed by logical `USER_ID` with a unique index and no foreign-key constraint. Both tables retain audit metadata. Existing users default to both channels disabled.
- This scope stores preferences only. Email/SMS provider setup and actual message delivery are not implemented here.
- Camera/source CRUD is not a Settings feature. `/admin/videos` opens the existing database-backed Video Management page; the temporary camera list and first-camera setup prompt are removed from Settings.
- Recording configuration is not offered in Settings.
