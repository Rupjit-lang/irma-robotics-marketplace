import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const prisma = new PrismaClient()

const bulkActionSchema = z.object({
  action: z.enum(['publish', 'disable', 'delete', 'export']),
  productIds: z.array(z.string()).min(1)
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's supplier organization
    const userRecord = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        memberships: {
          include: {
            org: {
              include: { kyc: true }
            }
          }
        }
      }
    })

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const supplierMembership = userRecord.memberships.find(m => m.org.type === 'SUPPLIER')
    if (!supplierMembership) {
      return NextResponse.json({ error: 'Not a supplier' }, { status: 403 })
    }

    const body = await request.json()
    const { action, productIds } = bulkActionSchema.parse(body)

    // Verify all products belong to this supplier
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        orgId: supplierMembership.orgId,
        deletedAt: null
      }
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Some products not found or not owned by supplier' },
        { status: 400 }
      )
    }

    let result: any = { success: true }

    switch (action) {
      case 'publish':
        // Check KYC status
        if (supplierMembership.org.kyc?.status !== 'VERIFIED') {
          return NextResponse.json(
            { error: 'KYC verification required to publish products' },
            { status: 400 }
          )
        }

        await prisma.product.updateMany({
          where: {
            id: { in: productIds },
            orgId: supplierMembership.orgId
          },
          data: {
            status: 'LIVE',
            updatedAt: new Date()
          }
        })

        result.message = `Successfully published ${productIds.length} products`
        break

      case 'disable':
        await prisma.product.updateMany({
          where: {
            id: { in: productIds },
            orgId: supplierMembership.orgId
          },
          data: {
            status: 'DISABLED',
            updatedAt: new Date()
          }
        })

        result.message = `Successfully disabled ${productIds.length} products`
        break

      case 'delete':
        await prisma.product.updateMany({
          where: {
            id: { in: productIds },
            orgId: supplierMembership.orgId
          },
          data: {
            deletedAt: new Date(),
            status: 'DISABLED',
            updatedAt: new Date()
          }
        })

        result.message = `Successfully deleted ${productIds.length} products`
        break

      case 'export':
        // Get full product data for CSV export
        const exportProducts = await prisma.product.findMany({
          where: {
            id: { in: productIds },
            orgId: supplierMembership.orgId,
            deletedAt: null
          },
          orderBy: { title: 'asc' }
        })

        // Convert to CSV format
        const csvHeaders = [
          'SKU',
          'Title',
          'Category',
          'PayloadKg',
          'ReachMm',
          'RepeatabilityMm',
          'MaxSpeedMps',
          'IPRating',
          'Controller',
          'PriceMinINR',
          'PriceMaxINR',
          'LeadTimeWeeks',
          'Status'
        ]

        const csvRows = exportProducts.map(product => [
          product.sku,
          product.title,
          product.category,
          product.payloadKg?.toString() || '',
          product.reachMm?.toString() || '',
          product.repeatabilityMm?.toString() || '',
          product.maxSpeedMps?.toString() || '',
          product.ipRating || '',
          product.controller || '',
          product.priceMinINR.toString(),
          product.priceMaxINR.toString(),
          product.leadTimeWeeks.toString(),
          product.status
        ])

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n')

        return new NextResponse(csvContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="products_export_${new Date().toISOString().split('T')[0]}.csv"`
          }
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error performing bulk action:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}