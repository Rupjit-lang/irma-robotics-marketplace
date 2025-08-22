import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get comprehensive user data for export
    const userRecord = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        memberships: {
          include: {
            org: {
              include: {
                kyc: true,
                products: {
                  where: { deletedAt: null }
                },
                intakes: true,
                payments: true
              }
            }
          }
        },
        createdIntakes: {
          include: {
            matches: true
          }
        }
      }
    })

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Structure the export data according to DPDP requirements
    const exportData = {
      export_metadata: {
        exported_at: new Date().toISOString(),
        export_format: 'JSON',
        data_controller: 'IRMA Marketplace Pvt Ltd',
        user_email: user.email,
        export_reason: 'User data portability request under DPDP Act 2023'
      },
      
      personal_information: {
        user_id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        phone: userRecord.phone,
        created_at: userRecord.createdAt,
        updated_at: userRecord.updatedAt
      },

      organization_memberships: userRecord.memberships.map(membership => ({
        organization_id: membership.orgId,
        organization_name: membership.org.name,
        organization_type: membership.org.type,
        organization_gstin: membership.org.gstin,
        member_role: membership.role,
        joined_at: membership.createdAt,
        kyc_status: membership.org.kyc?.status || 'NOT_STARTED',
        kyc_verified_at: membership.org.kyc?.verifiedAt || null
      })),

      purchase_history: userRecord.createdIntakes.map(intake => ({
        intake_id: intake.id,
        status: intake.status,
        requirements: intake.data,
        created_at: intake.createdAt,
        updated_at: intake.updatedAt,
        selected_supplier_id: intake.selectedSupplierId,
        matches_count: intake.matches.length
      })),

      supplier_data: userRecord.memberships
        .filter(m => m.org.type === 'SUPPLIER')
        .map(membership => ({
          organization_id: membership.orgId,
          products_listed: membership.org.products.length,
          total_orders_received: membership.org.payments.length,
          kyc_information: membership.org.kyc ? {
            status: membership.org.kyc.status,
            submitted_at: membership.org.kyc.createdAt,
            verified_at: membership.org.kyc.verifiedAt,
            fields_submitted: Object.keys(membership.org.kyc.fields as any || {})
          } : null,
          products: membership.org.products.map(product => ({
            product_id: product.id,
            title: product.title,
            sku: product.sku,
            category: product.category,
            status: product.status,
            price_range: {
              min_inr: product.priceMinINR,
              max_inr: product.priceMaxINR
            },
            created_at: product.createdAt,
            updated_at: product.updatedAt
          }))
        })),

      payment_information: userRecord.memberships.flatMap(membership => 
        membership.org.payments.map(payment => ({
          payment_id: payment.id,
          amount: payment.amount,
          commission_amount: payment.commissionAmount,
          supplier_amount: payment.supplierAmount,
          status: payment.status,
          transfer_status: payment.transferStatus,
          created_at: payment.createdAt,
          captured_at: payment.capturedAt,
          transferred_at: payment.transferredAt,
          organization_role: membership.org.type === 'BUYER' ? 'buyer' : 'supplier'
        }))
      ),

      platform_usage: {
        account_created: userRecord.createdAt,
        last_login: userRecord.updatedAt, // Approximation
        total_organizations: userRecord.memberships.length,
        total_purchase_requests: userRecord.createdIntakes.length,
        total_transactions: userRecord.memberships.reduce(
          (sum, m) => sum + m.org.payments.length, 0
        )
      },

      data_processing_consent: {
        cookie_preferences: 'Available in browser localStorage as "cookie-consent"',
        marketing_consent: 'Not explicitly tracked - based on cookie preferences',
        data_retention_info: {
          account_data: '3 years after account deletion',
          transaction_data: '7 years (regulatory requirement)',
          communication_data: '2 years',
          analytics_data: 'Anonymized - retained indefinitely'
        }
      },

      legal_information: {
        terms_of_service_version: '1.0',
        privacy_policy_version: '1.0',
        dpdp_compliance_notice: 'This export complies with Digital Personal Data Protection Act, 2023',
        data_processing_lawful_basis: 'Consent and legitimate business interest',
        data_controller_contact: {
          email: 'privacy@irma.co.in',
          phone: '+91-1800-123-4567',
          address: 'Electronic City, Phase 1, Bangalore, Karnataka 560100, India'
        }
      }
    }

    // Set appropriate headers for file download
    const filename = `irma_data_export_${user.email}_${new Date().toISOString().split('T')[0]}.json`
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error exporting user data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to export user data',
        details: 'Please contact support if this issue persists'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { export_format = 'json' } = body

    // For now, only JSON export is supported
    // In the future, we could add CSV, XML, or other formats
    if (export_format !== 'json') {
      return NextResponse.json(
        { error: 'Only JSON export format is currently supported' },
        { status: 400 }
      )
    }

    // Log the export request for audit purposes
    console.log(`Data export requested by user: ${user.email} at ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      message: 'Data export request received',
      export_url: '/api/account/export',
      estimated_processing_time: '1-2 minutes',
      format: export_format
    })

  } catch (error) {
    console.error('Error processing export request:', error)
    return NextResponse.json(
      { error: 'Failed to process export request' },
      { status: 500 }
    )
  }
}