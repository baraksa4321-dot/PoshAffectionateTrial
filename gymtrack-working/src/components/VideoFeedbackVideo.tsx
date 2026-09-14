import { useEffect, useRef, useState } from "react";
import type { HistoryEntry, VideoFeedback } from "@/lib/gym-types";
import { signWorkoutPerformanceVideo } from "@/lib/supabase-sync";
import { isSafeVideoSource } from "@/lib/url-security";

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
  const [source, setSource] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [didRefresh, setDidRefresh] = useState(false);
  const refreshInFlightRef = useRef(false);

  useEffect(() => {
    let active = true;
    refreshInFlightRef.current = false;
    setHasError(false);
    setDidRefresh(false);

    if (historyUrl) {
      setSource(historyUrl);
      setIsRefreshing(false);
      return () => {
        active = false;
      };
    }

    setSource("");
    if (!feedback.videoPath) {
      setIsRefreshing(false);
      return () => {
        active = false;
      };
    }

    refreshInFlightRef.current = true;
    setIsRefreshing(true);
    void signWorkoutPerformanceVideo(feedback.videoPath)
      .then((signedUrl) => {
        if (active && isSafeVideoSource(signedUrl)) {
          setSource(signedUrl);
        } else if (active) {
          setHasError(true);
        }
      })
      .catch(() => {
        if (active) setHasError(true);
      })
      .finally(() => {
        refreshInFlightRef.current = false;
        if (active) setIsRefreshing(false);
      });

    return () => {
      active = false;
    };
  }, [feedback.videoPath, historyUrl]);

  const handleVideoError = () => {
    if (!feedback.videoPath || didRefresh || refreshInFlightRef.current || isRefreshing) {
      setHasError(true);
      return;
    }

    setDidRefresh(true);
    refreshInFlightRef.current = true;
    setIsRefreshing(true);
    setHasError(false);
    void signWorkoutPerformanceVideo(feedback.videoPath)
      .then((signedUrl) => {
        if (isSafeVideoSource(signedUrl)) {
          setSource(signedUrl);
        } else {
          setHasError(true);
        }
      })
      .catch(() => setHasError(true))
      .finally(() => {
        refreshInFlightRef.current = false;
        setIsRefreshing(false);
      });
  };

  if (isRefreshing) {
    return (
      <div className="mt-2 rounded-xl bg-black p-3 text-center text-[11px] text-white">
        טוען את הסרטון...
      </div>
    );
  }

  if (hasError || !source) {
    return (
      <p className="mt-2 rounded-xl bg-secondary/55 p-2.5 text-center text-[11px] font-semibold text-muted-foreground">
        הסרטון נשמר, אבל כרגע לא ניתן לטעון אותו לצפייה.
      </p>
    );
  }

  return (
    <video
      src={source}
      controls
      playsInline
      preload="metadata"
      className={className}
      aria-label={`סרטון ביצוע ${feedback.exerciseName}`}
      onError={handleVideoError}
    />
  );
}
