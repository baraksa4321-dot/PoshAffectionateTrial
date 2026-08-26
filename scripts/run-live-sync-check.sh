#!/usr/bin/env bash
set -euo pipefail

# The normal release check must remain usable without disposable live-test
# accounts. If any smoke account setting is present, however, fail closed on
# incomplete configuration instead of silently skipping a requested check.
account_keys=(
  GYMTRACK_SMOKE_COACH_EMAIL
  GYMTRACK_SMOKE_COACH_PASSWORD
  GYMTRACK_SMOKE_TRAINEE_EMAIL
  GYMTRACK_SMOKE_TRAINEE_PASSWORD
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
  echo "SKIP: live sync smoke is not configured; no disposable smoke accounts were provided."
  exit 0
fi

missing_keys=()
for key in "${required_keys[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    missing_keys+=("$key")
  fi
done

if ((${#missing_keys[@]} > 0)); then
  echo "FAIL: live sync smoke configuration is incomplete."
  echo "Missing settings: ${missing_keys[*]}"
  echo "Provide disposable smoke accounts and the guarded Supabase settings, or remove all smoke-account settings to skip."
  exit 1
fi

if [[ "$GYMTRACK_SMOKE_ALLOW_LIVE" != "true" ]]; then
  echo "FAIL: live sync smoke accounts are configured but GYMTRACK_SMOKE_ALLOW_LIVE is not true."
  echo "Set the explicit live-smoke guard only for disposable test accounts."
  exit 1
fi

echo "Running the guarded live coach-to-trainee sync smoke check..."
if ! pnpm --dir gymtrack-working run smoke:live-plan; then
  echo "FAIL: live coach-to-trainee sync smoke failed; release validation is blocked."
  exit 1
fi
echo "PASS: live coach-to-trainee sync smoke completed."