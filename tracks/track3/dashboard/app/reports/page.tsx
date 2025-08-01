'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, BarChart3, TrendingUp, Users } from 'lucide-react'
import { fetchDashboardData } from '@/lib/api'
import { DashboardData } from '@/types'

export default function ReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7days')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const dashboardData = await fetchDashboardData()
      setData(dashboardData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = (type: string) => {
    // In a real implementation, this would generate and download actual reports
    console.log(`Generating ${type} report for period: ${selectedPeriod}`)
    alert(`${type} report generation started. You will be notified when ready.`)
  }

  const reportTypes = [
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Current stock levels, expiry dates, and storage conditions',
      icon: BarChart3,
      color: 'bg-blue-500',
    },
    {
      id: 'forecast',
      title: 'Demand Forecast Report',
      description: 'AI predictions for blood demand across all types',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      id: 'optimization',
      title: 'Optimization Report',
      description: 'Cost analysis and inventory optimization recommendations',
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      id: 'donors',
      title: 'Donor Analytics',
      description: 'Donor demographics, frequency, and contribution analysis',
      icon: Users,
      color: 'bg-orange-500',
    },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
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
              📊 Reports & Analytics
            </h1>
            <p className="text-gray-600">
              Generate comprehensive reports for blood bank operations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Downloads</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <Download className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Automated</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </motion.div>

      {/* Report Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        {reportTypes.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${report.color}`}>
                <report.icon className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => generateReport(report.title)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Generate</span>
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{report.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Last generated: 2 hours ago</span>
              <span>PDF, Excel</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { name: 'Weekly Inventory Summary', type: 'Inventory', date: '2025-08-01', size: '2.4 MB' },
                { name: 'Monthly Forecast Analysis', type: 'Forecast', date: '2025-07-31', size: '1.8 MB' },
                { name: 'Optimization Recommendations', type: 'Optimization', date: '2025-07-30', size: '956 KB' },
                { name: 'Donor Demographics Report', type: 'Analytics', date: '2025-07-29', size: '3.2 MB' },
              ].map((report, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Download</button>
                    <button className="text-gray-600 hover:text-gray-900">View</button>
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
