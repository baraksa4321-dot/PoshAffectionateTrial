import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PushRequest = {
  recipientUserId?: string;
  audience?: "assigned_clients" | "coaches" | "clients" | "everyone";
  title: string;
  body: string;
  data?: Record<string, string>;
  deepLink?: string;
};

class RequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function base64Url(value: ArrayBuffer | string) {
  const bytes =
    typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function privateKeyBytes(rawValue: string) {
  let pem = rawValue.trim();
  if (
    (pem.startsWith('"') && pem.endsWith('"')) ||
    (pem.startsWith("'") && pem.endsWith("'"))
  ) {
    pem = pem.slice(1, -1);
  }
  pem = pem
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\r\n?/g, "\n")
    .trim();

  const match = pem.match(
    /-----BEGIN ([A-Z0-9 ]*PRIVATE KEY)-----([\s\S]*?)-----END \1-----/,
  );
  if (!match || match[1] !== "PRIVATE KEY") {
    throw new Error("Firebase private key must be a PKCS#8 PEM.");
  }

  const encoded = match[2].replace(/\s/g, "");
  if (!encoded) throw new Error("Firebase private key is empty.");
  try {
    const binary = atob(encoded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    throw new Error("Firebase private key PEM is not valid base64.");
  }
}

async function googleAccessToken() {
  const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL")?.trim();
  const privateKey = Deno.env.get("FIREBASE_PRIVATE_KEY");
  if (!clientEmail || !privateKey?.trim()) {
    throw new Error("Firebase server credentials are missing.");
  }
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
  const signingInput = `${header}.${claim}`;
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
    new TextEncoder().encode(signingInput),
  );
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${signingInput}.${base64Url(signature)}`,
    }),
  });
  if (!response.ok) throw new Error(`Firebase OAuth failed: ${await response.text()}`);
  const payload = await response.json();
  if (typeof payload.access_token !== "string" || !payload.access_token) {
    throw new Error("Firebase OAuth response did not include an access token.");
  }
  return payload.access_token;
}

async function recipientIds(
  admin: ReturnType<typeof createClient>,
  callerId: string,
  request: PushRequest,
) {
  if (request.recipientUserId) return [request.recipientUserId];
  if (!request.audience) return [];
  if (request.audience === "assigned_clients") {
    const { data, error } = await admin
      .from("coach_clients")
      .select("client_id")
      .eq("coach_id", callerId);
    if (error) throw new Error(`Could not resolve assigned trainees: ${error.message}`);
    return (data ?? []).map((row) => row.client_id as string);
  }
  const role = request.audience === "coaches" ? "coach" : request.audience === "clients" ? "client" : null;
  const query = admin.from("profiles").select("id");
  const { data, error } = role ? await query.eq("role", role) : await query;
  if (error) throw new Error(`Could not resolve notification audience: ${error.message}`);
  return (data ?? []).map((row) => row.id as string).filter((id) => id !== callerId);
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
    if (!authorization) throw new RequestError("Authentication is required.", 401);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData.user) throw new RequestError("Authentication is required.", 401);

    const requestBody = (await request.json()) as PushRequest;
    if (
      !requestBody ||
      typeof requestBody.title !== "string" ||
      typeof requestBody.body !== "string" ||
      !requestBody.title.trim() ||
      !requestBody.body.trim() ||
      requestBody.title.length > 200 ||
      requestBody.body.length > 2_000
    ) {
      throw new RequestError("Notification title and body are required and must be short.", 400);
    }
    if (requestBody.recipientUserId && requestBody.audience) {
      throw new RequestError("Choose one notification recipient or audience.", 400);
    }
    if (requestBody.data !== undefined) {
      if (
        !requestBody.data ||
        typeof requestBody.data !== "object" ||
        Array.isArray(requestBody.data)
      ) {
        throw new RequestError("Notification data must contain short string values.", 400);
      }
      const entries = Object.entries(requestBody.data);
      if (
        entries.length > 32 ||
        entries.some(
          ([key, value]) =>
            !/^[a-zA-Z0-9_.-]{1,100}$/.test(key) ||
            typeof value !== "string" ||
            value.length > 1_000,
        )
      ) {
        throw new RequestError("Notification data must contain short string values.", 400);
      }
    }
    const audiences = ["assigned_clients", "coaches", "clients", "everyone"] as const;
    if (requestBody.audience && !audiences.includes(requestBody.audience)) {
      throw new RequestError("The notification audience is not supported.", 400);
    }
    if (
      requestBody.deepLink !== undefined &&
      (typeof requestBody.deepLink !== "string" ||
        requestBody.deepLink.length > 500 ||
        !requestBody.deepLink.startsWith("/"))
    ) {
      throw new RequestError("The notification deep link must be an internal path.", 400);
    }
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: sender, error: senderError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (senderError) throw new Error(`Could not verify sender role: ${senderError.message}`);
    if (sender?.role !== "coach" && sender?.role !== "owner") {
      throw new RequestError("Only staff can send notifications.", 403);
    }
    if (
      sender.role === "coach" &&
      requestBody.audience !== undefined &&
      requestBody.audience !== "assigned_clients"
    ) {
      throw new RequestError(
        "Coaches can only send notifications to their assigned trainees.",
        403,
      );
    }
    if (requestBody.recipientUserId && sender.role === "coach") {
      const { data: assignment } = await admin
        .from("coach_clients")
        .select("client_id")
        .eq("coach_id", authData.user.id)
        .eq("client_id", requestBody.recipientUserId)
        .maybeSingle();
      if (!assignment) throw new RequestError("The coach is not assigned to this trainee.", 403);
    }
    const ids = await recipientIds(admin, authData.user.id, requestBody);
    if (!ids.length) return jsonResponse({ sent: 0 });
    const { data: tokens, error: tokenError } = await admin
      .from("push_tokens")
      .select("token")
      .in("user_id", ids);
    if (tokenError) throw new Error(`Could not load notification devices: ${tokenError.message}`);
    if (!tokens?.length) {
      return jsonResponse({ sent: 0 });
    }
    const accessToken = await googleAccessToken();
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID")?.trim();
    if (!projectId) throw new Error("Firebase project id is missing.");
    let sent = 0;
    let failed = 0;
    const invalidTokens: string[] = [];
    for (const tokenRow of tokens ?? []) {
      try {
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
                notification: { title: requestBody.title, body: requestBody.body },
                  data: {
                    ...(requestBody.data ?? {}),
                    source: "gymtrack",
                    ...(requestBody.deepLink ? { deep_link: requestBody.deepLink } : {}),
                  },
              },
            }),
          },
        );
        if (response.ok) {
          sent += 1;
        } else {
          failed += 1;
          const responseBody = await response.text();
          try {
            const parsed = JSON.parse(responseBody) as {
              error?: { status?: string; details?: Array<{ errorCode?: string }> };
            };
            const isUnregistered =
              parsed.error?.status === "NOT_FOUND" ||
              parsed.error?.details?.some((detail) => detail.errorCode === "UNREGISTERED") ||
              responseBody.includes("UNREGISTERED");
            if (isUnregistered) invalidTokens.push(tokenRow.token);
          } catch {
            // Keep the token when FCM returns a non-JSON error; it may be transient.
          }
        }
      } catch (error) {
        failed += 1;
        console.warn(
          "[FCM delivery] Could not send to one device:",
          error instanceof Error ? error.message : "unknown delivery error",
        );
      }
    }
    if (invalidTokens.length) {
      const { error: cleanupError } = await admin
        .from("push_tokens")
        .delete()
        .in("token", invalidTokens);
      if (cleanupError) console.warn("Could not remove invalid FCM tokens:", cleanupError.message);
    }
    return jsonResponse({ sent, failed });
  } catch (error) {
    if (error instanceof RequestError) return jsonResponse({ error: error.message }, error.status);
    console.error("[send-fcm-notification]", error);
    return jsonResponse({ error: "Push delivery failed." }, 502);
  }
});
