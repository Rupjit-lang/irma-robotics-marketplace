# 🚀 Cloudflare Pages Deployment Guide

## Why Cloudflare Pages?
- **Faster global CDN** with 300+ locations
- **Better performance** for international users
- **More reliable builds** for monorepo projects
- **Free tier** with generous limits
- **Excellent Next.js support**

---

## Step 1: Create Cloudflare Account

1. **Go to**: https://pages.cloudflare.com
2. **Sign up** for a free Cloudflare account
3. **Verify** your email address

---

## Step 2: Connect Your GitHub Repository

1. **Click** "Create a project"
2. **Select** "Connect to Git"
3. **Choose** "GitHub" as your Git provider
4. **Authorize** Cloudflare to access your GitHub
5. **Select** your repository: `irma-marketplace`

---

## Step 3: Configure Build Settings

### Framework Preset
- **Framework**: Next.js (Static HTML Export)
- **Build command**: `cd apps/web && npm run build`
- **Build output directory**: `apps/web/out`
- **Root directory**: [Leave empty]

### Advanced Settings
- **Node.js version**: 18
- **Environment variables**: [Add from list below]

---

## Step 4: Environment Variables

Add these environment variables in Cloudflare Pages:

```bash
# Database
DATABASE_URL=postgresql://postgres:demo_password@db.demo.supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxOTU2NTcxMjAwfQ.demo_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE5NTY1NzEyMDB9.demo_service_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1234567890
RAZORPAY_KEY_SECRET=demo_razorpay_secret_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://irma-marketplace.pages.dev
NEXTAUTH_SECRET=demo-secret-key-for-development-only

# Environment
NODE_ENV=production
```

---

## Step 5: Update Next.js Configuration

We need to configure Next.js for static export to work with Cloudflare Pages.

### Required Changes:
1. **Update** `apps/web/next.config.js` for static export
2. **Add** export configuration
3. **Configure** image optimization for Cloudflare

---

## Step 6: Deploy

1. **Click** "Save and Deploy"
2. **Wait** 3-5 minutes for build completion
3. **Get** your live URL: `https://irma-marketplace.pages.dev`

---

## Step 7: Custom Domain (Optional)

1. **Go to** "Custom domains" in your project
2. **Add** your domain (e.g., `irma.yourdomain.com`)
3. **Update** DNS records as instructed
4. **Enable** automatic HTTPS

---

## Advantages Over Vercel

✅ **Better global performance**  
✅ **More stable builds for monorepos**  
✅ **Higher free tier limits**  
✅ **Advanced DDoS protection**  
✅ **Better caching controls**  

---

## Expected Timeline

| Step | Duration |
|------|----------|
| Account setup | 2 minutes |
| Repository connection | 1 minute |
| Build configuration | 2 minutes |
| Environment variables | 3 minutes |
| First deployment | 5 minutes |
| **Total** | **13 minutes** |

---

## Troubleshooting

### Build Failures
- Check Node.js version is set to 18
- Verify build command includes `cd apps/web`
- Ensure all environment variables are set

### Runtime Errors
- Check browser console for errors
- Verify API routes are working
- Test database connectivity

---

**Ready to deploy to Cloudflare? Let's start with Step 1!**