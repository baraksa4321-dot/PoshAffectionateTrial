export type VideoTranscodeStatus = "not-needed" | "processing" | "ready" | "failed";

export type VideoTranscodeResult = {
  status: VideoTranscodeStatus;
  sourcePath: string;
  playbackPath?: string;
  error?: string;
};

export function videoTranscodeStatusLabel(status?: VideoTranscodeStatus): string {
  if (status === "processing") return "מכין גרסת צפייה לדפדפן...";
  if (status === "ready") return "גרסת צפייה מוכנה";
  if (status === "failed") return "המקור נשמר, אבל הכנת גרסת הצפייה נכשלה";
  return "";
}


export function videoTranscodeFailureMessage(error?: string): string {
  const detail = error?.trim();
  return detail
    ? `המקור נשמר, אבל לא ניתן היה להכין גרסת צפייה לדפדפן: ${detail}`
    : "המקור נשמר, אבל לא ניתן היה להכין גרסת צפייה לדפדפן.";
}