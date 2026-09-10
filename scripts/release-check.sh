#!/usr/bin/env bash

set -Eeuo pipefail

stage="startup"

on_signal() {
  echo "FAIL: release validation was interrupted during ${stage}." >&2
  echo "Action: if the configured release timeout was reached, inspect the last stage output and its stage-specific timeout diagnostics before rerunning." >&2
  exit 124
}

trap on_signal INT TERM

run_stage() {
  local name="$1"
  shift
  local started_at=$SECONDS

  stage="$name"
  printf "\n==> %s\n" "$name"
  if "$@"; then
    printf "PASS: %s (%ss)\n" "$name" "$((SECONDS - started_at))"
    return 0
  else
    local status=$?
    printf "FAIL: %s (exit %s after %ss)\n" "$name" "$status" "$((SECONDS - started_at))" >&2
    return "$status"
  fi
}

run_stage "Typecheck" pnpm run typecheck
run_stage "GymTrack unit tests" pnpm --dir gymtrack-working run test
run_stage "Status color checks" pnpm --dir gymtrack-working run check:status-colors
run_stage "GymTrack production build" pnpm --dir gymtrack-working run build
run_stage "Authenticated WebKit preview smoke" bash scripts/check-gymtrack-preview.sh
run_stage "Guarded live sync smoke" bash scripts/run-live-sync-check.sh

stage="complete"
echo
echo "PASS: GymTrack release validation completed."