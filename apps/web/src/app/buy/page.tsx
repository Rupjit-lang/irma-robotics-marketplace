'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IntakeSchema, type IntakeData } from '@irma/lib'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'

export default function BuyPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IntakeData>({
    resolver: zodResolver(IntakeSchema),
  })

  const onSubmit = async (data: IntakeData) => {
    setLoading(true)
    try {
      // Submit intake to API
      const response = await fetch('/api/intakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const { intakeId } = await response.json()
        router.push(`/quote/${intakeId}`)
      } else {
        throw new Error('Failed to submit intake')
      }
    } catch (error) {
      console.error('Error submitting intake:', error)
      alert('Failed to submit requirements. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Find Industrial Equipment</h1>
          <p className="text-gray-600 mt-2">
            Tell us about your automation requirements and we'll find the perfect match
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Equipment Requirements
            </CardTitle>
            <CardDescription>
              Complete all required fields to get matched with suitable automation solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Required Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Use Case / Application <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('use_case')}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Describe what you need the equipment for (e.g., pick and place, welding, assembly line automation)"
                  />
                  {errors.use_case && (
                    <p className="mt-1 text-sm text-red-600">{errors.use_case.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payload Capacity (kg) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    {...register('payload_kg', { valueAsNumber: true })}
                    placeholder="e.g., 50.5"
                  />
                  {errors.payload_kg && (
                    <p className="mt-1 text-sm text-red-600">{errors.payload_kg.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Throughput (units/hour) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    {...register('throughput_per_hr', { valueAsNumber: true })}
                    placeholder="e.g., 120"
                  />
                  {errors.throughput_per_hr && (
                    <p className="mt-1 text-sm text-red-600">{errors.throughput_per_hr.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Integration Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('integration')}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select integration type</option>
                    <option value="PLC">PLC Integration</option>
                    <option value="Fieldbus">Fieldbus/Industrial Ethernet</option>
                    <option value="Standalone">Standalone Operation</option>
                    <option value="Other">Other/Custom</option>
                  </select>
                  {errors.integration && (
                    <p className="mt-1 text-sm text-red-600">{errors.integration.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline (weeks) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    {...register('timeline_weeks', { valueAsNumber: true })}
                    placeholder="e.g., 12"
                  />
                  {errors.timeline_weeks && (
                    <p className="mt-1 text-sm text-red-600">{errors.timeline_weeks.message}</p>
                  )}
                </div>
              </div>

              {/* Optional Fields */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <select
                      {...register('budget_range')}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select budget range</option>
                      <option value="under-10L">Under ₹10 Lakhs</option>
                      <option value="10L-25L">₹10-25 Lakhs</option>
                      <option value="25L-50L">₹25-50 Lakhs</option>
                      <option value="50L-1Cr">₹50 Lakhs - ₹1 Crore</option>
                      <option value="1Cr-5Cr">₹1-5 Crores</option>
                      <option value="above-5Cr">Above ₹5 Crores</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <Input
                      {...register('location')}
                      placeholder="City, State (e.g., Mumbai, Maharashtra)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Uptime (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      {...register('uptime_target_pct', { valueAsNumber: true })}
                      placeholder="e.g., 95.5"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 text-lg"
                >
                  {loading ? 'Processing...' : 'Find Equipment'}
                  <Search className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Not sure about your requirements? Our experts can help you define your automation needs.
            </p>
            <Button variant="outline" size="sm">
              Talk to an Expert
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}