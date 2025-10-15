-- ============================================================================
-- SPARK ACADEMY - Test Data Seed Script
-- Created: October 15, 2025
-- Purpose: Create SPARK Academy organization with 3 staff and 3 students
-- ============================================================================

-- Note: This script assumes users are already created in Supabase Auth
-- You'll need to create these accounts via Supabase Dashboard or Auth API first:
--
-- STAFF:
-- 1. admintest1@vespa.academy (password: set in Auth)
-- 2. hoytest1@vespa.academy
-- 3. tuttest1@vespa.academy
--
-- STUDENTS:
-- 1. stutest1@vespa.academy
-- 2. stutest2@vespa.academy
-- 3. stutest3@vespa.academy

-- ============================================================================
-- 1. CREATE ORGANIZATION
-- ============================================================================

INSERT INTO organizations (
  id,
  name,
  slug,
  type,
  address,
  contact_email,
  contact_phone,
  created_at
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'SPARK Academy',
  'spark-academy',
  'Secondary School',
  jsonb_build_object(
    'street', '123 Education Street',
    'city', 'Manchester',
    'postcode', 'M1 1AA',
    'country', 'United Kingdom'
  ),
  'admin@sparkacademy.test',
  '+44 161 123 4567',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  updated_at = NOW();

-- ============================================================================
-- 2. CREATE STAFF PROFILES
-- ============================================================================

-- Admin: Mrs Clare Beeton
INSERT INTO profiles (
  id,
  organization_id,
  email,
  first_name,
  last_name,
  primary_role,
  created_at
) 
SELECT 
  au.id,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'admintest1@vespa.academy',
  'Clare',
  'Beeton',
  'org_admin',
  NOW()
FROM auth.users au
WHERE au.email = 'admintest1@vespa.academy'
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  primary_role = EXCLUDED.primary_role,
  updated_at = NOW();

-- Head of Year 8: Mr Craig Branston
INSERT INTO profiles (
  id,
  organization_id,
  email,
  first_name,
  last_name,
  primary_role,
  created_at
)
SELECT 
  au.id,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'hoytest1@vespa.academy',
  'Craig',
  'Branston',
  'head_of_year',
  NOW()
FROM auth.users au
WHERE au.email = 'hoytest1@vespa.academy'
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  primary_role = EXCLUDED.primary_role,
  updated_at = NOW();

-- Tutor: Miss Catherine Crinkle
INSERT INTO profiles (
  id,
  organization_id,
  email,
  first_name,
  last_name,
  primary_role,
  created_at
)
SELECT 
  au.id,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'tuttest1@vespa.academy',
  'Catherine',
  'Crinkle',
  'teacher',
  NOW()
FROM auth.users au
WHERE au.email = 'tuttest1@vespa.academy'
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  primary_role = EXCLUDED.primary_role,
  updated_at = NOW();

-- ============================================================================
-- 3. CREATE STAFF ROLES
-- ============================================================================

-- Mrs Beeton: Org Admin
INSERT INTO user_roles (user_id, organization_id, role, granted_at)
SELECT 
  p.id,
  p.organization_id,
  'org_admin',
  NOW()
FROM profiles p
WHERE p.email = 'admintest1@vespa.academy'
ON CONFLICT (user_id, organization_id, role, scope) DO NOTHING;

-- Mr Branston: Head of Year 8
INSERT INTO user_roles (user_id, organization_id, role, scope, granted_at)
SELECT 
  p.id,
  p.organization_id,
  'head_of_year',
  jsonb_build_object('year', 8),
  NOW()
FROM profiles p
WHERE p.email = 'hoytest1@vespa.academy'
ON CONFLICT (user_id, organization_id, role, scope) DO NOTHING;

-- Miss Crinkle: Tutor
INSERT INTO user_roles (user_id, organization_id, role, granted_at)
SELECT 
  p.id,
  p.organization_id,
  'teacher',
  NOW()
FROM profiles p
WHERE p.email = 'tuttest1@vespa.academy'
ON CONFLICT (user_id, organization_id, role, scope) DO NOTHING;

-- ============================================================================
-- 4. CREATE TUTOR GROUP CLASS
-- ============================================================================

INSERT INTO classes (
  id,
  organization_id,
  name,
  code,
  type,
  year_group,
  academic_year,
  created_at
) VALUES (
  'c8888888-8888-8888-8888-888888888888'::uuid,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  '8CB',
  '8CB',
  'tutor_group',
  8,
  '2025-26',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  updated_at = NOW();

-- ============================================================================
-- 5. ASSIGN MISS CRINKLE AS TUTOR
-- ============================================================================

INSERT INTO staff_class_assignments (staff_id, class_id, role, assigned_at)
SELECT 
  p.id,
  'c8888888-8888-8888-8888-888888888888'::uuid,
  'tutor',
  NOW()
FROM profiles p
WHERE p.email = 'tuttest1@vespa.academy'
ON CONFLICT (staff_id, class_id, role, is_active) DO NOTHING;

-- ============================================================================
-- 6. CREATE STUDENT PROFILES
-- ============================================================================

-- Billy Nomad (HIGH scorer)
INSERT INTO profiles (
  id,
  organization_id,
  email,
  first_name,
  last_name,
  primary_role,
  date_of_birth,
  created_at
)
SELECT 
  au.id,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'stutest1@vespa.academy',
  'Billy',
  'Nomad',
  'student',
  '2012-03-15'::date,
  NOW()
FROM auth.users au
WHERE au.email = 'stutest1@vespa.academy'
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  date_of_birth = EXCLUDED.date_of_birth,
  updated_at = NOW();

-- Sarah Hinchcliffe (MEDIUM scorer)
INSERT INTO profiles (
  id,
  organization_id,
  email,
  first_name,
  last_name,
  primary_role,
  date_of_birth,
  created_at
)
SELECT 
  au.id,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'stutest2@vespa.academy',
  'Sarah',
  'Hinchcliffe',
  'student',
  '2012-07-22'::date,
  NOW()
FROM auth.users au
WHERE au.email = 'stutest2@vespa.academy'
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  date_of_birth = EXCLUDED.date_of_birth,
  updated_at = NOW();

-- Clare Handsoff (LOW scorer)
INSERT INTO profiles (
  id,
  organization_id,
  email,
  first_name,
  last_name,
  primary_role,
  date_of_birth,
  created_at
)
SELECT 
  au.id,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'stutest3@vespa.academy',
  'Clare',
  'Handsoff',
  'student',
  '2012-11-08'::date,
  NOW()
FROM auth.users au
WHERE au.email = 'stutest3@vespa.academy'
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  date_of_birth = EXCLUDED.date_of_birth,
  updated_at = NOW();

-- ============================================================================
-- 7. CREATE STUDENT RECORDS
-- ============================================================================
-- Note: students.id = profiles.id (same UUID, foreign key to profiles)

-- Billy Nomad
INSERT INTO students (
  id,
  organization_id,
  student_id_number,
  year_group,
  created_at
)
SELECT 
  p.id,
  p.organization_id,
  'STU2025001',
  8,
  NOW()
FROM profiles p
WHERE p.email = 'stutest1@vespa.academy'
ON CONFLICT (id) DO UPDATE SET
  student_id_number = EXCLUDED.student_id_number,
  updated_at = NOW();

-- Sarah Hinchcliffe
INSERT INTO students (
  id,
  organization_id,
  student_id_number,
  year_group,
  created_at
)
SELECT 
  p.id,
  p.organization_id,
  'STU2025002',
  8,
  NOW()
FROM profiles p
WHERE p.email = 'stutest2@vespa.academy'
ON CONFLICT (id) DO UPDATE SET
  student_id_number = EXCLUDED.student_id_number,
  updated_at = NOW();

-- Clare Handsoff
INSERT INTO students (
  id,
  organization_id,
  student_id_number,
  year_group,
  created_at
)
SELECT 
  p.id,
  p.organization_id,
  'STU2025003',
  8,
  NOW()
FROM profiles p
WHERE p.email = 'stutest3@vespa.academy'
ON CONFLICT (id) DO UPDATE SET
  student_id_number = EXCLUDED.student_id_number,
  updated_at = NOW();

-- ============================================================================
-- 8. ASSIGN STUDENTS TO TUTOR GROUP
-- ============================================================================

INSERT INTO class_members (class_id, student_id, joined_at)
SELECT 
  'c8888888-8888-8888-8888-888888888888'::uuid,
  s.id,
  NOW()
FROM students s
JOIN profiles p ON p.id = s.id
WHERE p.email IN ('stutest1@vespa.academy', 'stutest2@vespa.academy', 'stutest3@vespa.academy')
ON CONFLICT (class_id, student_id, is_active) DO NOTHING;

-- ============================================================================
-- 9. CREATE CURRENT CYCLE (Autumn 2025)
-- ============================================================================

INSERT INTO assessment_cycles (
  id,
  organization_id,
  cycle_number,
  cycle_name,
  start_date,
  end_date,
  created_by,
  created_at
)
SELECT 
  'c1111111-1111-1111-1111-111111111111'::uuid,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  1,
  'Autumn 2025',
  '2025-10-01'::date,
  '2025-10-21'::date,
  p.id,
  NOW()
FROM profiles p
WHERE p.email = 'admintest1@vespa.academy'
ON CONFLICT (organization_id, year_group, class_id, cycle_number) DO UPDATE SET
  cycle_name = EXCLUDED.cycle_name,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  updated_at = NOW();

-- ============================================================================
-- 10. CREATE QUESTIONNAIRE RECORD
-- ============================================================================

-- Get or create the default questionnaire
INSERT INTO questionnaires (
  id,
  version,
  title,
  description,
  questions,
  status,
  is_default,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  '2.1.2',
  'SPARK Assessment V2',
  'Core SPARK questionnaire measuring Self-Direction, Purpose, Awareness, Resilience, and Knowledge',
  '{}'::jsonb,
  'active',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  status = 'active',
  is_default = true;

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Query to verify setup
SELECT 
  'Organization' AS entity_type,
  name AS name,
  'Created' AS status
FROM organizations
WHERE id = 'a1111111-1111-1111-1111-111111111111'

UNION ALL

SELECT 
  'Staff' AS entity_type,
  first_name || ' ' || last_name AS name,
  primary_role::text AS status
FROM profiles
WHERE email IN ('admintest1@vespa.academy', 'hoytest1@vespa.academy', 'tuttest1@vespa.academy')

UNION ALL

SELECT 
  'Student' AS entity_type,
  p.first_name || ' ' || p.last_name AS name,
  'Year ' || s.year_group::text AS status
FROM profiles p
JOIN students s ON s.id = p.id
WHERE p.email IN ('stutest1@vespa.academy', 'stutest2@vespa.academy', 'stutest3@vespa.academy')

UNION ALL

SELECT 
  'Tutor Group' AS entity_type,
  name AS name,
  'Created' AS status
FROM classes
WHERE id = 'c8888888-8888-8888-8888-888888888888'

UNION ALL

SELECT 
  'Cycle' AS entity_type,
  cycle_name AS name,
  start_date::text || ' to ' || end_date::text AS status
FROM assessment_cycles
WHERE id = 'c1111111-1111-1111-1111-111111111111';

-- ============================================================================
-- NOTES FOR NEXT STEPS
-- ============================================================================

-- 1. Create Auth users in Supabase Dashboard first:
--    - Go to Authentication > Users > Add User
--    - Create all 6 emails with temporary passwords
--    - Users can reset on first login

-- 2. Run this script to create profiles and relationships

-- 3. Generate pre-filled questionnaire responses (separate script)

-- 4. Import activities from JSON (separate script)

SELECT 'SPARK Academy seed data completed! ✅' AS status;

