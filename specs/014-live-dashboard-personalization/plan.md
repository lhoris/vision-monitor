# 구현 계획: 라이브 대시보드 개인화

**브랜치**: `014-live-dashboard-personalization` | **일자**: 2026-08-25 | **명세**: [spec.md](./spec.md)

**입력**: `/specs/014-live-dashboard-personalization/spec.md`의 기능 명세

**변경 추적**: 문서 변경 이력은 Git 커밋 이력을 기준으로 한다.

> 이 문서는 한국어로 작성한다. 기술 용어, 파일 경로, 코드 식별자, 명령어는 원문 또는 영문 표기를 유지할 수 있다.
> 구현 계획은 "어떻게 구현할 것인가"를 정의한다. 기능 경계는 spec.md를 기준으로 하며, plan.md에서 새 기능 요구사항을 추가하지 않는다.

## 1. 계획 요약

라이브 대시보드 개인화는 기존 002 라이브 메인 화면의 layout state를 로그인 사용자별 지속 상태로 저장하고 복원한다. frontend는 사용자의 탭, 세부탭, 그리드, 카메라 배치 변경을 먼저 화면 상태에 즉시 반영하고, 변경 확정 시점에 현재 전체 layout snapshot을 저장한다. backend는 로그인 사용자를 기준으로 단일 개인 layout을 조회하고 upsert하는 `/api/layouts/me` 경계를 제공한다. 기존 `GET /api/layouts/{userId}` 형태는 내부 구현 또는 하위 호환으로 남길 수 있지만, 신규 화면 흐름은 사용자가 임의 userId를 지정하지 않는 `/me` 계약을 우선 사용한다. 저장 실패 시 현재 화면 상태는 유지하고 저장 실패 상태를 표시하며, 다음 저장 시도 또는 수동 재시도로 복구한다.

## 2. 요구사항 추적

| 명세 항목 | 계획 반영 위치 | 비고 |
|-----------|----------------|------|
| FR-001 | 5. 서비스 및 데이터 흐름, 6. 계약 | 현재 사용자 기준 `/me` 저장/조회 |
| FR-002 | 5. 상태 및 상호작용 흐름 | 라이브 진입 시 layout 조회 후 Redux 반영 |
| FR-003 | 5. 상태 및 상호작용 흐름, 6. Fixture/Mock 계획 | 저장 layout 없음 시 기본 layout 제공 |
| FR-004 | 5. 상태 및 상호작용 흐름 | 탭 변경 후 snapshot 저장 |
| FR-005 | 5. 상태 및 상호작용 흐름 | 그리드 설정 변경 후 snapshot 저장 |
| FR-006 | 5. 상태 및 상호작용 흐름 | 카메라 추가/삭제/드롭 완료 후 snapshot 저장 |
| FR-007 | 5. 상태 및 상호작용 흐름 | Rename 저장 버튼 이후 snapshot 저장 |
| FR-008 | 6. 데이터 및 계약 계획 | temporary source 포함 layout 계약 |
| FR-009 | 6. 데이터 및 계약 계획 | user ownership 검증 |
| FR-010 | 7. 테스트 및 검증 계획 | 로그아웃/재로그인 복원 검증 |
| FR-011 | 7. 테스트 및 검증 계획 | 사용자 전환 격리 검증 |
| FR-012 | 5. 상태 및 상호작용 흐름 | 저장/복원 실패 상태 표시 |
| FR-013 | 5. 상태 및 상호작용 흐름 | optimistic UI 유지 |
| FR-014 | 5. 상태 및 상호작용 흐름 | 복원 시 layout normalize |
| FR-015 | 7. 테스트 및 검증 계획 | mock 계정과 admin 계정 모두 검증 |
| UX-001~UX-007 | 5. 화면/컴포넌트 구조, 7. 테스트 및 검증 계획 | 저장 상태 UI와 기존 조작 흐름 유지 |

## 3. 기술 컨텍스트

**언어/버전**: TypeScript 5.x, Java 21

**주요 의존성**: React 19, Redux Toolkit, Vite, Axios, Spring Boot 3.2, Spring Data JPA, MariaDB, Flyway

**저장소/상태 관리**: frontend Redux layout state, browser localStorage 인증 정보, backend MariaDB `layouts` table

**테스트**: Vitest, React Testing Library, Maven/JUnit/Mockito

**대상 플랫폼**: 웹 브라우저 frontend, Spring Boot backend, MariaDB 개발 DB

**프로젝트 유형**: full-stack web app

**성능 목표**: 저장된 layout이 있는 사용자는 라이브 진입 후 3초 이내에 개인 구성을 확인한다. layout 변경 저장은 사용자 조작을 막지 않는다.

**제약사항**: 기존 002 라이브 화면 구조를 유지한다. 영상 ingest, media server, AI inference는 다루지 않는다. 현재 인증 경계는 개발용 token과 `X-Actor-Username` 헤더를 사용한다.

**규모/범위**: 사용자별 기본 라이브 layout 1개, 공정탭/세부공정탭/그리드/카메라 배치/temporary source snapshot 저장

## 4. 구현 범위와 제외 범위

### 구현 범위

- frontend `Live` 진입 시 현재 로그인 사용자 기준 layout 조회
- frontend layout 변경 확정 시 전체 layout snapshot 저장
- 저장 중, 저장됨, 저장 실패 상태를 layout slice 또는 별도 persist state로 관리
- 저장 요청 debounce와 중복 snapshot 저장 방지
- backend `/api/layouts/me` 조회/저장 API
- backend 현재 사용자 식별, layout 소유자 검증, 저장 layout normalize
- 기존 `layouts` 테이블을 활용하되 필요한 제약이나 컬럼 보강 migration 검토
- mock 계정과 실제 `admin` 계정에서 사용자별 저장/복원 검증

### 제외 범위

- 카메라 장비 등록, 장비 상태 수집, 영상 전달 구현
- AI 분석, server-side overlay, 이벤트 생성
- layout 공유, 공동 편집, 관리자 대리 편집
- layout 변경 이력, 버전 복구, 감사 로그
- 권한 정책 신규 정의

## 5. 설계 접근

### 화면/컴포넌트 구조

- `frontend/src/pages/Live.tsx`는 더 이상 고정 userId와 mock layout fulfilled action을 기본 경로로 주입하지 않는다.
- `Live`는 인증 상태의 user id 또는 username을 기준으로 layout 조회를 트리거한다.
- `GridContainer`와 기존 탭/그리드/카메라 조작 컴포넌트는 유지하고, 조작 완료 후 저장 요청을 연결한다.
- 저장 상태 표시는 라이브 화면의 작업 흐름을 방해하지 않는 작은 상태 표시 또는 toast로 제공한다.
- 기존 mock layout은 backend 조회 실패 또는 신규 사용자 기본값 생성용 fallback으로 유지한다.

### 상태 및 상호작용 흐름

1. 사용자가 로그인 후 라이브 대시보드에 진입한다.
2. frontend는 `GET /api/layouts/me`를 호출한다.
3. 응답 layout이 있으면 normalize 후 Redux layout state에 반영한다.
4. 응답 layout이 없거나 복원 실패가 발생하면 기본 layout을 반영하고 fallback/오류 상태를 표시한다.
5. 사용자가 카메라 추가, 삭제, Rename, 탭 변경, 그리드 변경, 드래그 드롭을 수행하면 Redux state를 먼저 갱신한다.
6. 변경이 확정된 시점에 현재 layout snapshot을 저장 큐에 넣는다.
7. 저장 hook은 debounce 후 `PUT /api/layouts/me`를 호출한다.
8. 저장 성공 시 마지막 저장 snapshot과 저장 상태를 갱신한다.
9. 저장 실패 시 화면 state는 유지하고 실패 상태와 재시도 가능 상태를 남긴다.
10. 로그아웃 또는 사용자 전환 시 이전 사용자의 layout state와 pending save를 정리한다.

저장 호출 기준:

- 카메라 추가: 추가 완료 후 저장
- 카메라 삭제: 삭제 확정 후 저장
- 카메라 이동: drag/drop 완료 후 저장
- Rename: 저장 버튼 완료 후 저장
- 그리드 크기 변경: 옵션 선택 완료 후 저장
- 탭/세부탭 추가, 삭제, 이름 변경, 순서 변경: 변경 확정 후 저장
- 활성 탭 변경: 마지막 보던 위치 복원을 위해 저장 대상에 포함하되 debounce 적용

### 서비스 및 데이터 흐름

- frontend는 `layoutService.getMyLayout()`과 `layoutService.saveMyLayout(layout)`을 우선 사용한다.
- 저장 API는 전체 layout snapshot을 받는다. 카메라 추가/삭제/이동별 세부 API는 만들지 않는다.
- backend는 `X-Actor-Username` 기준으로 현재 사용자를 조회하고 해당 user id의 layout만 읽고 쓴다.
- backend는 layout 저장 시 요청 payload의 userId를 신뢰하지 않고 현재 사용자 기준으로 덮어쓴다.
- 기존 `GET /api/layouts/{userId}`, `POST /api/layouts`, `PUT /api/layouts/{id}`는 필요 시 유지하되 신규 화면 흐름에서는 `/me`를 사용한다.

## 6. 데이터 및 계약 계획

### 필요한 데이터

- 현재 사용자: id, username
- layout: id, userId, activeTab, tabs, createdAt, updatedAt
- tab: id, name, activeSubTab, subTabs, createdAt, updatedAt
- subTab: id, name, gridConfig, cameraPositions, createdAt, updatedAt
- gridConfig: rows, cols, layout, gapSize
- cameraPosition: cameraId 또는 temporary source 식별자, row, col, rowSpan, colSpan, optional displayName override, optional source metadata
- 저장 상태: idle, loading, saving, saved, saveFailed, restoreFailed

### 계약

- [contracts/layout-personalization-api-contract.md](./contracts/layout-personalization-api-contract.md)
- `GET /api/layouts/me`: 현재 사용자의 layout 조회
- `PUT /api/layouts/me`: 현재 사용자의 전체 layout snapshot 저장
- 오류 응답: 인증 실패, 사용자 없음, payload 검증 실패, 저장 실패

### Fixture/Mock 계획

- 기존 `createMockLayout()`은 신규 사용자 fallback 기준으로 재사용한다.
- mock 계정은 username별 local fallback key 또는 backend `/me` 경계를 통해 서로 다른 layout을 검증한다.
- 저장 실패 fixture는 화면 state 유지와 오류 표시 검증에 사용한다.

## 7. 테스트 및 검증 계획

- **단위/컴포넌트 테스트**: layout snapshot normalize, 변경 감지, debounce 저장, 저장 실패 상태 유지
- **frontend service 테스트**: `GET /layouts/me`, `PUT /layouts/me` 성공/실패 응답 처리
- **backend service 테스트**: 현재 사용자 기준 조회, 신규 layout 생성/저장, 사용자별 격리, payload userId 무시
- **backend controller 테스트**: `/api/layouts/me` 성공, 미인증/사용자 없음/검증 실패 응답 shape
- **통합 테스트**: `admin`, `tester`, `tester1` 각각 layout 저장 후 계정 전환 시 격리 확인
- **E2E/수동 검증**: 로그인, 라이브 진입, 카메라 추가/삭제/Rename/그리드 변경, 새로고침, 재로그인 복원 확인
- **빌드/정적 검증**: `cd backend; mvn test`, `cd frontend; npm test -- --run`, `cd frontend; npm run build`
- **회귀 확인**: 002 라이브 대시보드의 카메라 추가, 삭제, 이동, Rename, 직접 영상 주소 추가 흐름 유지

## 8. 프로젝트 구조

### 문서 구조(이번 기능)

```text
specs/014-live-dashboard-personalization/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── layout-personalization-api-contract.md
└── tasks.md
```

### 소스 코드 구조

```text
frontend/
└── src/
    ├── pages/Live.tsx
    ├── services/layoutService.ts
    ├── store/slices/layoutSlice.ts
    ├── hooks/useLayout.ts
    ├── hooks/usePersistLayout.ts
    └── components/Grid/

backend/
└── src/main/
    ├── java/com/vision/controller/LayoutController.java
    ├── java/com/vision/service/LayoutService.java
    ├── java/com/vision/dto/LayoutDto.java
    ├── java/com/vision/entity/Layout.java
    ├── java/com/vision/repository/LayoutRepository.java
    └── resources/db/migration/
```

**구조 결정**: 기존 layout slice/service/entity/repository/controller가 존재하므로 새 도메인 계층을 만들지 않고 현재 구조를 완성한다. frontend에는 autosave 책임을 분리하기 위해 hook을 추가한다.

## 9. 헌법 체크

- **한국어 우선 산출물**: 통과. 모든 산출물은 한국어로 작성하고 기술 식별자만 원문을 유지한다.
- **기존 구조 존중**: 통과. 기존 002 layout 구조와 backend Layout 계층을 재사용한다.
- **Mock-First MVP**: 조건부 통과. 002 MVP에서는 backend 저장 제외였지만, 사용자가 로그인 이후 실제 개인화 저장을 명시적으로 후속 범위로 전환했다. 영상/AI/외부 VMS 구현은 여전히 제외한다.
- **계약 우선**: 통과. `/api/layouts/me` 계약을 먼저 문서화한다.
- **테스트 가능한 증분**: 통과. 복원, 저장, 사용자 격리, 실패 복구를 독립 스토리로 검증한다.

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| layout snapshot이 커지거나 변경이 잦음 | 저장 API 호출 증가 | debounce, 중복 snapshot 비교, 드롭/저장 버튼 등 확정 시점 저장 |
| 사용자 전환 시 이전 layout 노출 | 개인정보/운영 화면 혼선 | logout/user change 시 layout state와 pending save 정리 |
| payload userId 조작 | 타 사용자 layout 오염 | backend가 요청 userId를 신뢰하지 않고 현재 사용자 기준 저장 |
| 저장 실패 후 사용자가 변경을 잃었다고 오해 | UX 신뢰 저하 | optimistic UI 유지, 저장 실패 표시, 재시도 경로 제공 |
| 기존 002 mock layout 흐름 회귀 | 라이브 대시보드 사용성 저하 | 기존 GridContainer 테스트와 liveMonitoring fixture 회귀 포함 |

## 11. 복잡도 추적

| 결정 | 필요한 이유 | 더 단순한 대안을 거부한 이유 |
|------|-------------|-------------------------------|
| 전체 layout snapshot 저장 | 탭, 세부탭, 그리드, 카메라 배치, Rename, 임시 영상이 한 화면 상태로 함께 움직임 | 카메라 추가/삭제/이동별 API를 만들면 endpoint 수와 동기화 규칙이 불필요하게 늘어난다 |
| `/api/layouts/me` 사용 | 현재 사용자 기준 소유권을 backend에서 보장해야 함 | `/api/layouts/{userId}`는 frontend가 userId를 지정하므로 타 사용자 접근 실수나 조작 가능성이 커진다 |
| autosave hook 분리 | UI 조작과 저장 상태/재시도/debounce 책임을 분리해야 함 | 각 컴포넌트에서 직접 저장하면 중복 호출과 실패 처리가 흩어진다 |
