'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowRight, 
  RefreshCw,
  Eye,
  Filter,
  Package,
  Building2,
  MapPin
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, getProductCategoryName } from '@irma/lib'

interface ProductRecommendation {
  product: {
    id: string
    title: string
    category: string
    priceMinINR: number
    priceMaxINR: number
    leadTimeWeeks: number
    org: {
      name: string
      gstin: string | null
    }
  }
  score: number
  reason: string
  algorithm: string
}

interface RecommendationsSectionProps {
  userId: string
  orgId: string
  userName: string
}

export function RecommendationsSection({ userId, orgId, userName }: RecommendationsSectionProps) {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [algorithm, setAlgorithm] = useState<'hybrid' | 'browsing' | 'industry' | 'trending' | 'similar_buyers'>('hybrid')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [algorithm])

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/recommendations/for-you?algorithm=${algorithm}&limit=8`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }
      
      const data = await response.json()
      setRecommendations(data.data.recommendations || [])
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = async (productId: string) => {
    // Track recommendation click
    try {
      await fetch('/api/products/viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'recommendation_click',
          productId
        })
      })
    } catch (err) {
      console.error('Failed to track recommendation click:', err)
    }
  }

  const getAlgorithmIcon = (alg: string) => {
    switch (alg) {
      case 'browsing':
        return <Eye className="h-4 w-4" />
      case 'industry':
        return <Users className="h-4 w-4" />
      case 'trending':
        return <TrendingUp className="h-4 w-4" />
      case 'similar_buyers':
        return <Building2 className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const getAlgorithmLabel = (alg: string) => {
    switch (alg) {
      case 'browsing':
        return 'Based on browsing'
      case 'industry':
        return 'Industry popular'
      case 'trending':
        return 'Trending now'
      case 'similar_buyers':
        return 'Similar buyers'
      default:
        return 'Personalized'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Recommended for You
          </CardTitle>
          <CardDescription>Loading personalized recommendations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load recommendations</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchRecommendations} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Recommended for You
            </CardTitle>
            <CardDescription>
              {recommendations.length > 0 
                ? `${recommendations.length} products matched to your interests`
                : 'Discover equipment perfect for your needs'
              }
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {/* Algorithm Filter */}
            <div className="flex items-center space-x-1 border rounded-lg p-1">
              {['hybrid', 'browsing', 'industry', 'trending'].map((alg) => (
                <Button
                  key={alg}
                  size="sm"
                  variant={algorithm === alg ? 'default' : 'ghost'}
                  onClick={() => setAlgorithm(alg as any)}
                  className="text-xs px-2 py-1"
                >
                  {getAlgorithmIcon(alg)}
                  <span className="ml-1 hidden sm:inline">
                    {alg === 'hybrid' ? 'All' : 
                     alg === 'browsing' ? 'Browsing' :
                     alg === 'industry' ? 'Industry' : 'Trending'}
                  </span>
                </Button>
              ))}
            </div>
            <Button onClick={fetchRecommendations} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-600 mb-4">
              Start browsing products to get personalized recommendations
            </p>
            <Link href="/buy">
              <Button>
                Find Equipment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.product.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleProductClick(rec.product.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {getProductCategoryName(rec.product.category)}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        {getAlgorithmIcon(rec.algorithm)}
                        <span>{getAlgorithmLabel(rec.algorithm)}</span>
                      </div>
                    </div>
                    <Link 
                      href={`/products/${rec.product.category}/${rec.product.id}`}
                      className="block group-hover:text-blue-600 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {rec.product.title}
                      </h3>
                    </Link>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center space-x-1 text-sm text-orange-600">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{Math.round(rec.score * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="h-3 w-3 mr-1" />
                    <span className="truncate">{rec.product.org.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{rec.product.leadTimeWeeks} weeks</span>
                    </div>
                    <div className="font-medium text-gray-900">
                      {rec.product.priceMinINR === rec.product.priceMaxINR 
                        ? formatCurrency(rec.product.priceMinINR)
                        : `${formatCurrency(rec.product.priceMinINR)} - ${formatCurrency(rec.product.priceMaxINR)}`
                      }
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {rec.reason}
                  </p>
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/products/${rec.product.category}/${rec.product.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <Button size="sm" variant="outline" className="text-xs px-3 py-1">
                      Request Quote
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-6 text-center">
            <Link href={`/recommendations?algorithm=${algorithm}`}>
              <Button variant="outline">
                View More Recommendations
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}