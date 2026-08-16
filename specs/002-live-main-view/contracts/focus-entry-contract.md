# 계약: 화면 확대 보기 진입

## 목적

002 라이브 메인 화면에서 003 화면 확대 보기로 이동할 때 전달해야 하는 진입 정보를 정의한다.

## Route

```text
/live/cameras/{cameraId}?mode=live&tabId={tabId}&subTabId={subTabId}&cameraIds={csvCameraIds}&cameraNames={jsonEncodedOverrides}
```

## Query

- `mode`: 기본값은 `live`
- `tabId`: 진입 당시 활성 공정탭 id
- `subTabId`: 진입 당시 활성 세부공정탭 id
- `cameraIds`: 진입 당시 활성 세부공정탭에 배치된 카메라 id 목록
- `cameraNames`: 선택 사항. Rename된 카메라 제목 override를 JSON object로 직렬화한 값

## 규칙

- `cameraIds`는 현재 세부공정탭의 카메라 목록만 포함해야 한다.
- 다른 공정탭 또는 다른 세부공정탭의 카메라는 포함하지 않는다.
- `cameraNames`는 현재 세부공정탭의 카메라 중 Rename된 항목만 포함한다.
- 화면 확대 보기 상세 UI와 메타데이터 로딩은 003 기능의 책임이다.

