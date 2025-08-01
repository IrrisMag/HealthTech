'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Truck
} from 'lucide-react'
import { DashboardData } from '@/types'

interface OptimizationRecommendationsProps {
  data: DashboardData | null
}

export default function OptimizationRecommendations({ data }: OptimizationRecommendationsProps) {
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
                    <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                      View Details
                    </button>
                    <button className={`px-3 py-1 text-xs font-medium text-white rounded transition-colors ${
                      rec.priority_level === 'emergency' || rec.priority_level === 'critical'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}>
                      Execute Order
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
    </div>
  )
}
