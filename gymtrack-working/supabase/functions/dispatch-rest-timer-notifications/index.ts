import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const MAX_ATTEMPTS = 3;

type TimerRow = {
  id: string;
  user_id: string;
  timer_key: string;
  ends_at: string;
  attempts: number;
};

function base64Url(value: ArrayBuffer | string) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function privateKeyBytes(rawValue: string) {
  const pem = rawValue
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n?/g, "\n")
    .trim();
  const match = pem.match(/-----BEGIN ([A-Z0-9 ]*PRIVATE KEY)-----([\s\S]*?)-----END \1-----/);
  if (!match || match[1] !== "PRIVATE KEY") {
    throw new Error("Firebase private key must be a PKCS#8 PEM.");
  }
  return Uint8Array.from(atob(match[2].replace(/\s/g, "")), (character) => character.charCodeAt(0));
}

async function googleAccessToken() {
  const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL")?.trim();
  const privateKey = Deno.env.get("FIREBASE_PRIVATE_KEY");
  if (!clientEmail || !privateKey?.trim())
    throw new Error("Firebase server credentials are missing.");
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: issuedAt,
      exp: issuedAt + 3_600,
    }),
  );
  const input = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(input),
  );
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${input}.${base64Url(signature)}`,
    }),
  });
  if (!response.ok) throw new Error(`Firebase OAuth failed: ${await response.text()}`);
  const payload = await response.json();
  if (typeof payload.access_token !== "string" || !payload.access_token) {
    throw new Error("Firebase OAuth response did not include an access token.");
  }
  return payload.access_token as string;
}

async function sendTimerPushes(
  admin: ReturnType<typeof createClient>,
  timer: TimerRow,
  accessToken: string,
  projectId: string,
) {
  const { data: tokens, error } = await admin
    .from("push_tokens")
    .select("token")
    .eq("user_id", timer.user_id)
    .eq("platform", "web");
  if (error) throw new Error(`Could not load web notification devices: ${error.message}`);
  if (!tokens?.length) return { sent: 0, failed: 0, invalidTokens: [] as string[] };

  const messageId = `rest-timer:${timer.id}`;
  let sent = 0;
  let failed = 0;
  const invalidTokens: string[] = [];
  for (const tokenRow of tokens) {
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: tokenRow.token,
            data: {
              type: "rest-timer",
              messageId,
              title: "זמן המנוחה הסתיים",
              body: "אפשר להתחיל את הסט הבא.",
              timerKey: timer.timer_key,
            },
          },
        }),
      },
    );
    if (response.ok) {
      sent += 1;
      continue;
    }
    failed += 1;
    const responseBody = await response.text();
    if (responseBody.includes("UNREGISTERED") || responseBody.includes("NOT_FOUND")) {
      invalidTokens.push(tokenRow.token);
    }
  }
  return { sent, failed, invalidTokens };
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authorization = request.headers.get("authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey || authorization !== `Bearer ${serviceRoleKey}`) {
      return jsonResponse({ error: "Authentication is required." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const now = new Date().toISOString();
    const { data: dueTimers, error: dueError } = await admin
      .from("rest_timer_notifications")
      .select("id,user_id,timer_key,ends_at,attempts")
      .eq("status", "scheduled")
      .lte("ends_at", now)
      .order("ends_at", { ascending: true })
      .limit(100);
    if (dueError) throw new Error(`Could not load due rest timers: ${dueError.message}`);

    const projectId = Deno.env.get("FIREBASE_PROJECT_ID")?.trim();
    if (!projectId) throw new Error("Firebase project id is missing.");
    let accessToken: string | null = null;
    let sent = 0;
    let failed = 0;
    let skipped = 0;
    for (const timer of (dueTimers ?? []) as TimerRow[]) {
      const { data: claimed, error: claimError } = await admin
        .from("rest_timer_notifications")
        .update({
          status: "claimed",
          attempts: timer.attempts + 1,
          claimed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", timer.id)
        .eq("status", "scheduled")
        .select("id,user_id,timer_key,ends_at,attempts")
        .maybeSingle();
      if (claimError) throw new Error(`Could not claim rest timer: ${claimError.message}`);
      if (!claimed) {
        skipped += 1;
        continue;
      }

      try {
        accessToken ??= await googleAccessToken();
        const result = await sendTimerPushes(admin, claimed as TimerRow, accessToken, projectId);
        sent += result.sent;
        failed += result.failed;
        if (result.invalidTokens.length) {
          await admin.from("push_tokens").delete().in("token", result.invalidTokens);
        }
        const delivered = result.sent > 0 || result.failed === 0;
        await admin
          .from("rest_timer_notifications")
          .update(
            delivered
              ? {
                  status: "delivered",
                  delivered_at: new Date().toISOString(),
                  last_error: null,
                  updated_at: new Date().toISOString(),
                }
              : {
                  status: claimed.attempts >= MAX_ATTEMPTS ? "failed" : "scheduled",
                  last_error: "FCM did not accept the rest-timer push.",
                  claimed_at: null,
                  updated_at: new Date().toISOString(),
                },
          )
          .eq("id", claimed.id);
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Unknown push failure.";
        await admin
          .from("rest_timer_notifications")
          .update({
            status: claimed.attempts >= MAX_ATTEMPTS ? "failed" : "scheduled",
            last_error: detail.slice(0, 1_000),
            claimed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", claimed.id);
        failed += 1;
      }
    }
    return jsonResponse({ processed: dueTimers?.length ?? 0, sent, failed, skipped });
  } catch (error) {
    console.error("[dispatch-rest-timer-notifications]", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Dispatch failed." },
      500,
    );
  }
});
