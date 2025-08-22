import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@irma/lib'
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Eye,
  Calendar,
  Building2
} from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function SupplierPayoutsPage() {
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

  // Check KYC status
  const isKycVerified = supplierOrg.kyc?.status === 'VERIFIED'

  // Get payment statistics (only if KYC verified)
  let paymentStats = {
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    totalTransactions: 0
  }

  let recentPayments: any[] = []

  if (isKycVerified) {
    // Get payments for this supplier
    const payments = await prisma.payment.findMany({
      where: {
        supplierOrgId: supplierOrg.id,
        status: {
          in: ['CAPTURED', 'COMPLETED']
        }
      },
      include: {
        product: true,
        buyerOrg: true,
        intake: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Calculate statistics
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    paymentStats = {
      totalEarnings: payments.reduce((sum, p) => sum + p.supplierAmount, 0),
      thisMonthEarnings: payments
        .filter(p => p.createdAt >= thisMonthStart)
        .reduce((sum, p) => sum + p.supplierAmount, 0),
      pendingPayouts: payments.filter(p => p.transferStatus !== 'PROCESSED').length,
      completedPayouts: payments.filter(p => p.transferStatus === 'PROCESSED').length,
      totalTransactions: payments.length
    }

    recentPayments = payments
  }

  const getStatusBadge = (status: string, transferStatus?: string | null) => {
    if (transferStatus === 'PROCESSED') {
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>
    }
    if (transferStatus === 'FAILED') {
      return <Badge variant="destructive">Failed</Badge>
    }
    if (status === 'CAPTURED') {
      return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
    }
    return <Badge variant="secondary">{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payouts & Earnings</h1>
              <p className="text-gray-600 mt-2">
                Track your payments and manage payout settings
              </p>
            </div>
            {isKycVerified && (
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Filter by Date
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* KYC Status Alert */}
        {!isKycVerified && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">KYC Verification Required</h3>
                  <p className="text-sm text-red-800">
                    Complete your KYC verification to receive payments and view payout details.
                    Current Status: <strong>{supplierOrg.kyc?.status || 'PENDING'}</strong>
                  </p>
                </div>
                <Link href="/supplier/onboarding">
                  <Button size="sm" variant="outline" className="border-red-300 text-red-700">
                    Complete KYC
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Razorpay Account Status */}
        {isKycVerified && !supplierOrg.razorpayAccountId && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-900">Payment Account Setup Required</h3>
                  <p className="text-sm text-yellow-800">
                    Link your bank account to receive automatic payments from buyers.
                  </p>
                </div>
                <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700">
                  Setup Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isKycVerified ? (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(paymentStats.totalEarnings)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(paymentStats.thisMonthEarnings)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {paymentStats.pendingPayouts}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {paymentStats.completedPayouts}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Building2 className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {paymentStats.totalTransactions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>
                  Track your payment history and payout status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                    <p className="text-gray-600 mb-6">
                      You'll see your payment history here once you start receiving orders.
                    </p>
                    <Link href="/supplier/catalog">
                      <Button>Manage Catalog</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Buyer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
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
                        {recentPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {payment.product.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Order #{payment.id.slice(-8)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {payment.buyerOrg.name}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {formatCurrency(payment.supplierAmount)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Total: {formatCurrency(payment.amount)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {payment.createdAt.toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(payment.status, payment.transferStatus)}
                            </td>
                            <td className="px-6 py-4">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payout Settings */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Payout Settings</CardTitle>
                <CardDescription>
                  Manage your payment preferences and bank account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Bank Account</h4>
                    {supplierOrg.razorpayAccountId ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-900">
                              Account Linked
                            </p>
                            <p className="text-sm text-green-700">
                              Automatic payouts enabled
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-900">
                              Bank Account Required
                            </p>
                            <p className="text-sm text-yellow-700">
                              Link your account to receive payments
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Setup
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Commission Rate</h4>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Platform Fee: 2.5%
                          </p>
                          <p className="text-sm text-blue-700">
                            Industry-leading low fees
                          </p>
                        </div>
                        <Button size="sm" variant="outline" disabled>
                          Fixed Rate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* KYC Required View */
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Complete KYC to Access Payouts
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                To ensure secure transactions and comply with regulations, 
                please complete your KYC verification to access payment features.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-semibold">1</span>
                    </div>
                    <p className="text-sm text-gray-600">Submit KYC Documents</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-semibold">2</span>
                    </div>
                    <p className="text-sm text-gray-600">Verification Review</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-semibold">3</span>
                    </div>
                    <p className="text-sm text-gray-600">Start Receiving Payments</p>
                  </div>
                </div>
                <Link href="/supplier/onboarding">
                  <Button size="lg">Complete KYC Verification</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}