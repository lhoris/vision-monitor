@echo off
setlocal EnableExtensions EnableDelayedExpansion

for %%I in ("%~dp0..") do set "ROOT_DIR=%%~fI"
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "FRONTEND_DIST=%ROOT_DIR%\frontend\dist"
if not defined DEPLOY_DIR set "DEPLOY_DIR=%ROOT_DIR%\deploy"
set "APP_DIR=%DEPLOY_DIR%\app"
set "WEB_DIR=%DEPLOY_DIR%\www"
set "LOG_DIR=%DEPLOY_DIR%\logs"
set "BACKEND_JAR=%APP_DIR%\vision-monitor.jar"
if not defined BACKEND_PORT set "BACKEND_PORT=8080"
if not defined NGINX_PORT set "NGINX_PORT=8088"
set "NGINX_HOME=%ROOT_DIR%\nginx\windows\runtime"
set "NGINX_CONF=%DEPLOY_DIR%\nginx.conf"
set "HEALTH_URL=http://127.0.0.1:%BACKEND_PORT%/api/common-codes/bootstrap"

echo ==========================================
echo Vision Monitor VMS - Offline Deploy
echo ==========================================
echo Project: %ROOT_DIR%
echo.

call :setup_java
if errorlevel 1 exit /b 1

call :validate_artifacts
if errorlevel 1 exit /b 1

call :prepare_nginx
if errorlevel 1 exit /b 1

call :stop_backend
if errorlevel 1 exit /b 1

call :install_artifacts
if errorlevel 1 exit /b 1

call :start_backend
if errorlevel 1 exit /b 1

call :wait_for_backend
if errorlevel 1 exit /b 1

call :reload_or_start_nginx
if errorlevel 1 exit /b 1

call :verify_nginx
if errorlevel 1 exit /b 1

echo.
echo Deployment complete.
echo Backend:  http://localhost:%BACKEND_PORT%
echo Frontend: http://localhost:%NGINX_PORT%
echo Backend log: %LOG_DIR%\backend.log
echo Nginx log: %NGINX_HOME%\logs\error.log
endlocal
exit /b 0

:setup_java
set "RESOLVED_JAVA_HOME="
for /f "usebackq delims=" %%J in (`powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0resolve-java-runtime.ps1"`) do set "RESOLVED_JAVA_HOME=%%J"
if not defined RESOLVED_JAVA_HOME (
  echo Java 21 was not found. Set PROJECT_JAVA_HOME or JAVA_HOME on this PC.
  exit /b 1
)
set "JAVA_HOME=%RESOLVED_JAVA_HOME%"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
echo Using Java: %JAVA_EXE%
exit /b 0

:validate_artifacts
if not exist "%FRONTEND_DIST%\index.html" (
  echo Missing frontend build artifact: %FRONTEND_DIST%\index.html
  echo Run scripts\build.bat on the development PC and copy the project again.
  exit /b 1
)
set "JAR_COUNT=0"
set "SOURCE_JAR="
for %%F in ("%BACKEND_DIR%\target\vision-monitor-*.jar") do if exist "%%~fF" (
  set /a JAR_COUNT+=1
  set "SOURCE_JAR=%%~fF"
)
if not "%JAR_COUNT%"=="1" (
  echo Expected exactly one backend JAR under %BACKEND_DIR%\target, found %JAR_COUNT%.
  echo Run scripts\build.bat on the development PC and copy the project again.
  exit /b 1
)
if not exist "%NGINX_HOME%\nginx.exe" (
  echo Missing project-managed Nginx: %NGINX_HOME%\nginx.exe
  exit /b 1
)
if not exist "%NGINX_HOME%\conf\mime.types" (
  echo Missing project-managed Nginx configuration files.
  exit /b 1
)
echo Frontend artifact: %FRONTEND_DIST%
echo Backend artifact: %SOURCE_JAR%
echo Nginx runtime: %NGINX_HOME%
exit /b 0

:prepare_nginx
if not exist "%APP_DIR%" mkdir "%APP_DIR%"
if not exist "%WEB_DIR%" mkdir "%WEB_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-nginx.ps1" -InstallDirectory "%NGINX_HOME%" >nul
if errorlevel 1 (
  echo Could not prepare project-managed Nginx directories.
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0configure-nginx.ps1" -NginxHome "%NGINX_HOME%" -WebRoot "%WEB_DIR%" -OutputPath "%NGINX_CONF%" -Port %NGINX_PORT%
if errorlevel 1 exit /b 1
set "NGINX_PREFIX=%NGINX_HOME:\=/%/"
"%NGINX_HOME%\nginx.exe" -p "%NGINX_PREFIX%" -c "%NGINX_CONF%" -t
if errorlevel 1 (
  echo Nginx configuration validation failed: %NGINX_CONF%
  exit /b 1
)
exit /b 0

:stop_backend
echo.
echo Stopping existing backend on port %BACKEND_PORT%...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-backend.ps1" -Port %BACKEND_PORT%
if errorlevel 1 (
  echo Backend stop failed. Deployment was cancelled.
  exit /b 1
)
exit /b 0

:install_artifacts
echo.
echo Installing backend JAR...
copy /y "%SOURCE_JAR%" "%BACKEND_JAR%.new" >nul
if errorlevel 1 (
  echo Backend JAR copy failed.
  exit /b 1
)
move /y "%BACKEND_JAR%.new" "%BACKEND_JAR%" >nul
if errorlevel 1 (
  echo Could not install %BACKEND_JAR%.
  exit /b 1
)

echo Installing frontend static files...
robocopy "%FRONTEND_DIST%" "%WEB_DIR%" /MIR /R:2 /W:1 >nul
if %ERRORLEVEL% GEQ 8 (
  echo Frontend artifact copy failed.
  exit /b 1
)
exit /b 0

:start_backend
echo.
echo Starting backend...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-backend.ps1" -JavaPath "%JAVA_EXE%" -JarPath "%BACKEND_JAR%" -WorkingDirectory "%DEPLOY_DIR%" -LogDirectory "%LOG_DIR%"
if errorlevel 1 (
  echo Backend failed to start. Check %LOG_DIR%\backend-error.log.
  exit /b 1
)
exit /b 0

:wait_for_backend
echo Waiting for backend readiness...
for /L %%I in (1,1,45) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$code = 0; try { $r = Invoke-WebRequest -Uri '%HEALTH_URL%' -UseBasicParsing -TimeoutSec 2; $code = [int]$r.StatusCode } catch { if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode } }; if (($code -ge 200 -and $code -lt 300) -or $code -eq 401) { exit 0 } else { exit 1 }" >nul 2>nul
  if not errorlevel 1 (
    echo Backend is ready.
    exit /b 0
  )
  timeout /t 1 /nobreak >nul
)
echo Backend did not become ready at %HEALTH_URL%.
echo Check %LOG_DIR%\backend.log and %LOG_DIR%\backend-error.log.
exit /b 1

:reload_or_start_nginx
echo.
echo Reloading project-managed Nginx...
"%NGINX_HOME%\nginx.exe" -p "%NGINX_PREFIX%" -c "%NGINX_CONF%" -s reload >nul 2>nul
if not errorlevel 1 (
  echo Nginx configuration reloaded.
  exit /b 0
)
echo Nginx is not running with the project configuration. Starting it...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-nginx.ps1" -NginxHome "%NGINX_HOME%" -Prefix "%NGINX_PREFIX%" -ConfigPath "%NGINX_CONF%"
if errorlevel 1 (
  echo Nginx could not be started. Check %NGINX_HOME%\logs\error.log.
  exit /b 1
)
exit /b 0

:verify_nginx
echo Verifying HTML, static assets, and API proxy...
for /L %%I in (1,1,30) do (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0check-nginx.ps1" -BaseUrl "http://127.0.0.1:%NGINX_PORT%" -ApiPath "/api/common-codes/bootstrap" >nul 2>nul
  if not errorlevel 1 (
    echo Nginx is ready.
    exit /b 0
  )
  timeout /t 1 /nobreak >nul
)
echo Nginx validation failed at http://127.0.0.1:%NGINX_PORT%/.
echo Check %NGINX_HOME%\logs\error.log.
exit /b 1
