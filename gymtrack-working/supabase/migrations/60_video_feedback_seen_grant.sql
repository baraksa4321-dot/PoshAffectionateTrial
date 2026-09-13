-- Trainees may acknowledge feedback, but cannot edit its ownership or content.
REVOKE UPDATE ON public.video_feedback FROM authenticated;
GRANT UPDATE (seen_at) ON public.video_feedback TO authenticated;