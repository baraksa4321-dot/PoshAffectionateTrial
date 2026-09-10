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
};

function base64Url(value: ArrayBuffer | string) {
  const bytes =
    typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function privateKeyBytes(pem: string) {
  const clean = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const binary = atob(clean);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function googleAccessToken() {
  const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL");
  const privateKey = Deno.env.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Firebase server credentials are missing.");
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
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${signingInput}.${base64Url(signature)}`,
  });
  if (!response.ok) throw new Error(`Firebase OAuth failed: ${await response.text()}`);
  const payload = await response.json();
  return String(payload.access_token);
}

async function recipientIds(
  admin: ReturnType<typeof createClient>,
  callerId: string,
  request: PushRequest,
) {
  if (request.recipientUserId) return [request.recipientUserId];
  if (!request.audience) return [];
  if (request.audience === "assigned_clients") {
    const { data } = await admin.from("coach_clients").select("client_id").eq("coach_id", callerId);
    return (data ?? []).map((row) => row.client_id as string);
  }
  const role = request.audience === "coaches" ? "coach" : request.audience === "clients" ? "client" : null;
  const query = admin.from("profiles").select("id");
  const { data } = role ? await query.eq("role", role) : await query;
  return (data ?? []).map((row) => row.id as string).filter((id) => id !== callerId);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authorization = request.headers.get("authorization");
    if (!authorization) throw new Error("Authentication is required.");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData.user) throw new Error("Authentication is required.");

    const requestBody = (await request.json()) as PushRequest;
    if (!requestBody.title?.trim() || !requestBody.body?.trim()) {
      throw new Error("Notification title and body are required.");
    }
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: sender } = await admin.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
    if (sender?.role !== "coach" && sender?.role !== "owner") throw new Error("Only staff can send notifications.");
    if (requestBody.recipientUserId && sender.role === "coach") {
      const { data: assignment } = await admin
        .from("coach_clients")
        .select("client_id")
        .eq("coach_id", authData.user.id)
        .eq("client_id", requestBody.recipientUserId)
        .maybeSingle();
      if (!assignment) throw new Error("The coach is not assigned to this trainee.");
    }
    const ids = await recipientIds(admin, authData.user.id, requestBody);
    if (!ids.length) return new Response(JSON.stringify({ sent: 0 }), { headers: { ...corsHeaders, "content-type": "application/json" } });
    const { data: tokens } = await admin.from("push_tokens").select("token").in("user_id", ids);
    if (!tokens?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }
    const accessToken = await googleAccessToken();
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
    if (!projectId) throw new Error("Firebase project id is missing.");
    let sent = 0;
    const invalidTokens: string[] = [];
    for (const tokenRow of tokens ?? []) {
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
              data: { source: "gymtrack" },
            },
          }),
        },
      );
      if (response.ok) {
        sent += 1;
      } else {
        const responseBody = await response.text();
        try {
          const parsed = JSON.parse(responseBody) as {
            error?: { status?: string; details?: Array<{ errorCode?: string }> };
          };
          const isUnregistered =
            parsed.error?.status === "NOT_FOUND" ||
            parsed.error?.details?.some((detail) => detail.errorCode === "UNREGISTERED");
          if (isUnregistered) invalidTokens.push(tokenRow.token);
        } catch {
          // Keep the token when FCM returns a non-JSON error; it may be transient.
        }
      }
    }
    if (invalidTokens.length) {
      const { error: cleanupError } = await admin
        .from("push_tokens")
        .delete()
        .in("token", invalidTokens);
      if (cleanupError) console.warn("Could not remove invalid FCM tokens:", cleanupError.message);
    }
    return new Response(JSON.stringify({ sent }), { headers: { ...corsHeaders, "content-type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Push failed" }), {
      status: 400,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});