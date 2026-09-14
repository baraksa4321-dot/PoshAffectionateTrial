import { CalendarDays, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  deleteProgressPhoto,
  loadProgressPhotos,
  progressPhotoToday,
  uploadProgressPhoto,
  type ProgressPhoto,
} from "../lib/progress-photos";

export function ProgressPhotosPanel({
  profileId,
  canEdit,
}: {
  profileId: string;
  canEdit: boolean;
}) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [capturedOn, setCapturedOn] = useState(progressPhotoToday);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void loadProgressPhotos(profileId)
      .then((nextPhotos) => {
        if (!cancelled) setPhotos(nextPhotos);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "טעינת תמונות התהליך נכשלה.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const photo = await uploadProgressPhoto(profileId, file, capturedOn);
      setPhotos((current) => [photo, ...current]);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "העלאת התמונה נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (photo: ProgressPhoto) => {
    if (!window.confirm("למחוק את תמונת התהליך?")) return;
    setBusy(true);
    setError("");
    try {
      await deleteProgressPhoto(photo);
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "מחיקת התמונה נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      data-testid="progress-photos-panel"
      className="space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.035] p-4"
    >
      <div className="flex items-start justify-between gap-3 border-b border-primary/15 pb-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <ImagePlus className="h-4 w-4 text-primary" />
            תמונות תהליך
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            כל תמונה נשמרת עם התאריך שבחרת ונגישה בפרופיל הזה בלבד ולצוות המורשה.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
          {photos.length} תמונות
        </span>
      </div>

      {canEdit ? (
        <div className="grid items-end gap-2 sm:grid-cols-[1fr_auto]">
          <label className="grid gap-1 text-[11px] font-bold text-muted-foreground">
            תאריך התמונה
            <span className="relative">
              <CalendarDays className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <input
                type="date"
                value={capturedOn}
                onChange={(event) => setCapturedOn(event.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-white px-3 pe-9 text-xs text-ink"
              />
            </span>
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex h-10 w-full items-center justify-center gap-1 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            {busy ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            הוספת תמונה
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => void handleFileChange(event)}
            className="hidden"
          />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-xs font-semibold text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-white/70 p-5 text-xs text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          טוענת תמונות...
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            <figure key={photo.id} className="group relative overflow-hidden rounded-2xl border border-border bg-white">
              <img
                src={photo.url}
                alt={`תמונת תהליך מתאריך ${photo.capturedOn}`}
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
              <figcaption className="flex items-center justify-between gap-2 bg-white px-2 py-1.5 text-[10px] font-bold text-ink">
                <time dateTime={photo.capturedOn}>
                  {new Date(`${photo.capturedOn}T12:00:00`).toLocaleDateString("he-IL")}
                </time>
                {canEdit ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleDelete(photo)}
                    aria-label={`מחיקת תמונת התהליך מתאריך ${photo.capturedOn}`}
                    className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-white/70 p-4 text-center text-[11px] text-muted-foreground">
          עדיין לא נוספו תמונות תהליך.
        </p>
      )}
    </section>
  );
}