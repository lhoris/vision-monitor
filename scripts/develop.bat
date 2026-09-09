@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
set "JDK_SEARCH_ROOT=C:\JDK"
set "EXPECTED_NODE_MAJOR=v24"

call :setup_java
if errorlevel 1 exit /b 1

call :setup_node
if errorlevel 1 exit /b 1

echo ==========================================
echo Vision Monitor VMS - Local Development
echo ==========================================
echo JAVA_HOME=%JAVA_HOME%
java -version
echo Node:
node -v
echo npm:
call npm -v
echo.

where mvn >nul 2>nul
if errorlevel 1 (
  echo Maven was not found on PATH.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found on PATH.
  exit /b 1
)

echo [1/5] Stopping existing services on development ports...
call :stop_port 8080 Backend
if errorlevel 1 exit /b 1
call :stop_port 3000 Frontend
if errorlevel 1 exit /b 1

echo.
echo [2/5] Installing frontend dependencies...
pushd "%FRONTEND_DIR%"
call npm ci
if errorlevel 1 (
  popd
  echo Frontend dependency install failed.
  exit /b 1
)
popd

echo.
echo [3/5] Building backend with Maven...
pushd "%BACKEND_DIR%"
call mvn clean package -DskipTests
if errorlevel 1 (
  popd
  echo Backend build failed.
  exit /b 1
)
popd

echo.
echo [4/5] Building frontend...
pushd "%FRONTEND_DIR%"
call npm run build
if errorlevel 1 (
  popd
  echo Frontend build failed.
  exit /b 1
)
popd

echo.
echo [5/5] Starting services...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo Swagger: http://localhost:8080/swagger-ui.html
echo.

start "vision-monitor-backend" cmd /k "cd /d ""%BACKEND_DIR%"" && call mvn spring-boot:run -Dspring-boot.run.profiles=local"
start "vision-monitor-frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && call npm run dev"

endlocal
exit /b 0

:setup_java
if not "%JDK_HOME%"=="" (
  call :use_jdk "%JDK_HOME%"
  exit /b !ERRORLEVEL!
)

if not exist "%JDK_SEARCH_ROOT%" (
  echo JDK search root was not found: %JDK_SEARCH_ROOT%
  echo Set JDK_HOME to a JDK 21 path and run again.
  exit /b 1
)

for /f "usebackq delims=" %%J in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$root='C:\JDK'; Get-ChildItem -Path $root -Filter javac.exe -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object { $javaHome = Split-Path (Split-Path $_.FullName -Parent) -Parent; $version = & $_.FullName -version 2>&1; if ($version -match '^javac 21\.') { Write-Output $javaHome; exit 0 } }"`) do (
  set "JDK_HOME=%%J"
  goto :jdk_found
)

echo JDK 21 was not found under %JDK_SEARCH_ROOT%.
echo Install JDK 21 under %JDK_SEARCH_ROOT% or set JDK_HOME explicitly.
exit /b 1

:jdk_found
call :use_jdk "%JDK_HOME%"
exit /b !ERRORLEVEL!

:use_jdk
set "JAVA_HOME=%~1"
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo java.exe was not found under JAVA_HOME: %JAVA_HOME%
  exit /b 1
)
if not exist "%JAVA_HOME%\bin\javac.exe" (
  echo javac.exe was not found under JAVA_HOME: %JAVA_HOME%
  exit /b 1
)
set "PATH=%JAVA_HOME%\bin;%PATH%"
for /f "tokens=2" %%V in ('javac -version 2^>^&1') do set "JAVAC_VERSION=%%V"
echo %JAVAC_VERSION% | findstr /B "21." >nul
if errorlevel 1 (
  echo JDK 21 is required, but javac reports: %JAVAC_VERSION%
  exit /b 1
)
exit /b 0

:setup_node
where node >nul 2>nul
if errorlevel 1 (
  where nvm >nul 2>nul
  if errorlevel 1 (
    echo Node.js was not found on PATH. Install nvm-windows and run "nvm use 24".
    exit /b 1
  )
  call nvm use 24
)

for /f "delims=" %%V in ('node -v 2^>nul') do set "NODE_VERSION=%%V"
echo %NODE_VERSION% | findstr /B "%EXPECTED_NODE_MAJOR%" >nul
if errorlevel 1 (
  where nvm >nul 2>nul
  if not errorlevel 1 (
    call nvm use 24
    for /f "delims=" %%V in ('node -v 2^>nul') do set "NODE_VERSION=%%V"
  )
)

echo %NODE_VERSION% | findstr /B "%EXPECTED_NODE_MAJOR%" >nul
if errorlevel 1 (
  echo Node 24 is required, but current version is %NODE_VERSION%.
  echo Run: nvm install 24
  echo Run: nvm use 24
  exit /b 1
)
exit /b 0

:stop_port
set "PORT=%~1"
set "SERVICE_NAME=%~2"
set "FOUND_PROCESS="

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
  set "FOUND_PROCESS=1"
  echo %SERVICE_NAME% port %PORT% is already in use by PID %%P. Stopping it...
  taskkill /PID %%P >nul 2>nul
  powershell -NoProfile -Command "Start-Sleep -Seconds 3" >nul
  tasklist /FI "PID eq %%P" 2>nul | findstr /R /C:"%%P" >nul
  if not errorlevel 1 (
    echo PID %%P is still running. Forcing shutdown...
    taskkill /F /PID %%P >nul 2>nul
  )
)

if "%FOUND_PROCESS%"=="" (
  echo %SERVICE_NAME% port %PORT% is free.
)
exit /b 0
