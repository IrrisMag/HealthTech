/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_DATA_API_URL: process.env.NEXT_PUBLIC_DATA_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_FORECAST_API_URL: process.env.NEXT_PUBLIC_FORECAST_API_URL || 'http://localhost:8001',
    NEXT_PUBLIC_OPTIMIZATION_API_URL: process.env.NEXT_PUBLIC_OPTIMIZATION_API_URL || 'http://localhost:8002',
    NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8003',
  },
  async rewrites() {
    return [
      {
        source: '/api/data/:path*',
        destination: `${process.env.NEXT_PUBLIC_DATA_API_URL || 'http://localhost:8000'}/:path*`,
      },
      {
        source: '/api/forecast/:path*',
        destination: `${process.env.NEXT_PUBLIC_FORECAST_API_URL || 'http://localhost:8001'}/:path*`,
      },
      {
        source: '/api/optimization/:path*',
        destination: `${process.env.NEXT_PUBLIC_OPTIMIZATION_API_URL || 'http://localhost:8002'}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
