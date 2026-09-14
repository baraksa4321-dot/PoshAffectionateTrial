import { supabase } from "./supabase";

const PROGRESS_PHOTOS_BUCKET = "progress-photos";
const MAX_PROGRESS_PHOTO_BYTES = 10 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export type ProgressPhoto = {
  id: string;
  userId: string;
  path: string;
  capturedOn: string;
  createdAt: string;
  url: string;
};

function imageExtension(file: File) {
  const fromName = file.name
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (fromName && IMAGE_EXTENSIONS.has(fromName)) return fromName;
  const fromType = file.type
    .split("/")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return fromType && IMAGE_EXTENSIONS.has(fromType) ? fromType : "jpg";
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const progressPhotoToday = localDateKey;

function randomId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function signedPhotoUrl(path: string) {
  const { data, error } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) {
    throw new Error(`יצירת כתובת התמונה נכשלה: ${error?.message ?? "missing signed URL"}`);
  }
  return data.signedUrl;
}

export async function loadProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
  const { data, error } = await supabase
    .from("progress_photos")
    .select("id,user_id,photo_path,captured_on,created_at")
    .eq("user_id", userId)
    .order("captured_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`טעינת תמונות התהליך נכשלה: ${error.message}`);

  return Promise.all(
    (data ?? []).map(async (row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      path: String(row.photo_path),
      capturedOn: String(row.captured_on).slice(0, 10),
      createdAt: String(row.created_at),
      url: await signedPhotoUrl(String(row.photo_path)),
    })),
  );
}

export async function uploadProgressPhoto(
  userId: string,
  file: File,
  capturedOn: string,
): Promise<ProgressPhoto> {
  if (!file.type.startsWith("image/")) {
    throw new Error("אפשר להעלות תמונה בלבד.");
  }
  if (file.size > MAX_PROGRESS_PHOTO_BYTES) {
    throw new Error("התמונה גדולה מדי. הגודל המרבי הוא 10MB.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(capturedOn)) {
    throw new Error("יש לבחור תאריך לתמונה.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("לא ניתן להעלות תמונה בלי חשבון מחובר.");

  const path = `${userId}/progress/${randomId()}.${imageExtension(file)}`;
  const { error: uploadError } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (uploadError) throw new Error(`העלאת התמונה נכשלה: ${uploadError.message}`);

  const { data, error: rowError } = await supabase
    .from("progress_photos")
    .insert({
      user_id: userId,
      photo_path: path,
      captured_on: capturedOn,
    })
    .select("id,user_id,photo_path,captured_on,created_at")
    .single();
  if (rowError || !data) {
    await supabase.storage.from(PROGRESS_PHOTOS_BUCKET).remove([path]);
    throw new Error(`שמירת פרטי התמונה נכשלה: ${rowError?.message ?? "missing row"}`);
  }

  return {
    id: String(data.id),
    userId: String(data.user_id),
    path: String(data.photo_path),
    capturedOn: String(data.captured_on).slice(0, 10),
    createdAt: String(data.created_at),
    url: await signedPhotoUrl(path),
  };
}

export async function deleteProgressPhoto(photo: ProgressPhoto): Promise<void> {
  const { error: rowError } = await supabase
    .from("progress_photos")
    .delete()
    .eq("id", photo.id)
    .eq("user_id", photo.userId);
  if (rowError) throw new Error(`מחיקת התמונה נכשלה: ${rowError.message}`);

  const { error: storageError } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .remove([photo.path]);
  if (storageError) throw new Error(`מחיקת קובץ התמונה נכשלה: ${storageError.message}`);
}