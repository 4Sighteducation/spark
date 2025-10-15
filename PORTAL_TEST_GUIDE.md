# 🧪 SPARK Portal - Test Guide

**Status:** Questionnaire & Reports LIVE ✅  
**URL:** http://localhost:3000

---

## ✅ What's Working Right Now

### 1. Authentication ✅
- Login page with password visibility toggle
- Password reset flow
- Protected routes
- Role-based redirection

### 2. Student Dashboard ✅
- Mobile-first responsive layout
- 3 navigation cards
- Bottom navigation on mobile
- Quick stats display

### 3. Questionnaire ✅
- Cycle-based access control
- Lockout after completion
- 33 questions with emoji slider
- Mobile-optimized touch interface
- Saves to database
- Calculates scores automatically

### 4. Reports Page ✅
- Displays all 5 dimension scores
- Shows personalized statements
- Interactive reflection editor
- Goal setting interface
- Mobile-responsive cards

---

## 🧪 Test Scenarios

### Test 1: Student Login & Dashboard
1. Visit: http://localhost:3000/portal/login
2. Login as: `stutest1@vespa.academy` / `TestPass123!`
3. ✅ See dashboard with welcome message
4. ✅ See 3 navigation cards
5. ✅ Resize browser < 768px → see bottom nav
6. ✅ Click sign out

### Test 2: View Existing Report (Billy - Already Completed)
1. Login as Billy: `stutest1@vespa.academy`
2. Click "SPARK Reports" card
3. ✅ See Billy's report with HIGH scores:
   - Overall: 7.9
   - Self-Direction: 8.1 (Very High)
   - Purpose: 7.8 (High)
   - Awareness: 8.3 (Very High)
   - Resilience: 7.4 (High)
   - Knowledge: 8.1 (Very High)
4. ✅ Read personalized statements for each dimension
5. ✅ Click "Add Reflections" → type text → Save
6. ✅ Add a goal with date

### Test 3: Questionnaire Lockout
1. Still logged in as Billy
2. Click "SPARK Questionnaire" card
3. ✅ See "Already Completed!" message
4. ✅ See button to view report
5. ✅ Cannot retake questionnaire (cycle lockout working!)

### Test 4: Different Student Profiles
**Sarah (Medium Scorer):**
- Login: `stutest2@vespa.academy`
- Overall: 5.3
- Mixed profile (some high, some average)
- ✅ See different personalized statements

**Clare (Low Scorer):**
- Login: `stutest3@vespa.academy`  
- Overall: 3.3
- Lower scores across dimensions
- ✅ See supportive, encouraging statements

### Test 5: Password Reset
1. Sign out
2. Click "Forgot your password?"
3. Enter: `stutest1@vespa.academy`
4. ✅ See success message
5. ✅ Check email (real email will be sent!)
6. Click reset link → set new password

### Test 6: Mobile Experience
1. Open DevTools → Toggle device toolbar
2. Select iPhone 14 Pro (390×844)
3. Login as any student
4. ✅ Bottom navigation visible
5. ✅ All buttons 44px+ (touch-friendly)
6. ✅ Cards stack vertically
7. ✅ Slider works with touch

### Test 7: Try to Access Without Login
1. Sign out
2. Visit: http://localhost:3000/portal/dashboard
3. ✅ Auto-redirect to login page
4. Login → ✅ Redirect back to dashboard

---

## 🎯 Test Data Reference

### Student Profiles:

| Name | Email | Password | Overall Score | Profile |
|------|-------|----------|---------------|---------|
| Billy Nomad | stutest1@vespa.academy | TestPass123! | 7.9 | HIGH (7-9) |
| Sarah Hinchcliffe | stutest2@vespa.academy | TestPass123! | 5.3 | MEDIUM (4-6) |
| Clare Handsoff | stutest3@vespa.academy | TestPass123! | 3.3 | LOW (2-4) |

### Current Cycle:
- **Name:** Autumn 2025
- **Dates:** Oct 1 - Oct 21, 2025
- **Status:** Active (all students completed)

---

## 🐛 Known Limitations (Coming Soon)

- ⏳ Activities page (placeholder)
- ⏳ Staff portal
- ⏳ Multiple cycles support
- ⏳ Progress charts
- ⏳ Badges system
- ⏳ Staff comments section

---

## 🎨 Visual Features to Check

### Mobile (<768px):
- ✅ Bottom navigation bar
- ✅ Vertical card stacks
- ✅ Large touch targets
- ✅ Gradient backgrounds

### Desktop (≥768px):
- ✅ 2-3 column grids
- ✅ Sidebar navigation
- ✅ Wider layout
- ✅ More compact cards

### Interactions:
- ✅ Password view toggle (eye icon)
- ✅ Emoji slider (drag or click)
- ✅ Example toggle (question help)
- ✅ Reflection editor (expand/collapse)
- ✅ Goal adding (dynamic list)

---

## 📸 Screenshots to Take

1. Login page (desktop)
2. Login page (mobile)
3. Dashboard with 3 cards
4. Bottom nav on mobile
5. Billy's HIGH score report
6. Sarah's MEDIUM score report
7. Clare's LOW score report
8. Reflection editor
9. Goal setting interface
10. Questionnaire lockout message

---

## 🚀 Ready for Testing!

**Everything is live and working.** Test all scenarios above and report any bugs!

*Last updated: October 15, 2025*

