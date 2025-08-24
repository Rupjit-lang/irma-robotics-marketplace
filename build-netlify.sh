#!/bin/bash

# Netlify build script for IRMA marketplace
echo "🚀 Starting IRMA Marketplace build for Netlify..."

# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@8
fi

# Install workspace dependencies from root
echo "📚 Installing workspace dependencies..."
pnpm install --no-frozen-lockfile

# Navigate to the web app directory first to generate Prisma client
cd apps/web

# Generate Prisma client first
echo "🗄️ Generating Prisma client..."
pnpm exec prisma generate

# Go back to root
cd ../..

# Build lib package after Prisma client is generated
echo "🔧 Building lib package..."
cd packages/lib
pnpm build
cd ../..

# Navigate back to the web app directory
cd apps/web

# Set environment for static export
export NETLIFY=true

# Build the application
echo "🏗️ Building Next.js application..."
pnpm build

echo "✅ Build completed successfully!"