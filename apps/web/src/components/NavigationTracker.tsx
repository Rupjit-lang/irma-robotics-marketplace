'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useProductTracking } from '@/hooks/useProductTracking'

/**
 * NavigationTracker automatically tracks page navigation and product page visits
 * This should be placed in the root layout or a high-level component
 */
export function NavigationTracker() {
  const pathname = usePathname()
  const { trackPageView } = useProductTracking()

  useEffect(() => {
    // Track page view with current pathname
    trackPageView(pathname)
  }, [pathname, trackPageView])

  // This component doesn't render anything
  return null
}

/**
 * RouteChangeTracker tracks route changes and page analytics
 */
export function RouteChangeTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Track general page analytics
    const trackPageAnalytics = async () => {
      try {
        // Extract page type from pathname
        let pageType = 'unknown'
        let category = null
        let productId = null

        if (pathname === '/') {
          pageType = 'home'
        } else if (pathname === '/buy') {
          pageType = 'search'
        } else if (pathname.startsWith('/buy/dashboard')) {
          pageType = 'dashboard'
        } else if (pathname.startsWith('/quote/')) {
          pageType = 'quote'
        } else if (pathname.startsWith('/buy/payment/')) {
          pageType = 'payment'
        } else if (pathname.startsWith('/buy/order/')) {
          pageType = 'order'
        } else if (pathname.startsWith('/products/')) {
          const segments = pathname.split('/')
          if (segments.length >= 3) {
            pageType = 'product_category'
            category = segments[2]
            if (segments.length >= 4) {
              pageType = 'product_detail'
              productId = segments[3]
            }
          }
        } else if (pathname.startsWith('/supplier/')) {
          pageType = 'supplier'
        }

        // Send analytics data (you could extend this to send to analytics services)
        await fetch('/api/analytics/page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pathname,
            pageType,
            category,
            productId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer || null
          })
        }).catch(error => {
          // Silently handle analytics errors
          console.debug('Analytics tracking failed:', error)
        })

      } catch (error) {
        console.debug('Failed to track page analytics:', error)
      }
    }

    // Track with a small delay to ensure page is loaded
    const timer = setTimeout(trackPageAnalytics, 100)
    return () => clearTimeout(timer)
  }, [pathname])

  return null
}

/**
 * SearchTracker tracks search-related activities
 */
export function SearchTracker() {
  useEffect(() => {
    // Track search queries from URL parameters
    const trackSearch = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const query = urlParams.get('q') || urlParams.get('search')
        const category = urlParams.get('category')
        const filters = {}

        // Collect filter parameters
        for (const [key, value] of urlParams.entries()) {
          if (key.startsWith('filter_') || 
              ['budget', 'location', 'timeline', 'payload'].includes(key)) {
            filters[key] = value
          }
        }

        if (query || category || Object.keys(filters).length > 0) {
          await fetch('/api/analytics/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query,
              category,
              filters,
              pathname: window.location.pathname,
              timestamp: new Date().toISOString()
            })
          }).catch(error => {
            console.debug('Search tracking failed:', error)
          })
        }
      } catch (error) {
        console.debug('Failed to track search:', error)
      }
    }

    trackSearch()
  }, [])

  return null
}

/**
 * PerformanceTracker tracks page load performance metrics
 */
export function PerformanceTracker() {
  useEffect(() => {
    // Track performance metrics
    const trackPerformance = async () => {
      try {
        // Wait for page to fully load
        if (document.readyState !== 'complete') {
          window.addEventListener('load', trackPerformance, { once: true })
          return
        }

        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (!navigation) return

        const metrics = {
          pathname: window.location.pathname,
          timestamp: new Date().toISOString(),
          loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
          firstPaint: 0,
          firstContentfulPaint: 0,
          timeToInteractive: Math.round(navigation.domInteractive - navigation.fetchStart)
        }

        // Get paint metrics if available
        const paintEntries = performance.getEntriesByType('paint')
        paintEntries.forEach(entry => {
          if (entry.name === 'first-paint') {
            metrics.firstPaint = Math.round(entry.startTime)
          } else if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = Math.round(entry.startTime)
          }
        })

        // Only track if metrics are reasonable (not zero and not too high)
        if (metrics.loadTime > 0 && metrics.loadTime < 60000) {
          await fetch('/api/analytics/performance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(metrics)
          }).catch(error => {
            console.debug('Performance tracking failed:', error)
          })
        }

      } catch (error) {
        console.debug('Failed to track performance:', error)
      }
    }

    trackPerformance()
  }, [])

  return null
}

/**
 * ComprehensiveTracker combines all tracking components
 * Use this in your root layout for complete tracking coverage
 */
export function ComprehensiveTracker() {
  return (
    <>
      <NavigationTracker />
      <RouteChangeTracker />
      <SearchTracker />
      <PerformanceTracker />
    </>
  )
}