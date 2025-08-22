import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// KYC Schema matching the frontend form
const SupplierOnboardingSchema = z.object({
  // Organization Details
  organizationName: z.string().min(3, 'Organization name must be at least 3 characters'),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  
  // Business Information
  businessAddress: z.string().min(10, 'Business address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode'),
  
  // Contact Information
  contactPersonName: z.string().min(2, 'Contact person name is required'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  
  // Business Details
  yearsInBusiness: z.number().min(1, 'Years in business must be at least 1').max(100),
  employeeCount: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']),
  annualTurnover: z.enum(['under-1cr', '1-5cr', '5-25cr', '25-100cr', 'above-100cr']),
  
  // Banking Information
  bankName: z.string().min(2, 'Bank name is required'),
  accountNumber: z.string().min(10, 'Account number is required'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  
  // Capabilities
  manufacturingCapabilities: z.array(z.string()).min(1, 'Select at least one capability'),
  productCategories: z.array(z.string()).min(1, 'Select at least one category'),
  certifications: z.array(z.string()),
  
  // References
  clientReference1: z.string().min(2, 'At least one client reference is required'),
  clientReference2: z.string().optional(),
  clientReference3: z.string().optional(),
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
    const validatedData = SupplierOnboardingSchema.parse(body)

    // Check if user exists, create if not
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

    if (!userRecord) {
      userRecord = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: validatedData.contactPersonName,
          phone: validatedData.contactPhone,
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

    // Check if user already has a supplier organization
    const existingSupplierOrg = userRecord.memberships.find(m => m.org.type === 'SUPPLIER')?.org

    if (existingSupplierOrg) {
      return NextResponse.json({ 
        error: 'User already has a supplier organization' 
      }, { status: 400 })
    }

    // Check if GSTIN already exists
    const existingGstin = await prisma.org.findFirst({
      where: { gstin: validatedData.gstin }
    })

    if (existingGstin) {
      return NextResponse.json({ 
        error: 'GSTIN already registered with another organization' 
      }, { status: 400 })
    }

    // Create supplier organization
    const supplierOrg = await prisma.org.create({
      data: {
        name: validatedData.organizationName,
        gstin: validatedData.gstin,
        type: 'SUPPLIER',
        memberships: {
          create: {
            userId: userRecord.id,
            role: 'supplier_admin'
          }
        }
      }
    })

    // Prepare client references array
    const clientReferences = [validatedData.clientReference1]
    if (validatedData.clientReference2) clientReferences.push(validatedData.clientReference2)
    if (validatedData.clientReference3) clientReferences.push(validatedData.clientReference3)

    // Create KYC record with all the collected information
    const kycRecord = await prisma.kYC.create({
      data: {
        supplierOrgId: supplierOrg.id,
        status: 'PENDING',
        fields: {
          // Organization Details
          organizationName: validatedData.organizationName,
          gstin: validatedData.gstin,
          panNumber: validatedData.panNumber,
          
          // Business Information
          businessAddress: validatedData.businessAddress,
          city: validatedData.city,
          state: validatedData.state,
          pincode: validatedData.pincode,
          
          // Contact Information
          contactPersonName: validatedData.contactPersonName,
          contactEmail: validatedData.contactEmail,
          contactPhone: validatedData.contactPhone,
          
          // Business Details
          yearsInBusiness: validatedData.yearsInBusiness,
          employeeCount: validatedData.employeeCount,
          annualTurnover: validatedData.annualTurnover,
          
          // Banking Information
          bankName: validatedData.bankName,
          accountNumber: validatedData.accountNumber,
          ifscCode: validatedData.ifscCode,
          
          // Capabilities and Certifications
          manufacturingCapabilities: validatedData.manufacturingCapabilities,
          productCategories: validatedData.productCategories,
          certifications: validatedData.certifications,
          
          // Client References
          clientReferences: clientReferences,
          
          // Metadata
          submittedAt: new Date().toISOString(),
          submittedBy: userRecord.email,
        }
      }
    })

    // TODO: Send notification to admin team for KYC review
    // TODO: Send welcome email to supplier with next steps

    return NextResponse.json({ 
      kycId: kycRecord.id,
      orgId: supplierOrg.id,
      status: 'PENDING',
      message: 'Supplier onboarding application submitted successfully. You will be contacted within 2-3 business days for verification.'
    })

  } catch (error) {
    console.error('Error processing supplier onboarding:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}