@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."
set "EXPECTED_NODE_MAJOR=v24"

call :setup_java
if errorlevel 1 exit /b 1

call :setup_node
if errorlevel 1 exit /b 1

echo ==========================================
echo Vision Monitor VMS - Build
echo ==========================================
echo JAVA_HOME=%JAVA_HOME%
java -version
echo Node:
node -v
echo npm:
call npm -v

echo.
echo [1/2] Building backend...
pushd "%ROOT_DIR%\backend"
call mvnw.cmd clean package -DskipTests
if errorlevel 1 (
  popd
  echo Backend build failed.
  exit /b 1
)
popd

echo.
echo [2/2] Building frontend...
pushd "%ROOT_DIR%\frontend"
call npm run build
if errorlevel 1 (
  popd
  echo Frontend build failed.
  exit /b 1
)
popd

if not exist "%ROOT_DIR%\frontend\dist\index.html" (
  echo Frontend build did not produce frontend\dist\index.html.
  exit /b 1
)

set "JAR_COUNT=0"
for %%F in ("%ROOT_DIR%\backend\target\vision-monitor-*.jar") do if exist "%%~fF" set /a JAR_COUNT+=1
if not "%JAR_COUNT%"=="1" (
  echo Expected exactly one vision-monitor JAR, found %JAR_COUNT%.
  exit /b 1
)
for %%F in ("%ROOT_DIR%\backend\target\vision-monitor-*.jar") do if exist "%%~fF" set "BUILT_JAR=%%~fF"

echo.
echo Build complete.
echo Backend artifact: %BUILT_JAR%
echo Frontend artifact: frontend\dist

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
