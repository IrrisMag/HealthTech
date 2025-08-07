'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Plus, RefreshCw, Calendar, User, TestTube, MapPin, FileText, Filter, Search } from 'lucide-react'
import { fetchDonations, addDonation, fetchDonors } from '@/lib/api'

interface Donation {
  id: string
  donor_id: string
  donor_name: string
  blood_type: string
  quantity: number
  donation_date: string
  location: string
  staff_id?: string
  staff_name?: string
  status: 'completed' | 'processing' | 'cancelled'
  notes?: string
  created_at: string
}

interface Donor {
  id: string
  name: string
  blood_type: string
  phone: string
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBloodType, setFilterBloodType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Form state
  const [donationForm, setDonationForm] = useState({
    donor_id: '',
    blood_type: 'A+',
    quantity: 450, // Standard donation amount in ml
    donation_date: new Date().toISOString().split('T')[0],
    location: 'Main Donation Center',
    staff_id: '',
    notes: ''
  })

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [donationsData, donorsData] = await Promise.all([
        fetchDonations(),
        fetchDonors()
      ])
      
      setDonations(donationsData)
      setDonors(donorsData)
      console.log(`✅ Loaded ${donationsData.length} donations and ${donorsData.length} donors`)
    } catch (err) {
      console.error('❌ Data loading failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data from backend services')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addDonation({
        ...donationForm,
        donation_date: new Date(donationForm.donation_date).toISOString()
      })
      
      // Reset form
      setDonationForm({
        donor_id: '',
        blood_type: 'A+',
        quantity: 450,
        donation_date: new Date().toISOString().split('T')[0],
        location: 'Main Donation Center',
        staff_id: '',
        notes: ''
      })
      
      setShowAddModal(false)
      await loadData() // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add donation')
    } finally {
      setLoading(false)
    }
  }

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.blood_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBloodType = !filterBloodType || donation.blood_type === filterBloodType
    const matchesStatus = !filterStatus || donation.status === filterStatus
    
    return matchesSearch && matchesBloodType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBloodTypeColor = (bloodType: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-200 text-red-900',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-200 text-blue-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900',
      'O+': 'bg-orange-100 text-orange-800',
      'O-': 'bg-orange-200 text-orange-900',
    }
    return colors[bloodType] || 'bg-gray-100 text-gray-800'
  }

  if (loading && donations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading donations data from backend services...</p>
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
              ❤️ Blood Donations Management
            </h1>
            <p className="text-gray-600">
              Track and manage blood donations from real backend data
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Donation
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
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
          <p className="text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by donor name or blood type..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TestTube className="w-4 h-4 inline mr-2" />
              Blood Type
            </label>
            <select
              value={filterBloodType}
              onChange={(e) => setFilterBloodType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterBloodType('')
                setFilterStatus('')
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Donations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Donations ({filteredDonations.length})
          </h2>
          
          {filteredDonations.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No donations found</p>
              <p className="text-gray-400">
                {donations.length === 0 
                  ? 'No donation data available from backend services' 
                  : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blood Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDonations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {donation.donor_name || 'Unknown Donor'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {donation.donor_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBloodTypeColor(donation.blood_type)}`}>
                          {donation.blood_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.quantity} ml
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {new Date(donation.donation_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          {donation.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                          {donation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
