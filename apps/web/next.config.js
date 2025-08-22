/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 14+
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Static export for Cloudflare Pages compatibility
  output: process.env.CLOUDFLARE_PAGES ? 'export' : undefined,
  trailingSlash: process.env.CLOUDFLARE_PAGES ? true : false,
  
  // Image optimization
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
    ],
    formats: ['image/webp', 'image/avif'],
    // Disable image optimization for static export
    unoptimized: process.env.CLOUDFLARE_PAGES ? true : false,
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Security headers
  async headers() {
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
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig