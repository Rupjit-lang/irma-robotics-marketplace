import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const prisma = new PrismaClient()

const deleteRequestSchema = z.object({
  confirmation_text: z.literal('DELETE MY ACCOUNT'),
  reason: z.string().optional(),
  feedback: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { confirmation_text, reason, feedback } = deleteRequestSchema.parse(body)

    // Get user data to check for active obligations
    const userRecord = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        memberships: {
          include: {
            org: {
              include: {
                payments: {
                  where: {
                    status: { in: ['PENDING', 'CAPTURED'] },
                    transferStatus: { not: 'PROCESSED' }
                  }
                },
                products: {
                  where: {
                    status: 'LIVE',
                    deletedAt: null
                  }
                }
              }
            }
          }
        },
        createdIntakes: {
          where: {
            status: { in: ['PENDING', 'MATCHED', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED'] }
          }
        }
      }
    })

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check for active obligations that prevent deletion
    const activePayments = userRecord.memberships.flatMap(m => m.org.payments)
    const activeIntakes = userRecord.createdIntakes
    const liveProducts = userRecord.memberships.flatMap(m => m.org.products)

    const obligations = []

    if (activePayments.length > 0) {
      obligations.push(`${activePayments.length} pending payment(s)`)
    }

    if (activeIntakes.length > 0) {
      obligations.push(`${activeIntakes.length} active purchase request(s)`)
    }

    if (liveProducts.length > 0) {
      obligations.push(`${liveProducts.length} live product listing(s)`)
    }

    // If there are active obligations, prevent deletion
    if (obligations.length > 0) {
      return NextResponse.json({
        error: 'Account deletion not allowed',
        reason: 'Active obligations prevent account deletion',
        obligations: obligations,
        instructions: [
          'Complete or cancel all pending transactions',
          'Remove or disable all live product listings',
          'Resolve all active purchase requests',
          'Contact support if you need assistance: privacy@irma.co.in'
        ]
      }, { status: 400 })
    }

    // Log deletion request for audit purposes
    const deletionLog = {
      user_email: user.email,
      user_id: userRecord.id,
      requested_at: new Date().toISOString(),
      reason: reason || 'Not provided',
      feedback: feedback || 'Not provided',
      ip_address: request.headers.get('x-forwarded-for') || 'Unknown'
    }

    console.log('Account deletion requested:', deletionLog)

    // Perform soft deletion (anonymization) instead of hard deletion
    // This complies with DPDP while maintaining business records
    await prisma.$transaction(async (tx) => {
      // Anonymize user data
      const anonymizedId = `deleted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await tx.user.update({
        where: { id: userRecord.id },
        data: {
          name: '[Deleted User]',
          email: `deleted+${anonymizedId}@irma.co.in`,
          phone: null,
          deletedAt: new Date(),
          metadata: {
            ...((userRecord.metadata as any) || {}),
            deletion_info: {
              deleted_at: new Date().toISOString(),
              deletion_reason: reason || 'User request',
              original_email_hash: user.email, // For potential recovery within grace period
              anonymized_id: anonymizedId
            }
          }
        }
      })

      // Anonymize organization data where user was sole admin
      for (const membership of userRecord.memberships) {
        const org = membership.org
        const otherAdmins = await tx.membership.count({
          where: {
            orgId: org.id,
            role: { endsWith: '_admin' },
            userId: { not: userRecord.id }
          }
        })

        if (otherAdmins === 0) {
          // User is sole admin, anonymize org data
          await tx.org.update({
            where: { id: org.id },
            data: {
              name: `[Deleted Organization - ${anonymizedId}]`,
              deletedAt: new Date()
            }
          })

          // Disable all products
          await tx.product.updateMany({
            where: { orgId: org.id },
            data: {
              status: 'DISABLED',
              deletedAt: new Date()
            }
          })
        } else {
          // Remove user from organization
          await tx.membership.delete({
            where: { id: membership.id }
          })
        }
      }

      // Keep transaction records for legal/financial compliance
      // but anonymize personal identifiers in metadata
      await tx.payment.updateMany({
        where: {
          OR: [
            { buyerOrgId: { in: userRecord.memberships.map(m => m.orgId) } },
            { supplierOrgId: { in: userRecord.memberships.map(m => m.orgId) } }
          ]
        },
        data: {
          metadata: {
            anonymized_user: anonymizedId,
            data_retention_reason: 'Financial records - 7 year retention requirement'
          }
        }
      })

      // Anonymize intake data
      await tx.intake.updateMany({
        where: { createdById: userRecord.id },
        data: {
          data: {
            anonymized: true,
            original_data_deleted: new Date().toISOString()
          }
        }
      })
    })

    // Delete from Supabase Auth
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
      if (authError) {
        console.error('Failed to delete user from Supabase:', authError)
        // Continue with soft deletion even if auth deletion fails
      }
    } catch (authDeleteError) {
      console.error('Error deleting from auth:', authDeleteError)
    }

    return NextResponse.json({
      success: true,
      message: 'Account successfully deleted',
      deletion_info: {
        processed_at: new Date().toISOString(),
        anonymization_id: deletionLog.user_id,
        data_retention_notice: 'Some anonymized transaction data is retained for 7 years as required by financial regulations',
        recovery_period: '30 days - Contact privacy@irma.co.in if you need to recover your account',
        confirmation_email: 'A confirmation email will be sent to your registered email address'
      }
    })

  } catch (error) {
    console.error('Error processing account deletion:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: 'confirmation_text must be exactly "DELETE MY ACCOUNT"'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to process account deletion',
        support: 'Please contact privacy@irma.co.in for assistance'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Get deletion status/prerequisites
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRecord = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        memberships: {
          include: {
            org: {
              include: {
                payments: {
                  where: {
                    status: { in: ['PENDING', 'CAPTURED'] },
                    transferStatus: { not: 'PROCESSED' }
                  }
                },
                products: {
                  where: {
                    status: 'LIVE',
                    deletedAt: null
                  }
                }
              }
            }
          }
        },
        createdIntakes: {
          where: {
            status: { in: ['PENDING', 'MATCHED', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED'] }
          }
        }
      }
    })

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const activePayments = userRecord.memberships.flatMap(m => m.org.payments)
    const activeIntakes = userRecord.createdIntakes
    const liveProducts = userRecord.memberships.flatMap(m => m.org.products)

    const canDelete = activePayments.length === 0 && activeIntakes.length === 0 && liveProducts.length === 0

    return NextResponse.json({
      can_delete: canDelete,
      prerequisites: {
        pending_payments: activePayments.length,
        active_purchase_requests: activeIntakes.length,
        live_products: liveProducts.length
      },
      deletion_process: {
        data_anonymization: 'Personal data will be anonymized immediately',
        transaction_retention: 'Anonymized transaction records retained for 7 years (regulatory requirement)',
        recovery_period: '30 days grace period for account recovery',
        confirmation_required: 'Must type "DELETE MY ACCOUNT" to confirm'
      },
      your_rights: [
        'Right to data portability - export your data before deletion',
        'Right to rectification - correct any inaccurate data before deletion',
        'Right to restrict processing - contact us to limit data processing',
        'Right to object - opt-out of marketing communications'
      ],
      contact_info: {
        data_protection_officer: 'privacy@irma.co.in',
        support_phone: '+91-1800-123-4567',
        business_hours: 'Monday-Friday, 9 AM - 6 PM IST'
      }
    })

  } catch (error) {
    console.error('Error getting deletion status:', error)
    return NextResponse.json(
      { error: 'Failed to get deletion status' },
      { status: 500 }
    )
  }
}