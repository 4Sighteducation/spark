# SPARK Database Architecture

## Overview
The SPARK database is designed to support a multi-role educational psychometric platform with:
- Single organization per user (no cross-org complexity)
- Flexible role-based access control
- Slider-based questionnaire (0-100 scale)
- Gamified activity tracking
- Future-proof extensibility

## Core Entities

### 1. **Organizations**
- Schools/institutions using SPARK
- Each user belongs to exactly ONE organization
- Subscription tiers: trial, basic, premium

### 2. **Profiles** (All Users)
- Links to Supabase `auth.users`
- Stores: staff, students, parents
- Primary role + flexible additional roles

### 3. **User Roles** (Staff Multi-Role Support)
- Staff can have multiple roles
- Each role has a scope (e.g., year group, department)
- Example: One person can be both "tutor of 8A" AND "head of Year 8"

### 4. **Students**
- Extended profile data for students
- Year group, tutor group, SEN status, etc.

### 5. **Classes**
- Types: `tutor_group`, `teaching_group`, `year_group`, `department`, `intervention_group`
- Flexible grouping for different contexts

## Access Control Logic

### Staff Access Patterns:

| Role | Access Scope |
|------|-------------|
| **Super Admin** | All organizations |
| **Org Admin** | Entire organization |
| **Head of Year** | All students in their year(s) |
| **Head of Department** | All students taking their subject |
| **Tutor** | Students in their tutor group(s) |
| **Teacher** | Students in their teaching class(es) |
| **Student** | Own data only |
| **Parent** | Own children only (future) |

### Multi-Role Example:
```
Sarah Smith:
- Role 1: Tutor (scope: {tutor_group: "8A"})
  → Can view all 8A students
  
- Role 2: Head of Year (scope: {year: 8})
  → Can view ALL Year 8 students
  
Result: Sarah sees ALL Year 8 students, with enhanced permissions for 8A
```

## Questionnaire Flow

```
1. Questionnaire assigned to student
   └─> questionnaire_responses (status: not_started)

2. Student starts questionnaire
   └─> status: in_progress
   
3. Student answers questions (slider 0-100)
   └─> question_answers (slider_value: 0-100, score: slider_value/10)
   
4. Student completes questionnaire
   └─> status: completed
   
5. System calculates results
   └─> assessment_results (dimension scores, bands, percentiles)
   └─> Auto-assign activities based on scores
   
6. Student views report
   └─> Can add reflections and goals
   └─> student_reflections
   
7. Student completes activities
   └─> activity_completions (progress tracking)
   
8. Teacher reviews
   └─> staff_notes
   └─> activity_completions (teacher_feedback)
```

## Scoring System

### Slider to Score Conversion:
- **Slider**: 0-100 (more granular, better UX)
- **Score**: slider_value ÷ 10 = 0.0 to 10.0
- **Band**: 
  - 0-3: Low
  - 3-5: Average
  - 5-8: High
  - 8-10: Very High

### Dimension Scores:
Each SPARK dimension (S, P, A, R, K) has:
1. **Raw score** (0-10): Average of question scores
2. **Band label**: Low/Average/High/Very High
3. **Percentile** (optional): For calibration across cohorts

### Overall Score:
Average of all five dimension scores

## Activity System

### Activity Assignment Logic:
```
When student completes questionnaire:
  1. Calculate dimension scores
  2. Determine band for each dimension
  3. Auto-suggest activities matching score bands
     Example: Self-Direction = 2.5 (Low)
     → Suggest activities tagged for "low" band
  4. Store in activity_assignments (assigned_by: NULL = auto-suggested)
  5. Staff can override: assign additional or remove activities
```

### Activity Completion Tracking:
- **Status**: not_started → in_progress → completed → reviewed_by_teacher
- **Response data**: Flexible JSONB for different activity types
- **Gamification**: Points, badges, time tracking

## Activity Types

| Type | Description | Example |
|------|-------------|---------|
| **interactive** | Rich web-based activities | Ikigai Quest |
| **reflective** | Written reflections | Goal-setting worksheet |
| **worksheet** | Structured exercises | Action Priority Matrix |
| **game** | Gamified challenges | Risk Tokens |

## Report Generation

### Student Report Contains:
1. **Dimension Scores** (0-10 with visual representation)
2. **Band Labels** (Low/Average/High/Very High)
3. **Personalized Statements** (from `spark_statements.json`)
4. **Reflection Questions** (from statements)
5. **Suggested Activities** (auto-assigned based on bands)
6. **Student Input Section**:
   - Reflection text box
   - Goal-setting interface
   - Comments on each dimension

### Report Storage:
- **assessment_results.report_data**: Full generated report (JSONB)
- **student_reflections**: Student's comments and goals
- Reports are re-generatable if statements/algorithm changes

## Row Level Security (RLS)

### Key Principles:
1. **Organization Isolation**: Users can only access data in their org
2. **Role-Based Filtering**: Policies check user roles and scopes
3. **Hierarchical Access**: Higher roles can access more data
4. **Student Privacy**: Students only see their own data

### Example RLS Policy:
```sql
-- Staff can view students in their scope
CREATE POLICY "Staff can view students in scope"
  ON students FOR SELECT
  USING (
    -- Org admin sees all
    user_is_org_admin(auth.uid())
    OR
    -- Head of year sees their year
    user_can_view_year(auth.uid(), students.year_group)
    OR
    -- Tutor/teacher sees their class members
    student_in_user_classes(auth.uid(), students.id)
  );
```

## Performance Considerations

### Indexes:
- All foreign keys are indexed
- Common query patterns indexed (org_id, student_id, status fields)
- Composite indexes for complex queries

### JSONB Fields:
Used for flexible data storage:
- `profiles.metadata` - Additional user data
- `assessment_results.report_data` - Generated reports
- `activity_completions.response_data` - Activity responses
- `classes.metadata` - Class-specific data

Benefits:
- Schema flexibility without migrations
- Fast queries with GIN indexes (can be added later)
- Easy to extend without breaking changes

## Future Extensibility

### Planned Features:
1. **Parent Access** (already supported in schema)
   - User role: `parent`
   - Link to students via new `student_guardians` table

2. **Cohort Comparison**
   - Percentile rankings already in `assessment_results`
   - Can add `cohort_stats` table for normative data

3. **Longitudinal Tracking**
   - Multiple questionnaire attempts per student
   - Progress over time dashboards

4. **Advanced Analytics**
   - Data export for research
   - Anonymized aggregate reporting

5. **AI Coaching** (like 7Cs)
   - `ai_coaching_sessions` table
   - Link to assessment results and activities

6. **Push Notifications**
   - Activity reminders
   - Achievement celebrations
   - Teacher alerts

## Data Migration Strategy

### Initial Data Load:
```
1. Create organization
2. Create admin user
3. Import questionnaire from SPARK_questionnaire.json
4. Import statements from spark_statements.json
5. Import activities from spark_activities_40.json
6. Bulk import students from CSV
7. Create classes and assign students
8. Assign staff to classes
```

### Seeding Script (to be created):
- `seed-questionnaire.ts` - Load SPARK v1.0 questionnaire
- `seed-activities.ts` - Load 40 activities
- `seed-test-org.ts` - Create test organization with sample data

## Security Notes

### Sensitive Data:
- **Students.metadata**: May contain medical/dietary info
  - Restrict in RLS policies
  - Only org admins and assigned staff
  
- **Staff_notes.is_sensitive**: Flag for extra privacy
  - Only author and org admin can view

### Audit Trail:
- All major tables have `created_at` and `updated_at`
- Consider adding `audit_log` table for compliance (GDPR, etc.)

## Testing Strategy

### Unit Tests:
- RLS policies (test each role's access)
- Score calculation functions
- Band assignment logic

### Integration Tests:
- Complete user flows (student takes assessment → staff reviews)
- Multi-role staff access
- Activity assignment algorithms

### Performance Tests:
- Query performance with 1000+ students
- Report generation speed
- Dashboard load times

## Questions Answered

1. ✅ **Can users belong to multiple orgs?** No, single org only
2. ✅ **Can staff have multiple roles?** Yes, via `user_roles` table
3. ✅ **How is student data scoped?** Via RLS policies checking role and class assignments
4. ✅ **How are activities assigned?** Auto-suggested based on scores, staff can override
5. ✅ **Can students retake questionnaires?** Yes, new `questionnaire_responses` record
6. ✅ **How are scores calculated?** Slider 0-100 ÷ 10, average per dimension


