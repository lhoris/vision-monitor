@echo off
setlocal

set "ROOT_DIR=%~dp0.."
if not defined DEPLOY_DIR set "DEPLOY_DIR=%ROOT_DIR%\deploy"
set "NGINX_HOME=%ROOT_DIR%\nginx\windows\runtime"
set "NGINX_CONF=%DEPLOY_DIR%\nginx.conf"
set "NGINX_PREFIX=%NGINX_HOME:\=/%/"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-nginx.ps1" -NginxHome "%NGINX_HOME%" -Prefix "%NGINX_PREFIX%" -ConfigPath "%NGINX_CONF%"
exit /b %ERRORLEVEL%
