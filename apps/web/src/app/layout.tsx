import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CookieConsent } from '@/components/cookie-consent'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IRMA - Industrial Robotics Marketplace',
  description: 'B2B marketplace for industrial automation and robotics solutions in India',
  keywords: 'industrial robotics, automation, manufacturing, India, B2B marketplace',
  authors: [{ name: 'IRMA Team' }],
  openGraph: {
    title: 'IRMA - Industrial Robotics Marketplace',
    description: 'Connect with verified suppliers for industrial automation and robotics solutions',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>{children}</main>
        <CookieConsent />
      </body>
    </html>
  )
}