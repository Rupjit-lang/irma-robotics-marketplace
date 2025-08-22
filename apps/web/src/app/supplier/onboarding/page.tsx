'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Factory, Shield, Upload, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

// KYC Schema for supplier onboarding
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

type SupplierOnboardingData = z.infer<typeof SupplierOnboardingSchema>

const manufacturingCapabilities = [
  'Design & Engineering',
  'Manufacturing',
  'Assembly',
  'Testing & Validation',
  'Installation',
  'Maintenance & Support',
  'Training',
  'Custom Solutions'
]

const productCategories = [
  'AMR (Autonomous Mobile Robots)',
  'AGV (Automated Guided Vehicles)',
  '6-Axis Robot Arms',
  'SCARA Robots',
  'Conveyor Systems',
  'ASRS (Automated Storage)',
  'Vision Systems',
  'Other Automation Equipment'
]

const certificationOptions = [
  'ISO 9001:2015',
  'ISO 14001:2015',
  'ISO 45001:2018',
  'CE Marking',
  'UL Listed',
  'FCC Certified',
  'BIS Standards',
  'DGFT Certificate',
  'NSIC Registration'
]

export default function SupplierOnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const router = useRouter()
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SupplierOnboardingData>({
    resolver: zodResolver(SupplierOnboardingSchema),
    defaultValues: {
      manufacturingCapabilities: [],
      productCategories: [],
      certifications: []
    }
  })

  const selectedCapabilities = watch('manufacturingCapabilities') || []
  const selectedCategories = watch('productCategories') || []
  const selectedCertifications = watch('certifications') || []

  const handleCapabilityToggle = (capability: string) => {
    const current = selectedCapabilities
    const updated = current.includes(capability)
      ? current.filter(c => c !== capability)
      : [...current, capability]
    setValue('manufacturingCapabilities', updated)
  }

  const handleCategoryToggle = (category: string) => {
    const current = selectedCategories
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category]
    setValue('productCategories', updated)
  }

  const handleCertificationToggle = (certification: string) => {
    const current = selectedCertifications
    const updated = current.includes(certification)
      ? current.filter(c => c !== certification)
      : [...current, certification]
    setValue('certifications', updated)
  }

  const onSubmit = async (data: SupplierOnboardingData) => {
    setLoading(true)
    try {
      // Submit KYC data to API
      const response = await fetch('/api/supplier/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/supplier/onboarding/success?kycId=${result.kycId}`)
      } else {
        throw new Error('Failed to submit onboarding application')
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Onboarding</h1>
          <p className="text-gray-600 mt-2">
            Join IRMA marketplace and connect with verified buyers across India
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Organization</span>
            <span>Business</span>
            <span>Capabilities</span>
            <span>Review</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Organization Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Factory className="h-5 w-5 mr-2" />
                  Organization Details
                </CardTitle>
                <CardDescription>
                  Basic information about your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('organizationName')}
                      placeholder="e.g., Robotech India Pvt Ltd"
                    />
                    {errors.organizationName && (
                      <p className="mt-1 text-sm text-red-600">{errors.organizationName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GSTIN <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('gstin')}
                      placeholder="e.g., 29AABCU9603R1ZX"
                      style={{ textTransform: 'uppercase' }}
                    />
                    {errors.gstin && (
                      <p className="mt-1 text-sm text-red-600">{errors.gstin.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('panNumber')}
                      placeholder="e.g., AABCU9603R"
                      style={{ textTransform: 'uppercase' }}
                    />
                    {errors.panNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.panNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('contactPersonName')}
                      placeholder="e.g., Rajesh Kumar"
                    />
                    {errors.contactPersonName && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactPersonName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('contactEmail')}
                      type="email"
                      placeholder="e.g., admin@robotech.in"
                    />
                    {errors.contactEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('contactPhone')}
                      placeholder="e.g., +91-9123456789"
                    />
                    {errors.contactPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Business Information */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Details about your business operations and location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('businessAddress')}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Complete business address"
                  />
                  {errors.businessAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessAddress.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input {...register('city')} placeholder="e.g., Pune" />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Input {...register('state')} placeholder="e.g., Maharashtra" />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <Input {...register('pincode')} placeholder="e.g., 411001" />
                    {errors.pincode && (
                      <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Business <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('yearsInBusiness', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      placeholder="e.g., 8"
                    />
                    {errors.yearsInBusiness && (
                      <p className="mt-1 text-sm text-red-600">{errors.yearsInBusiness.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Count <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('employeeCount')}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select range</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                    {errors.employeeCount && (
                      <p className="mt-1 text-sm text-red-600">{errors.employeeCount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Turnover <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('annualTurnover')}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select range</option>
                      <option value="under-1cr">Under ₹1 Crore</option>
                      <option value="1-5cr">₹1-5 Crores</option>
                      <option value="5-25cr">₹5-25 Crores</option>
                      <option value="25-100cr">₹25-100 Crores</option>
                      <option value="above-100cr">Above ₹100 Crores</option>
                    </select>
                    {errors.annualTurnover && (
                      <p className="mt-1 text-sm text-red-600">{errors.annualTurnover.message}</p>
                    )}
                  </div>
                </div>

                {/* Banking Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Banking Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <Input {...register('bankName')} placeholder="e.g., HDFC Bank" />
                      {errors.bankName && (
                        <p className="mt-1 text-sm text-red-600">{errors.bankName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <Input {...register('accountNumber')} placeholder="Account number" />
                      {errors.accountNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.accountNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...register('ifscCode')}
                        placeholder="e.g., HDFC0001234"
                        style={{ textTransform: 'uppercase' }}
                      />
                      {errors.ifscCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.ifscCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Capabilities */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Capabilities & Certifications</CardTitle>
                <CardDescription>
                  Tell us about your manufacturing capabilities and certifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Manufacturing Capabilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Manufacturing Capabilities <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {manufacturingCapabilities.map((capability) => (
                      <label key={capability} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCapabilities.includes(capability)}
                          onChange={() => handleCapabilityToggle(capability)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{capability}</span>
                      </label>
                    ))}
                  </div>
                  {errors.manufacturingCapabilities && (
                    <p className="mt-1 text-sm text-red-600">{errors.manufacturingCapabilities.message}</p>
                  )}
                </div>

                {/* Product Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Product Categories <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {productCategories.map((category) => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                  {errors.productCategories && (
                    <p className="mt-1 text-sm text-red-600">{errors.productCategories.message}</p>
                  )}
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Certifications
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {certificationOptions.map((certification) => (
                      <label key={certification} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCertifications.includes(certification)}
                          onChange={() => handleCertificationToggle(certification)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{certification}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Client References */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Client References</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Reference 1 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...register('clientReference1')}
                        placeholder="e.g., Tata Motors Ltd"
                      />
                      {errors.clientReference1 && (
                        <p className="mt-1 text-sm text-red-600">{errors.clientReference1.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Reference 2
                      </label>
                      <Input
                        {...register('clientReference2')}
                        placeholder="e.g., Mahindra & Mahindra"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Reference 3
                      </label>
                      <Input
                        {...register('clientReference3')}
                        placeholder="e.g., Bajaj Auto Ltd"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Review Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Review & Submit
                </CardTitle>
                <CardDescription>
                  Please review your information before submitting for KYC verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">What happens after submission?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Our team will review your application within 2-3 business days</li>
                    <li>• We may contact you for additional documentation or clarification</li>
                    <li>• Once verified, you can start listing products and receiving buyer inquiries</li>
                    <li>• You'll be able to receive split payouts via Razorpay Route</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">Required Documents (upload after submission)</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• GST Certificate</li>
                    <li>• PAN Card</li>
                    <li>• Bank Account Proof</li>
                    <li>• Business Registration Certificate</li>
                    <li>• Certification Documents (if applicable)</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="submit" disabled={loading} className="px-8">
                    {loading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  )
}