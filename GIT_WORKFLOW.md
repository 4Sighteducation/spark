# Git Workflow for SPARK

Quick reference for Git operations with SPARK.

## 🚀 Initial Setup (One Time)

```bash
# Navigate to project
cd "C:\Users\tonyd\OneDrive - 4Sight Education Ltd\Apps\SPARK"

# Initialize Git (if not already done)
git init

# Set default branch to main
git branch -M main

# Add remote repository
git remote add origin https://github.com/4Sighteducation/spark.git

# Configure your identity (if not already done)
git config user.name "Tony Dennis"
git config user.email "tony@4sighteducation.com"
```

---

## 📤 First Push (Right Now!)

```bash
# Check what will be committed
git status

# Stage all files
git add .

# Commit with descriptive message
git commit -m "Initial SPARK foundation: Complete database schema, configuration, and core utilities

- 17-table database schema with RLS policies
- Full Next.js 14 + TypeScript setup
- Custom SPARK theme with dimension colors
- Complete scoring system (slider to bands)
- Questionnaire, statements, and activities data
- Comprehensive documentation
- Vercel deployment configuration"

# Push to GitHub
git push -u origin main
```

**What happens next:**
1. Code uploads to GitHub
2. Vercel detects push
3. Automatic build & deployment starts
4. Your app goes live at https://spark.vercel.app

---

## 🔄 Daily Workflow

### Starting New Work:
```bash
# Always pull latest changes first
git pull origin main

# Create a feature branch (optional but recommended)
git checkout -b feature/authentication
```

### During Development:
```bash
# Check what changed
git status

# See detailed changes
git diff

# Stage specific files
git add src/app/login/page.tsx
git add src/lib/auth.ts

# Or stage all changes
git add .

# Commit with clear message
git commit -m "Add login page and authentication flow"
```

### Finishing Work:
```bash
# Push to GitHub
git push origin feature/authentication

# Or if on main branch:
git push origin main
```

---

## 🌿 Branch Strategy

### Main Branch:
- **Purpose**: Production-ready code
- **Protection**: Should always work
- **Deploys to**: https://spark.vercel.app

### Feature Branches:
- **Purpose**: New features in development
- **Naming**: `feature/name`, `fix/bug-name`, `update/component-name`
- **Deploys to**: Preview URLs (https://spark-git-feature-*.vercel.app)

### Example Branch Names:
```
feature/authentication
feature/questionnaire
feature/student-dashboard
fix/slider-bug
update/scoring-algorithm
docs/setup-guide
```

---

## 💡 Commit Message Guidelines

### Good Commit Messages:
```bash
git commit -m "Add slider questionnaire component with progress tracking"
git commit -m "Fix: Scoring calculation for dimension averages"
git commit -m "Update: Database schema to include activity_tags table"
git commit -m "Docs: Add deployment troubleshooting section"
```

### Bad Commit Messages:
```bash
git commit -m "updates"
git commit -m "fix"
git commit -m "wip"
git commit -m "asdf"
```

### Template:
```
<type>: <description>

<optional detailed explanation>

<optional issue reference>
```

**Types**: `Add`, `Fix`, `Update`, `Remove`, `Refactor`, `Docs`, `Style`, `Test`

---

## 🔍 Useful Commands

### Check Status:
```bash
# What's changed?
git status

# What's the detailed diff?
git diff

# What's staged?
git diff --staged
```

### View History:
```bash
# Recent commits
git log --oneline -10

# All commits with details
git log

# Graphical view
git log --graph --oneline --all
```

### Undo Changes:
```bash
# Discard changes in a file (careful!)
git checkout -- filename.txt

# Unstage a file
git reset HEAD filename.txt

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) - CAREFUL!
git reset --hard HEAD~1
```

### Branch Management:
```bash
# List branches
git branch

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Delete branch (after merging)
git branch -d feature/old-feature
```

---

## 🚨 Common Issues & Solutions

### Issue: "fatal: remote origin already exists"
```bash
# Remove old remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/4Sighteducation/spark.git
```

### Issue: "Your branch is behind 'origin/main'"
```bash
# Pull latest changes
git pull origin main

# If there are conflicts, resolve them in files
# Then commit the merge:
git commit -m "Merge remote changes"
```

### Issue: "Merge conflict"
```bash
# 1. Open conflicted files (marked with <<<<<<<, =======, >>>>>>>)
# 2. Edit to keep the version you want
# 3. Remove conflict markers
# 4. Stage the resolved files
git add resolved-file.ts

# 5. Complete the merge
git commit -m "Resolve merge conflict in resolved-file.ts"
```

### Issue: Accidentally committed .env file
```bash
# Remove from Git but keep locally
git rm --cached .env

# Add to .gitignore (already done)
echo ".env" >> .gitignore

# Commit the removal
git add .gitignore
git commit -m "Remove .env from Git tracking"
git push
```

**Important**: If you accidentally pushed secrets to GitHub:
1. Rotate all secrets immediately (new Supabase keys, API keys)
2. Update Vercel environment variables
3. Consider using `git filter-branch` or BFG Repo-Cleaner to remove from history

---

## 📦 What's Tracked by Git

### ✅ Tracked (in Git):
- Source code (`src/**`)
- Configuration (`*.json`, `*.ts`)
- Documentation (`*.md`)
- Database schema (`.sql`)
- Public assets (logos, etc.)

### ❌ Not Tracked (in .gitignore):
- `node_modules/` (dependencies)
- `.next/` (build output)
- `.env` `.env.local` (secrets)
- `*.log` (logs)
- `.DS_Store` (Mac files)
- `Thumbs.db` (Windows thumbnails)

---

## 🔄 Collaboration Workflow

### Working with Others:

1. **Always pull before starting**:
```bash
git pull origin main
```

2. **Work in feature branches**:
```bash
git checkout -b feature/my-feature
# Make changes
git commit -m "Add feature"
git push origin feature/my-feature
```

3. **Create Pull Request on GitHub**:
   - Go to https://github.com/4Sighteducation/spark/pulls
   - Click "New Pull Request"
   - Select your branch
   - Add description
   - Request review

4. **After approval, merge**:
   - Merge on GitHub
   - Delete remote branch
   - Locally:
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/my-feature
   ```

---

## 📊 Git Best Practices for SPARK

### DO:
- ✅ Commit often (small, logical chunks)
- ✅ Write clear commit messages
- ✅ Pull before you push
- ✅ Use branches for features
- ✅ Test locally before committing
- ✅ Review your changes before pushing

### DON'T:
- ❌ Commit `.env` files
- ❌ Commit `node_modules/`
- ❌ Push broken code to main
- ❌ Use vague commit messages
- ❌ Force push to main (`git push --force`)
- ❌ Commit large binary files

---

## 🎯 Quick Reference

```bash
# Status & Info
git status              # What's changed?
git log --oneline -5    # Recent commits
git diff                # See changes

# Stage & Commit
git add .               # Stage all
git add file.ts         # Stage one file
git commit -m "msg"     # Commit staged

# Branches
git branch              # List branches
git checkout -b new     # Create & switch
git checkout main       # Switch to main

# Remote
git pull                # Get latest
git push                # Send commits
git push origin branch  # Push branch

# Undo (carefully!)
git checkout -- file    # Discard changes
git reset HEAD file     # Unstage file
git reset --soft HEAD~1 # Undo last commit
```

---

## 🚀 Ready to Push?

Run this to push your foundation to GitHub:

```bash
cd "C:\Users\tonyd\OneDrive - 4Sight Education Ltd\Apps\SPARK"
git add .
git commit -m "Initial SPARK foundation: Complete database schema, configuration, and core utilities"
git push -u origin main
```

Then watch Vercel deploy automatically! 🎉


