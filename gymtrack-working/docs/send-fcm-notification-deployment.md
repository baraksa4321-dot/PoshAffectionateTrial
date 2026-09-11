# Send FCM notification deployment verification

Recorded on 2026-09-11 after deploying the current
`supabase/functions/send-fcm-notification/index.ts`.

## Active function

- Function: `send-fcm-notification`
- Status: `ACTIVE`
- Active version: `19`
- JWT verification: enabled
- Deployed source hash: `0b98b97a1030d5640c1b1416833ed62dc3252cad09fafe024496196915b31842`
- Supabase project ref: `pnvtxazqtorylcsjtatv`

The deployment targeted only the Edge Function. No RLS migration or policy
change was applied.

## Authenticated smoke result

The smoke request authenticated successfully as the configured coach and
trainee accounts, then called the function as the coach for the trainee.

- Function response: HTTP `200`
- Raw function result: `{"sent":0,"failed":0}`
- Normalized client result: `{"sent":0,"failed":0}`
- OAuth: not attempted because the recipient had no registered push tokens
- FCM: not attempted because there were no tokens to deliver to
- Outcome: no-token path verified; this is not an OAuth or FCM failure

No access token, password, private key, FCM token, or other credential is
included in this record.