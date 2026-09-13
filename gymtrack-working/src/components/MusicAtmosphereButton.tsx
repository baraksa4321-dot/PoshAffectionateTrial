import { Music2, Search, X } from "lucide-react";
import { useState } from "react";
import { Overlay } from "@/components/ui-app/Overlay";
import { genderText } from "@/lib/gender-copy";
import { BUILT_IN_MUSIC_GENRES, type BuiltInMusicGenre } from "@/lib/music-library";

export function MusicAtmosphereButton({
  gender,
}: {
  gender?: "female" | "male" | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<BuiltInMusicGenre | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const close = () => {
    setOpen(false);
    setSelectedGenre(null);
    setShowSearch(false);
    setSearchQuery("");
  };

  const filteredTracks = BUILT_IN_MUSIC_GENRES.flatMap((genre) =>
    genre.tracks.map((track) => ({ genre, track })),
  ).filter(({ genre, track }) => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return true;
    return [genre.style, track.title, track.artist].some((value) =>
      value.toLocaleLowerCase().includes(query),
    );
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 text-[10px] font-bold text-ink transition-colors hover:bg-primary/20"
        aria-label="פתיחת פלייליסטים לפי אווירה"
      >
        <Music2 className="h-3.5 w-3.5 text-primary" />
        אווירה
      </button>

      <Overlay open={open} onClose={close} ariaLabel="פלייליסטים לפי אווירה">
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
              onClick={close}
              aria-label="סגירת פלייליסטים"
              className="grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {showSearch ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                className="mb-3 text-xs font-bold text-primary hover:underline"
              >
                ← חזרה לז׳אנרים
              </button>
              <p className="mb-2 text-sm font-extrabold text-ink">מציאת מוזיקה</p>
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="שיר, אמן או ז׳אנר..."
                aria-label="חיפוש מוזיקה"
                className="mb-3 w-full rounded-2xl border border-border/60 bg-secondary px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <div className="grid max-h-[45vh] gap-2 overflow-y-auto pe-0.5">
                {filteredTracks.length > 0 ? (
                  filteredTracks.map(({ genre, track }) => (
                    <button
                      key={`${genre.style}-${track.title}`}
                      type="button"
                      onClick={() => {
                        setSelectedGenre(genre);
                        setShowSearch(false);
                      }}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-primary/5 px-3 py-2.5 text-start transition-colors hover:bg-primary/10"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-ink">{track.title}</span>
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
          ) : selectedGenre ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedGenre(null)}
                className="mb-3 text-xs font-bold text-primary hover:underline"
              >
                ← חזרה לז׳אנרים
              </button>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-ink">{selectedGenre.style}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    רשימת השמעה מובנית · {selectedGenre.tracks.length} שירים
                  </p>
                </div>
                <Music2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              </div>
              <div className="grid max-h-[45vh] gap-2 overflow-y-auto pe-0.5">
                {selectedGenre.tracks.map((track, index) => (
                  <div
                    key={`${selectedGenre.style}-${track.title}`}
                    className="flex items-center gap-3 rounded-2xl bg-primary/5 px-3 py-2.5"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-[10px] font-bold text-primary">
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold text-ink">{track.title}</span>
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
                  onClick={() => setShowSearch(true)}
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
                    onClick={() => setSelectedGenre(genre)}
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
    </>
  );
}