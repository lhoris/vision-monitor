# 작업 목록: 화면 단계별 온보딩 안내 기능

## 구현 전략

- MVP는 backend/API 변경 없이 frontend 온보딩 엔진과 두 지원 화면을 먼저 완성한다.
- 공통 도움말 버튼과 실행기를 먼저 만든 뒤 로그인, 라이브, 미지원 화면 순서로 연결한다.
- 각 사용자 스토리는 해당 화면에서 독립적으로 검증할 수 있도록 구성한다.

## 의존성 순서

```text
T001 → T002 → T003 → T004
                       ├→ T005~T008 (US1 로그인)
                       ├→ T009~T011 (US2 라이브)
                       └→ T012~T013 (US3 미지원 화면)
T014~T016 (US4 접근성/다국어/회귀)
```

## Phase 1: 설정

- [X] T001 `frontend/package.json`과 `frontend/package-lock.json`에 `driver.js` 의존성을 추가한다.
- [X] T002 `frontend/src/components/Onboarding/` 디렉터리와 온보딩 모듈의 export 구조를 생성한다.

## Phase 2: 공통 기반

- [X] T003 `frontend/src/components/Onboarding/HelpButton.tsx`에 접근 가능한 `?` 도움말 버튼을 구현한다.
- [X] T004 [P] `frontend/src/components/Onboarding/GuidedOnboarding.tsx`에 route 판정, Driver.js 생성·시작·종료, 미지원 화면 메시지 연결을 구현한다.
- [X] T005 [P] `frontend/src/components/Onboarding/tours.ts`에 로그인·라이브 투어 ID와 번역 키 기반 단계 정의를 구현한다.
- [X] T006 [P] `frontend/src/locales/ko.json`과 `frontend/src/locales/en.json`에 도움말, 투어, 미지원 화면 안내 문구를 추가한다.
- [X] T007 `frontend/src/styles/global.css`에 Driver.js 기본 스타일과 기존 테마를 보완하는 반응형·z-index 스타일을 추가한다.

## Phase 3: 사용자 스토리 1 - 로그인 화면 온보딩 (P1)

**목표**: 사용자가 로그인 카드 우측 상단 도움말 아이콘으로 로그인과 회원가입 흐름을 이해한다.

**독립 검증 기준**: 로그아웃 상태에서 `/login`을 열고 도움말 아이콘을 선택하면 로그인·비밀번호·로그인·회원가입 단계가 표시되며 다음·이전·건너뛰기·완료가 동작한다.

- [X] T008 [US1] `frontend/src/pages/Login.tsx`의 세 로그인 템플릿에 로그인 카드 우측 상단 도움말 버튼과 투어 대상 `data-onboarding` 표식을 연결한다.
- [X] T009 [US1] `frontend/src/pages/loginTemplates.css`에 로그인 카드 도움말 버튼 위치, 포커스, 반응형 스타일을 추가한다.
- [X] T010 [US1] `frontend/src/pages/__tests__/Login.test.tsx`에 도움말 버튼 노출·클릭과 로그인 투어 실행 연결 테스트를 추가한다.

## Phase 4: 사용자 스토리 2 - 라이브 대시보드 온보딩 (P1)

**목표**: 사용자가 라이브 대시보드 도움말로 공정 선택부터 알람 확인까지의 핵심 흐름을 파악한다.

**독립 검증 기준**: 인증된 `/live`에서 헤더 도움말 아이콘을 선택하면 공정·영상·그리드·확대·알람 대상이 순서대로 강조된다.

- [X] T011 [US2] `frontend/src/components/Layout/Header.tsx`에 계정정보 옆 도움말 버튼을 연결하고 현재 경로에 맞는 온보딩 실행 함수를 호출한다.
- [X] T012 [US2] `frontend/src/pages/Live.tsx`와 라이브 그리드·알람 관련 컴포넌트에 투어 대상 `data-onboarding` 표식을 추가한다.
- [X] T013 [US2] `frontend/src/components/Layout/__tests__/Header.accountMenu.test.tsx`와 `frontend/src/pages/__tests__/Live.personalization.test.tsx`에 도움말 버튼 및 라이브 투어 연결 회귀 테스트를 추가한다.

## Phase 5: 사용자 스토리 3 - 미지원 화면 안내 (P2)

**목표**: 모든 화면에서 도움말에 접근할 수 있고, 미지원 화면에서는 업무를 막지 않는 안내만 제공한다.

**독립 검증 기준**: 사용자 관리·설정 등 미지원 화면에서 도움말을 선택하면 온보딩 대신 안내 메시지가 표시되고 현재 화면을 계속 사용할 수 있다.

- [X] T014 [US3] `frontend/src/components/Onboarding/GuidedOnboarding.tsx`에 미지원 route 안내 메시지와 기존 toast/alert 표시 방식을 연결한다.
- [X] T015 [US3] `frontend/src/components/Layout/__tests__/Header.accountMenu.test.tsx`에 미지원 화면 도움말 안내 테스트를 추가한다.

## Phase 6: 사용자 스토리 4 - 다국어·접근성·안전한 종료 (P2)

**목표**: 한국어 우선·영어 지원, 키보드 조작, 화면 이동·로그아웃 시 안전한 종료를 보장한다.

**독립 검증 기준**: 한국어/영어에서 문구가 올바르게 표시되고, 키보드만으로 단계 이동과 종료가 가능하며 화면 이동 후 overlay가 남지 않는다.

- [X] T016 [US4] `frontend/src/components/Onboarding/GuidedOnboarding.tsx`에 언어 변경 시 단계 생성, 대상 누락 처리, route 변경·unmount cleanup을 보강한다.
- [X] T017 [US4] `frontend/src/components/Onboarding/__tests__/GuidedOnboarding.test.tsx`에 지원 화면 판정·미지원 메시지·키보드/종료 cleanup 테스트를 추가한다.

## Phase 7: 마무리 및 검증

- [X] T018 `specs/024-guided-onboarding/quickstart.md`의 수동 검증 절차를 실제 구현된 selector와 동작에 맞게 보완한다.
- [ ] T019 `frontend`에서 `npm run lint`, `npm test -- --run`, `npm run build`를 실행하고 실패 원인을 기능 범위 내에서 수정한다.
- [ ] T020 `scripts\develop.bat`로 backend/frontend를 함께 실행한 뒤 로그인·라이브·미지원 화면 온보딩과 기존 영상·알람 흐름을 회귀 확인한다.

## 병렬 작업 기회

- T004, T005, T006, T007은 T002 이후 서로 다른 파일을 대상으로 병렬 진행할 수 있다.
- US1의 T008~T009와 US2의 T011~T012는 공통 기반 완료 후 병렬 진행할 수 있다.
- 테스트 T010, T013, T015, T017은 각 구현 변경이 끝난 뒤 병렬 작성할 수 있으나 같은 테스트 파일은 순차 편집한다.

## 완료 기준

- 모든 작업이 `[X]`로 완료된다.
- 로그인·라이브 지원 화면에서 도움말 클릭으로 온보딩이 실행된다.
- 미지원 화면에서 안내 메시지만 표시된다.
- 한국어/영어, 키보드, 반응형, cleanup 검증이 통과한다.
- 기존 로그인·영상·알람 동작에 회귀가 없다.
