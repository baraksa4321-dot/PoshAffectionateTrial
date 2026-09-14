-- Allow longer high-quality phone recordings while keeping an explicit
-- server-side guard for workout performance videos.
UPDATE storage.buckets
SET public = false,
    file_size_limit = 1073741824
WHERE id = 'workout-videos';