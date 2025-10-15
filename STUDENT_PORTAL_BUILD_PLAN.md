# 🎓 SPARK Student Portal - Complete Build Plan

**Created:** October 15, 2025  
**Target Launch:** September 2026  
**Demo Target:** December 2025  

---

## 📊 Project Overview

Building an interactive student portal at `spark.study/portal` with:
- 🔐 Authentication (email/password with reset)
- 📝 SPARK Questionnaire (emoji slider, 3 cycles/year)
- 📈 Interactive Reports (with reflections, goals, staff comments)
- 🎮 Gamified Activities (40 total, 6 assigned per student via AI)

---

## 🏗️ Architecture Decisions

### ✅ Confirmed Decisions

| **Decision** | **Choice** | **Rationale** |
|-------------|-----------|---------------|
| **Project Structure** | Same Next.js project, new `/portal` routes | Shared components, single deployment |
| **Authentication** | Supabase Auth | Already configured, handles reset/sessions |
| **Database** | Existing Supabase schema | 17 tables already created with RLS |
| **Portal Routing** | Role-based routing (`/portal`) | Students and staff use same login, different views |
| **Mobile Strategy** | PWA (responsive + touch-optimized) | Works on school tablets AND home devices |
| **Activity Assignment** | Anthropic Claude API | Intelligent 6-activity prescription per student |
| **Cycle Management** | Org-wide default, Year/Tutor optional | Range-based (max 3 weeks), individual lockout |
| **Activity Interaction** | Advanced (built-in platform) | Full interactive activities like Ikigai Quest |

---

## 👥 Test Data Setup

### Organization
- **Name:** SPARK Academy
- **Type:** Secondary School (Year 7-11)
- **Location:** UK

### Staff Accounts
| **Role** | **Name** | **Email** | **Access Level** |
|----------|----------|-----------|------------------|
| Admin | Mrs Clare Beeton | admintest1@vespa.academy | Full org access |
| Head of Year 8 | Mr Craig Branston | hoytest1@vespa.academy | Year 8 students only |
| Tutor | Miss Catherine Crinkle | tuttest1@vespa.academy | Tutor group only |

### Student Accounts (Year 8, Tutor Group 8CB)
| **Name** | **Email** | **Profile** | **Purpose** |
|----------|-----------|-------------|-------------|
| Billy Nomad | stutest1@vespa.academy | **HIGH** scorer (7-9 across all dimensions) | Test high achiever experience |
| Sarah Hinchcliffe | stutest2@vespa.academy | **MEDIUM** scorer (4-6, mixed profile) | Test average student journey |
| Clare Handsoff | stutest3@vespa.academy | **LOW** scorer (2-4 across dimensions) | Test support/intervention flow |

**Initial State:** All 3 students will have pre-generated Cycle 1 responses to enable immediate testing of reports and activities.

---

## 📅 Cycle Management Design

### Cycle Configuration

**Three Levels:**
1. **Organization-wide** (default): All students complete in same window
2. **Year-level**: Different cycles for Year 7, 8, 9, etc.
3. **Tutor-group level**: Each tutor can set their own group's cycles

**Cycle Structure:**
- **Date Range:** Opening date + closing date (max 3 weeks apart)
- **Max Cycles:** 3 per academic year
- **Individual Lockout:** Student locks after completion, others remain open
- **Default Lockout:** 6 weeks from completion if no cycle configured

**Example Cycle:**
```
Cycle 1 (Autumn): Sept 15 - Oct 6, 2025 (3 weeks)
Cycle 2 (Spring): Jan 10 - Jan 31, 2026 (3 weeks)
Cycle 3 (Summer): May 5 - May 26, 2026 (3 weeks)
```

**Lockout Logic:**
- Billy completes Sept 18 → locked until Cycle 2
- Sarah completes Oct 1 → locked until Cycle 2
- Clare never completes → opportunity remains open until Oct 6, then locked

**Testing Override:** Staff/admin can unlock any student for testing purposes.

---

## 🎯 Activity Assignment Algorithm

### AI-Powered Prescription (Anthropic Claude)

**Inputs:**
- Student's 5 dimension scores (S, P, A, R, K)
- Score bands (Low/Average/High/Very High)
- Student's Overall score
- Available activities (40 total, 8 per dimension)
- Student's previous activity history (for year-over-year)

**Assignment Logic:**
```javascript
// Anthropic Claude prompt will analyze:
1. Student's lowest 2-3 dimensions (priority for improvement)
2. Student's highest dimension (build on strength)
3. Overall score context (holistic view)
4. Activity difficulty bands (match to student level)

// Output: 6 activities
- 1 activity from EACH dimension (S, P, A, R, K) = 5 activities
- 1 additional activity from area of greatest need (AI decides)
```

**Activity JSON Structure Update:**
```json
{
  "id": "S_two_minute_takeoff",
  "theme": "S",
  "title": "Two-Minute Takeoff",
  "suggested_band": "Low/Average",
  "prescribed_for": ["Low-S", "Average-S"],  // NEW FIELD
  "difficulty_level": 1,  // NEW FIELD (1-3)
  "time_minutes": 10
}
```

**Assignment Modes:**
1. **AI-Prescribed** (default): 6 activities auto-assigned after questionnaire
2. **Teacher Override**: Staff can manually assign/remove activities
3. **Student Self-Selection**: Students can add extra activities (not count toward required 6)

---

## 🎮 Activity Gamification System

### Core Features

**1. Progress Tracking**
- ✅ Not Started → 🔄 In Progress → ✅ Completed → ⭐ Mastered
- Evidence submission (text reflection, photo/file upload optional)
- Teacher approval/feedback loop

**2. Level System**
- **Level 1:** First attempt (guided instructions)
- **Level 2:** Second attempt (less scaffolding)
- **Level 3:** Mastery (student teaches others)

**3. Badges & Rewards**
- 🌟 First Completion (any activity)
- 🔥 Streak (complete 3 activities in 3 weeks)
- 🎯 Dimension Master (complete all 8 in one dimension)
- 🏆 SPARK Champion (complete all 6 prescribed activities)

**4. Year-Over-Year Comparison**
- "You did this activity last year! Let's see your growth."
- Side-by-side comparison of reflections
- "Level up" to harder version if already completed

### Example: Ikigai Quest Activity

**Structure:**
```
📋 Activity Overview
   - Time: 20 minutes
   - Theme: Purpose (P)
   - Difficulty: Level 1

🎯 Instructions (animated, step-by-step)
   - Video/GIF demonstration
   - Text with checkboxes

🎨 Interactive Canvas (from ikigaieg.html)
   - Drag-and-drop notes
   - Connect passions & strengths
   - AI suggestions

📸 Evidence Collection
   - Screenshot of canvas
   - Text reflection: "What surprised you?"

✅ Completion
   - Submit for teacher review
   - Unlock next activity
   - Earn badge
```

---

## 📱 Mobile-First Design System

### Breakpoints
```css
/* Mobile: 320px - 767px */
- Vertical stacks
- Bottom navigation
- Full-width cards
- Large touch targets (44x44px min)

/* Tablet: 768px - 1023px */
- 2-column grids
- Side navigation (collapsible)
- Medium cards

/* Desktop: 1024px+ */
- 3-column grids
- Persistent sidebar
- Compact cards
```

### Navigation Pattern

**Mobile (< 768px):**
```
┌─────────────────────┐
│   SPARK Logo        │
│                     │
│   [Content Area]    │
│                     │
│                     │
│                     │
└─────────────────────┘
│ 📝  📊  🎮  👤    │  ← Bottom Nav
└─────────────────────┘
```

**Desktop (≥ 768px):**
```
┌───────┬─────────────┐
│ Logo  │  Content    │
│ ───   │             │
│ 📝 Q  │             │
│ 📊 R  │             │
│ 🎮 A  │             │
│ 👤 P  │             │
│       │             │
└───────┴─────────────┘
```

### Touch Optimization
- **Buttons:** Min 44x44px, 8px padding
- **Sliders:** 60px tall touch area (emoji slider)
- **Swipe gestures:** Navigate between report cycles
- **Pull-to-refresh:** Reload activity progress
- **Haptic feedback:** On completion actions (if supported)

---

## 🗄️ Database Schema Updates Needed

### New Tables/Fields

**1. `assessment_cycles` (NEW TABLE)**
```sql
CREATE TABLE assessment_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  year_group TEXT,  -- NULL = org-wide
  class_id UUID REFERENCES classes(id),  -- NULL = year/org level
  cycle_number INT CHECK (cycle_number BETWEEN 1 AND 3),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT max_duration CHECK (end_date - start_date <= 21)
);
```

**2. Update `activities` table:**
```sql
ALTER TABLE activities ADD COLUMN prescribed_for TEXT[];
ALTER TABLE activities ADD COLUMN difficulty_level INT DEFAULT 1;
ALTER TABLE activities ADD COLUMN interactive_type TEXT; -- 'ikigai', 'quiz', 'canvas', etc.
ALTER TABLE activities ADD COLUMN interactive_config JSONB; -- Activity-specific settings
```

**3. Update `activity_assignments` table:**
```sql
ALTER TABLE activity_assignments ADD COLUMN assignment_type TEXT DEFAULT 'ai_prescribed'; -- 'ai_prescribed', 'teacher_assigned', 'student_selected'
ALTER TABLE activity_assignments ADD COLUMN prescribed_reason TEXT; -- AI explanation
```

**4. Update `activity_completions` table:**
```sql
ALTER TABLE activity_completions ADD COLUMN level INT DEFAULT 1;
ALTER TABLE activity_completions ADD COLUMN evidence_text TEXT;
ALTER TABLE activity_completions ADD COLUMN evidence_file_url TEXT;
ALTER TABLE activity_completions ADD COLUMN teacher_feedback TEXT;
ALTER TABLE activity_completions ADD COLUMN mastery_achieved BOOLEAN DEFAULT FALSE;
```

**5. `student_badges` (NEW TABLE)**
```sql
CREATE TABLE student_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  badge_type TEXT NOT NULL, -- 'first_completion', 'streak', 'dimension_master', 'champion'
  dimension TEXT, -- NULL for non-dimension badges
  earned_date TIMESTAMPTZ DEFAULT NOW(),
  cycle_number INT
);
```

---

## 🎨 UI/UX Design Patterns

### Color Scheme (from existing SPARK design)
```javascript
dimension_colors = {
  S: '#E91E8C',  // Pink (Self-Direction)
  P: '#7C3AED',  // Purple (Purpose)
  A: '#06B6D4',  // Cyan (Awareness)
  R: '#84CC16',  // Lime (Resilience)
  K: '#FBBF24'   // Yellow (Knowledge)
}
```

### Component Library

**Already Built (Reuse):**
- `DemoQuestionnaire.tsx` → Adapt for authenticated students
- `PrintableReport.tsx` → Adapt with edit sections
- Emoji slider component
- Score calculation functions

**New Components Needed:**
1. `PortalLayout.tsx` - Main portal wrapper with navigation
2. `CycleIndicator.tsx` - Shows current cycle status
3. `ActivityCard.tsx` - Activity display with progress
4. `ReflectionEditor.tsx` - Rich text editor for student input
5. `StaffCommentsPanel.tsx` - Staff-only comment interface
6. `ProgressChart.tsx` - Multi-cycle comparison charts
7. `BadgeDisplay.tsx` - Achievement badges
8. `InteractiveActivityFrame.tsx` - Wrapper for interactive activities

---

## 🔐 Authentication & Authorization

### Login Flow
```
1. User visits spark.study/portal
2. Redirect to /portal/login (if not authenticated)
3. Enter email + password (with "view password" toggle)
4. Supabase Auth validates
5. Redirect based on role:
   - Student → /portal/dashboard
   - Staff → /portal/staff/dashboard
```

### Password Reset Flow
```
1. Click "Forgot Password?" on login
2. Enter email → Supabase sends reset link
3. Click link → /portal/reset-password?token=...
4. Enter new password (with view toggle)
5. Success → redirect to login
```

### Protected Routes
```typescript
middleware.ts (Next.js 14)
- Check auth session
- Load user role from profiles table
- Allow/deny based on route pattern:
  - /portal/* → require auth
  - /portal/staff/* → require staff role
  - /portal/admin/* → require admin role
```

---

## 📊 Reporting System Design

### Report Structure

**Student View:**
```markdown
┌─────────────────────────────────────┐
│  SPARK Report - Cycle 1             │
│  Billy Nomad | Year 8 | Oct 2025    │
├─────────────────────────────────────┤
│                                     │
│  📊 Your Scores                     │
│     S: 8.2 (Very High) 🌟          │
│     P: 7.8 (High) ⭐                │
│     A: 8.5 (Very High) 🌟          │
│     R: 7.5 (High) ⭐                │
│     K: 8.0 (Very High) 🌟          │
│     Overall: 8.0 (Very High)        │
│                                     │
│  💬 Self-Direction Feedback         │
│     [Personalized statement...]     │
│                                     │
│  ✏️ Your Reflections (Editable)    │
│     [Text editor...]                │
│                                     │
│  🎯 Your Goals (Editable)           │
│     [ ] Goal 1 [Due: Nov 15]       │
│     [ ] Add new goal...             │
│                                     │
│  📈 View Previous Reports           │
│     [Cycle 1] [Cycle 2] [Cycle 3]  │
│                                     │
└─────────────────────────────────────┘
```

**Staff View (Additional Section):**
```markdown
┌─────────────────────────────────────┐
│  👨‍🏫 Staff Notes (Private)            │
│     [Rich text editor...]           │
│     [Save] [View History]           │
└─────────────────────────────────────┘
```

### Multi-Cycle Progress View
```
┌─────────────────────────────────────┐
│  📈 Your SPARK Journey              │
├─────────────────────────────────────┤
│                                     │
│  [Line Chart]                       │
│   10 ┤                           ╭─╮
│    8 ┤     ╭─╮   ╭─╮   ╭─╮   ╭─╯ │
│    6 ┤   ╭─╯ ╰─╮─╯ ╰─╮─╯ ╰─╮─╯   │
│    4 ┤ ╭─╯       ╰─╮   ╰─╮   ╰─╮ │
│    2 ┤─╯           ╰─╮   ╰─╮   ╰─┤
│    0 └─────────────────────────────┤
│      Cycle1  Cycle2  Cycle3        │
│                                     │
│  🔍 View Detailed Reports:          │
│     [Oct 2025] [Feb 2026] [Jun 26] │
│                                     │
└─────────────────────────────────────┘
```

---

## 🚀 Build Phases (8-10 Weeks)

### ✅ Phase 1: Foundation (Week 1-2)
**Goal:** Authentication + Dashboard + Test Data

- [ ] Create seed script with SPARK Academy data
- [ ] Build login/logout/reset UI
- [ ] Create portal dashboard layout (mobile-first)
- [ ] Set up role-based routing
- [ ] Generate dummy student questionnaire responses

**Deliverable:** Can log in as Billy/Sarah/Clare, see empty dashboard

---

### ✅ Phase 2: Questionnaire & Cycles (Week 2-3)
**Goal:** Students can complete SPARK questionnaire

- [ ] Create `assessment_cycles` table and admin UI
- [ ] Adapt demo questionnaire for authenticated users
- [ ] Save responses to `questionnaire_responses` table
- [ ] Implement individual lockout logic
- [ ] Calculate scores and generate reports

**Deliverable:** Students can complete questionnaire (if cycle open), get locked after completion

---

### ✅ Phase 3: Reports & Reflections (Week 3-4)
**Goal:** Students can view/edit reports, staff can add comments

- [ ] Build report display page
- [ ] Add student reflection editor
- [ ] Add goal-setting interface
- [ ] Create staff comments panel (private)
- [ ] Build multi-cycle history view

**Deliverable:** Full report system with edit capabilities

---

### ✅ Phase 4: Activity Assignment (Week 4-5)
**Goal:** AI assigns 6 activities after questionnaire completion

- [ ] Update activities JSON with prescribed_for field
- [ ] Import activities to database
- [ ] Build Anthropic Claude assignment algorithm
- [ ] Create activity library page
- [ ] Display assigned activities to students

**Deliverable:** Students see 6 assigned activities after completing questionnaire

---

### ✅ Phase 5: Interactive Activities (Week 5-7)
**Goal:** 2 proof-of-concept activities playable in platform

- [ ] Build activity detail/launch page
- [ ] Adapt Ikigai Quest (ikigaieg.html → React component)
- [ ] Create second example activity
- [ ] Build completion tracking UI
- [ ] Add evidence submission

**Deliverable:** Students can complete activities, see progress

---

### ✅ Phase 6: Gamification (Week 7-8)
**Goal:** Badges, levels, rewards system

- [ ] Create badges table and logic
- [ ] Build badge display component
- [ ] Implement activity levels (1-3)
- [ ] Add year-over-year comparison
- [ ] Create teacher override UI

**Deliverable:** Full gamification system working

---

### ✅ Phase 7: Staff Features (Week 8-9)
**Goal:** Staff can view students, add comments, manage cycles

- [ ] Build staff dashboard
- [ ] Student list/detail views
- [ ] Cycle management UI
- [ ] Activity assignment override
- [ ] Export functionality

**Deliverable:** Staff can manage their students

---

### ✅ Phase 8: Polish & PWA (Week 9-10)
**Goal:** Production-ready demo

- [ ] PWA manifest + service worker
- [ ] Mobile navigation optimization
- [ ] Loading states and error handling
- [ ] Accessibility audit
- [ ] Testing with all 3 student profiles

**Deliverable:** Demo-ready for user testing!

---

## 🧪 Testing Strategy

### Test Scenarios

**1. Student Journey (Billy - High Scorer)**
- ✅ Login → See dashboard
- ✅ Complete questionnaire (high scores)
- ✅ Immediately locked out
- ✅ View report with high scores
- ✅ Add reflection + 2 goals
- ✅ See 6 assigned activities
- ✅ Complete 1 activity (Ikigai Quest)
- ✅ Earn "First Completion" badge
- ✅ Try to complete questionnaire again (blocked)

**2. Support Journey (Clare - Low Scorer)**
- ✅ Login → See encouraging message
- ✅ Complete questionnaire (low scores)
- ✅ View report with supportive feedback
- ✅ See 6 prescribed activities (more scaffolded)
- ✅ Start activity but don't finish
- ✅ Return next week, resume activity
- ✅ Teacher adds supportive comment

**3. Staff Journey (Miss Crinkle - Tutor)**
- ✅ Login → See tutor dashboard
- ✅ View 3 students' progress
- ✅ Open Billy's report
- ✅ Add private comment
- ✅ Override activity assignment
- ✅ Set cycle dates for tutor group

**4. Cycle Testing**
- ✅ Admin sets Cycle 1: Oct 1-21
- ✅ Billy completes Oct 5 → locked
- ✅ Sarah can still complete Oct 10
- ✅ Clare completes Oct 18 → locked
- ✅ Oct 22: cycle closes, questionnaire disabled
- ✅ Admin sets Cycle 2: Jan 10-30
- ✅ All students unlocked

---

## 📈 Success Metrics (for Demo)

**Must Have:**
- ✅ All 6 test users can log in
- ✅ Students can complete questionnaire
- ✅ Reports generate correctly for all score levels
- ✅ Activities assigned via AI
- ✅ 2 interactive activities playable
- ✅ Mobile-responsive on iPhone/iPad/Desktop

**Nice to Have:**
- ✅ PWA installable
- ✅ Badges working
- ✅ Staff can add comments
- ✅ Multi-cycle comparison

**For September Launch:**
- ✅ All 40 activities built
- ✅ Bulk student import (CSV)
- ✅ Parent view (optional)
- ✅ Native mobile apps
- ✅ Push notifications

---

## 🔧 Technical Stack Summary

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations)

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- Supabase RLS (row-level security)
- Vercel Edge Functions

**AI:**
- Anthropic Claude (activity assignment)
- OpenAI (activity suggestions - optional)

**Mobile:**
- PWA (Progressive Web App)
- React Native (future)

---

## ❓ Questions to Confirm Before Starting

1. **Activity Interactivity:** Should ALL 40 activities eventually be interactive (like Ikigai), or can some be "download worksheet" style?

2. **Evidence Submission:** Do students MUST submit evidence for completion, or can they self-certify?

3. **Teacher Approval:** Do activities require teacher approval to mark "complete", or automatic on student submission?

4. **Parent Access:** Will parents eventually need read-only access to reports? (Not for demo, but plan architecture)

5. **Data Export:** What formats? (PDF reports, CSV data, Excel spreadsheets?)

6. **Offline Mode:** Should students be able to START activities offline, or just VIEW completed ones?

---

## 🎯 Ready to Build!

Once you confirm the above questions, I'll start with:

1. **Creating seed script** for SPARK Academy + 6 test users
2. **Building authentication** system
3. **Setting up portal dashboard** layout

We'll work through the phases systematically, building mobile-first and testing with all 3 student profiles as we go.

**Estimated timeline:** 8-10 weeks for full demo (all phases complete)

Let me know if you want to proceed, or if you need any clarifications! 🚀

