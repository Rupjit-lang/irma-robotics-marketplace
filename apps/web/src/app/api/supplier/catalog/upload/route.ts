import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Product schema for CSV upload validation
const ProductUploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters').regex(/^[a-zA-Z0-9-]+$/, 'SKU must contain only letters, numbers, and hyphens'),
  category: z.enum(['AMR', 'AGV', 'SixAxis', 'SCARA', 'Conveyor', 'ASRS', 'Vision', 'Other']),
  payloadKg: z.number().positive().optional(),
  reachMm: z.number().positive().optional(),
  repeatabilityMm: z.number().positive().optional(),
  maxSpeedMps: z.number().positive().optional(),
  ipRating: z.string().optional(),
  controller: z.string().optional(),
  priceMinINR: z.number().min(1000, 'Minimum price must be at least ₹1,000'),
  priceMaxINR: z.number().min(1000, 'Maximum price must be at least ₹1,000'),
  leadTimeWeeks: z.number().int().min(1).max(52),
  specs_json: z.string().optional(),
}).refine(data => data.priceMaxINR >= data.priceMinINR, {
  message: "Maximum price must be greater than or equal to minimum price",
  path: ["priceMaxINR"]
})

const UploadRequestSchema = z.object({
  products: z.array(ProductUploadSchema),
  fileName: z.string()
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { products, fileName } = UploadRequestSchema.parse(body)

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
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find supplier organization
    const supplierMembership = userRecord.memberships.find(m => 
      m.org.type === 'SUPPLIER' && 
      (m.role === 'supplier_admin' || m.role === 'ops')
    )

    if (!supplierMembership) {
      return NextResponse.json({ 
        error: 'User is not associated with a supplier organization or lacks permissions' 
      }, { status: 403 })
    }

    const supplierOrg = supplierMembership.org

    // Check KYC status - must be VERIFIED to upload products
    if (!supplierOrg.kyc || supplierOrg.kyc.status !== 'VERIFIED') {
      return NextResponse.json({ 
        error: 'KYC verification required before uploading products',
        kycStatus: supplierOrg.kyc?.status || 'PENDING'
      }, { status: 403 })
    }

    // Validate that SKUs are unique within the upload
    const skus = products.map(p => p.sku)
    const duplicateSkus = skus.filter((sku, index) => skus.indexOf(sku) !== index)
    
    if (duplicateSkus.length > 0) {
      return NextResponse.json({ 
        error: 'Duplicate SKUs found in upload',
        duplicates: [...new Set(duplicateSkus)]
      }, { status: 400 })
    }

    // Check for existing SKUs in database for this organization
    const existingProducts = await prisma.product.findMany({
      where: {
        orgId: supplierOrg.id,
        sku: { in: skus },
        deletedAt: null
      },
      select: { sku: true, id: true }
    })

    const existingSkus = existingProducts.map(p => p.sku)

    // Prepare products for database insertion
    const productsToCreate = []
    const productsToUpdate = []
    let uploadedCount = 0
    let updatedCount = 0

    for (const product of products) {
      // Parse specs JSON if provided
      let specs = {}
      if (product.specs_json) {
        try {
          specs = JSON.parse(product.specs_json)
        } catch (error) {
          console.warn(`Invalid JSON in specs for SKU ${product.sku}:`, error)
          specs = {}
        }
      }

      const productData = {
        title: product.title,
        sku: product.sku,
        category: product.category as any,
        payloadKg: product.payloadKg || null,
        reachMm: product.reachMm || null,
        repeatabilityMm: product.repeatabilityMm || null,
        maxSpeedMps: product.maxSpeedMps || null,
        ipRating: product.ipRating || null,
        controller: product.controller || null,
        priceMinINR: product.priceMinINR,
        priceMaxINR: product.priceMaxINR,
        leadTimeWeeks: product.leadTimeWeeks,
        specs,
        status: 'DRAFT' as any, // All uploaded products start as DRAFT
        updatedAt: new Date()
      }

      if (existingSkus.includes(product.sku)) {
        // Update existing product
        productsToUpdate.push({
          sku: product.sku,
          data: productData
        })
        updatedCount++
      } else {
        // Create new product
        productsToCreate.push({
          ...productData,
          orgId: supplierOrg.id,
          createdAt: new Date()
        })
        uploadedCount++
      }
    }

    // Perform bulk operations in transaction
    await prisma.$transaction(async (tx) => {
      // Create new products
      if (productsToCreate.length > 0) {
        await tx.product.createMany({
          data: productsToCreate
        })
      }

      // Update existing products
      for (const productUpdate of productsToUpdate) {
        await tx.product.updateMany({
          where: {
            orgId: supplierOrg.id,
            sku: productUpdate.sku,
            deletedAt: null
          },
          data: productUpdate.data
        })
      }
    })

    // Log the upload activity (optional - for audit trail)
    console.log(`CSV Upload completed for org ${supplierOrg.id}:`, {
      fileName,
      totalProducts: products.length,
      uploaded: uploadedCount,
      updated: updatedCount,
      userEmail: user.email
    })

    return NextResponse.json({
      success: true,
      uploadedCount,
      updatedCount,
      totalProcessed: products.length,
      existingSkusUpdated: existingSkus.length > 0 ? existingSkus : undefined,
      message: `Successfully processed ${products.length} products. ${uploadedCount} new, ${updatedCount} updated.`
    })

  } catch (error) {
    console.error('Error processing CSV upload:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid product data',
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to retrieve upload history (optional)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
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

    const supplierOrg = userRecord.memberships.find(m => m.org.type === 'SUPPLIER')?.org

    if (!supplierOrg) {
      return NextResponse.json({ error: 'No supplier organization found' }, { status: 404 })
    }

    // Get product statistics
    const productStats = await prisma.product.groupBy({
      by: ['status'],
      where: {
        orgId: supplierOrg.id,
        deletedAt: null
      },
      _count: true
    })

    const stats = {
      draft: 0,
      live: 0,
      disabled: 0,
      total: 0
    }

    productStats.forEach(stat => {
      stats[stat.status.toLowerCase() as keyof typeof stats] = stat._count
      stats.total += stat._count
    })

    return NextResponse.json({
      organizationName: supplierOrg.name,
      kycStatus: (await prisma.kYC.findUnique({ where: { supplierOrgId: supplierOrg.id } }))?.status || 'PENDING',
      productStats: stats
    })

  } catch (error) {
    console.error('Error fetching upload stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}