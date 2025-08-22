@echo off
echo.
echo ========================================
echo   IRMA Marketplace - Complete Deployment
echo ========================================
echo.

REM Check if repository URL is provided
if "%1"=="" (
    echo Please provide your GitHub repository URL:
    echo.
    echo Example: deploy-complete.bat https://github.com/yourusername/irma-marketplace.git
    echo.
    pause
    exit /b 1
)

set REPO_URL=%1
echo Repository URL: %REPO_URL%
echo.

echo Step 1: Connecting to GitHub...
"C:\Program Files\Git\bin\git.exe" remote set-url origin %REPO_URL%

echo Step 2: Pushing all code to GitHub...
"C:\Program Files\Git\bin\git.exe" push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================
    echo ✅ SUCCESS! Code pushed to GitHub
    echo ========================================
    echo.
    echo 🎯 NEXT STEPS FOR VERCEL DEPLOYMENT:
    echo.
    echo 1. Go to: https://vercel.com
    echo 2. Sign up/Sign in with GitHub
    echo 3. Click "New Project"
    echo 4. Import your repository: irma-marketplace
    echo 5. Use these build settings:
    echo    - Build Command: cd apps/web ^&^& pnpm build
    echo    - Output Directory: apps/web/.next
    echo    - Install Command: pnpm install
    echo.
    echo 6. Add environment variables from .env.demo file
    echo 7. Click Deploy!
    echo.
    echo 📋 Check DEPLOYMENT_CHECKLIST.md for detailed steps
    echo.
    echo Your live URL will be: https://[project-name].vercel.app
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ ERROR: Failed to push to GitHub
    echo ========================================
    echo.
    echo Please check:
    echo 1. Repository URL is correct
    echo 2. Repository exists and is accessible
    echo 3. You have permission to push to the repository
    echo.
)

pause