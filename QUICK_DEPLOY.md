# 🚀 IRMA Marketplace - Direct Vercel Upload

## Quick Deployment (No Git Required)

Since Git needs a PowerShell restart, here's the fastest way to deploy:

### **Step 1: Direct Upload to Vercel**

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your email or GitHub
3. **Click "Add New Project"**
4. **Choose "Upload"** (instead of importing from Git)
5. **Select the entire folder**: `D:\IRMA QODER`
6. **Drag and drop** or click to upload

### **Step 2: Vercel Auto-Configuration**

Vercel will automatically detect:
- ✅ **Framework**: Next.js (from `apps/web/`)
- ✅ **Build Command**: `cd apps/web && pnpm build`
- ✅ **Output Directory**: `apps/web/.next` 
- ✅ **Install Command**: `pnpm install`

### **Step 3: Deploy**

- **Click "Deploy"**
- **Wait 3-4 minutes** for build completion
- **Get your live URL**: `https://irma-marketplace-[random].vercel.app`

### **Step 4: Add Environment Variables**

After deployment, go to **Vercel Dashboard → Settings → Environment Variables**:

```bash
# Required for full functionality
DATABASE_URL=postgresql://postgres:[password]@[ref].supabase.co:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
RAZORPAY_KEY_ID=rzp_test_[your-key-id]
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_[your-key-id]
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

## 🎯 What Works Immediately

Even without environment variables, you'll get:
- ✅ **Professional homepage** with statistics
- ✅ **Interactive buyer flow** with AI matching demo
- ✅ **Supplier onboarding** preview
- ✅ **Mobile-responsive** design
- ✅ **Global CDN** performance

## 🔄 Alternative: Restart PowerShell & Use Git

If you prefer the Git workflow:

1. **Close this PowerShell window**
2. **Open a new PowerShell window**
3. **Navigate to**: `cd "D:\IRMA QODER"`
4. **Run**: `.\deploy-to-vercel.bat`

Git should now be available in the new session.

---

**🚀 Fastest option: Go to [vercel.com](https://vercel.com) now and drag-drop the `D:\IRMA QODER` folder!**