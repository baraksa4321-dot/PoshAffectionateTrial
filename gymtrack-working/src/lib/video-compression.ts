const TARGET_VIDEO_WIDTH = 1280;
const TARGET_VIDEO_HEIGHT = 720;
const TARGET_VIDEO_BITRATE = 850_000;
const TARGET_AUDIO_BITRATE = 64_000;
const MAX_COMPRESSED_VIDEO_BYTES = 45 * 1024 * 1024;
const COMPRESSION_TIMEOUT_MS = 8 * 60_000;

export class WorkoutVideoCompressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkoutVideoCompressionError";
  }
}

function supportedMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? "";
}

function targetDimensions(width: number, height: number) {
  const scale = Math.min(1, TARGET_VIDEO_WIDTH / width, TARGET_VIDEO_HEIGHT / height);
  const scaledWidth = Math.max(2, Math.round((width * scale) / 2) * 2);
  const scaledHeight = Math.max(2, Math.round((height * scale) / 2) * 2);
  return { width: scaledWidth, height: scaledHeight };
}

function waitForVideoMetadata(video: HTMLVideoElement, timeoutMs: number) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new WorkoutVideoCompressionError("לא ניתן לקרוא את פרטי הסרטון לדחיסה."));
    }, timeoutMs);
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      video.onloadedmetadata = null;
      video.onerror = null;
    };
    video.onloadedmetadata = () => {
      cleanup();
      resolve();
    };
    video.onerror = () => {
      cleanup();
      reject(new WorkoutVideoCompressionError("Safari לא הצליח לפתוח את הסרטון לדחיסה."));
    };
  });
}

/**
 * Re-encodes a large local video before it is sent to Storage. The source
 * remains a local File; only the encoded result is returned to the uploader.
 */
export async function compressWorkoutVideo(file: File): Promise<File> {
  if (typeof document === "undefined" || typeof MediaRecorder === "undefined") {
    throw new WorkoutVideoCompressionError("הדפדפן לא תומך בדחיסת סרטונים מקומית.");
  }
  const mimeType = supportedMimeType();
  if (!mimeType) {
    throw new WorkoutVideoCompressionError("הדפדפן לא תומך בפורמט הדחיסה הנדרש.");
  }

  const sourceUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = sourceUrl;
  const canvas = document.createElement("canvas");
  let animationFrame = 0;
  let timeoutId = 0;
  let sourceStream: MediaStream | undefined;
  let outputStream: MediaStream | undefined;

  try {
    await waitForVideoMetadata(video, 15_000);
    if (!video.videoWidth || !video.videoHeight) {
      throw new WorkoutVideoCompressionError("לא ניתן לזהות את רזולוציית הסרטון.");
    }
    const dimensions = targetDimensions(video.videoWidth, video.videoHeight);
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d");
    if (!context) throw new WorkoutVideoCompressionError("לא ניתן להכין את הדחיסה.");

    if (typeof canvas.captureStream !== "function") {
      throw new WorkoutVideoCompressionError("הדפדפן לא תומך בלכידת וידאו לדחיסה.");
    }
    outputStream = canvas.captureStream(30);
    const captureStream = (
      video as HTMLVideoElement & { captureStream?: () => MediaStream }
    ).captureStream?.();
    sourceStream = captureStream;
    captureStream?.getAudioTracks().forEach((track) => outputStream?.addTrack(track));

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(outputStream, {
      mimeType,
      videoBitsPerSecond: TARGET_VIDEO_BITRATE,
      audioBitsPerSecond: TARGET_AUDIO_BITRATE,
    });
    const recordingFinished = new Promise<void>((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onerror = () =>
        reject(new WorkoutVideoCompressionError("הדחיסה נכשלה במהלך ההקלטה."));
      recorder.onstop = () => resolve();
    });

    const drawFrame = () => {
      if (video.ended || video.paused) return;
      context.drawImage(video, 0, 0, dimensions.width, dimensions.height);
      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    video.onended = () => {
      if (recorder.state !== "inactive") recorder.stop();
    };
    timeoutId = window.setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop();
    }, COMPRESSION_TIMEOUT_MS);

    recorder.start(1000);
    await video.play();
    drawFrame();
    await recordingFinished;
    window.clearTimeout(timeoutId);
    cancelAnimationFrame(animationFrame);

    const extension = mimeType.includes("mp4") ? "mp4" : "webm";
    const output = new File(chunks, `${file.name.replace(/\.[^.]+$/, "")}-720p.${extension}`, {
      type: mimeType,
      lastModified: Date.now(),
    });
    if (output.size === 0) {
      throw new WorkoutVideoCompressionError("הדחיסה לא יצרה קובץ תקין.");
    }
    if (output.size > MAX_COMPRESSED_VIDEO_BYTES) {
      throw new WorkoutVideoCompressionError(
        "הסרטון עדיין גדול מדי אחרי הדחיסה. נסי סרטון קצר יותר או ברזולוציה נמוכה יותר.",
      );
    }
    return output;
  } finally {
    window.clearTimeout(timeoutId);
    cancelAnimationFrame(animationFrame);
    video.pause();
    video.removeAttribute("src");
    video.load();
    sourceStream?.getTracks().forEach((track) => track.stop());
    outputStream?.getTracks().forEach((track) => track.stop());
    URL.revokeObjectURL(sourceUrl);
  }
}