# 🚨 IMPORTANT: Deploy Leads Table NOW

The demo questionnaire is failing because the `leads` table doesn't exist in Supabase yet.

## Quick Fix (2 minutes):

1. **Open Supabase SQL Editor**:
   https://supabase.com/dashboard/project/bfepfhqwdzfpirxtbwab/sql

2. **Click "New Query"**

3. **Copy ALL of this file**: `supabase-add-leads-table.sql`

4. **Paste into editor**

5. **Click RUN**

6. **Verify**: Go to Table Editor → You should see new `leads` table

## Then Test:

1. Visit https://www.spark.study
2. Click "Try the Demo"
3. Fill in form
4. Should now work! ✅

**This is critical - the API routes are working but need the database table!**

