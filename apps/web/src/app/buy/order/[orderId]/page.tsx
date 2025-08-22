import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getProductCategoryName } from '@irma/lib'
import { 
  CheckCircle2, 
  Package,
  Truck,
  Calendar,
  Phone,
  Mail,
  Download,
  MessageSquare,
  Clock,
  DollarSign,
  Building2
} from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

interface OrderPageProps {
  params: {
    orderId: string
  }
  searchParams: {
    payment_id?: string
  }
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
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

  // Get the payment/order details
  const payment = await prisma.payment.findFirst({
    where: {
      id: params.orderId,
      buyerOrgId: buyerMembership.orgId
    },
    include: {
      product: {
        include: {
          org: true
        }
      },
      supplierOrg: true,
      intake: true
    }
  })

  if (!payment) {
    redirect('/buy')
  }

  const getStatusInfo = (status: string, transferStatus?: string | null) => {
    if (transferStatus === 'PROCESSED') {
      return {
        badge: <Badge className="bg-green-100 text-green-800">Order Confirmed</Badge>,
        title: "Payment Successful & Supplier Notified",
        description: "Your order has been confirmed and the supplier has been notified. They will contact you shortly.",
        icon: <CheckCircle2 className="h-8 w-8 text-green-600" />
      }
    }
    if (status === 'CAPTURED') {
      return {
        badge: <Badge className="bg-blue-100 text-blue-800">Processing Payment</Badge>,
        title: "Payment Processing",
        description: "Your payment is being processed. We'll notify you once it's complete.",
        icon: <Clock className="h-8 w-8 text-blue-600" />
      }
    }
    if (status === 'FAILED') {
      return {
        badge: <Badge variant="destructive">Payment Failed</Badge>,
        title: "Payment Failed",
        description: "There was an issue processing your payment. Please try again.",
        icon: <CheckCircle2 className="h-8 w-8 text-red-600" />
      }
    }
    return {
      badge: <Badge variant="secondary">{status}</Badge>,
      title: "Order Status Unknown",
      description: "We're checking the status of your order.",
      icon: <Clock className="h-8 w-8 text-gray-600" />
    }
  }

  const statusInfo = getStatusInfo(payment.status, payment.transferStatus)
  const isOrderConfirmed = payment.transferStatus === 'PROCESSED'

  // Calculate delivery estimate
  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (payment.product.leadTimeWeeks * 7))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          {statusInfo.icon}
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            {statusInfo.title}
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            {statusInfo.description}
          </p>
          <div className="mt-4">
            {statusInfo.badge}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  Order #{payment.id.slice(-8)} • Placed on {payment.createdAt.toLocaleDateString('en-IN')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{payment.product.title}</h3>
                    <p className="text-sm text-gray-600">SKU: {payment.product.sku}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline">
                        {getProductCategoryName(payment.product.category)}
                      </Badge>
                      {payment.product.payloadKg && (
                        <span className="text-sm text-gray-500">
                          Payload: {payment.product.payloadKg}kg
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-gray-600">Total Amount</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Supplier Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{payment.supplierOrg.name}</h3>
                    <p className="text-sm text-gray-600">GST: {payment.supplierOrg.gstin}</p>
                    <Badge className="bg-green-100 text-green-800 mt-2">KYC Verified</Badge>
                  </div>
                  
                  {isOrderConfirmed && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Contact details will be shared via email
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            You'll receive supplier contact details shortly
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Delivery & Installation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Estimated Delivery</p>
                      <p className="text-sm text-gray-600">
                        Based on {payment.product.leadTimeWeeks} weeks lead time
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {estimatedDelivery.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">Approximate</p>
                    </div>
                  </div>
                  
                  {isOrderConfirmed && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Supplier will contact you within 24 hours</li>
                        <li>• Site survey and technical discussion</li>
                        <li>• Delivery schedule confirmation</li>
                        <li>• Installation and commissioning</li>
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Amount</span>
                    <span>{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee (2.5%)</span>
                    <span>{formatCurrency(payment.commissionAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">To Supplier</span>
                    <span>{formatCurrency(payment.supplierAmount)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-medium">
                      <span>Total Paid</span>
                      <span>{formatCurrency(payment.amount)}</span>
                    </div>
                  </div>
                  {searchParams.payment_id && (
                    <div className="text-xs text-gray-500">
                      Payment ID: {searchParams.payment_id}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" disabled={!isOrderConfirmed}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Supplier
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Button>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h5 className="font-medium">Track Your Order</h5>
                      <p className="text-gray-600">
                        Get updates on delivery status
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium">Support</h5>
                      <p className="text-gray-600">
                        Contact our team for assistance
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Get Support
                  </Button>
                </div>

                {!isOrderConfirmed && (
                  <div className="pt-4 border-t">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-1">Processing</h5>
                      <p className="text-sm text-blue-800">
                        Your payment is being processed. This typically takes 2-5 minutes.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Shopping */}
        <Card className="mt-8">
          <CardContent className="pt-6 text-center">
            <h3 className="font-medium text-gray-900 mb-2">Looking for more equipment?</h3>
            <p className="text-gray-600 mb-4">
              Explore our marketplace for more automation solutions
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/buy">
                <Button variant="outline">
                  Search More Products
                </Button>
              </Link>
              <Link href="/buy/orders">
                <Button>
                  View All Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}