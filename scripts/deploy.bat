@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "FRONTEND_DIST=%ROOT_DIR%\frontend\dist"
if not defined DEPLOY_DIR set "DEPLOY_DIR=%ROOT_DIR%\deploy"
set "APP_DIR=%DEPLOY_DIR%\app"
set "WEB_DIR=%DEPLOY_DIR%\www"
set "LOG_DIR=%DEPLOY_DIR%\logs"
set "BACKEND_JAR=%APP_DIR%\vision-monitor.jar"
set "BACKEND_PORT=8080"
set "NGINX_HOME=%ROOT_DIR%\nginx\windows\runtime"
set "NGINX_CONF=%DEPLOY_DIR%\nginx.conf"
if not defined NGINX_PORT set "NGINX_PORT=8088"
if not defined HEALTH_URL set "HEALTH_URL=http://127.0.0.1:%BACKEND_PORT%/api/common-codes/bootstrap"

echo ==========================================
echo Vision Monitor VMS - Deploy
echo ==========================================

call :setup_java
if errorlevel 1 exit /b 1

if not exist "%FRONTEND_DIST%\index.html" (
  echo Frontend artifact not found: %FRONTEND_DIST%\index.html
  echo Run scripts\build.bat first, then run scripts\deploy.bat.
  exit /b 1
)

set "JAR_COUNT=0"
set "SOURCE_JAR="
for %%F in ("%BACKEND_DIR%\target\vision-monitor-*.jar") do if exist "%%~fF" (
  set /a JAR_COUNT+=1
  set "SOURCE_JAR=%%~fF"
)
if not "%JAR_COUNT%"=="1" (
  echo Expected exactly one backend JAR, found %JAR_COUNT%.
  echo Run scripts\build.bat first, then run scripts\deploy.bat.
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-nginx.ps1" -InstallDirectory "%NGINX_HOME%" >nul
if errorlevel 1 (
  echo Could not prepare the project-managed Nginx runtime.
  exit /b 1
)
if not exist "%NGINX_HOME%\logs" mkdir "%NGINX_HOME%\logs"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0configure-nginx.ps1" -NginxHome "%NGINX_HOME%" -WebRoot "%WEB_DIR%" -OutputPath "%NGINX_CONF%" -Port %NGINX_PORT%
if errorlevel 1 exit /b 1
set "NGINX_PREFIX=%NGINX_HOME:\=/%/"
"%NGINX_HOME%\nginx.exe" -p "%NGINX_PREFIX%" -c "%NGINX_CONF%" -t
if errorlevel 1 (
  echo Nginx configuration check failed: %NGINX_CONF%
  exit /b 1
)

if not exist "%APP_DIR%" mkdir "%APP_DIR%"
if not exist "%WEB_DIR%" mkdir "%WEB_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo.
echo Copying backend jar...
copy /y "%SOURCE_JAR%" "%BACKEND_JAR%.new" >nul
if errorlevel 1 (
  echo Backend jar copy failed.
  exit /b 1
)
echo Backend jar: %BACKEND_JAR%

echo.
echo Copying frontend dist...
if not exist "%FRONTEND_DIST%" (
  echo Frontend dist not found: %FRONTEND_DIST%
  echo Run scripts\build.bat first, then run scripts\deploy.bat.
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
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = Get-CimInstance Win32_Process -Filter 'ProcessId=%%P'; if ($null -eq $p -or $p.CommandLine -notmatch '(?i)vision-monitor.*\.jar') { exit 2 }" >nul 2>nul
  if errorlevel 1 (
    echo Refusing to stop PID %%P: it does not appear to run vision-monitor.jar.
    echo Check port %BACKEND_PORT% and stop only the intended application process.
    exit /b 1
  )
  echo Sending stop signal to PID %%P
  taskkill /PID %%P >nul 2>nul
  timeout /t 5 /nobreak >nul
  tasklist /FI "PID eq %%P" 2>nul | findstr /R /C:"%%P" >nul
  if not errorlevel 1 (
    echo PID %%P still running, forcing shutdown.
    taskkill /F /PID %%P >nul 2>nul
  )
)

move /y "%BACKEND_JAR%.new" "%BACKEND_JAR%" >nul
if errorlevel 1 (
  echo Could not install backend jar: %BACKEND_JAR%
  exit /b 1
)

echo.
echo Starting backend...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-backend.ps1" -JavaPath "%JAVA_EXE%" -JarPath "%BACKEND_JAR%" -WorkingDirectory "%DEPLOY_DIR%" -LogDirectory "%LOG_DIR%"
if errorlevel 1 (
  echo Backend could not be started. Check %LOG_DIR%\backend-error.log.
  exit /b 1
)

echo Waiting for backend readiness...
for /L %%I in (1,1,45) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$code = 0; try { $r = Invoke-WebRequest -Uri '%HEALTH_URL%' -UseBasicParsing -TimeoutSec 2; $code = [int]$r.StatusCode } catch { if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode } }; if (($code -ge 200 -and $code -lt 300) -or $code -eq 401) { exit 0 } else { exit 1 }" >nul 2>nul
  if not errorlevel 1 goto :backend_ready
  timeout /t 1 /nobreak >nul
)
echo Backend did not become ready at %HEALTH_URL%.
echo Check backend logs: %LOG_DIR%\backend.log
exit /b 1

:backend_ready
echo Backend is ready.

echo.
echo Starting project-managed Nginx on port %NGINX_PORT%...
echo Nginx executable: %NGINX_HOME%\nginx.exe
echo Nginx config: %NGINX_CONF%
echo Nginx static root: %WEB_DIR%
"%NGINX_HOME%\nginx.exe" -p "%NGINX_PREFIX%" -c "%NGINX_CONF%" -s reload >nul 2>nul
if errorlevel 1 (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-nginx.ps1" -NginxHome "%NGINX_HOME%" -Prefix "%NGINX_PREFIX%" -ConfigPath "%NGINX_CONF%"
  if errorlevel 1 (
    echo Project-managed Nginx could not be started. Check %NGINX_HOME%\logs\error.log.
    exit /b 1
  )
)

echo Verifying HTML, static assets, and API proxy...
for /L %%I in (1,1,30) do (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0check-nginx.ps1" -BaseUrl "http://127.0.0.1:%NGINX_PORT%" -ApiPath "/api/common-codes/bootstrap" >nul 2>nul
  if not errorlevel 1 goto :frontend_ready
  timeout /t 1 /nobreak >nul
)
echo Nginx validation failed for HTML, static assets, or API proxy at http://127.0.0.1:%NGINX_PORT%/.
echo Check Nginx logs under %NGINX_HOME%\logs.
exit /b 1

:frontend_ready
echo Nginx is ready.

echo.
echo Deployment complete.
echo Backend: http://localhost:%BACKEND_PORT%
echo Frontend: http://localhost:%NGINX_PORT%
echo Frontend files: %WEB_DIR%
echo Backend log: %LOG_DIR%\backend.log

endlocal
exit /b 0

:setup_java
set "RESOLVED_JAVA_HOME="
for /f "usebackq delims=" %%J in (`powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0resolve-java-home.ps1"`) do set "RESOLVED_JAVA_HOME=%%J"
if not defined RESOLVED_JAVA_HOME exit /b 1
set "JAVA_HOME=%RESOLVED_JAVA_HOME%"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
echo Using JAVA_HOME=%JAVA_HOME%
exit /b 0
