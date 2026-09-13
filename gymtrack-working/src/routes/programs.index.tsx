import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Dumbbell,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CardioTracker } from "@/components/CardioTracker";
import { ChallengeLibrary } from "@/components/ChallengeLibrary";
import { ConfirmSheet } from "@/components/ui-app/ConfirmSheet";
import {
  EmptyState,
  IconButton,
  PrimaryButton,
  SectionHeader,
  SecondaryButton,
} from "@/components/ui-app/primitives";
import { createProgram, deleteProgram, duplicateProgram, useGym } from "@/lib/gym-store";
import { genderText } from "@/lib/gender-copy";
import { visibleProgramNote } from "@/lib/gym-types";

export const Route = createFileRoute("/programs/")({
  head: () => ({ meta: [{ title: "תוכניות אימון — MY routine" }] }),
  component: ProgramsPage,
});

function ProgramsPage() {
  const { programs, workouts, history, userProfile } = useGym();
  const navigate = useNavigate();
  const role = userProfile?.role;
  const gender = userProfile?.gender;
  const isOwner = role === "owner";
  const isCoach = role === "coach" || role === "owner";
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  if (role === undefined) {
    return (
      <AppShell title="תוכניות" kicker="בודקת הרשאות">
        <div className="surface-card mt-4 p-5 text-center text-sm text-muted-foreground">
          טוענת את סביבת העבודה...
        </div>
      </AppShell>
    );
  }
  if (!isCoach) return <Navigate to="/workouts" replace />;

  const submit = () => {
    const value = name.trim();
    if (!value || !isOwner) return;
    const program = createProgram(value);
    setName("");
    setAdding(false);
    void navigate({ to: "/programs/$programId", params: { programId: program.id } });
  };

  return (
    <AppShell
      kicker="תוכניות"
      title=""
      subtitle=""
      action={
        isOwner ? (
          <IconButton
            variant="primary"
            aria-label="תכנית חדשה"
            onClick={() => setAdding((value) => !value)}
          >
            <Plus className="h-5 w-5" strokeWidth={2.4} />
          </IconButton>
        ) : undefined
      }
    >
      {adding && isOwner ? (
        <div className="surface-card mt-3 p-3.5 text-start">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              תכנית חדשה
            </p>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setName("");
              }}
              aria-label="סגור"
              className="press grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
            placeholder="למשל: תכנית חיטוב 4 ימים"
            className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary px-4 py-3.5 text-base outline-none placeholder:text-muted-foreground/80 focus:border-primary"
          />
          <div className="mt-3 flex gap-2">
            <PrimaryButton onClick={submit} disabled={!name.trim()}>
              {genderText(gender, "צרי תכנית", "צור תכנית")}
            </PrimaryButton>
            <SecondaryButton
              onClick={() => {
                setAdding(false);
                setName("");
              }}
            >
              ביטול
            </SecondaryButton>
          </div>
        </div>
      ) : null}

      {/* Programs list */}
      <section className="mt-4">
        <SectionHeader
          title="התוכניות שלך"
          subtitle={`${programs.length} תוכניות פעילות`}
            action={
              <div className="flex items-center gap-1.5">
                <ChallengeLibrary compact />
                <CardioTracker />
              </div>
            }
        />

        {programs.length > 0 ? (
          <div className="space-y-2">
            {programs.map((program) => {
              const daysCount = program.dayIds.length;
              const exerciseCount = program.dayIds.reduce((sum, id) => {
                const w = workouts.find((workout) => workout.id === id);
                return sum + (w?.items.length ?? 0);
              }, 0);
              const completedDays = program.dayIds.filter((dayId) =>
                history.some((session) => session.workoutId === dayId),
              ).length;
              const programNote = visibleProgramNote(program.notes);
              return (
                <article key={program.id} className="surface-card press p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sage-soft text-primary">
                      <Calendar className="h-5 w-5" strokeWidth={2} />
                      {completedDays > 0 ? (
                        <span
                          className="absolute -end-1 -top-1 grid h-5 w-5 place-items-center rounded-full border-2 border-background bg-emerald-600 text-white"
                          title={
                            completedDays === daysCount
                              ? "כל ימי האימון בוצעו"
                              : `${completedDays} ימי אימון בוצעו`
                          }
                          aria-label={
                            completedDays === daysCount
                              ? "כל ימי האימון בוצעו"
                              : `${completedDays} ימי אימון בוצעו`
                          }
                        >
                          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      <Link
                        to="/programs/$programId"
                        params={{ programId: program.id }}
                        className="block"
                      >
                        <p className="break-words font-display text-[15px] leading-snug font-bold text-ink">
                          {program.name}
                        </p>
                        <p className="mt-0.5 text-[12.5px] font-medium text-muted-foreground">
                          {daysCount} ימי אימון · {exerciseCount} תרגילים
                        </p>
                         {completedDays > 0 ? (
                           <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                             <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                             {completedDays === daysCount
                               ? "כל האימונים בוצעו"
                               : `${completedDays} ${
                                   completedDays === 1 ? "אימון" : "אימונים"
                                 } בוצע${completedDays === 1 ? "" : "ו"}`}
                           </p>
                         ) : null}
                      </Link>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {isCoach && (
                        <>
                          <button
                            type="button"
                            onClick={() => duplicateProgram(program.id)}
                            aria-label={`שכפל ${program.name}`}
                            className="press grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-primary"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete({ id: program.id, name: program.name })}
                            aria-label={`מחק את ${program.name}`}
                            className="press grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <Link
                        to="/programs/$programId"
                        params={{ programId: program.id }}
                        aria-label="פתח תכנית"
                        className="press grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  {programNote ? (
                    <p className="mt-3 line-clamp-2 text-start text-[12.5px] leading-relaxed text-muted-foreground">
                      {programNote}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Dumbbell}
            title={genderText(gender, "צרי קצב אימונים קבוע", "צור קצב אימונים קבוע")}
            description={genderText(
              gender,
              isOwner
                ? "הוסיפי תכנית ראשונה ובני ימי אימון שמתאימים לשגרה שלך."
                : "התוכניות והאימונים שלך יופיעו כאן לאחר שהמאמן יוסיף אותם.",
              isOwner
                ? "הוסף תכנית ראשונה ובנה ימי אימון שמתאימים לשגרה שלך."
                : "התוכניות והאימונים שלך יופיעו כאן לאחר שהמאמן יוסיף אותם.",
            )}
            action={
              isOwner ? (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="press inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[13.5px] font-bold text-primary-foreground shadow-sm"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.4} />
                  יצירת תכנית אימונים
                </button>
              ) : undefined
            }
          />
        )}
      </section>

      <ConfirmSheet
        open={pendingDelete !== null}
        title="למחוק את התכנית?"
        description={
          pendingDelete
            ? `הפעולה תמחק את "${pendingDelete.name}" יחד עם כל ימי האימון והתרגילים שבה. לא ניתן לשחזר.`
            : undefined
        }
        confirmLabel="מחק תכנית"
        cancelLabel="חזרה"
        destructive
        onConfirm={() => {
          if (pendingDelete) deleteProgram(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </AppShell>
  );
}
