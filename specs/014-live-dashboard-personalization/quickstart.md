# Quickstart: 라이브 대시보드 개인화 검증

## 사전 조건

- backend는 Java 21로 실행 가능해야 한다.
- MariaDB 개발 DB는 `jdbc:mariadb://192.168.0.11:3306/vms`로 접근 가능해야 한다.
- `admin/admin` 로그인이 가능해야 한다.
- frontend 의존성이 설치되어 있어야 한다.

## 실행

### backend

```powershell
cd backend
mvn spring-boot:run
```

기대 결과:

- Spring Boot가 `http://localhost:8080`에서 기동한다.
- Flyway schema가 최신 상태로 검증된다.

### frontend

```powershell
cd frontend
npm run dev -- --host 0.0.0.0
```

기대 결과:

- Vite 화면이 `http://localhost:3000/`에서 열린다.

## API 계약 검증

### 로그인

```powershell
$body = @{ username = 'admin'; password = 'admin' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/login -ContentType 'application/json' -Body $body
```

기대 결과:

- `success: true`
- `data.user.username: admin`
- `data.user.id`가 존재한다.

### 내 layout 조회

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:8080/api/layouts/me -Headers @{ 'X-Actor-Username' = 'admin' }
```

기대 결과:

- 저장 layout이 있으면 `data.tabs`가 반환된다.
- 저장 layout이 없으면 `data`가 없거나 `data: null`이 반환된다.

### 내 layout 저장

```powershell
$layout = @{
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
          gridConfig = @{
            rows = 2
            cols = 2
            layout = 'grid'
            gapSize = 8
          }
          cameraPositions = @(
            @{
              cameraId = 1
              row = 0
              col = 0
              rowSpan = 1
              colSpan = 1
              displayName = 'Admin Camera 1'
            }
          )
          createdAt = '2026-08-25T00:00:00.000Z'
          updatedAt = '2026-08-25T00:00:00.000Z'
        }
      )
      createdAt = '2026-08-25T00:00:00.000Z'
      updatedAt = '2026-08-25T00:00:00.000Z'
    }
  )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Method Put -Uri http://localhost:8080/api/layouts/me -Headers @{ 'X-Actor-Username' = 'admin' } -ContentType 'application/json' -Body $layout
```

기대 결과:

- `success: true`
- 응답 layout의 `userId`는 backend가 현재 사용자 기준으로 결정한다.
- 다시 `GET /api/layouts/me`를 호출하면 저장한 구성이 반환된다.

## 화면 검증 시나리오

### 시나리오 1: admin layout 저장/복원

1. `http://localhost:3000/` 접속
2. `admin/admin` 로그인
3. 라이브 대시보드 진입
4. 그리드 크기 변경 또는 카메라 Rename 수행
5. 저장 상태가 성공으로 표시되는지 확인
6. 브라우저 새로고침
7. 변경한 구성이 유지되는지 확인

### 시나리오 2: 사용자별 격리

1. `admin/admin`으로 layout 변경
2. 로그아웃
3. `tester/tester123`으로 로그인
4. admin layout이 보이지 않는지 확인
5. tester layout을 별도로 변경
6. 다시 admin으로 로그인해 admin layout이 유지되는지 확인

### 시나리오 3: 저장 실패

1. backend를 중지하거나 API 실패 fixture를 사용한다.
2. 라이브 대시보드에서 카메라 배치 또는 Rename을 변경한다.
3. 화면 변경은 유지되고 저장 실패 상태가 표시되는지 확인한다.
4. backend를 복구한 뒤 다음 변경 또는 재시도로 저장 성공 상태가 되는지 확인한다.

## 자동 검증

```powershell
cd backend
mvn test
```

```powershell
cd frontend
npm test -- --run
npm run build
```

기대 결과:

- backend 테스트 통과
- frontend 테스트 통과
- production build 통과
