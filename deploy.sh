#!/bin/bash

# 🚀 IRMA Marketplace - Vercel Deployment Script
# Run this script to deploy IRMA to Vercel automatically

echo "🚀 IRMA Marketplace - Vercel Deployment"
echo "======================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial IRMA marketplace deployment"
else
    echo "✅ Git repository already initialized"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "🔧 Pre-deployment checklist:"
echo "1. ✅ Git repository initialized"
echo "2. ✅ Vercel CLI installed"
echo "3. ⚠️  Make sure you have:"
echo "   - Supabase project URL and keys"
echo "   - Razorpay API keys"
echo "   - GitHub repository (optional)"
echo ""

read -p "Do you want to continue with deployment? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Deploying to Vercel..."

# Deploy to Vercel
vercel --prod

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Next steps:"
echo "1. Visit your Vercel dashboard to configure environment variables"
echo "2. Add the environment variables from .env.vercel"
echo "3. Redeploy after adding environment variables"
echo "4. Run database migrations if needed"
echo ""
echo "🔗 Your IRMA marketplace should be live at the URL shown above!"
echo ""