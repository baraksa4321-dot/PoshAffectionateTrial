import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const tokenMigration = readFileSync(
  new URL("../../supabase/migrations/56_claim_push_token.sql", import.meta.url),
  "utf8",
);
const edgeFunction = readFileSync(
  new URL("../../supabase/functions/send-fcm-notification/index.ts", import.meta.url),
  "utf8",
);
const serviceWorker = readFileSync(
  new URL("../../public/sw.js", import.meta.url),
  "utf8",
);

describe("push deep-link security contract", () => {
  test("rejects protocol-relative deep links in the Edge Function", () => {
    expect(edgeFunction).toContain('requestBody.deepLink.startsWith("//")');
  });

  test("keeps Service Worker notification navigation same-origin", () => {
    expect(serviceWorker).toContain(
      'typeof deepLink === "string" && deepLink.startsWith("/") && !deepLink.startsWith("//")',
    );
    expect(serviceWorker).toContain("self.registration.scope");
  });

  test("claims rotated tokens only for the authenticated caller", () => {
    expect(tokenMigration).toContain("CREATE OR REPLACE FUNCTION public.claim_push_token");
    expect(tokenMigration).toContain("current_user_id UUID := auth.uid()");
    expect(tokenMigration).toContain("DELETE FROM public.push_tokens");
    expect(tokenMigration).toContain("GRANT EXECUTE ON FUNCTION public.claim_push_token(TEXT, TEXT) TO authenticated");
    expect(tokenMigration).toContain("REVOKE ALL ON FUNCTION public.claim_push_token(TEXT, TEXT) FROM anon");
  });
});