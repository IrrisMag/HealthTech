'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Phone, Calendar, Heart, Filter, Search } from 'lucide-react'
import { fetchDonors } from '@/lib/api'

interface Donor {
  id: string
  name: string
  age: number
  gender: string
  blood_type: string
  phone: string
  last_donation: string
  donation_count: number
  eligibility_status: string
  created_at: string
}

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBloodType, setFilterBloodType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  useEffect(() => {
    loadDonors()
  }, [])

  const loadDonors = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchDonors()
      setDonors(data)
      console.log(`✅ Loaded ${data.length} donor records`)
    } catch (err) {
      console.error('❌ Donors loading failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to load donors from backend services')
      setDonors([])
    } finally {
      setLoading(false)
    }
  }

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donor.phone.includes(searchTerm)
    const matchesBloodType = !filterBloodType || donor.blood_type === filterBloodType
    const matchesStatus = !filterStatus || donor.eligibility_status === filterStatus
    
    return matchesSearch && matchesBloodType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-green-100 text-green-800'
      case 'deferred': return 'bg-yellow-100 text-yellow-800'
      case 'ineligible': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBloodTypeColor = (bloodType: string) => {
    const colors = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-200 text-red-900',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-200 text-blue-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900',
      'O+': 'bg-orange-100 text-orange-800',
      'O-': 'bg-orange-200 text-orange-900',
    }
    return colors[bloodType as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading donors...</p>
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
              👥 Donor Management
            </h1>
            <p className="text-gray-600">
              Manage blood donors and track donation history
            </p>
          </div>
          <button
            onClick={loadDonors}
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
            <Users className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search donors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterBloodType}
          onChange={(e) => setFilterBloodType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Blood Types</option>
          {bloodTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="eligible">Eligible</option>
          <option value="deferred">Deferred</option>
          <option value="ineligible">Ineligible</option>
        </select>

        <div className="flex items-center text-sm text-gray-600">
          <Filter className="w-4 h-4 mr-2" />
          {filteredDonors.length} of {donors.length} donors
        </div>
      </motion.div>

      {/* Donors Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredDonors.map((donor, index) => (
          <motion.div
            key={donor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{donor.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBloodTypeColor(donor.blood_type)}`}>
                  {donor.blood_type}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {donor.age} years old, {donor.gender}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {donor.phone}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Heart className="w-4 h-4 mr-2" />
                {donor.donation_count} donations
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Last: {new Date(donor.last_donation).toLocaleDateString()}
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donor.eligibility_status)}`}>
                  {donor.eligibility_status.charAt(0).toUpperCase() + donor.eligibility_status.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  ID: {donor.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredDonors.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No donors found</h3>
          <p className="text-gray-600">
            {searchTerm || filterBloodType || filterStatus 
              ? 'Try adjusting your filters' 
              : 'No donor data available'}
          </p>
        </div>
      )}
    </div>
  )
}
