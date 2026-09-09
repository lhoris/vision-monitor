# Vision Monitor 실행 가이드

이 문서는 로컬 개발 환경에서 backend와 frontend를 같은 버전 기준으로 컴파일하고 실행하는 절차를 정리한다.

## 1. 필수 버전

| 항목 | 버전 | 확인 기준 |
| --- | --- | --- |
| JDK | 21 | `backend/pom.xml`의 `java.version`, `maven.compiler.release` |
| Maven | 3.8 이상 | 현재 검증 환경: Maven 3.9.0 |
| Node.js | 24.x | 루트 `.nvmrc` |
| npm | 11.x | Node 24 기본 npm 사용 |
| MariaDB | 10.6 이상 | Flyway + MariaDB JDBC |

## 2. Windows 권장 실행 방법

Node는 nvm으로 24 버전을 선택하고, JDK는 스크립트가 `C:\JDK` 아래에서 Java 21 설치 경로를 자동으로 찾아 `JAVA_HOME`으로 설정한다.

```bat
nvm install 24
nvm use 24
scripts\develop.bat
```

JDK를 자동으로 찾지 못하면 `JDK_HOME`을 직접 지정해서 실행한다.

```bat
set JDK_HOME=C:\JDK\OpenJDK\jdk-21.0.2
scripts\develop.bat
```

실행 후 접속 주소:

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

`scripts\develop.bat`는 실행 전에 backend를 Maven으로 빌드하고, `8080` 또는 `3000` 포트를 이미 사용 중인 프로세스가 있으면 종료한 뒤 backend/frontend를 다시 시작한다.

## 3. 수동 실행

### 3.1 Node 버전 맞추기

루트 디렉터리에서 실행한다.

```powershell
nvm install 24
nvm use 24
node -v
npm -v
```

`node -v`가 `v24.x`로 시작해야 한다.

### 3.2 Backend 실행

PowerShell 예시:

```powershell
$jdk = Get-ChildItem C:\JDK -Filter javac.exe -Recurse |
  Where-Object { (& $_.FullName -version 2>&1) -match '^javac 21\.' } |
  Select-Object -First 1
$env:JAVA_HOME = Split-Path (Split-Path $jdk.FullName -Parent) -Parent
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

cd backend
mvn clean package -DskipTests
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

local 프로필의 기본 DB 접속값:

- URL: `jdbc:mariadb://localhost:3306/PPWIRE`
- Username: `ppwiredb1`
- Password: `ppwiredb123!@`

다른 DB를 사용할 때는 환경 변수로 덮어쓴다.

```powershell
$env:DB_URL = "jdbc:mariadb://localhost:3306/PPWIRE"
$env:DB_USERNAME = "ppwiredb1"
$env:DB_PASSWORD = "ppwiredb123!@"
```

### 3.3 Frontend 실행

새 터미널에서 실행한다.

```powershell
nvm use 24
cd frontend
npm ci
npm run build
npm run dev
```

Vite 개발 서버는 기본적으로 `http://localhost:3000`에서 실행된다. `/api` 요청은 `vite.config.ts` 설정에 따라 `http://localhost:8080`으로 프록시된다.

## 4. DB 초기화

로컬 MariaDB에 기본 DB와 사용자를 만든다.

```powershell
mysql -u root -p < scripts\database-init.sql
```

Spring Boot 시작 시 Flyway가 `backend/src/main/resources/db/migration`의 migration을 자동 적용한다.

## 5. 빌드 검증

전체 빌드만 확인할 때:

```bat
scripts\build.bat
```

개별 검증:

```powershell
cd backend
mvn clean package -DskipTests

cd ..\frontend
nvm use 24
npm ci
npm run build
```

## 6. 자주 나는 문제

### JDK 버전 오류

`release version 21 not supported`가 나오면 Maven이 JDK 21이 아닌 JDK로 실행 중이다.

```powershell
java -version
mvn -v
```

두 명령 모두 Java 21 경로를 가리켜야 한다.

### DB 연결 실패

backend는 기본 프로필에서 사내 DB(`POSWIRE`)를 바라보고, `local` 프로필에서 로컬 DB(`PPWIRE`)를 바라본다. 로컬 개발은 반드시 `local` 프로필로 실행한다.

### frontend는 뜨지만 API가 실패함

backend가 `8080`에서 실행 중인지 확인한다.

```powershell
curl http://localhost:8080/swagger-ui.html
```

### 포트 충돌

`scripts\develop.bat` 사용 시에는 `8080`, `3000` 포트를 점유한 기존 프로세스를 자동으로 종료한다. 수동 실행에서 다른 포트를 쓰려면 아래처럼 지정한다.

Frontend:

```powershell
cd frontend
npm run dev -- --port 3001
```

Backend:

```powershell
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local -Dspring-boot.run.arguments="--server.port=8081"
```
