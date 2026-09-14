-- Apply the video bucket limit to projects where migration 35 was already run.
UPDATE storage.buckets
SET public = false,
    file_size_limit = 52428800
WHERE id = 'workout-videos';