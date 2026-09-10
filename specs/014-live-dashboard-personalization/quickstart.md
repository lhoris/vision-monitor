# Quickstart: 라이브 대시보드 개인화 검증

## 실행

### Backend

```powershell
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```

### Frontend

```powershell
cd frontend
npm run dev -- --host 0.0.0.0 --port 3000
```

## API 확인

### 저장 전 조회

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:8080/api/layouts/me -Headers @{ 'X-Actor-Username' = 'admin' }
```

저장된 개인화가 없으면 `data`가 `null`일 수 있다.

### 테마와 레이아웃 저장

```powershell
$layout = @{
  version = 1
  theme = @{ mode = 'theme3' }
  activeTab = 'tab-line-a'
  tabs = @(
    @{
      id = 'tab-line-a'
      name = 'Production Line A'
      activeSubTab = 'subtab-equipment-1'
      subTabs = @(
        @{
          id = 'subtab-equipment-1'
          name = 'Equipment 1'
          gridConfig = @{ rows = 2; cols = 2; layout = 'grid'; gapSize = 8 }
          cameraPositions = @(
            @{ cameraId = 1; row = 0; col = 0; rowSpan = 1; colSpan = 1 }
          )
          createdAt = '2026-09-10T00:00:00.000Z'
          updatedAt = '2026-09-10T00:00:00.000Z'
        }
      )
      createdAt = '2026-09-10T00:00:00.000Z'
      updatedAt = '2026-09-10T00:00:00.000Z'
    }
  )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Method Put -Uri http://localhost:8080/api/layouts/me -Headers @{ 'X-Actor-Username' = 'admin' } -ContentType 'application/json' -Body $layout
```

기대 결과:

- `success: true`
- `data.tabName: dashboard`
- `data.theme.mode: theme3`
- `data.activeTab: tab-line-a`

### 다시 조회

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:8080/api/layouts/me -Headers @{ 'X-Actor-Username' = 'admin' }
```

저장한 `theme.mode`, `activeTab`, `tabs`가 동일하게 반환되어야 한다.

## 화면 확인

1. `http://localhost:3000` 접속
2. `admin` 계정 로그인
3. 테마 메뉴에서 테마 변경
4. 라이브 화면의 탭/그리드/카메라 배치를 변경
5. 새로고침 후 테마와 레이아웃이 유지되는지 확인

## 자동 검증

```powershell
cd backend
mvn test "-Dtest=LayoutServiceTest,LayoutControllerTest"
```

```powershell
cd frontend
npm test -- --run src/store/slices/__tests__/layoutSlice.test.ts src/hooks/__tests__/usePersistLayout.test.tsx src/services/__tests__/layoutService.test.ts
npm run build
```
