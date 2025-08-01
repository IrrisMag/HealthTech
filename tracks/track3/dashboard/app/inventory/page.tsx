'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TestTube, AlertTriangle, Clock, Thermometer } from 'lucide-react'
import { fetchBloodInventory } from '@/lib/api'

interface InventoryItem {
  id: string
  blood_type: string
  quantity: number
  expiry_date: string
  location: string
  temperature: number
  status: 'available' | 'reserved' | 'expired' | 'critical'
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setError(null)
      const data = await fetchBloodInventory()
      // Ensure data is an array
      if (Array.isArray(data)) {
        setInventory(data)
      } else {
        // If data is not an array, try to extract array from response
        const inventoryArray = data?.inventory || data?.data || []
        setInventory(Array.isArray(inventoryArray) ? inventoryArray : [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory')
      setInventory([]) // Ensure inventory is always an array
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      case 'reserved': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const getBloodTypeColor = (bloodType: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-500', 'A-': 'bg-red-600',
      'B+': 'bg-blue-500', 'B-': 'bg-blue-600',
      'AB+': 'bg-purple-500', 'AB-': 'bg-purple-600',
      'O+': 'bg-orange-500', 'O-': 'bg-orange-600',
    }
    return colors[bloodType] || 'bg-gray-500'
  }

  const filteredInventory = Array.isArray(inventory)
    ? inventory.filter(item => filter === 'all' || item.blood_type === filter)
    : []

  const bloodTypes = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Inventory</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadInventory}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Retry
            </button>
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
              🩸 Blood Inventory Management
            </h1>
            <p className="text-gray-600">
              Real-time blood stock monitoring and management
            </p>
          </div>
          <button
            onClick={loadInventory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Filters */}
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
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Inventory Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredInventory.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Inventory Found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No blood inventory items available.' 
                : `No ${filter} blood type items found.`}
            </p>
          </div>
        ) : (
          filteredInventory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white ${getBloodTypeColor(item.blood_type)}`}>
                  {item.blood_type}
                </span>
                <span className={`status-indicator ${getStatusColor(item.status)}`}>
                  {item.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quantity</span>
                  <span className="font-semibold">{item.quantity} units</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location</span>
                  <span className="text-sm">{item.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Expires
                  </span>
                  <span className="text-sm">{new Date(item.expiry_date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Thermometer className="w-4 h-4 mr-1" />
                    Temperature
                  </span>
                  <span className="text-sm">{item.temperature}°C</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
