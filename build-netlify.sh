#!/bin/bash

# Netlify build script for IRMA marketplace
echo "🚀 Starting IRMA Marketplace build for Netlify..."

# Navigate to the web app directory
cd apps/web

# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@8
fi

# Install dependencies with pnpm
echo "📚 Installing dependencies..."
pnpm install --no-frozen-lockfile

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
pnpm exec prisma generate

# Set environment for static export
export NETLIFY=true

# Build the application
echo "🏗️ Building Next.js application..."
pnpm build

echo "✅ Build completed successfully!"