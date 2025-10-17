-- Fix: Check and correct organization_id mismatch

-- 1. CHECK: What organization is the staff user in?
SELECT 'Staff User Organization:' as check_type, organization_id, first_name, last_name, email, primary_role
FROM profiles
WHERE email = 'admintest1@vespa.academy';

-- 2. CHECK: What organization are the students in?
SELECT 'Student Organizations:' as check_type, 
       COUNT(*) as count, 
       s.organization_id
FROM students s
JOIN profiles p ON p.id = s.id
WHERE p.email LIKE '%stutest%'
GROUP BY s.organization_id;

-- 3. CHECK: What organization are the assessment_results in?
SELECT 'Assessment Results Organizations:' as check_type,
       COUNT(*) as count,
       ar.organization_id
FROM assessment_results ar
GROUP BY ar.organization_id;

-- 4. PROBLEM CHECK: Do they match?
WITH staff_org AS (
  SELECT organization_id FROM profiles WHERE email = 'admintest1@vespa.academy'
),
student_orgs AS (
  SELECT DISTINCT s.organization_id FROM students s
  JOIN profiles p ON p.id = s.id
  WHERE p.email LIKE '%stutest%'
),
result_orgs AS (
  SELECT DISTINCT organization_id FROM assessment_results
)
SELECT 
  (SELECT organization_id FROM staff_org) as staff_org_id,
  (SELECT organization_id FROM student_orgs LIMIT 1) as student_org_id,
  (SELECT organization_id FROM result_orgs LIMIT 1) as result_org_id,
  CASE 
    WHEN (SELECT organization_id FROM staff_org) = (SELECT organization_id FROM student_orgs LIMIT 1)
      AND (SELECT organization_id FROM staff_org) = (SELECT organization_id FROM result_orgs LIMIT 1)
    THEN '✅ ALL MATCH - should work!'
    ELSE '❌ MISMATCH - this is the problem!'
  END as status;

-- 5. FIX: If there's a mismatch, update assessment_results to match students' organization
-- Uncomment and run this if needed:

/*
UPDATE assessment_results ar
SET organization_id = s.organization_id
FROM students s
WHERE ar.student_id = s.id
  AND ar.organization_id != s.organization_id;
*/

-- 6. FIX: Also check questionnaire_responses
/*
UPDATE questionnaire_responses qr
SET organization_id = s.organization_id
FROM students s
WHERE qr.student_id = s.id
  AND qr.organization_id != s.organization_id;
*/

