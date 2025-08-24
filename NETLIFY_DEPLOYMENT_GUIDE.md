# 🌐 Netlify Deployment Guide - IRMA Marketplace

## ✅ Netlify Configuration Fixed!

The base directory issue has been resolved with proper `netlify.toml` configuration.

## 🚀 Quick Netlify Deployment

### **1. Connect Repository to Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click **"New site from Git"**
4. Choose **GitHub** as your Git provider
5. Select **`irma-robotics-marketplace`** repository

### **2. Build Settings (Auto-Configured)**
Netlify will automatically detect from `netlify.toml`:
- **Base directory**: `.` (repository root) ✅
- **Build command**: `chmod +x build-netlify.sh && ./build-netlify.sh` ✅
- **Publish directory**: `apps/web/out` ✅
- **Node.js version**: 18 ✅

### **3. Environment Variables**
Add these in **Site settings → Environment variables**:

#### **🗄️ Database (Supabase)**
```
DATABASE_URL=postgresql://postgres:[password]@[ref].supabase.co:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1
PRISMA_MIGRATE_URL=postgresql://postgres:[password]@[ref].supabase.co:5432/postgres?sslmode=require
```

#### **🔐 Authentication (Supabase)**
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

#### **💳 Payments (Razorpay)**
```
RAZORPAY_KEY_ID=rzp_test_[your-key-id]
RAZORPAY_KEY_SECRET=[your-secret-key]
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_[your-key-id]
ROUTE_WEBHOOK_SECRET=[your-webhook-secret]
```

#### **🌐 Application**
```
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
NEXTAUTH_SECRET=[random-32-char-string]
NETLIFY=true
```

### **4. Deploy**
1. Click **"Deploy site"**
2. Wait 3-5 minutes for build completion
3. Your site will be available at `https://random-name.netlify.app`

## 🔧 Technical Details

### **What the Configuration Does:**
- **✅ Base Directory Fix**: Sets `base = "."` to use repository root
- **✅ Monorepo Support**: Handles `apps/web` structure correctly  
- **✅ Static Export**: Configures Next.js for static deployment
- **✅ pnpm Support**: Installs and uses pnpm for dependencies
- **✅ Prisma Generation**: Generates Prisma client during build
- **✅ Security Headers**: Adds security and performance headers

### **Build Process:**
1. **Navigate** to `apps/web` directory
2. **Install** pnpm globally if needed
3. **Install** dependencies with `pnpm install`
4. **Generate** Prisma client
5. **Set** `NETLIFY=true` environment variable
6. **Build** Next.js application with static export
7. **Output** to `apps/web/out` directory

## 🎯 Performance Features

Your Netlify deployment includes:
- **Edge CDN** - Global content delivery
- **Instant Cache Invalidation** - Updates deploy instantly
- **Atomic Deploys** - All-or-nothing deployments
- **Branch Previews** - Preview deployments for PRs
- **Form Handling** - Built-in form processing
- **Function Support** - Serverless functions if needed

## 🔄 Automatic Deployments

Every GitHub push to `main` will:
1. **Trigger Netlify build**
2. **Run build script** with monorepo support
3. **Deploy to production** if successful
4. **Update your live site** automatically

## 🛠️ Troubleshooting

**Build still fails?**
- Check build logs for specific errors
- Verify all environment variables are set
- Ensure GitHub repository permissions are correct

**Site loads but features don't work?**
- Check environment variables in Netlify dashboard
- Verify Supabase and Razorpay credentials
- Check browser console for JavaScript errors

**Slow build times?**
- Netlify builds can take 3-5 minutes for Next.js apps
- This is normal for static generation with dependencies

## 🎉 Success!

Your IRMA marketplace is now deployed on Netlify with:
- ✅ **Proper base directory configuration**
- ✅ **Next.js static export**
- ✅ **Monorepo structure support**
- ✅ **pnpm package management**
- ✅ **Automatic deployments**
- ✅ **Global CDN**
- ✅ **Security headers**

**🔗 Your live site**: `https://your-site.netlify.app`

---

**Note**: This configuration also maintains compatibility with Vercel and Cloudflare Pages, so you can deploy to multiple platforms if needed.