# 연구 기록: 영상소스별 Query 기반 메타데이터

## 1. 기존 코드베이스 확인

- 기술 스택은 React 19, TypeScript, Vite, Vitest, React Testing Library, Tailwind CSS다.
- 확대 보기 화면은 `frontend/src/pages/CameraFocus.tsx`와 `frontend/src/components/CameraFocus/FocusMetadataPanel.tsx`가 중심이다.
- 현재 메타데이터 패널은 고정된 3개 섹션과 사용자별 순서 저장을 별도 서비스로 처리한다. 새 기능에서는 이를 profile 기반 렌더링으로 확장하고 기존 순서 저장 로직은 중복되지 않도록 통합한다.
- 프로젝트 헌법은 Mock-First MVP, 계약 우선, 기존 구조 존중, 사용자 스토리별 테스트를 요구한다.

## 2. 결정 사항

### 결정 1: frontend mock service를 MVP 경계로 사용

실제 Spring Boot API, DB migration, SQL 실행은 이번 구현에서 제외한다. Query Registry, Query 실행, layout profile 저장을 frontend mock service와 localStorage로 제공한다. 따라서 실제 화면 흐름은 검증하면서도 backend 구현 시 계약을 유지할 수 있다.

### 결정 2: Query 결과는 schema와 rows로 분리

각 Query는 `resultSchema`로 필드명과 타입을 선언하고, 실행 결과는 schema와 rows를 함께 반환한다. 섹션은 임의의 컬럼을 읽지 않고 schema에 등록된 필드만 mapping하도록 하여 text/grid/chart가 동일한 결과 계약을 사용한다.

### 결정 3: polling은 섹션 단위로 독립 실행

섹션마다 5/10/30/60초 주기를 갖고, 화면이 활성화된 동안에만 polling한다. 요청 중에는 같은 섹션의 다음 요청을 만들지 않으며, 한 섹션의 오류가 다른 섹션의 표시와 polling을 막지 않게 한다.

### 결정 4: 설정 저장 범위는 사용자와 영상소스의 조합

저장 키는 `userId + sourceId` 조합으로 한다. 따라서 한 사용자의 영상소스 A 설정은 같은 사용자의 B와 다른 사용자의 A에 영향을 주지 않는다. 실제 서버 저장으로 전환할 때도 동일한 복합 식별자를 유지한다.

### 결정 5: chart는 renderer 확장 지점으로 제공

MVP의 필수 시각화는 text와 grid다. chart 타입과 mapping 계약은 정의하고 renderer 경계를 마련하되, 고급 차트 기능이나 외부 chart library 도입은 이번 범위에 포함하지 않는다. mock 데이터로 기본적인 시계열 표시만 검증한다.

## 3. 고려했지만 채택하지 않은 대안

- **실제 SQL을 브라우저에서 실행**: 보안과 권한 경계를 침해하므로 제외한다.
- **각 섹션이 자체적으로 Query 응답 형식을 해석**: Query 재사용성과 타입 검증이 약해지므로 공통 schema 계약을 사용한다.
- **전역 layout 1개 공유**: 영상소스별 요구사항과 사용자별 개인 설정을 표현할 수 없어 제외한다.
- **WebSocket/SSE 우선 도입**: 이번 요구사항은 주기 조회이며, backend 실시간 push는 후속 범위다.

## 4. 남은 후속 설계

- 실제 backend의 Query definition 저장 테이블과 read-only SQL 검증 방식
- Query parameter allowlist와 사용자 권한 검증
- profile 저장 API의 optimistic concurrency 및 버전 충돌 처리
- chart renderer의 실제 library 선택과 접근성 기준
