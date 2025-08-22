import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Upload, FileText, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

interface SuccessPageProps {
  searchParams: {
    kycId?: string
  }
}

function SuccessContent({ searchParams }: SuccessPageProps) {
  const kycId = searchParams.kycId

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Application Submitted Successfully!</h1>
          <p className="text-gray-600 mt-2">
            Thank you for your interest in joining the IRMA marketplace
          </p>
          {kycId && (
            <p className="text-sm text-gray-500 mt-1">
              Reference ID: <span className="font-mono">{kycId}</span>
            </p>
          )}
        </div>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              What Happens Next?
            </CardTitle>
            <CardDescription>
              Here's what you can expect in the coming days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Initial Review (1-2 days)</h3>
                  <p className="text-sm text-gray-600">
                    Our team will review your application and may contact you for clarification
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Document Upload (2-3 days)</h3>
                  <p className="text-sm text-gray-600">
                    You'll receive an email with instructions to upload required documents
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">KYC Verification (3-5 days)</h3>
                  <p className="text-sm text-gray-600">
                    Complete verification process including document validation
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Onboarding Complete</h3>
                  <p className="text-sm text-gray-600">
                    Start listing products and receiving buyer inquiries
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Documents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2 text-orange-600" />
              Required Documents
            </CardTitle>
            <CardDescription>
              Prepare these documents for the next step
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Business Documents</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    GST Registration Certificate
                  </li>
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    PAN Card (Organization)
                  </li>
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Business Registration Certificate
                  </li>
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Bank Account Proof
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Additional Documents</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    ISO/Quality Certifications
                  </li>
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Product Catalogs/Brochures
                  </li>
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Client Reference Letters
                  </li>
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Factory/Facility Photos
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> All documents should be clear, legible scans or photos. 
                File formats accepted: PDF, JPG, PNG (max 5MB per file)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Our team is here to assist you with the onboarding process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Email Support</h4>
                  <p className="text-sm text-gray-600">supplier-support@irma.marketplace</p>
                  <p className="text-xs text-gray-500">Response within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Phone Support</h4>
                  <p className="text-sm text-gray-600">+91-80-4567-8900</p>
                  <p className="text-xs text-gray-500">Mon-Fri, 9 AM - 6 PM IST</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/supplier/documents">
              <Button className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents Now
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="outline" className="w-full sm:w-auto">
                View Application Status
              </Button>
            </Link>
          </div>
          
          <Link href="/" className="block">
            <Button variant="ghost" className="w-full sm:w-auto">
              Return to Homepage
            </Button>
          </Link>
        </div>

        {/* Benefits Reminder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Benefits of Joining IRMA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900">Verified Buyers</h4>
                <p className="text-sm text-gray-600">Connect with pre-qualified industrial buyers</p>
              </div>

              <div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900">Smart Matching</h4>
                <p className="text-sm text-gray-600">AI-powered matching with relevant opportunities</p>
              </div>

              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900">Secure Payments</h4>
                <p className="text-sm text-gray-600">Automated split payouts via Razorpay Route</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SupplierOnboardingSuccessPage({ searchParams }: SuccessPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  )
}