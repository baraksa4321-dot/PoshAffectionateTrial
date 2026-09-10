#!/usr/bin/env bash

set -Eeuo pipefail

deadline_seconds="${GYMTRACK_RELEASE_CHECK_TIMEOUT_SECONDS:-270}"
release_pid=""
watchdog_pid=""
timeout_marker="$(mktemp)"
cleanup_started=false

if ! [[ "$deadline_seconds" =~ ^[1-9][0-9]*$ ]]; then
  echo "FAIL: GYMTRACK_RELEASE_CHECK_TIMEOUT_SECONDS must be a positive whole number of seconds." >&2
  exit 2
fi

cleanup() {
  if [[ "$cleanup_started" == true ]]; then
    return
  fi
  cleanup_started=true

  if [[ -n "$watchdog_pid" ]]; then
    kill "$watchdog_pid" 2>/dev/null || true
  fi
  rm -f "$timeout_marker"
}

trap cleanup EXIT

if ! command -v setsid >/dev/null 2>&1; then
  echo "FAIL: release validation requires setsid so timeout cleanup can target only the release process group." >&2
  exit 1
fi

setsid bash scripts/release-check.sh &
release_pid="$!"

(
  sleep "$deadline_seconds"
  printf '1' >"$timeout_marker"
  echo "FAIL: release validation exceeded ${deadline_seconds}s and is being terminated." >&2
  echo "Action: inspect the last reported stage and its diagnostics; increase GYMTRACK_RELEASE_CHECK_TIMEOUT_SECONDS only after finding the bottleneck." >&2
  kill -TERM -- "-${release_pid}" 2>/dev/null || kill "$release_pid" 2>/dev/null || true
  sleep 5
  kill -KILL -- "-${release_pid}" 2>/dev/null || true
) &
watchdog_pid="$!"

set +e
wait "$release_pid"
release_status=$?
set -e

if [[ -s "$timeout_marker" ]]; then
  exit 124
fi

exit "$release_status"