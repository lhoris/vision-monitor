# 작업 목록: 모델 프로세스 Agent 명령 큐

**입력 명세**: `specs/020-model-management-rework/agent-command-queue-spec.md`

## Phase 1: 기반 설계

- [ ] T001 [P] 명령 상태, 명령 유형, 결과 코드의 공통 상수를 정의한다: `backend/src/main/java/com/vision/model/ModelCommandStatus.java`, `backend/src/main/java/com/vision/model/ModelCommandType.java`
- [ ] T002 [P] Agent의 DB polling, 선점, 완료 보고 규칙을 문서화한다: `specs/020-model-management-rework/agent-command-queue-spec.md`
- [ ] T003 명령 큐의 상태 전이와 timeout 기준을 테스트 시나리오로 정리한다: `specs/020-model-management-rework/quickstart.md`

## Phase 2: DB 명령 큐

- [ ] T004 `TB_M26_MODEL_COMMAND`를 Audit 컬럼 우선, FK 없이 생성하는 Flyway migration을 작성한다: `backend/src/main/resources/db/migration/V0XX__create_model_command.sql`
- [ ] T005 [P] 명령 큐 조회와 상태 갱신을 위한 DTO를 작성한다: `backend/src/main/java/com/vision/dto/ModelCommandDto.java`, `backend/src/main/java/com/vision/dto/ModelCommandResultRequest.java`
- [ ] T006 명령 등록, 대상 VM 조회, 선점, 완료 처리, timeout 처리를 구현한다: `backend/src/main/java/com/vision/service/ModelCommandService.java`
- [ ] T007 명령 테이블의 Audit 값과 논리적 프로세스 참조를 검증하는 Backend 테스트를 작성한다: `backend/src/test/java/com/vision/service/ModelCommandServiceTest.java`

## Phase 3: Backend 제어 요청 전환

- [ ] T008 모델 프로세스 제어 API가 `MODEL_PROCESS`를 직접 수정하지 않고 명령을 등록하도록 변경한다: `backend/src/main/java/com/vision/service/ModelProcessService.java`
- [ ] T009 명령 접수 결과와 명령 식별자를 반환하도록 Controller 응답을 조정한다: `backend/src/main/java/com/vision/controller/ModelProcessController.java`
- [ ] T010 동일 프로세스의 중복 요청, 비활성 프로세스, 허용되지 않은 action을 검증한다: `backend/src/test/java/com/vision/controller/ModelProcessControllerTest.java`, `backend/src/test/java/com/vision/service/ModelProcessServiceTest.java`

## Phase 4: Agent DB polling 및 상태 보고 규칙

- [ ] T011 Agent가 대상 `SERVER_IP`의 `REQUESTED` 명령을 DB에서 조회하고 처리하는 LOOP 규칙을 정의한다: `specs/020-model-management-rework/agent-command-queue-spec.md`
- [ ] T012 Agent가 명령을 `PROCESSING`으로 원자적으로 선점하고 경쟁 시 한 Agent만 실행하도록 정의한다: `specs/020-model-management-rework/agent-command-queue-spec.md`
- [ ] T013 Agent가 배치 실행 결과를 `TB_M26_MODEL_COMMAND`에 직접 기록하는 규칙을 정의한다: `specs/020-model-management-rework/agent-command-queue-spec.md`
- [ ] T014 Agent가 heartbeat와 Python 프로세스 상태를 DB에 직접 갱신하는 규칙을 정의한다: `specs/020-model-management-rework/agent-command-queue-spec.md`
- [ ] T015 [P] DB polling, 선점, 완료, heartbeat, 상태 갱신의 운영 시나리오를 검증한다: `specs/020-model-management-rework/quickstart.md`

## Phase 5: 실제 실행 결과 반영

- [ ] T016 Agent가 Python 프로젝트 경로의 `run.bat`, `stop.bat`, `restart.bat`를 명령 유형별로 실행한다: `specs/020-model-management-rework/agent-command-queue-spec.md`
- [ ] T017 Agent가 배치 파일 존재 여부, 종료 코드, 표준 오류, 실행 timeout을 DB에 저장한다: `specs/020-model-management-rework/agent-command-queue-spec.md`
- [ ] T018 Agent의 주기적 Python 프로세스 상태 점검 결과를 `TB_M26_MODEL_PROCESS`에 직접 반영한다: `specs/020-model-management-rework/agent-command-queue-spec.md`
- [ ] T019 DB 기반 실행 성공과 실제 프로세스 미기동, Agent 중단, timeout 시나리오를 검증한다: `specs/020-model-management-rework/quickstart.md`

## Phase 6: 화면 상태 연동

- [ ] T020 명령 상태와 실제 프로세스 상태를 구분하는 Backend 응답 필드를 추가한다: `backend/src/main/java/com/vision/service/ModelProcessService.java`, `frontend/src/types/modelManagement.ts`
- [ ] T021 제어 다이얼로그와 Honeycomb에서 접수 중, 처리 중, 성공, 실패, timeout을 구분해 표시한다: `frontend/src/components/ModelManagement/ModelProcessControlDialog.tsx`, `frontend/src/components/ModelManagement/ModelProcessHoneycomb.tsx`
- [ ] T022 명령 접수 후 자동 재조회와 Agent 장애 상태 표시를 연결한다: `frontend/src/pages/ModelManagement.tsx`, `frontend/src/services/modelManagementService.ts`
- [ ] T023 명령 상태와 실제 상태가 혼동되지 않는지 Frontend 회귀 테스트를 작성한다: `frontend/src/pages/__tests__/ModelManagement.test.tsx`, `frontend/src/components/ModelManagement/__tests__/ModelVmDashboard.test.tsx`

## Phase 7: 통합 검증

- [ ] T024 Backend 전체 테스트와 migration 검증을 실행한다: `backend/`
- [ ] T025 Frontend 전체 테스트와 production build를 실행한다: `frontend/`
- [ ] T026 폐쇄망 운영 환경을 가정해 polling, Agent 재시작, 중복 선점, timeout, 배치 실패 시나리오를 quickstart 기준으로 확인한다: `specs/020-model-management-rework/quickstart.md`

## 의존성

```text
T001/T002 -> T004/T005 -> T006
T006 -> T008/T009/T010
T006 -> T011/T012/T013/T014/T015
T011/T012/T013/T014 -> T016/T017/T018/T019
T008/T009/T018 -> T020/T021/T022/T023
T019/T023 -> T024/T025/T026
```

## 병렬 작업 기회

- T001, T002, T003은 서로 병렬로 준비할 수 있다.
- T005와 T007은 migration 구조가 확정된 뒤 병렬로 진행할 수 있다.
- T011~T015는 명령 service 계약이 확정된 뒤 병렬 분담할 수 있다.
- T016~T019는 Agent 실행 계층과 상태 보고 계층으로 나누어 진행할 수 있다.
- T021과 T023은 응답 계약 확정 후 병렬로 진행할 수 있다.

## MVP 범위

1차 MVP는 T001~T019까지로 한다. 명령 등록부터 Agent polling, 배치 실행 결과, 실제 프로세스 상태 갱신까지를 검증한다. T020 이후는 운영 화면 표시와 통합 검증 범위다.
