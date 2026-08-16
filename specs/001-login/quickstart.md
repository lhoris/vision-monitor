# Quickstart: 로그인 검증

## 실행

```powershell
cd frontend
npm install
npm run dev
```

브라우저에서 `/login`으로 이동한다.

## 자동 검증

```powershell
cd frontend
npm test -- --run authService
npm test -- --run
npm run build
```

## 수동 검증 시나리오

### 1. tester mock 로그인

1. `/login`에서 username에 `tester`, password에 `tester123`을 입력한다.
2. Sign In을 선택한다.

**기대 결과**: 로그인 API 호출 없이 `/live`로 이동한다.

### 2. tester 잘못된 비밀번호

1. username에 `tester`, password에 다른 값을 입력한다.
2. Sign In을 선택한다.

**기대 결과**: 로그인 API 호출 없이 오류가 표시된다.

### 3. non-tester API 호출

1. username에 `operator`, password에 임의 값을 입력한다.
2. Sign In을 선택한다.
3. 브라우저 network panel에서 `/api/auth/login` 호출을 확인한다.

**기대 결과**: backend가 준비되지 않은 경우 오류가 표시되지만, API 호출은 발생한다.

### 4. 보호 route

1. 로그아웃 상태에서 `/live`에 접근한다.

**기대 결과**: `/login`으로 이동한다.

