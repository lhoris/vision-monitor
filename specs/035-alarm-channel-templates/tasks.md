# 작업 목록: 알람 채널별 메시지 템플릿 관리

## Phase 1: 기반

- [x] T001 [P] `backend/src/main/resources/db/migration/V046__add_alarm_channel_templates.sql`에 알람 기준·로그 템플릿 컬럼 migration 추가
- [x] T002 [P] `specs/035-alarm-channel-templates/contracts/alarm-template-contract.md`의 템플릿 계약 검토
- [x] T003 템플릿 변수와 fallback 규칙을 공통 서비스 계약으로 확정: `backend/src/main/java/com/vision/service/AlarmTemplateRenderer.java`

## Phase 2: 알람 기준 관리 (US1)

- [x] T004 `backend/src/main/java/com/vision/entity/AlarmRule.java`에 채널별 템플릿 필드 추가
- [x] T005 `backend/src/main/java/com/vision/dto/AlarmManagementDto.java`에 템플릿 필드 추가
- [x] T006 `backend/src/main/java/com/vision/service/AlarmManagementService.java`에서 템플릿 생성·수정·조회 연결
- [x] T007 `backend/src/main/java/com/vision/controller/AlarmManagementController.java`에서 기존 DTO 계약 확장 검증
- [x] T008 `frontend/src/services/alarmManagementService.ts`에 템플릿 타입과 저장 필드 연결
- [x] T009 `frontend/src/pages/AlarmManagement.tsx`에 채널별 템플릿 편집 UI와 변수 안내 추가
- [x] T010 [P] `frontend/src/locales/ko.json`, `frontend/src/locales/en.json`에 템플릿 UI 문구 추가

## Phase 3: 발생 알람 치환 (US2)

- [x] T011 `backend/src/main/java/com/vision/entity/AlarmRequest.java`의 context JSON 저장 지원
- [x] T012 `backend/src/main/java/com/vision/entity/AlarmLog.java`에 이메일·팀즈 결과 필드 추가
- [x] T013 `backend/src/main/java/com/vision/service/AlarmIngressService.java`에서 metadata를 JSON으로 저장
- [x] T014 `backend/src/main/java/com/vision/service/AlarmRequestFanoutWorker.java`에서 기준 템플릿을 수신자별로 렌더링해 로그 저장
- [x] T015 `backend/src/main/java/com/vision/dto/AlarmLogDto.java`에 채널별 결과 필드 연결
- [x] T015a `backend/src/main/resources/db/migration/V047__remove_alarm_source_columns.sql`에서 요청·로그의 원천 유형/ID 컬럼 제거

## Phase 4: fallback 및 검증 (US3)

- [x] T016 [P] `backend/src/test/java/com/vision/service/AlarmTemplateRendererTest.java`에 변수·누락값·fallback 테스트 추가
- [x] T017 [P] `backend/src/test/java/com/vision/service/AlarmRequestFanoutWorkerTest.java`에 템플릿 결과 저장 테스트 추가
- [x] T018 `backend/src/test/java/com/vision/controller/AlarmManagementControllerTest.java`에 템플릿 CRUD 계약 테스트 추가
- [x] T019 `specs/035-alarm-channel-templates/quickstart.md` 기준으로 backend 테스트와 frontend build 실행

## 의존성

Phase 1 → Phase 2 → Phase 3 → Phase 4. T001~T003 완료 후 US1과 렌더러 작업을 병행할 수 있다.
