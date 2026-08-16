# 계약: UI Shell State

## 목적

앱 기본 뼈대가 사용하는 공통 UI 상태를 정의한다.

## UIState

```json
{
  "sidebarOpen": false,
  "themeMode": "theme2",
  "notifications": [],
  "modal": {
    "isOpen": false,
    "type": null
  },
  "selectedTab": ""
}
```

## ThemeMode

- `theme1`: 밝은 관제실
- `theme2`: 기본 다크 VMS
- `theme3`: 민트 관제 센터

## 규칙

- `themeMode` 변경 시 document root의 `data-theme`가 같은 값으로 변경되어야 한다.
- `theme2`, `theme3`에서는 document root에 dark class가 적용되어야 한다.
- `theme1`에서는 dark class가 제거되어야 한다.
- `sidebarOpen`은 overlay/sidebar 표시 상태의 단일 source of truth이다.

