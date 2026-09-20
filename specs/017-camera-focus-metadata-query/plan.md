# 구현 계획: 화면 확대 보기 메타데이터 Query 구성

## 요약

화면 확대 보기 메타데이터를 영상 소스별 프로파일과 섹션으로 관리하고, Query 정의와 조회 전용 실행 계약을 추가한다. 기존 Mock-First UI는 유지하되 backend API가 가능하면 사용하고, API 실패 시 기존 Mock fallback을 유지한다.

## 기술 컨텍스트

- Backend: Spring Boot, Spring Data JPA, MariaDB, Flyway
- Frontend: React, TypeScript, 기존 metadata renderer/polling hook
- 인증: Bearer 세션과 기존 tester mock 호환
- 저장: `TB_M26_*` 테이블, 논리 참조, 물리 FK 제약 없음
- 삭제: `DATA_END_STATUS` 기반 논리 삭제
- Query 결과 매핑: 구조화된 JSON 설정과 필드 매핑 테이블 병행

## 설계 결정

1. Query 정의·프로파일·섹션·필드 매핑을 별도 관리한다.
2. 관계는 논리 참조만 사용하고 DB FK는 생성하지 않는다.
3. Audit 컬럼은 기존 프로젝트의 생성·수정·종료 Audit 세트를 그대로 사용한다.
4. SQL 실행은 조회 전용이며 허용 파라미터를 바인딩한다.
5. 기존 frontend Mock adapter를 backend fallback으로 유지한다.
6. Query 오류는 섹션 단위로 격리한다.

## 구현 단계

### Phase 1: 데이터 기반

- Flyway로 4개 메타데이터 테이블 생성
- 논리 참조 인덱스와 기본 Query fixture 등록
- Entity, Repository, DTO 추가
- Flyway 테스트와 Repository 테스트 작성

### Phase 2: Backend 계약

- Query 목록·등록·수정·비활성화 서비스
- 프로파일·섹션·필드 매핑 조회와 저장
- Query 실행 서비스와 조회 전용 검증
- `/api/metadata/queries`, `/api/metadata/profiles` 계약 제공
- 세션·관리 권한 검증 적용

### Phase 3: Frontend 연결

- metadata configuration/query service에서 backend 우선 호출
- 실패·미구현·Mock 계정에서는 기존 fixture fallback
- 저장·초기화·Query 실행 응답을 기존 renderer와 polling hook에 연결
- 타입 변환과 오류 상태 검증

### Phase 4: 검증

- Query 보안, 논리 참조, Audit, 오류 격리 테스트
- frontend 전체 테스트와 build
- backend 전체 테스트
- quickstart 시나리오 검증

## 보안 및 운영 고려사항

- SQL에 DML/DDL 키워드, 다중 문장, 주석 우회 패턴이 있으면 거부한다.
- Query 파라미터는 허용 목록에 포함된 이름만 바인딩한다.
- 관리자만 Query SQL과 프로파일 구성을 변경할 수 있다.
- 조회 timeout과 결과 row 제한을 적용한다.
- 모든 삭제는 논리 삭제로 남겨 Audit 추적이 가능해야 한다.

## Constitution Check

- Mock-First MVP: PASS. 기존 Mock fallback을 보존한다.
- 기존 구조 존중: PASS. 기존 service/renderer 계약을 확장한다.
- 계약 우선: PASS. DTO와 API 계약을 먼저 고정한다.
- 테스트 가능성: PASS. DB, service, renderer, polling을 각각 검증한다.
- 물리 FK 금지: PASS. 모든 관계는 논리 참조로만 설계한다.

## 완료 기준

- 설계 문서와 구현이 4개 테이블 모델과 일치한다.
- 물리 FK 제약조건이 migration에 존재하지 않는다.
- 기존 Mock 화면이 backend 부재 상황에서도 동작한다.
- Query 오류가 다른 섹션과 화면 전체를 중단시키지 않는다.
