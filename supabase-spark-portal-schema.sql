-- ============================================================================
-- SPARK PORTAL: Additional Schema for Student Portal
-- Created: October 15, 2025
-- Purpose: Add tables and fields for student portal features
-- ============================================================================

-- ============================================================================
-- 1. ASSESSMENT CYCLES TABLE
-- Manages questionnaire cycles at org/year/tutor level
-- ============================================================================

CREATE TABLE IF NOT EXISTS assessment_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Scope of cycle (NULL = organization-wide)
  year_group TEXT,  -- e.g., 'Year 8', NULL = all years
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,  -- NULL = year/org level
  
  -- Cycle details
  cycle_number INT NOT NULL CHECK (cycle_number BETWEEN 1 AND 3),
  cycle_name TEXT,  -- e.g., 'Autumn 2025', 'Spring 2026'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT max_duration CHECK (end_date - start_date <= 21),  -- 3 weeks max
  UNIQUE(organization_id, year_group, class_id, cycle_number)
);

-- Index for quick cycle lookups
CREATE INDEX idx_cycles_org_dates ON assessment_cycles(organization_id, start_date, end_date);
CREATE INDEX idx_cycles_class ON assessment_cycles(class_id) WHERE class_id IS NOT NULL;

-- Enable RLS
ALTER TABLE assessment_cycles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view cycles in their org"
  ON assessment_cycles FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage cycles"
  ON assessment_cycles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('org_admin', 'super_admin')
    )
  );

-- ============================================================================
-- 2. UPDATE ACTIVITIES TABLE
-- Add fields for interactive activities and prescriptions
-- ============================================================================

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS prescribed_for TEXT[],  -- e.g., ['Low-S', 'Average-S']
  ADD COLUMN IF NOT EXISTS difficulty_level INT DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 3),
  ADD COLUMN IF NOT EXISTS interactive_type TEXT,  -- 'ikigai', 'video_quiz', 'scenario', 'canvas', etc.
  ADD COLUMN IF NOT EXISTS interactive_config JSONB,  -- Activity-specific settings
  ADD COLUMN IF NOT EXISTS requires_evidence BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS evidence_types TEXT[];  -- ['text', 'upload', 'quiz', 'canvas']

-- Add comment to explain interactive_config
COMMENT ON COLUMN activities.interactive_config IS 'JSON config for interactive activities: {videoUrl, questions, canvasConfig, etc.}';

-- ============================================================================
-- 3. UPDATE ACTIVITY_ASSIGNMENTS TABLE
-- Track assignment type and AI reasoning
-- ============================================================================

ALTER TABLE activity_assignments
  ADD COLUMN IF NOT EXISTS assignment_type TEXT DEFAULT 'ai_prescribed' 
    CHECK (assignment_type IN ('ai_prescribed', 'teacher_assigned', 'student_selected')),
  ADD COLUMN IF NOT EXISTS prescribed_reason TEXT,  -- AI explanation
  ADD COLUMN IF NOT EXISTS prescribed_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS cycle_number INT;  -- Which cycle this assignment is for

CREATE INDEX idx_assignments_cycle ON activity_assignments(student_id, cycle_number);

-- ============================================================================
-- 4. UPDATE ACTIVITY_COMPLETIONS TABLE
-- Add approval workflow and evidence tracking
-- ============================================================================

ALTER TABLE activity_completions
  ADD COLUMN IF NOT EXISTS level INT DEFAULT 1 CHECK (level BETWEEN 1 AND 3),
  ADD COLUMN IF NOT EXISTS evidence_text TEXT,
  ADD COLUMN IF NOT EXISTS evidence_file_url TEXT,
  ADD COLUMN IF NOT EXISTS evidence_data JSONB,  -- For quiz answers, canvas data, etc.
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS teacher_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS teacher_reviewed_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS teacher_feedback TEXT,
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'not_submitted' 
    CHECK (approval_status IN ('not_submitted', 'submitted', 'approved', 'needs_revision')),
  ADD COLUMN IF NOT EXISTS mastery_achieved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS points_earned INT DEFAULT 0;

-- Index for teacher review queue
CREATE INDEX idx_completions_pending_review 
  ON activity_completions(approval_status, submitted_at) 
  WHERE approval_status = 'submitted';

-- ============================================================================
-- 5. STUDENT BADGES TABLE
-- Track achievements and gamification
-- ============================================================================

CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  
  -- Badge details
  badge_type TEXT NOT NULL,  -- 'first_completion', 'streak', 'dimension_master', 'champion', 'mastery'
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,  -- Emoji or icon name
  
  -- Context
  dimension TEXT,  -- NULL for non-dimension badges
  cycle_number INT,
  metadata JSONB,  -- Additional badge-specific data
  
  -- Timestamps
  earned_date TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, badge_type, dimension, cycle_number)
);

CREATE INDEX idx_badges_student ON student_badges(student_id, earned_date DESC);

-- Enable RLS
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view their own badges"
  ON student_badges FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
  );

CREATE POLICY "Staff can view student badges"
  ON student_badges FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM students s
      JOIN profiles p ON s.organization_id = p.organization_id
      WHERE p.id = auth.uid()
    )
  );

-- ============================================================================
-- 6. STUDENT REFLECTIONS - UPDATE
-- Add cycle tracking and version history
-- ============================================================================

ALTER TABLE student_reflections
  ADD COLUMN IF NOT EXISTS cycle_number INT,
  ADD COLUMN IF NOT EXISTS report_id UUID REFERENCES assessment_results(id) ON DELETE CASCADE;

CREATE INDEX idx_reflections_report ON student_reflections(report_id);

-- ============================================================================
-- 7. STUDENT GOALS TABLE (NEW)
-- Track student goal setting
-- ============================================================================

CREATE TABLE IF NOT EXISTS student_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  report_id UUID REFERENCES assessment_results(id) ON DELETE CASCADE,
  cycle_number INT,
  
  -- Goal details
  goal_text TEXT NOT NULL,
  target_date DATE,
  dimension TEXT,  -- Which SPARK dimension this goal targets
  
  -- Progress
  status TEXT DEFAULT 'not_started' 
    CHECK (status IN ('not_started', 'in_progress', 'achieved', 'abandoned')),
  progress_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  achieved_at TIMESTAMPTZ
);

CREATE INDEX idx_goals_student ON student_goals(student_id, created_at DESC);
CREATE INDEX idx_goals_report ON student_goals(report_id);

-- Enable RLS
ALTER TABLE student_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can manage their own goals"
  ON student_goals FOR ALL
  TO authenticated
  USING (
    student_id = auth.uid()
  );

CREATE POLICY "Staff can view student goals"
  ON student_goals FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM students s
      JOIN profiles p ON s.organization_id = p.organization_id
      WHERE p.id = auth.uid()
    )
  );

-- ============================================================================
-- 8. UPDATE ASSESSMENT_RESULTS TABLE
-- Add version history for report edits
-- ============================================================================

ALTER TABLE assessment_results
  ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES profiles(id);

-- ============================================================================
-- 9. STAFF NOTES - UPDATE
-- Add visibility control and threading
-- ============================================================================

ALTER TABLE staff_notes
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'staff_only' 
    CHECK (visibility IN ('staff_only', 'student_visible')),
  ADD COLUMN IF NOT EXISTS parent_note_id UUID REFERENCES staff_notes(id),  -- For threading
  ADD COLUMN IF NOT EXISTS report_id UUID REFERENCES assessment_results(id);

CREATE INDEX idx_notes_report ON staff_notes(report_id) WHERE report_id IS NOT NULL;

-- ============================================================================
-- 10. QUESTIONNAIRE RESPONSES - UPDATE
-- Add cycle tracking and lockout
-- ============================================================================

ALTER TABLE questionnaire_responses
  ADD COLUMN IF NOT EXISTS cycle_id UUID REFERENCES assessment_cycles(id),
  ADD COLUMN IF NOT EXISTS cycle_number INT,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

CREATE INDEX idx_responses_cycle ON questionnaire_responses(student_id, cycle_number);

-- ============================================================================
-- 11. ACTIVITY PROGRESS TRACKING (NEW)
-- Track student progress through activity steps
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES activity_assignments(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_step INT DEFAULT 1,
  total_steps INT,
  steps_completed INT[] DEFAULT ARRAY[]::INT[],
  progress_data JSONB,  -- Activity-specific progress (quiz answers, canvas state, etc.)
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, activity_id, assignment_id)
);

CREATE INDEX idx_progress_student ON activity_progress(student_id, last_activity_at DESC);

-- Enable RLS
ALTER TABLE activity_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can manage their own progress"
  ON activity_progress FOR ALL
  TO authenticated
  USING (
    student_id = auth.uid()
  );

-- ============================================================================
-- 12. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Check if student can access questionnaire
CREATE OR REPLACE FUNCTION can_student_access_questionnaire(
  p_student_id UUID,
  p_organization_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_cycle_open BOOLEAN;
  v_student_locked BOOLEAN;
BEGIN
  -- Check if there's an active cycle
  SELECT EXISTS (
    SELECT 1 FROM assessment_cycles
    WHERE organization_id = p_organization_id
    AND CURRENT_DATE BETWEEN start_date AND end_date
  ) INTO v_cycle_open;
  
  IF NOT v_cycle_open THEN
    RETURN FALSE;
  END IF;
  
  -- Check if student is locked
  SELECT EXISTS (
    SELECT 1 FROM questionnaire_responses
    WHERE student_id = p_student_id
    AND (
      locked_until > NOW()
      OR (
        cycle_id IN (
          SELECT id FROM assessment_cycles
          WHERE organization_id = p_organization_id
          AND CURRENT_DATE BETWEEN start_date AND end_date
        )
        AND status = 'completed'
      )
    )
  ) INTO v_student_locked;
  
  RETURN NOT v_student_locked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Award badge to student
CREATE OR REPLACE FUNCTION award_badge(
  p_student_id UUID,
  p_badge_type TEXT,
  p_badge_name TEXT,
  p_badge_description TEXT DEFAULT NULL,
  p_dimension TEXT DEFAULT NULL,
  p_cycle_number INT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_badge_id UUID;
BEGIN
  INSERT INTO student_badges (
    student_id,
    badge_type,
    badge_name,
    badge_description,
    dimension,
    cycle_number
  ) VALUES (
    p_student_id,
    p_badge_type,
    p_badge_name,
    p_badge_description,
    p_dimension,
    p_cycle_number
  )
  ON CONFLICT (student_id, badge_type, dimension, cycle_number) DO NOTHING
  RETURNING id INTO v_badge_id;
  
  RETURN v_badge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update activity_completions updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activity_completions_updated_at
  BEFORE UPDATE ON activity_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_goals_updated_at
  BEFORE UPDATE ON student_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Award "First Completion" badge
CREATE OR REPLACE FUNCTION check_first_completion_badge()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.approval_status = 'approved' AND OLD.approval_status != 'approved' THEN
    -- Check if this is student's first completion
    IF NOT EXISTS (
      SELECT 1 FROM activity_completions
      WHERE student_id = NEW.student_id
      AND approval_status = 'approved'
      AND id != NEW.id
    ) THEN
      PERFORM award_badge(
        NEW.student_id,
        'first_completion',
        '🌟 First Activity Complete!',
        'Completed your first SPARK activity'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER award_first_completion_badge
  AFTER UPDATE ON activity_completions
  FOR EACH ROW
  EXECUTE FUNCTION check_first_completion_badge();

-- ============================================================================
-- 13. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Student Activity Dashboard
CREATE OR REPLACE VIEW student_activity_dashboard AS
SELECT 
  s.id AS student_id,
  aa.id AS assignment_id,
  a.id AS activity_id,
  a.title,
  a.dimension,
  a.time_minutes,
  a.difficulty_level,
  aa.assignment_type,
  aa.cycle_number,
  COALESCE(ac.approval_status, 'not_submitted') AS status,
  ac.submitted_at,
  ac.teacher_reviewed_at,
  ac.points_earned,
  ap.current_step,
  ap.total_steps,
  -- Calculate progress percentage from steps
  CASE 
    WHEN ap.total_steps > 0 THEN (array_length(ap.steps_completed, 1)::float / ap.total_steps * 100)::int
    ELSE 0
  END AS progress_percentage
FROM students s
JOIN activity_assignments aa ON aa.student_id = s.id
JOIN activities a ON a.id = aa.activity_id
LEFT JOIN activity_completions ac ON ac.assignment_id = aa.id
LEFT JOIN activity_progress ap ON ap.assignment_id = aa.id;

-- View: Teacher Review Queue
CREATE OR REPLACE VIEW teacher_review_queue AS
SELECT 
  ac.id AS completion_id,
  s.id AS student_id,
  p.first_name || ' ' || p.last_name AS student_name,
  a.title AS activity_title,
  a.dimension,
  ac.submitted_at,
  ac.evidence_text,
  ac.evidence_file_url,
  ac.evidence_data,
  c.name AS class_name
FROM activity_completions ac
JOIN students s ON s.id = ac.student_id
JOIN profiles p ON p.id = s.id
JOIN activities a ON a.id = ac.activity_id
LEFT JOIN class_members cm ON cm.student_id = s.id
LEFT JOIN classes c ON c.id = cm.class_id
WHERE ac.approval_status = 'submitted'
ORDER BY ac.submitted_at ASC;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- COMPLETED
-- ============================================================================

-- Summary of additions:
-- 1. assessment_cycles - Cycle management
-- 2. Updated activities - Interactive config
-- 3. Updated activity_assignments - Assignment tracking
-- 4. Updated activity_completions - Approval workflow
-- 5. student_badges - Gamification
-- 6. Updated student_reflections - Cycle tracking
-- 7. student_goals - Goal setting
-- 8. Updated assessment_results - Edit history
-- 9. Updated staff_notes - Report linking
-- 10. Updated questionnaire_responses - Lockout
-- 11. activity_progress - Step-by-step tracking
-- 12. Functions & triggers - Automation
-- 13. Views - Common queries

-- Run this file after the main supabase-spark-schema.sql

SELECT 'SPARK Portal schema additions completed successfully!' AS status;

