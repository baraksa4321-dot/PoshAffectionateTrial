import { useEffect, useState } from "react";
import type { HistoryEntry, VideoFeedback } from "@/lib/gym-types";
import { supabase } from "@/lib/supabase";
import { isSafeVideoSource } from "@/lib/url-security";

const WORKOUT_VIDEO_BUCKET = "workout-videos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

type VideoFeedbackVideoProps = {
  feedback: VideoFeedback;
  entry: HistoryEntry | undefined;
  className?: string;
};

export function VideoFeedbackVideo({
  feedback,
  entry,
  className = "mt-2 max-h-56 w-full rounded-xl bg-black object-contain",
}: VideoFeedbackVideoProps) {
  const historyUrl = entry?.videoUrl && isSafeVideoSource(entry.videoUrl) ? entry.videoUrl : "";
  const [source, setSource] = useState(historyUrl);

  useEffect(() => {
    let active = true;
    if (historyUrl) {
      setSource(historyUrl);
      return () => {
        active = false;
      };
    }

    setSource("");
    if (!feedback.videoPath) {
      return () => {
        active = false;
      };
    }

    void supabase.storage
      .from(WORKOUT_VIDEO_BUCKET)
      .createSignedUrl(feedback.videoPath, SIGNED_URL_TTL_SECONDS)
      .then(({ data }) => {
        if (active && data?.signedUrl && isSafeVideoSource(data.signedUrl)) {
          setSource(data.signedUrl);
        }
      });

    return () => {
      active = false;
    };
  }, [feedback.videoPath, historyUrl]);

  if (!source) return null;

  return (
    <video
      src={source}
      controls
      playsInline
      preload="metadata"
      className={className}
      aria-label={`סרטון ביצוע ${feedback.exerciseName}`}
    />
  );
}