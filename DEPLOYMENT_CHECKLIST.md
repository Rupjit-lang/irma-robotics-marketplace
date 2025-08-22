# ✅ IRMA Marketplace Deployment Checklist

## 📦 Pre-Deployment Verification

### **✅ All Files Ready**
- [x] `vercel.json` - Optimized for pnpm monorepo
- [x] `next.config.js` - Performance and security headers
- [x] `.gitignore` - Excludes sensitive files
- [x] `.env.vercel` - Environment variables template
- [x] `README.md` - Professional documentation
- [x] `package.json` - Proper pnpm workspace configuration
- [x] `pnpm-workspace.yaml` - Workspace definition
- [x] Deployment scripts (`.bat` and `.sh`)

### **✅ Project Structure Verified**
```
IRMA QODER/
├── apps/web/           # Next.js 14 App Router ✅
├── packages/lib/       # Matching engine ✅
├── docs/              # Documentation ✅
├── vercel.json        # Deployment config ✅
├── README.md          # Repository info ✅
└── .gitignore         # Git exclusions ✅
```

### **✅ Configuration Verified**
- [x] **Framework**: Next.js 14 App Router
- [x] **Package Manager**: pnpm 8.15.0
- [x] **Build Command**: `cd apps/web && pnpm build`
- [x] **Output Directory**: `apps/web/.next`
- [x] **Node Version**: >=18.0.0
- [x] **Regions**: Mumbai (bom1) + Singapore (sin1)

## 🚀 Deployment Steps

### **Step 1: Local Git Setup** ⏱️ 2 minutes
- [ ] Run `deploy-to-vercel.bat` (Windows) or `deploy-to-vercel.sh` (Mac/Linux)
- [ ] Or run manual git commands from `COMPLETE_DEPLOYMENT_GUIDE.md`

### **Step 2: GitHub Repository** ⏱️ 1 minute  
- [ ] Go to [github.com/new](https://github.com/new)
- [ ] Create repository named `irma-marketplace`
- [ ] Set to **Public** (required for free deployment)
- [ ] **Don't initialize** with README

### **Step 3: Push to GitHub** ⏱️ 1 minute
```bash
git remote add origin https://github.com/yourusername/irma-marketplace.git
git branch -M main  
git push -u origin main
```

### **Step 4: Vercel Deployment** ⏱️ 2 minutes
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign in with GitHub
- [ ] Click "New Project"
- [ ] Import `irma-marketplace` repository
- [ ] Click "Deploy" (auto-detects Next.js + pnpm)

### **Step 5: Environment Variables** ⏱️ 5 minutes
**In Vercel Dashboard → Settings → Environment Variables:**

#### **Database (Supabase)**
- [ ] `DATABASE_URL`
- [ ] `PRISMA_MIGRATE_URL`  

#### **Authentication**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

#### **Payments (Razorpay)**  
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- [ ] `ROUTE_WEBHOOK_SECRET`

#### **Application**
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXTAUTH_SECRET`

### **Step 6: Redeploy** ⏱️ 2 minutes
- [ ] Go to Deployments tab
- [ ] Click "Redeploy" on latest deployment
- [ ] Wait for build completion

## 🎯 Post-Deployment Testing

### **✅ Basic Functionality**
- [ ] Homepage loads quickly (<3 seconds)
- [ ] Click "Find Automation Solutions" works
- [ ] Buyer form displays and submits
- [ ] AI matching results appear
- [ ] Click "List Your Products" works
- [ ] Supplier onboarding flow displays
- [ ] Mobile responsive design works

### **✅ Performance Verification**
- [ ] Lighthouse score 90+ (run in Chrome DevTools)
- [ ] First Contentful Paint <2 seconds
- [ ] Largest Contentful Paint <3 seconds
- [ ] No console errors in browser

### **✅ URLs Working**
- [ ] Production URL: `https://irma-marketplace-[random].vercel.app`
- [ ] All internal links working
- [ ] Images and assets loading
- [ ] API routes responding (check Network tab)

## 🔧 Optional Enhancements

### **Custom Domain** ⏱️ 10 minutes
- [ ] Purchase domain (e.g., `irma.co.in`)
- [ ] Add in Vercel → Settings → Domains
- [ ] Configure DNS as instructed
- [ ] Update `NEXT_PUBLIC_APP_URL` environment variable

### **Database Setup** ⏱️ 15 minutes
```bash
# Install Vercel CLI
npm install -g vercel

# Setup database
vercel env pull .env.local
cd apps/web
npx prisma migrate deploy
npx prisma db seed
```

### **Analytics & Monitoring**
- [ ] Enable Vercel Analytics in dashboard
- [ ] Add Google Analytics (optional)
- [ ] Set up error tracking (Sentry, etc.)

## 🆘 Common Issues & Solutions

### **Build Fails**
❌ **Error**: `pnpm: command not found`  
✅ **Solution**: Vercel auto-detects pnpm from `packageManager` in package.json

❌ **Error**: `Module not found`  
✅ **Solution**: Check imports in Next.js files, ensure proper paths

❌ **Error**: `Environment variable missing`  
✅ **Solution**: Add all variables in Vercel dashboard, then redeploy

### **Deployment Issues**
❌ **Error**: `Git authentication failed`  
✅ **Solution**: Make sure repository is public, check GitHub permissions

❌ **Error**: `Build timeout`  
✅ **Solution**: Large projects may need Pro plan, optimize build process

### **Runtime Issues**
❌ **Error**: `Internal Server Error`  
✅ **Solution**: Check Function Logs in Vercel dashboard

❌ **Error**: `Database connection failed`  
✅ **Solution**: Verify DATABASE_URL format and Supabase project status

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Vercel build completes without errors
- ✅ Production URL loads homepage
- ✅ All interactive features work
- ✅ No console errors in browser
- ✅ Mobile version displays correctly
- ✅ Lighthouse performance score >90

## 📞 Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Supabase Setup**: [supabase.com/docs](https://supabase.com/docs)
- **Razorpay Integration**: [razorpay.com/docs](https://razorpay.com/docs)

---

**🎯 Total Deployment Time: ~15 minutes**  
**🌐 Result: Production-ready IRMA marketplace live on the internet!**