-- ============================================================================
-- SPARK ACADEMY - Pre-filled Test Questionnaire Responses (CORRECTED)
-- Created: October 15, 2025
-- Purpose: Generate realistic questionnaire responses for 3 test students
-- ============================================================================

-- Billy Nomad: HIGH scorer (7-9 across all dimensions)
-- Sarah Hinchcliffe: MEDIUM scorer (4-6, mixed profile)
-- Clare Handsoff: LOW scorer (2-4 across dimensions)

-- ============================================================================
-- Helper Function: Generate realistic slider values
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_slider_value(
  p_target_score NUMERIC,
  p_variance NUMERIC DEFAULT 1.0
)
RETURNS INT AS $$
DECLARE
  v_slider_value INT;
  v_random_offset NUMERIC;
BEGIN
  v_random_offset := (random() - 0.5) * p_variance * 10;
  v_slider_value := ROUND((p_target_score * 10) + v_random_offset);
  RETURN GREATEST(0, LEAST(100, v_slider_value));
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. BILLY NOMAD - HIGH SCORER
-- ============================================================================

DO $$
DECLARE
  v_student_id UUID;
  v_response_id UUID;
BEGIN
  -- Get Billy's student ID
  SELECT id INTO v_student_id 
  FROM students 
  WHERE id = (SELECT id FROM profiles WHERE email = 'stutest1@vespa.academy');
  
  IF v_student_id IS NULL THEN
    RAISE NOTICE 'Billy Nomad not found - skipping';
    RETURN;
  END IF;
  
  -- Delete existing responses for clean slate
  DELETE FROM questionnaire_responses 
  WHERE student_id = v_student_id AND cycle_number = 1;
  
  -- Create questionnaire response
  INSERT INTO questionnaire_responses (
    student_id,
    questionnaire_id,
    organization_id,
    cycle_id,
    cycle_number,
    status,
    started_at,
    completed_at
  ) VALUES (
    v_student_id,
    '00000000-0000-0000-0000-000000000000',
    'a1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    1,
    'completed',
    '2025-10-05 09:00:00'::timestamptz,
    '2025-10-05 09:25:00'::timestamptz
  )
  RETURNING id INTO v_response_id;
  
  -- Billy's answers (HIGH profile: 7-9 range)
  INSERT INTO question_answers (response_id, question_id, dimension, slider_value) VALUES
    -- Self-Direction (Target: 8.0)
    (v_response_id, 'S01', 'S', generate_slider_value(8.0)),
    (v_response_id, 'S02', 'S', generate_slider_value(8.5)),
    (v_response_id, 'S03', 'S', generate_slider_value(7.8)),
    (v_response_id, 'S04', 'S', generate_slider_value(8.2)),
    (v_response_id, 'S05', 'S', generate_slider_value(8.0)),
    (v_response_id, 'S06', 'S', generate_slider_value(8.3)),
    -- Purpose (Target: 7.8)
    (v_response_id, 'P01', 'P', generate_slider_value(7.5)),
    (v_response_id, 'P02', 'P', generate_slider_value(8.0)),
    (v_response_id, 'P03', 'P', generate_slider_value(7.8)),
    (v_response_id, 'P04', 'P', generate_slider_value(7.6)),
    (v_response_id, 'P05', 'P', generate_slider_value(8.2)),
    (v_response_id, 'P06', 'P', generate_slider_value(7.7)),
    -- Awareness (Target: 8.5)
    (v_response_id, 'A01', 'A', generate_slider_value(8.7)),
    (v_response_id, 'A02', 'A', generate_slider_value(8.5)),
    (v_response_id, 'A03', 'A', generate_slider_value(8.3)),
    (v_response_id, 'A04', 'A', generate_slider_value(8.6)),
    (v_response_id, 'A05', 'A', generate_slider_value(8.4)),
    (v_response_id, 'A06', 'A', generate_slider_value(8.8)),
    (v_response_id, 'A07', 'A', generate_slider_value(8.2)),
    -- Resilience (Target: 7.5)
    (v_response_id, 'R01', 'R', generate_slider_value(7.3)),
    (v_response_id, 'R02', 'R', generate_slider_value(7.8)),
    (v_response_id, 'R03', 'R', generate_slider_value(7.5)),
    (v_response_id, 'R04', 'R', generate_slider_value(7.2)),
    (v_response_id, 'R05', 'R', generate_slider_value(7.7)),
    (v_response_id, 'R06', 'R', generate_slider_value(7.6)),
    (v_response_id, 'R07', 'R', generate_slider_value(7.4)),
    -- Knowledge (Target: 8.0)
    (v_response_id, 'K01', 'K', generate_slider_value(8.2)),
    (v_response_id, 'K02', 'K', generate_slider_value(7.8)),
    (v_response_id, 'K03', 'K', generate_slider_value(8.0)),
    (v_response_id, 'K04', 'K', generate_slider_value(8.3)),
    (v_response_id, 'K05', 'K', generate_slider_value(7.9)),
    (v_response_id, 'K06', 'K', generate_slider_value(8.1)),
    (v_response_id, 'K07', 'K', generate_slider_value(8.0));
  
  RAISE NOTICE 'Billy Nomad: % answers created', (SELECT COUNT(*) FROM question_answers WHERE response_id = v_response_id);
END $$;

-- ============================================================================
-- 2. SARAH HINCHCLIFFE - MEDIUM SCORER
-- ============================================================================

DO $$
DECLARE
  v_student_id UUID;
  v_response_id UUID;
BEGIN
  -- Get Sarah's student ID
  SELECT id INTO v_student_id
  FROM students
  WHERE id = (SELECT id FROM profiles WHERE email = 'stutest2@vespa.academy');
  
  IF v_student_id IS NULL THEN
    RAISE NOTICE 'Sarah Hinchcliffe not found - skipping';
    RETURN;
  END IF;
  
  -- Delete existing responses
  DELETE FROM questionnaire_responses 
  WHERE student_id = v_student_id AND cycle_number = 1;
  
  -- Create questionnaire response
  INSERT INTO questionnaire_responses (
    student_id,
    questionnaire_id,
    organization_id,
    cycle_id,
    cycle_number,
    status,
    started_at,
    completed_at
  ) VALUES (
    v_student_id,
    '00000000-0000-0000-0000-000000000000',
    'a1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    1,
    'completed',
    '2025-10-08 14:00:00'::timestamptz,
    '2025-10-08 14:22:00'::timestamptz
  )
  RETURNING id INTO v_response_id;
  
  -- Sarah's answers (MEDIUM profile: 4-6 range, mixed)
  INSERT INTO question_answers (response_id, question_id, dimension, slider_value) VALUES
    -- Self-Direction (Target: 5.5)
    (v_response_id, 'S01', 'S', generate_slider_value(5.8, 1.2)),
    (v_response_id, 'S02', 'S', generate_slider_value(6.0, 1.2)),
    (v_response_id, 'S03', 'S', generate_slider_value(5.2, 1.2)),
    (v_response_id, 'S04', 'S', generate_slider_value(5.5, 1.2)),
    (v_response_id, 'S05', 'S', generate_slider_value(5.3, 1.2)),
    (v_response_id, 'S06', 'S', generate_slider_value(5.7, 1.2)),
    -- Purpose (Target: 4.5)
    (v_response_id, 'P01', 'P', generate_slider_value(4.8, 1.2)),
    (v_response_id, 'P02', 'P', generate_slider_value(4.2, 1.2)),
    (v_response_id, 'P03', 'P', generate_slider_value(4.5, 1.2)),
    (v_response_id, 'P04', 'P', generate_slider_value(4.3, 1.2)),
    (v_response_id, 'P05', 'P', generate_slider_value(4.7, 1.2)),
    (v_response_id, 'P06', 'P', generate_slider_value(4.6, 1.2)),
    -- Awareness (Target: 6.2)
    (v_response_id, 'A01', 'A', generate_slider_value(6.5, 1.2)),
    (v_response_id, 'A02', 'A', generate_slider_value(6.0, 1.2)),
    (v_response_id, 'A03', 'A', generate_slider_value(6.3, 1.2)),
    (v_response_id, 'A04', 'A', generate_slider_value(6.8, 1.2)),
    (v_response_id, 'A05', 'A', generate_slider_value(5.9, 1.2)),
    (v_response_id, 'A06', 'A', generate_slider_value(6.1, 1.2)),
    (v_response_id, 'A07', 'A', generate_slider_value(6.4, 1.2)),
    -- Resilience (Target: 4.8)
    (v_response_id, 'R01', 'R', generate_slider_value(5.0, 1.2)),
    (v_response_id, 'R02', 'R', generate_slider_value(4.5, 1.2)),
    (v_response_id, 'R03', 'R', generate_slider_value(4.8, 1.2)),
    (v_response_id, 'R04', 'R', generate_slider_value(4.6, 1.2)),
    (v_response_id, 'R05', 'R', generate_slider_value(5.2, 1.2)),
    (v_response_id, 'R06', 'R', generate_slider_value(4.7, 1.2)),
    (v_response_id, 'R07', 'R', generate_slider_value(4.9, 1.2)),
    -- Knowledge (Target: 5.3)
    (v_response_id, 'K01', 'K', generate_slider_value(5.5, 1.2)),
    (v_response_id, 'K02', 'K', generate_slider_value(5.0, 1.2)),
    (v_response_id, 'K03', 'K', generate_slider_value(5.4, 1.2)),
    (v_response_id, 'K04', 'K', generate_slider_value(5.6, 1.2)),
    (v_response_id, 'K05', 'K', generate_slider_value(5.2, 1.2)),
    (v_response_id, 'K06', 'K', generate_slider_value(5.1, 1.2)),
    (v_response_id, 'K07', 'K', generate_slider_value(5.3, 1.2));
  
  RAISE NOTICE 'Sarah Hinchcliffe: % answers created', (SELECT COUNT(*) FROM question_answers WHERE response_id = v_response_id);
END $$;

-- ============================================================================
-- 3. CLARE HANDSOFF - LOW SCORER
-- ============================================================================

DO $$
DECLARE
  v_student_id UUID;
  v_response_id UUID;
BEGIN
  -- Get Clare's student ID
  SELECT id INTO v_student_id
  FROM students
  WHERE id = (SELECT id FROM profiles WHERE email = 'stutest3@vespa.academy');
  
  IF v_student_id IS NULL THEN
    RAISE NOTICE 'Clare Handsoff not found - skipping';
    RETURN;
  END IF;
  
  -- Delete existing responses
  DELETE FROM questionnaire_responses 
  WHERE student_id = v_student_id AND cycle_number = 1;
  
  -- Create questionnaire response
  INSERT INTO questionnaire_responses (
    student_id,
    questionnaire_id,
    organization_id,
    cycle_id,
    cycle_number,
    status,
    started_at,
    completed_at
  ) VALUES (
    v_student_id,
    '00000000-0000-0000-0000-000000000000',
    'a1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    1,
    'completed',
    '2025-10-12 10:30:00'::timestamptz,
    '2025-10-12 10:48:00'::timestamptz
  )
  RETURNING id INTO v_response_id;
  
  -- Clare's answers (LOW profile: 2-4 range)
  INSERT INTO question_answers (response_id, question_id, dimension, slider_value) VALUES
    -- Self-Direction (Target: 3.2)
    (v_response_id, 'S01', 'S', generate_slider_value(3.5, 1.5)),
    (v_response_id, 'S02', 'S', generate_slider_value(2.8, 1.5)),
    (v_response_id, 'S03', 'S', generate_slider_value(3.0, 1.5)),
    (v_response_id, 'S04', 'S', generate_slider_value(3.3, 1.5)),
    (v_response_id, 'S05', 'S', generate_slider_value(3.1, 1.5)),
    (v_response_id, 'S06', 'S', generate_slider_value(3.4, 1.5)),
    -- Purpose (Target: 2.8)
    (v_response_id, 'P01', 'P', generate_slider_value(2.5, 1.5)),
    (v_response_id, 'P02', 'P', generate_slider_value(3.0, 1.5)),
    (v_response_id, 'P03', 'P', generate_slider_value(2.8, 1.5)),
    (v_response_id, 'P04', 'P', generate_slider_value(2.6, 1.5)),
    (v_response_id, 'P05', 'P', generate_slider_value(2.9, 1.5)),
    (v_response_id, 'P06', 'P', generate_slider_value(3.1, 1.5)),
    -- Awareness (Target: 3.5)
    (v_response_id, 'A01', 'A', generate_slider_value(3.8, 1.5)),
    (v_response_id, 'A02', 'A', generate_slider_value(3.3, 1.5)),
    (v_response_id, 'A03', 'A', generate_slider_value(3.5, 1.5)),
    (v_response_id, 'A04', 'A', generate_slider_value(3.7, 1.5)),
    (v_response_id, 'A05', 'A', generate_slider_value(3.2, 1.5)),
    (v_response_id, 'A06', 'A', generate_slider_value(3.6, 1.5)),
    (v_response_id, 'A07', 'A', generate_slider_value(3.4, 1.5)),
    -- Resilience (Target: 2.9)
    (v_response_id, 'R01', 'R', generate_slider_value(2.7, 1.5)),
    (v_response_id, 'R02', 'R', generate_slider_value(3.0, 1.5)),
    (v_response_id, 'R03', 'R', generate_slider_value(2.8, 1.5)),
    (v_response_id, 'R04', 'R', generate_slider_value(2.5, 1.5)),
    (v_response_id, 'R05', 'R', generate_slider_value(3.2, 1.5)),
    (v_response_id, 'R06', 'R', generate_slider_value(2.9, 1.5)),
    (v_response_id, 'R07', 'R', generate_slider_value(3.1, 1.5)),
    -- Knowledge (Target: 3.3)
    (v_response_id, 'K01', 'K', generate_slider_value(3.5, 1.5)),
    (v_response_id, 'K02', 'K', generate_slider_value(3.0, 1.5)),
    (v_response_id, 'K03', 'K', generate_slider_value(3.2, 1.5)),
    (v_response_id, 'K04', 'K', generate_slider_value(3.6, 1.5)),
    (v_response_id, 'K05', 'K', generate_slider_value(3.3, 1.5)),
    (v_response_id, 'K06', 'K', generate_slider_value(3.1, 1.5)),
    (v_response_id, 'K07', 'K', generate_slider_value(3.4, 1.5));
  
  RAISE NOTICE 'Clare Handsoff: % answers created', (SELECT COUNT(*) FROM question_answers WHERE response_id = v_response_id);
END $$;

-- ============================================================================
-- Clean up helper function
-- ============================================================================

DROP FUNCTION IF EXISTS generate_slider_value(NUMERIC, NUMERIC);

-- ============================================================================
-- Verify Results
-- ============================================================================

SELECT 
  p.first_name || ' ' || p.last_name AS student_name,
  qr.status::text AS status,
  qr.completed_at,
  COUNT(qa.id) AS num_answers
FROM questionnaire_responses qr
JOIN students s ON s.id = qr.student_id
JOIN profiles p ON p.id = s.id
LEFT JOIN question_answers qa ON qa.response_id = qr.id
WHERE p.email IN ('stutest1@vespa.academy', 'stutest2@vespa.academy', 'stutest3@vespa.academy')
GROUP BY p.first_name, p.last_name, qr.status, qr.completed_at
ORDER BY qr.completed_at;

SELECT '✅ Test responses created! Ready to calculate scores and build portal!' AS status;

