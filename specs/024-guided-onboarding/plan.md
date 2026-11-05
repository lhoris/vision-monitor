# 구현 계획: 화면 단계별 온보딩 안내 기능

**브랜치**: `024-guided-onboarding` | **일자**: 2026-11-05 | **명세**: [spec.md](./spec.md)

## 1. 계획 요약

기존 React/Vite frontend에 `driver.js`를 추가하고, 화면별 투어 정의와 공통 실행기를 분리한다. 인증 후 공통 `Header`에는 전 화면에서 접근 가능한 도움말 아이콘을 추가하고, 로그인 화면은 세 가지 로그인 템플릿에 공통으로 표시되는 카드 우측 상단 도움말 버튼을 제공한다. 로그인과 라이브 대시보드는 Driver.js 투어를 실행하고, 그 외 화면은 기존 알림 UI를 통해 비대상 안내 메시지만 표시한다. 온보딩은 도움말 클릭으로만 시작하며 backend, DB, 영상·알람 업무 로직은 변경하지 않는다.

## 2. 요구사항 추적

| 명세 항목 | 계획 반영 위치 | 비고 |
|---|---|---|
| FR-001~FR-003 | 공통 실행기, `Header`, 로그인 템플릿 | 모든 화면 아이콘, 지원 여부 판정, 수동 시작 |
| FR-004 | 로그인 투어 정의 및 `Login.tsx` 대상 표식 | 로그인·회원가입·비밀번호 안내 |
| FR-005 | 라이브 투어 정의 및 `Live.tsx`/그리드 대상 표식 | 핵심 업무 흐름 안내 |
| FR-006~FR-009 | Driver.js 실행기와 단계 설정 | 강조, 이동, 종료, 재실행 |
| FR-010~FR-013 | 공통 도움말 핸들러와 정리 로직 | 미지원 메시지, 다국어, 대상 누락, 라우트 종료 |
| UI/UX 요구사항 | 온보딩 스타일·번역 리소스·접근성 속성 | 반응형, 키보드, 한국어 우선 |

## 3. 기술 컨텍스트

**언어/버전**: TypeScript, React 19, Node.js 24

**주요 의존성**: Vite, React Router, `react-i18next`, `driver.js` 1.x

**저장소/상태 관리**: React hook 및 Driver.js 인스턴스 수명주기; 서버 저장 없음

**테스트**: Vitest, React Testing Library, 기존 frontend build/lint

**대상 플랫폼**: 데스크톱 및 반응형 웹 브라우저

**프로젝트 유형**: frontend 중심 full-stack web app

**성능 목표**: 도움말 클릭 후 즉시 첫 단계 표시; 기존 화면 초기 로딩과 업무 이벤트 흐름에 추가 지연을 만들지 않음

**제약사항**: 기존 레이아웃·라우팅·i18n 구조를 따르고 backend/DB/API를 변경하지 않음

**규모/범위**: 로그인 투어 1개, 라이브 투어 1개, 미지원 화면 안내 1개, 공통 도움말 진입점

## 4. 구현 범위와 제외 범위

### 구현 범위

- `driver.js` 의존성 및 공통 온보딩 실행기
- 로그인 카드 우측 상단 도움말 버튼
- 인증 후 공통 헤더의 도움말 버튼
- 로그인·라이브 투어 단계와 안정적인 대상 요소 표식
- 미지원 화면 안내 메시지, 한국어·영어 번역
- 완료·건너뛰기·라우트 종료 시 안전한 정리

### 제외 범위

- 첫 방문·가입 승인일 기반 자동 실행
- 온보딩 상태의 backend/DB 저장 및 관리자 편집 화면
- 로그인·영상·알람 업무 로직 변경
- 로그인·라이브 외 화면의 단계별 투어

## 5. 설계 접근

### 화면/컴포넌트 구조

- `frontend/src/components/Onboarding/GuidedOnboarding.tsx`: Driver.js 인스턴스 생성·시작·종료와 화면 판정
- `frontend/src/components/Onboarding/tours.ts`: 로그인·라이브 투어 단계 정의
- `frontend/src/components/Onboarding/HelpButton.tsx`: 접근성 속성을 포함한 공통 도움말 버튼
- `frontend/src/components/Layout/Header.tsx`: 인증 후 도움말 버튼 연결
- `frontend/src/pages/Login.tsx` 및 `loginTemplates.css`: 로그인 카드 우측 상단 버튼과 대상 표식 연결
- `frontend/src/pages/Live.tsx` 및 관련 그리드 컴포넌트: 라이브 투어 대상 표식 연결
- `frontend/src/locales/ko.json`, `frontend/src/locales/en.json`: 투어 문구와 미지원 화면 메시지

### 상태 및 상호작용 흐름

1. 도움말 버튼이 현재 경로를 확인한다.
2. `/login`이면 로그인 투어, `/live`이면 라이브 투어를 생성한다.
3. 그 외 경로이면 비차단 안내 메시지를 표시한다.
4. Driver.js는 대상 요소가 실제 DOM에 있을 때만 단계를 표시하고, 종료 시 인스턴스와 이벤트를 정리한다.
5. 언어 변경은 다음 실행 시 최신 번역을 사용한다.

### 서비스 및 데이터 흐름

- backend/API 호출 없이 frontend 내부에서 동작한다.
- 도움말 버튼은 업무 상태를 변경하지 않는다.
- 자동 실행 확장을 위해 투어 ID와 실행 함수의 경계를 분리하지만, 초기에는 수동 클릭만 호출한다.

## 6. 데이터 및 계약 계획

### 필요한 데이터

- 현재 route pathname
- 현재 i18n 언어
- 투어 단계의 번역 키와 대상 selector

### 계약

- 외부 API 계약 없음
- 내부 계약: `startOnboarding(screen: 'login' | 'live'): void`

### Fixture/Mock 계획

- 서버 fixture 불필요
- 테스트에서는 `driver.js` 모듈을 mock해 실행·미지원 메시지·정리 흐름을 검증한다.

## 7. 테스트 및 검증 계획

- **단위/컴포넌트 테스트**: 지원 화면 판정, 미지원 메시지, 도움말 버튼 접근성, 투어 시작/종료 호출
- **통합 테스트**: 로그인 화면과 `Header`에서 도움말 클릭 시 올바른 투어 ID가 선택되는지 검증
- **E2E/수동 검증**: `quickstart.md`의 로그인·라이브·미지원 화면 시나리오 수행
- **빌드/정적 검증**: `npm run lint`, `npm run build`, 관련 Vitest 실행
- **회귀 확인**: 기존 Login, Header, Live 테스트와 영상·알람 동작 확인

## 8. 프로젝트 구조

```text
specs/024-guided-onboarding/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md

frontend/src/
├── components/Onboarding/
├── components/Layout/Header.tsx
├── pages/Login.tsx
├── pages/Live.tsx
├── locales/ko.json
├── locales/en.json
└── styles/global.css
```

**구조 결정**: 공통 실행기와 투어 정의를 `components/Onboarding`에 두고, 기존 화면은 대상 표식과 진입 버튼만 연결한다. 새로운 전역 상태 관리나 backend 계층은 추가하지 않는다.

## 9. 헌법 체크

- **한국어 우선 산출물**: 통과. 문서와 사용자 문구는 한국어를 우선하고 코드 식별자는 원문을 유지한다.
- **기존 구조 존중**: 통과. 기존 `Header`, `Login`, `Live`, i18n 구조에 최소 연결만 추가한다.
- **Mock-First MVP**: 통과. backend/API/DB를 변경하지 않고 frontend 기능으로 구현한다.
- **계약 우선**: 통과. 내부 실행기 계약과 화면별 투어 ID를 계획에 명시한다.
- **테스트 가능한 증분**: 통과. 로그인, 라이브, 미지원 화면을 독립 검증한다.
- **로컬 개발 환경 전체 실행**: 통과. 최종 검증은 `scripts\develop.bat`로 backend/frontend를 함께 실행하고 frontend build/test를 수행한다.

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|---|---|---|
| 로그인 템플릿별 DOM 구조 차이 | 특정 테마에서 단계 대상 누락 | 공통 대상 표식을 각 템플릿에 추가하고 세 테마를 각각 검증 |
| 라이브 대상 요소가 조건부 렌더링됨 | 잘못된 위치 또는 빈 단계 | 단계 시작 전 대상 존재 여부를 확인하고 누락 단계는 안전하게 종료/건너뜀 |
| Driver.js overlay가 기존 팝업과 충돌 | 조작 방해 또는 z-index 문제 | 투어 시작 중 기존 모달을 자동 조작하지 않고, 공통 z-index 규칙과 종료 cleanup을 적용 |
| 다국어 키 누락 | 영어/한국어 화면에 원문 키 노출 | ko/en 키를 함께 추가하고 번역 리소스 테스트 수행 |

## 11. 복잡도 추적

해당 없음. 기존 컴포넌트 경계를 재사용하며 별도 상태관리 계층이나 서버 저장을 도입하지 않는다.
