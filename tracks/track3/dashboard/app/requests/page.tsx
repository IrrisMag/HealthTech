'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, RefreshCw, AlertTriangle, Clock, User, TestTube, Building, Filter, Search } from 'lucide-react'
import { fetchBloodRequests, addBloodRequest } from '@/lib/api'

interface BloodRequest {
  id: string
  patient_name: string
  patient_id?: string
  blood_type: string
  quantity: number
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  hospital_department: string
  requested_by: string
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled'
  request_date: string
  notes?: string
  created_at: string
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUrgency, setFilterUrgency] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Form state
  const [requestForm, setRequestForm] = useState({
    patient_name: '',
    patient_id: '',
    blood_type: 'A+',
    quantity: 1,
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'emergency',
    hospital_department: '',
    requested_by: '',
    notes: ''
  })

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const urgencyLevels = ['low', 'medium', 'high', 'emergency']
  const departments = [
    'Emergency Department',
    'Surgery',
    'ICU',
    'Cardiology',
    'Oncology',
    'Pediatrics',
    'Obstetrics',
    'Internal Medicine'
  ]

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchBloodRequests()
      setRequests(data)
      console.log(`✅ Loaded ${data.length} blood requests`)
    } catch (err) {
      console.error('❌ Requests loading failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to load requests from backend services')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadRequests()
    setRefreshing(false)
  }

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addBloodRequest(requestForm)
      
      // Reset form
      setRequestForm({
        patient_name: '',
        patient_id: '',
        blood_type: 'A+',
        quantity: 1,
        urgency: 'medium',
        hospital_department: '',
        requested_by: '',
        notes: ''
      })
      
      setShowAddModal(false)
      await loadRequests() // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add blood request')
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.blood_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.hospital_department?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesUrgency = !filterUrgency || request.urgency === filterUrgency
    const matchesStatus = !filterStatus || request.status === filterStatus
    
    return matchesSearch && matchesUrgency && matchesStatus
  })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'bg-green-100 text-green-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
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

  if (loading && requests.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blood requests from backend services...</p>
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
              📋 Blood Requests Management
            </h1>
            <p className="text-gray-600">
              Track and manage blood requests from hospital departments
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Request
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
              placeholder="Search by patient, blood type, or department..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Urgency
            </label>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Urgency</option>
              <option value="emergency">Emergency</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterUrgency('')
                setFilterStatus('')
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Blood Requests ({filteredRequests.length})
          </h2>
          
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No blood requests found</p>
              <p className="text-gray-400">
                {requests.length === 0 
                  ? 'No request data available from backend services' 
                  : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.patient_name}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBloodTypeColor(request.blood_type)}`}>
                          {request.blood_type}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency.toUpperCase()}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <TestTube className="w-4 h-4 mr-2" />
                          <span>{request.quantity} units needed</span>
                        </div>
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          <span>{request.hospital_department}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>Requested by: {request.requested_by}</span>
                        </div>
                      </div>
                      
                      {request.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Notes:</strong> {request.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(request.request_date || request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
