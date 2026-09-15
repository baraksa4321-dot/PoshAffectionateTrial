const DATABASE_NAME = "gymtrack-workout-video-drafts";
const STORE_NAME = "videos";

type StoredVideoDraft = {
  key: string;
  userId?: string;
  workoutId: string;
  exerciseIndex: number;
  file: Blob;
  fileName: string;
  contentType: string;
  upload?: WorkoutVideoUploadCheckpoint;
};

export type WorkoutVideoUploadCheckpoint = {
  path: string;
  uploadUrl: string;
  offset: number;
  size: number;
  contentType: string;
};

export type WorkoutVideoDraft = {
  exerciseIndex: number;
  file: File;
  upload?: WorkoutVideoUploadCheckpoint;
};

function draftKey(userId: string, workoutId: string, exerciseIndex: number) {
  return `${userId}:${workoutId}:${exerciseIndex}`;
}

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open video drafts"));
  });
}

export async function saveWorkoutVideoDraft(
  userId: string,
  workoutId: string,
  exerciseIndex: number,
  file: File,
  upload?: WorkoutVideoUploadCheckpoint,
) {
  const database = await openDraftDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put({
        key: draftKey(userId, workoutId, exerciseIndex),
        userId,
        workoutId,
        exerciseIndex,
        // Safari is more reliable when IndexedDB receives a Blob rather than
        // the File object returned by an input element.
        file: file.slice(0, file.size, file.type),
        fileName: file.name,
        contentType: file.type,
        ...(upload ? { upload } : {}),
      } satisfies StoredVideoDraft);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Could not save video draft"));
    });
  } finally {
    database.close();
  }
}

export async function loadWorkoutVideoDrafts(
  userId: string,
  workoutId: string,
): Promise<WorkoutVideoDraft[]> {
  const database = await openDraftDatabase();
  try {
    return await new Promise<WorkoutVideoDraft[]>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => {
        const drafts = (request.result as StoredVideoDraft[])
          .filter((draft) => draft.userId === userId && draft.workoutId === workoutId)
          .map((draft) => ({
            exerciseIndex: draft.exerciseIndex,
            file: new File([draft.file], draft.fileName, { type: draft.contentType }),
            ...(draft.upload &&
            draft.upload.path &&
            draft.upload.uploadUrl &&
            draft.upload.size === draft.file.size
              ? {
                  upload: {
                    ...draft.upload,
                    offset: Math.max(0, Math.min(draft.upload.offset, draft.file.size)),
                  },
                }
              : {}),
          }));
        resolve(drafts);
      };
      request.onerror = () =>
        reject(request.error ?? new Error("Could not load video drafts"));
    });
  } finally {
    database.close();
  }
}

export async function removeWorkoutVideoDraft(
  userId: string,
  workoutId: string,
  exerciseIndex: number,
) {
  const database = await openDraftDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(draftKey(userId, workoutId, exerciseIndex));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Could not remove video draft"));
    });
  } finally {
    database.close();
  }
}

export async function clearWorkoutDraftsForUser(userId: string) {
  if (typeof window !== "undefined") {
    try {
      const prefixes = [
        "gymtrack.active_session.",
        "gymtrack.active_session_started_at.",
        "gymtrack.active_session_feedback.",
        "gymtrack.active_rest_timer.",
      ];
      for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
        const key = window.localStorage.key(index);
        if (
          key &&
          prefixes.some((prefix) => {
            if (!key.startsWith(prefix)) return false;
            const suffix = key.slice(prefix.length);
            return suffix.startsWith(`${userId}.`) || !suffix.includes(".");
          })
        ) {
          window.localStorage.removeItem(key);
        }
      }
    } catch {
      /* ignore storage failures */
    }
  }

  if (typeof indexedDB === "undefined") return;
  const database = await openDraftDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        for (const draft of request.result as StoredVideoDraft[]) {
          if (!draft.userId || draft.userId === userId) store.delete(draft.key);
        }
      };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Could not clear video drafts"));
    });
  } finally {
    database.close();
  }
}