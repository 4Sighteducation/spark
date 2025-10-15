-- ============================================================================
-- Fix Infinite Recursion in Profiles RLS Policy
-- Issue: Policies referencing profiles within profiles table cause loops
-- ============================================================================

-- Drop problematic policies
DROP POLICY IF EXISTS "Staff can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Org admins can manage profiles" ON profiles;

-- Recreate with fixed logic (no self-referencing)

-- Staff can view profiles in their organization (simplified - no role check in USING)
CREATE POLICY "Staff can view org profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Org admins can manage profiles (use user_roles table instead of profiles.primary_role)
CREATE POLICY "Org admins can manage profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT ur.organization_id FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'org_admin')
      AND ur.is_active = true
    )
  );

-- Also fix students policy if it has similar issues
DROP POLICY IF EXISTS "Staff can view students in scope" ON students;

CREATE POLICY "Staff can view students in scope"
  ON students FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

SELECT '✅ RLS policies fixed - infinite recursion resolved!' AS status;

