-- ============================================================================
-- Open Cycle 2 for Testing & Unlock Questionnaire
-- Also assign Ikigai Quest to all students
-- ============================================================================

-- 1. Create Cycle 2 (Active NOW)
INSERT INTO assessment_cycles (
  id,
  organization_id,
  cycle_number,
  cycle_name,
  start_date,
  end_date,
  created_by
)
SELECT 
  'c2222222-2222-2222-2222-222222222222'::uuid,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  2,
  'Cycle 2 - Testing',
  '2025-10-16'::date,  -- Today!
  '2025-11-06'::date,  -- 3 weeks from now
  (SELECT id FROM profiles WHERE email = 'admintest1@vespa.academy')
ON CONFLICT (organization_id, year_group, class_id, cycle_number) 
DO UPDATE SET
  start_date = '2025-10-16'::date,
  end_date = '2025-11-06'::date,
  cycle_name = 'Cycle 2 - Testing';

-- 2. Unlock students by setting their Cycle 1 responses to older date
-- This allows them to complete Cycle 2
UPDATE questionnaire_responses
SET completed_at = '2025-09-30 10:00:00'::timestamptz
WHERE student_id IN (
  SELECT id FROM students 
  WHERE id IN (SELECT id FROM profiles WHERE email LIKE '%@vespa.academy')
);

-- 3. Get Ikigai Quest activity ID
DO $$
DECLARE
  v_ikigai_id UUID;
  v_billy_id UUID;
  v_sarah_id UUID;
  v_clare_id UUID;
BEGIN
  -- Get Ikigai activity
  SELECT id INTO v_ikigai_id
  FROM activities
  WHERE activity_code = 'P_ikigai_mini_map';
  
  IF v_ikigai_id IS NULL THEN
    RAISE NOTICE 'Ikigai Quest activity not found!';
    RETURN;
  END IF;
  
  -- Get student IDs
  SELECT id INTO v_billy_id FROM students WHERE id = (SELECT id FROM profiles WHERE email = 'stutest1@vespa.academy');
  SELECT id INTO v_sarah_id FROM students WHERE id = (SELECT id FROM profiles WHERE email = 'stutest2@vespa.academy');
  SELECT id INTO v_clare_id FROM students WHERE id = (SELECT id FROM profiles WHERE email = 'stutest3@vespa.academy');
  
  -- Assign Ikigai to all 3 students
  INSERT INTO activity_assignments (activity_id, student_id, assignment_type, is_required, priority)
  VALUES 
    (v_ikigai_id, v_billy_id, 'teacher_assigned', true, 1),
    (v_ikigai_id, v_sarah_id, 'teacher_assigned', true, 1),
    (v_ikigai_id, v_clare_id, 'teacher_assigned', true, 1)
  ON CONFLICT (activity_id, student_id, assigned_at) DO NOTHING;
  
  RAISE NOTICE 'Ikigai Quest assigned to all 3 students!';
END $$;

-- 4. Verify setup
SELECT 
  'Cycle 2' AS item,
  cycle_name AS name,
  start_date::text || ' to ' || end_date::text AS dates,
  CASE 
    WHEN CURRENT_DATE BETWEEN start_date AND end_date THEN '✅ ACTIVE'
    ELSE '⏸️ Not active yet'
  END AS status
FROM assessment_cycles
WHERE cycle_number = 2;

SELECT 
  p.first_name || ' ' || p.last_name AS student,
  COUNT(aa.id) AS ikigai_assigned
FROM profiles p
JOIN students s ON s.id = p.id
LEFT JOIN activity_assignments aa ON aa.student_id = s.id AND aa.activity_id = (
  SELECT id FROM activities WHERE activity_code = 'P_ikigai_mini_map'
)
WHERE p.email LIKE '%@vespa.academy'
GROUP BY p.first_name, p.last_name;

SELECT '✅ Cycle 2 open! Questionnaire unlocked! Ikigai Quest assigned!' AS status;

