# 계약: 라이브 메인 화면 Layout

## 목적

라이브 메인 화면이 공정탭, 세부공정탭, 그리드 설정, 카메라 배치를 표현하기 위해 사용하는 layout shape를 정의한다. MVP에서는 frontend mock/fallback으로 사용하며, 후속 backend 연동 시 이 shape를 기준으로 교체한다.

## Layout 조회

```http
GET /api/layouts/{userId}
```

### 성공 응답

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "tabs": [
      {
        "id": "tab-1",
        "name": "Production Line A",
        "activeSubTab": "subtab-1",
        "subTabs": [
          {
            "id": "subtab-1",
            "name": "Equipment 1",
            "gridConfig": {
              "rows": 3,
              "cols": 3,
              "layout": "grid",
              "gapSize": 8
            },
            "cameraPositions": [
              {
                "cameraId": 1,
                "row": 0,
                "col": 0,
                "rowSpan": 1,
                "colSpan": 1
              }
            ],
            "createdAt": "2026-08-16T00:00:00.000Z",
            "updatedAt": "2026-08-16T00:00:00.000Z"
          }
        ],
        "createdAt": "2026-08-16T00:00:00.000Z",
        "updatedAt": "2026-08-16T00:00:00.000Z"
      }
    ],
    "activeTab": "tab-1",
    "createdAt": "2026-08-16T00:00:00.000Z",
    "updatedAt": "2026-08-16T00:00:00.000Z"
  },
  "timestamp": "2026-08-16T00:00:00.000Z"
}
```

## MVP fallback

- API 호출 실패 시 frontend는 development default layout을 사용할 수 있다.
- fallback 사용은 사용자 조작을 막지 않아야 한다.
- 실제 backend 구현 전까지 layout 저장 실패는 화면 조작 자체를 중단시키지 않는다.

