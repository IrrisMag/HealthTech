'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardMetrics from '@/components/DashboardMetrics'
import BloodInventoryChart from '@/components/BloodInventoryChart'
import ForecastingChart from '@/components/ForecastingChart'
import OptimizationRecommendations from '@/components/OptimizationRecommendations'
import RealTimeAlerts from '@/components/RealTimeAlerts'
import { fetchDashboardData, triggerOptimization } from '@/lib/api'
import { DashboardData } from '@/types'
import { useAuth } from '@/components/auth/AuthProvider'

export default function Dashboard() {
  const { user } = useAuth()

  if (!user) {
    return null; // AuthProvider will handle redirect to login
  }
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [optimizing, setOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<any>(null)

  useEffect(() => {
    loadDashboardData()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setError(null)
      const dashboardData = await fetchDashboardData()
      setData(dashboardData)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleOptimization = async () => {
    try {
      setOptimizing(true)
      setError(null)
      console.log('🔄 Triggering real-time optimization...')

      const result = await triggerOptimization()
      setOptimizationResult(result)

      console.log('✅ Optimization completed:', result)

      // Refresh dashboard data to show new recommendations
      await loadDashboardData()

      // Show success message
      alert(`Optimization completed successfully! Generated ${result.optimization_results?.recommendations?.length || 0} new recommendations.`)
    } catch (err) {
      console.error('❌ Optimization failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to trigger optimization')
    } finally {
      setOptimizing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blood bank dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🩸 Blood Bank Dashboard
            </h1>
            <p className="text-gray-600">
              AI-Enhanced Stock Monitoring & Forecasting - Douala General Hospital
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleOptimization}
              disabled={optimizing}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                optimizing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {optimizing ? (
                <>
                  <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Optimizing...
                </>
              ) : (
                <>🚀 Run Optimization</>
              )}
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-900">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Real-time Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <RealTimeAlerts data={data} />
      </motion.div>

      {/* Dashboard Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <DashboardMetrics data={data} />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Blood Inventory Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <BloodInventoryChart data={data} />
        </motion.div>

        {/* Forecasting Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ForecastingChart data={data} />
        </motion.div>
      </div>

      {/* Optimization Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <OptimizationRecommendations data={data} />
      </motion.div>
    </div>
  )
}
