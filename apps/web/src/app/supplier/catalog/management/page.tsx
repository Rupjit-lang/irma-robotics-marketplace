import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Play, Pause } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, getProductCategoryName } from '@irma/lib'

const prisma = new PrismaClient()

interface SearchParams {
  uploaded?: string
  status?: string
  category?: string
  search?: string
}

interface CatalogPageProps {
  searchParams: SearchParams
}

export default async function SupplierCatalogPage({ searchParams }: CatalogPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get user's supplier organization
  const userRecord = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      memberships: {
        include: {
          org: {
            include: {
              kyc: true
            }
          }
        }
      }
    }
  })

  if (!userRecord) {
    redirect('/supplier/onboarding')
  }

  const supplierMembership = userRecord.memberships.find(m => m.org.type === 'SUPPLIER')

  if (!supplierMembership) {
    redirect('/supplier/onboarding')
  }

  const supplierOrg = supplierMembership.org

  // Build where clause for filtering
  const whereClause: any = {
    orgId: supplierOrg.id,
    deletedAt: null
  }

  if (searchParams.status) {
    whereClause.status = searchParams.status.toUpperCase()
  }

  if (searchParams.category) {
    whereClause.category = searchParams.category
  }

  if (searchParams.search) {
    whereClause.OR = [
      { title: { contains: searchParams.search, mode: 'insensitive' } },
      { sku: { contains: searchParams.search, mode: 'insensitive' } }
    ]
  }

  // Get products with pagination
  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { updatedAt: 'desc' },
    take: 50 // Limit to 50 products per page
  })

  // Get statistics
  const stats = await prisma.product.groupBy({
    by: ['status'],
    where: {
      orgId: supplierOrg.id,
      deletedAt: null
    },
    _count: true
  })

  const productStats = {
    draft: 0,
    live: 0,
    disabled: 0,
    total: 0
  }

  stats.forEach(stat => {
    const status = stat.status.toLowerCase() as keyof typeof productStats
    if (status !== 'total') {
      productStats[status] = stat._count
      productStats.total += stat._count
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return <Badge className="bg-green-100 text-green-800">Live</Badge>
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>
      case 'DISABLED':
        return <Badge variant="destructive">Disabled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
              <p className="text-gray-600 mt-2">
                Manage your product listings and inventory
              </p>
              {searchParams.uploaded && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800">
                    ✅ Successfully uploaded {searchParams.uploaded} products!
                  </p>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <Link href="/supplier/catalog/upload">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
              </Link>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        {/* KYC Status Alert */}
        {supplierOrg.kyc?.status !== 'VERIFIED' && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-medium text-yellow-900">KYC Verification Required</h3>
                  <p className="text-sm text-yellow-800">
                    Your products will remain in DRAFT status until KYC verification is complete.
                    Status: <strong>{supplierOrg.kyc?.status || 'PENDING'}</strong>
                  </p>
                </div>
                <Link href="/supplier/onboarding">
                  <Button size="sm" variant="outline">
                    Complete KYC
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{productStats.total}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{productStats.live}</div>
                <div className="text-sm text-gray-600">Live Products</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{productStats.draft}</div>
                <div className="text-sm text-gray-600">Draft Products</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{productStats.disabled}</div>
                <div className="text-sm text-gray-600">Disabled Products</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={searchParams.search || ''}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={searchParams.status || ''}
                >
                  <option value="">All Status</option>
                  <option value="live">Live</option>
                  <option value="draft">Draft</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={searchParams.category || ''}
                >
                  <option value="">All Categories</option>
                  <option value="AMR">AMR</option>
                  <option value="AGV">AGV</option>
                  <option value="SixAxis">6-Axis Robot</option>
                  <option value="SCARA">SCARA</option>
                  <option value="Conveyor">Conveyor</option>
                  <option value="ASRS">ASRS</option>
                  <option value="Vision">Vision</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button className="w-full">Apply Filters</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({products.length})</CardTitle>
            <CardDescription>
              Manage your product catalog and control visibility to buyers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Get started by uploading your product catalog or adding products manually.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/supplier/catalog/upload">
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSV
                    </Button>
                  </Link>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lead Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku}
                            </div>
                            {product.payloadKg && (
                              <div className="text-xs text-gray-400">
                                Payload: {product.payloadKg}kg
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">
                            {getProductCategoryName(product.category)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(product.priceMinINR)} - {formatCurrency(product.priceMaxINR)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.leadTimeWeeks} weeks
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(product.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {product.status === 'DRAFT' && supplierOrg.kyc?.status === 'VERIFIED' && (
                              <Button size="sm" variant="ghost" className="text-green-600">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {product.status === 'LIVE' && (
                              <Button size="sm" variant="ghost" className="text-yellow-600">
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {products.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Bulk Actions</CardTitle>
              <CardDescription>
                Perform actions on multiple products at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                {supplierOrg.kyc?.status === 'VERIFIED' && (
                  <Button variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Publish Selected
                  </Button>
                )}
                <Button variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Disable Selected
                </Button>
                <Button variant="outline" className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">CSV Upload Guide</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Learn how to format your CSV file for bulk product upload.
                </p>
                <Link href="/docs/CSV_FORMAT.md">
                  <Button size="sm" variant="outline">View Guide</Button>
                </Link>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Product Optimization</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Tips to improve your product visibility and match rates.
                </p>
                <Button size="sm" variant="outline">Learn More</Button>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Support</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Contact our team for assistance with catalog management.
                </p>
                <Button size="sm" variant="outline">Contact Support</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}