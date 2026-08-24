# 데이터 모델: 라이브 대시보드 개인화

## User

로그인한 사용자. 개인화 layout의 소유자다.

### 주요 속성

- `id`: 사용자 식별자
- `username`: 현재 요청 actor 식별자
- `enabled`, `accountStatus`, `employmentStatus`: 로그인 가능 사용자 여부

### 관계

- User 1명은 기본 라이브 대시보드 layout 1개를 가진다.

## DashboardLayout

사용자별 라이브 대시보드 전체 snapshot.

### 주요 속성

- `id`: layout 식별자
- `userId`: 소유 사용자 식별자
- `activeTab`: 마지막 활성 공정탭
- `tabs`: 공정탭 목록
- `createdAt`: 최초 생성 시각
- `updatedAt`: 마지막 저장 시각

### 검증 규칙

- `userId`는 backend에서 현재 사용자 기준으로 결정한다.
- `tabs`는 최소 1개 이상이어야 한다.
- `activeTab`이 존재하지 않으면 첫 번째 탭을 활성화한다.
- 사용자별 기본 layout은 1개만 유지한다.

## ProcessTab

라이브 대시보드의 상위 공정탭.

### 주요 속성

- `id`: 탭 식별자
- `name`: 화면 표시명
- `activeSubTab`: 마지막 활성 세부공정탭
- `subTabs`: 세부공정탭 목록
- `createdAt`, `updatedAt`: 탭 생성/수정 시각

### 검증 규칙

- `name`은 비어 있으면 기본 표시명으로 보정한다.
- `subTabs`는 최소 1개 이상이어야 한다.
- `activeSubTab`이 존재하지 않으면 첫 번째 세부공정탭을 활성화한다.

## SubProcessTab

공정탭 아래의 세부공정 또는 설비 탭.

### 주요 속성

- `id`: 세부탭 식별자
- `name`: 화면 표시명
- `gridConfig`: 그리드 행/열/간격 설정
- `cameraPositions`: 세부탭 안의 영상 타일 배치 목록
- `createdAt`, `updatedAt`: 세부탭 생성/수정 시각

### 검증 규칙

- `gridConfig.rows`와 `gridConfig.cols`는 지원하는 그리드 옵션 안에 있어야 한다.
- `cameraPositions`의 row/col은 현재 그리드 범위를 벗어나지 않아야 한다.
- 같은 세부탭 안에서 같은 카메라 또는 같은 직접 영상 주소가 중복되면 안 된다.

## GridConfig

세부공정탭의 그리드 설정.

### 주요 속성

- `rows`: 행 수
- `cols`: 열 수
- `layout`: grid/custom/focus 중 현재 화면 layout 종류
- `gapSize`: 셀 간격

### 검증 규칙

- MVP는 기존 라이브 화면이 지원하는 grid option을 기준으로 한다.
- 유효하지 않은 값은 기본 grid option으로 보정한다.

## CameraPosition

그리드 셀에 배치된 카메라 또는 임시 영상 타일.

### 주요 속성

- `cameraId`: 카메라 목록 기반 타일 식별자
- `temporarySourceId`: 직접 영상 주소 기반 타일 식별자
- `row`: 배치 행
- `col`: 배치 열
- `rowSpan`: 행 span
- `colSpan`: 열 span
- `displayName`: 사용자 Rename 표시명
- `source`: 임시 영상 metadata

### 검증 규칙

- 카메라 목록 기반 타일은 `cameraId`를 가진다.
- 직접 영상 주소 기반 타일은 `temporarySourceId`와 `source`를 가진다.
- 한 타일은 카메라 목록 기반 또는 직접 영상 주소 기반 중 하나여야 한다.
- 같은 세부탭에서 같은 위치를 중복 점유하면 안 된다.

## TemporaryVideoSource

카메라 목록에 등록되지 않았지만 사용자가 직접 추가한 영상 주소.

### 주요 속성

- `id`: 임시 영상 식별자
- `type`: WebRTC, RTSP, HLS 중 하나
- `url`: 사용자가 입력한 영상 주소
- `title`: 표시 제목
- `createdAt`, `updatedAt`: 생성/수정 시각

### 검증 규칙

- `type`과 `url` 형식이 일치해야 한다.
- 같은 세부탭 안에서 동일한 `type + url` 조합은 중복될 수 없다.
- 화면 표시 시 민감 정보가 불필요하게 노출되지 않아야 한다.

## LayoutPersistState

frontend가 저장/복원 상태를 표시하기 위해 유지하는 UI 상태.

### 상태

- `idle`: 아직 저장/복원 동작 없음
- `loading`: layout 복원 중
- `saving`: layout 저장 중
- `saved`: 마지막 변경 저장 성공
- `saveFailed`: 저장 실패, 현재 화면 state는 유지
- `restoreFailed`: 복원 실패, fallback layout 사용

## 상태 전이

```text
라이브 진입
  -> loading
  -> saved 또는 restoreFailed

사용자 변경
  -> saving
  -> saved 또는 saveFailed

사용자 전환/로그아웃
  -> pending save 취소
  -> layout state 초기화
```
