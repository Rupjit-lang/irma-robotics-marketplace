import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, Clock, DollarSign, Star, Shield } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, getProductCategoryName } from '@irma/lib'

const prisma = new PrismaClient()

interface QuotePageProps {
  params: {
    id: string
  }
}

export default async function QuotePage({ params }: QuotePageProps) {
  // Authenticate user
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Please sign in to view your quotes.</p>
            <Link href="/auth/signin">
              <Button className="mt-4">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch intake and matches
  const intake = await prisma.intake.findUnique({
    where: { id: params.id },
    include: {
      buyerOrg: true,
      createdBy: true,
      matches: {
        include: {
          product: {
            include: {
              org: true
            }
          }
        },
        orderBy: {
          fitScore: 'desc'
        }
      }
    }
  })

  if (!intake || intake.createdBy.email !== user.email) {
    notFound()
  }

  const intakeData = intake.data as any

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/buy" className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            New Search
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Your Equipment Matches</h1>
          <p className="text-gray-600 mt-2">
            Based on your requirements, here are the top 3 recommended solutions
          </p>
        </div>

        {/* Requirements Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Use Case:</span>
                <p className="text-gray-600">{intakeData.use_case}</p>
              </div>
              <div>
                <span className="font-medium">Payload:</span>
                <p className="text-gray-600">{intakeData.payload_kg} kg</p>
              </div>
              <div>
                <span className="font-medium">Throughput:</span>
                <p className="text-gray-600">{intakeData.throughput_per_hr}/hr</p>
              </div>
              <div>
                <span className="font-medium">Timeline:</span>
                <p className="text-gray-600">{intakeData.timeline_weeks} weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matches */}
        <div className="space-y-8">
          {intake.matches.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">No matches found for your requirements.</p>
                <Link href="/buy">
                  <Button>Try New Search</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            intake.matches.map((match, index) => (
              <Card key={match.id} className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        #{index + 1}
                      </Badge>
                      <div>
                        <CardTitle className="text-xl">{match.product.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <span className="mr-2">{getProductCategoryName(match.product.category)}</span>
                          <span className="text-gray-400">•</span>
                          <span className="ml-2">{match.product.org.name}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        <span className="text-lg font-bold">{match.fitScore}/100</span>
                      </div>
                      <p className="text-sm text-gray-600">Fit Score</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Why This Match */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Why This Match
                    </h4>
                    <ul className="space-y-1">
                      {match.why.map((reason, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Commercial Options */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                      Commercial Options
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Purchase */}
                      <div className="border rounded-lg p-4">
                        <h5 className="font-medium text-gray-900">Purchase (CAPEX)</h5>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {formatCurrency((match.commercials as any).purchase.priceINR)}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {(match.commercials as any).purchase.description}
                        </p>
                        <Link href={`/buy/payment/${params.id}?supplier=${match.product.orgId}&amount=${(match.commercials as any).purchase.priceINR}`}>
                          <Button size="sm" className="w-full mt-3">Buy Now</Button>
                        </Link>
                      </div>

                      {/* Lease */}
                      <div className="border rounded-lg p-4">
                        <h5 className="font-medium text-gray-900">Lease (OpEx)</h5>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {formatCurrency((match.commercials as any).lease.monthlyINR)}/mo
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {(match.commercials as any).lease.description}
                        </p>
                        <Button size="sm" variant="outline" className="w-full mt-3" disabled>Coming Soon</Button>
                      </div>

                      {/* Pilot */}
                      <div className="border rounded-lg p-4">
                        <h5 className="font-medium text-gray-900">Paid Pilot</h5>
                        <p className="text-2xl font-bold text-purple-600 mt-1">
                          {formatCurrency((match.commercials as any).pilot.costINR)}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {(match.commercials as any).pilot.description}
                        </p>
                        <Button size="sm" variant="outline" className="w-full mt-3" disabled>Coming Soon</Button>
                      </div>
                    </div>
                  </div>

                  {/* Delivery & SLA */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-orange-500" />
                        Delivery & Installation
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Installation Window:</span>
                          <span>{(match.deliveryInstall as any).installWindowWeeks} weeks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Training Hours:</span>
                          <span>{(match.deliveryInstall as any).trainingHours} hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Support Included:</span>
                          <span>{(match.deliveryInstall as any).supportIncluded ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-red-500" />
                        Service Level Agreement
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Uptime Guarantee:</span>
                          <span>{(match.sla as any).uptimeGuarantee}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Response Time:</span>
                          <span>{(match.sla as any).responseTimeHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Restore Time:</span>
                          <span>{(match.sla as any).restoreTimeHours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assumptions */}
                  {match.assumptions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Assumptions</h4>
                      <ul className="space-y-1">
                        {match.assumptions.map((assumption, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Link href={`/buy/payment/${params.id}?supplier=${match.product.orgId}&amount=${(match.commercials as any).purchase.priceINR}`} className="flex-1">
                      <Button className="w-full">Buy Now - {formatCurrency((match.commercials as any).purchase.priceINR)}</Button>
                    </Link>
                    <Button variant="outline" className="flex-1" disabled>Contact Supplier</Button>
                    <Button variant="outline" disabled>Save</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Need More Options */}
        <Card className="mt-8">
          <CardContent className="pt-6 text-center">
            <h3 className="font-medium text-gray-900 mb-2">Need more options?</h3>
            <p className="text-gray-600 mb-4">
              Adjust your requirements or talk to our experts for custom solutions.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/buy">
                <Button variant="outline">Modify Search</Button>
              </Link>
              <Button>Talk to Expert</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}