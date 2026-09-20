#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
source "$ROOT_DIR/scripts/resolve-java-home.sh"

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
info() { printf '\n==> %s\n' "$*"; }

resolve_java_home || exit 1
for tool in node npm; do
  command -v "$tool" >/dev/null 2>&1 || die "$tool was not found on PATH"
done

NODE_VERSION="$(node -p 'process.versions.node.split(".")[0]')"
[[ "$NODE_VERSION" == 24 ]] || die "Node.js 24 is required; node reports $(node -v)"
[[ -d "$FRONTEND_DIR/node_modules" ]] || die "frontend/node_modules is missing. Install dependencies with npm ci in frontend first."

info "Building backend with the project Maven Wrapper (tests are skipped; run ./mvnw test separately)"
(cd "$BACKEND_DIR" && ./mvnw clean package -DskipTests)

info "Building frontend"
(cd "$FRONTEND_DIR" && npm run build)

[[ -s "$FRONTEND_DIR/dist/index.html" ]] || die "Frontend build did not produce frontend/dist/index.html"
shopt -s nullglob
JARS=("$BACKEND_DIR"/target/vision-monitor-*.jar)
shopt -u nullglob
[[ ${#JARS[@]} -eq 1 && -s "${JARS[0]}" ]] || die "Expected exactly one runnable backend JAR in backend/target"

info "Build complete"
printf 'Backend artifact: %s\nFrontend artifact: %s\n' "${JARS[0]}" "$FRONTEND_DIR/dist"
