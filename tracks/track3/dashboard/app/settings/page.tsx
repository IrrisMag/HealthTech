'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, RefreshCw, AlertTriangle, Bell, Database, Shield, Globe } from 'lucide-react'

interface SystemSettings {
  hospital_name: string
  blood_bank_code: string
  emergency_threshold: number
  low_stock_threshold: number
  expiry_warning_days: number
  auto_optimization: boolean
  email_notifications: boolean
  sms_notifications: boolean
  api_endpoint: string
  backup_frequency: string
  data_retention_days: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    hospital_name: 'Douala General Hospital',
    blood_bank_code: 'DGH-BB-001',
    emergency_threshold: 5,
    low_stock_threshold: 15,
    expiry_warning_days: 7,
    auto_optimization: true,
    email_notifications: true,
    sms_notifications: false,
    api_endpoint: 'https://healthtech-production-e602.up.railway.app',
    backup_frequency: 'daily',
    data_retention_days: 365
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // In a real implementation, this would save to backend
      console.log('💾 Saving settings:', settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Settings saved successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        hospital_name: 'Douala General Hospital',
        blood_bank_code: 'DGH-BB-001',
        emergency_threshold: 5,
        low_stock_threshold: 15,
        expiry_warning_days: 7,
        auto_optimization: true,
        email_notifications: true,
        sms_notifications: false,
        api_endpoint: 'https://healthtech-production-e602.up.railway.app',
        backup_frequency: 'daily',
        data_retention_days: 365
      })
      setSuccess('Settings reset to default values')
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${settings.api_endpoint}/health`)
      if (response.ok) {
        setSuccess('✅ Backend connection successful!')
      } else {
        setError('❌ Backend connection failed')
      }
    } catch (err) {
      setError('❌ Unable to connect to backend services')
    } finally {
      setLoading(false)
    }

    setTimeout(() => {
      setSuccess(null)
      setError(null)
    }, 3000)
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
              ⚙️ System Settings
            </h1>
            <p className="text-gray-600">
              Configure blood bank system parameters and preferences
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <p className="text-red-600">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
        >
          <p className="text-green-600">{success}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            General Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Name
              </label>
              <input
                type="text"
                value={settings.hospital_name}
                onChange={(e) => setSettings({ ...settings, hospital_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Bank Code
              </label>
              <input
                type="text"
                value={settings.blood_bank_code}
                onChange={(e) => setSettings({ ...settings, blood_bank_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Threshold (units)
              </label>
              <input
                type="number"
                min="1"
                value={settings.emergency_threshold}
                onChange={(e) => setSettings({ ...settings, emergency_threshold: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold (units)
              </label>
              <input
                type="number"
                min="1"
                value={settings.low_stock_threshold}
                onChange={(e) => setSettings({ ...settings, low_stock_threshold: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Warning (days)
              </label>
              <input
                type="number"
                min="1"
                value={settings.expiry_warning_days}
                onChange={(e) => setSettings({ ...settings, expiry_warning_days: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* System Configuration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            System Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Endpoint
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={settings.api_endpoint}
                  onChange={(e) => setSettings({ ...settings, api_endpoint: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  onClick={testConnection}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Frequency
              </label>
              <select
                value={settings.backup_frequency}
                onChange={(e) => setSettings({ ...settings, backup_frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Retention (days)
              </label>
              <input
                type="number"
                min="30"
                value={settings.data_retention_days}
                onChange={(e) => setSettings({ ...settings, data_retention_days: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Automation</h3>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.auto_optimization}
                  onChange={(e) => setSettings({ ...settings, auto_optimization: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable automatic optimization</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </h2>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Email notifications</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.sms_notifications}
                onChange={(e) => setSettings({ ...settings, sms_notifications: e.target.checked })}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
            </label>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Notification Settings</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Configure notification preferences for alerts, low stock warnings, and system updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            System Status
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Backend Connection</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Database Status</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Online
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Last Backup</span>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">System Version</span>
              <span className="text-sm text-gray-500">v1.0.0</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
