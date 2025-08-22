'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@irma/lib'
import { CreditCard, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PaymentFormProps {
  quoteId: string
  selectedSupplierId: string
  agreedAmount: number
  razorpayKeyId: string
}

export function PaymentForm({
  quoteId,
  selectedSupplierId,
  agreedAmount,
  razorpayKeyId
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePayment = async () => {
    try {
      setIsProcessing(true)
      setError(null)

      // Create payment order
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteId,
          selectedSupplierId,
          paymentMethod: 'razorpay',
          agreedAmount
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment')
      }

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const options = {
          key: razorpayKeyId,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: 'IRMA Marketplace',
          description: `Payment for ${data.supplier.productTitle}`,
          order_id: data.razorpayOrder.id,
          handler: async function (response: any) {
            try {
              // Payment successful, redirect to success page
              router.push(`/buy/order/${data.payment.id}?payment_id=${response.razorpay_payment_id}`)
            } catch (error) {
              console.error('Payment completion error:', error)
              setError('Payment processing failed. Please contact support.')
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: ''
          },
          notes: {
            quote_id: quoteId,
            supplier_id: selectedSupplierId
          },
          theme: {
            color: '#0052CC'
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false)
            }
          }
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }

      script.onerror = () => {
        setError('Failed to load payment gateway. Please try again.')
        setIsProcessing(false)
      }

      document.body.appendChild(script)

    } catch (error) {
      console.error('Payment initiation error:', error)
      setError(error instanceof Error ? error.message : 'Payment failed')
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <Label className="text-base font-medium">Payment Method</Label>
        <Card className="mt-2 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Razorpay Secure Payment</h4>
                <p className="text-sm text-blue-700">
                  Credit Card, Debit Card, Net Banking, UPI, Wallets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Amount Confirmation */}
      <div>
        <Label className="text-base font-medium">Amount to Pay</Label>
        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(agreedAmount)}
          </div>
          <p className="text-sm text-gray-600">
            Includes platform fee and automatic supplier transfer
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full py-6 text-lg"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay {formatCurrency(agreedAmount)}
          </>
        )}
      </Button>

      {/* Security Note */}
      <div className="text-center text-sm text-gray-600">
        <p>
          🔒 Your payment is secured by 256-bit SSL encryption
        </p>
        <p className="mt-1">
          Powered by Razorpay • PCI DSS Compliant
        </p>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your payment is securely processed by Razorpay</li>
          <li>• Supplier payment is automatically transferred after confirmation</li>
          <li>• Platform fee covers payment processing and verification services</li>
          <li>• You'll receive order confirmation and tracking details</li>
        </ul>
      </div>
    </div>
  )
}