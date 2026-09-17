# 리서치: 모델 관리

## 결정 1: MVP는 frontend mock service로 구현한다

- **Decision**: 모델 관리 화면은 `frontend/src/services/modelManagementService.ts`의 in-memory mock service를 기준으로 구현한다.
- **Rationale**: 명세가 화면 퍼블리싱과 mock 처리를 우선 범위로 확정했으며, VM Agent, DB 갱신, 실제 프로세스 제어는 후속 범위다.
- **Alternatives considered**:
  - Spring Boot API 선구현: 화면 퍼블리싱 범위를 넘어서므로 제외
  - 정적 fixture만 사용: 설정 수정, 프로세스 조작, 신규 추가 상태 변화를 표현하기 어려워 제외

## 결정 2: 공정 UI는 다중 선택 필터로 구현한다

- **Decision**: `ProcessMultiSelectFilter` 컴포넌트를 만들고 `전공정`은 전체 조회를 의미하는 특별 선택 값으로 처리한다.
- **Rationale**: 사용자가 명시적으로 탭이 아니라고 정정했으며, 여러 공정을 동시에 선택해야 한다.
- **Alternatives considered**:
  - 탭 UI: 복수 공정 선택 요구와 충돌하므로 제외
  - select box: 원문 캡처의 공정 버튼 시각 구조와 거리가 있어 제외

## 결정 3: 모델 목록은 프로젝트 표준 그리드 UX를 따른다

- **Decision**: 사용자 관리 그리드의 헤더, 셀 높이, border, 우클릭 필터, 상태 표시 방식을 참고한다.
- **Rationale**: 사용자가 사용자 관리 화면을 프로젝트 표준 그리드라고 지정했다.
- **Alternatives considered**:
  - 카드형 목록: 운영자가 상태를 비교해야 하므로 부적합
  - 단순 table: 영상 관리에서 이미 표준 그리드와 차이가 있다고 지적되어 제외

## 결정 4: 상태 값은 DB 기준 의미를 보존하되 mock으로 표현한다

- **Decision**: `monitoringStatus`는 Python 프로세스 alive 기준, `controlStatus`는 AI 추론 결과 전달 통신 성공/실패 기준으로 타입화한다.
- **Rationale**: 실제 데이터는 Agent와 제어 연동 호출 결과가 DB에 저장한 상태지만, 화면은 동일 의미의 mock 값을 표시해야 한다.
- **Alternatives considered**:
  - health check API 직접 호출 기준: 사용자가 DB 조회 기준이라고 확정했으므로 제외
  - 단일 process status로 통합: 모니터링 alive와 제어 연동이 다른 의미라 제외

## 결정 5: 이벤트 로그는 팝업 단순 조회로 제한한다

- **Decision**: `ModelEventLogDialog`에서 모델별 mock 로그 목록을 표시하고, 다운로드/확인 처리/통계는 포함하지 않는다.
- **Rationale**: 사용자가 우선 단순 조회와 팝업 형태를 요구했다.
- **Alternatives considered**:
  - 별도 페이지: 현재 화면 맥락 유지 요구와 맞지 않아 제외
  - 로그 관리 고급 기능: MVP 범위를 넘어 제외
