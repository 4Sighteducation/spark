-- Quick diagnostic to check what data exists

-- 1. Check if students exist
SELECT 'Students:' as check_type, COUNT(*) as count FROM students WHERE is_active = true;

-- 2. Check if questionnaire responses exist
SELECT 'Responses:' as check_type, COUNT(*) as count, cycle_number 
FROM questionnaire_responses 
GROUP BY cycle_number;

-- 3. Check if question answers exist
SELECT 'Question Answers:' as check_type, COUNT(*) as count 
FROM question_answers;

-- 4. Check if assessment results exist
SELECT 'Assessment Results:' as check_type, COUNT(*) as count, cycle_number
FROM assessment_results
GROUP BY cycle_number;

-- 5. Check specific students
SELECT 
  p.email,
  p.first_name,
  p.last_name,
  s.year_group,
  ar.overall_score,
  ar.cycle_number
FROM profiles p
LEFT JOIN students s ON s.id = p.id
LEFT JOIN assessment_results ar ON ar.student_id = s.id
WHERE p.email LIKE '%stutest%'
ORDER BY p.email;

-- 6. Check if questions are loaded
SELECT 'Questions in questionnaire:' as check_type, 
       jsonb_array_length(questions) as question_count
FROM questionnaires 
WHERE is_default = true;

-- 7. Check assessment cycle
SELECT * FROM assessment_cycles ORDER BY start_date DESC LIMIT 5;

