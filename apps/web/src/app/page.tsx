import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Factory, Search, ShieldCheck, Clock, TrendingUp, Users } from 'lucide-react'
import { 
  generateOrganizationSchema, 
  generateWebsiteSchema, 
  generateMarketplaceSchema,
  generateFAQSchema,
  JsonLd,
  generateMetaTags
} from '@irma/lib/seo'
import { Metadata } from 'next'

// Generate metadata for the homepage
export async function generateMetadata(): Promise<Metadata> {
  const metaTags = generateMetaTags({
    title: 'Industrial Robotics Marketplace - Connect with Verified Suppliers',
    description: 'India\'s leading B2B marketplace for industrial automation and robotics solutions. Find 6-axis robots, SCARA, AMR, AGV, conveyors from verified suppliers. Get quotes, compare options, and buy with confidence.',
    keywords: [
      'industrial robotics marketplace',
      'automation solutions India',
      'B2B robotics platform',
      '6-axis robots',
      'SCARA robots',
      'AMR AGV solutions',
      'conveyor systems',
      'vision systems',
      'verified suppliers',
      'industrial automation'
    ],
    canonical: process.env.NEXT_PUBLIC_APP_URL
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
        alt: 'IRMA - Industrial Robotics Marketplace'
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

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Generate structured data for SEO
  const organizationSchema = generateOrganizationSchema()
  const websiteSchema = generateWebsiteSchema()
  const marketplaceSchema = generateMarketplaceSchema()
  const faqSchema = generateFAQSchema()

  return (
    <>
      {/* Structured Data for SEO */}
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={marketplaceSchema} />
      <JsonLd data={faqSchema} />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Factory className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">IRMA</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/suppliers" className="text-gray-600 hover:text-gray-900">Suppliers</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              {user ? (
                <Link href="/account">
                  <Button variant="outline">Account</Button>
                </Link>
              ) : (
                <Link href="/auth/signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              India's Premier{' '}
              <span className="text-blue-600">Industrial Robotics</span>{' '}
              Marketplace
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Connect with verified suppliers for industrial automation and robotics solutions. 
              Get matched with the perfect equipment for your manufacturing needs.
            </p>
            
            {/* Dual CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/buy">
                <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
                  <Search className="mr-2 h-5 w-5" />
                  Get Matched
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/supplier/onboarding">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Factory className="mr-2 h-5 w-5" />
                  List Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                KYC Verified Suppliers
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                Fast 48hr Matching
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
                ₹10Cr+ Transactions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How IRMA Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Simple, transparent, and efficient industrial equipment procurement
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Buyers */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Search className="h-6 w-6 mr-2 text-blue-600" />
                  For Buyers
                </CardTitle>
                <CardDescription>
                  Find the perfect automation solution for your manufacturing needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</div>
                    <div>
                      <h4 className="font-medium">Submit Requirements</h4>
                      <p className="text-sm text-gray-600">Tell us about your payload, throughput, integration needs, and timeline</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</div>
                    <div>
                      <h4 className="font-medium">Get Matched</h4>
                      <p className="text-sm text-gray-600">Our AI engine finds the top 3 options with detailed fit scores</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</div>
                    <div>
                      <h4 className="font-medium">Compare & Choose</h4>
                      <p className="text-sm text-gray-600">Purchase, lease, or pilot with transparent pricing and SLAs</p>
                    </div>
                  </div>
                </div>
                <Link href="/buy">
                  <Button className="w-full mt-4">
                    Start Matching
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* For Suppliers */}
            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Factory className="h-6 w-6 mr-2 text-green-600" />
                  For Suppliers
                </CardTitle>
                <CardDescription>
                  Reach qualified buyers and grow your automation business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</div>
                    <div>
                      <h4 className="font-medium">Complete KYC</h4>
                      <p className="text-sm text-gray-600">Verify your business credentials and technical capabilities</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</div>
                    <div>
                      <h4 className="font-medium">Upload Catalog</h4>
                      <p className="text-sm text-gray-600">Add your products via CSV with detailed specifications</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</div>
                    <div>
                      <h4 className="font-medium">Receive Orders</h4>
                      <p className="text-sm text-gray-600">Get matched with qualified buyers and receive split payouts</p>
                    </div>
                  </div>
                </div>
                <Link href="/supplier/onboarding">
                  <Button className="w-full mt-4" variant="outline">
                    Join as Supplier
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">100+</div>
              <div className="text-gray-600">Verified Suppliers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-gray-600">Products Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">₹10Cr+</div>
              <div className="text-gray-600">Transaction Volume</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <Factory className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold">IRMA</span>
              </div>
              <p className="mt-4 text-gray-300 max-w-md">
                India's premier B2B marketplace for industrial robotics and automation solutions. 
                Connecting manufacturers with verified suppliers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/buy" className="hover:text-white">Find Equipment</Link></li>
                <li><Link href="/supplier/onboarding" className="hover:text-white">Become Supplier</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 IRMA Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}