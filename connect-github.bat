@echo off
echo.
echo ========================================
echo   IRMA Marketplace - GitHub Connection
echo ========================================
echo.

REM Check if repository URL is provided
if "%1"=="" (
    echo ERROR: Please provide your GitHub repository URL
    echo.
    echo Usage: connect-github.bat YOUR_REPO_URL
    echo Example: connect-github.bat https://github.com/yourusername/irma-marketplace.git
    echo.
    pause
    exit /b 1
)

set REPO_URL=%1
echo Repository URL: %REPO_URL%
echo.

echo Step 1: Adding GitHub remote...
& "C:\Program Files\Git\bin\git.exe" remote add origin %REPO_URL%
if %ERRORLEVEL% neq 0 (
    echo.
    echo Note: Remote 'origin' might already exist. Updating...
    & "C:\Program Files\Git\bin\git.exe" remote set-url origin %REPO_URL%
)

echo.
echo Step 2: Setting main branch...
& "C:\Program Files\Git\bin\git.exe" branch -M main

echo.
echo Step 3: Pushing to GitHub (PRIVATE repository)...
& "C:\Program Files\Git\bin\git.exe" push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================
    echo ✅ SUCCESS! Code pushed to GitHub
    echo ========================================
    echo.
    echo Your PRIVATE repository is ready at:
    echo %REPO_URL%
    echo.
    echo Next steps:
    echo 1. Go to https://vercel.com
    echo 2. Sign up/Sign in
    echo 3. Import your GitHub repository
    echo 4. Deploy automatically!
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ ERROR: Failed to push to GitHub
    echo ========================================
    echo.
    echo Possible issues:
    echo 1. Check your GitHub repository URL
    echo 2. Make sure you have access to the repository
    echo 3. You might need to authenticate with GitHub
    echo.
    echo Try running: git push -u origin main
    echo.
)

pause