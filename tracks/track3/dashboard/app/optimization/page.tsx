'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Zap, TrendingUp, DollarSign, Truck, AlertTriangle } from 'lucide-react'
import OptimizationRecommendations from '@/components/OptimizationRecommendations'
import { fetchOptimizationRecommendations } from '@/lib/api'
import { OptimizationRecommendation } from '@/types'

export default function OptimizationPage() {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      setError(null)
      const data = await fetchOptimizationRecommendations()
      setRecommendations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecommendations = recommendations.filter(rec => 
    filter === 'all' || rec.priority_level === filter
  )

  const getRecommendationStats = () => {
    const totalCost = recommendations.reduce((sum, rec) => sum + rec.cost_estimate, 0)
    const totalUnits = recommendations.reduce((sum, rec) => sum + rec.recommended_order_quantity, 0)
    const criticalCount = recommendations.filter(rec => 
      rec.priority_level === 'emergency' || rec.priority_level === 'critical'
    ).length
    const avgConfidence = recommendations.length > 0 
      ? recommendations.reduce((sum, rec) => sum + rec.confidence_score, 0) / recommendations.length 
      : 0

    return { totalCost, totalUnits, criticalCount, avgConfidence }
  }

  const priorityFilters = ['all', 'emergency', 'critical', 'high', 'medium', 'low']

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading optimization recommendations...</p>
          </div>
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
              ⚡ Inventory Optimization
            </h1>
            <p className="text-gray-600">
              AI-powered optimization recommendations using PuLP/SciPy algorithms
            </p>
          </div>
          <button
            onClick={loadRecommendations}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Optimization Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        {(() => {
          const stats = getRecommendationStats()
          return (
            <>
              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Cost</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalCost.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Units</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUnits.toLocaleString()}</p>
                  </div>
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Critical Actions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.criticalCount}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Avg Confidence</p>
                    <p className="text-2xl font-bold text-gray-900">{(stats.avgConfidence * 100).toFixed(0)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </>
          )
        })()}
      </motion.div>

      {/* Priority Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex flex-wrap gap-2">
          {priorityFilters.map((priority) => (
            <button
              key={priority}
              onClick={() => setFilter(priority)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === priority
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Optimization Recommendations Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <OptimizationRecommendations 
          data={{ 
            recommendations: filteredRecommendations, 
            blood_types: [], 
            metrics: {} as any, 
            forecasts: [], 
            alerts: [] 
          }} 
        />
      </motion.div>

      {/* Optimization Algorithm Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Optimization Algorithm Details
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Linear Programming (PuLP)</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Minimizes total cost while meeting demand constraints</li>
              <li>• Considers safety stock levels and reorder points</li>
              <li>• Accounts for delivery schedules and lead times</li>
              <li>• Optimizes across all blood types simultaneously</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Scientific Computing (SciPy)</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Advanced optimization algorithms for complex scenarios</li>
              <li>• Handles non-linear constraints and objectives</li>
              <li>• Incorporates uncertainty and risk factors</li>
              <li>• Real-time optimization with dynamic parameters</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
