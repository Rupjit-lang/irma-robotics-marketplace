import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateProductSchema = z.object({
  status: z.enum(['DRAFT', 'LIVE', 'DISABLED']).optional(),
  title: z.string().min(1).max(200).optional(),
  payloadKg: z.number().positive().optional(),
  priceMinINR: z.number().positive().optional(),
  priceMaxINR: z.number().positive().optional(),
  leadTimeWeeks: z.number().positive().optional(),
  specs: z.record(z.any()).optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
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

    // Verify product ownership
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.productId,
        orgId: supplierMembership.orgId,
        deletedAt: null
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    // Check KYC status for publishing products
    if (validatedData.status === 'LIVE' && supplierMembership.org.kyc?.status !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'KYC verification required to publish products' },
        { status: 400 }
      )
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: params.productId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct
    })

  } catch (error) {
    console.error('Error updating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
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
            org: true
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

    // Verify product ownership
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.productId,
        orgId: supplierMembership.orgId,
        deletedAt: null
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Soft delete the product
    await prisma.product.update({
      where: { id: params.productId },
      data: {
        deletedAt: new Date(),
        status: 'DISABLED'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}