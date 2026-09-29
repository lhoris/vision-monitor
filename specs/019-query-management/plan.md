# 구현 계획: 쿼리 관리 메뉴

**브랜치**: `019-query-management` | **일자**: 2026-09-30 | **명세**: [spec.md](spec.md)

## 1. 계획 요약

화면 확대 보기 메타데이터 섹션이 사용하는 Query 정의를 관리자가 실제 DB에서 관리할 수 있도록 Query 관리 메뉴를 추가한다. 기존 `TB_M26_METADATA_QUERY`, 조회 전용 SQL 검증, 메타데이터 Query 실행 계약을 재사용하고, 관리용 CRUD API와 관리자 UI를 별도 경계로 제공한다.

관리 API는 인증된 관리자 또는 Query 관리 권한을 확인하고, Query 등록·수정·상태 변경·논리 삭제 시 Audit 정보를 기록한다. 논리 FK는 사용하지 않으며 메타데이터 섹션 참조 여부는 서비스 조회로 검증한다.

## 2. 요구사항 추적

| 명세 | 계획 반영 |
|---|---|
| FR-001~FR-006 | 관리자 라우트, Query 목록·검색·상태 필터, 빈/오류 상태 |
| FR-007~FR-013 | 등록·수정 폼, SQL 편집, Query ID 불변, 변경사항 확인 |
| FR-014~FR-019 | 서버 조회 전용 SQL·Schema·파라미터 검증 및 SQL 접근 제한 |
| FR-020~FR-026 | 활성/비활성, 공통 확인 모달, 참조 보호, 논리 삭제 |
| FR-027~FR-030 | 기존 메타데이터 Query 선택 목록과 캐시 갱신 연계 |
| FR-031~FR-034 | 기존 Audit 구조, 논리 참조, 오류 코드 및 권한 처리 |
| SC-001~SC-006 | backend/frontend 단위·통합 테스트와 quickstart 검증 |

## 3. 기술 맥락

**언어/버전**: Java 21, Spring Boot, TypeScript, React, Vite

**주요 의존성**: Spring JDBC, 기존 `ApiResponse`, 기존 AuthSessionInterceptor, React Router, 기존 공통 UI/확인 모달

**저장소**: MySQL 계열 DB의 기존 `TB_M26_METADATA_QUERY`; 신규 테이블과 물리 FK 없음

**테스트**: JUnit 5/Mockito, Vitest, React Testing Library, 기존 Maven/npm build

**프로젝트 유형**: Spring Boot + React 전체 스택 관리자 기능

**성능 목표**: Query 목록과 저장 결과는 일반 운영 데이터 기준 2초 이내 화면에 반영; SQL 실행 성능은 Query별 제한시간 설정을 따른다.

**제약사항**: 조회 전용 SQL만 허용하고, 일반 사용자에게 SQL 전문을 노출하지 않는다. 기존 메타데이터 조회 API 계약과 Mock-First 화면 구조를 깨지 않는다.

## 4. 구현 범위

### 포함

- backend Query 관리 DTO, 서비스, 컨트롤러, 권한 및 참조 검증
- 기존 Query SQL 검증 로직의 공통화 또는 재사용
- Query 관리 frontend 페이지, 목록 그리드, 등록·수정 모달
- 활성/비활성, 논리 삭제, 공통 확인 모달, 오류/빈 상태
- 관리자 라우트와 사이드바 메뉴, 한국어·영어 문구
- backend/frontend 테스트와 빌드 검증

### 제외

- 신규 Query 테이블 또는 물리 FK Migration
- Query 실행 이력·성능 통계
- Query 관리 화면의 임의 DB 연결 설정
- 메타데이터 섹션 편집 기능 자체의 재구현
- 데이터 변경 SQL 실행

## 5. 설계

### 5.1 Backend

- 기존 `MetadataQueryService`의 조회 전용 SQL 검증을 관리 저장 검증에서도 사용할 수 있도록 분리한다.
- 관리자 CRUD 전용 서비스 메서드는 목록, 상세, 등록, 수정, 활성화, 비활성화, 논리 삭제를 제공한다.
- 요청의 인증 사용자에서 관리자 또는 Query 관리 권한을 확인한다.
- 삭제 전 `TB_M26_VIDEO_METADATA_SECTION`의 미종료 논리 참조를 확인한다.
- 저장·수정·상태 변경·삭제 시 프로젝트 Audit 컬럼을 현재 인증 사용자와 프로그램 ID로 기록한다.
- 기존 `/api/metadata/queries` 목록·실행 API는 화면 확대 보기와의 호환을 위해 유지한다.

### 5.2 Frontend

- 기존 관리자 페이지 라우팅과 표준 그리드 패턴을 사용해 `/admin/query-management` 화면을 추가한다.
- 목록에는 Query ID, 명칭, 설명, 활성 상태, 참조 상태, 수정일시를 표시한다.
- 등록·수정은 공통 모달 또는 기존 관리 화면의 편집 패턴을 사용한다.
- 삭제와 비활성화는 공통 확인 모달을 사용한다.
- SQL 입력, 오류, 저장 중, 빈 목록, 권한 없음 상태를 분리한다.
- 저장 후 Query 목록과 화면 확대 보기 Query 선택 데이터가 갱신되도록 서비스 경계를 연결한다.

### 5.3 보안 및 데이터 흐름

1. 브라우저가 관리자 API를 호출한다.
2. 인증 세션 인터셉터가 세션을 읽기 전용으로 검증한다.
3. 관리 서비스가 사용자 권한과 입력값을 검증한다.
4. Query SQL과 JSON Schema를 저장하거나 상태를 변경한다.
5. 메타데이터 화면은 기존 활성 Query 목록/실행 계약으로 결과를 조회한다.

## 6. 데이터 및 계약 계획

- 테이블 설계는 [data-model.md](data-model.md)를 따른다.
- 관리 API는 [contracts/query-management-api.md](contracts/query-management-api.md)를 따른다.
- 기존 `TB_M26_METADATA_QUERY` Migration은 재사용하며 신규 Migration은 추가하지 않는다.
- 기존 metadata query 응답의 `queryCode`, `queryName`, `resultSchema`, `enabled` 매핑과 호환되도록 한다.

## 7. 테스트 및 검증 계획

- SQL 검증: 허용 SELECT/WITH, 변경 SQL, 다중 문장, 파라미터 누락, 제한시간 범위
- 서비스: Query ID 중복, 참조 중 삭제 방지, 논리 삭제, 상태 변경, Audit
- 컨트롤러: 관리자 성공, 일반 사용자 403, 오류 코드 응답
- frontend: 목록 필터, 등록/수정, 확인 모달, 삭제/비활성화, 로딩/오류 상태
- 통합: 저장한 활성 Query가 메타데이터 선택 목록에 반영되는지 확인
- 실행 절차는 [quickstart.md](quickstart.md)에 기록한다.

## 8. 헌법 준수 점검

- **사용자 가치 우선**: 관리자가 메타데이터 Query를 직접 관리하고 즉시 화면 확대 보기에서 사용할 수 있다.
- **한국어 우선**: 화면 문구와 운영 오류 메시지는 한국어를 기본으로 하며 영어 번역을 함께 추가한다.
- **기존 구조 존중**: 기존 Spring Boot, React, 공통 API 응답, 관리자 라우팅과 표준 그리드를 재사용한다.
- **Mock-First MVP**: 기존 메타데이터 화면의 Mock fallback은 유지하되, 관리 저장 기능은 실제 DB API를 기준으로 한다.
- **계약 우선**: 관리 API와 기존 메타데이터 실행 계약을 문서화하고 분리한다.
- **테스트 가능한 증분**: SQL 검증, 서비스, 컨트롤러, 화면을 독립적으로 검증한다.
- **로컬 전체 실행**: 완료 시 backend와 frontend를 함께 실행해 관리자 메뉴와 메타데이터 연계를 확인한다.

## 9. 위험 및 완화

| 위험 | 영향 | 완화 |
|---|---|---|
| 변경 SQL 우회 저장 | 데이터 손상 | 저장·실행 시 이중 검증과 금지 키워드/다중 문장 차단 |
| 참조 Query 삭제 | 화면 확대 보기 오류 | 섹션 참조 확인 후 삭제 거부, 비활성화는 별도 제공 |
| 일반 사용자 SQL 노출 | 보안 위험 | 관리 응답과 실행 응답을 분리하고 권한별 필드 제한 |
| 기존 Query API 회귀 | 메타데이터 표시 중단 | 기존 endpoint 유지 및 계약 테스트 |
| 동시 수정 | 관리자 입력 유실 | 저장 시 최신 상태 재조회 및 충돌 오류 안내 |
