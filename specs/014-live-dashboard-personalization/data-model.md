# 데이터 모델: 라이브 대시보드 통합 개인화

## UserPersonal

물리 테이블은 `TB_M26_USER_PERSONAL` 하나를 사용한다. 이 기능은 사용자별 라이브 대시보드 개인화를 `PERSONAL_NAME='dashboard'` row로 관리한다.

### 주요 컬럼

- `USER_PERSONAL_ID`: 개인화 row 식별자
- `USER_ID`: 소유 사용자 id
- `PERSONAL_NAME`: 개인화 종류. 라이브 대시보드는 `dashboard`
- `PERSONAL_DATA`: 테마와 레이아웃 snapshot JSON
- `SORT_ORDER`: 확장용 정렬값
- `DATA_END_STATUS`: 삭제/종료 상태. 기본값 사용

### PERSONAL_DATA 구조

```json
{
  "version": 1,
  "theme": {
    "mode": "theme2"
  },
  "layout": {
    "activeTab": "tab-default",
    "tabs": []
  }
}
```

## ThemePreference

- `mode`: `theme1`, `theme2`, `theme3`

`theme.mode`가 없으면 `theme2`를 기본값으로 사용한다. 허용 목록 밖의 값은 저장 요청에서 거부한다.

## DashboardLayout

- `activeTab`: 마지막 활성 상위 탭 id
- `tabs`: 상위 탭 배열

저장 요청은 최소 1개의 `tabs` 항목과 비어 있지 않은 `activeTab`을 가져야 한다. 복원 시 `activeTab`이 존재하지 않으면 frontend normalize가 첫 번째 탭으로 보정한다.

## Tab

- `id`
- `name`
- `activeSubTab`
- `subTabs`
- `createdAt`
- `updatedAt`

## SubTab

- `id`
- `name`
- `gridConfig`
- `cameraPositions`
- `createdAt`
- `updatedAt`

## GridConfig

- `rows`
- `cols`
- `layout`: `grid`, `custom`, `focus`
- `gapSize`

## CameraPosition

- `cameraId`: 등록된 카메라 기반 항목
- `temporarySourceId`: 직접 입력 영상 주소 기반 항목
- `row`, `col`, `rowSpan`, `colSpan`
- `displayName`
- `source`: 직접 입력 영상 주소 metadata

카메라 마스터나 영상 주소 전용 테이블은 이 기능에서 만들지 않는다. 직접 입력 영상 주소는 레이아웃 snapshot 안에 포함된다.
