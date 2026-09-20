# 작업 목록: 화면 확대 보기 메타데이터 Query 구성

## Phase 1: 설계 및 기반

- [X] T001 [P] `specs/017-camera-focus-metadata-query/data-model.md`에 4개 테이블 컬럼·인덱스·논리 참조 규칙을 확정한다.
- [X] T002 [P] `specs/017-camera-focus-metadata-query/contracts/metadata-query-api-contract.md`에 Query·프로파일 API 계약을 작성한다.
- [X] T003 `backend/src/main/resources/db/migration/V011__create_metadata_query_tables.sql`에 4개 테이블과 Audit 컬럼을 생성하고 물리 FK를 추가하지 않는다.
- [X] T004 `backend/src/main/resources/db/migration/V012__seed_metadata_query_defaults.sql`에 기본 Query와 기본 프로파일/섹션 fixture를 등록한다.

## Phase 2: Backend 모델 및 저장

- [ ] T005 [P] `backend/src/main/java/com/vision/entity/MetadataQuery.java`에 Query 엔티티를 구현한다.
- [ ] T006 [P] `backend/src/main/java/com/vision/entity/VideoMetadataProfile.java`에 프로파일 엔티티를 구현한다.
- [ ] T007 [P] `backend/src/main/java/com/vision/entity/VideoMetadataSection.java`에 섹션 엔티티를 구현한다.
- [ ] T008 [P] `backend/src/main/java/com/vision/entity/MetadataSectionField.java`에 필드 매핑 엔티티를 구현한다.
- [ ] T009 [P] `backend/src/main/java/com/vision/repository/MetadataQueryRepository.java`와 관련 Repository를 추가한다.
- [ ] T010 `backend/src/main/java/com/vision/dto/MetadataQueryDto.java`와 프로파일·섹션·필드 DTO를 추가한다.
- [ ] T011 `backend/src/main/java/com/vision/service/MetadataConfigurationService.java`에 논리 참조 검증·Audit·논리 삭제를 구현한다.
- [ ] T012 `backend/src/test/java/com/vision/service/MetadataConfigurationServiceTest.java`에 프로파일 격리·논리 삭제·중복 활성 프로파일 검증을 추가한다.

## Phase 3: Query 실행 및 API

- [ ] T013 `backend/src/main/java/com/vision/service/MetadataQueryExecutionService.java`에 조회 전용 SQL 검증과 파라미터 바인딩을 구현한다.
- [ ] T014 `backend/src/main/java/com/vision/service/MetadataQueryExecutionService.java`에 timeout·row limit·결과 schema 변환을 구현한다.
- [ ] T015 `backend/src/main/java/com/vision/controller/MetadataQueryController.java`에 Query 관리·실행 endpoint를 추가한다.
- [ ] T016 `backend/src/main/java/com/vision/controller/MetadataProfileController.java`에 프로파일·섹션 저장/조회/복원 endpoint를 추가한다.
- [ ] T017 `backend/src/test/java/com/vision/service/MetadataQueryExecutionServiceTest.java`에 DML/DDL/다중문장 차단과 허용 파라미터 테스트를 추가한다.
- [ ] T018 `backend/src/test/java/com/vision/controller/MetadataQueryControllerTest.java`에 인증·관리 권한·응답 계약 테스트를 추가한다.

## Phase 4: Frontend 계약 연결

- [ ] T019 `frontend/src/types/metadataConfig.ts`에 backend DTO와 화면 모델 간 변환 타입을 보강한다.
- [ ] T020 `frontend/src/services/metadataConfigurationService.ts`에서 backend 우선 조회·저장·초기화와 Mock fallback을 구현한다.
- [X] T021 `frontend/src/services/metadataQueryService.ts`에서 Query 목록·실행 API와 Mock fallback을 구현한다.
- [ ] T022 `frontend/src/services/__tests__/metadataConfigurationService.test.ts`에 API 성공·fallback·source 격리 테스트를 추가한다.
- [ ] T023 `frontend/src/services/__tests__/metadataQueryService.test.ts`에 Query 성공·disabled·실패 fallback 테스트를 추가한다.
- [ ] T024 `frontend/src/components/CameraFocus/Metadata/MetadataSectionRenderer.tsx`에 backend 결과 schema와 매핑 오류 처리를 연결한다.
- [ ] T025 `frontend/src/hooks/__tests__/useMetadataPolling.test.ts`에 5/10초 polling과 오류 격리 테스트를 추가한다.

## Phase 5: 통합 검증

- [ ] T026 `frontend/src/pages/__tests__/CameraFocus.test.tsx`에 backend profile 조회 후 source 변경·녹화 이벤트 callback 통합 테스트를 보강한다.
- [ ] T027 `backend/src/test/java/com/vision/MetadataSchemaIntegrationTest.java`에 Flyway schema와 물리 FK 부재 검증을 추가한다.
- [ ] T028 `specs/017-camera-focus-metadata-query/quickstart.md`에 DB fixture·API·화면 검증 절차를 갱신한다.
- [ ] T029 전체 backend `mvn test`와 frontend `npm test -- --run`, `npm run build`를 실행한다.
- [ ] T030 `git diff --check`와 문서 체크리스트를 확인하고 모든 완료 작업을 `[X]`로 표시한다.

## 의존성

```text
T001/T002 -> T003/T004 -> T005~T012 -> T013~T018 -> T019~T025 -> T026~T030
```

## 병렬 가능 작업

- T001, T002
- T005~T009
- T022, T023, T025

## MVP 범위

T003~T018의 DB·backend Query/프로파일 계약과 T020~T024의 frontend backend 우선 연결을 MVP로 한다. 기존 Mock fallback은 모든 단계에서 유지한다.
