import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Building2, 
  Users, 
  Shield, 
  CreditCard,
  Settings,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Edit,
  UserPlus,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

interface OrgPageProps {
  params: {
    orgId: string
  }
}

export default async function OrganizationPage({ params }: OrgPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get organization details and verify membership
  const org = await prisma.org.findUnique({
    where: { id: params.orgId },
    include: {
      kyc: true,
      memberships: {
        include: {
          user: true
        }
      },
      _count: {
        select: {
          products: {
            where: {
              deletedAt: null
            }
          },
          payments: true
        }
      }
    }
  })

  if (!org) {
    notFound()
  }

  // Check if user is a member of this organization
  const userMembership = org.memberships.find(m => m.user.email === user.email!)
  
  if (!userMembership) {
    redirect('/account')
  }

  // Check if user has admin privileges
  const isAdmin = userMembership.role.includes('admin')

  const getKycStatusInfo = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          badge: <Badge className="bg-green-100 text-green-800">Verified</Badge>,
          message: "KYC verification complete"
        }
      case 'PENDING':
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
          badge: <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>,
          message: "KYC verification under review"
        }
      case 'REJECTED':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          badge: <Badge variant="destructive">Rejected</Badge>,
          message: "KYC verification rejected. Please resubmit."
        }
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-600" />,
          badge: <Badge variant="secondary">Not Started</Badge>,
          message: "KYC verification required"
        }
    }
  }

  const kycStatus = getKycStatusInfo(org.kyc?.status)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant={org.type === 'BUYER' ? 'default' : 'secondary'}>
                  {org.type}
                </Badge>
                {kycStatus.badge}
                <span className="text-gray-600">GST: {org.gstin}</span>
              </div>
            </div>
            {isAdmin && (
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Organization
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Organization Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Organization Details
                </CardTitle>
                <CardDescription>
                  Basic information about your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      defaultValue={org.name}
                      disabled={!isAdmin}
                      className={!isAdmin ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstin">GST Number</Label>
                    <Input
                      id="gstin"
                      defaultValue={org.gstin}
                      disabled={!isAdmin}
                      className={!isAdmin ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your organization"
                    disabled={!isAdmin}
                    className={!isAdmin ? "bg-gray-50" : ""}
                  />
                </div>

                {isAdmin && (
                  <div className="flex justify-end">
                    <Button>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* KYC Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  KYC Verification
                </CardTitle>
                <CardDescription>
                  Identity verification status and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  {kycStatus.icon}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {kycStatus.message}
                    </h3>
                    {org.kyc?.verifiedAt && (
                      <p className="text-sm text-gray-600">
                        Verified on {org.kyc.verifiedAt.toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>

                {org.kyc?.status !== 'VERIFIED' && org.type === 'SUPPLIER' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-yellow-900">
                          KYC Verification Required
                        </h4>
                        <p className="text-sm text-yellow-800">
                          Complete KYC verification to receive payments and publish products.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href="/supplier/onboarding">
                        <Button size="sm">Complete KYC</Button>
                      </Link>
                    </div>
                  </div>
                )}

                {org.kyc?.status === 'VERIFIED' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-900">
                          Verification Complete
                        </h4>
                        <p className="text-sm text-green-800">
                          Your organization is verified and can access all platform features.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Team Members
                    </CardTitle>
                    <CardDescription>
                      Manage organization members and their permissions
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {org.memberships.map((membership) => (
                    <div 
                      key={membership.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {membership.user.name}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {membership.user.email}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {membership.role.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {isAdmin && membership.user.email !== user.email && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Settings (Suppliers only) */}
            {org.type === 'SUPPLIER' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your payment preferences and bank account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {org.razorpayAccountId ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-900">
                            Payment Account Connected
                          </h4>
                          <p className="text-sm text-green-800">
                            Your bank account is linked for automatic payouts
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <div>
                            <h4 className="font-medium text-yellow-900">
                              Bank Account Required
                            </h4>
                            <p className="text-sm text-yellow-800">
                              Link your bank account to receive payments
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <Button size="sm">Setup Account</Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Organization Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {org.type === 'SUPPLIER' && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {org._count.products}
                      </div>
                      <div className="text-sm text-gray-600">Active Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {org._count.payments}
                      </div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                  </>
                )}

                {org.type === 'BUYER' && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {org._count.payments}
                    </div>
                    <div className="text-sm text-gray-600">Orders Placed</div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    {org.type === 'SUPPLIER' && (
                      <>
                        <Link href="/supplier/catalog" className="block">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Catalog
                          </Button>
                        </Link>
                        <Link href="/supplier/payouts" className="block">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <CreditCard className="h-4 w-4 mr-2" />
                            View Payouts
                          </Button>
                        </Link>
                      </>
                    )}

                    {org.type === 'BUYER' && (
                      <>
                        <Link href="/buy" className="block">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Find Products
                          </Button>
                        </Link>
                        <Link href="/buy/orders" className="block">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            Order History
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Support</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h5 className="font-medium">Documentation</h5>
                      <p className="text-gray-600">
                        Setup guides and tutorials
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium">Contact Support</h5>
                      <p className="text-gray-600">
                        Get help from our team
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Get Help
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}