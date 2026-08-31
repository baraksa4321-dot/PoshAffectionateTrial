const DATABASE_NAME = "gymtrack-workout-video-drafts";
const STORE_NAME = "videos";

type StoredVideoDraft = {
  key: string;
  workoutId: string;
  exerciseIndex: number;
  file: Blob;
  fileName: string;
  contentType: string;
};

export type WorkoutVideoDraft = {
  exerciseIndex: number;
  file: File;
};

function draftKey(workoutId: string, exerciseIndex: number) {
  return `${workoutId}:${exerciseIndex}`;
}

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open video drafts"));
  });
}

export async function saveWorkoutVideoDraft(
  workoutId: string,
  exerciseIndex: number,
  file: File,
) {
  const database = await openDraftDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put({
        key: draftKey(workoutId, exerciseIndex),
        workoutId,
        exerciseIndex,
        file,
        fileName: file.name,
        contentType: file.type,
      } satisfies StoredVideoDraft);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Could not save video draft"));
    });
  } finally {
    database.close();
  }
}

export async function loadWorkoutVideoDrafts(workoutId: string): Promise<WorkoutVideoDraft[]> {
  const database = await openDraftDatabase();
  try {
    return await new Promise<WorkoutVideoDraft[]>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => {
        const drafts = (request.result as StoredVideoDraft[])
          .filter((draft) => draft.workoutId === workoutId)
          .map((draft) => ({
            exerciseIndex: draft.exerciseIndex,
            file: new File([draft.file], draft.fileName, { type: draft.contentType }),
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

export async function removeWorkoutVideoDraft(workoutId: string, exerciseIndex: number) {
  const database = await openDraftDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(draftKey(workoutId, exerciseIndex));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Could not remove video draft"));
    });
  } finally {
    database.close();
  }
}