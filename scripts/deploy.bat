@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "FRONTEND_DIST=%ROOT_DIR%\frontend\dist"
set "DEPLOY_DIR=%ROOT_DIR%\deploy"
set "APP_DIR=%DEPLOY_DIR%\app"
set "WEB_DIR=%DEPLOY_DIR%\www"
set "LOG_DIR=%DEPLOY_DIR%\logs"
set "BACKEND_JAR=%APP_DIR%\vision-monitor.jar"
set "BACKEND_PORT=8080"
set "JAVA_EXE=java"
set "NGINX_EXE=nginx"

echo ==========================================
echo Vision Monitor VMS - Deploy
echo ==========================================

call "%ROOT_DIR%\scripts\build.bat"
if errorlevel 1 exit /b 1

if not exist "%APP_DIR%" mkdir "%APP_DIR%"
if not exist "%WEB_DIR%" mkdir "%WEB_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo.
echo Copying backend jar...
for /f "delims=" %%F in ('dir /b /o-d "%BACKEND_DIR%\target\vision-monitor-*.jar" 2^>nul') do (
  copy /y "%BACKEND_DIR%\target\%%F" "%BACKEND_JAR%" >nul
  goto :jar_copied
)
echo Backend jar not found.
exit /b 1

:jar_copied
echo Backend jar: %BACKEND_JAR%

echo.
echo Copying frontend dist...
if not exist "%FRONTEND_DIST%" (
  echo Frontend dist not found: %FRONTEND_DIST%
  exit /b 1
)
robocopy "%FRONTEND_DIST%" "%WEB_DIR%" /MIR >nul
if %ERRORLEVEL% GEQ 8 (
  echo Frontend deploy copy failed.
  exit /b 1
)

echo.
echo Stopping backend on port %BACKEND_PORT%...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%BACKEND_PORT% .*LISTENING"') do (
  echo Sending stop signal to PID %%P
  taskkill /PID %%P >nul 2>nul
  timeout /t 5 /nobreak >nul
  tasklist /FI "PID eq %%P" 2>nul | findstr /R /C:"%%P" >nul
  if not errorlevel 1 (
    echo PID %%P still running, forcing shutdown.
    taskkill /F /PID %%P >nul 2>nul
  )
)

echo.
echo Starting backend...
start "vision-monitor-backend" /B "%JAVA_EXE%" -jar "%BACKEND_JAR%" > "%LOG_DIR%\backend.log" 2>&1

echo.
echo Starting nginx...
where "%NGINX_EXE%" >nul 2>nul
if errorlevel 1 (
  echo nginx was not found on PATH. Start nginx manually if it is installed elsewhere.
) else (
  "%NGINX_EXE%" -s reload >nul 2>nul
  if errorlevel 1 (
    start "vision-monitor-nginx" /B "%NGINX_EXE%"
  )
)

echo.
echo Deployment complete.
echo Backend: http://localhost:%BACKEND_PORT%
echo Frontend files: %WEB_DIR%
echo Backend log: %LOG_DIR%\backend.log

endlocal
