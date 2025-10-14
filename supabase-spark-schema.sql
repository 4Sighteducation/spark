-- ============================================================================
-- SPARK Database Schema v1.0
-- Psychometric assessment platform for Key Stage 3 students (ages 11-14)
-- ============================================================================
-- 
-- ARCHITECTURE OVERVIEW:
-- - Single organization per user (no cross-org membership)
-- - Role-based access control (staff can have multiple roles)
-- - Slider scoring: 0-100 → ÷10 for dimension scores
-- - Activities suggested by scores but overrideable by staff
-- 
-- TABLES:
-- 1. organizations - School/institution data
-- 2. profiles - All users (staff, students, parents)
-- 3. user_roles - Staff roles and permissions
-- 4. students - Student-specific data
-- 5. classes - Tutorial groups, teaching groups, year groups
-- 6. class_members - Students assigned to classes
-- 7. staff_class_assignments - Staff assigned to classes with roles
-- 8. questionnaires - Assessment versions
-- 9. questionnaire_responses - Individual student attempts
-- 10. question_answers - Individual question responses (slider values 0-100)
-- 11. assessment_results - Calculated dimension scores
-- 12. student_reflections - Student comments and goals on their reports
-- 13. activities - Activity library
-- 14. activity_assignments - Activities assigned/suggested to students
-- 15. activity_completions - Student activity progress and responses
-- 16. staff_notes - Teacher observations and comments
--
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User role types
CREATE TYPE user_role AS ENUM (
  'super_admin',      -- 4Sight staff, full system access
  'org_admin',        -- School admin, full org access
  'head_of_year',     -- Can view all students in their year
  'head_of_department', -- Can view students taking their subject
  'tutor',            -- Can view students in their tutor group
  'teacher',          -- Can view students in their classes
  'student',          -- Student access
  'parent'            -- Parent access (future)
);

-- User status
CREATE TYPE user_status AS ENUM (
  'active',
  'inactive',
  'suspended',
  'invited'
);

-- Questionnaire status
CREATE TYPE questionnaire_status AS ENUM (
  'draft',
  'active',
  'archived'
);

-- Response status
CREATE TYPE response_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'reviewed'
);

-- Activity status
CREATE TYPE activity_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'reviewed_by_teacher'
);

-- Class type
CREATE TYPE class_type AS ENUM (
  'tutor_group',
  'teaching_group',
  'year_group',
  'department',
  'intervention_group'
);

-- SPARK dimensions
CREATE TYPE spark_dimension AS ENUM (
  'S',  -- Self-Direction
  'P',  -- Purpose
  'A',  -- Awareness/Altruism
  'R',  -- Resilience
  'K'   -- Knowledge
);

-- Score bands
CREATE TYPE score_band AS ENUM (
  'low',        -- 0-3
  'average',    -- 3-5
  'high',       -- 5-8
  'very_high'   -- 8-10
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Organizations (Schools/Institutions)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  type TEXT, -- 'primary', 'secondary', 'academy', etc.
  address JSONB, -- {street, city, postcode, country}
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}', -- Org-specific settings
  subscription_tier TEXT DEFAULT 'trial', -- 'trial', 'basic', 'premium'
  subscription_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_active ON organizations(is_active) WHERE is_active = true;

-- Profiles (All users - staff, students, parents)
-- Links to Supabase auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT, -- Optional preferred name
  avatar_url TEXT,
  primary_role user_role NOT NULL,
  status user_status DEFAULT 'invited',
  date_of_birth DATE, -- Required for students
  phone TEXT,
  metadata JSONB DEFAULT '{}', -- Additional flexible data
  preferences JSONB DEFAULT '{}', -- UI preferences, notifications, etc.
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT profiles_dob_check CHECK (
    primary_role != 'student' OR date_of_birth IS NOT NULL
  )
);

CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(primary_role);
CREATE INDEX idx_profiles_status ON profiles(status);

-- User Roles (Staff can have multiple roles)
-- Example: A tutor might also be head of year
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  scope JSONB, -- Additional role context: {year: 8, department: 'Science'}
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional role expiry
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  UNIQUE(user_id, organization_id, role, scope)
  -- Note: Students should only have one role, enforced by application logic and triggers
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_org ON user_roles(organization_id);
CREATE INDEX idx_user_roles_active ON user_roles(is_active) WHERE is_active = true;

-- Students (Extended profile data for students)
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  student_id_number TEXT, -- School's internal ID
  year_group INTEGER NOT NULL, -- 7, 8, 9, etc.
  admission_date DATE,
  expected_graduation_date DATE,
  tutor_group TEXT,
  house TEXT, -- For house systems
  sen_status TEXT, -- Special Educational Needs status
  pp_status BOOLEAN DEFAULT false, -- Pupil Premium
  metadata JSONB DEFAULT '{}', -- Medical info, dietary, etc. (sensitive)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT students_year_group_valid CHECK (year_group BETWEEN 7 AND 14)
);

CREATE INDEX idx_students_org ON students(organization_id);
CREATE INDEX idx_students_year ON students(year_group);
CREATE INDEX idx_students_active ON students(is_active) WHERE is_active = true;
CREATE INDEX idx_students_student_id ON students(student_id_number);

-- Classes (Tutor groups, teaching groups, year groups, etc.)
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- '8A', 'Year 8', 'Science Set 1'
  code TEXT, -- Short code
  type class_type NOT NULL,
  year_group INTEGER, -- NULL for cross-year groups
  subject TEXT, -- For teaching groups
  description TEXT,
  academic_year TEXT NOT NULL, -- '2024-25'
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, code, academic_year)
);

CREATE INDEX idx_classes_org ON classes(organization_id);
CREATE INDEX idx_classes_type ON classes(type);
CREATE INDEX idx_classes_year ON classes(year_group);
CREATE INDEX idx_classes_active ON classes(is_active) WHERE is_active = true;

-- Class Members (Students in classes)
CREATE TABLE class_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ, -- NULL if still active
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(class_id, student_id, is_active)
);

CREATE INDEX idx_class_members_class ON class_members(class_id);
CREATE INDEX idx_class_members_student ON class_members(student_id);
CREATE INDEX idx_class_members_active ON class_members(is_active) WHERE is_active = true;

-- Staff Class Assignments (Staff assigned to classes with specific roles)
CREATE TABLE staff_class_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(class_id, staff_id, role, is_active)
);

CREATE INDEX idx_staff_class_staff ON staff_class_assignments(staff_id);
CREATE INDEX idx_staff_class_class ON staff_class_assignments(class_id);
CREATE INDEX idx_staff_class_active ON staff_class_assignments(is_active) WHERE is_active = true;

-- ============================================================================
-- QUESTIONNAIRE TABLES
-- ============================================================================

-- Questionnaires (Assessment versions)
CREATE TABLE questionnaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT NOT NULL UNIQUE, -- 'v1.0', 'v2.0'
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL, -- Full question data from SPARK_questionnaire.json
  status questionnaire_status DEFAULT 'draft',
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_questionnaires_version ON questionnaires(version);
CREATE INDEX idx_questionnaires_status ON questionnaires(status);
CREATE INDEX idx_questionnaires_default ON questionnaires(is_default) WHERE is_default = true;

-- Questionnaire Responses (Individual student attempts)
CREATE TABLE questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Response tracking
  status response_status DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  
  -- Metadata
  assigned_by UUID REFERENCES profiles(id), -- Who assigned this assessment
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  session_data JSONB DEFAULT '{}', -- Track progress, time per question, etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_responses_questionnaire ON questionnaire_responses(questionnaire_id);
CREATE INDEX idx_responses_student ON questionnaire_responses(student_id);
CREATE INDEX idx_responses_org ON questionnaire_responses(organization_id);
CREATE INDEX idx_responses_status ON questionnaire_responses(status);
CREATE INDEX idx_responses_completed ON questionnaire_responses(completed_at);

-- Question Answers (Individual question responses with slider values 0-100)
CREATE TABLE question_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL, -- 'S01', 'P02', etc.
  dimension spark_dimension NOT NULL,
  
  -- Slider value (0-100)
  slider_value INTEGER NOT NULL CHECK (slider_value BETWEEN 0 AND 100),
  
  -- Calculated score (slider_value / 10)
  score DECIMAL(3,1) GENERATED ALWAYS AS (slider_value::decimal / 10) STORED,
  
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  time_taken_seconds INTEGER, -- Time to answer
  
  UNIQUE(response_id, question_id)
);

CREATE INDEX idx_answers_response ON question_answers(response_id);
CREATE INDEX idx_answers_dimension ON question_answers(dimension);
CREATE INDEX idx_answers_question ON question_answers(question_id);

-- Assessment Results (Calculated dimension scores)
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL UNIQUE REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dimension scores (0-10, average of question scores)
  self_direction_score DECIMAL(3,1),
  purpose_score DECIMAL(3,1),
  awareness_score DECIMAL(3,1),
  resilience_score DECIMAL(3,1),
  knowledge_score DECIMAL(3,1),
  overall_score DECIMAL(3,1),
  
  -- Score bands
  self_direction_band score_band,
  purpose_band score_band,
  awareness_band score_band,
  resilience_band score_band,
  knowledge_band score_band,
  overall_band score_band,
  
  -- Percentile rankings (optional, for future calibration)
  self_direction_percentile INTEGER CHECK (self_direction_percentile BETWEEN 0 AND 100),
  purpose_percentile INTEGER CHECK (purpose_percentile BETWEEN 0 AND 100),
  awareness_percentile INTEGER CHECK (awareness_percentile BETWEEN 0 AND 100),
  resilience_percentile INTEGER CHECK (resilience_percentile BETWEEN 0 AND 100),
  knowledge_percentile INTEGER CHECK (knowledge_percentile BETWEEN 0 AND 100),
  
  -- Report data
  report_data JSONB, -- Full personalized statements, reflection questions
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  recalculated_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT results_scores_valid CHECK (
    self_direction_score BETWEEN 0 AND 10 AND
    purpose_score BETWEEN 0 AND 10 AND
    awareness_score BETWEEN 0 AND 10 AND
    resilience_score BETWEEN 0 AND 10 AND
    knowledge_score BETWEEN 0 AND 10 AND
    overall_score BETWEEN 0 AND 10
  )
);

CREATE INDEX idx_results_student ON assessment_results(student_id);
CREATE INDEX idx_results_org ON assessment_results(organization_id);
CREATE INDEX idx_results_response ON assessment_results(response_id);
CREATE INDEX idx_results_calculated ON assessment_results(calculated_at);

-- Student Reflections (Student comments and goals on reports)
CREATE TABLE student_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID NOT NULL REFERENCES assessment_results(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  dimension spark_dimension, -- NULL for overall reflection
  
  -- Student input
  reflection_text TEXT,
  goals JSONB, -- Array of goal objects: [{goal: "text", deadline: "date", completed: false}]
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reflections_result ON student_reflections(result_id);
CREATE INDEX idx_reflections_student ON student_reflections(student_id);
CREATE INDEX idx_reflections_dimension ON student_reflections(dimension);

-- ============================================================================
-- ACTIVITY TABLES
-- ============================================================================

-- Activities (Activity library)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_code TEXT UNIQUE NOT NULL, -- 'S_two_minute_takeoff'
  title TEXT NOT NULL,
  dimension spark_dimension NOT NULL,
  suggested_bands score_band[] DEFAULT '{}', -- Which score bands this targets
  
  -- Content
  description TEXT NOT NULL,
  instructions JSONB NOT NULL, -- Steps, materials, etc. from activities JSON
  time_minutes INTEGER,
  difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced'
  
  -- Categorization
  tags TEXT[] DEFAULT '{}',
  source TEXT, -- 'original', 'adapted_from_vespa'
  
  -- Activity type and data
  activity_type TEXT NOT NULL, -- 'interactive', 'reflective', 'worksheet', 'game'
  interactive_config JSONB, -- Configuration for interactive activities (like Ikigai)
  
  -- Metadata
  is_published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_code ON activities(activity_code);
CREATE INDEX idx_activities_dimension ON activities(dimension);
CREATE INDEX idx_activities_published ON activities(is_published) WHERE is_published = true;
CREATE INDEX idx_activities_featured ON activities(featured) WHERE featured = true;

-- Activity Assignments (Activities assigned/suggested to students)
CREATE TABLE activity_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  -- Assignment context
  assigned_by UUID REFERENCES profiles(id), -- NULL if auto-suggested
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_required BOOLEAN DEFAULT false, -- vs optional/suggested
  due_date TIMESTAMPTZ,
  
  -- Linked to assessment
  result_id UUID REFERENCES assessment_results(id), -- Which assessment triggered this
  
  -- Priority/ordering
  priority INTEGER DEFAULT 0, -- Higher = more important
  
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(activity_id, student_id, assigned_at)
);

CREATE INDEX idx_assignments_activity ON activity_assignments(activity_id);
CREATE INDEX idx_assignments_student ON activity_assignments(student_id);
CREATE INDEX idx_assignments_assigned_by ON activity_assignments(assigned_by);
CREATE INDEX idx_assignments_result ON activity_assignments(result_id);

-- Activity Completions (Student activity progress and responses)
CREATE TABLE activity_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES activity_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  
  -- Progress tracking
  status activity_status DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  
  -- Student responses
  response_data JSONB, -- Flexible storage for different activity types
  
  -- Teacher review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  teacher_feedback TEXT,
  teacher_rating INTEGER CHECK (teacher_rating BETWEEN 1 AND 5),
  
  -- Gamification
  points_earned INTEGER DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX idx_completions_assignment ON activity_completions(assignment_id);
CREATE INDEX idx_completions_student ON activity_completions(student_id);
CREATE INDEX idx_completions_activity ON activity_completions(activity_id);
CREATE INDEX idx_completions_status ON activity_completions(status);
CREATE INDEX idx_completions_completed ON activity_completions(completed_at);

-- ============================================================================
-- STAFF NOTES & OBSERVATIONS
-- ============================================================================

-- Staff Notes (Teacher observations and comments on students)
CREATE TABLE staff_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Note content
  note_type TEXT NOT NULL, -- 'observation', 'concern', 'praise', 'intervention'
  title TEXT,
  content TEXT NOT NULL,
  
  -- Linking
  result_id UUID REFERENCES assessment_results(id), -- Link to assessment
  activity_completion_id UUID REFERENCES activity_completions(id), -- Link to activity
  
  -- Visibility
  is_sensitive BOOLEAN DEFAULT false, -- Restrict access
  shared_with_student BOOLEAN DEFAULT false,
  shared_with_parents BOOLEAN DEFAULT false,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_student ON staff_notes(student_id);
CREATE INDEX idx_notes_author ON staff_notes(author_id);
CREATE INDEX idx_notes_org ON staff_notes(organization_id);
CREATE INDEX idx_notes_type ON staff_notes(note_type);
CREATE INDEX idx_notes_created ON staff_notes(created_at);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate score band from score
CREATE OR REPLACE FUNCTION calculate_score_band(score DECIMAL)
RETURNS score_band AS $$
BEGIN
  IF score < 3 THEN
    RETURN 'low'::score_band;
  ELSIF score < 5 THEN
    RETURN 'average'::score_band;
  ELSIF score < 8 THEN
    RETURN 'high'::score_band;
  ELSE
    RETURN 'very_high'::score_band;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure students can only have one role
CREATE OR REPLACE FUNCTION check_student_single_role()
RETURNS TRIGGER AS $$
BEGIN
  -- If the role being inserted/updated is 'student'
  IF NEW.role = 'student' THEN
    -- Check if user already has any other active roles
    IF EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = NEW.user_id 
      AND is_active = true 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Students cannot have multiple roles';
    END IF;
  END IF;
  
  -- If adding a non-student role, check if user is already a student
  IF NEW.role != 'student' THEN
    IF EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = NEW.user_id 
      AND role = 'student' 
      AND is_active = true
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Users with student role cannot have additional roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reflections_updated_at BEFORE UPDATE ON student_reflections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_completions_updated_at BEFORE UPDATE ON activity_completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON staff_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for student single role enforcement
CREATE TRIGGER enforce_student_single_role
  BEFORE INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION check_student_single_role();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- These policies ensure users can only access data within their organization
-- and according to their role permissions
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGANIZATIONS POLICIES
-- ============================================================================

-- Super admins can see all organizations
CREATE POLICY "Super admins can view all organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.primary_role = 'super_admin'
    )
  );

-- Users can see their own organization
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Only super admins can create/update organizations
CREATE POLICY "Super admins can manage organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.primary_role = 'super_admin'
    )
  );

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Staff can view profiles in their organization
CREATE POLICY "Staff can view org profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      -- User is staff (not student/parent)
      (SELECT primary_role FROM profiles WHERE id = auth.uid()) IN (
        'super_admin', 'org_admin', 'head_of_year', 'head_of_department', 'tutor', 'teacher'
      )
      OR
      -- Or viewing own profile
      id = auth.uid()
    )
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Org admins can manage profiles in their organization
CREATE POLICY "Org admins can manage profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() 
      AND primary_role IN ('super_admin', 'org_admin')
    )
  );

-- ============================================================================
-- STUDENTS POLICIES
-- ============================================================================

-- Students can view their own record
CREATE POLICY "Students can view own record"
  ON students FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Staff can view students based on their role and assignments
CREATE POLICY "Staff can view students in scope"
  ON students FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      -- Super admin or org admin can see all
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND primary_role IN ('super_admin', 'org_admin')
      )
      OR
      -- Head of year can see their year group
      EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN profiles p ON p.id = ur.user_id
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'head_of_year'
        AND ur.is_active = true
        AND (ur.scope->>'year')::integer = students.year_group
      )
      OR
      -- Tutor can see students in their tutor group
      EXISTS (
        SELECT 1 FROM staff_class_assignments sca
        JOIN classes c ON c.id = sca.class_id
        JOIN class_members cm ON cm.class_id = c.id
        WHERE sca.staff_id = auth.uid()
        AND cm.student_id = students.id
        AND c.type = 'tutor_group'
        AND sca.is_active = true
        AND cm.is_active = true
      )
      OR
      -- Teacher can see students in their classes
      EXISTS (
        SELECT 1 FROM staff_class_assignments sca
        JOIN class_members cm ON cm.class_id = sca.class_id
        WHERE sca.staff_id = auth.uid()
        AND cm.student_id = students.id
        AND sca.is_active = true
        AND cm.is_active = true
      )
      OR
      -- Student viewing own record
      id = auth.uid()
    )
  );

-- Only org admins can create/update students
CREATE POLICY "Org admins can manage students"
  ON students FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() 
      AND primary_role IN ('super_admin', 'org_admin')
    )
  );

-- ============================================================================
-- QUESTIONNAIRE RESPONSES POLICIES
-- ============================================================================

-- Students can view their own responses
CREATE POLICY "Students can view own responses"
  ON questionnaire_responses FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Students can update their own in-progress responses
CREATE POLICY "Students can update own responses"
  ON questionnaire_responses FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid() 
    AND status IN ('not_started', 'in_progress')
  )
  WITH CHECK (
    student_id = auth.uid()
    AND status IN ('not_started', 'in_progress', 'completed')
  );

-- Staff can view responses for students in their scope (same as students policy)
CREATE POLICY "Staff can view student responses"
  ON questionnaire_responses FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      -- Super admin / org admin
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND primary_role IN ('super_admin', 'org_admin')
      )
      OR
      -- Head of year (their year)
      student_id IN (
        SELECT s.id FROM students s
        JOIN user_roles ur ON (ur.scope->>'year')::integer = s.year_group
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'head_of_year'
        AND ur.is_active = true
      )
      OR
      -- Tutor/teacher (their students)
      student_id IN (
        SELECT cm.student_id FROM staff_class_assignments sca
        JOIN class_members cm ON cm.class_id = sca.class_id
        WHERE sca.staff_id = auth.uid()
        AND sca.is_active = true
        AND cm.is_active = true
      )
      OR
      -- Own response
      student_id = auth.uid()
    )
  );

-- Staff can assign questionnaires to students in their scope
CREATE POLICY "Staff can assign questionnaires"
  ON questionnaire_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    assigned_by = auth.uid()
    AND student_id IN (
      -- Student is in staff's scope (simplified - same logic as above)
      SELECT s.id FROM students s
      WHERE s.organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- ============================================================================
-- ASSESSMENT RESULTS POLICIES
-- ============================================================================

-- Similar to questionnaire_responses policies
CREATE POLICY "Students can view own results"
  ON assessment_results FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Staff can view student results"
  ON assessment_results FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      student_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND primary_role IN ('super_admin', 'org_admin', 'head_of_year', 'head_of_department', 'tutor', 'teacher')
      )
    )
  );

-- System can insert/update results
CREATE POLICY "System can manage results"
  ON assessment_results FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STUDENT REFLECTIONS POLICIES
-- ============================================================================

-- Students can manage their own reflections
CREATE POLICY "Students can manage own reflections"
  ON student_reflections FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Staff can view reflections for their students
CREATE POLICY "Staff can view student reflections"
  ON student_reflections FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND primary_role IN ('super_admin', 'org_admin', 'head_of_year', 'head_of_department', 'tutor', 'teacher')
    )
  );

-- ============================================================================
-- ACTIVITIES POLICIES
-- ============================================================================

-- All authenticated users can view published activities
CREATE POLICY "All users can view published activities"
  ON activities FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Staff can manage activities
CREATE POLICY "Staff can manage activities"
  ON activities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND primary_role IN ('super_admin', 'org_admin')
    )
  );

-- ============================================================================
-- ACTIVITY ASSIGNMENTS & COMPLETIONS POLICIES
-- ============================================================================

-- Students can view their own assignments
CREATE POLICY "Students can view own assignments"
  ON activity_assignments FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Staff can view and create assignments for their students
CREATE POLICY "Staff can manage student assignments"
  ON activity_assignments FOR ALL
  TO authenticated
  USING (
    assigned_by = auth.uid()
    OR
    student_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND primary_role IN ('super_admin', 'org_admin', 'head_of_year', 'tutor', 'teacher')
    )
  );

-- Students can manage their own completions
CREATE POLICY "Students can manage own completions"
  ON activity_completions FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Staff can view and review completions
CREATE POLICY "Staff can view and review completions"
  ON activity_completions FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND primary_role IN ('super_admin', 'org_admin', 'head_of_year', 'head_of_department', 'tutor', 'teacher')
    )
  );

CREATE POLICY "Staff can update completions for review"
  ON activity_completions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND primary_role IN ('super_admin', 'org_admin', 'head_of_year', 'head_of_department', 'tutor', 'teacher')
    )
  )
  WITH CHECK (
    reviewed_by = auth.uid()
  );

-- ============================================================================
-- STAFF NOTES POLICIES
-- ============================================================================

-- Staff can view notes for their students (respecting sensitivity)
CREATE POLICY "Staff can view student notes"
  ON staff_notes FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      author_id = auth.uid()
      OR
      (
        is_sensitive = false
        AND
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND primary_role IN ('super_admin', 'org_admin', 'head_of_year', 'head_of_department', 'tutor', 'teacher')
        )
      )
    )
  );

-- Staff can create notes for their students
CREATE POLICY "Staff can create notes"
  ON staff_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND primary_role IN ('super_admin', 'org_admin', 'head_of_year', 'head_of_department', 'tutor', 'teacher')
    )
  );

-- Staff can update their own notes
CREATE POLICY "Staff can update own notes"
  ON staff_notes FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Staff can delete their own notes
CREATE POLICY "Staff can delete own notes"
  ON staff_notes FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE organizations IS 'Schools and institutions using SPARK';
COMMENT ON TABLE profiles IS 'All users (staff, students, parents) linked to Supabase auth';
COMMENT ON TABLE user_roles IS 'Staff can have multiple roles with different scopes';
COMMENT ON TABLE students IS 'Student-specific data extending profiles';
COMMENT ON TABLE classes IS 'Tutor groups, teaching groups, year groups, etc.';
COMMENT ON TABLE questionnaires IS 'SPARK questionnaire versions';
COMMENT ON TABLE questionnaire_responses IS 'Individual student assessment attempts';
COMMENT ON TABLE question_answers IS 'Slider responses (0-100) for each question';
COMMENT ON TABLE assessment_results IS 'Calculated dimension scores and bands';
COMMENT ON TABLE student_reflections IS 'Student comments and goals on reports';
COMMENT ON TABLE activities IS 'Library of SPARK activities';
COMMENT ON TABLE activity_assignments IS 'Activities assigned to students';
COMMENT ON TABLE activity_completions IS 'Student progress on activities';
COMMENT ON TABLE staff_notes IS 'Teacher observations and comments';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

