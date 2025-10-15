# Debug Email/PDF Issues

## Console Errors:

1. ✅ `favicon.ico 404` - Not important, just missing favicon
2. ❌ `/api/leads/demo 500` - **This is the problem!**
3. ❌ "Failed to save lead data"

## Likely Issue:

The `/api/leads/demo` route is failing when trying to save the completed demo to the database. This might be blocking the email from sending.

## Quick Checks:

1. **Verify Supabase connection**:
   - Check NEXT_PUBLIC_SUPABASE_URL is correct in Vercel
   - Check SUPABASE_SERVICE_ROLE_KEY is correct

2. **Check Supabase logs**:
   - Go to Supabase Dashboard → Logs
   - Look for errors around the time you submitted

3. **Check Vercel function logs**:
   - Go to Vercel → Logs
   - Filter by `/api/leads/demo`
   - See the actual 500 error message

## Temporary Fix:

The email generation might be working, but failing silently because the demo save fails first. Let me add better error handling so emails send even if demo save fails.

