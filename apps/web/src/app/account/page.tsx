import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Shield, 
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Edit
} from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get user details and organization memberships
  const userRecord = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      memberships: {
        include: {
          org: {
            include: {
              kyc: true
            }
          }
        }
      }
    }
  })

  if (!userRecord) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your profile, organizations, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      defaultValue={userRecord.name}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={userRecord.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed after registration
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={userRecord.phone || ''}
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Organizations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Organizations
                </CardTitle>
                <CardDescription>
                  Organizations you are a member of
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userRecord.memberships.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No Organizations</h3>
                    <p className="text-gray-600 mb-4">
                      You are not a member of any organizations yet.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <Link href="/buy">
                        <Button variant="outline">Join as Buyer</Button>
                      </Link>
                      <Link href="/supplier/onboarding">
                        <Button>Join as Supplier</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userRecord.memberships.map((membership) => (
                      <div 
                        key={membership.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {membership.org.name}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={membership.org.type === 'BUYER' ? 'default' : 'secondary'}>
                                  {membership.org.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {membership.role.replace('_', ' ').toUpperCase()}
                                </Badge>
                                {membership.org.kyc?.status === 'VERIFIED' && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    KYC Verified
                                  </Badge>
                                )}
                              </div>
                              {membership.org.gstin && (
                                <p className="text-sm text-gray-600 mt-1">
                                  GST: {membership.org.gstin}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link href={`/account/org/${membership.orgId}`}>
                              <Button size="sm" variant="outline">
                                <Settings className="h-4 w-4 mr-2" />
                                Manage
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Login Sessions</h4>
                    <p className="text-sm text-gray-600">
                      Manage your active login sessions
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    View Sessions
                  </Button>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Change Password</h4>
                    <p className="text-sm text-gray-600">
                      Update your account password
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>

                <Button className="w-full justify-start" variant="outline" disabled>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </Button>

                <Button className="w-full justify-start" variant="outline" disabled>
                  <Mail className="h-4 w-4 mr-2" />
                  Email Preferences
                </Button>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Account Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      disabled
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Support</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h5 className="font-medium">Help Center</h5>
                      <p className="text-gray-600">
                        Find answers to common questions
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