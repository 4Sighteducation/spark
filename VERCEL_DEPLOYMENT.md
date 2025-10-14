# SPARK - Vercel Deployment Guide

Your SPARK project is connected to Vercel at: https://vercel.com/tony-dennis-projects/spark/

## ✅ Current Status

- ✅ Vercel project created
- ✅ Repository linked
- ✅ Environment variables configured locally
- 🔲 Need to push code to GitHub
- 🔲 Need to configure Vercel environment variables
- 🔲 Need to trigger first deployment

---

## 🚀 Deployment Steps

### Step 1: Push Code to GitHub

1. **Initialize Git** (if not already done):
```bash
cd "C:\Users\tonyd\OneDrive - 4Sight Education Ltd\Apps\SPARK"
git init
git branch -M main
```

2. **Connect to GitHub**:
```bash
git remote add origin https://github.com/4Sighteducation/spark.git
```

3. **Stage all files**:
```bash
git add .
```

4. **Commit**:
```bash
git commit -m "Initial SPARK foundation: database schema, config, and core utilities"
```

5. **Push to GitHub**:
```bash
git push -u origin main
```

---

### Step 2: Configure Vercel Environment Variables

Go to: https://vercel.com/tony-dennis-projects/spark/settings/environment-variables

Add these variables (from your `.env` file):

#### Required Variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service key | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://spark.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://spark-git-*.vercel.app` | Preview |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Development |
| `NODE_ENV` | `production` | Production, Preview |

#### Optional Variables (for later):

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Production, Preview, Development |
| `SENDGRID_API_KEY` | Your SendGrid API key | Production, Preview, Development |
| `SENDGRID_FROM_EMAIL` | `noreply@spark.app` | Production, Preview, Development |

**Important**: 
- Mark `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` as **sensitive**
- Apply all variables to: **Production**, **Preview**, and **Development**

---

### Step 3: Trigger Deployment

Once environment variables are set in Vercel:

1. **Automatic Deployment**:
   - Vercel will automatically deploy when you push to GitHub
   - Or manually trigger from Vercel dashboard

2. **Manual Trigger**:
   - Go to https://vercel.com/tony-dennis-projects/spark/deployments
   - Click "Redeploy" on latest deployment

---

## 🌐 Your Deployment URLs

### Production:
- **Main Domain**: `https://spark.vercel.app`
- **Custom Domain** (optional): `https://spark.4sighteducation.com`

### Preview (for testing):
- **Branch Previews**: `https://spark-git-[branch].vercel.app`
- Each pull request gets its own preview URL

### Development:
- **Local**: `http://localhost:3000`

---

## 🔧 Build Configuration

Your `vercel.json` is configured with:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["lhr1"]
}
```

- **Region**: London (`lhr1`) for low latency in UK
- **Framework**: Next.js 14 (App Router)
- **Build**: Standard Next.js build process

---

## 📦 Build Process

When you push to GitHub, Vercel will:

1. **Install dependencies**: `npm install`
2. **Build Next.js app**: `npm run build`
3. **Deploy to Edge Network**: ~30 seconds
4. **Run health checks**: Automatic
5. **Assign URL**: Production or preview

---

## ✅ Pre-Deployment Checklist

Before your first deployment, ensure:

- [ ] Database schema deployed to Supabase
- [ ] All environment variables added to Vercel
- [ ] Code pushed to GitHub
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)

---

## 🐛 Troubleshooting Deployments

### Build Fails: "Missing Environment Variables"

**Solution**: Check Vercel environment variables are set for all environments (Production, Preview, Development)

### Build Fails: "Module not found"

**Solution**: 
```bash
# Clear cache locally and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Build Fails: TypeScript Errors

**Solution**: Fix errors locally first
```bash
npm run type-check
# Fix any errors
git add .
git commit -m "Fix TypeScript errors"
git push
```

### Runtime Error: "Supabase connection failed"

**Solution**: Check environment variables are correct:
- `NEXT_PUBLIC_SUPABASE_URL` should start with `https://`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` should be the **anon** key, not service key

### Slow Cold Starts

**Solution**: Vercel Hobby plan has cold starts. Upgrade to Pro for instant warm starts.

---

## 🚀 Deployment Commands

### Deploy from CLI (optional):

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### View Logs:

```bash
# Recent logs
vercel logs

# Live logs
vercel logs --follow
```

---

## 📊 Monitoring Your Deployment

### Analytics
- Go to: https://vercel.com/tony-dennis-projects/spark/analytics
- View: Visitors, page views, top pages

### Speed Insights
- Go to: https://vercel.com/tony-dennis-projects/spark/speed-insights
- Monitor: Core Web Vitals, performance

### Logs
- Go to: https://vercel.com/tony-dennis-projects/spark/logs
- View: Runtime logs, errors, requests

### Firewall (Pro plan)
- DDoS protection
- Rate limiting
- Geographic restrictions

---

## 🔐 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files to Git (already in `.gitignore`)
- ✅ Store secrets in Vercel dashboard only
- ✅ Use different keys for production vs development
- ✅ Rotate keys regularly (every 6 months)

### Database
- ✅ RLS policies enabled on all tables
- ✅ Service role key kept secret
- ✅ Anon key is public-safe (limited permissions)

### Authentication
- ✅ Use Supabase Auth (built-in security)
- ✅ Enable email verification
- ✅ Set up password requirements

---

## 📈 Post-Deployment

### Immediate Next Steps:
1. ✅ Test production URL works
2. ✅ Verify Supabase connection
3. ✅ Check no console errors
4. ✅ Test on mobile devices

### Set Up Custom Domain (optional):
1. Go to: https://vercel.com/tony-dennis-projects/spark/settings/domains
2. Add domain: `spark.4sighteducation.com`
3. Update DNS records (Vercel will provide)
4. Wait for SSL certificate (automatic)

### Set Up Monitoring:
1. Enable Vercel Analytics (free on Hobby plan)
2. Set up error tracking (Sentry integration)
3. Configure Slack/email notifications for deployments

---

## 🎯 Deployment Workflow

### Development Workflow:
```
1. Make changes locally
2. Test locally (npm run dev)
3. Commit to feature branch
4. Push to GitHub
5. Vercel creates preview deployment
6. Test preview URL
7. Merge to main
8. Automatic production deployment
```

### Rollback:
If something goes wrong:
1. Go to: https://vercel.com/tony-dennis-projects/spark/deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback (no downtime)

---

## 💰 Vercel Pricing

### Hobby Plan (Current - FREE):
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ Preview deployments
- ✅ Analytics
- ✅ Speed Insights
- ❌ No custom domains on free subdomains
- ❌ Cold starts

### Pro Plan ($20/month - when needed):
- ✅ Everything in Hobby
- ✅ No cold starts (instant)
- ✅ Advanced analytics
- ✅ Team collaboration
- ✅ Priority support
- ✅ 1TB bandwidth

**Recommendation**: Start with Hobby, upgrade to Pro when you have real users (100+ students).

---

## 📞 Need Help?

### Vercel Documentation:
- Main Docs: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Environment Variables: https://vercel.com/docs/environment-variables

### Vercel Support:
- Community: https://github.com/vercel/vercel/discussions
- Email: support@vercel.com (Pro plan only)

---

## ✅ Deployment Checklist

Use this checklist for your first deployment:

### Pre-Push:
- [x] All config files created
- [x] .gitignore configured
- [x] Database schema ready
- [ ] Local environment tested
- [ ] TypeScript check passes
- [ ] Build succeeds locally

### Vercel Setup:
- [x] Vercel project created
- [x] GitHub repo linked
- [ ] Environment variables added
- [ ] Region set to London (lhr1)
- [ ] Framework detected (Next.js)

### First Deployment:
- [ ] Code pushed to GitHub
- [ ] Vercel build triggered
- [ ] Build succeeds
- [ ] Production URL accessible
- [ ] No console errors
- [ ] Database connection works

### Post-Deployment:
- [ ] Test all pages load
- [ ] Test on mobile
- [ ] Set up monitoring
- [ ] Share URL with team
- [ ] Plan next sprint

---

**Your deployment is almost ready! Just push to GitHub and watch Vercel build. 🚀**


