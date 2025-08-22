# ⚡ One-Click Vercel Deployment

## 🚀 Deploy IRMA Marketplace to Vercel Now

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/irma-marketplace&env=DATABASE_URL,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,RAZORPAY_KEY_ID,NEXT_PUBLIC_RAZORPAY_KEY_ID&envDescription=Required%20environment%20variables%20for%20IRMA%20marketplace&envLink=https://github.com/yourusername/irma-marketplace/blob/main/.env.example&project-name=irma-marketplace&repository-name=irma-marketplace)

## 📋 Quick Setup Checklist

Before clicking deploy, prepare these:

### 🗄️ Database (Supabase - Free)
1. Go to [supabase.com](https://supabase.com) → New Project
2. Get your project URL and anon key
3. Copy connection string from Settings → Database

### 💳 Payments (Razorpay - Free Sandbox)  
1. Go to [razorpay.com](https://razorpay.com) → Sign Up
2. Get API keys from Dashboard → Settings → API Keys
3. Enable Route (for split payments) in Dashboard

### 🔑 Environment Variables (Copy to Vercel)

```env
# Database
DATABASE_URL=postgresql://postgres:[password]@[ref].supabase.co:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]

# Razorpay  
RAZORPAY_KEY_ID=rzp_test_[key]
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_[key]
RAZORPAY_KEY_SECRET=[secret]

# App
NEXT_PUBLIC_APP_URL=https://irma-marketplace.vercel.app
```

## ⚡ 2-Minute Deployment

1. **Click the Deploy button above** ☝️
2. **Connect your GitHub** account
3. **Fill environment variables** (from checklist above)
4. **Click Deploy** 
5. **Wait 2-3 minutes** ⏱️
6. **Your live URL**: `https://irma-marketplace-[random].vercel.app` 🎉

## 🎯 What You Get

After deployment:
- ✅ **Live IRMA marketplace** accessible worldwide
- ✅ **Buyer matching system** with AI algorithm
- ✅ **Supplier onboarding** with KYC verification
- ✅ **Payment processing** via Razorpay
- ✅ **Mobile-optimized** responsive design
- ✅ **Auto-deployments** on code changes

## 🔧 Post-Deployment Setup

After your site is live:

### Database Migration
```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment and setup database
vercel env pull .env.local
cd apps/web
npx prisma migrate deploy
npx prisma db seed
```

### Custom Domain (Optional)
1. Project Settings → Domains in Vercel
2. Add your domain (e.g., `irma.co.in`)
3. Configure DNS as instructed

## 📱 Test Your Deployment

Visit your live URL and test:
- 🔍 **Buyer Flow**: Click "Find Automation Solutions"
- 🏭 **Supplier Flow**: Click "List Your Products"  
- 💳 **Payment Demo**: Complete a test purchase
- 📱 **Mobile**: Test on your phone

## 🎉 Success!

Your IRMA marketplace is now live on the internet! 

**Share your URL** with potential users:
`https://your-project.vercel.app`

---

**Need help?** Check the [detailed deployment guide](./VERCEL_DEPLOY.md) or [Vercel docs](https://vercel.com/docs).