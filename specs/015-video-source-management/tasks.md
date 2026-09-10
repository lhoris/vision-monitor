# 작업 목록

## Phase 1: 데이터 및 API

- [X] T001 [P] `backend/src/main/resources/db/migration/V006__create_m26_video_source_table.sql`에 PK 외 제약조건 없는 영상 주소 테이블을 추가한다.
- [X] T002 [P] `backend/src/main/java/com/vision/entity/VideoSource.java`와 `VideoSourceDto.java`를 추가한다.
- [X] T003 `backend/src/main/java/com/vision/repository/VideoSourceRepository.java`와 `VideoSourceService.java`에 CRUD 및 입력 검증을 구현한다.
- [X] T004 `backend/src/main/java/com/vision/controller/VideoSourceController.java`에 목록·등록·수정·삭제 API를 구현한다.

## Phase 2: 관리자 화면

- [X] T005 `frontend/src/components/Layout/Sidebar.tsx`의 카메라 추가 메뉴를 영상 관리 메뉴로 변경한다.
- [X] T006 `frontend/src/services/videoSourceService.ts`와 `frontend/src/types/videoSource.ts`를 추가한다.
- [X] T007 `frontend/src/pages/VideoManagement.tsx`에 사용자관리와 일관된 표·입력·수정·삭제 흐름을 구현한다.
- [X] T008 `frontend/src/pages/AdminPlaceholder.tsx`에서 영상 관리 라우트를 실제 화면에 연결한다.
- [X] T011 `frontend/src/pages/VideoManagement.tsx`에 모달 입력과 사용자관리 수준의 검색·필터·선택·페이지·일괄 작업 그리드를 구현한다.

## Phase 3: 검증

- [X] T009 Flyway 정적 검사로 V006에 PK 외 제약조건이 없는지 확인한다.
- [X] T010 백엔드 테스트와 프론트엔드 테스트·빌드를 실행한다.
