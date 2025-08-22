@echo off
echo.
echo ========================================
echo   IRMA - Cloudflare Pages Deployment
echo ========================================
echo.

echo Setting up Cloudflare Pages deployment...

REM Set environment variable for Cloudflare Pages
set CLOUDFLARE_PAGES=true

echo Step 1: Adding Cloudflare configuration...
echo.

REM Commit the Cloudflare configuration
echo Step 2: Committing Cloudflare configuration...
"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "Add Cloudflare Pages configuration - Ready for deployment"

echo.
echo Step 3: Pushing to GitHub...
"C:\Program Files\Git\bin\git.exe" push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================
    echo ✅ SUCCESS! Ready for Cloudflare Pages
    echo ========================================
    echo.
    echo 🎯 NEXT STEPS:
    echo.
    echo 1. Go to: https://pages.cloudflare.com
    echo 2. Sign up/Sign in
    echo 3. Click "Create a project"
    echo 4. Connect to Git → GitHub
    echo 5. Select repository: irma-marketplace
    echo 6. Use these build settings:
    echo    - Framework: Next.js (Static HTML Export)
    echo    - Build command: cd apps/web ^&^& npm run build
    echo    - Build output directory: apps/web/out
    echo    - Node.js version: 18
    echo.
    echo 7. Add environment variables from .env.demo
    echo 8. Click "Save and Deploy"
    echo.
    echo 📋 Check CLOUDFLARE_DEPLOYMENT_GUIDE.md for detailed steps
    echo.
    echo Your live URL will be: https://irma-marketplace.pages.dev
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ ERROR: Failed to push to GitHub
    echo ========================================
    echo.
)

pause