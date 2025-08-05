'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Truck,
  Eye,
  Play
} from 'lucide-react'
import { DashboardData } from '@/types'
import { executeOptimizationOrder } from '@/lib/api'

interface OptimizationRecommendationsProps {
  data: DashboardData | null
}

export default function OptimizationRecommendations({ data }: OptimizationRecommendationsProps) {
  const [executingOrders, setExecutingOrders] = useState<Set<string>>(new Set())
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null)

  const handleViewDetails = (recommendation: any) => {
    setSelectedRecommendation(recommendation)
  }

  const handleExecuteOrder = async (recommendation: any) => {
    if (executingOrders.has(recommendation.id)) return

    setExecutingOrders(prev => new Set(prev).add(recommendation.id))

    try {
      await executeOptimizationOrder(recommendation.id)
      alert(`Order executed successfully for ${recommendation.blood_type} - ${recommendation.action}`)
    } catch (error) {
      alert(`Failed to execute order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExecutingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(recommendation.id)
        return newSet
      })
    }
  }

  if (!data) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'emergency':
      case 'critical':
        return AlertTriangle
      case 'high':
        return Clock
      default:
        return CheckCircle
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-green-600 bg-green-100'
    }
  }

  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency_order':
        return AlertTriangle
      case 'routine_order':
        return Truck
      default:
        return CheckCircle
    }
  }

  const getBloodTypeColor = (bloodType: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-500',
      'A-': 'bg-red-600',
      'B+': 'bg-blue-500',
      'B-': 'bg-blue-600',
      'AB+': 'bg-purple-500',
      'AB-': 'bg-purple-600',
      'O+': 'bg-orange-500',
      'O-': 'bg-orange-600',
    }
    return colors[bloodType] || 'bg-gray-500'
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">
          AI Optimization Recommendations
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Real-time</span>
        </div>
      </div>

      {data.recommendations.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">All Good!</h4>
          <p className="text-gray-600">No optimization recommendations at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.recommendations.map((rec, index) => {
            const PriorityIcon = getPriorityIcon(rec.priority_level)
            const TypeIcon = getRecommendationTypeIcon(rec.recommendation_type)
            
            return (
              <motion.div
                key={rec.recommendation_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(rec.priority_level)}`}>
                      <PriorityIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getBloodTypeColor(rec.blood_type)}`}>
                          {rec.blood_type}
                        </span>
                        <span className={`status-indicator ${
                          rec.priority_level === 'emergency' || rec.priority_level === 'critical' 
                            ? 'status-critical' 
                            : rec.priority_level === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'status-adequate'
                        }`}>
                          {rec.priority_level.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900">
                        {rec.recommendation_type.replace('_', ' ').toUpperCase()}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Confidence</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {(rec.confidence_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{rec.reasoning}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Order Quantity</div>
                      <div className="font-medium">{rec.recommended_order_quantity} units</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Estimated Cost</div>
                      <div className="font-medium">${rec.cost_estimate.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Expected Delivery</div>
                      <div className="font-medium">
                        {new Date(rec.expected_delivery_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Generated {new Date(rec.created_at).toLocaleString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(rec)}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center space-x-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => handleExecuteOrder(rec)}
                      disabled={executingOrders.has(rec.id)}
                      className={`px-3 py-1 text-xs font-medium text-white rounded transition-colors flex items-center space-x-1 ${
                        executingOrders.has(rec.id)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : rec.priority_level === 'emergency' || rec.priority_level === 'critical'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <Play className="h-3 w-3" />
                      <span>{executingOrders.has(rec.id) ? 'Executing...' : 'Execute Order'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Summary Statistics */}
      {data.recommendations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.recommendations.filter(r => r.priority_level === 'emergency' || r.priority_level === 'critical').length}
              </div>
              <div className="text-sm text-gray-600">Critical Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${data.recommendations.reduce((sum, r) => sum + r.cost_estimate, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.recommendations.reduce((sum, r) => sum + r.recommended_order_quantity, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Units</div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recommendation Details</h3>
              <button
                onClick={() => setSelectedRecommendation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Blood Type</label>
                  <p className="text-lg font-semibold">{selectedRecommendation.blood_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <p className={`text-lg font-semibold ${getPriorityColor(selectedRecommendation.priority_level)}`}>
                    {selectedRecommendation.priority_level.toUpperCase()}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Action Required</label>
                <p className="text-gray-900">{selectedRecommendation.action}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Reason</label>
                <p className="text-gray-700">{selectedRecommendation.reason}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Recommended Quantity</label>
                  <p className="text-lg font-semibold">{selectedRecommendation.recommended_order_quantity} units</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Cost Estimate</label>
                  <p className="text-lg font-semibold">${selectedRecommendation.cost_estimate.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Expected Delivery</label>
                  <p className="text-lg font-semibold">{selectedRecommendation.expected_delivery_time}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Generated</label>
                <p className="text-gray-700">{new Date(selectedRecommendation.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedRecommendation(null)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleExecuteOrder(selectedRecommendation)
                  setSelectedRecommendation(null)
                }}
                disabled={executingOrders.has(selectedRecommendation.id)}
                className={`px-4 py-2 text-white rounded transition-colors ${
                  executingOrders.has(selectedRecommendation.id)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : selectedRecommendation.priority_level === 'emergency' || selectedRecommendation.priority_level === 'critical'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {executingOrders.has(selectedRecommendation.id) ? 'Executing...' : 'Execute Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
