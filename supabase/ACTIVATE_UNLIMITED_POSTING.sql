-- ACTIVATE UNLIMITED POSTING FOR ADMIN/OWNER ACCOUNT
--
-- Instructions:
-- 1. Go to Supabase dashboard → SQL Editor
-- 2. Replace 'YOUR_USER_ID_HERE' with your actual auth user ID
-- 3. Run this query to activate unlimited posting on your account
--
-- To find your user ID:
-- - Log in to jobconnect-ai as yourself
-- - Open browser DevTools → Console
-- - Run: (await supabase.auth.getUser()).data.user.id
-- - Copy the UUID and paste it below

UPDATE public.profiles
SET is_unlimited_posting = true
WHERE user_id = 'YOUR_USER_ID_HERE'
RETURNING user_id, email, role, is_unlimited_posting;
