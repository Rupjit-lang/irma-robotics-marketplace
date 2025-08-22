import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://irma.co.in'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/buy',
          '/supplier/onboarding',
          '/quote/*',
          '/products/*',
          '/about',
          '/contact',
          '/privacy',
          '/terms'
        ],
        disallow: [
          '/account/*',
          '/supplier/catalog/*',
          '/supplier/payouts/*',
          '/buy/payment/*',
          '/buy/order/*',
          '/api/*',
          '/auth/*',
          '/_next/*',
          '/admin/*'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/buy',
          '/supplier/onboarding', 
          '/quote/*',
          '/products/*',
          '/about',
          '/contact',
          '/privacy',
          '/terms'
        ],
        disallow: [
          '/account/*',
          '/supplier/catalog/*',
          '/supplier/payouts/*',
          '/buy/payment/*',
          '/buy/order/*',
          '/api/*',
          '/auth/*'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}