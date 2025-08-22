# 🚀 Vercel Deployment Guide

## Prerequisites
✅ Your code is pushed to a **PRIVATE** GitHub repository  
✅ Repository URL: `https://github.com/YOUR_USERNAME/irma-marketplace.git`

---

## Step 1: Create Vercel Account

1. **Go to**: https://vercel.com
2. **Click** "Sign Up"
3. **Choose** "Continue with GitHub" (recommended)
4. **Authorize** Vercel to access your GitHub account

---

## Step 2: Import Your Repository

1. **Click** "New Project" on Vercel dashboard
2. **Import** from GitHub
3. **Search** for `irma-marketplace` 
4. **Click** "Import" next to your repository

---

## Step 3: Configure Project Settings

Vercel will auto-detect Next.js, but verify these settings:

### Framework Preset
- ✅ **Next.js** (should be auto-selected)

### Build Settings
- **Build Command**: `cd apps/web && pnpm build`
- **Output Directory**: `apps/web/.next`
- **Install Command**: `pnpm install`

### Root Directory
- **Root Directory**: `./` (leave empty/default)

---

## Step 4: Environment Variables

**CRITICAL**: Add these environment variables in Vercel:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Supabase (for authentication)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Razorpay (for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-secret-key
```

**To add environment variables:**
1. In project settings, go to **"Environment Variables"**
2. **Add** each variable one by one
3. **Apply to**: Production, Preview, and Development

---

## Step 5: Deploy

1. **Click** "Deploy"
2. **Wait** 2-3 minutes for build completion
3. **Get** your live URL: `https://your-app.vercel.app`

---

## Step 6: Test Your Application

Visit your live URL and test:
- ✅ Homepage loads
- ✅ Buyer flow (/buy)
- ✅ Supplier flow (/supplier)
- ✅ Authentication works
- ✅ Database connections

---

## Troubleshooting

### Build Fails?
- Check environment variables are set
- Verify DATABASE_URL is correct
- Check build logs in Vercel dashboard

### App Loads but Errors?
- Database connection issues
- Missing environment variables
- Check Vercel function logs

### Need Help?
- Share the Vercel build logs
- Share your live URL for testing
- Check console errors in browser

---

## 🎉 Success!

Your IRMA Marketplace will be live at:
**https://your-project-name.vercel.app**

**Remember**: 
- 🔒 Your code stays PRIVATE on GitHub
- 🌐 Your website is PUBLIC on the internet
- ⚡ Auto-deploys on every GitHub push!