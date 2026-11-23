# 작업 목록: 알람 확인 취소

## Phase 1: 기반

- [X] T001 [P] 기존 알람 로그 엔터티·저장소·확인 처리 흐름을 점검하고 변경 파일을 확정한다: `backend/src/main/java/com/vision/controller/AlarmController.java`
- [X] T002 [P] 알람 화면의 Redux·서비스·상단 벨 상태 흐름을 점검한다: `frontend/src/pages/Events.tsx`

## Phase 2: 백엔드

- [X] T003 현재 사용자 기준 전체 활성 알람 이력 파생 조회를 추가한다: `backend/src/main/java/com/vision/repository/AlarmLogRepository.java`
- [X] T004 전체 알람 이력 조회 API를 추가한다: `backend/src/main/java/com/vision/controller/AlarmController.java`
- [X] T005 단일 및 공동 확인 알람의 확인 취소 API를 구현한다: `backend/src/main/java/com/vision/controller/AlarmController.java`
- [X] T006 확인 취소와 공동 그룹 복원 동작을 검증하는 테스트를 추가한다: `backend/src/test/java/com/vision/controller/AlarmControllerTest.java`

## Phase 3: 프론트엔드

- [X] T007 알람 전체 이력·확인 취소 서비스 호출을 추가한다: `frontend/src/services/alarmService.ts`
- [X] T008 알람 이력 로드와 확인 취소 Redux thunk 및 상태 변경을 추가한다: `frontend/src/store/slices/eventSlice.ts`
- [X] T009 알람 화면에 서버 이력 로드, 확인 취소 확인 창, 성공·실패 토스트를 연결한다: `frontend/src/pages/Events.tsx`
- [X] T010 확인 취소 UI·서비스 동작을 검증하는 테스트를 추가한다: `frontend/src/pages/__tests__/Events.test.tsx`
- [X] T011 확인 취소 관련 한국어·영어 메시지를 추가한다: `frontend/src/locales/ko.json`, `frontend/src/locales/en.json`

## Phase 4: 검증

- [X] T012 백엔드 테스트와 프론트 타입 검사·빌드를 실행하고 결과를 기록한다: `specs/030-alarm-unacknowledge/quickstart.md`

## 의존성

T001~T002 → T003~T006 및 T007~T011 → T012

## MVP 범위

T003~T009와 T011을 우선 구현한다. T010과 T012로 회귀를 검증한다.
