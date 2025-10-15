-- ============================================================================
-- Re-sync Profiles with Current Auth Users
-- Updates existing profiles to use current auth user IDs
-- ============================================================================

-- Update staff profiles
UPDATE profiles p
SET id = au.id
FROM auth.users au
WHERE p.email = au.email
AND p.email IN ('admintest1@vespa.academy', 'hoytest1@vespa.academy', 'tuttest1@vespa.academy')
AND p.id != au.id;

-- Update student profiles  
UPDATE profiles p
SET id = au.id
FROM auth.users au
WHERE p.email = au.email
AND p.email IN ('stutest1@vespa.academy', 'stutest2@vespa.academy', 'stutest3@vespa.academy')
AND p.id != au.id;

-- Update students table to match new profile IDs
UPDATE students s
SET id = p.id
FROM profiles p
WHERE s.id != p.id
AND EXISTS (
  SELECT 1 FROM auth.users au WHERE au.email = p.email
);

-- Verify sync
SELECT 
  au.email,
  au.id AS auth_id,
  p.id AS profile_id,
  s.id AS student_id,
  CASE 
    WHEN au.id = p.id AND (s.id IS NULL OR s.id = p.id) THEN '✅ Synced'
    ELSE '❌ Still mismatched'
  END AS status
FROM auth.users au
LEFT JOIN profiles p ON p.email = au.email
LEFT JOIN students s ON s.id = p.id
WHERE au.email LIKE '%@vespa.academy'
ORDER BY au.email;

