'use client'

import { motion } from 'framer-motion'
import {
  Users,
  TestTube,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { DashboardData } from '@/types'

interface DashboardMetricsProps {
  data: DashboardData | null
}

export default function DashboardMetrics({ data }: DashboardMetricsProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="metric-card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Donors',
      value: data.metrics.total_donors.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Donations Today',
      value: data.metrics.total_donations_today.toString(),
      icon: TestTube,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+5',
      trendUp: true,
    },
    {
      title: 'Total Inventory',
      value: data.metrics.total_inventory_units.toLocaleString(),
      icon: TestTube,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: '-2%',
      trendUp: false,
    },
    {
      title: 'Expiring Soon',
      value: data.metrics.units_expiring_soon.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      trend: '+3',
      trendUp: false,
    },
    {
      title: 'Pending Requests',
      value: data.metrics.pending_requests.toString(),
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: '-1',
      trendUp: true,
    },
    {
      title: 'Emergency Requests',
      value: data.metrics.emergency_requests.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: '0',
      trendUp: true,
    },
    {
      title: 'This Month',
      value: data.metrics.total_donations_this_month.toLocaleString(),
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      trend: '+18%',
      trendUp: true,
    },
    {
      title: 'Active Alerts',
      value: data.alerts.filter(a => !a.acknowledged).length.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: data.alerts.length > 0 ? 'High' : 'Low',
      trendUp: data.alerts.length === 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="metric-card group hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {metric.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {metric.value}
              </p>
              <div className="flex items-center space-x-1">
                {metric.trendUp ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${
                  metric.trendUp ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend}
                </span>
                <span className="text-xs text-gray-500">vs last week</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${metric.bgColor} group-hover:scale-110 transition-transform duration-200`}>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
