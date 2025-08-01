'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react'
import ForecastingChart from '@/components/ForecastingChart'
import { fetchForecasts } from '@/lib/api'
import { ForecastData } from '@/types'

export default function ForecastingPage() {
  const [forecasts, setForecasts] = useState<ForecastData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBloodType, setSelectedBloodType] = useState<string>('O+')
  const [forecastDays, setForecastDays] = useState<number>(7)

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  useEffect(() => {
    loadForecasts()
  }, [forecastDays])

  const loadForecasts = async () => {
    try {
      setError(null)
      const data = await fetchForecasts(forecastDays)
      setForecasts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forecasts')
    } finally {
      setLoading(false)
    }
  }

  const selectedForecasts = forecasts.filter(f => f.blood_type === selectedBloodType)

  const getBloodTypeStats = (bloodType: string) => {
    const typeForecasts = forecasts.filter(f => f.blood_type === bloodType)
    if (typeForecasts.length === 0) return null

    const totalDemand = typeForecasts.reduce((sum, f) => sum + f.predicted_demand, 0)
    const avgDemand = totalDemand / typeForecasts.length
    const maxDemand = Math.max(...typeForecasts.map(f => f.predicted_demand))
    const minDemand = Math.min(...typeForecasts.map(f => f.predicted_demand))

    return { totalDemand, avgDemand, maxDemand, minDemand }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading forecasts...</p>
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
              📈 Demand Forecasting
            </h1>
            <p className="text-gray-600">
              AI-powered blood demand predictions using ARIMA/XGBoost models
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={forecastDays}
              onChange={(e) => setForecastDays(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
            <button
              onClick={loadForecasts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Blood Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-wrap gap-2">
          {bloodTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedBloodType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedBloodType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Forecast Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        {(() => {
          const stats = getBloodTypeStats(selectedBloodType)
          if (!stats) return null

          return (
            <>
              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Demand</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalDemand.toFixed(0)}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Avg Daily</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgDemand.toFixed(1)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Peak Demand</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.maxDemand.toFixed(1)}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Min Demand</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.minDemand.toFixed(1)}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </>
          )
        })()}
      </motion.div>

      {/* Forecasting Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <ForecastingChart data={{ forecasts, blood_types: [], metrics: {} as any, recommendations: [], alerts: [] }} />
      </motion.div>

      {/* Forecast Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            Detailed Forecast - {selectedBloodType}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Demand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lower Bound</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upper Bound</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedForecasts.map((forecast, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(forecast.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {forecast.predicted_demand.toFixed(1)} units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {forecast.confidence_interval_lower.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {forecast.confidence_interval_upper.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      95%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
