# 🚀 GitHub + Vercel Deployment - Step by Step

## Step 1: Create GitHub Repository

1. **Go to [github.com](https://github.com) and sign in**
2. **Click the "+" icon** → "New repository"
3. **Repository name**: `irma-marketplace`
4. **Description**: "IRMA - Industrial Robotics Marketplace for India"
5. **Set to Public** (required for free deployment)
6. **Click "Create repository"**

## Step 2: Push Code to GitHub

**Copy and paste these commands one by one in your terminal:**

### Initialize Git (if not already done)
```bash
cd "D:\IRMA QODER"
git init
```

### Add all files
```bash
git add .
```

### Commit with message
```bash
git commit -m "🚀 Initial IRMA marketplace deployment - Full Next.js 14 B2B platform"
```

### Connect to your GitHub repository (replace 'yourusername')
```bash
git remote add origin https://github.com/yourusername/irma-marketplace.git
```

### Set main branch and push
```bash
git branch -M main
git push -u origin main
```

## Step 3: Deploy on Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import from GitHub** → Find "irma-marketplace"
5. **Click "Import"**

### Vercel will auto-detect:
- ✅ Framework: Next.js
- ✅ Root Directory: Automatically configured
- ✅ Build Command: `cd apps/web && pnpm build`
- ✅ Output Directory: `apps/web/.next`

6. **Click "Deploy"** (First deployment will take 2-3 minutes)

## Step 4: Add Environment Variables

After first deployment, **go to Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these one by one:

### Database (Supabase)
```
Name: DATABASE_URL
Value: postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1
```

```
Name: PRISMA_MIGRATE_URL  
Value: postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres?sslmode=require
```

### Supabase Auth
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://[project-ref].supabase.co
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [your-anon-key-from-supabase]
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [your-service-role-key]
```

### Razorpay Payments
```
Name: RAZORPAY_KEY_ID
Value: rzp_test_[your-key-id]
```

```
Name: RAZORPAY_KEY_SECRET
Value: [your-secret-key]
```

```
Name: NEXT_PUBLIC_RAZORPAY_KEY_ID  
Value: rzp_test_[your-key-id]
```

```
Name: ROUTE_WEBHOOK_SECRET
Value: [your-webhook-secret]
```

### Application Config
```
Name: NEXT_PUBLIC_APP_URL
Value: https://your-vercel-url.vercel.app
```

```
Name: NEXTAUTH_SECRET
Value: [generate-random-32-char-string]
```

## Step 5: Redeploy

1. **Go to "Deployments" tab** in Vercel
2. **Click "Redeploy"** on the latest deployment  
3. **Wait 2-3 minutes** for build to complete

## 🎉 You're Live!

Your IRMA marketplace will be available at:
`https://irma-marketplace-[random].vercel.app`

### Test These Features:
- ✅ Homepage with gradient hero section
- ✅ Buyer flow: Requirements → AI matching → Quotes
- ✅ Supplier flow: KYC onboarding → Catalog management  
- ✅ Payment processing with Razorpay
- ✅ Mobile responsive design

## Next Steps:

### Setup Database (One-time)
```bash
# Install Vercel CLI
npm install -g vercel

# Pull environment variables
vercel env pull .env.local

# Run database migrations
cd apps/web
npx prisma migrate deploy
npx prisma db seed
```

### Custom Domain (Optional)
1. **Vercel Dashboard** → **Domains**
2. **Add your domain** (e.g., irma.co.in)
3. **Configure DNS** as instructed

---

**🎯 Ready? Let's start with Step 1 - Create the GitHub repository!**