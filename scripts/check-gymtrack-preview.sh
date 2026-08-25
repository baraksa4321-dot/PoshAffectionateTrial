#!/usr/bin/env bash

set -Eeuo pipefail

port="${GYMTRACK_SMOKE_PORT:-4173}"
log_file="$(mktemp)"
preview_pid=""

cleanup() {
  if [[ -n "$preview_pid" ]] && kill -0 "$preview_pid" 2>/dev/null; then
    kill "$preview_pid" 2>/dev/null || true
    wait "$preview_pid" 2>/dev/null || true
  fi
  rm -f "$log_file"
}
trap cleanup EXIT

echo "Starting GymTrack release preview on port ${port}..."
(
  cd gymtrack-working
  npm run dev -- --host 127.0.0.1 --port "$port"
) >"$log_file" 2>&1 &
preview_pid="$!"

for _ in {1..30}; do
  if curl --fail --silent --show-error "http://127.0.0.1:${port}/" >/dev/null; then
    echo "GymTrack release preview started successfully."
    exit 0
  fi

  if ! kill -0 "$preview_pid" 2>/dev/null; then
    echo "ERROR: GymTrack release preview exited before it became ready." >&2
    cat "$log_file" >&2
    exit 1
  fi

  sleep 1
done

echo "ERROR: GymTrack release preview did not respond on port ${port} within 30 seconds." >&2
cat "$log_file" >&2
exit 1