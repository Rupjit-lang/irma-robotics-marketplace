import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getProductCategoryName } from '@irma/lib'
import { 
  generateProductSchema, 
  generateBreadcrumbSchema,
  JsonLd,
  generateMetaTags
} from '@irma/lib/seo'
import { Metadata } from 'next'
import { Search, ArrowRight, Building2, Clock, Star } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

interface CategoryPageProps {
  params: {
    category: string
  }
}

const categoryDescriptions = {
  sixaxis: {
    title: '6-Axis Industrial Robots',
    description: 'High-precision 6-axis industrial robots for complex manufacturing tasks including welding, painting, assembly, and material handling. Find articulated robots with advanced motion control.',
    keywords: ['6-axis robots', 'articulated robots', 'industrial robots', 'welding robots', 'painting robots', 'assembly robots']
  },
  scara: {
    title: 'SCARA Robots',
    description: 'Selective Compliance Assembly Robot Arm (SCARA) for high-speed pick-and-place, assembly, and packaging applications with excellent repeatability.',
    keywords: ['SCARA robots', 'pick and place robots', 'assembly robots', 'packaging automation', 'high-speed robots']
  },
  amr: {
    title: 'Autonomous Mobile Robots (AMR)',
    description: 'Intelligent autonomous mobile robots for material transport, inventory management, and flexible automation in warehouses and manufacturing facilities.',
    keywords: ['AMR', 'autonomous mobile robots', 'material handling', 'warehouse automation', 'inventory robots']
  },
  agv: {
    title: 'Automated Guided Vehicles (AGV)',
    description: 'Automated guided vehicles for reliable material transport following fixed paths using magnetic tape, laser, or wire guidance systems.',
    keywords: ['AGV', 'automated guided vehicles', 'material transport', 'guided vehicles', 'warehouse automation']
  },
  conveyor: {
    title: 'Conveyor Systems',
    description: 'Industrial conveyor systems including belt conveyors, roller conveyors, and chain conveyors for automated material handling and production lines.',
    keywords: ['conveyor systems', 'belt conveyors', 'roller conveyors', 'material handling', 'production lines']
  },
  asrs: {
    title: 'Automated Storage & Retrieval Systems (ASRS)',
    description: 'Automated storage and retrieval systems for high-density storage, inventory management, and efficient material handling in warehouses.',
    keywords: ['ASRS', 'automated storage', 'retrieval systems', 'warehouse automation', 'inventory management']
  },
  vision: {
    title: 'Vision Systems',
    description: 'Machine vision systems for quality inspection, barcode reading, object recognition, and automated guidance in manufacturing processes.',
    keywords: ['vision systems', 'machine vision', 'quality inspection', 'barcode reading', 'object recognition']
  },
  other: {
    title: 'Other Automation Solutions',
    description: 'Specialized automation equipment and custom solutions for unique manufacturing requirements and industrial applications.',
    keywords: ['automation equipment', 'custom automation', 'specialized machinery', 'industrial automation']
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = params.category.toLowerCase()
  const categoryInfo = categoryDescriptions[category as keyof typeof categoryDescriptions]
  
  if (!categoryInfo) {
    return { title: 'Category Not Found' }
  }

  const metaTags = generateMetaTags({
    title: `${categoryInfo.title} - Buy from Verified Suppliers`,
    description: categoryInfo.description,
    keywords: categoryInfo.keywords,
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products/${category}`
  })

  return {
    title: metaTags.title,
    description: metaTags.description,
    keywords: metaTags.keywords,
    openGraph: {
      title: metaTags['og:title'],
      description: metaTags['og:description'],
      url: metaTags['og:url'],
      siteName: metaTags['og:site_name'],
      type: 'website',
      locale: metaTags['og:locale'],
      images: [{
        url: metaTags['og:image'],
        width: 1200,
        height: 630,
        alt: categoryInfo.title
      }]
    },
    twitter: {
      card: 'summary_large_image',
      site: '@IRMAIndia',
      title: metaTags['twitter:title'],
      description: metaTags['twitter:description'],
      images: [metaTags['twitter:image']]
    },
    alternates: {
      canonical: metaTags.canonical
    }
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = params.category.toLowerCase()
  const categoryInfo = categoryDescriptions[category as keyof typeof categoryDescriptions]
  
  if (!categoryInfo) {
    notFound()
  }

  // Map URL category to database category
  const dbCategory = category === 'sixaxis' ? 'SixAxis' : 
                     category.charAt(0).toUpperCase() + category.slice(1)

  // Get products in this category
  const products = await prisma.product.findMany({
    where: {
      category: dbCategory,
      status: 'LIVE',
      deletedAt: null
    },
    include: {
      org: {
        include: {
          kyc: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 12 // Limit to 12 products for page load performance
  })

  // Generate breadcrumb structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: process.env.NEXT_PUBLIC_APP_URL || 'https://irma.co.in' },
    { name: 'Products', url: `${process.env.NEXT_PUBLIC_APP_URL}/products` },
    { name: categoryInfo.title, url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${category}` }
  ])

  // Generate product schemas for each product
  const productSchemas = products.map(product => 
    generateProductSchema(product, categoryInfo.title)
  )

  return (
    <>
      {/* Structured Data for SEO */}
      <JsonLd data={breadcrumbSchema} />
      {productSchemas.map((schema, index) => (
        <JsonLd key={index} data={schema} />
      ))}
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
              <li>/</li>
              <li><Link href="/products" className="hover:text-blue-600">Products</Link></li>
              <li>/</li>
              <li className="text-gray-900">{categoryInfo.title}</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {categoryInfo.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              {categoryInfo.description}
            </p>
            <div className="mt-6">
              <Link href="/buy">
                <Button size="lg">
                  <Search className="h-5 w-5 mr-2" />
                  Get Custom Recommendations
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Available Products ({products.length})
                </h2>
                <p className="text-gray-600">
                  Browse {categoryInfo.title.toLowerCase()} from verified suppliers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight">
                            {product.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {product.org.name}
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800 ml-2">
                          <Star className="h-3 w-3 mr-1" />
                          KYC
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price Range</span>
                          <span className="font-medium">
                            {formatCurrency(product.priceMinINR)} - {formatCurrency(product.priceMaxINR)}
                          </span>
                        </div>

                        {product.payloadKg && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Payload</span>
                            <span>{product.payloadKg} kg</span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Lead Time</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {product.leadTimeWeeks} weeks
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Supplier</span>
                          <span className="flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        </div>

                        <div className="pt-3 border-t">
                          <Link href="/buy" className="w-full">
                            <Button variant="outline" size="sm" className="w-full">
                              Get Matched
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Products Available
                </h3>
                <p className="text-gray-600 mb-6">
                  We're currently adding suppliers for {categoryInfo.title.toLowerCase()}. 
                  Submit your requirements to get notified when products are available.
                </p>
                <Link href="/buy">
                  <Button>Submit Requirements</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* CTA Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Need a Custom Solution?
              </h3>
              <p className="text-gray-600 mb-6">
                Get personalized recommendations based on your specific requirements
              </p>
              <Link href="/buy">
                <Button size="lg">
                  <Search className="h-5 w-5 mr-2" />
                  Get Custom Quote
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

// Generate static params for all category pages
export async function generateStaticParams() {
  return Object.keys(categoryDescriptions).map((category) => ({
    category: category,
  }))
}