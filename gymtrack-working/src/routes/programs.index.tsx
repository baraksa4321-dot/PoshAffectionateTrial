import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Copy,
  Dumbbell,
  ExternalLink,
  Music2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmSheet } from "@/components/ui-app/ConfirmSheet";
import { Overlay } from "@/components/ui-app/Overlay";
import {
  EmptyState,
  IconButton,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/components/ui-app/primitives";
import { createProgram, deleteProgram, duplicateProgram, useGym } from "@/lib/gym-store";
import { genderText } from "@/lib/gender-copy";

export const Route = createFileRoute("/programs/")({
  head: () => ({ meta: [{ title: "תוכניות אימון — My Routine" }] }),
  component: ProgramsPage,
});

const EXPANDED_PLAYLIST_STYLES = [
  { style: "עברית רגועה", query: "מוזיקה עברית רגועה", className: "bg-[#fff0f5] text-[#a23b62] hover:bg-[#ffe2ec]" },
  { style: "עברית אקוסטית", query: "מוזיקה עברית אקוסטית", className: "bg-[#fff6e8] text-[#99621d] hover:bg-[#ffebc9]" },
  { style: "עברית נוסטלגית", query: "שירים ישראלים נוסטלגיים", className: "bg-[#f2efff] text-[#6552a4] hover:bg-[#e7e1ff]" },
  { style: "מזרחית רגועה", query: "מזרחית רגועה", className: "bg-[#fff4df] text-[#a25b00] hover:bg-[#ffeac2]" },
  { style: "מזרחית קצבית", query: "מזרחית קצבית", className: "bg-[#fff0dc] text-[#ad4e16] hover:bg-[#ffe0c0]" },
  { style: "פופ ישראלי", query: "פופ ישראלי", className: "bg-[#eaf2ff] text-[#245ca8] hover:bg-[#dce9ff]" },
  { style: "רוק ישראלי", query: "רוק ישראלי", className: "bg-[#f0f0f0] text-[#333] hover:bg-[#e4e4e4]" },
  { style: "טופ 2000", query: "Top 2000 hits", className: "bg-[#e8f7ed] text-[#137333] hover:bg-[#d4f0dc]" },
  { style: "שנות ה־80", query: "80s hits", className: "bg-[#f7edff] text-[#7a3e9d] hover:bg-[#eedcff]" },
  { style: "שנות ה־90", query: "90s hits", className: "bg-[#edf7ff] text-[#246386] hover:bg-[#dcefff]" },
  { style: "להיטי שנות ה־2000", query: "2000s hits", className: "bg-[#fff4df] text-[#8b5a10] hover:bg-[#ffeac2]" },
  { style: "פופ עולמי", query: "global pop hits", className: "bg-[#eaf2ff] text-[#245ca8] hover:bg-[#dce9ff]" },
  { style: "R&B", query: "R&B essentials", className: "bg-[#f5edff] text-[#7447a8] hover:bg-[#eae0ff]" },
  { style: "היפ הופ", query: "hip hop workout", className: "bg-[#f0f0f0] text-[#222] hover:bg-[#e4e4e4]" },
  { style: "EDM", query: "EDM workout", className: "bg-[#e9f8ff] text-[#16708f] hover:bg-[#d7f1fb]" },
  { style: "האוס", query: "house music", className: "bg-[#edfff7] text-[#21765a] hover:bg-[#d9f7e9]" },
  { style: "טכנו", query: "techno workout", className: "bg-[#ececf5] text-[#4c4c7a] hover:bg-[#dfdff0]" },
  { style: "Deep House", query: "deep house", className: "bg-[#eaf6f5] text-[#28766a] hover:bg-[#d8eeeb]" },
  { style: "רגאטון", query: "reggaeton hits", className: "bg-[#fff0e8] text-[#ae4d2e] hover:bg-[#ffe0d2]" },
  { style: "לטיני", query: "latin hits", className: "bg-[#fff8dd] text-[#947014] hover:bg-[#fff0b8]" },
  { style: "רוק קלאסי", query: "classic rock", className: "bg-[#f2f2f2] text-[#3b3b3b] hover:bg-[#e5e5e5]" },
  { style: "אינדי", query: "indie essentials", className: "bg-[#eef5ff] text-[#3f639b] hover:bg-[#e0ebff]" },
  { style: "Lo-fi", query: "lofi beats", className: "bg-[#f3f0ff] text-[#6855a0] hover:bg-[#e7e2ff]" },
  { style: "לימודים וריכוז", query: "music for focus", className: "bg-[#eef8f5] text-[#397568] hover:bg-[#dceee9]" },
  { style: "קלאסי", query: "classical essentials", className: "bg-[#faf4e8] text-[#806338] hover:bg-[#f2e8d4]" },
  { style: "מדיטציה", query: "meditation music", className: "bg-[#edf8f2] text-[#4c8061] hover:bg-[#dcefe3]" },
] as const;

const WORKOUT_PLAYLISTS = [
  {
    label: "Spotify · אימון",
    href: "https://open.spotify.com/playlist/37i9dQZF1DX70RN3TfWWJh",
    className: "bg-[#e8f7ed] text-[#137333] hover:bg-[#d4f0dc]",
  },
  {
    label: "Apple · אימון",
    href: "https://music.apple.com/gb/playlist/pure-workout/pl.ad0ee1557e3e4feba314fd70f7982766",
    className: "bg-[#fff0f2] text-[#c9364d] hover:bg-[#ffe1e6]",
  },
  {
    label: "Spotify · מזרחית",
    href: "https://open.spotify.com/playlist/0SCBGl0HGDRkgg8YQmtCF4",
    className: "bg-[#fff4df] text-[#a25b00] hover:bg-[#ffeac2]",
  },
  {
    label: "Apple · מזרחית",
    href: "https://music.apple.com/us/playlist/mizrahi/pl.b3dacbd3e4c64ddaaf4c882b35da8027",
    className: "bg-[#fff4df] text-[#a25b00] hover:bg-[#ffeac2]",
  },
  {
    label: "Spotify · Top ישראל",
    href: "https://open.spotify.com/playlist/37i9dQZEVXbJ5J1TrbkAF9",
    className: "bg-[#eaf2ff] text-[#245ca8] hover:bg-[#dce9ff]",
  },
  {
    label: "Apple · Top 100 ישראל",
    href: "https://music.apple.com/il/playlist/top-100-israel/pl.0c9765e5330048af96c2336fa7bc3525?l=he",
    className: "bg-[#eaf2ff] text-[#245ca8] hover:bg-[#dce9ff]",
  },
  {
    label: "Spotify · Taylor Swift",
    href: "https://open.spotify.com/playlist/37i9dQZF1DX5KpP2LN299J",
    className: "bg-[#f4edff] text-[#7047a8] hover:bg-[#eae0ff]",
  },
  {
    label: "Apple · Taylor Swift",
    href: "https://music.apple.com/us/playlist/taylor-swift-essentials/pl.3950454ced8c45a3b0cc693c2a7db97b",
    className: "bg-[#f4edff] text-[#7047a8] hover:bg-[#eae0ff]",
  },
  {
    label: "Spotify · ג׳אז",
    href: "https://open.spotify.com/playlist/37i9dQZF1DX0SM0LYsmbMT",
    className: "bg-[#eef6f4] text-[#28766a] hover:bg-[#dceeea]",
  },
  {
    label: "Apple · ג׳אז",
    href: "https://music.apple.com/us/playlist/jazz-in-spatial-audio/pl.efbd24628ff04ff3b5e416a6e237d753",
    className: "bg-[#eef6f4] text-[#28766a] hover:bg-[#dceeea]",
  },
  {
    label: "Spotify · גלגל״צ",
    href: "https://open.spotify.com/playlist/37i9dQZF1E4v4STfPGOGsm",
    className: "bg-[#f0f0f0] text-[#222] hover:bg-[#e4e4e4]",
  },
  {
    label: "Spotify · גלגל״צ LIVE",
    href: "https://open.spotify.com/playlist/2SXRvfqiMBXFkaMi03npLZ",
    className: "bg-[#f0f0f0] text-[#222] hover:bg-[#e4e4e4]",
  },
  {
    label: "Spotify · Top 50 ישראל",
    href: "https://open.spotify.com/playlist/37i9dQZEVXbJ6IpvItkve3",
    className: "bg-[#eaf2ff] text-[#245ca8] hover:bg-[#dce9ff]",
  },
  {
    label: "Spotify · חדש בישראל",
    href: "https://open.spotify.com/playlist/5kvO5S3mESUO2DwnGobnBt",
    className: "bg-[#eaf2ff] text-[#245ca8] hover:bg-[#dce9ff]",
  },
  {
    label: "Apple · להיטים ישראליים",
    href: "https://music.apple.com/ca/playlist/israeli-hits/pl.b4c77d8c6cc74426ad3d591307ba7e1a",
    className: "bg-[#eaf2ff] text-[#245ca8] hover:bg-[#dce9ff]",
  },
  {
    label: "Apple · אושר כהן",
    href: "https://music.apple.com/us/playlist/osher-cohen-essentials/pl.ca23dfc9c37346719d75f0909f80738a",
    className: "bg-[#fff4df] text-[#a25b00] hover:bg-[#ffeac2]",
  },
  {
    label: "Spotify · אושר כהן",
    href: "https://open.spotify.com/artist/2LUB7PhWK2j2obgSTeD3GN",
    className: "bg-[#fff4df] text-[#a25b00] hover:bg-[#ffeac2]",
  },
  ...EXPANDED_PLAYLIST_STYLES.flatMap(({ style, query, className }) => [
    {
      label: `Spotify · ${style}`,
      href: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
      className,
    },
    {
      label: `Apple Music · ${style}`,
      href: `https://music.apple.com/us/search?term=${encodeURIComponent(query)}`,
      className,
    },
  ]),
] as const;

function playlistStyle(label: string) {
  const style = label.split(" · ")[1] ?? label;
  if (style.startsWith("Top")) return "Top ישראל";
  return style;
}

function ProgramsPage() {
  const { programs, workouts, userProfile } = useGym();
  const navigate = useNavigate();
  const role = userProfile?.role;
  const gender = userProfile?.gender;
  const isCoach = role === "coach" || role === "owner";
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [selectedPlaylistStyle, setSelectedPlaylistStyle] = useState<string | null>(null);

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
      title=""
      subtitle=""
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
            <button
              type="button"
              onClick={() => setShowPlaylistMenu(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 text-[10px] font-bold text-ink transition-colors hover:bg-primary/20"
              aria-label="פתיחת פלייליסטים לפי אווירה"
            >
              <Music2 className="h-3.5 w-3.5 text-primary" />
              אווירה
            </button>
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
                        <p className="break-words font-display text-[15px] leading-snug font-bold text-ink">
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
            title={genderText(gender, "צרי קצב אימונים קבוע", "צור קצב אימונים קבוע")}
            description={genderText(
              gender,
              "הוסיפי תכנית ראשונה ובני ימי אימון שמתאימים לשגרה שלך.",
              "הוסף תכנית ראשונה ובנה ימי אימון שמתאימים לשגרה שלך.",
            )}
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

      {showPlaylistMenu ? (
        <Overlay
          open={showPlaylistMenu}
          onClose={() => {
            setShowPlaylistMenu(false);
            setSelectedPlaylistStyle(null);
          }}
          ariaLabel="פלייליסטים לפי אווירה"
        >
          <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-4 text-start shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h2 className="font-display text-lg font-extrabold text-ink">מוזיקה לפי אווירה</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  בחרי סגנון ופתחי את הפלייליסט בפלטפורמה המועדפת עלייך.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPlaylistMenu(false);
                  setSelectedPlaylistStyle(null);
                }}
                aria-label="סגירת פלייליסטים"
                className="grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {selectedPlaylistStyle ? (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedPlaylistStyle(null)}
                  className="mb-3 text-xs font-bold text-primary hover:underline"
                >
                  ← חזרה לבחירת סגנון
                </button>
                <p className="mb-2 text-sm font-extrabold text-ink">
                  {selectedPlaylistStyle}
                </p>
                <div className="grid gap-2">
                  {WORKOUT_PLAYLISTS.filter(
                    (playlist) => playlistStyle(playlist.label) === selectedPlaylistStyle,
                  ).map((playlist) => (
                    <a
                      key={playlist.href}
                      href={playlist.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center justify-between rounded-2xl px-3 py-3 text-xs font-bold transition-colors ${playlist.className}`}
                    >
                      <span>{playlist.label.split(" · ")[0]}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {Array.from(
                  new Set(WORKOUT_PLAYLISTS.map((playlist) => playlistStyle(playlist.label))),
                ).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedPlaylistStyle(style)}
                    className="rounded-2xl border border-border bg-background px-3 py-3 text-start text-xs font-bold text-ink transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    {style}
                  </button>
                ))}
              </div>
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
