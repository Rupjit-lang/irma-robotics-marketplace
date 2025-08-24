/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 14+
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Static export for Netlify and Cloudflare Pages
  output: (process.env.NETLIFY || process.env.CLOUDFLARE_PAGES) ? 'export' : undefined,
  trailingSlash: (process.env.NETLIFY || process.env.CLOUDFLARE_PAGES) ? true : false,
  
  // Image optimization
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
    ],
    formats: ['image/webp', 'image/avif'],
    // Disable image optimization for static export
    unoptimized: (process.env.NETLIFY || process.env.CLOUDFLARE_PAGES) ? true : false,
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

// Only add headers and redirects for non-static builds
if (!process.env.NETLIFY && !process.env.CLOUDFLARE_PAGES) {
  // Security headers
  nextConfig.headers = async function() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  };
  
  // Redirects for SEO
  nextConfig.redirects = async function() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  };
}

module.exports = nextConfig