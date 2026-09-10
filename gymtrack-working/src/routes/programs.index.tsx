import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Dumbbell,
  Music2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CardioTracker } from "@/components/CardioTracker";
import { ChallengeLibrary } from "@/components/ChallengeLibrary";
import { ConfirmSheet } from "@/components/ui-app/ConfirmSheet";
import { Overlay } from "@/components/ui-app/Overlay";
import {
  EmptyState,
  IconButton,
  PrimaryButton,
  SectionHeader,
  SecondaryButton,
} from "@/components/ui-app/primitives";
import { createProgram, deleteProgram, duplicateProgram, useGym } from "@/lib/gym-store";
import { genderText } from "@/lib/gender-copy";
import { BUILT_IN_MUSIC_GENRES, type BuiltInMusicGenre } from "@/lib/music-library";
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
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [selectedMusicGenre, setSelectedMusicGenre] = useState<BuiltInMusicGenre | null>(null);
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = useState("");

  const filteredMusicTracks = BUILT_IN_MUSIC_GENRES.flatMap((genre) =>
    genre.tracks.map((track) => ({ genre, track })),
  ).filter(({ genre, track }) => {
    const query = musicSearchQuery.trim().toLocaleLowerCase();
    if (!query) return true;
    return [genre.style, track.title, track.artist].some((value) =>
      value.toLocaleLowerCase().includes(query),
    );
  });

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
      <section className="mt-6">
        <SectionHeader
          title="התוכניות שלך"
          subtitle={`${programs.length} תוכניות פעילות`}
            action={
              <div className="flex items-center gap-1.5">
                <ChallengeLibrary compact />
                <button
                  type="button"
                  onClick={() => setShowPlaylistMenu(true)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 text-[10px] font-bold text-ink transition-colors hover:bg-primary/20"
                  aria-label="פתיחת פלייליסטים לפי אווירה"
                >
                  <Music2 className="h-3.5 w-3.5 text-primary" />
                  אווירה
                </button>
              </div>
            }
        />

        {programs.length > 0 ? (
          <div className="space-y-3">
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
                <article key={program.id} className="surface-card press p-4">
                  <div className="flex items-start gap-3.5">
                    <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage-soft text-primary">
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

      <CardioTracker />

      {showPlaylistMenu ? (
        <Overlay
          open={showPlaylistMenu}
          onClose={() => {
            setShowPlaylistMenu(false);
            setSelectedMusicGenre(null);
            setShowMusicSearch(false);
            setMusicSearchQuery("");
          }}
          ariaLabel="פלייליסטים לפי אווירה"
        >
          <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-4 text-start shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h2 className="font-display text-lg font-extrabold text-ink">מוזיקה לפי אווירה</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {genderText(
                    gender,
                    "בחרי ז׳אנר וקבלי רשימת השמעה מובנית לאימון.",
                    "בחר ז׳אנר וקבל רשימת השמעה מובנית לאימון.",
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPlaylistMenu(false);
                  setSelectedMusicGenre(null);
                  setShowMusicSearch(false);
                  setMusicSearchQuery("");
                }}
                aria-label="סגירת פלייליסטים"
                className="grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {showMusicSearch ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setShowMusicSearch(false);
                    setMusicSearchQuery("");
                  }}
                  className="mb-3 text-xs font-bold text-primary hover:underline"
                >
                  ← חזרה לז׳אנרים
                </button>
                <p className="mb-2 text-sm font-extrabold text-ink">מציאת מוזיקה</p>
                <input
                  autoFocus
                  value={musicSearchQuery}
                  onChange={(event) => setMusicSearchQuery(event.target.value)}
                  placeholder="שיר, אמן או ז׳אנר..."
                  aria-label="חיפוש מוזיקה"
                  className="mb-3 w-full rounded-2xl border border-border/60 bg-secondary px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-muted-foreground focus:border-primary"
                />
                <div className="grid max-h-[45vh] gap-2 overflow-y-auto pe-0.5">
                  {filteredMusicTracks.length > 0 ? (
                    filteredMusicTracks.map(({ genre, track }) => (
                      <button
                        key={`${genre.style}-${track.title}`}
                        type="button"
                        onClick={() => {
                          setSelectedMusicGenre(genre);
                          setShowMusicSearch(false);
                        }}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-primary/5 px-3 py-2.5 text-start transition-colors hover:bg-primary/10"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-ink">
                            {track.title}
                          </span>
                          <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                            {track.artist}
                          </span>
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold text-primary">
                          {genre.style}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="py-4 text-center text-xs font-semibold text-muted-foreground">
                      לא נמצאה מוזיקה מתאימה.
                    </p>
                  )}
                </div>
              </>
            ) : selectedMusicGenre ? (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedMusicGenre(null)}
                  className="mb-3 text-xs font-bold text-primary hover:underline"
                >
                  ← חזרה לז׳אנרים
                </button>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-ink">{selectedMusicGenre.style}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      רשימת השמעה מובנית · {selectedMusicGenre.tracks.length} שירים
                    </p>
                  </div>
                  <Music2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                </div>
                <div className="grid max-h-[45vh] gap-2 overflow-y-auto pe-0.5">
                  {selectedMusicGenre.tracks.map((track, index) => (
                    <div
                      key={`${selectedMusicGenre.style}-${track.title}`}
                      className="flex items-center gap-3 rounded-2xl bg-primary/5 px-3 py-2.5"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-[10px] font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-ink">
                          {track.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                          {track.artist}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold text-muted-foreground">בחירה לפי ז׳אנר</p>
                  <button
                    type="button"
                    onClick={() => setShowMusicSearch(true)}
                    aria-label="פתיחת מסך חיפוש מוזיקה"
                    title="מציאת מוזיקה"
                    className="grid h-8 w-8 place-items-center rounded-xl border border-border bg-background text-primary transition-colors hover:border-primary"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid max-h-[52vh] grid-cols-2 gap-2 overflow-y-auto pe-0.5">
                  {BUILT_IN_MUSIC_GENRES.map((genre) => (
                    <button
                      key={genre.style}
                      type="button"
                      onClick={() => setSelectedMusicGenre(genre)}
                      className={`rounded-2xl border border-transparent px-3 py-3 text-start text-xs font-bold transition-colors ${genre.className}`}
                    >
                      {genre.style}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </Overlay>
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
