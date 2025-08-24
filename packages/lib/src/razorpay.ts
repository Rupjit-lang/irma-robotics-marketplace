import Razorpay from 'razorpay'

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
})

// Route Transfer configuration
export interface RouteTransferConfig {
  totalAmount: number // in paise
  marketplaceCommission: number // percentage (e.g., 2.5 for 2.5%)
  supplierAccountId: string // Razorpay account ID
  orderId: string
  notes?: Record<string, string>
}

export interface CreateRouteOrderParams {
  amount: number // in paise
  supplierAccountId: string
  commissionRate: number // percentage
  orderDetails: {
    quoteId: string
    buyerOrgId: string
    supplierOrgId: string
    productId: string
    productTitle: string
  }
}

/**
 * Create a Razorpay Route order with automatic split configuration
 */
export async function createRouteOrder(params: CreateRouteOrderParams) {
  const {
    amount,
    supplierAccountId,
    commissionRate,
    orderDetails
  } = params

  // Calculate amounts
  const marketplaceCommission = Math.round((amount * commissionRate) / 100)
  const supplierAmount = amount - marketplaceCommission

  // Create order with Route configuration
  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `order_${orderDetails.quoteId}_${Date.now()}`,
    notes: {
      quote_id: orderDetails.quoteId,
      buyer_org_id: orderDetails.buyerOrgId,
      supplier_org_id: orderDetails.supplierOrgId,
      product_id: orderDetails.productId,
      product_title: orderDetails.productTitle,
      commission_rate: commissionRate.toString(),
      marketplace_commission: marketplaceCommission.toString(),
      supplier_amount: supplierAmount.toString()
    },
    transfers: [
      {
        account: supplierAccountId,
        amount: supplierAmount,
        currency: 'INR',
        notes: {
          type: 'supplier_payment',
          supplier_org_id: orderDetails.supplierOrgId,
          product_id: orderDetails.productId
        },
        linked_account_notes: [
          `Payment for ${orderDetails.productTitle}`,
          `Order: ${orderDetails.quoteId}`
        ]
      }
    ]
  })

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    status: order.status,
    marketplaceCommission,
    supplierAmount,
    transfers: order.transfers
  }
}

/**
 * Create a Route transfer after payment capture
 */
export async function createRouteTransfer(
  paymentId: string,
  config: RouteTransferConfig
) {
  const supplierAmount = Math.round(
    config.totalAmount - (config.totalAmount * config.marketplaceCommission) / 100
  )

  const transfer = await razorpay.transfers.create({
    account: config.supplierAccountId,
    amount: supplierAmount,
    currency: 'INR',
    notes: {
      order_id: config.orderId,
      commission_rate: config.marketplaceCommission.toString(),
      source_payment_id: paymentId,
      ...config.notes
    }
  } as any)

  return transfer
}

/**
 * Get transfer details by ID
 */
export async function getTransferDetails(transferId: string) {
  return await razorpay.transfers.fetch(transferId)
}

/**
 * Get all transfers for a payment
 */
export async function getPaymentTransfers(paymentId: string) {
  return await razorpay.transfers.all({
    expand: ['source'],
    count: 100
  } as any)
}

/**
 * Reverse a transfer (for refunds)
 */
export async function reverseTransfer(
  transferId: string,
  amount?: number,
  notes?: Record<string, string>
) {
  const reversal = await razorpay.transfers.reverse(transferId, {
    amount,
    notes
  })

  return reversal
}

/**
 * Get linked account balance
 */
export async function getLinkedAccountBalance(accountId: string) {
  try {
    // Note: This requires special permissions and may not be available in all plans
    const response = await razorpay.accounts.fetch(accountId)
    return response
  } catch (error) {
    console.error('Error fetching account balance:', error)
    throw error
  }
}

/**
 * Create a linked account for suppliers
 */
export async function createLinkedAccount(supplierData: {
  email: string
  phone: string
  businessName: string
  businessType: 'proprietorship' | 'partnership' | 'private_limited' | 'public_limited' | 'llp'
  panNumber: string
  gstin?: string
  bankAccount: {
    ifsc: string
    accountNumber: string
    beneficiaryName: string
  }
  address: {
    street1: string
    street2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}) {
  const account = await razorpay.accounts.create({
    email: supplierData.email,
    phone: supplierData.phone,
    type: 'route',
    reference_id: `supplier_${Date.now()}`,
    legal_business_name: supplierData.businessName,
    business_type: supplierData.businessType,
    contact_name: supplierData.businessName,
    profile: {
      category: 'healthcare', // Update based on business
      subcategory: 'medical_equipment',
      addresses: {
        registered: {
          street1: supplierData.address.street1,
          ...(supplierData.address.street2 && { street2: supplierData.address.street2 }),
          city: supplierData.address.city,
          state: supplierData.address.state,
          postal_code: supplierData.address.postalCode,
          country: supplierData.address.country
        }
      }
    },
    legal_info: {
      pan: supplierData.panNumber,
      ...(supplierData.gstin && { gst: supplierData.gstin })
    },
    brand: {
      color: '0052CC' // IRMA brand color
    },
    notes: {
      created_by: 'irma_marketplace',
      business_type: supplierData.businessType
    },
    bank_account: {
      ifsc_code: supplierData.bankAccount.ifsc,
      account_number: supplierData.bankAccount.accountNumber,
      beneficiary_name: supplierData.bankAccount.beneficiaryName
    }
  })

  return account
}

/**
 * Webhook signature verification
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Commission calculation utility
 */
export function calculateCommission(
  amount: number,
  commissionRate: number
): {
  totalAmount: number
  marketplaceCommission: number
  supplierAmount: number
  gst: number
  netSupplierAmount: number
} {
  const marketplaceCommission = Math.round((amount * commissionRate) / 100)
  const gst = Math.round((marketplaceCommission * 18) / 100) // 18% GST on commission
  const supplierAmount = amount - marketplaceCommission
  const netSupplierAmount = supplierAmount - gst

  return {
    totalAmount: amount,
    marketplaceCommission,
    supplierAmount,
    gst,
    netSupplierAmount
  }
}