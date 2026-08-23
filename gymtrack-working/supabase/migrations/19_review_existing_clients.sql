-- Put every existing client account through the same owner review flow.
-- Coaches and owners are left available so the owner can perform the review.

UPDATE public.profiles
SET approval_status = 'pending',
    updated_at = NOW()
WHERE role = 'client';