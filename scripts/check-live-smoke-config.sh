#!/usr/bin/env bash

set -euo pipefail

# This is a read-only preflight. It reports only whether settings exist and
# never prints their values. It intentionally does not contact Supabase or
# create, update, or delete any data.

account_keys=(
  GYMTRACK_SMOKE_COACH_EMAIL
  GYMTRACK_SMOKE_COACH_PASSWORD
  GYMTRACK_SMOKE_TRAINEE_EMAIL
  GYMTRACK_SMOKE_TRAINEE_PASSWORD
  GYMTRACK_SMOKE_UNRELATED_COACH_EMAIL
  GYMTRACK_SMOKE_UNRELATED_COACH_PASSWORD
)

required_keys=(
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY
  GYMTRACK_SMOKE_ALLOW_LIVE
  "${account_keys[@]}"
)

account_configured=false
for key in "${account_keys[@]}"; do
  if [[ -n "${!key:-}" ]]; then
    account_configured=true
    break
  fi
done

if [[ "$account_configured" != true ]]; then
  echo "SKIP: no disposable live-smoke account settings are configured."
  echo "No Supabase connection or live data mutation was attempted."
  exit 0
fi

missing_keys=()
for key in "${required_keys[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    missing_keys+=("$key")
  fi
done

if ((${#missing_keys[@]} > 0)); then
  echo "BLOCKED: live-smoke configuration is incomplete."
  echo "Missing setting names: ${missing_keys[*]}"
  echo "Values were not printed."
  exit 1
fi

if [[ "${GYMTRACK_SMOKE_ALLOW_LIVE}" != "true" ]]; then
  echo "BLOCKED: live-smoke accounts exist but the explicit guard is not true."
  echo "Set GYMTRACK_SMOKE_ALLOW_LIVE=true only for disposable smoke accounts."
  exit 1
fi

echo "READY: guarded live-smoke configuration is complete."
echo "This preflight made no network requests and changed no data."