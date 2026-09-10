# 계약: 라이브 대시보드 개인화 API

## 공통

- Base path: `/api/layouts`
- 개발 인증 헤더: `X-Actor-Username`
- backend는 body의 `userId`를 신뢰하지 않고 현재 actor 기준으로 저장한다.
- 저장 대상은 `TB_M26_USER_PERSONAL`의 `PERSONAL_NAME='dashboard'` row다.

## GET /api/layouts/me

현재 사용자의 라이브 대시보드 개인화를 조회한다.

```http
GET /api/layouts/me
X-Actor-Username: admin
```

### 성공

```json
{
  "success": true,
  "data": {
    "id": 10,
    "userId": 1,
    "tabName": "dashboard",
    "version": 1,
    "theme": { "mode": "theme2" },
    "activeTab": "tab-line-a",
    "tabs": [
      {
        "id": "tab-line-a",
        "name": "Production Line A",
        "activeSubTab": "subtab-equipment-1",
        "subTabs": [
          {
            "id": "subtab-equipment-1",
            "name": "Equipment 1",
            "gridConfig": { "rows": 3, "cols": 3, "layout": "grid", "gapSize": 8 },
            "cameraPositions": []
          }
        ]
      }
    ]
  }
}
```

저장된 개인화가 없으면 `data: null`이 반환될 수 있으며, frontend는 기본 layout과 기본 theme를 사용한다.

## PUT /api/layouts/me

현재 사용자의 테마와 전체 layout snapshot을 upsert한다.

```http
PUT /api/layouts/me
Content-Type: application/json
X-Actor-Username: admin
```

```json
{
  "version": 1,
  "theme": { "mode": "theme3" },
  "activeTab": "tab-line-a",
  "tabs": [
    {
      "id": "tab-line-a",
      "name": "Production Line A",
      "activeSubTab": "subtab-equipment-1",
      "subTabs": [
        {
          "id": "subtab-equipment-1",
          "name": "Equipment 1",
          "gridConfig": { "rows": 2, "cols": 2, "layout": "grid", "gapSize": 8 },
          "cameraPositions": [
            { "cameraId": 1, "row": 0, "col": 0, "rowSpan": 1, "colSpan": 1 },
            {
              "temporarySourceId": "tmp-001",
              "row": 0,
              "col": 1,
              "rowSpan": 1,
              "colSpan": 1,
              "displayName": "Inspection HLS",
              "source": {
                "id": "tmp-001",
                "url": "https://example.test/live/inspection.m3u8",
                "protocol": "hls",
                "displayName": "Inspection HLS",
                "playbackStatus": "idle"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### 검증 실패

- `tabs`가 비어 있거나 배열이 아니면 `INVALID_LAYOUT`
- `activeTab`이 비어 있으면 `INVALID_LAYOUT`
- `theme.mode`가 `theme1`, `theme2`, `theme3`가 아니면 `INVALID_LAYOUT`

```json
{
  "success": false,
  "error": "INVALID_LAYOUT",
  "message": "Layout payload is invalid"
}
```

### 인증 실패

```json
{
  "success": false,
  "error": "AUTH_REQUIRED",
  "message": "Authentication is required"
}
```
