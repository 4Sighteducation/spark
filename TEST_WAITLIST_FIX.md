# Waitlist API 500 Error - Diagnosis

## What We Know:
- ✅ Table `leads` exists in Supabase
- ✅ RLS policies exist
- ❌ Insert is failing with 500 error

## Most Likely Causes:

### 1. Environment Variable Issue
Check in Vercel dashboard that `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### 2. Column Constraint
The insert might be violating a NOT NULL or CHECK constraint

### 3. IP Address Type
`ip_address INET` might fail if the IP is malformed

## Quick Fix to Test:

Run this SQL in Supabase to temporarily allow everything:

```sql
-- Temporarily disable RLS to test
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
```

Then have your client try waitlist signup again.

**If it works**: RLS policy is the problem  
**If it still fails**: Something else (column constraint, data type, etc.)

## Better Solution:

Since we're using SERVICE_ROLE_KEY (which bypasses RLS anyway), let's add a try-catch around the problematic fields:

The `ip_address` field using INET type might be the issue. We can make it TEXT instead.

