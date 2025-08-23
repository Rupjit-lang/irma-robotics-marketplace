import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { RecommendationEngine } from '@irma/lib'
import { z } from 'zod'

const getRecommendationsSchema = z.object({
  limit: z.number().min(1).max(50).optional().default(10),
  algorithm: z.enum(['hybrid', 'browsing', 'industry', 'trending', 'similar_buyers']).optional().default('hybrid'),
  excludeProductIds: z.array(z.string()).optional().default([])
})

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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      algorithm: searchParams.get('algorithm') || 'hybrid',
      excludeProductIds: searchParams.get('excludeProductIds')?.split(',') || []
    }

    const validatedParams = getRecommendationsSchema.parse(queryParams)

    // Initialize recommendation engine
    const recommendationEngine = new RecommendationEngine(prisma)

    // Get recommendations
    const recommendations = await recommendationEngine.getRecommendationsForUser({
      userId: userRecord.id,
      orgId: buyerMembership.orgId,
      ...validatedParams
    })

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        algorithm: validatedParams.algorithm,
        count: recommendations.length,
        metadata: {
          userId: userRecord.id,
          orgId: buyerMembership.orgId,
          timestamp: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Error getting recommendations:', error)
    
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
    const validatedParams = getRecommendationsSchema.parse(body)

    // Initialize recommendation engine
    const recommendationEngine = new RecommendationEngine(prisma)

    // Get recommendations
    const recommendations = await recommendationEngine.getRecommendationsForUser({
      userId: userRecord.id,
      orgId: buyerMembership.orgId,
      ...validatedParams
    })

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        algorithm: validatedParams.algorithm,
        count: recommendations.length,
        metadata: {
          userId: userRecord.id,
          orgId: buyerMembership.orgId,
          timestamp: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Error getting recommendations:', error)
    
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