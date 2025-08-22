'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Settings, Cookie } from 'lucide-react'

interface CookiePreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    preferences: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000)
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent)
        setPreferences(saved)
        applyCookieSettings(saved)
      } catch (error) {
        console.error('Error parsing cookie preferences:', error)
      }
    }
  }, [])

  const applyCookieSettings = (prefs: CookiePreferences) => {
    // Apply analytics tracking
    if (prefs.analytics) {
      // Enable Google Analytics or other analytics tools
      console.log('Analytics cookies enabled')
      // gtag('config', 'GA_MEASUREMENT_ID')
    } else {
      // Disable analytics tracking
      console.log('Analytics cookies disabled')
    }

    // Apply marketing cookies
    if (prefs.marketing) {
      // Enable marketing/advertising cookies
      console.log('Marketing cookies enabled')
    } else {
      console.log('Marketing cookies disabled')
    }

    // Apply preference cookies
    if (prefs.preferences) {
      // Enable preference cookies
      console.log('Preference cookies enabled')
    } else {
      console.log('Preference cookies disabled')
    }
  }

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true
    }
    setPreferences(allAccepted)
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted))
    applyCookieSettings(allAccepted)
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptEssentialOnly = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false
    }
    setPreferences(essentialOnly)
    localStorage.setItem('cookie-consent', JSON.stringify(essentialOnly))
    applyCookieSettings(essentialOnly)
    setShowBanner(false)
    setShowSettings(false)
  }

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences))
    applyCookieSettings(preferences)
    setShowBanner(false)
    setShowSettings(false)
  }

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'essential') return // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl shadow-lg border border-gray-200">
        <CardContent className="p-6">
          {!showSettings ? (
            // Banner View
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-start flex-1">
                <Cookie className="h-6 w-6 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    We use cookies to improve your experience
                  </h3>
                  <p className="text-sm text-gray-600">
                    We use essential cookies for platform functionality and optional cookies 
                    for analytics and personalization. You can customize your preferences or 
                    accept our recommended settings.{' '}
                    <a 
                      href="/privacy" 
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn more
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptEssentialOnly}
                >
                  Essential Only
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Settings View
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Cookie Preferences
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Essential Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Required for the platform to function properly. These cannot be disabled.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Always Active</span>
                    <div className="w-11 h-6 bg-blue-600 rounded-full flex items-center">
                      <div className="w-5 h-5 bg-white rounded-full ml-1"></div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Help us understand how you use our platform to improve user experience.
                    </p>
                  </div>
                  <button
                    onClick={() => updatePreference('analytics', !preferences.analytics)}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors ${
                      preferences.analytics ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        preferences.analytics ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    ></div>
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Used to show you relevant advertisements and measure campaign effectiveness.
                    </p>
                  </div>
                  <button
                    onClick={() => updatePreference('marketing', !preferences.marketing)}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors ${
                      preferences.marketing ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        preferences.marketing ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    ></div>
                  </button>
                </div>

                {/* Preference Cookies */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Preference Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Remember your settings and preferences for a personalized experience.
                    </p>
                  </div>
                  <button
                    onClick={() => updatePreference('preferences', !preferences.preferences)}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors ${
                      preferences.preferences ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        preferences.preferences ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    ></div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={acceptEssentialOnly}
                >
                  Essential Only
                </Button>
                <Button
                  onClick={savePreferences}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Hook to check if specific cookie types are allowed
export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (consent) {
      try {
        setPreferences(JSON.parse(consent))
      } catch (error) {
        console.error('Error parsing cookie preferences:', error)
      }
    }
  }, [])

  return preferences
}