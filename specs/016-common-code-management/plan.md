# 구현 계획

## 결정사항

### 1. 데이터 모델

기존 `TB_M26_CODE`와 `TB_M26_CODE_DETAIL`을 사용한다. 마스터와 상세의 연결은 `CODE_DETAIL.CODE_ID`와 `CODE.CODE_ID`의 값 관계로만 표현하고, DB FK는 만들지 않는다. 삭제는 `DATA_END_STATUS='Y'`로 처리한다.

중복 코드 식별자와 상세값은 데이터베이스 제약조건이 아니라 서비스 계층에서 대소문자·공백을 정규화한 뒤 검사한다. 기존 테이블의 컬럼과 M26 공통 감사컬럼은 유지한다.

### 2. 관리자 화면

사용자관리 화면의 그리드 패턴을 따른다.

- 상단: 검색, 필터, 추가, 수정, 비활성화, 새로고침
- 본문 좌측: 공통코드 마스터 그리드
- 본문 우측 또는 하단: 선택된 마스터의 상세 코드값 그리드
- 마스터 추가/수정과 상세 추가/수정은 모달로 처리
- 상세 그리드는 선택된 마스터가 없을 때 비활성 상태
- 목록에는 비활성 상태를 기본적으로 숨기고 필요 시 관리자 필터로 조회

### 3. 조회 및 메모리 캐시

로그인 성공 후 `commonCodeSlice`의 bootstrap thunk를 실행한다. 응답은 `Record<string, CommonCodeGroup>` 형태로 정규화해 Redux 메모리에 저장한다.

화면은 `useCommonCode(codeName)` 훅을 통해 캐시를 사용한다. 코드 그룹이 없으면 해당 그룹만 요청하고, 이미 로딩 중이면 중복 요청을 합친다. 캐시는 localStorage/sessionStorage에 저장하지 않는다. 로그아웃 시 `clearCommonCodes`를 실행한다.

관리 API 저장 성공 후에는 관리자 화면에서 bootstrap을 재조회해 현재 세션의 메모리 값을 갱신한다. 여러 브라우저 세션의 즉시 무효화는 이번 범위가 아니며 다음 로그인 또는 새로고침 시 반영된다.

### 4. API 계약

관리자 API는 `/api/admin/common-codes` 아래에 둔다.

- `GET /api/admin/common-codes`
- `POST /api/admin/common-codes`
- `PUT /api/admin/common-codes/{codeId}`
- `POST /api/admin/common-codes/{codeId}/deactivate`
- `GET /api/admin/common-codes/{codeId}/details`
- `POST /api/admin/common-codes/{codeId}/details`
- `PUT /api/admin/common-codes/{codeId}/details/{detailId}`
- `POST /api/admin/common-codes/{codeId}/details/{detailId}/deactivate`

일반 조회 API는 `/api/common-codes` 아래에 둔다.

- `GET /api/common-codes/bootstrap`
- `GET /api/common-codes/{codeName}`
- `GET /api/common-codes?names=...`

### 5. 검증

백엔드 서비스 테스트에서 중복, 누락, 비활성화, 정렬순서를 검증한다. 프론트엔드 테스트에서 로그인 후 bootstrap thunk, 메모리 조회, 중복 요청 방지, 로그아웃 초기화를 검증한다. 관리자 화면은 마스터·상세 선택 연동과 모달 저장 흐름을 컴포넌트 테스트한다.

## 파일 구조

- `backend/src/main/java/com/vision/entity/Code.java`
- `backend/src/main/java/com/vision/entity/CodeDetail.java`
- `backend/src/main/java/com/vision/repository/CodeRepository.java`
- `backend/src/main/java/com/vision/repository/CodeDetailRepository.java`
- `backend/src/main/java/com/vision/service/CommonCodeService.java`
- `backend/src/main/java/com/vision/controller/CommonCodeController.java`
- `backend/src/main/java/com/vision/controller/CommonCodeAdminController.java`
- `frontend/src/store/slices/commonCodeSlice.ts`
- `frontend/src/services/commonCodeService.ts`
- `frontend/src/hooks/useCommonCode.ts`
- `frontend/src/pages/CommonCodeManagement.tsx`
