# 🚀 IRMA Marketplace - Vercel Deployment Guide

## 📋 Prerequisites

Before deploying to Vercel, ensure you have:
- ✅ Supabase project set up
- ✅ Razorpay account (live keys for production)
- ✅ GitHub account
- ✅ Vercel account

## 🚀 Quick Deployment (5 minutes)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial IRMA marketplace commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/irma-marketplace.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import from GitHub** - Select your `irma-marketplace` repository
4. **Framework Preset** - Vercel will auto-detect Next.js
5. **Root Directory** - Leave as default (Vercel will use our vercel.json config)
6. **Click "Deploy"**

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

#### Database (Supabase)
- `DATABASE_URL` = `postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1`
- `PRISMA_MIGRATE_URL` = `postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres?sslmode=require`

#### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` = `https://[project-ref].supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `[your-anon-key]`
- `SUPABASE_SERVICE_ROLE_KEY` = `[your-service-key]`

#### Razorpay (Production)
- `RAZORPAY_KEY_ID` = `rzp_live_[your-key-id]`
- `RAZORPAY_KEY_SECRET` = `[your-secret-key]`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` = `rzp_live_[your-key-id]`
- `ROUTE_WEBHOOK_SECRET` = `[your-webhook-secret]`

#### Application
- `NEXT_PUBLIC_APP_URL` = `https://your-project.vercel.app`
- `NEXTAUTH_SECRET` = `[generate-random-secret]`

### Step 4: Redeploy

After adding environment variables:
1. **Go to Deployments tab**
2. **Click "Redeploy" on latest deployment**
3. **Wait 2-3 minutes for build to complete**

## 🎯 Your Live URLs

After deployment, you'll get:
- **Production**: `https://irma-marketplace.vercel.app`
- **Git branches**: `https://irma-marketplace-git-[branch].vercel.app`
- **Custom domain**: Configure in Project Settings → Domains

## ⚡ Automatic Features Enabled

Vercel automatically provides:
- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Auto HTTPS** - SSL certificates
- ✅ **Git Integration** - Deploy on push
- ✅ **Preview Deployments** - Branch previews
- ✅ **Analytics** - Performance monitoring
- ✅ **Edge Functions** - API route optimization

## 🔧 Build Configuration

Our `vercel.json` configures:
- **Build Command**: Builds Next.js app in apps/web
- **Output Directory**: apps/web/.next
- **Framework**: Next.js with App Router
- **Regions**: Mumbai (bom1) + Singapore (sin1) for India users
- **Security Headers**: XSS protection, content type sniffing protection
- **API Routes**: 30s timeout for complex operations

## 📊 Performance Optimizations

The deployment includes:
- **Static Generation** - Pages pre-built at deploy time
- **Image Optimization** - Next.js automatic image optimization
- **Code Splitting** - Only load what's needed
- **Edge Caching** - Static assets cached globally
- **Compression** - Gzip/Brotli compression

## 🗄️ Database Setup

After deployment, run database migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Run database setup (one-time)
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

## 🎨 Custom Domain (Optional)

To use your own domain:
1. **Go to Project Settings → Domains**
2. **Add your domain** (e.g., irma.co.in)
3. **Configure DNS** as instructed by Vercel
4. **Update environment variables** with new domain

## 🔍 Testing Production Deployment

Test these key features:
- ✅ Homepage loads and displays correctly
- ✅ Buyer flow: Submit requirements → Get matches
- ✅ Supplier flow: Onboarding process works
- ✅ API endpoints respond (check /api/health)
- ✅ Database connections work
- ✅ Authentication flows (if enabled)

## 🐛 Troubleshooting

### Common Issues:

**Build Fails:**
- Check package.json scripts in apps/web
- Ensure all dependencies are in package.json
- Check TypeScript errors

**Database Connection:**
- Verify DATABASE_URL format
- Check Supabase project is active
- Ensure connection pooling settings

**API Routes 500 Error:**
- Check environment variables are set
- Verify Razorpay keys are correct
- Check Function Logs in Vercel dashboard

**Slow Loading:**
- Enable Vercel Analytics in dashboard
- Check bundle size in build logs
- Review Core Web Vitals

## 📈 Monitoring & Analytics

Enable monitoring:
1. **Vercel Analytics** - In Project Settings
2. **Speed Insights** - Real user metrics
3. **Function Logs** - API endpoint debugging
4. **Performance Monitoring** - Core Web Vitals

## 🔄 Continuous Deployment

Every git push to main branch will:
1. **Trigger new build** on Vercel
2. **Run tests** (if configured)
3. **Deploy automatically** if build succeeds
4. **Update production URL** with new version

## 🎉 You're Live!

Your IRMA marketplace is now deployed on Vercel with:
- ⚡ **Sub-second loading** globally
- 🔒 **Enterprise security** headers
- 📱 **Mobile optimized** experience
- 🎯 **India-focused** regions (Mumbai/Singapore)
- 💳 **Production Razorpay** integration
- 🔄 **Automatic deployments** from GitHub

**Share your URL**: `https://your-project.vercel.app` 🚀

---

Need help? Check [Vercel Documentation](https://vercel.com/docs) or contact support!