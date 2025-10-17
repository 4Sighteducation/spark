-- Simple check of questionnaire structure
SELECT 
  jsonb_typeof(questions) as questions_type,
  questions->>'version' as version,
  jsonb_typeof(questions->'themes') as themes_type
FROM questionnaires
WHERE is_default = true;

-- Check if themes is an array
SELECT 
  jsonb_array_length(questions->'themes') as themes_count
FROM questionnaires
WHERE is_default = true;

-- Show first theme
SELECT 
  questions->'themes'->0 as first_theme
FROM questionnaires
WHERE is_default = true;

