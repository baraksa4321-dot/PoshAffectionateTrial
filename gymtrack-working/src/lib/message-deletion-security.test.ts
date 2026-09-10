import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

type Message = {
  id: string;
  coachId: string;
  clientId: string;
  message: string;
};

const coachId = "coach-a";
const assignedClientId = "client-a";
const unrelatedUserId = "client-b";

/**
 * Models the DELETE policy on public.coach_messages:
 * USING (client_id = auth.uid())
 *
 * A denied PostgREST delete is represented by no deleted rows, while the
 * original rows remain available to an authorized reader.
 */
class DisposableMessageDataset {
  messages: Message[] = [
    {
      id: "message-owned-by-assigned-client",
      coachId,
      clientId: assignedClientId,
      message: "הודעה למתאמן המשויך",
    },
    {
      id: "message-owned-by-unrelated-client",
      coachId,
      clientId: unrelatedUserId,
      message: "הודעה למתאמן אחר",
    },
  ];

  deleteAs(actorId: string, messageId: string): string[] {
    const deletedIds: string[] = [];
    this.messages = this.messages.filter((message) => {
      const canDelete = message.id === messageId && message.clientId === actorId;
      if (canDelete) deletedIds.push(message.id);
      return !canDelete;
    });
    return deletedIds;
  }
}

const migrationsDirectory = fileURLToPath(
  new URL("../../supabase/migrations", import.meta.url),
);
const messageDeletionMigration = readFileSync(
  `${migrationsDirectory}/23_message_deletion.sql`,
  "utf8",
);

describe("coach message deletion boundaries", () => {
  test("only the assigned trainee can delete the owned message", () => {
    const dataset = new DisposableMessageDataset();
    const originalMessages = structuredClone(dataset.messages);
    const targetMessageId = "message-owned-by-assigned-client";

    expect(dataset.deleteAs(coachId, targetMessageId)).toEqual([]);
    expect(dataset.messages).toEqual(originalMessages);

    expect(dataset.deleteAs(unrelatedUserId, targetMessageId)).toEqual([]);
    expect(dataset.messages).toEqual(originalMessages);

    expect(dataset.deleteAs(assignedClientId, targetMessageId)).toEqual([targetMessageId]);
    expect(dataset.messages).toEqual([
      {
        id: "message-owned-by-unrelated-client",
        coachId,
        clientId: unrelatedUserId,
        message: "הודעה למתאמן אחר",
      },
    ]);
  });
});

describe("coach message deletion SQL contract", () => {
  test("removes broad legacy policy variants before creating the recipient-only policy", () => {
    for (const policyName of [
      "Coaches can delete coach messages",
      "Public can delete coach messages",
      "Users can delete coach messages",
      "Clients can manage own coach messages",
    ]) {
      expect(messageDeletionMigration).toContain(
        `DROP POLICY IF EXISTS "${policyName}" ON public.coach_messages;`,
      );
    }

    expect(messageDeletionMigration).toContain(
      'CREATE POLICY "Recipients can delete coach messages"',
    );
    expect(messageDeletionMigration).toContain("USING (client_id = auth.uid())");
  });

  test("migration history declares no other coach_messages DELETE policy", () => {
    const deletePolicyDeclarations = readdirSync(migrationsDirectory)
      .filter((fileName) => fileName.endsWith(".sql"))
      .flatMap((fileName) => {
        const sql = readFileSync(`${migrationsDirectory}/${fileName}`, "utf8");
        const matches = [...sql.matchAll(/CREATE POLICY\s+"([^"]+)"\s+ON public\.coach_messages FOR DELETE/gi)];
        return matches.map((match) => ({ fileName, policyName: match[1] }));
      });

    expect(deletePolicyDeclarations).toEqual([
      {
        fileName: "23_message_deletion.sql",
        policyName: "Recipients can delete coach messages",
      },
    ]);
  });
});