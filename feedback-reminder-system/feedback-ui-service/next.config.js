/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Netlify
  output: 'export',
  trailingSlash: true,

  // Image optimization
  images: {
    unoptimized: true,
  },

  // Build configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Environment variables with correct production defaults
  env: {
    NEXT_PUBLIC_TRACK1_API_URL: process.env.NEXT_PUBLIC_TRACK1_API_URL || 'https://track1-production.up.railway.app',
    NEXT_PUBLIC_TRACK2_API_URL: process.env.NEXT_PUBLIC_TRACK2_API_URL || 'https://healthtech-production-4917.up.railway.app',
    NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://track1-production.up.railway.app',
    NEXT_PUBLIC_FEEDBACK_API_URL: process.env.NEXT_PUBLIC_FEEDBACK_API_URL || 'https://track1-production.up.railway.app',
    NEXT_PUBLIC_REMINDER_API_URL: process.env.NEXT_PUBLIC_REMINDER_API_URL || 'https://track1-production.up.railway.app',
    NEXT_PUBLIC_NOTIFICATION_API_URL: process.env.NEXT_PUBLIC_NOTIFICATION_API_URL || 'https://track1-production.up.railway.app',
    NEXT_PUBLIC_TRANSLATION_API_URL: process.env.NEXT_PUBLIC_TRANSLATION_API_URL || 'https://track1-production.up.railway.app',
    NEXT_PUBLIC_CHATBOT_API_URL: process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'https://healthtech-production-4917.up.railway.app',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'HealthTech Platform',
    NEXT_PUBLIC_HOSPITAL_NAME: process.env.NEXT_PUBLIC_HOSPITAL_NAME || 'Douala General Hospital',
  },
}

module.exports = nextConfig
