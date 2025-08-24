import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Star, 
  Package, 
  ShoppingCart, 
  Eye,
  ArrowRight,
  Filter,
  BarChart3,
  Users,
  MapPin,
  Building2,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, getProductCategoryName } from '@irma/lib'
import { RecommendationsSection } from '@/components/RecommendationsSection'
import { RecentActivitySection } from '@/components/RecentActivitySection'

interface DashboardPageProps {
  searchParams: {
    tab?: string
  }
}

export default async function BuyerDashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get user's buyer organization
  const userRecord = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      memberships: {
        include: {
          org: true
        }
      }
    }
  })

  if (!userRecord) {
    redirect('/auth/signin')
  }

  const buyerMembership = userRecord.memberships.find(m => m.org.type === 'BUYER')

  if (!buyerMembership) {
    redirect('/buy')
  }

  // Get dashboard data
  const [
    recentIntakes,
    recentPayments,
    organizationStats
  ] = await Promise.all([
    // Recent intakes/quotes
    prisma.intake.findMany({
      where: {
        buyerOrgId: buyerMembership.orgId
      },
      include: {
        matches: {
          include: {
            product: {
              include: {
                org: true
              }
            }
          },
          orderBy: { score: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),

    // Recent orders/payments
    prisma.payment.findMany({
      where: {
        buyerOrgId: buyerMembership.orgId
      },
      include: {
        product: {
          include: {
            org: true
          }
        },
        supplierOrg: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),

    // Organization statistics
    getOrganizationStats(buyerMembership.orgId)
  ])

  const activeTab = searchParams.tab || 'overview'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {userRecord.name || 'there'}!
                </h1>
                <p className="text-gray-600">
                  {buyerMembership.org.name} • Industrial Equipment Dashboard
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/buy">
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Find Equipment
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Quotes</p>
                      <p className="text-2xl font-bold text-gray-900">{organizationStats.activeQuotes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <ShoppingCart className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{organizationStats.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Products Viewed</p>
                      <p className="text-2xl font-bold text-gray-900">{organizationStats.productsViewed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(organizationStats.totalSpent)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-8\">
          {/* Left Column - Main Content */}
          <div className=\"lg:col-span-2 space-y-8\">
            {/* Recommended for You Section */}
            <Suspense fallback={<RecommendationsLoadingSkeleton />}>
              <RecommendationsSection
                userId={userRecord.id}
                orgId={buyerMembership.orgId}
                userName={userRecord.name || ''}
              />
            </Suspense>

            {/* Recent Quotes */}
            <Card>
              <CardHeader>
                <div className=\"flex items-center justify-between\">
                  <div>
                    <CardTitle className=\"flex items-center\">
                      <BarChart3 className=\"h-5 w-5 mr-2\" />
                      Recent Quotes
                    </CardTitle>
                    <CardDescription>Your latest equipment inquiries and matches</CardDescription>
                  </div>
                  <Link href=\"/buy/quotes\">
                    <Button variant=\"outline\" size=\"sm\">
                      View All
                      <ArrowRight className=\"h-4 w-4 ml-2\" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentIntakes.length === 0 ? (
                  <div className=\"text-center py-8\">
                    <Package className=\"h-12 w-12 text-gray-400 mx-auto mb-4\" />
                    <h3 className=\"text-lg font-medium text-gray-900 mb-2\">No quotes yet</h3>
                    <p className=\"text-gray-600 mb-4\">
                      Start by submitting your equipment requirements
                    </p>
                    <Link href=\"/buy\">
                      <Button>
                        <Search className=\"h-4 w-4 mr-2\" />
                        Find Equipment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className=\"space-y-4\">
                    {recentIntakes.map((intake) => (
                      <div 
                        key={intake.id} 
                        className=\"border rounded-lg p-4 hover:bg-gray-50 transition-colors\"
                      >
                        <div className=\"flex items-center justify-between mb-2\">
                          <div className=\"flex items-center space-x-2\">
                            <Badge variant={intake.status === 'MATCHED' ? 'default' : 'secondary'}>
                              {intake.status === 'MATCHED' ? `${intake.matches.length} Matches` : intake.status}
                            </Badge>
                            <span className=\"text-sm text-gray-500\">
                              {intake.createdAt.toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          {intake.status === 'MATCHED' && (
                            <Link href={`/quote/${intake.id}`}>
                              <Button size=\"sm\">
                                View Matches
                              </Button>
                            </Link>
                          )}
                        </div>
                        <h4 className=\"font-medium text-gray-900 mb-1\">
                          {(intake.data as any)?.use_case || 'Equipment Requirement'}
                        </h4>
                        {intake.matches.length > 0 && (
                          <div className=\"flex items-center space-x-4 text-sm text-gray-600\">
                            <span>Best Match: {intake.matches[0].product.title}</span>
                            <span>•</span>
                            <span>{Math.round(intake.matches[0].score * 100)}% compatibility</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <div className=\"flex items-center justify-between\">
                  <div>
                    <CardTitle className=\"flex items-center\">
                      <ShoppingCart className=\"h-5 w-5 mr-2\" />
                      Recent Orders
                    </CardTitle>
                    <CardDescription>Your purchase history and order status</CardDescription>
                  </div>
                  <Link href=\"/buy/orders\">
                    <Button variant=\"outline\" size=\"sm\">
                      View All
                      <ArrowRight className=\"h-4 w-4 ml-2\" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentPayments.length === 0 ? (
                  <div className=\"text-center py-8\">
                    <ShoppingCart className=\"h-12 w-12 text-gray-400 mx-auto mb-4\" />
                    <h3 className=\"text-lg font-medium text-gray-900 mb-2\">No orders yet</h3>
                    <p className=\"text-gray-600\">
                      Your completed purchases will appear here
                    </p>
                  </div>
                ) : (
                  <div className=\"space-y-4\">
                    {recentPayments.map((payment) => (
                      <div 
                        key={payment.id} 
                        className=\"border rounded-lg p-4 hover:bg-gray-50 transition-colors\"
                      >
                        <div className=\"flex items-center justify-between mb-2\">
                          <div className=\"flex items-center space-x-2\">
                            <Badge 
                              variant={
                                payment.transferStatus === 'PROCESSED' ? 'default' :
                                payment.status === 'CAPTURED' ? 'secondary' : 'destructive'
                              }
                            >
                              {payment.transferStatus === 'PROCESSED' ? 'Confirmed' :
                               payment.status === 'CAPTURED' ? 'Processing' : payment.status}
                            </Badge>
                            <span className=\"text-sm text-gray-500\">
                              {payment.createdAt.toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          <Link href={`/buy/order/${payment.id}`}>
                            <Button size=\"sm\" variant=\"outline\">
                              View Order
                            </Button>
                          </Link>
                        </div>
                        <div className=\"flex items-center justify-between\">
                          <div>
                            <h4 className=\"font-medium text-gray-900\">{payment.product.title}</h4>
                            <p className=\"text-sm text-gray-600\">
                              from {payment.supplierOrg.name}
                            </p>
                          </div>
                          <div className=\"text-right\">
                            <p className=\"font-semibold text-gray-900\">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className=\"space-y-6\">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className=\"space-y-3\">
                <Link href=\"/buy\" className=\"block\">
                  <Button className=\"w-full justify-start\">
                    <Search className=\"h-4 w-4 mr-2\" />
                    Find New Equipment
                  </Button>
                </Link>
                <Link href=\"/products/AMR\" className=\"block\">
                  <Button variant=\"outline\" className=\"w-full justify-start\">
                    <Users className=\"h-4 w-4 mr-2\" />
                    Browse AMR Solutions
                  </Button>
                </Link>
                <Link href=\"/products/SixAxis\" className=\"block\">
                  <Button variant=\"outline\" className=\"w-full justify-start\">
                    <Zap className=\"h-4 w-4 mr-2\" />
                    6-Axis Robot Arms
                  </Button>
                </Link>
                <Link href=\"/account\" className=\"block\">
                  <Button variant=\"outline\" className=\"w-full justify-start\">
                    <Building2 className=\"h-4 w-4 mr-2\" />
                    Account Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Trending Categories */}
            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center\">
                  <TrendingUp className=\"h-5 w-5 mr-2\" />
                  Trending This Week
                </CardTitle>
                <CardDescription>Popular equipment categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-3\">
                  <div className=\"flex items-center justify-between\">
                    <span className=\"text-sm font-medium\">6-Axis Robot Arms</span>
                    <Badge variant=\"secondary\">+24%</Badge>
                  </div>
                  <div className=\"flex items-center justify-between\">
                    <span className=\"text-sm font-medium\">AMR Solutions</span>
                    <Badge variant=\"secondary\">+18%</Badge>
                  </div>
                  <div className=\"flex items-center justify-between\">
                    <span className=\"text-sm font-medium\">Vision Systems</span>
                    <Badge variant=\"secondary\">+12%</Badge>
                  </div>
                  <div className=\"flex items-center justify-between\">
                    <span className=\"text-sm font-medium\">Conveyor Systems</span>
                    <Badge variant=\"secondary\">+8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Suspense fallback={<ActivityLoadingSkeleton />}>
              <RecentActivitySection
                userId={userRecord.id}
                orgId={buyerMembership.orgId}
              />
            </Suspense>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className=\"space-y-3\">
                <div className=\"text-sm\">
                  <h4 className=\"font-medium text-gray-900 mb-1\">Contact Support</h4>
                  <p className=\"text-gray-600\">Get help with orders and technical questions</p>
                </div>
                <div className=\"text-sm\">
                  <h4 className=\"font-medium text-gray-900 mb-1\">Equipment Guide</h4>
                  <p className=\"text-gray-600\">Learn about automation solutions</p>
                </div>
                <Button variant=\"outline\" size=\"sm\" className=\"w-full\">
                  Get Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

async function getOrganizationStats(orgId: string) {
  const [
    activeQuotesCount,
    totalOrdersCount,
    productsViewedCount,
    totalSpentSum
  ] = await Promise.all([
    prisma.intake.count({
      where: {
        buyerOrgId: orgId,
        status: 'MATCHED'
      }
    }),
    prisma.payment.count({
      where: {
        buyerOrgId: orgId,
        status: { in: ['CAPTURED', 'COMPLETED'] }
      }
    }),
    prisma.productView.count({
      where: {
        orgId,
        viewedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    prisma.payment.aggregate({
      where: {
        buyerOrgId: orgId,
        status: { in: ['CAPTURED', 'COMPLETED'] }
      },
      _sum: {
        amount: true
      }
    })
  ])

  return {
    activeQuotes: activeQuotesCount,
    totalOrders: totalOrdersCount,
    productsViewed: productsViewedCount,
    totalSpent: totalSpentSum._sum.amount || 0
  }
}

function RecommendationsLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
      </CardHeader>
      <CardContent>
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className=\"animate-pulse\">
              <div className=\"bg-gray-200 h-32 rounded-lg mb-3\"></div>
              <div className=\"bg-gray-200 h-4 rounded mb-2\"></div>
              <div className=\"bg-gray-200 h-3 rounded w-3/4\"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className=\"space-y-3\">
          {[1, 2, 3].map((i) => (
            <div key={i} className=\"animate-pulse flex items-center space-x-3\">
              <div className=\"bg-gray-200 h-8 w-8 rounded-full\"></div>
              <div className=\"flex-1\">
                <div className=\"bg-gray-200 h-3 rounded mb-1\"></div>
                <div className=\"bg-gray-200 h-2 rounded w-1/2\"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}