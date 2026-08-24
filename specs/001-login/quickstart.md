# Quickstart: 로그인 검증

## 1. 사전 조건

- MariaDB `vms` schema가 준비되어 있어야 한다.
- backend datasource는 `jdbc:mariadb://192.168.0.11:3306/vms`, `vmsuser / mariadb` 기준으로 연결된다.
- Flyway migration은 `users.password_hash`와 `admin` seed 계정을 적용해야 한다.
- Java 21과 Node.js 개발 환경이 준비되어 있어야 한다.

## 2. 실행

Backend:

```powershell
cd backend
mvn spring-boot:run
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## 3. 자동 검증

```powershell
cd backend
mvn test
```

```powershell
cd frontend
npm test -- --run authService
npm test -- --run
npm run build
```

## 4. 수동 검증 시나리오

### 4.1 tester mock 로그인

1. `/login`에서 username에 `tester`, password에 `tester123`을 입력한다.
2. Sign In을 선택한다.

기대 결과: 로그인 API 호출 없이 `/live`로 이동하고 관리자 메뉴가 표시된다.

### 4.2 tester1 mock 로그인

1. `/login`에서 username에 `tester1`, password에 `tester123`을 입력한다.
2. Sign In을 선택한다.

기대 결과: 로그인 API 호출 없이 `/live`로 이동하고 관리자 메뉴가 표시되지 않는다.

### 4.3 invalid tester password

1. `/login`에서 username에 `tester`, password에 잘못된 값을 입력한다.
2. Sign In을 선택한다.

기대 결과: 로그인 API 호출 없이 실패 메시지가 표시된다.

### 4.4 실제 admin 로그인

1. `/login`에서 username에 `admin`, password에 `admin`을 입력한다.
2. Sign In을 선택한다.

기대 결과:
- `POST /api/auth/login`이 호출된다.
- 응답에는 `user.id`, `user.username`, `user.role`, `user.permissions`, `token`이 포함된다.
- `/live`로 이동한다.
- 관리자 메뉴가 표시된다.

### 4.5 실제 API 연계

1. `admin/admin`으로 로그인한다.
2. `/admin/users`로 이동한다.

기대 결과:
- frontend가 `X-Actor-Username: admin` 헤더를 보낸다.
- 사용자관리 API가 200으로 응답한다.
- 사용자 목록에 `admin` 계정이 표시된다.

### 4.6 실패 상태

1. `/login`에서 존재하지 않는 username 또는 잘못된 password를 입력한다.
2. Sign In을 선택한다.

기대 결과: 계정 존재 여부나 상태를 드러내지 않는 동일한 로그인 실패 메시지가 표시된다.

### 4.7 보호 route

1. 로그아웃 상태에서 `/live` 또는 `/admin/users`에 접근한다.

기대 결과: `/login`으로 이동한다.
