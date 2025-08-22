import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getProductCategoryName } from '@irma/lib'
import { PaymentForm } from './payment-form'
import { ArrowLeft, Shield, CreditCard, Building2, Package } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

interface PaymentPageProps {
  params: {
    quoteId: string
  }
  searchParams: {
    supplier?: string
    amount?: string
  }
}

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
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

  // Get the intake with matches
  const intake = await prisma.intake.findFirst({
    where: {
      id: params.quoteId,
      buyerOrgId: buyerMembership.orgId
    },
    include: {
      matches: {
        include: {
          product: {
            include: {
              org: {
                include: {
                  kyc: true
                }
              }
            }
          }
        },
        orderBy: { score: 'desc' }
      }
    }
  })

  if (!intake) {
    redirect('/buy')
  }

  // Check if payment already exists
  const existingPayment = await prisma.payment.findFirst({
    where: { intakeId: intake.id }
  })

  if (existingPayment && existingPayment.status === 'CAPTURED') {
    redirect(`/buy/order/${existingPayment.id}`)
  }

  // Get selected supplier
  const selectedSupplierId = searchParams.supplier
  const selectedMatch = selectedSupplierId 
    ? intake.matches.find(m => m.product.orgId === selectedSupplierId)
    : intake.matches[0]

  if (!selectedMatch) {
    redirect(`/quote/${params.quoteId}`)
  }

  // Verify supplier KYC
  if (selectedMatch.product.org.kyc?.status !== 'VERIFIED') {
    redirect(`/quote/${params.quoteId}?error=supplier_kyc`)
  }

  const agreedAmount = searchParams.amount 
    ? parseFloat(searchParams.amount)
    : selectedMatch.product.priceMinINR

  // Calculate commission
  const commissionRate = 2.5
  const commissionAmount = (agreedAmount * commissionRate) / 100
  const supplierAmount = agreedAmount - commissionAmount

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/quote/${params.quoteId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quote
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600 mt-2">
            Secure payment processing with automatic supplier transfer
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Complete your order by providing payment details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentForm
                  quoteId={params.quoteId}
                  selectedSupplierId={selectedMatch.product.orgId}
                  agreedAmount={agreedAmount}
                  razorpayKeyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!}
                />
              </CardContent>
            </Card>

            {/* Security Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Payment Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      🔒
                    </div>
                    <div>
                      <h4 className="font-medium">Secure Processing</h4>
                      <p className="text-sm text-gray-600">256-bit SSL encryption</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      🏦
                    </div>
                    <div>
                      <h4 className="font-medium">PCI DSS Compliant</h4>
                      <p className="text-sm text-gray-600">Industry-standard security</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      ⚡
                    </div>
                    <div>
                      <h4 className="font-medium">Instant Transfer</h4>
                      <p className="text-sm text-gray-600">Automatic supplier payment</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      🛡️
                    </div>
                    <div>
                      <h4 className="font-medium">Buyer Protection</h4>
                      <p className="text-sm text-gray-600">Secure escrow service</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Details */}
                <div className="border-b pb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {selectedMatch.product.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        SKU: {selectedMatch.product.sku}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {getProductCategoryName(selectedMatch.product.category)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Supplier Details */}
                <div className="border-b pb-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {selectedMatch.product.org.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">
                          KYC Verified
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {selectedMatch.product.leadTimeWeeks} weeks delivery
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements Match */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Match Score</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Compatibility</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(selectedMatch.score * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(selectedMatch.score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Amount</span>
                    <span className="font-medium">{formatCurrency(agreedAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Platform Fee ({commissionRate}%)
                    </span>
                    <span>{formatCurrency(commissionAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">To Supplier</span>
                    <span>{formatCurrency(supplierAmount)}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold">
                        {formatCurrency(agreedAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="text-xs text-gray-500 pt-4 border-t">
                  <p>
                    By completing this payment, you agree to IRMA's{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                    . Platform fee is charged for secure payment processing and supplier verification.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}