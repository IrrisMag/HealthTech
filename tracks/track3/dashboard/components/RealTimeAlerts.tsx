'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Info,
  X,
  Bell
} from 'lucide-react'
import { DashboardData } from '@/types'

interface RealTimeAlertsProps {
  data: DashboardData | null
}

export default function RealTimeAlerts({ data }: RealTimeAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  if (!data) return null

  const activeAlerts = data.alerts.filter(alert => 
    !alert.acknowledged && !dismissedAlerts.has(alert.id)
  )

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return AlertTriangle
      case 'warning':
        return AlertTriangle
      default:
        return Info
    }
  }

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'text-red-600 hover:text-red-800'
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'text-yellow-600 hover:text-yellow-800'
        }
      default:
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'text-blue-600 hover:text-blue-800'
        }
    }
  }

  if (activeAlerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Bell className="h-5 w-5 text-green-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              All Systems Normal
            </h3>
            <p className="text-sm text-green-700">
              No active alerts. Blood bank operations are running smoothly.
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {activeAlerts.map((alert, index) => {
          const AlertIcon = getAlertIcon(alert.type)
          const styles = getAlertStyles(alert.type)
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 ${styles.container}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertIcon className={`h-5 w-5 ${styles.icon} ${
                    alert.type === 'critical' ? 'animate-pulse' : ''
                  }`} />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-medium ${styles.title}`}>
                      {alert.title}
                      {alert.blood_type && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-gray-800">
                          {alert.blood_type}
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className={`ml-2 flex-shrink-0 ${styles.button} transition-colors`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className={`mt-1 text-sm ${styles.message}`}>
                    {alert.message}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    {alert.type === 'critical' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
                      >
                        Take Action
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Alert Summary */}
      {activeAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 border border-gray-200 rounded-lg p-3"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">
                  {activeAlerts.filter(a => a.type === 'critical').length} Critical
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">
                  {activeAlerts.filter(a => a.type === 'warning').length} Warning
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">
                  {activeAlerts.filter(a => a.type === 'info').length} Info
                </span>
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
