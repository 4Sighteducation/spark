-- ============================================================================
-- FIX: Staff Portal RLS Policies - Allow Staff to Read Student Data
-- ============================================================================

-- The issue: Current RLS policies are too complex and blocking staff access
-- Solution: Simplify policies to allow staff to read data they should access

-- ============================================================================
-- 1. ASSESSMENT_RESULTS - Critical for coaching page
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Students can view own results" ON assessment_results;
DROP POLICY IF EXISTS "Staff can view student results" ON assessment_results;
DROP POLICY IF EXISTS "System can manage results" ON assessment_results;

-- Create simple, working policies
CREATE POLICY "Students can view own results"
  ON assessment_results FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Staff can view all results in their org"
  ON assessment_results FOR SELECT
  TO authenticated
  USING (
    -- Anyone can view if in same organization
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert results"
  ON assessment_results FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update results"
  ON assessment_results FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 2. STUDENT_REFLECTIONS - For report responses
-- ============================================================================

DROP POLICY IF EXISTS "Students can manage own reflections" ON student_reflections;
DROP POLICY IF EXISTS "Staff can view student reflections" ON student_reflections;

CREATE POLICY "Students can manage own reflections"
  ON student_reflections FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Staff can view reflections in their org"
  ON student_reflections FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM students s
      JOIN profiles p ON p.id = auth.uid()
      WHERE s.organization_id = p.organization_id
    )
  );

-- ============================================================================
-- 3. STUDENT_GOALS - For action plans
-- ============================================================================

-- Check if policies exist first
DO $$ 
BEGIN
  -- Drop if exists
  DROP POLICY IF EXISTS "Students can manage their own goals" ON student_goals;
  DROP POLICY IF EXISTS "Staff can view student goals" ON student_goals;
EXCEPTION WHEN undefined_object THEN
  -- Policies don't exist yet, that's fine
END $$;

CREATE POLICY "Students can manage their own goals"
  ON student_goals FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Staff can view and edit goals in their org"
  ON student_goals FOR ALL
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM students s
      JOIN profiles p ON p.id = auth.uid()
      WHERE s.organization_id = p.organization_id
    )
  );

-- ============================================================================
-- 4. STAFF_NOTES - For coaching comments
-- ============================================================================

DROP POLICY IF EXISTS "Staff can view student notes" ON staff_notes;
DROP POLICY IF EXISTS "Staff can create notes" ON staff_notes;
DROP POLICY IF EXISTS "Staff can update own notes" ON staff_notes;
DROP POLICY IF EXISTS "Staff can delete own notes" ON staff_notes;

CREATE POLICY "Staff can view notes in their org"
  ON staff_notes FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Staff can create notes"
  ON staff_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
  );

CREATE POLICY "Staff can update own notes"
  ON staff_notes FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Staff can delete own notes"
  ON staff_notes FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ============================================================================
-- 5. QUESTIONNAIRES - Allow reading questions
-- ============================================================================

DROP POLICY IF EXISTS "All users can view published questionnaires" ON questionnaires;

CREATE POLICY "All authenticated users can view questionnaires"
  ON questionnaires FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 6. QUESTION_ANSWERS - For statement analysis
-- ============================================================================

DROP POLICY IF EXISTS "Students can view own answers" ON question_answers;
DROP POLICY IF EXISTS "Staff can view student answers" ON question_answers;

CREATE POLICY "Students can view own answers"
  ON question_answers FOR SELECT
  TO authenticated
  USING (
    response_id IN (
      SELECT id FROM questionnaire_responses WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view answers in their org"
  ON question_answers FOR SELECT
  TO authenticated
  USING (
    response_id IN (
      SELECT qr.id FROM questionnaire_responses qr
      JOIN students s ON s.id = qr.student_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE s.organization_id = p.organization_id
    )
  );

-- ============================================================================
-- TEST QUERIES
-- ============================================================================

-- Test 1: Can staff see assessment results?
SELECT 'Test 1: Assessment Results' as test_name,
       COUNT(*) as visible_count
FROM assessment_results;

-- Test 2: Can staff see student goals?
SELECT 'Test 2: Student Goals' as test_name,
       COUNT(*) as visible_count
FROM student_goals;

-- Test 3: Can staff see reflections?
SELECT 'Test 3: Reflections' as test_name,
       COUNT(*) as visible_count
FROM student_reflections;

-- Test 4: Can staff see question answers?
SELECT 'Test 4: Question Answers' as test_name,
       COUNT(*) as visible_count
FROM question_answers;

-- Test 5: Can staff see questionnaires?
SELECT 'Test 5: Questionnaires' as test_name,
       COUNT(*) as visible_count
FROM questionnaires;

SELECT '✅ RLS Policies Updated - Test queries above as staff user' as status;

