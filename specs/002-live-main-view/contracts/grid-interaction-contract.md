# 계약: 그리드 상호작용

## 목적

라이브 메인 화면에서 사용자가 수행하는 탭, 세부탭, 그리드, 카메라 타일 조작의 상태 변경 규칙을 정의한다.

## 공정탭

- `setActiveTab(tabId)`: 활성 공정탭을 변경한다.
- `addTab(tab)`: 새 공정탭을 추가한다.
- `removeTab(tabId)`: 공정탭을 제거한다. 마지막 공정탭은 제거하지 않는다.
- `reorderTabs(fromIndex, toIndex)`: 공정탭 순서를 변경한다.

## 세부공정탭

- `setActiveSubTab(tabId, subTabId)`: 특정 공정탭의 활성 세부공정탭을 변경한다.
- `addSubTab(tabId, subTab)`: 세부공정탭을 추가한다.
- `removeSubTab(tabId, subTabId)`: 세부공정탭을 제거한다. 마지막 세부공정탭은 제거하지 않는다.
- `reorderSubTabs(tabId, fromIndex, toIndex)`: 세부공정탭 순서를 변경한다.

## 그리드

- `updateGridConfig(tabId, subTabId, config)`: 특정 세부공정탭의 그리드 행/열/간격을 변경한다.
- `updateCameraPositions(tabId, subTabId, positions)`: 특정 세부공정탭의 카메라 배치를 변경한다.

## 카메라 셀

- 빈 셀 선택 시 카메라 선택 창을 연다.
- 카메라 선택 창은 현재 세부공정탭에 이미 배치된 camera id를 제외한다.
- 카메라를 빈 셀에 추가하면 해당 셀 좌표에 `CameraPosition`을 추가한다.
- 카메라를 빈 셀로 드래그하면 해당 카메라의 row/col을 변경한다.
- 카메라를 점유 셀로 드래그하면 두 카메라의 row/col을 교환한다.
- Remove는 현재 세부공정탭의 `cameraPositions`에서 해당 camera id를 제거한다.
- Rename은 현재 화면 표시명 override에 반영한다.

