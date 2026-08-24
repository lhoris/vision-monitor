# 리서치: 라이브 대시보드 개인화

## 결정 1: 전체 layout snapshot 저장

**Decision**: 카메라 추가/삭제/이동, Rename, 탭 변경, 그리드 변경마다 개별 endpoint를 만들지 않고 현재 사용자의 전체 layout snapshot을 저장한다.

**Rationale**: 라이브 대시보드 layout은 탭, 세부탭, 활성 탭, 그리드 설정, 카메라 위치가 하나의 사용자 화면 상태로 함께 의미를 가진다. 전체 snapshot 저장은 frontend의 기존 `Layout` 구조와 잘 맞고, 저장/복원 테스트가 단순하다. 세부 mutation API보다 backend 도메인 규칙이 적고 MVP 구현 속도도 빠르다.

**Alternatives considered**:

- 세부 mutation API: `addCamera`, `removeCamera`, `moveCamera`, `renameCamera` 등을 각각 제공할 수 있지만 endpoint와 충돌 처리 규칙이 늘어난다.
- frontend localStorage only: 빠르지만 실제 계정별 복원과 브라우저/기기 간 일관성을 제공하지 못한다.

## 결정 2: `/api/layouts/me` 계약 우선

**Decision**: 신규 개인화 흐름은 `GET /api/layouts/me`, `PUT /api/layouts/me`를 사용한다.

**Rationale**: 사용자가 직접 userId를 지정하지 않게 해야 사용자별 격리와 소유권 검증이 명확하다. 현재 개발 인증 경계는 `X-Actor-Username`을 사용하므로 backend가 이 값을 기준으로 현재 사용자를 확인하고 layout owner를 결정한다.

**Alternatives considered**:

- `GET /api/layouts/{userId}` 유지: 기존 코드와 맞지만 frontend가 사용자 id를 지정하므로 권한 실수 가능성이 있다.
- login response user id를 route param으로 사용: frontend 상태와 URL 조합이 늘어나고 `/me`보다 보안 경계가 약하다.

## 결정 3: optimistic UI + autosave

**Decision**: 사용자 조작은 Redux state에 즉시 반영하고, 변경 확정 시 autosave hook이 debounce 후 저장한다.

**Rationale**: 라이브 대시보드는 조작 반응성이 중요하다. 저장 API가 느리거나 실패해도 화면 조작이 막히면 감시 업무에 방해가 된다. autosave hook으로 저장 중/성공/실패 상태, 중복 저장 방지, pending save 취소를 한 곳에서 관리한다.

**Alternatives considered**:

- 저장 성공 후에만 화면 반영: 네트워크 지연이 곧 UI 지연으로 보인다.
- 각 컴포넌트에서 직접 저장 호출: 실패 처리와 debounce가 분산된다.
- 수동 저장 버튼만 제공: 사용자가 저장을 잊으면 개인화 가치가 떨어진다.

## 결정 4: 기존 `layouts` 테이블 재사용

**Decision**: 기존 `layouts` 테이블과 `Layout` entity를 우선 재사용하되, 사용자별 단일 layout 보장을 위한 제약 보강은 migration에서 검토한다.

**Rationale**: 이미 `layouts` 테이블, repository, DTO, controller/service 뼈대가 있다. 새 테이블을 만드는 것보다 현재 구조를 완성하는 편이 기존 코드와 문서에 맞다.

**Alternatives considered**:

- 신규 `user_dashboard_layouts` 테이블: 의미는 명확하지만 기존 `layouts` 계층과 중복된다.
- `users` 테이블에 JSON 컬럼 추가: 사용자 계정 정보와 대시보드 화면 상태가 강하게 결합된다.

## 결정 5: layout normalize 단계 포함

**Decision**: 저장된 layout을 화면에 반영하기 전 frontend 또는 backend에서 활성 탭 유효성, 빈 탭, 범위 밖 위치, 중복 항목을 정리한다.

**Rationale**: 과거 저장 데이터나 직접 수정된 DB 데이터가 화면 전체를 깨면 안 된다. 가능한 정상 부분을 복원하고 문제가 있는 항목만 정리하거나 안내해야 한다.

**Alternatives considered**:

- 저장 데이터가 항상 정상이라고 가정: 장애나 schema 변경에 취약하다.
- 문제가 있으면 전체 기본 layout으로 대체: 사용자의 정상 설정까지 잃게 된다.
