import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { IntakeSchema, MatchingEngine, type IntakeData } from '@irma/lib'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    const validatedData = IntakeSchema.parse(body)

    // Check if user has a buyer organization
    let userRecord = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        memberships: {
          include: {
            org: true
          }
        }
      }
    })

    // Create user if doesn't exist
    if (!userRecord) {
      userRecord = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || null,
        },
        include: {
          memberships: {
            include: {
              org: true
            }
          }
        }
      })
    }

    // Find or create buyer organization
    let buyerOrg = userRecord.memberships.find(m => m.org.type === 'BUYER')?.org

    if (!buyerOrg) {
      // Create default buyer organization
      buyerOrg = await prisma.org.create({
        data: {
          name: `${userRecord.name || 'Buyer'} Organization`,
          type: 'BUYER',
          memberships: {
            create: {
              userId: userRecord.id,
              role: 'buyer_admin'
            }
          }
        }
      })
    }

    // Create intake record
    const intake = await prisma.intake.create({
      data: {
        buyerOrgId: buyerOrg.id,
        createdByUserId: userRecord.id,
        data: validatedData as any,
        status: 'PENDING'
      }
    })

    // Get available products for matching
    const products = await prisma.product.findMany({
      where: {
        status: 'LIVE',
        deletedAt: null
      },
      include: {
        org: true
      }
    })

    // Run matching engine
    const matchingEngine = new MatchingEngine()
    const matches = await matchingEngine.matchProducts(
      validatedData,
      products.map(p => ({
        id: p.id,
        orgId: p.orgId,
        category: p.category,
        title: p.title,
        sku: p.sku,
        payloadKg: p.payloadKg || undefined,
        reachMm: p.reachMm || undefined,
        repeatabilityMm: p.repeatabilityMm || undefined,
        maxSpeedMps: p.maxSpeedMps || undefined,
        ipRating: p.ipRating || undefined,
        controller: p.controller || undefined,
        specs: p.specs as Record<string, any>,
        priceMinINR: p.priceMinINR,
        priceMaxINR: p.priceMaxINR,
        leadTimeWeeks: p.leadTimeWeeks,
        status: p.status,
        org: p.org
      }))
    )

    // Save matches to database
    for (const match of matches) {
      await prisma.match.create({
        data: {
          intakeId: intake.id,
          productId: match.productId,
          fitScore: match.fitScore,
          why: match.why,
          assumptions: match.assumptions,
          commercials: match.commercials as any,
          deliveryInstall: match.deliveryInstall as any,
          sla: match.sla as any
        }
      })
    }

    // Update intake status
    await prisma.intake.update({
      where: { id: intake.id },
      data: { status: 'MATCHED' }
    })

    return NextResponse.json({ 
      intakeId: intake.id,
      matchCount: matches.length 
    })

  } catch (error) {
    console.error('Error processing intake:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}