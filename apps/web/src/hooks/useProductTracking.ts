'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface TrackProductViewOptions {
  productId: string
  source?: string
  sessionId?: string
}

interface TrackInteractionOptions {
  productId?: string
  intakeId?: string
  interactionType: 'VIEW_PRODUCT' | 'SAVE_PRODUCT' | 'SHARE_PRODUCT' | 'REQUEST_QUOTE' | 'COMPLETE_PAYMENT' | 'DOWNLOAD_SPEC' | 'CONTACT_SUPPLIER'
  metadata?: Record<string, any>
}

export function useProductTracking() {
  const router = useRouter()

  // Generate or get session ID
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return undefined
    
    let sessionId = sessionStorage.getItem('irma_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('irma_session_id', sessionId)
    }
    return sessionId
  }, [])

  // Track product view
  const trackProductView = useCallback(async (options: TrackProductViewOptions) => {
    try {
      const sessionId = options.sessionId || getSessionId()
      
      await fetch('/api/products/viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'view',
          productId: options.productId,
          source: options.source || 'direct',
          sessionId
        })
      })
    } catch (error) {
      console.error('Failed to track product view:', error)
    }
  }, [getSessionId])

  // Track user interaction
  const trackInteraction = useCallback(async (options: TrackInteractionOptions) => {
    try {
      await fetch('/api/products/viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'interaction',
          ...options
        })
      })
    } catch (error) {
      console.error('Failed to track interaction:', error)
    }
  }, [])

  // Track recommendation click
  const trackRecommendationClick = useCallback(async (productId: string) => {
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
    } catch (error) {
      console.error('Failed to track recommendation click:', error)
    }
  }, [])

  // Auto-track page views for product pages
  const trackPageView = useCallback(async (pathname: string) => {
    try {
      // Extract product ID from URL patterns like /products/[category]/[productId]
      const productPageMatch = pathname.match(/^\/products\/[^\/]+\/([^\/]+)$/)
      if (productPageMatch) {
        const productId = productPageMatch[1]
        await trackProductView({
          productId,
          source: 'direct_navigation'
        })
      }
    } catch (error) {
      console.error('Failed to track page view:', error)
    }
  }, [trackProductView])

  return {
    trackProductView,
    trackInteraction,
    trackRecommendationClick,
    trackPageView,
    getSessionId
  }
}

// Hook for automatically tracking product page views
export function useAutoTrackProductView(productId?: string, source: string = 'direct') {
  const { trackProductView } = useProductTracking()

  useEffect(() => {
    if (productId) {
      // Add a small delay to ensure the component has mounted
      const timer = setTimeout(() => {
        trackProductView({ productId, source })
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [productId, source, trackProductView])
}

// Hook for tracking time spent on product pages
export function useProductViewDuration(productId?: string) {
  const { trackInteraction } = useProductTracking()

  useEffect(() => {
    if (!productId) return

    const startTime = Date.now()
    let hasTrackedEngagement = false

    // Track engagement after 30 seconds
    const engagementTimer = setTimeout(() => {
      trackInteraction({
        productId,
        interactionType: 'VIEW_PRODUCT',
        metadata: {
          engagement: 'deep_view',
          duration_seconds: 30
        }
      })
      hasTrackedEngagement = true
    }, 30000)

    // Track total view duration on page unload
    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - startTime) / 1000)
      
      if (duration >= 5) { // Only track if viewed for at least 5 seconds
        trackInteraction({
          productId,
          interactionType: 'VIEW_PRODUCT',
          metadata: {
            total_duration_seconds: duration,
            engaged_view: hasTrackedEngagement
          }
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearTimeout(engagementTimer)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      // Track duration when component unmounts (navigation)
      const duration = Math.round((Date.now() - startTime) / 1000)
      if (duration >= 5) {
        trackInteraction({
          productId,
          interactionType: 'VIEW_PRODUCT',
          metadata: {
            total_duration_seconds: duration,
            engaged_view: hasTrackedEngagement,
            exit_type: 'navigation'
          }
        })
      }
    }
  }, [productId, trackInteraction])
}