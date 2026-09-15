-- Keep coach feedback linked to the original source while allowing the UI to
-- play the browser-compatible derivative when one was generated.
ALTER TABLE public.video_feedback
  ADD COLUMN IF NOT EXISTS video_playback_path TEXT;
