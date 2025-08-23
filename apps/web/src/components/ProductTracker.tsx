'use client'

import { ReactNode, useEffect } from 'react'
import { useAutoTrackProductView, useProductViewDuration } from '@/hooks/useProductTracking'

interface ProductTrackerProps {
  productId: string
  source?: string
  trackDuration?: boolean
  children: ReactNode
}

/**
 * ProductTracker component automatically tracks product views and user engagement
 * Wrap any product-related content with this component to enable tracking
 */
export function ProductTracker({ 
  productId, 
  source = 'direct', 
  trackDuration = true,
  children 
}: ProductTrackerProps) {
  // Track the initial product view
  useAutoTrackProductView(productId, source)
  
  // Track view duration if enabled
  useProductViewDuration(trackDuration ? productId : undefined)

  return <>{children}</>
}

interface ProductActionTrackerProps {
  productId?: string
  intakeId?: string
  children: (trackAction: (actionType: string, metadata?: any) => void) => ReactNode
}

/**
 * ProductActionTracker provides a render prop pattern for tracking specific user actions
 */
export function ProductActionTracker({ productId, intakeId, children }: ProductActionTrackerProps) {
  const trackAction = async (actionType: string, metadata: any = {}) => {
    try {
      const interactionTypeMap: Record<string, string> = {
        'save': 'SAVE_PRODUCT',
        'share': 'SHARE_PRODUCT',
        'quote': 'REQUEST_QUOTE',
        'download': 'DOWNLOAD_SPEC',
        'contact': 'CONTACT_SUPPLIER',
        'purchase': 'COMPLETE_PAYMENT'
      }

      const interactionType = interactionTypeMap[actionType] || 'VIEW_PRODUCT'

      await fetch('/api/products/viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'interaction',
          productId,
          intakeId,
          interactionType,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            action_type: actionType
          }
        })
      })
    } catch (error) {
      console.error(`Failed to track ${actionType} action:`, error)
    }
  }

  return <>{children(trackAction)}</>
}

interface RecommendationTrackerProps {
  algorithm?: string
  position?: number
  children: ReactNode
}

/**
 * RecommendationTracker wraps recommendation content to track clicks and impressions
 */
export function RecommendationTracker({ 
  algorithm = 'unknown', 
  position,
  children 
}: RecommendationTrackerProps) {
  useEffect(() => {
    // Track recommendation impression
    const trackImpression = async () => {
      try {
        await fetch('/api/analytics/recommendation-impression', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            algorithm,
            position,
            timestamp: new Date().toISOString()
          })
        })
      } catch (error) {
        console.error('Failed to track recommendation impression:', error)
      }
    }

    // Track impression with small delay to ensure visibility
    const timer = setTimeout(trackImpression, 1000)
    return () => clearTimeout(timer)
  }, [algorithm, position])

  return <>{children}</>
}

// Higher-order component for tracking product interactions
export function withProductTracking<P extends { productId?: string }>(
  Component: React.ComponentType<P>,
  defaultSource: string = 'component'
) {
  return function TrackedComponent(props: P) {
    const { productId, ...otherProps } = props

    if (!productId) {
      return <Component {...props} />
    }

    return (
      <ProductTracker productId={productId} source={defaultSource}>
        <Component {...props} />
      </ProductTracker>
    )
  }
}

// Component for tracking scroll-based engagement
interface ScrollTrackerProps {
  productId: string
  children: ReactNode
}

export function ScrollTracker({ productId, children }: ScrollTrackerProps) {
  useEffect(() => {
    if (!productId) return

    let scrollDepth = 0
    let hasTracked25 = false
    let hasTracked50 = false
    let hasTracked75 = false
    let hasTracked100 = false

    const trackScrollDepth = async (depth: number) => {
      try {
        await fetch('/api/products/viewed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'interaction',
            productId,
            interactionType: 'VIEW_PRODUCT',
            metadata: {
              scroll_depth: depth,
              engagement_type: 'scroll',
              timestamp: new Date().toISOString()
            }
          })
        })
      } catch (error) {
        console.error('Failed to track scroll depth:', error)
      }
    }

    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight
      const winHeight = window.innerHeight
      const scrollPercent = Math.round((scrollTop / (docHeight - winHeight)) * 100)

      scrollDepth = Math.max(scrollDepth, scrollPercent)

      // Track key scroll milestones
      if (scrollPercent >= 25 && !hasTracked25) {
        hasTracked25 = true
        trackScrollDepth(25)
      } else if (scrollPercent >= 50 && !hasTracked50) {
        hasTracked50 = true
        trackScrollDepth(50)
      } else if (scrollPercent >= 75 && !hasTracked75) {
        hasTracked75 = true
        trackScrollDepth(75)
      } else if (scrollPercent >= 100 && !hasTracked100) {
        hasTracked100 = true
        trackScrollDepth(100)
      }
    }

    // Throttle scroll events
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      
      // Track final scroll depth
      if (scrollDepth > 0) {
        trackScrollDepth(scrollDepth)
      }
    }
  }, [productId])

  return <>{children}</>
}