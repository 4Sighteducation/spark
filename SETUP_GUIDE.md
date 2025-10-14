# SPARK Setup Guide

This guide will walk you through setting up SPARK for the first time.

## ✅ What's Been Completed

### 1. Database Schema ✓
- **File**: `supabase-spark-schema.sql` (1107 lines)
- 17 tables with full RLS policies
- Optimized indexes
- Helper functions and triggers
- **Status**: Ready to deploy to Supabase

### 2. Project Configuration ✓
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - SPARK theme with dimension colors
- `next.config.js` - Next.js configuration
- `postcss.config.js` - PostCSS setup
- `.prettierrc` - Code formatting
- `env.example` - Environment variable template

### 3. Data Files ✓
- `src/data/questionnaire.json` - 33 questions across 5 dimensions
- `src/data/statements.json` - Personalized feedback for each score band
- Need to add: `activities.json` (40 activities)

### 4. Documentation ✓
- `README.md` - Project overview
- `DATABASE_ARCHITECTURE.md` - Complete database documentation
- `SETUP_GUIDE.md` - This file!

## 🚀 Immediate Next Steps

### Step 1: Install Dependencies

```bash
cd "C:\Users\tonyd\OneDrive - 4Sight Education Ltd\Apps\SPARK"
npm install
```

This will install:
- Next.js 14
- React 18
- Supabase client
- Tailwind CSS
- TypeScript
- All other dependencies

### Step 2: Set Up Supabase

1. **Go to your Supabase project** (you mentioned you already have one)
   - URL: https://supabase.com/dashboard/projects

2. **Run the database schema**:
   - Open SQL Editor in Supabase dashboard
   - Copy contents of `supabase-spark-schema.sql`
   - Paste and execute
   - This will create all 17 tables, RLS policies, functions, and triggers

3. **Verify schema**:
   ```sql
   -- Run this to check tables were created
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public' 
   ORDER BY tablename;
   ```
   
   You should see:
   - activities
   - activity_assignments
   - activity_completions
   - assessment_results
   - class_members
   - classes
   - organizations
   - profiles
   - questionnaire_responses
   - questionnaires
   - question_answers
   - staff_class_assignments
   - staff_notes
   - student_reflections
   - students
   - user_roles

### Step 3: Configure Environment Variables

1. **Get your Supabase credentials**:
   - In Supabase dashboard → Settings → API
   - Copy:
     - Project URL
     - `anon` public key
     - `service_role` secret key (handle with care!)

2. **Create `.env.local` file** in the SPARK folder:
   ```bash
   # Copy template
   cp env.example .env.local
   ```

3. **Edit `.env.local`** with your actual values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=SPARK
   
   NODE_ENV=development
   ```

### Step 4: Generate TypeScript Types from Supabase

This creates TypeScript types that match your database schema:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Generate types
npm run db:types
```

This creates `src/types/supabase.ts` with all your database types.

**Alternative**: If CLI doesn't work, you can generate types manually from Supabase dashboard:
- Go to Settings → API → "Generate Types"
- Copy TypeScript types
- Create `src/types/supabase.ts` manually

### Step 5: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

You should see a blank page (we haven't built the UI yet, but no errors!).

## 📝 Next Development Tasks

Now that infrastructure is ready, here's what to build next:

### Priority 1: Authentication & Core Setup
1. **Create authentication pages**
   - Login page
   - Registration/invite page
   - Password reset

2. **Create initial seed data**
   - Seed script to create first organization
   - Create super admin user
   - Import questionnaire into database
   - Import statements
   - Import activities

3. **Build user dashboard routing**
   - Student dashboard layout
   - Staff dashboard layout
   - Admin dashboard layout
   - Role-based route protection

### Priority 2: Student Assessment Flow
4. **Build slider questionnaire**
   - Question display component
   - 0-100 slider component
   - Progress tracker
   - Save & resume functionality

5. **Build result calculation**
   - Score calculation function
   - Band assignment logic
   - Report data generation

6. **Build interactive report**
   - Dimension scores display
   - Personalized statements
   - Reflection input boxes
   - Goal setting interface
   - PDF export button

### Priority 3: Activities & Teacher Dashboards
7. **Activity library**
   - Activity card component
   - Filter by dimension/band
   - Activity detail page
   - Assignment interface

8. **Teacher dashboard**
   - Student list/grid
   - Filter by class/year
   - View individual reports
   - Assign activities
   - View activity completion

9. **Admin dashboard**
   - Organization management
   - User management (create staff/students)
   - Class management
   - Bulk upload (CSV import)

## 🔧 Development Workflow

### File Structure to Create

```
src/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (student)/
│   │   ├── dashboard/page.tsx
│   │   ├── questionnaire/page.tsx
│   │   ├── report/[id]/page.tsx
│   │   ├── activities/page.tsx
│   │   └── layout.tsx
│   ├── (staff)/
│   │   ├── dashboard/page.tsx
│   │   ├── students/page.tsx
│   │   ├── students/[id]/page.tsx
│   │   ├── activities/page.tsx
│   │   └── layout.tsx
│   └── (admin)/
│       ├── dashboard/page.tsx
│       ├── users/page.tsx
│       ├── classes/page.tsx
│       └── layout.tsx
├── components/
│   ├── ui/                        # Base components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Slider.tsx
│   │   └── ...
│   ├── questionnaire/
│   │   ├── QuestionCard.tsx
│   │   ├── ScaleSlider.tsx
│   │   ├── ProgressBar.tsx
│   │   └── QuestionnaireContainer.tsx
│   ├── reports/
│   │   ├── DimensionScore.tsx
│   │   ├── ScoreWheel.tsx
│   │   ├── StatementCard.tsx
│   │   ├── ReflectionInput.tsx
│   │   └── PDFExport.tsx
│   └── activities/
│       ├── ActivityCard.tsx
│       ├── ActivityDetail.tsx
│       └── ActivityProgress.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Client-side Supabase
│   │   ├── server.ts              # Server-side Supabase
│   │   └── auth.ts                # Auth helpers
│   ├── scoring/
│   │   ├── calculate.ts           # Score calculation
│   │   └── bands.ts               # Band assignment
│   └── pdf/
│       └── generate.ts            # PDF generation
├── hooks/
│   ├── useUser.ts                 # Current user hook
│   ├── useSupabase.ts             # Supabase hook
│   └── useQuestionnaireProgress.ts
└── types/
    ├── supabase.ts                # Generated types
    ├── questionnaire.ts           # Questionnaire types
    └── index.ts                   # Shared types
```

### Git Workflow

```bash
# Initialize git (if not already done)
cd SPARK
git init

# Add remote (you already have an empty repo)
git remote add origin https://github.com/4Sighteducation/spark.git

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF

# Initial commit
git add .
git commit -m "Initial SPARK setup: Database schema, config, and data files"

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🎯 Testing Your Setup

### Test 1: Database Connection

Create `src/lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

Test in browser console:
```javascript
const { data, error } = await supabase.from('organizations').select('*')
console.log(data) // Should return empty array (no orgs yet)
```

### Test 2: TypeScript Types

Try importing types:
```typescript
import type { Database } from '@/types/supabase'

type Organization = Database['public']['Tables']['organizations']['Row']
```

Should have full autocomplete!

### Test 3: Tailwind Theme

Create a test component with SPARK colors:
```tsx
<div className="bg-spark-pink text-white p-4 rounded-lg">
  SPARK Pink!
</div>

<div className="bg-gradient-dimension-s p-4 rounded-lg">
  Self-Direction Gradient
</div>
```

## 🐛 Troubleshooting

### Issue: SQL Error when running schema

**Problem**: Subquery in check constraint error (we fixed this!)

**Solution**: The schema file has been updated. If you still see errors:
1. Make sure you're using the latest `supabase-spark-schema.sql`
2. The problematic CHECK constraint has been replaced with a trigger

### Issue: TypeScript errors about missing types

**Problem**: `src/types/supabase.ts` doesn't exist

**Solution**: 
1. Run `npm run db:types` to generate
2. OR create manually from Supabase dashboard
3. OR temporarily create an empty file to unblock development

### Issue: Environment variables not working

**Problem**: `.env.local` not being read

**Solution**:
1. Restart dev server (`npm run dev`)
2. Check file is named exactly `.env.local` (not `.env` or `.env.example`)
3. Verify values have no quotes or spaces

### Issue: npm install fails

**Problem**: Dependency conflicts or network issues

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
rm -rf node_modules package-lock.json

# Install again
npm install
```

## 📞 Need Help?

If you get stuck:

1. **Check the error message carefully** - it usually tells you what's wrong
2. **Check the database schema** is properly deployed in Supabase
3. **Check environment variables** are correctly set
4. **Check Node version** is 18+ (`node --version`)

Ready to continue building? Let's create those authentication pages and seed scripts!


