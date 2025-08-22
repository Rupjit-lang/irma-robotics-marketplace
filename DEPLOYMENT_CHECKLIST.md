# ✅ IRMA Marketplace Deployment Checklist

## 🚀 IRMA Marketplace Deployment Checklist

## Pre-Deployment Status ✅

- [x] **Code Repository**: All 96+ files committed to Git
- [x] **Environment Files**: Production and demo environment configurations created
- [x] **Deployment Scripts**: GitHub connection and Vercel deployment scripts ready
- [x] **Documentation**: Complete setup and deployment guides available

## Deployment Steps

### 1. GitHub Repository Setup
- [ ] Create private GitHub repository at: https://github.com
- [ ] Repository name: `irma-marketplace`  
- [ ] Set to **Private** (keeps code confidential)
- [ ] Copy repository URL: `https://github.com/[username]/irma-marketplace.git`

### 2. Code Upload
- [ ] Run: `.\connect-github.bat [YOUR_REPO_URL]`
- [ ] Verify code is pushed to GitHub
- [ ] Confirm all 96+ files are visible in GitHub repository

### 3. Vercel Deployment
- [ ] Sign up at: https://vercel.com (use GitHub account)
- [ ] Click "New Project" → Import from GitHub
- [ ] Select `irma-marketplace` repository
- [ ] Configure build settings:
  - Build Command: `cd apps/web && pnpm build`
  - Output Directory: `apps/web/.next`
  - Install Command: `pnpm install`

### 4. Environment Variables Configuration
Choose one option:

#### Option A: Demo Deployment (Quick Test)
- [ ] Copy variables from `.env.demo` file
- [ ] Add to Vercel → Project Settings → Environment Variables
- [ ] Deploy with demo configuration

#### Option B: Production Deployment (Full Setup)
- [ ] Set up Supabase project: https://supabase.com
- [ ] Set up Razorpay account: https://razorpay.com
- [ ] Copy variables from `.env.production` file
- [ ] Replace demo values with real credentials
- [ ] Add to Vercel environment variables

### 5. Deployment & Testing
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build completion (2-3 minutes)
- [ ] Get live URL: `https://[project-name].vercel.app`
- [ ] Test website functionality:
  - [ ] Homepage loads correctly
  - [ ] Buyer flow (/buy) works
  - [ ] Supplier flow (/supplier) works
  - [ ] Navigation functions properly

## Expected Timeline

| Step | Duration | Status |
|------|----------|---------|
| GitHub Setup | 2 minutes | ⏳ Pending |
| Code Upload | 1 minute | ⏳ Pending |
| Vercel Account | 2 minutes | ⏳ Pending |
| Environment Config | 3 minutes | ⏳ Pending |
| Deployment | 3 minutes | ⏳ Pending |
| **Total** | **11 minutes** | **⏳ Ready to Start** |

## Troubleshooting

### Build Failures
- Check environment variables are correctly set
- Verify all required variables are present
- Check build logs in Vercel dashboard

### Runtime Errors
- Database connection issues → Check DATABASE_URL
- Authentication errors → Check Supabase keys
- Payment errors → Check Razorpay configuration

## Success Criteria

✅ **Live URL accessible**: https://[your-project].vercel.app  
✅ **Homepage loads**: Hero section and navigation visible  
✅ **Buyer flow**: Intake form accessible at /buy  
✅ **Supplier flow**: Registration page accessible at /supplier  
✅ **Private code**: GitHub repository remains private  
✅ **Public website**: Anyone can visit the live URL

---

**Ready to deploy? Start with Step 1: GitHub Repository Setup!**
