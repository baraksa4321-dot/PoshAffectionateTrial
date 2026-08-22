import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Copy, Dumbbell, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmSheet } from "@/components/ui-app/ConfirmSheet";
import {
  EmptyState,
  IconButton,
  Pill,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/components/ui-app/primitives";
import { createProgram, deleteProgram, duplicateProgram, useGym } from "@/lib/gym-store";

export const Route = createFileRoute("/programs/")({
  head: () => ({ meta: [{ title: "תוכניות אימון — הרוטינה שלי" }] }),
  component: ProgramsPage,
});

function ProgramsPage() {
  const { programs, workouts, userProfile } = useGym();
  const navigate = useNavigate();
  const role = userProfile?.role || "client";
  const isCoach = role === "coach" || role === "owner";
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const submit = () => {
    const value = name.trim();
    if (!value) return;
    const program = createProgram(value);
    setName("");
    setAdding(false);
    navigate({ to: "/programs/$programId", params: { programId: program.id } });
  };

  return (
    <AppShell
      kicker="תוכניות"
      title="תוכניות אימון"
      subtitle="בני תכניות שמתאימות בדיוק למטרות שלך"
      action={
        isCoach ? (
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
      {/* Hero card */}
      <section className="ink-card-soft relative overflow-hidden p-5 sm:p-6">
        <div className="relative z-10 max-w-sm text-start">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2.2} />
            <p className="text-[10.5px] font-bold tracking-[0.16em] text-primary uppercase">
              מרחב האימונים שלך
            </p>
          </div>
          <h2 className="mt-2 font-display text-[1.5rem] font-bold leading-[1.15] text-ink">
            הפכי כל אימון לפשוט וזמין לביצוע.
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
            בני תוכניות עבודה שמותאמות בדיוק לצרכים שלך — מסקוואטים ועד ימי אימון קצרים.
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-12 -end-10 h-44 w-44 rounded-full bg-sage-soft/60 blur-2xl" />
      </section>

      {/* Add new program input */}
      {adding ? (
        <div className="surface-card mt-4 p-4 text-start">
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
              צרי תכנית
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
      <section className="mt-6">
        <SectionHeader title="התוכניות שלך" subtitle={`${programs.length} תוכניות פעילות`} />

        {programs.length > 0 ? (
          <div className="space-y-3">
            {programs.map((program) => {
              const daysCount = program.dayIds.length;
              const exerciseCount = program.dayIds.reduce((sum, id) => {
                const w = workouts.find((workout) => workout.id === id);
                return sum + (w?.items.length ?? 0);
              }, 0);
              return (
                <article key={program.id} className="surface-card press p-4">
                  <div className="flex items-start gap-3.5">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage-soft text-primary">
                      <Calendar className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      <Link
                        to="/programs/$programId"
                        params={{ programId: program.id }}
                        className="block"
                      >
                        <p className="truncate font-display text-[16px] font-bold text-ink">
                          {program.name}
                        </p>
                        <p className="mt-0.5 text-[12.5px] font-medium text-muted-foreground">
                          {daysCount} ימי אימון · {exerciseCount} תרגילים
                        </p>
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
                  {program.notes ? (
                    <p className="mt-3 line-clamp-2 text-start text-[12.5px] leading-relaxed text-muted-foreground">
                      {program.notes}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Dumbbell}
            title="צרי קצב אימונים קבוע"
            description="הוסיפי תכנית ראשונה ובני ימי אימון שמתאימים לשגרה שלך."
            action={
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="press inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[13.5px] font-bold text-primary-foreground shadow-sm"
              >
                <Plus className="h-4 w-4" strokeWidth={2.4} />
                יצירת תכנית אימונים
              </button>
            }
          />
        )}
      </section>

      {programs.length > 0 ? (
        <div className="mt-6">
          <div className="ink-card-soft flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/70">
              <Pill className="bg-transparent">💡</Pill>
            </div>
            <p className="text-start text-[12.5px] leading-relaxed text-muted-foreground">
              רוצה להתחיל מהר? שכפלי תכנית קיימת והתאימי אותה לשבוע הבא.
            </p>
          </div>
        </div>
      ) : null}

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
