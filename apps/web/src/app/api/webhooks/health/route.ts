import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`

    // Get webhook processing statistics
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Get recent payment statistics
    const recentPayments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      },
      select: {
        status: true,
        transferStatus: true,
        createdAt: true,
        capturedAt: true,
        transferredAt: true
      }
    })

    const stats = {
      total_payments_24h: recentPayments.length,
      captured_payments_24h: recentPayments.filter(p => p.status === 'CAPTURED').length,
      failed_payments_24h: recentPayments.filter(p => p.status === 'FAILED').length,
      processed_transfers_24h: recentPayments.filter(p => p.transferStatus === 'PROCESSED').length,
      failed_transfers_24h: recentPayments.filter(p => p.transferStatus === 'FAILED').length,
      avg_capture_time_minutes: calculateAverageProcessingTime(
        recentPayments.filter(p => p.capturedAt && p.createdAt)
          .map(p => p.capturedAt!.getTime() - p.createdAt.getTime())
      ),
      avg_transfer_time_minutes: calculateAverageProcessingTime(
        recentPayments.filter(p => p.transferredAt && p.capturedAt)
          .map(p => p.transferredAt!.getTime() - p.capturedAt!.getTime())
      )
    }

    // Check for any stuck payments (captured but not transferred after 30 minutes)
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
    const stuckPayments = await prisma.payment.findMany({
      where: {
        status: 'CAPTURED',
        transferStatus: { not: 'PROCESSED' },
        capturedAt: {
          lt: thirtyMinutesAgo
        }
      },
      select: {
        id: true,
        capturedAt: true
      }
    })

    const health = {
      status: 'healthy',
      timestamp: now.toISOString(),
      database: 'connected',
      webhook_processing: stats,
      alerts: {
        stuck_payments: stuckPayments.length,
        stuck_payment_ids: stuckPayments.map(p => p.id)
      }
    }

    // Determine overall health status
    if (stuckPayments.length > 5) {
      health.status = 'degraded'
    }

    if (stats.failed_payments_24h > stats.captured_payments_24h * 0.1) {
      health.status = 'degraded'
    }

    return NextResponse.json(health)

  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function calculateAverageProcessingTime(times: number[]): number {
  if (times.length === 0) return 0
  const average = times.reduce((sum, time) => sum + time, 0) / times.length
  return Math.round(average / (1000 * 60)) // Convert to minutes
}

export async function POST(request: NextRequest) {
  // Test webhook endpoint for development/testing
  try {
    const body = await request.json()
    
    console.log('Test webhook received:', {
      timestamp: new Date().toISOString(),
      body: body
    })

    return NextResponse.json({
      success: true,
      message: 'Test webhook received successfully',
      received_data: body,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test webhook error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process test webhook'
    }, { status: 400 })
  }
}