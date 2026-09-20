#!/usr/bin/env bash

resolve_java_home() {
  local candidate compiler version root
  local -a candidates=()
  candidates+=("${PROJECT_JDK_HOME:-}" "${JDK_HOME:-}" "${JAVA_HOME:-}")
  candidates+=("$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)/.tools/jdk-21")

  if command -v javac >/dev/null 2>&1; then
    compiler="$(readlink -f "$(command -v javac)")"
    candidates+=("$(dirname -- "$(dirname -- "$compiler")")")
  fi

  for root in /usr/lib/jvm /opt/jdk "$HOME/.jdks"; do
    if [[ -d "$root" ]]; then
      for candidate in "$root"/*21*; do
        [[ -d "$candidate" ]] && candidates+=("$candidate")
      done
    fi
  done

  for candidate in "${candidates[@]}"; do
    [[ -n "$candidate" && -x "$candidate/bin/java" && -x "$candidate/bin/javac" ]] || continue
    version="$("$candidate/bin/javac" -version 2>&1)"
    if [[ "$version" =~ ^javac\ 21([.]|$) ]]; then
      export JAVA_HOME="$candidate"
      export PATH="$JAVA_HOME/bin:$PATH"
      printf 'Using JAVA_HOME=%s\n' "$JAVA_HOME"
      return 0
    fi
  done

  printf 'ERROR: JDK 21 was not found. Set PROJECT_JDK_HOME to its install directory.\n' >&2
  return 1
}
