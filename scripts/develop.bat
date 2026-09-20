@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
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
call mvnw.cmd clean package -DskipTests
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

start "vision-monitor-backend" cmd /k "cd /d ""%BACKEND_DIR%"" && call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local"
start "vision-monitor-frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && call npm run dev"

endlocal
exit /b 0

:setup_java
set "RESOLVED_JAVA_HOME="
for /f "usebackq delims=" %%J in (`powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0resolve-java-home.ps1"`) do set "RESOLVED_JAVA_HOME=%%J"
if not defined RESOLVED_JAVA_HOME exit /b 1
set "JAVA_HOME=%RESOLVED_JAVA_HOME%"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo Using JAVA_HOME=%JAVA_HOME%
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
