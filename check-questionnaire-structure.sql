-- Check questionnaire structure to understand questions format

SELECT 
  id,
  version,
  jsonb_typeof(questions) as questions_type,
  jsonb_array_length(questions) as questions_count,
  questions->0 as first_question_sample
FROM questionnaires
WHERE is_default = true;

-- Also check the actual structure
SELECT questions FROM questionnaires WHERE is_default = true;

