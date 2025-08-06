import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Blood Bank Dashboard - Douala General Hospital',
  description: 'AI-Enhanced Blood Bank Stock Monitoring and Forecasting System - Track 3',
  keywords: 'blood bank, inventory management, forecasting, healthcare, AI, Douala General Hospital',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="pt-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
