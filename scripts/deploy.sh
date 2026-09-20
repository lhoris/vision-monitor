#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIST="$ROOT_DIR/frontend/dist"
APP_DIR="${APP_DIR:-/opt/vision}"
WEB_DIR="${WEB_DIR:-/var/www/vision}"
LOG_DIR="${LOG_DIR:-/var/log/vision}"
BACKEND_SERVICE="${BACKEND_SERVICE:-visionmonitor-backend}"
BACKEND_PORT="${BACKEND_PORT:-8080}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${BACKEND_PORT}/api/common-codes/bootstrap}"
BACKEND_JAR="$APP_DIR/vision-monitor.jar"

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
info() { printf '\n==> %s\n' "$*"; }

[[ "$APP_DIR" = /* && "$APP_DIR" != / ]] || die "APP_DIR must be an absolute, non-root path: $APP_DIR"
[[ "$WEB_DIR" = /* && "$WEB_DIR" != / ]] || die "WEB_DIR must be an absolute, non-root path: $WEB_DIR"
[[ "$LOG_DIR" = /* && "$LOG_DIR" != / ]] || die "LOG_DIR must be an absolute, non-root path: $LOG_DIR"
[[ "$APP_DIR" != "$WEB_DIR" && "$APP_DIR" != "$LOG_DIR" && "$WEB_DIR" != "$LOG_DIR" ]] || die "APP_DIR, WEB_DIR, and LOG_DIR must be different paths"

command -v systemctl >/dev/null 2>&1 || die "systemctl is required; deploy this script on the configured Linux systemd host"
command -v curl >/dev/null 2>&1 || die "curl is required for the post-deployment readiness check"
[[ $EUID -eq 0 ]] || die "Run deployment with sudo so files and the systemd service can be updated"
systemctl cat "$BACKEND_SERVICE" >/dev/null 2>&1 || die "systemd unit '$BACKEND_SERVICE' was not found; set BACKEND_SERVICE to the installed unit name"
[[ -f "$FRONTEND_DIST/index.html" ]] || die "Frontend artifact missing: $FRONTEND_DIST/index.html. Run scripts/build.sh first."

shopt -s nullglob
JARS=("$BACKEND_DIR"/target/vision-monitor-*.jar)
shopt -u nullglob
[[ ${#JARS[@]} -eq 1 && -f "${JARS[0]}" ]] || die "Expected exactly one backend JAR in $BACKEND_DIR/target. Run scripts/build.sh first."
SOURCE_JAR="${JARS[0]}"

RELEASE_ID="$(date +%Y%m%d-%H%M%S)"
WEB_PARENT="$(dirname -- "$WEB_DIR")"
WEB_STAGE="$WEB_PARENT/.vision-web-stage-$RELEASE_ID-$$"
WEB_BACKUP="$WEB_PARENT/.vision-web-previous-$RELEASE_ID"
JAR_STAGE="$APP_DIR/.vision-monitor-stage-$RELEASE_ID-$$.jar"
JAR_BACKUP="$APP_DIR/.vision-monitor-previous-$RELEASE_ID.jar"
WEB_HAD_PREVIOUS=0
JAR_HAD_PREVIOUS=0
WEB_NEW_INSTALLED=0
JAR_NEW_INSTALLED=0
DEPLOY_STARTED=0

rollback() {
  local result=$?
  if (( result != 0 && DEPLOY_STARTED )); then
    printf '\nDeployment failed; restoring the previous release...\n' >&2
    systemctl stop "$BACKEND_SERVICE" >/dev/null 2>&1 || true
    if [[ -f "$JAR_BACKUP" ]]; then
      mv -f -- "$JAR_BACKUP" "$BACKEND_JAR" || true
    elif (( JAR_NEW_INSTALLED )); then
      rm -f -- "$BACKEND_JAR"
    fi
    if [[ -d "$WEB_BACKUP" ]]; then
      rm -rf -- "$WEB_DIR"
      mv -- "$WEB_BACKUP" "$WEB_DIR" || true
    elif (( WEB_NEW_INSTALLED )); then
      rm -rf -- "$WEB_DIR"
    fi
    systemctl start "$BACKEND_SERVICE" >/dev/null 2>&1 || true
  fi
  rm -f -- "$JAR_STAGE"
  rm -rf -- "$WEB_STAGE"
  exit "$result"
}
trap rollback EXIT

info "Checking deployment directories and service"
install -d -m 0755 "$APP_DIR" "$WEB_PARENT" "$LOG_DIR"
[[ -w "$APP_DIR" && -w "$WEB_PARENT" && -w "$LOG_DIR" ]] || die "Deployment directories are not writable"
systemctl cat "$BACKEND_SERVICE" >/dev/null

info "Preparing verified release artifacts"
install -m 0644 "$SOURCE_JAR" "$JAR_STAGE"
mkdir -m 0755 "$WEB_STAGE"
cp -a "$FRONTEND_DIST/." "$WEB_STAGE/"
[[ -s "$JAR_STAGE" && -s "$WEB_STAGE/index.html" ]] || die "Staged artifacts are incomplete"

if [[ -f "$BACKEND_JAR" ]]; then
  cp -p -- "$BACKEND_JAR" "$JAR_BACKUP"
  JAR_HAD_PREVIOUS=1
fi
DEPLOY_STARTED=1
if [[ -d "$WEB_DIR" ]]; then
  mv -- "$WEB_DIR" "$WEB_BACKUP"
  WEB_HAD_PREVIOUS=1
fi

info "Installing release $RELEASE_ID"
mv -f -- "$JAR_STAGE" "$BACKEND_JAR"
JAR_NEW_INSTALLED=1
mv -- "$WEB_STAGE" "$WEB_DIR"
WEB_NEW_INSTALLED=1

info "Restarting $BACKEND_SERVICE (Flyway migrations run during startup)"
systemctl restart "$BACKEND_SERVICE"

ready=0
for ((attempt = 1; attempt <= 60; attempt++)); do
  status="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 2 "$HEALTH_URL" 2>/dev/null || true)"
  if [[ "$status" == 2?? || "$status" == 401 ]]; then
    ready=1
    break
  fi
  sleep 1
done
(( ready )) || die "Backend did not become ready at $HEALTH_URL. Check: journalctl -u $BACKEND_SERVICE -n 100"
systemctl is-active --quiet "$BACKEND_SERVICE" || die "Backend service is not active after startup"

DEPLOY_STARTED=0
info "Deployment succeeded"
printf 'Backend: %s\nFrontend: %s\nLogs: %s\n' "$BACKEND_JAR" "$WEB_DIR" "$LOG_DIR"
if (( JAR_HAD_PREVIOUS )); then printf 'Previous JAR backup: %s\n' "$JAR_BACKUP"; fi
if (( WEB_HAD_PREVIOUS )); then printf 'Previous frontend backup: %s\n' "$WEB_BACKUP"; fi
