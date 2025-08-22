import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Eye, Lock, Users, FileText, Clock } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - IRMA Marketplace',
  description: 'Learn how IRMA protects your personal data in compliance with the Digital Personal Data Protection Act, 2023 and international privacy standards.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">
            Last updated: January 1, 2024 | Effective from: January 1, 2024
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              🛡️ This policy complies with the Digital Personal Data Protection Act, 2023 (DPDP Act) 
              and other applicable privacy laws in India and internationally.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                IRMA Marketplace ("we," "our," or "us") is committed to protecting your privacy and personal data. 
                This Privacy Policy explains how we collect, use, process, and protect your personal information 
                when you use our industrial robotics marketplace platform.
              </p>
              <p>
                By using our services, you consent to the collection and use of your information as described 
                in this policy, in accordance with the Digital Personal Data Protection Act, 2023.
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                What Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Name, email address, and phone number</li>
                  <li>Company/organization details and GST information</li>
                  <li>Job title and business contact information</li>
                  <li>Profile picture (optional)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Business Information</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Organization details and business registration information</li>
                  <li>Financial information for payment processing</li>
                  <li>KYC documents for supplier verification</li>
                  <li>Product catalogs and technical specifications</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Usage Information</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Platform usage patterns and preferences</li>
                  <li>Search queries and matching results</li>
                  <li>Transaction history and payment information</li>
                  <li>Communication records and support interactions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Technical Information</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>IP address, browser type, and device information</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log files and error reports</li>
                  <li>Session data and authentication tokens</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Service Provision</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Matching buyers with suitable suppliers</li>
                  <li>Processing transactions and payments</li>
                  <li>Facilitating communication between parties</li>
                  <li>Providing customer support</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Platform Improvement</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Analyzing usage patterns to improve our algorithms</li>
                  <li>Enhancing user experience and platform features</li>
                  <li>Conducting research and development</li>
                  <li>Generating anonymized analytics and insights</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Legal and Safety</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Complying with legal obligations and regulations</li>
                  <li>Preventing fraud and ensuring platform security</li>
                  <li>Enforcing our terms of service</li>
                  <li>Protecting our rights and interests</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                How We Protect Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Technical Safeguards</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>256-bit SSL encryption for data transmission</li>
                  <li>Encrypted storage of sensitive information</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Multi-factor authentication for admin access</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Administrative Safeguards</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Role-based access control systems</li>
                  <li>Regular employee privacy and security training</li>
                  <li>Data minimization and retention policies</li>
                  <li>Incident response and breach notification procedures</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Physical Safeguards</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Secure data centers with 24/7 monitoring</li>
                  <li>Restricted physical access to servers</li>
                  <li>Environmental controls and backup systems</li>
                  <li>Secure disposal of hardware and data</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Your Rights Under DPDP Act
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Under the Digital Personal Data Protection Act, 2023, you have the following rights:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Right to Access</h4>
                  <p className="text-sm text-blue-800">
                    Request a copy of your personal data we hold
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Right to Correction</h4>
                  <p className="text-sm text-green-800">
                    Update or correct inaccurate personal information
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Right to Erasure</h4>
                  <p className="text-sm text-yellow-800">
                    Request deletion of your personal data
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Right to Grievance</h4>
                  <p className="text-sm text-purple-800">
                    File complaints about data processing
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">How to Exercise Your Rights</h4>
                <p className="text-gray-700 text-sm">
                  To exercise any of these rights, please contact our Data Protection Officer at{' '}
                  <a href="mailto:privacy@irma.co.in" className="text-blue-600 hover:underline">
                    privacy@irma.co.in
                  </a>{' '}
                  or use the settings in your account dashboard.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>When We Share Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">With Your Consent</h4>
                <p className="text-gray-700">
                  We share contact information between buyers and suppliers when a match is made 
                  and payment is confirmed, with explicit consent from both parties.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Service Providers</h4>
                <p className="text-gray-700">
                  We work with trusted third-party service providers for payment processing, 
                  email delivery, and analytics, under strict confidentiality agreements.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Legal Requirements</h4>
                <p className="text-gray-700">
                  We may disclose information when required by law, court order, or government 
                  regulation, or to protect our rights and safety.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Account Data</h4>
                  <p className="text-sm text-gray-700">
                    Retained while your account is active and for 3 years after account deletion 
                    for legal and business purposes.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Transaction Data</h4>
                  <p className="text-sm text-gray-700">
                    Retained for 7 years as required by financial regulations and tax laws in India.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Communication Data</h4>
                  <p className="text-sm text-gray-700">
                    Support communications retained for 2 years, marketing communications until you opt out.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Analytics Data</h4>
                  <p className="text-sm text-gray-700">
                    Anonymized usage data may be retained indefinitely for business intelligence purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We use cookies and similar technologies to improve your experience:
              </p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                  <p className="text-sm text-gray-700">
                    Required for platform functionality, authentication, and security.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                  <p className="text-sm text-gray-700">
                    Help us understand how you use our platform to improve user experience.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Preference Cookies</h4>
                  <p className="text-sm text-gray-700">
                    Remember your settings and preferences for a personalized experience.
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                You can manage cookie preferences in your browser settings or through our 
                cookie management tool available in your account settings.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Protection Officer</h4>
                  <p className="text-gray-700">
                    Email: <a href="mailto:privacy@irma.co.in" className="text-blue-600 hover:underline">
                      privacy@irma.co.in
                    </a>
                  </p>
                  <p className="text-gray-700">
                    Phone: +91-1800-123-4567 (Mon-Fri, 9 AM - 6 PM IST)
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Business Address</h4>
                  <p className="text-gray-700">
                    IRMA Marketplace Pvt Ltd<br />
                    Electronic City, Phase 1<br />
                    Bangalore, Karnataka 560100<br />
                    India
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Link href="/account">
                    <Button>Manage Privacy Settings</Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline">Contact Support</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time to reflect changes in our 
                practices or legal requirements. We will notify you of any material changes 
                via email or through our platform.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This policy is effective as of January 1, 2024, and complies with the 
                Digital Personal Data Protection Act, 2023.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}