# 🚀 SPARK Staff Portal - Quick Start Guide

## ⚡ Instant Testing (2 Minutes)

### **1. Start Dev Server**
```bash
cd "C:\Users\tonyd\OneDrive - 4Sight Education Ltd\Apps\SPARK"
npm run dev
```

### **2. Login as Staff**
Go to: http://localhost:3000/portal/login

Use any of these accounts:
```
Admin: admintest1@vespa.academy / TestPass123!
Head of Year: hoytest1@vespa.academy / TestPass123!
Tutor: tuttest1@vespa.academy / TestPass123!
```

### **3. Explore**
You'll auto-redirect to `/portal/staff/coaching`

**Try These:**
- ✅ View student list with color-coded scores
- ✅ Click REPORT button → Individual coaching page
- ✅ Add a coaching comment
- ✅ Click "Analytics" tab → View statement heat map
- ✅ Check "Bottom 5 Statements" (red alerts)
- ✅ Filter by year group / tutor group

---

## 🎯 Main Features

### **Coaching Page** (`/portal/staff/coaching`)
```
┌─────────────────────────────────────────────┐
│  STUDENT NAME │ GROUP │ REPORT │ S P A R K │
├─────────────────────────────────────────────┤
│  Billy Nomad  │ 12LC  │ [BTN]  │ 7 8 9 7 8 │ <- Click REPORT
│  Sarah Smith  │ Year8 │ [BTN]  │ 5 6 4 5 6 │ <- Color-coded
└─────────────────────────────────────────────┘
```

**Actions:**
- Click student name → Quick view
- Click REPORT → Full coaching page
- Click score → Score details
- Click "Response" → Student reflection modal
- Click "Goals" → Student goals modal

---

### **Analytics Dashboard** (`/portal/staff/analytics`)

**Three Tabs:**

1. **Overview** - Dimension averages, score distribution
2. **Statement Analysis** - Heat map of all 33 questions
3. **Student Breakdown** - Individual student scores

**Look For:**
- 🔴 Red statements = Low scores (needs attention)
- 🟢 Green statements = High scores (strengths)
- Bottom 5 / Top 5 lists

---

### **Individual Coaching** (`/portal/staff/coaching/[studentId]`)

Shows:
- SPARK dimension scores (5 dimensions)
- AI-generated insights
- Student reflection text
- Student goals (with status)
- Staff coaching comments (add new)
- Toggle: Visible to student / Staff only

---

## 🔐 Role-Based Access

| Role | What They See |
|------|---------------|
| **Super Admin** | All students (all schools) |
| **Org Admin** | All students in their school |
| **Head of Year** | Only Year 8 students (example) |
| **Tutor** | Only students in 12LC (example) |

The system automatically filters data based on role!

---

## 🐛 Troubleshooting

**"No students found"**
- Check if test data is seeded
- Run: `npm run db:seed-users`
- Run: `npm run db:calculate-scores`

**"Not authorized"**
- Check RLS policies in Supabase
- Verify user role in `profiles` table
- Check `user_roles` for head_of_year scope

**"Redirects to student portal"**
- Your account is marked as `primary_role = 'student'`
- Use a staff test account instead

---

## 📊 Database Quick Check

**See who has access:**
```sql
-- Check profiles table
SELECT first_name, last_name, primary_role, email
FROM profiles
WHERE primary_role != 'student';

-- Check user_roles (for head_of_year scope)
SELECT p.first_name, p.last_name, ur.role, ur.scope
FROM user_roles ur
JOIN profiles p ON p.id = ur.user_id
WHERE ur.is_active = true;

-- Check student data
SELECT COUNT(*) as total_students FROM students WHERE is_active = true;

-- Check assessment results
SELECT COUNT(*) as total_results FROM assessment_results;
```

---

## 🎨 Customization

**Change Colors:**
Edit `tailwind.config.ts`:
```typescript
colors: {
  'spark-pink': '#e91e8c',
  'spark-purple': '#7f3ae7',
  'spark-cyan': '#00b6d7',
  'spark-lime': '#83cc0c',
  'spark-yellow': '#fdbe21',
}
```

**Add Navigation Item:**
Edit `src/app/portal/staff/layout.tsx`:
```typescript
const navItems = [
  { href: '/portal/staff/coaching', label: 'Coaching', icon: '💬' },
  { href: '/portal/staff/my-new-page', label: 'New Feature', icon: '🎯' },
]
```

---

## 📱 Mobile Testing

**Resize Browser:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or iPad
4. All features should work!

**Responsive Breakpoints:**
- Mobile: 0-767px
- Tablet: 768-1023px
- Desktop: 1024px+

---

## 🚀 Production Deployment

**Deploy to Vercel:**
```bash
git add .
git commit -m "Staff Portal Phase 1 Complete"
git push origin main
```

Vercel auto-deploys to: https://www.spark.study

**Test Live:**
https://www.spark.study/portal/login

---

## 💡 Pro Tips

1. **Use Filters** - Year/group filters narrow results fast
2. **Add Comments** - Toggle visibility for parent comms
3. **Check Bottom 5** - Focus interventions on red statements
4. **REPORT Button** - Best for 1-on-1 coaching conversations
5. **Analytics Tab** - Best for whole-cohort insights

---

## 📞 Need Help?

**Common Issues:**
- Database not seeded → Run seed scripts
- RLS policies blocking → Check Supabase console
- Role not working → Verify `user_roles` table
- Scores not showing → Run calculate-scores script

**Documentation:**
- `STAFF_PORTAL_COMPLETE.md` - Full technical docs
- `HANDOVER_OCT16_2025.md` - Student portal docs
- `DATABASE_ARCHITECTURE.md` - Database info

---

**Ready to test? Start the dev server and login as staff!** 🎉

```bash
npm run dev
```

Then go to: http://localhost:3000/portal/login

---

*Last Updated: October 17, 2025*

