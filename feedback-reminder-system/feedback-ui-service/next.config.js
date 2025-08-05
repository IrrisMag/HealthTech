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

  // Environment variables with production defaults
  env: {
    NEXT_PUBLIC_TRACK1_API_URL: process.env.NEXT_PUBLIC_TRACK1_API_URL || 'https://track1-production.up.railway.app',
    NEXT_PUBLIC_TRACK2_API_URL: process.env.NEXT_PUBLIC_TRACK2_API_URL || 'https://healthtech-production-4917.up.railway.app',
    NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://track1-production.up.railway.app',
    NEXT_PUBLIC_CHATBOT_API_URL: process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'https://healthtech-production-4917.up.railway.app',
  },

  // Note: rewrites() is not compatible with static export
  // API calls will be made directly to the backend URLs
}

module.exports = nextConfig
