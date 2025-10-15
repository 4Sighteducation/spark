-- ============================================================================
-- Sync Profile IDs with Auth User IDs
-- Problem: Profiles have old auth user IDs, need to update to current ones
-- ============================================================================

-- Step 1: Check current mismatch
SELECT 
  au.email,
  au.id AS auth_id,
  p.id AS profile_id,
  CASE WHEN au.id = p.id THEN '✅ Match' ELSE '❌ Mismatch' END AS status
FROM auth.users au
LEFT JOIN profiles p ON p.email = au.email
WHERE au.email LIKE '%@vespa.academy'
ORDER BY au.email;

-- Step 2: Update profiles to match auth users
-- This is tricky because profiles.id is referenced by many tables
-- Safer approach: Delete old profiles and recreate with correct IDs

-- First, delete dependent data in correct order
DELETE FROM activity_assignments 
WHERE student_id IN (
  SELECT id FROM students WHERE id NOT IN (SELECT id FROM auth.users)
);

DELETE FROM questionnaire_responses 
WHERE student_id IN (
  SELECT id FROM students WHERE id NOT IN (SELECT id FROM auth.users)
);

DELETE FROM assessment_results 
WHERE student_id IN (
  SELECT id FROM students WHERE id NOT IN (SELECT id FROM auth.users)
);

DELETE FROM students 
WHERE id NOT IN (SELECT id FROM auth.users);

DELETE FROM class_members
WHERE student_id NOT IN (SELECT id FROM auth.users);

DELETE FROM staff_class_assignments
WHERE staff_id NOT IN (SELECT id FROM auth.users);

DELETE FROM assessment_cycles
WHERE created_by NOT IN (SELECT id FROM auth.users);

DELETE FROM user_roles
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM profiles
WHERE id NOT IN (SELECT id FROM auth.users);

-- Now re-run the seed script to create profiles with correct auth IDs
SELECT '✅ Old data cleaned. Now re-run supabase-seed-spark-academy.sql' AS next_step;

