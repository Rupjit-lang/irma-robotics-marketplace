import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://irma.co.in'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/buy`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/supplier/onboarding`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    }
  ]

  try {
    // Get public product categories for category pages
    const categories = [
      'SixAxis',
      'SCARA', 
      'AMR',
      'AGV',
      'Conveyor',
      'ASRS',
      'Vision',
      'Other'
    ]

    const categoryPages = categories.map(category => ({
      url: `${baseUrl}/products/${category.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Get recent public quotes (for SEO, limit to recent ones)
    const recentQuotes = await prisma.intake.findMany({
      where: {
        status: 'MATCHED',
        matches: {
          some: {}
        }
      },
      select: {
        id: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 100 // Limit to recent 100 quotes
    })

    const quotePages = recentQuotes.map(quote => ({
      url: `${baseUrl}/quote/${quote.id}`,
      lastModified: quote.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))

    return [
      ...staticPages,
      ...categoryPages,
      ...quotePages
    ]

  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages if database query fails
    return staticPages
  }
}