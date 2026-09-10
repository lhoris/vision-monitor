# 작업 목록: 라이브 대시보드 통합 개인화

**입력**: `specs/014-live-dashboard-personalization/`

## Phase 1: SDD 정리

- [X] T001 `spec.md`를 테마와 그리드 레이아웃 통합 개인화 요구사항으로 갱신한다.
- [X] T002 `plan.md`에 `TB_M26_USER_PERSONAL` 기반 구현 방향을 기록한다.
- [X] T003 `research.md`에 신규 layout 테이블을 만들지 않는 결정과 대안을 기록한다.
- [X] T004 `data-model.md`에 `PERSONAL_DATA` JSON 구조를 정의한다.
- [X] T005 `contracts/layout-personalization-api-contract.md`에 `theme`, `version`, `tabs`, `activeTab` API 계약을 정의한다.
- [X] T006 `quickstart.md`에 local profile 실행과 `/api/layouts/me` 검증 절차를 기록한다.

## Phase 2: Backend 구현

- [X] T007 `backend/src/main/java/com/vision/dto/LayoutDto.java`가 `PERSONAL_DATA`의 `{version, theme, layout}` JSON을 읽고 쓰도록 구현한다.
- [X] T008 `backend/src/main/java/com/vision/repository/LayoutRepository.java`에 `userId + tabName` 기준 조회/중복 정리 메서드를 추가한다.
- [X] T009 `backend/src/main/java/com/vision/service/LayoutService.java`가 `PERSONAL_NAME='dashboard'` row를 upsert하도록 구현한다.
- [X] T010 `LayoutService`에서 요청 `userId`를 무시하고 actor user id를 강제한다.
- [X] T011 `LayoutService`에서 `theme.mode` 허용값을 검증한다.

## Phase 3: Frontend 구현

- [X] T012 `frontend/src/types/layout.ts`에 `version`, `theme.mode` 타입을 추가한다.
- [X] T013 `frontend/src/services/layoutService.ts`의 기본 layout에 기본 테마를 포함한다.
- [X] T014 `frontend/src/store/slices/layoutSlice.ts`에서 `fetchMyLayout` 복원 시 저장된 테마를 UI slice에 적용한다.
- [X] T015 `saveMyLayout` thunk가 현재 UI 테마를 layout snapshot에 포함해 저장하도록 구현한다.
- [X] T016 `saveThemePreference` thunk를 추가해 테마 변경 즉시 개인화를 저장한다.
- [X] T017 `frontend/src/components/Layout/Header.tsx`에서 테마 선택 시 `saveThemePreference`를 호출한다.

## Phase 4: 테스트

- [X] T018 `backend/src/test/java/com/vision/service/LayoutServiceTest.java`에 JSON 개인화 저장/복원과 theme 검증 테스트를 반영한다.
- [X] T019 `backend/src/test/java/com/vision/controller/LayoutControllerTest.java`에 `theme.mode` 응답 검증을 반영한다.
- [X] T020 frontend layout slice/service/hook 관련 테스트를 실행한다.

## Phase 5: 검증 및 재기동

- [X] T021 `cd backend; mvn test "-Dtest=LayoutServiceTest,LayoutControllerTest"`를 통과시킨다.
- [X] T022 `cd frontend; npm test -- --run src/store/slices/__tests__/layoutSlice.test.ts src/hooks/__tests__/usePersistLayout.test.tsx src/services/__tests__/layoutService.test.ts`를 통과시킨다.
- [X] T023 `cd frontend; npm run build`를 통과시킨다.
- [X] T024 backend/frontend를 재기동하고 `/api/layouts/me`, frontend URL, swagger URL을 확인한다.
- [X] T025 `cd frontend; npm test -- --run` 전체 테스트를 통과시킨다.

## 후속 범위

- [ ] JWT 또는 session 기반 현재 사용자 검증으로 `X-Actor-Username` 개발 헤더를 대체한다.
- [ ] `PERSONAL_DATA` payload 크기 제한과 JSON schema version migration 정책을 추가한다.
- [ ] 관리자용 개인화 초기화/감사 로그 기능은 별도 feature로 분리한다.
