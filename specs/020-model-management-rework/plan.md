# 구현 계획: 모델 관리 대개편

**브랜치**: `020-model-management-rework` | **일자**: 2026-10-09 | **명세**: [spec.md](./spec.md)

**입력**: `specs/020-model-management-rework/spec.md`

## 1. 계획 요약

모델 관리의 기본 진입점을 기존 그리드 중심 화면에서 VM-프로세스 운영 대시보드로 전환합니다. VM 컨테이너 안에 AI 모델 프로세스를 배치하고, VM 상태·프로세스 상태·제어 요청 상태를 분리해 표현합니다. 프로세스 제어는 확인 절차와 비동기 요청 상태를 포함하며, 모델 등록과 설정 변경은 별도 그리드 보기에서 수행합니다. 1차 구현은 기존 frontend 컴포넌트와 service 경계를 활용한 Mock-First 계약 기반으로 진행하고, Agent 실제 연동과 DB 구조 확장은 계약 확정 후 후속 범위로 둡니다.

## 2. 요구사항 추적

| 명세 항목 | 계획 반영 위치 | 비고 |
|---|---|---|
| 핵심 목표 | 5. 설계 접근 | VM과 프로세스를 계층형 대시보드로 표현 |
| US1 | 5. 화면/컴포넌트 구조 | 대시보드 MVP |
| US2 | 5. 상태 및 상호작용 흐름, 6. 계약 | 제어 요청과 결과 상태 분리 |
| US3 | 5. 화면/컴포넌트 구조 | 그리드 관리 보기 |
| US4 | 5. 상태 및 상호작용 흐름 | 공통 검색·필터 상태 |
| 데이터 및 연동 원칙 | 6. 데이터 및 계약 계획 | Mock adapter와 논리 관계 유지 |

## 3. 기술 컨텍스트

**언어/버전**: TypeScript, React, Java/Spring Boot 기존 프로젝트 버전 유지

**주요 의존성**: React, Vite, Redux Toolkit, 기존 UI 컴포넌트 및 테스트 도구

**저장소/상태 관리**: 기존 frontend service와 Redux/React 상태 관리, 1차는 fixture/mock adapter

**테스트**: Vitest, React Testing Library, frontend production build

**대상 플랫폼**: 웹 브라우저, Windows 운영 환경

**프로젝트 유형**: 기존 full-stack web app의 frontend 중심 기능 개편

**성능 목표**: VM과 프로세스 카드가 늘어나도 전체 화면 재렌더링을 최소화하고, 갱신 중 기존 상태를 유지

**제약사항**: Mock-First MVP, Agent 실제 원격 실행과 신규 DB migration은 계약 확정 후속 범위, 물리적 FK 금지

**규모/범위**: VM 다수, VM별 AI Python 프로세스 다수, 대시보드 보기와 그리드 편집 보기

## 4. 구현 범위와 제외 범위

### 구현 범위

- VM-프로세스 계층형 대시보드 화면
- VM 및 프로세스 상태 표시, 로딩·오류·빈 상태
- 프로세스 시작·중지·재시작 요청 UI와 요청 상태 표현
- 모델 설정 관리용 그리드 보기와 신규/수정 흐름
- VM·공정·프로세스 상태 검색 및 필터
- 기존 모델 관리 service 경계를 확장하는 mock/dashboard contract
- 관련 컴포넌트 테스트와 production build 검증

### 제외 범위

- VM Agent 구현 및 실제 heartbeat 수집 endpoint
- 원격 Python 프로세스 실행을 위한 OS 명령 또는 Agent 프로토콜 구현
- 실제 장비 제어 통신 구현
- 요구사항 확정 전의 신규 테이블 및 Flyway migration
- 모델 실행 파일의 배포, 설치, 서버 운영 자동화

## 5. 설계 접근

### 화면/컴포넌트 구조

- `frontend/src/pages/ModelManagement.tsx`를 페이지 조정자 역할로 유지합니다.
- `frontend/src/components/ModelManagement/ModelVmDashboard.tsx`를 VM 그룹 대시보드로 추가합니다.
- `frontend/src/components/ModelManagement/ModelVmCard.tsx`를 VM 그룹 라벨과 프로세스 군집의 구분 영역으로 추가하며, 별도 VM 박스는 사용하지 않습니다.
- `frontend/src/components/ModelManagement/ModelProcessHoneycomb.tsx`를 VM 내부 육각형 셀 배치 컴포넌트로 추가합니다.
- `frontend/src/components/ModelManagement/ModelProcessCell.tsx`를 프로세스 상태와 선택 상호작용 단위로 추가합니다.
- `frontend/src/components/ModelManagement/ModelProcessCard.tsx`를 선택된 프로세스의 상세 정보와 제어 영역으로 활용합니다.
- `frontend/src/components/ModelManagement/ModelProcessDetailPanel.tsx`를 선택 프로세스의 운영 상세 영역으로 추가합니다.
- 기존 `ModelProcessGrid.tsx`와 다이얼로그 컴포넌트는 편집 보기로 재사용·정리합니다.
- 대시보드/관리 그리드 전환은 탭이 아닌 보기 전환 컨트롤로 제공하고, 현재 필터를 유지합니다.

### 상태 및 상호작용 흐름

- 최초 진입은 대시보드 보기이며, 조회 중에는 skeleton 또는 안정적인 loading 상태를 표시합니다.
- VM 상태와 프로세스 상태를 별도 badge로 표시합니다.
- 제어 버튼 선택 시 공통 확인 모달을 거친 뒤 요청 중 상태로 전환합니다.
- 제어 요청 결과는 성공·실패·시간 초과로 구분하고, 실제 프로세스 상태는 다음 조회 결과를 기준으로 갱신합니다.
- 프로세스 셀 선택 시 상세 패널을 열고, 설정·이벤트 로그·위험 제어는 공통 모달을 사용합니다.
- 모달을 닫아도 선택 대상과 필터 상태를 유지합니다.
- 필터 변경은 VM, 공정, 상태를 조합할 수 있으며 결과가 없으면 명확한 empty state를 표시합니다.
- 그리드 저장 중에는 중복 제출을 막고, 실패 시 사용자가 입력 내용을 잃지 않도록 유지합니다.

### 서비스 및 데이터 흐름

- `frontend/src/services/modelManagementService.ts`를 API 경계로 유지합니다.
- `frontend/src/types/modelManagement.ts`에 VM, 프로세스, 제어 요청 상태 타입을 추가합니다.
- `frontend/src/components/ModelManagement/modelManagementUi.ts`에 상태 라벨·색상·아이콘 매핑을 집중시킵니다.
- 초기 fixture는 실제 Agent 연동을 흉내 내되, 실제 API 전환 시 동일한 DTO 형태를 사용할 수 있도록 합니다.
- Honeycomb 렌더링은 CSS 행 배치나 margin 보정이 아니라 SVG `viewBox`와 axial 좌표에서 계산한 중심점을 사용합니다. 정규 육각형 path/polygon을 중심점에 배치하고 화면 크기에 따라 SVG 전체를 비율 축소합니다.

## 6. 데이터 및 계약 계획

### 필요한 데이터

- VM 식별 정보, 주소, 연결 상태, heartbeat 시각
- 프로세스 식별 정보, 모델명, 공정, Python 경로, 실행 상태
- 최근 제어 요청 action, 요청 상태, 결과 메시지
- 검색·필터에 필요한 공정 및 상태 코드

### 계약

- 상세 계약: [model-management-dashboard-contract.md](./contracts/model-management-dashboard-contract.md)
- VM 대시보드 조회와 프로세스 제어 요청은 별도 계약으로 유지합니다.
- 실제 프로세스 완료 여부와 요청 접수 여부를 응답에서 구분합니다.

### Fixture/Mock 계획

- 정상 VM과 다수 프로세스 fixture
- 연결 불가 VM fixture
- 프로세스 상태별 fixture
- 제어 요청 성공·실패·시간 초과 fixture
- 빈 결과와 조회 오류 fixture

## 7. 테스트 및 검증 계획

- **단위/컴포넌트 테스트**: 상태 badge, VM 카드, 프로세스 카드, 필터, 제어 요청 상태 전이
- **서비스 테스트**: dashboard 조회 및 action contract adapter의 성공·오류 처리
- **통합 테스트**: 페이지 진입부터 대시보드 조회, 보기 전환, 설정 저장까지의 상태 연결
- **E2E/수동 검증**: `quickstart.md`의 US1~US4 시나리오
- **빌드/정적 검증**: `npm test -- --run`, `npm run build`
- **회귀 확인**: 관리자 메뉴 진입, 기존 그리드 편집, 공통 확인 모달, 다국어 상태 라벨

## 8. 프로젝트 구조

```text
specs/020-model-management-rework/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/model-management-dashboard-contract.md
└── tasks.md

frontend/src/
├── pages/ModelManagement.tsx
├── components/ModelManagement/
│   ├── ModelVmDashboard.tsx
│   ├── ModelVmCard.tsx
│   ├── ModelProcessHoneycomb.tsx
│   ├── ModelProcessCell.tsx
│   ├── ModelProcessCard.tsx
│   ├── ModelProcessDetailPanel.tsx
│   ├── ModelProcessGrid.tsx
│   └── modelManagementUi.ts
├── services/modelManagementService.ts
└── types/modelManagement.ts
```

**구조 결정**: 기존 Model Management 경계를 유지하면서 대시보드 전용 컴포넌트를 추가합니다. backend와 DB 변경은 Agent 계약 확정 전까지 후속 범위로 분리합니다.

## 9. 헌법 체크

- **한국어 우선 산출물**: 통과. 문서와 사용자 흐름을 한국어로 작성했습니다.
- **기존 구조 존중**: 통과. 기존 페이지, 서비스, 컴포넌트 경계를 재사용합니다.
- **Mock-First MVP**: 통과. 실제 Agent 및 신규 DB 구현을 후속 범위로 분리했습니다.
- **계약 우선**: 통과. 대시보드 조회와 제어 요청 계약을 별도 문서로 정의합니다.
- **테스트 가능한 증분**: 통과. US1 대시보드를 MVP로 독립 검증하고 이후 기능을 추가합니다.
- **로컬 개발 환경 전체 실행**: 통과. 구현 검증 시 `scripts\develop.bat` 또는 backend/frontend 동시 실행 절차를 사용합니다.

## 10. 위험 및 대응

| 위험 | 영향 | 대응 |
|---|---|---|
| Agent 상태 코드와 실제 heartbeat 기준 미정 | 상태 판정이 변경될 수 있음 | UI 표시 모델과 외부 상태 수집 계약을 분리하고 fixture로 검증 |
| VM 수와 프로세스 수 증가 | 카드 렌더링 및 갱신 성능 저하 | VM 단위 데이터 구조와 부분 갱신을 우선 설계 |
| 제어 요청과 실제 프로세스 상태 불일치 | 운영자가 잘못된 상태로 판단할 수 있음 | 요청 상태와 실제 상태를 별도 표시 |
| 기존 그리드 기능 회귀 | 기존 입력·수정 업무 중단 | 보기 전환을 분리하고 기존 그리드 테스트를 회귀 검증 |

## 11. 복잡도 추적

| 결정 | 필요한 이유 | 더 단순한 대안을 거부한 이유 |
|---|---|---|
| VM 카드와 프로세스 카드를 별도 컴포넌트로 분리 | VM 상태와 프로세스 제어의 책임이 다름 | 단일 컴포넌트는 상태·제어·레이아웃 변경이 서로 얽힘 |
| 대시보드와 그리드 보기 분리 | 운영 확인과 입력 편집의 사용 목적이 다름 | 하나의 그리드만으로 계층형 운영 상태를 직관적으로 표현하기 어려움 |
