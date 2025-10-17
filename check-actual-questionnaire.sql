-- Check what's ACTUALLY in the questionnaires table
SELECT 
  id,
  version,
  status,
  is_default,
  length(questions::text) as questions_json_length,
  questions
FROM questionnaires
WHERE is_default = true
LIMIT 1;

