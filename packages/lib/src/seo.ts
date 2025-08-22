import { Product, Org } from '@prisma/client'

interface SEOConfig {
  siteName: string
  siteUrl: string
  description: string
  keywords: string[]
  twitterHandle: string
  locale: string
}

export const seoConfig: SEOConfig = {
  siteName: 'IRMA - Industrial Robotics Marketplace',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://irma.co.in',
  description: 'India\'s leading B2B marketplace for industrial automation and robotics solutions. Connect with verified suppliers for 6-axis robots, SCARA, AMR, AGV, conveyors, and more.',
  keywords: [
    'industrial robotics',
    'automation marketplace',
    'manufacturing solutions',
    'B2B marketplace',
    'India robotics',
    '6-axis robots',
    'SCARA robots',
    'AMR',
    'AGV',
    'conveyor systems',
    'ASRS',
    'vision systems',
    'industrial automation'
  ],
  twitterHandle: '@IRMAIndia',
  locale: 'en_IN'
}

/**
 * Generate Organization JSON-LD structured data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/logo.png`,
    description: seoConfig.description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressLocality: 'Bangalore',
      addressRegion: 'Karnataka',
      streetAddress: 'Electronic City, Phase 1'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-1800-123-4567',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi']
    },
    sameAs: [
      'https://linkedin.com/company/irma-marketplace',
      'https://twitter.com/IRMAIndia'
    ],
    foundingDate: '2024',
    industry: 'Industrial Automation and Robotics',
    numberOfEmployees: '50-100'
  }
}

/**
 * Generate Website JSON-LD structured data
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.description,
    inLanguage: seoConfig.locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${seoConfig.siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: seoConfig.siteName,
      url: seoConfig.siteUrl
    }
  }
}

/**
 * Generate Product JSON-LD structured data
 */
export function generateProductSchema(
  product: Product & { org: Org },
  category: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: `${product.title} - ${category} industrial automation solution`,
    sku: product.sku,
    category: category,
    brand: {
      '@type': 'Brand',
      name: product.org.name
    },
    manufacturer: {
      '@type': 'Organization',
      name: product.org.name
    },
    offers: {
      '@type': 'Offer',
      price: product.priceMinINR,
      priceCurrency: 'INR',
      availability: product.status === 'LIVE' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.org.name
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    },
    additionalProperty: [
      ...(product.payloadKg ? [{
        '@type': 'PropertyValue',
        name: 'Payload Capacity',
        value: `${product.payloadKg} kg`
      }] : []),
      ...(product.reachMm ? [{
        '@type': 'PropertyValue',
        name: 'Reach',
        value: `${product.reachMm} mm`
      }] : []),
      ...(product.repeatabilityMm ? [{
        '@type': 'PropertyValue',
        name: 'Repeatability',
        value: `${product.repeatabilityMm} mm`
      }] : []),
      {
        '@type': 'PropertyValue',
        name: 'Lead Time',
        value: `${product.leadTimeWeeks} weeks`
      },
      {
        '@type': 'PropertyValue',
        name: 'IP Rating',
        value: product.ipRating || 'Not specified'
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '10',
      bestRating: '5',
      worstRating: '1'
    }
  }
}

/**
 * Generate Marketplace JSON-LD structured data
 */
export function generateMarketplaceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.description,
    image: `${seoConfig.siteUrl}/og-image.jpg`,
    telePhone: '+91-1800-123-4567',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressLocality: 'Bangalore',
      addressRegion: 'Karnataka'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '12.9716',
      longitude: '77.5946'
    },
    openingHours: 'Mo-Fr 09:00-18:00',
    acceptedPaymentMethod: [
      'https://schema.org/CreditCard',
      'https://schema.org/DebitCard',
      'https://schema.org/BankTransferInAdvance'
    ],
    priceRange: '₹50,000 - ₹50,00,000',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Industrial Robotics Catalog',
      itemListElement: [
        {
          '@type': 'Offer',
          category: '6-Axis Industrial Robots'
        },
        {
          '@type': 'Offer',
          category: 'SCARA Robots'
        },
        {
          '@type': 'Offer',
          category: 'Autonomous Mobile Robots (AMR)'
        },
        {
          '@type': 'Offer',
          category: 'Automated Guided Vehicles (AGV)'
        },
        {
          '@type': 'Offer',
          category: 'Conveyor Systems'
        },
        {
          '@type': 'Offer',
          category: 'Vision Systems'
        }
      ]
    }
  }
}

/**
 * Generate FAQ JSON-LD structured data
 */
export function generateFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What types of industrial robots are available on IRMA?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'IRMA offers a comprehensive range of industrial automation solutions including 6-axis industrial robots, SCARA robots, Autonomous Mobile Robots (AMR), Automated Guided Vehicles (AGV), conveyor systems, ASRS, and vision systems from verified suppliers across India.'
        }
      },
      {
        '@type': 'Question',
        name: 'How does IRMA ensure supplier quality?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All suppliers on IRMA undergo a comprehensive KYC verification process including business validation, technical capability assessment, and reference checks. Only verified suppliers can list products and receive payments.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the typical delivery time for industrial robots?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Delivery times vary by product type and customization requirements. Standard industrial robots typically have lead times of 6-12 weeks, while customized solutions may take 12-20 weeks. Exact timelines are provided in each product listing.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does IRMA provide installation and training services?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, most suppliers on IRMA provide installation, commissioning, and training services as part of their offering. This includes on-site setup, operator training, and ongoing technical support.'
        }
      },
      {
        '@type': 'Question',
        name: 'What payment methods are accepted?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'IRMA accepts payments via credit cards, debit cards, net banking, UPI, and digital wallets through our secure payment gateway. All transactions are processed securely with automatic supplier payouts.'
        }
      }
    ]
  }
}

/**
 * Generate Breadcrumb JSON-LD structured data
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  }
}

/**
 * Generate Review JSON-LD structured data
 */
export function generateReviewSchema(
  productName: string,
  supplierName: string,
  rating: number,
  reviewText: string,
  reviewerName: string,
  reviewDate: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: productName,
      brand: {
        '@type': 'Brand',
        name: supplierName
      }
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rating,
      bestRating: 5,
      worstRating: 1
    },
    author: {
      '@type': 'Person',
      name: reviewerName
    },
    reviewBody: reviewText,
    datePublished: reviewDate
  }
}

/**
 * Generate SEO meta tags
 */
export function generateMetaTags({
  title,
  description,
  canonical,
  ogImage,
  keywords,
  noIndex = false
}: {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  keywords?: string[]
  noIndex?: boolean
}) {
  const metaTags = {
    title: `${title} | ${seoConfig.siteName}`,
    description,
    keywords: keywords ? keywords.join(', ') : seoConfig.keywords.join(', '),
    canonical: canonical || seoConfig.siteUrl,
    'og:title': title,
    'og:description': description,
    'og:url': canonical || seoConfig.siteUrl,
    'og:site_name': seoConfig.siteName,
    'og:type': 'website',
    'og:locale': seoConfig.locale,
    'og:image': ogImage || `${seoConfig.siteUrl}/og-image.jpg`,
    'twitter:card': 'summary_large_image',
    'twitter:site': seoConfig.twitterHandle,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': ogImage || `${seoConfig.siteUrl}/og-image.jpg`,
    ...(noIndex && { robots: 'noindex, nofollow' })
  }

  return metaTags
}

/**
 * Utility to generate JSON-LD script content
 */
export function generateJsonLdScript(data: any): string {
  return JSON.stringify(data, null, 2)
}