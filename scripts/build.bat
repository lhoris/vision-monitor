@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."
set "JDK_SEARCH_ROOT=C:\JDK"
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
call mvn clean package -DskipTests
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

echo.
echo Build complete.
echo Backend artifact: backend\target\vision-monitor-*.jar
echo Frontend artifact: frontend\dist

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
