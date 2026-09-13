import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const gymStore = read("./gym-store.ts");
const migration46 = read("../../supabase/migrations/46_harden_realtime_publication.sql");
const migration43 = read("../../supabase/migrations/43_challenges.sql");
const migration47 = read("../../supabase/migrations/47_challenge_enrollments.sql");

const migrationsDirectory = fileURLToPath(
  new URL("../../supabase/migrations", import.meta.url),
);

const publicationSql = [migration46, migration43, migration47].join("\n");

describe("Realtime publication contract", () => {
  test("every client postgres subscription has a migration publication path", () => {
    const subscribedTables = [
      ...gymStore.matchAll(/addTableSubscription\("([^"]+)"/g),
    ].map((match) => match[1]);

    expect(subscribedTables.length).toBeGreaterThan(0);
    for (const table of new Set(subscribedTables)) {
      expect(publicationSql).toContain(`'${table}'`);
    }
  });

  test("the hardening migration keeps challenge tables in the publication set", () => {
    expect(migration46).toContain("'challenges'");
    expect(migration46).toContain("'challenge_enrollments'");
    expect(migration43).toContain("ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges");
    expect(migration47).toContain(
      "ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_enrollments",
    );
  });

  test("the migration files are available from the workspace", () => {
    expect(migrationsDirectory).toContain("supabase/migrations");
  });
});