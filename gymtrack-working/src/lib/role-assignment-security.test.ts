import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

type Role = "owner" | "coach" | "client";
type Profile = {
  id: string;
  role: Role;
  approvalStatus: "pending" | "approved";
  coachId: string | null;
};
type Link = { coachId: string; clientId: string };

const ownerId = "owner";
const coachAId = "coach-a";
const coachBId = "coach-b";
const clientAId = "client-a";
const clientBId = "client-b";
const clientCId = "client-c";

function profile(
  id: string,
  role: Role,
  coachId: string | null = null,
  approvalStatus: Profile["approvalStatus"] = "approved",
): Profile {
  return { id, role, coachId, approvalStatus };
}

/**
 * A disposable in-memory dataset for the same invariants enforced by the
 * SECURITY DEFINER RPCs. Keeping it local makes the permission suite safe to
 * run in CI without credentials or writes to a shared Supabase project.
 */
class DisposableRoleDataset {
  readonly profiles = new Map<string, Profile>([
    [ownerId, profile(ownerId, "owner")],
    [coachAId, profile(coachAId, "coach")],
    [coachBId, profile(coachBId, "coach")],
    [clientAId, profile(clientAId, "client", coachAId)],
    [clientBId, profile(clientBId, "client", coachBId)],
    [clientCId, profile(clientCId, "client", null)],
  ]);
  links: Link[] = [
    { coachId: coachAId, clientId: clientAId },
    { coachId: coachBId, clientId: clientBId },
    // Deliberately stale rows exercise both sides of role-transition cleanup.
    { coachId: coachAId, clientId: clientBId },
    { coachId: coachBId, clientId: clientAId },
  ];
  actorId = ownerId;

  as(actorId: string): this {
    this.actorId = actorId;
    return this;
  }

  private actor(): Profile {
    const actor = this.profiles.get(this.actorId);
    if (!actor) throw new Error("authenticated user was not found");
    return actor;
  }

  private requireOwner(): void {
    if (this.actor().role !== "owner")
      throw new Error("Access denied. Only the Owner may do this.");
  }

  private requireCoach(): void {
    if (!["coach", "owner"].includes(this.actor().role)) {
      throw new Error("Access denied. Only coaches may do this.");
    }
  }

  private isAssignedCoach(clientId: string): boolean {
    const actor = this.actor();
    return (
      ["coach", "owner"].includes(actor.role) &&
      this.links.some(
        (link) =>
          link.coachId === actor.id &&
          link.clientId === clientId &&
          this.profiles.get(clientId)?.role === "client" &&
          this.profiles.get(clientId)?.approvalStatus === "approved",
      )
    );
  }

  changeUserRole(targetId: string, newRole: Exclude<Role, "owner">): void {
    this.requireOwner();
    const target = this.profiles.get(targetId);
    if (!target || target.role === "owner") throw new Error("The selected user cannot be changed.");

    for (const candidate of this.profiles.values()) {
      if (candidate.id === targetId || candidate.coachId === targetId) candidate.coachId = null;
    }
    this.links = this.links.filter(
      (link) => link.coachId !== targetId && link.clientId !== targetId,
    );
    target.role = newRole;
  }

  assignClientToCoach(clientId: string, coachId: string): void {
    this.requireOwner();
    const coach = this.profiles.get(coachId);
    const client = this.profiles.get(clientId);
    if (!coach || !["coach", "owner"].includes(coach.role)) {
      throw new Error("The selected user cannot be assigned as a coach.");
    }
    if (!client || client.role !== "client" || client.approvalStatus !== "approved") {
      throw new Error("The selected user is not an approved client.");
    }

    this.links = this.links.filter((link) => link.clientId !== clientId);
    this.links.push({ coachId, clientId });
    client.coachId = coachId;
  }

  linkClientToCurrentCoach(clientId: string): void {
    this.requireCoach();
    const client = this.profiles.get(clientId);
    if (!client || client.role !== "client" || client.approvalStatus !== "approved") {
      throw new Error("The selected user is not an approved client.");
    }
    if (this.links.some((link) => link.clientId === clientId && link.coachId !== this.actorId)) {
      throw new Error("The client is already assigned to another coach.");
    }

    this.links = this.links.filter(
      (link) => !(link.coachId === this.actorId && link.clientId === clientId),
    );
    this.links.push({ coachId: this.actorId, clientId });
    client.coachId = this.actorId;
  }

  directProfileAssignmentWrite(targetId: string, patch: Pick<Profile, "role" | "coachId">): void {
    if (
      this.actor().role !== "owner" &&
      (patch.role !== undefined || patch.coachId !== undefined)
    ) {
      throw new Error("Access denied: role and coach assignment changes are owner-only.");
    }
    const target = this.profiles.get(targetId);
    if (!target) throw new Error("The selected user was not found.");
    Object.assign(target, patch);
  }

  readClientData(clientId: string): Profile {
    if (
      this.actorId !== clientId &&
      this.actor().role !== "owner" &&
      !this.isAssignedCoach(clientId)
    ) {
      throw new Error("Access denied.");
    }
    const client = this.profiles.get(clientId);
    if (!client) throw new Error("The selected user was not found.");
    return { ...client };
  }
}

function normalizedFunctionBody(sql: string, functionName: string): string {
  const start = sql.indexOf(`FUNCTION public.${functionName}`);
  if (start < 0) throw new Error(`Missing function ${functionName}`);
  const end = sql.indexOf("$$;", start);
  return sql
    .slice(start, end < 0 ? undefined : end)
    .replace(/\s+/g, " ")
    .trim();
}

const migration27 = readFileSync(
  fileURLToPath(
    new URL("../../supabase/migrations/27_owner_coach_sync_hardening.sql", import.meta.url),
  ),
  "utf8",
);
const migration38 = readFileSync(
  fileURLToPath(
    new URL("../../supabase/migrations/38_owner_can_promote_users.sql", import.meta.url),
  ),
  "utf8",
);
const migration11 = readFileSync(
  fileURLToPath(
    new URL("../../supabase/migrations/11_role_and_rpc_hardening.sql", import.meta.url),
  ),
  "utf8",
);
const planBuilderPermissions = readFileSync(
  fileURLToPath(
    new URL("../../supabase/migrations/37_plan_builder_permissions.sql", import.meta.url),
  ),
  "utf8",
);

describe("role and assignment security on a disposable dataset", () => {
  test("an assigned coach can read the client, while an unassigned coach and client cannot cross-read", () => {
    const dataset = new DisposableRoleDataset();
    dataset.links = dataset.links.filter(
      (link) =>
        !(
          (link.coachId === coachAId && link.clientId === clientBId) ||
          (link.coachId === coachBId && link.clientId === clientAId)
        ),
    );

    expect(() => dataset.as(coachAId).readClientData(clientAId)).not.toThrow();
    expect(() => dataset.as(coachAId).readClientData(clientBId)).toThrow();
    expect(() => dataset.as(clientAId).readClientData(clientBId)).toThrow();
    expect(() => dataset.as(ownerId).readClientData(clientBId)).not.toThrow();
  });

  test("owner reassignment removes every old link and updates the reverse pointer", () => {
    const dataset = new DisposableRoleDataset();

    dataset.as(ownerId).assignClientToCoach(clientAId, coachBId);

    expect(dataset.profiles.get(clientAId)?.coachId).toBe(coachBId);
    expect(dataset.links.filter((link) => link.clientId === clientAId)).toEqual([
      { coachId: coachBId, clientId: clientAId },
    ]);
  });

  test("both role-transition directions remove incoming and outgoing stale links", () => {
    const coachToClient = new DisposableRoleDataset();
    coachToClient.profiles.get(coachAId)!.coachId = coachBId;
    coachToClient.profiles.set("dependent-client", profile("dependent-client", "client", coachAId));
    coachToClient.as(ownerId).changeUserRole(coachAId, "client");

    expect(coachToClient.profiles.get(coachAId)?.role).toBe("client");
    expect(coachToClient.profiles.get(coachAId)?.coachId).toBeNull();
    expect(coachToClient.profiles.get("dependent-client")?.coachId).toBeNull();
    expect(
      coachToClient.links.some((link) => link.coachId === coachAId || link.clientId === coachAId),
    ).toBe(false);

    const clientToCoach = new DisposableRoleDataset();
    clientToCoach.profiles.set(
      "dependent-client",
      profile("dependent-client", "client", clientBId),
    );
    clientToCoach.links.push({ coachId: clientBId, clientId: "dependent-client" });
    clientToCoach.as(ownerId).changeUserRole(clientBId, "coach");

    expect(clientToCoach.profiles.get(clientBId)?.role).toBe("coach");
    expect(clientToCoach.profiles.get(clientBId)?.coachId).toBeNull();
    expect(clientToCoach.profiles.get("dependent-client")?.coachId).toBeNull();
    expect(
      clientToCoach.links.some((link) => link.coachId === clientBId || link.clientId === clientBId),
    ).toBe(false);
  });

  test("trainees and coaches cannot use owner-only RPCs or write assignment fields directly", () => {
    const dataset = new DisposableRoleDataset();

    expect(() => dataset.as(ownerId).changeUserRole(ownerId, "client")).toThrow(
      "cannot be changed",
    );
    expect(() => dataset.as(clientAId).assignClientToCoach(clientCId, coachBId)).toThrow(
      "Only the Owner",
    );
    expect(() => dataset.as(coachAId).changeUserRole(clientBId, "client")).toThrow(
      "Only the Owner",
    );
    expect(() => dataset.as(clientAId).linkClientToCurrentCoach(clientCId)).toThrow("Only coaches");
    expect(() =>
      dataset.as(clientAId).directProfileAssignmentWrite(clientAId, {
        role: "coach",
        coachId: coachAId,
      }),
    ).toThrow("owner-only");
    expect(() =>
      dataset.as(coachAId).directProfileAssignmentWrite(clientBId, {
        role: "coach",
        coachId: coachAId,
      }),
    ).toThrow("owner-only");
  });

  test("coach linking requires an approved client and rejects another coach's assignment", () => {
    const dataset = new DisposableRoleDataset();
    dataset.profiles.set("pending-client", profile("pending-client", "client", null, "pending"));

    expect(() => dataset.as(coachAId).linkClientToCurrentCoach("pending-client")).toThrow(
      "approved client",
    );
    expect(() => dataset.as(coachAId).linkClientToCurrentCoach(clientBId)).toThrow("another coach");

    dataset.as(coachAId).linkClientToCurrentCoach(clientCId);
    expect(dataset.profiles.get(clientCId)?.coachId).toBe(coachAId);
    expect(dataset.links).toContainEqual({ coachId: coachAId, clientId: clientCId });
  });
});

describe("role and assignment SQL security contract", () => {
  test("latest role transitions require Owner, validate input, and clear both link directions", () => {
    const body = normalizedFunctionBody(migration38, "change_user_role");

    expect(body).toContain("IF NOT public.is_owner()");
    expect(body).toContain("target_user_id = auth.uid()");
    expect(body).toContain("new_role NOT IN ('owner', 'coach', 'client')");
    expect(body).toContain("WHERE id = target_user_id OR coach_id = target_user_id");
    expect(body).toContain("WHERE coach_id = target_user_id OR client_id = target_user_id");
    expect(body).toContain("SET role = new_role");
    expect(body).toContain("SECURITY DEFINER");
    expect(body).toContain("SET search_path = public, pg_temp");
  });

  test("assignment and coach-link RPCs validate roles, approval, and ownership", () => {
    const assignBody = normalizedFunctionBody(migration27, "assign_client_to_coach");
    const linkBody = normalizedFunctionBody(migration27, "link_client_to_current_coach");

    expect(assignBody).toContain("IF NOT public.is_owner()");
    expect(assignBody).toContain("role IN ('coach', 'owner')");
    expect(assignBody).toContain("role = 'client' AND approval_status = 'approved'");
    expect(assignBody).toContain(
      "DELETE FROM public.coach_clients WHERE client_id = target_client_id",
    );
    expect(assignBody).toContain("SET coach_id = new_coach_id");

    expect(linkBody).toContain("IF NOT public.is_current_user_coach()");
    expect(linkBody).toContain("role = 'client' AND approval_status = 'approved'");
    expect(linkBody).toContain("coach_id <> auth.uid()");
    expect(linkBody).toContain("INSERT INTO public.coach_clients");
    expect(linkBody).toContain("SET coach_id = auth.uid()");
  });

  test("direct profile role and assignment writes remain owner-only", () => {
    const triggerBody = normalizedFunctionBody(migration11, "prevent_role_self_update");

    expect(triggerBody).toContain("NEW.role IS DISTINCT FROM OLD.role");
    expect(triggerBody).toContain("NEW.coach_id IS DISTINCT FROM OLD.coach_id");
    expect(triggerBody).toContain("IF NOT public.is_owner()");
    expect(migration11).toContain(
      "REVOKE ALL ON FUNCTION public.change_user_role(UUID, TEXT) FROM PUBLIC",
    );
    expect(migration11).toContain(
      "GRANT EXECUTE ON FUNCTION public.change_user_role(UUID, TEXT) TO authenticated",
    );
  });

  test("owners can write plans while trainees can only read their own plans", () => {
    expect(planBuilderPermissions).toContain(
      'DROP POLICY IF EXISTS "Users can manage own programs" ON public.programs',
    );
    expect(planBuilderPermissions).toContain('CREATE POLICY "Clients can view own programs"');
    expect(planBuilderPermissions).toContain('CREATE POLICY "Owners can manage all programs"');
    expect(planBuilderPermissions).toContain(
      'DROP POLICY IF EXISTS "Users can manage own program days" ON public.program_days',
    );
    expect(planBuilderPermissions).toContain('CREATE POLICY "Clients can view own program days"');
    expect(planBuilderPermissions).toContain('CREATE POLICY "Owners can manage all program days"');
    expect(planBuilderPermissions).toContain(
      'DROP POLICY IF EXISTS "Owners can manage all nutrition" ON public.nutrition_days',
    );
    expect(planBuilderPermissions).toContain('CREATE POLICY "Owners can manage all nutrition"');
    expect(planBuilderPermissions).toContain("WITH CHECK (public.is_owner())");
  });
});
