import { readFile } from "node:fs/promises";
import { expect, test } from "bun:test";

const migration = await readFile(
  new URL("../../supabase/migrations/61_rest_timer_notifications.sql", import.meta.url),
  "utf8",
);
const dispatcher = await readFile(
  new URL("../../supabase/functions/dispatch-rest-timer-notifications/index.ts", import.meta.url),
  "utf8",
);
const serviceWorker = await readFile(new URL("../../public/sw.js", import.meta.url), "utf8");

test("rest timer queue is owner-scoped and idempotent", () => {
  expect(migration).toContain("UNIQUE (user_id, timer_key)");
  expect(migration).toContain("SECURITY DEFINER");
  expect(migration).toContain("ON CONFLICT (user_id, timer_key) DO UPDATE");
  expect(migration).toContain("status IN ('scheduled', 'claimed')");
});

test("dispatcher claims due timers and uses a stable message identity", () => {
  expect(dispatcher).toContain('.eq("status", "scheduled")');
  expect(dispatcher).toContain('.eq("status", "scheduled")');
  expect(dispatcher).toContain("rest-timer:${timer.id}");
  expect(dispatcher).toContain("MAX_ATTEMPTS = 3");
  expect(dispatcher).toContain('.eq("platform", "web")');
});

test("service worker persists push identities and keeps system sound enabled", () => {
  expect(serviceWorker).toContain('"seen-pushes"');
  expect(serviceWorker).toContain("wasPushSeen(payload.messageId)");
  expect(serviceWorker).toContain('typeof data.messageId === "string"');
  expect(serviceWorker).toContain("silent: false");
});
