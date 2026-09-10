# Research: 라이브 대시보드 통합 개인화

## 결정 1: `TB_M26_USER_PERSONAL` 사용

**Decision**: 테마와 그리드 레이아웃은 신규 layout 테이블이 아니라 `TB_M26_USER_PERSONAL`의 `PERSONAL_DATA` JSON에 저장한다.

**Rationale**: 사용자별 개인화 데이터는 테마, 그리드 레이아웃, 직접 입력 영상 주소 snapshot처럼 화면 상태 성격이 강하다. 별도 테이블을 늘리면 현재 Flyway 단순화 방향과 맞지 않고, 사용자 개인화 종류가 늘 때마다 스키마 변경이 반복된다.

**Alternatives considered**:

- layout 전용 테이블 생성: 구조는 명확하지만 현재 개인화 테이블과 중복된다.
- frontend localStorage만 사용: 빠르지만 계정/브라우저 간 복원이 되지 않는다.

## 결정 2: `/api/layouts/me` 유지

**Decision**: 기존 화면 계약인 `GET /api/layouts/me`, `PUT /api/layouts/me`를 유지하고 payload만 확장한다.

**Rationale**: frontend 변경 범위를 줄이고, backend가 현재 actor 기준으로 owner를 강제할 수 있다.

**Alternatives considered**:

- `/api/personalization/me` 신규 endpoint: 의미는 더 넓지만 기존 layout 화면 연결을 다시 해야 한다.
- `/api/layouts/{userId}` 사용: frontend가 사용자 id를 직접 지정하므로 소유권 실수 위험이 커진다.

## 결정 3: Flat DTO, Nested DB JSON

**Decision**: API DTO는 기존 `Layout` 타입에 `version`, `theme`만 추가한 flat shape를 유지하고, DB 내부에서만 `{version, theme, layout}` 구조로 감싼다.

**Rationale**: 기존 frontend 그리드 컴포넌트는 `layout.tabs`, `layout.activeTab`을 직접 사용한다. API까지 nested 구조로 바꾸면 변경 범위가 커진다.

**Alternatives considered**:

- API도 nested personalization DTO로 전환: 장기적으로는 명확하지만 이번 변경의 회귀 범위가 커진다.

## 결정 4: 즉시 저장과 Debounce 저장 병행

**Decision**: 테마 변경은 즉시 저장하고, 레이아웃 변경은 기존 debounce autosave를 유지한다. 두 저장 모두 현재 테마와 레이아웃 snapshot 전체를 저장한다.

**Rationale**: 테마는 변경 즉시 로그인 복원 대상이어야 하고, 레이아웃 조작은 연속 변경이 많으므로 debounce가 필요하다.
