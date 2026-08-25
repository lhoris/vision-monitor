@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."

echo ==========================================
echo Vision Monitor VMS - Build
echo ==========================================

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
call npm install
if errorlevel 1 (
  popd
  echo Frontend dependency install failed.
  exit /b 1
)

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
