/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone for better compatibility
  output: 'standalone',
  trailingSlash: true,
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  // Optimize images
  images: {
    unoptimized: true
  },
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Fix hydration issues
  reactStrictMode: false,
  // Reduce memory usage
  experimental: {
    workerThreads: false,
    cpus: 1
  }
}

module.exports = nextConfig
