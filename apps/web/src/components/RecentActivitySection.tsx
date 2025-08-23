'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Clock, 
  ShoppingCart,
  Package,
  Activity
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: string
  productTitle: string
  timestamp: string
  productCategory: string
}

interface RecentActivitySectionProps {
  userId: string
  orgId: string
}

export function RecentActivitySection({ userId, orgId }: RecentActivitySectionProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/products/viewed?userId=${userId}&orgId=${orgId}&limit=5`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity')
      }
      
      const data = await response.json()
      setActivities(data.data.recentActivity || [])
    } catch (err) {
      console.error('Error fetching recent activity:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="h-4 w-4 text-blue-600" />
      case 'quote':
        return <Package className="h-4 w-4 text-green-600" />
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'view':
        return 'Viewed'
      case 'quote':
        return 'Requested Quote'
      case 'order':
        return 'Ordered'
      default:
        return 'Activity'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="bg-gray-200 h-8 w-8 rounded-full"></div>
                <div className="flex-1">
                  <div className="bg-gray-200 h-3 rounded mb-1"></div>
                  <div className="bg-gray-200 h-2 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getActivityLabel(activity.type)} {activity.productTitle}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.productCategory}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}