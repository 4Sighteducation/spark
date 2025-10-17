-- Debug: Check if staff can access student data
-- Run this as the logged-in staff user (Clare Beeton / admintest1@vespa.academy)

-- 1. Check your current user
SELECT 
  auth.uid() as my_user_id,
  auth.email() as my_email;

-- 2. Check your profile
SELECT id, email, first_name, last_name, primary_role, organization_id
FROM profiles
WHERE id = auth.uid();

-- 3. Check students in your organization
SELECT 
  s.id,
  p.first_name,
  p.last_name,
  p.email,
  s.year_group,
  s.organization_id,
  p.organization_id as profile_org_id
FROM students s
JOIN profiles p ON p.id = s.id
WHERE s.is_active = true
  AND s.organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  );

-- 4. Check assessment_results (THIS IS THE PROBLEM)
SELECT 
  ar.id,
  ar.student_id,
  ar.cycle_number,
  ar.overall_score,
  ar.self_direction_score,
  ar.purpose_score,
  ar.awareness_score,
  ar.resilience_score,
  ar.knowledge_score,
  ar.created_at
FROM assessment_results ar
WHERE ar.student_id IN (
  SELECT s.id FROM students s
  WHERE s.organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

-- 5. Check RLS policies on assessment_results
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'assessment_results';

