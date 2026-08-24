# 계약: 라이브 대시보드 개인화 API

## 목적

현재 로그인한 사용자의 라이브 대시보드 layout을 조회하고 저장한다. frontend는 카메라 추가/삭제/이동 같은 세부 동작별 API를 호출하지 않고, 변경 확정 시점마다 전체 layout snapshot을 저장한다.

## 인증/사용자 식별

- 현재 개발 인증 경계에서는 `X-Actor-Username` 헤더를 현재 사용자 식별자로 사용한다.
- backend는 요청 body의 `userId`를 신뢰하지 않고 현재 사용자 기준으로 owner를 결정한다.
- 사용자를 찾을 수 없거나 로그인 가능한 상태가 아니면 인증/접근 실패로 처리한다.

## GET /api/layouts/me

현재 사용자의 개인화 layout을 조회한다.

### 요청

```http
GET /api/layouts/me
X-Actor-Username: admin
```

### 성공 응답: 저장 layout 있음

```json
{
  "success": true,
  "data": {
    "id": 10,
    "userId": 1,
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
                "colSpan": 1,
                "displayName": "Press Inlet"
              }
            ],
            "createdAt": "2026-08-25T00:00:00.000Z",
            "updatedAt": "2026-08-25T00:00:00.000Z"
          }
        ],
        "createdAt": "2026-08-25T00:00:00.000Z",
        "updatedAt": "2026-08-25T00:00:00.000Z"
      }
    ],
    "createdAt": "2026-08-25T00:00:00.000Z",
    "updatedAt": "2026-08-25T00:00:00.000Z"
  },
  "timestamp": "2026-08-25T00:00:00.000Z"
}
```

### 성공 응답: 저장 layout 없음

저장 layout이 없는 사용자는 `data: null` 또는 `data` 생략 응답을 반환할 수 있다. 현재 공통 응답 wrapper는 null field를 생략한다. frontend는 이 경우 기본 layout을 표시하고 이후 변경 시 저장한다.

```json
{
  "success": true,
  "data": null,
  "timestamp": "2026-08-25T00:00:00.000Z"
}
```

## PUT /api/layouts/me

현재 사용자의 전체 layout snapshot을 저장한다. 기존 layout이 있으면 갱신하고 없으면 생성한다.

### 요청

```http
PUT /api/layouts/me
Content-Type: application/json
X-Actor-Username: admin
```

```json
{
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
              "colSpan": 1,
              "displayName": "Press Inlet"
            },
            {
              "temporarySourceId": "tmp-001",
              "row": 0,
              "col": 1,
              "rowSpan": 1,
              "colSpan": 1,
              "displayName": "Inspection HLS",
              "source": {
                "id": "tmp-001",
                "type": "HLS",
                "url": "https://example.test/live/inspection.m3u8",
                "title": "Inspection HLS"
              }
            }
          ],
          "createdAt": "2026-08-25T00:00:00.000Z",
          "updatedAt": "2026-08-25T00:00:00.000Z"
        }
      ],
      "createdAt": "2026-08-25T00:00:00.000Z",
      "updatedAt": "2026-08-25T00:00:00.000Z"
    }
  ]
}
```

### 성공 응답

backend는 저장된 owner 기준 `userId`, `id`, timestamp를 포함한 normalized layout을 반환한다.

```json
{
  "success": true,
  "data": {
    "id": 10,
    "userId": 1,
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
                "colSpan": 1,
                "displayName": "Press Inlet"
              }
            ],
            "createdAt": "2026-08-25T00:00:00.000Z",
            "updatedAt": "2026-08-25T00:00:03.000Z"
          }
        ]
      }
    ],
    "createdAt": "2026-08-25T00:00:00.000Z",
    "updatedAt": "2026-08-25T00:00:03.000Z"
  },
  "timestamp": "2026-08-25T00:00:03.000Z"
}
```

## 오류 응답

### 인증 사용자 없음

```json
{
  "success": false,
  "code": "AUTH_REQUIRED",
  "message": "Authentication is required",
  "timestamp": "2026-08-25T00:00:00.000Z"
}
```

### layout 검증 실패

```json
{
  "success": false,
  "code": "INVALID_LAYOUT",
  "message": "Layout payload is invalid",
  "data": {
    "field": "tabs",
    "reason": "At least one tab is required"
  },
  "timestamp": "2026-08-25T00:00:00.000Z"
}
```

### 저장 실패

```json
{
  "success": false,
  "code": "LAYOUT_SAVE_FAILED",
  "message": "Failed to save dashboard layout",
  "timestamp": "2026-08-25T00:00:00.000Z"
}
```

## 저장 호출 정책

- 카메라 추가/삭제/Rename/그리드 변경/탭 변경은 변경 확정 후 저장한다.
- 드래그 이동은 drop 완료 시 1회 저장한다.
- 활성 탭 변경은 마지막 보던 화면 복원을 위해 저장 대상에 포함한다.
- frontend는 같은 snapshot에 대한 중복 저장을 피한다.
- 저장 실패 시 화면 상태를 rollback하지 않는다.
