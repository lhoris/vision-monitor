# 데이터 모델: 라이브 메인 화면

## Layout

- `id`: layout 식별자
- `userId`: 사용자 식별자
- `tabs`: 공정탭 목록
- `activeTab`: 현재 활성 공정탭 id
- `createdAt`, `updatedAt`: 생성/수정 시각

**규칙**

- `activeTab`은 `tabs` 안에 존재해야 한다.
- 활성 탭이 삭제되면 남아 있는 첫 번째 탭으로 fallback한다.

## Tab

- `id`: 공정탭 식별자
- `name`: 공정탭 표시명
- `subTabs`: 세부공정탭 목록
- `activeSubTab`: 현재 활성 세부공정탭 id
- `createdAt`, `updatedAt`: 생성/수정 시각

**규칙**

- 마지막 공정탭은 삭제하지 않는다.
- `activeSubTab`은 해당 `subTabs` 안에 존재해야 한다.

## SubTab

- `id`: 세부공정탭 식별자
- `name`: 세부공정탭 표시명
- `gridConfig`: 그리드 설정
- `cameraPositions`: 현재 세부공정탭의 카메라 배치 목록
- `createdAt`, `updatedAt`: 생성/수정 시각

**규칙**

- 마지막 세부공정탭은 삭제하지 않는다.
- 카메라 배치는 같은 세부공정탭 안에서 중복 camera id를 가지지 않는다.

## GridConfig

- `rows`: 행 수
- `cols`: 열 수
- `layout`: layout 유형
- `gapSize`: 셀 간격

**규칙**

- MVP 옵션은 2x3, 3x3, 3x2, 2x4, 4x2, 4x4를 기준으로 한다.
- 그리드 셀 수는 `rows * cols`로 계산한다.

## CameraPosition

- `cameraId`: 카메라 식별자
- `row`: 배치 행
- `col`: 배치 열
- `rowSpan`: 행 병합 크기
- `colSpan`: 열 병합 크기

**규칙**

- MVP에서는 `rowSpan=1`, `colSpan=1`을 기본으로 한다.
- 같은 row/col에 새 카메라를 배치하면 기존 카메라를 대체하거나 drag/drop에서는 위치를 교환한다.

## Camera

- `id`: 카메라 식별자
- `name`: 카메라 표시명
- `location`: 위치
- `zone`: 구역
- `streamUrl`: 영상 재생 URL
- `streamProtocol`: 영상 재생 protocol
- `status`: online/offline/error
- `resolution`, `fps`: 선택 표시 정보

**규칙**

- 타일 header에는 `name`과 상태점만 기본 표시한다.
- `status=online`은 녹색 상태점으로 표시하며, `online` 텍스트를 중복 표시하지 않는다.

## CameraTitleOverride

- `cameraId`: 카메라 식별자
- `title`: 사용자가 Rename한 표시명

**규칙**

- 빈 제목은 저장하지 않는다.
- 화면 확대 보기 진입 시 현재 세부공정탭에 포함된 카메라의 override만 전달한다.

