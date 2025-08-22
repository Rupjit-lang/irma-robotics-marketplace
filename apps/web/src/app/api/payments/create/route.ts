import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { createRouteOrder } from '@irma/lib/razorpay'
import { z } from 'zod'

const prisma = new PrismaClient()

const createPaymentSchema = z.object({
  quoteId: z.string(),
  selectedSupplierId: z.string(),
  paymentMethod: z.enum(['razorpay']),
  agreedAmount: z.number().positive()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const buyerMembership = userRecord.memberships.find(m => m.org.type === 'BUYER')
    if (!buyerMembership) {
      return NextResponse.json({ error: 'Not a buyer' }, { status: 403 })
    }

    const body = await request.json()
    const { quoteId, selectedSupplierId, paymentMethod, agreedAmount } = createPaymentSchema.parse(body)

    // Get the intake and verify ownership
    const intake = await prisma.intake.findFirst({
      where: {
        id: quoteId,
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
          }
        }
      }
    })

    if (!intake) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Find the selected supplier match
    const selectedMatch = intake.matches.find(m => m.product.orgId === selectedSupplierId)
    if (!selectedMatch) {
      return NextResponse.json({ error: 'Selected supplier not found in matches' }, { status: 400 })
    }

    // Verify supplier KYC status
    if (selectedMatch.product.org.kyc?.status !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Selected supplier KYC not verified' },
        { status: 400 }
      )
    }

    // Check if supplier has Razorpay account
    if (!selectedMatch.product.org.razorpayAccountId) {
      return NextResponse.json(
        { error: 'Supplier payment account not configured' },
        { status: 400 }
      )
    }

    // Calculate commission (2.5% for marketplace)
    const commissionRate = 2.5
    const amountInPaise = Math.round(agreedAmount * 100)

    // Create Razorpay Route order
    const routeOrder = await createRouteOrder({
      amount: amountInPaise,
      supplierAccountId: selectedMatch.product.org.razorpayAccountId,
      commissionRate,
      orderDetails: {
        quoteId: intake.id,
        buyerOrgId: buyerMembership.orgId,
        supplierOrgId: selectedMatch.product.orgId,
        productId: selectedMatch.product.id,
        productTitle: selectedMatch.product.title
      }
    })

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        id: routeOrder.orderId,
        intakeId: intake.id,
        buyerOrgId: buyerMembership.orgId,
        supplierOrgId: selectedMatch.product.orgId,
        productId: selectedMatch.product.id,
        amount: agreedAmount,
        commissionAmount: routeOrder.marketplaceCommission / 100,
        supplierAmount: routeOrder.supplierAmount / 100,
        status: 'PENDING',
        paymentMethod: 'RAZORPAY',
        razorpayOrderId: routeOrder.orderId,
        metadata: {
          commission_rate: commissionRate,
          razorpay_receipt: routeOrder.receipt,
          product_title: selectedMatch.product.title,
          supplier_account_id: selectedMatch.product.org.razorpayAccountId
        }
      }
    })

    // Update intake status
    await prisma.intake.update({
      where: { id: intake.id },
      data: {
        status: 'PAYMENT_PENDING',
        selectedSupplierId
      }
    })

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        orderId: routeOrder.orderId,
        amount: agreedAmount,
        commissionAmount: payment.commissionAmount,
        supplierAmount: payment.supplierAmount,
        currency: 'INR',
        status: payment.status
      },
      razorpayOrder: {
        id: routeOrder.orderId,
        amount: routeOrder.amount,
        currency: routeOrder.currency,
        receipt: routeOrder.receipt
      },
      supplier: {
        name: selectedMatch.product.org.name,
        productTitle: selectedMatch.product.title
      }
    })

  } catch (error) {
    console.error('Error creating payment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}