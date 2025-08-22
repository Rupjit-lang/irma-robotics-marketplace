import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyWebhookSignature } from '@irma/lib/razorpay'
import { notificationService } from '@irma/lib/notifications'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      body,
      signature,
      process.env.ROUTE_WEBHOOK_SECRET!
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log('Razorpay webhook event:', event.event, event.payload)

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity)
        break

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity)
        break

      case 'transfer.processed':
        await handleTransferProcessed(event.payload.transfer.entity)
        break

      case 'transfer.failed':
        await handleTransferFailed(event.payload.transfer.entity)
        break

      case 'transfer.reversed':
        await handleTransferReversed(event.payload.transfer.entity)
        break

      default:
        console.log('Unhandled webhook event:', event.event)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCaptured(paymentData: any) {
  const { id: paymentId, order_id: orderId, amount, notes } = paymentData

  try {
    // Update payment status in database
    const payment = await prisma.payment.update({
      where: { razorpayOrderId: orderId },
      data: {
        status: 'CAPTURED',
        razorpayPaymentId: paymentId,
        capturedAt: new Date(),
        metadata: {
          ...(payment.metadata as any),
          captured_amount: amount,
          payment_method: paymentData.method,
          bank: paymentData.bank,
          wallet: paymentData.wallet
        }
      },
      include: {
        intake: true,
        product: {
          include: {
            org: true
          }
        },
        buyerOrg: true,
        supplierOrg: true
      }
    })

    // Update intake status
    await prisma.intake.update({
      where: { id: payment.intakeId },
      data: {
        status: 'PAYMENT_CONFIRMED'
      }
    })

    // Get buyer and supplier user details for notifications
    const buyerUser = await prisma.user.findFirst({
      where: {
        memberships: {
          some: {
            orgId: payment.buyerOrgId,
            role: { in: ['buyer_admin', 'buyer_user'] }
          }
        }
      }
    })

    const supplierUser = await prisma.user.findFirst({
      where: {
        memberships: {
          some: {
            orgId: payment.supplierOrgId,
            role: { in: ['supplier_admin', 'supplier_user'] }
          }
        }
      }
    })

    // Calculate estimated delivery
    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (payment.product.leadTimeWeeks * 7))

    // Send notifications
    if (buyerUser) {
      await notificationService.sendPaymentConfirmationToBuyer(buyerUser.email, {
        buyerName: buyerUser.name,
        buyerOrgName: payment.buyerOrg.name,
        supplierName: supplierUser?.name || 'Supplier Team',
        supplierOrgName: payment.supplierOrg.name,
        productTitle: payment.product.title,
        amount: payment.amount,
        orderId: payment.id,
        estimatedDelivery: estimatedDelivery.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      })
    }

    if (supplierUser) {
      await notificationService.sendNewOrderNotificationToSupplier(supplierUser.email, {
        buyerName: buyerUser?.name || 'Buyer',
        buyerOrgName: payment.buyerOrg.name,
        supplierName: supplierUser.name,
        supplierOrgName: payment.supplierOrg.name,
        productTitle: payment.product.title,
        amount: payment.amount,
        orderId: payment.id,
        estimatedDelivery: estimatedDelivery.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      })
    }

    console.log(`Payment captured: ${paymentId}, Order: ${orderId}`)

  } catch (error) {
    console.error('Error handling payment captured:', error)
  }
}

async function handlePaymentFailed(paymentData: any) {
  const { order_id: orderId, error_code, error_description } = paymentData

  try {
    // Update payment status
    const payment = await prisma.payment.update({
      where: { razorpayOrderId: orderId },
      data: {
        status: 'FAILED',
        metadata: {
          ...(payment.metadata as any),
          error_code,
          error_description,
          failed_at: new Date().toISOString()
        }
      },
      include: {
        product: true,
        buyerOrg: true
      }
    })

    // Update intake status back to matched
    await prisma.intake.update({
      where: { id: payment.intakeId },
      data: {
        status: 'MATCHED'
      }
    })

    // Get buyer user for notification
    const buyerUser = await prisma.user.findFirst({
      where: {
        memberships: {
          some: {
            orgId: payment.buyerOrgId,
            role: { in: ['buyer_admin', 'buyer_user'] }
          }
        }
      }
    })

    // Send failure notification
    if (buyerUser) {
      await notificationService.sendPaymentFailedNotification(buyerUser.email, {
        buyerName: buyerUser.name,
        buyerOrgName: payment.buyerOrg.name,
        productTitle: payment.product.title,
        amount: payment.amount,
        orderId: payment.id,
        errorReason: error_description || 'Payment processing failed'
      })
    }

    console.log(`Payment failed: Order ${orderId}, Error: ${error_description}`)

  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleTransferProcessed(transferData: any) {
  const { id: transferId, source: paymentId, recipient, amount } = transferData

  try {
    // Find payment by Razorpay payment ID
    const payment = await prisma.payment.findFirst({
      where: { razorpayPaymentId: paymentId },
      include: {
        product: true,
        supplierOrg: true
      }
    })

    if (payment) {
      // Update payment with transfer information
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          transferStatus: 'PROCESSED',
          transferId,
          transferredAt: new Date(),
          metadata: {
            ...(payment.metadata as any),
            transfer_id: transferId,
            transfer_amount: amount,
            transfer_recipient: recipient
          }
        }
      })

      // Update intake status to completed
      await prisma.intake.update({
        where: { id: payment.intakeId },
        data: {
          status: 'COMPLETED'
        }
      })

      // Get supplier user for notification
      const supplierUser = await prisma.user.findFirst({
        where: {
          memberships: {
            some: {
              orgId: payment.supplierOrgId,
              role: { in: ['supplier_admin', 'supplier_user'] }
            }
          }
        }
      })

      // Send transfer notification
      if (supplierUser) {
        await notificationService.sendTransferProcessedNotification(supplierUser.email, {
          supplierName: supplierUser.name,
          supplierOrgName: payment.supplierOrg.name,
          productTitle: payment.product.title,
          amount: payment.amount,
          transferAmount: amount / 100, // Convert from paise to rupees
          orderId: payment.id
        })
      }

      console.log(`Transfer processed: ${transferId}, Payment: ${paymentId}`)
    }

  } catch (error) {
    console.error('Error handling transfer processed:', error)
  }
}

async function handleTransferFailed(transferData: any) {
  const { id: transferId, source: paymentId, error } = transferData

  try {
    // Find payment by Razorpay payment ID
    const payment = await prisma.payment.findFirst({
      where: { razorpayPaymentId: paymentId }
    })

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          transferStatus: 'FAILED',
          metadata: {
            ...(payment.metadata as any),
            transfer_error: error,
            transfer_failed_at: new Date().toISOString()
          }
        }
      })

      console.log(`Transfer failed: ${transferId}, Payment: ${paymentId}, Error:`, error)
    }

  } catch (error) {
    console.error('Error handling transfer failed:', error)
  }
}

async function handleTransferReversed(transferData: any) {
  const { id: transferId, source: paymentId, amount } = transferData

  try {
    // Find payment by Razorpay payment ID
    const payment = await prisma.payment.findFirst({
      where: { razorpayPaymentId: paymentId }
    })

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          transferStatus: 'REVERSED',
          metadata: {
            ...(payment.metadata as any),
            transfer_reversed_amount: amount,
            transfer_reversed_at: new Date().toISOString()
          }
        }
      })

      // Update intake status back to payment confirmed
      await prisma.intake.update({
        where: { id: payment.intakeId },
        data: {
          status: 'PAYMENT_CONFIRMED'
        }
      })

      console.log(`Transfer reversed: ${transferId}, Payment: ${paymentId}`)
    }

  } catch (error) {
    console.error('Error handling transfer reversed:', error)
  }
}