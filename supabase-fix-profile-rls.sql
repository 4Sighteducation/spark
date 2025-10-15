-- ============================================================================
-- Fix Profile RLS - Allow client-side access
-- Issue: "Users can view own profile" policy not working from client
-- ============================================================================

-- Drop and recreate the "own profile" policy with explicit permissions
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Recreate with explicit grant to authenticated users
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Also ensure students can see their own student record
DROP POLICY IF EXISTS "Students can view own record" ON students;

CREATE POLICY "Students can view own record"
  ON students FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Test query to verify (run as the logged-in user)
SELECT 'RLS policies updated. Test by running:' AS message;
SELECT 'SELECT * FROM profiles WHERE id = auth.uid();' AS test_query;

SELECT '✅ Profile RLS policies fixed for client-side access!' AS status;

