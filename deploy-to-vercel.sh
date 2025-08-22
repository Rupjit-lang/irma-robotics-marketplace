#!/bin/bash

echo "========================================"
echo "🚀 IRMA Marketplace - Vercel Deployment"
echo "========================================"
echo ""

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed"
    echo "Please install Git from: https://git-scm.com/downloads"
    echo ""
    exit 1
fi

echo "✅ Git is available"

# Initialize git repository if not already done
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files to git
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "📦 Committing changes..."
git commit -m "🚀 Initial IRMA marketplace deployment - Full Next.js 14 B2B platform"

echo ""
echo "🎯 Next Steps:"
echo "1. Create GitHub repository at: https://github.com/new"
echo "   - Repository name: irma-marketplace"
echo "   - Make it public (required for free deployment)"
echo ""
echo "2. Connect to GitHub (replace 'yourusername' with your GitHub username):"
echo "   git remote add origin https://github.com/yourusername/irma-marketplace.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Vercel:"
echo "   - Go to vercel.com"
echo "   - Click \"New Project\""
echo "   - Import from GitHub"
echo "   - Select your irma-marketplace repository"
echo "   - Click Deploy"
echo ""
echo "4. Add environment variables in Vercel dashboard"
echo "   (see .env.vercel file for the complete list)"
echo ""
echo "🎉 Your IRMA marketplace will be live!"
echo ""