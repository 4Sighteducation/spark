-- ============================================================================
-- Import SPARK Questionnaire from SPARK_questionnaire.json
-- This creates the default questionnaire with all 33 questions
-- ============================================================================

-- First, check if questionnaire already exists
DO $$
BEGIN
  -- Delete existing default questionnaire if it exists
  DELETE FROM questionnaires WHERE version = 'v2.1.2';
END $$;

-- Insert the questionnaire with the full JSON structure
-- You'll need to copy the ENTIRE contents of SPARK_questionnaire.json into the questions field below

INSERT INTO questionnaires (
  version,
  title,
  description,
  questions,
  status,
  is_default
) VALUES (
  'v2.1.2',
  'SPARK Assessment V2',
  'SPARK Statements (V2) with age-appropriate examples (11–15)',
  -- PASTE THE ENTIRE SPARK_questionnaire.json CONTENT HERE AS A JSON STRING
  -- For now, I'll show you the structure you need:
  '{"version":"2.1.2","themes":[...]}'::jsonb,
  'active',
  true
);

-- Note: The easiest way is to run this in code, not SQL
-- Use the npm script or run manually

