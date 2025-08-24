import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { RecommendationEngine } from '@/lib/recommendations'
import { z } from 'zod'

const trackViewSchema = z.object({
  productId: z.string(),
  source: z.string().optional().default('direct'),
  sessionId: z.string().optional()
})

const trackInteractionSchema = z.object({
  productId: z.string().optional(),
  intakeId: z.string().optional(),
  interactionType: z.enum([
    'VIEW_PRODUCT',
    'SAVE_PRODUCT', 
    'SHARE_PRODUCT',
    'REQUEST_QUOTE',
    'COMPLETE_PAYMENT',
    'DOWNLOAD_SPEC',
    'CONTACT_SUPPLIER'
  ]),
  metadata: z.record(z.any()).optional().default({})
})

const trackRecommendationClickSchema = z.object({
  productId: z.string()
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
      return NextResponse.json({ error: 'Not a buyer organization' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    let result

    switch (action) {
      case 'view':
        result = await handleViewTracking(body, userRecord.id, buyerMembership.orgId)
        break
      case 'interaction':
        result = await handleInteractionTracking(body, userRecord.id, buyerMembership.orgId)
        break
      case 'recommendation_click':
        result = await handleRecommendationClick(body, userRecord.id, buyerMembership.orgId)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error tracking product interaction:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid parameters',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

async function handleViewTracking(body: any, userId: string, orgId: string) {
  const { productId, source, sessionId } = trackViewSchema.parse(body)

  // Check if product exists and is live
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      status: 'LIVE'
    }
  })

  if (!product) {
    throw new Error('Product not found or not available')
  }

  // Track product view (upsert to update timestamp if already viewed)
  const productView = await prisma.productView.upsert({
    where: {
      userId_productId_orgId: {
        userId,
        productId,
        orgId
      }
    },
    update: {
      viewedAt: new Date(),
      sessionId,
      source
    },
    create: {
      userId,
      productId,
      orgId,
      sessionId,
      source
    }
  })

  // Also track as a user interaction
  await prisma.userInteraction.create({
    data: {
      userId,
      orgId,
      productId,
      interactionType: 'VIEW_PRODUCT',
      metadata: {
        source,
        sessionId,
        timestamp: new Date().toISOString()
      }
    }
  })

  return {
    viewId: productView.id,
    productId,
    viewedAt: productView.viewedAt
  }
}

async function handleInteractionTracking(body: any, userId: string, orgId: string) {
  const { productId, intakeId, interactionType, metadata } = trackInteractionSchema.parse(body)

  // Validate that at least one of productId or intakeId is provided
  if (!productId && !intakeId) {
    throw new Error('Either productId or intakeId must be provided')
  }

  // Create user interaction record
  const interaction = await prisma.userInteraction.create({
    data: {
      userId,
      orgId,
      productId,
      intakeId,
      interactionType,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    }
  })

  return {
    interactionId: interaction.id,
    interactionType,
    createdAt: interaction.createdAt
  }
}

async function handleRecommendationClick(body: any, userId: string, orgId: string) {
  const { productId } = trackRecommendationClickSchema.parse(body)

  // Initialize recommendation engine
  const recommendationEngine = new RecommendationEngine(prisma)

  // Track the recommendation click
  await recommendationEngine.trackRecommendationClick(userId, orgId, productId)

  return {
    productId,
    clickedAt: new Date().toISOString()
  }
}

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ error: 'Not a buyer organization' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') || 'recent' // recent, frequent, saved

    let result

    switch (type) {
      case 'recent':
        result = await getRecentlyViewedProducts(userRecord.id, buyerMembership.orgId, limit)
        break
      case 'frequent':
        result = await getFrequentlyViewedProducts(userRecord.id, buyerMembership.orgId, limit)
        break
      case 'interactions':
        result = await getRecentInteractions(userRecord.id, buyerMembership.orgId, limit)
        break
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        type,
        items: result,
        count: result.length
      }
    })

  } catch (error) {
    console.error('Error getting product views:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

async function getRecentlyViewedProducts(userId: string, orgId: string, limit: number) {
  const recentViews = await prisma.productView.findMany({
    where: {
      userId,
      orgId
    },
    include: {
      product: {
        include: {
          org: {
            select: {
              name: true,
              gstin: true
            }
          }
        }
      }
    },
    orderBy: { viewedAt: 'desc' },
    take: limit
  })

  return recentViews.map(view => ({
    viewedAt: view.viewedAt,
    source: view.source,
    product: view.product
  }))
}

async function getFrequentlyViewedProducts(userId: string, orgId: string, limit: number) {
  // Get products viewed multiple times in the last 30 days
  const frequentViews = await prisma.userInteraction.groupBy({
    by: ['productId'],
    where: {
      userId,
      orgId,
      productId: { not: null },
      interactionType: 'VIEW_PRODUCT',
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    _count: {
      productId: true
    },
    having: {
      productId: {
        _count: {
          gt: 1
        }
      }
    },
    orderBy: {
      _count: {
        productId: 'desc'
      }
    },
    take: limit
  })

  // Get product details
  const productIds = frequentViews.map(view => view.productId!).filter(Boolean)
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      status: 'LIVE'
    },
    include: {
      org: {
        select: {
          name: true,
          gstin: true
        }
      }
    }
  })

  return frequentViews.map(view => {
    const product = products.find(p => p.id === view.productId)
    return {
      viewCount: view._count.productId,
      product
    }
  }).filter(item => item.product)
}

async function getRecentInteractions(userId: string, orgId: string, limit: number) {
  const interactions = await prisma.userInteraction.findMany({
    where: {
      userId,
      orgId
    },
    include: {
      product: {
        include: {
          org: {
            select: {
              name: true,
              gstin: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return interactions.map(interaction => ({
    interactionType: interaction.interactionType,
    createdAt: interaction.createdAt,
    metadata: interaction.metadata,
    product: interaction.product
  }))
}