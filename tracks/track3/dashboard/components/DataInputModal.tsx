'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, TestTube, Users, Calendar, MapPin, Thermometer } from 'lucide-react'
import { addInventoryItem, addDonor } from '@/lib/api'

interface DataInputModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'inventory' | 'donor'
  onSuccess: () => void
}

export default function DataInputModal({ isOpen, onClose, type, onSuccess }: DataInputModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inventory form state
  const [inventoryForm, setInventoryForm] = useState({
    blood_type: 'A+',
    quantity: 1,
    expiry_date: '',
    location: 'Main Storage',
    temperature: 4.0,
    status: 'available'
  })

  // Donor form state
  const [donorForm, setDonorForm] = useState({
    name: '',
    age: 18,
    gender: 'male',
    blood_type: 'A+',
    phone: '',
    email: '',
    address: ''
  })

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await addInventoryItem({
        ...inventoryForm,
        expiry_date: new Date(inventoryForm.expiry_date).toISOString()
      })
      
      // Reset form
      setInventoryForm({
        blood_type: 'A+',
        quantity: 1,
        expiry_date: '',
        location: 'Main Storage',
        temperature: 4.0,
        status: 'available'
      })
      
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add inventory item')
    } finally {
      setLoading(false)
    }
  }

  const handleDonorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await addDonor(donorForm)
      
      // Reset form
      setDonorForm({
        name: '',
        age: 18,
        gender: 'male',
        blood_type: 'A+',
        phone: '',
        email: '',
        address: ''
      })
      
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add donor')
    } finally {
      setLoading(false)
    }
  }

  const renderInventoryForm = () => (
    <form onSubmit={handleInventorySubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blood Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TestTube className="w-4 h-4 inline mr-2" />
            Blood Type
          </label>
          <select
            value={inventoryForm.blood_type}
            onChange={(e) => setInventoryForm({ ...inventoryForm, blood_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            {bloodTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity (Units)
          </label>
          <input
            type="number"
            min="1"
            value={inventoryForm.quantity}
            onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Expiry Date
          </label>
          <input
            type="date"
            value={inventoryForm.expiry_date}
            onChange={(e) => setInventoryForm({ ...inventoryForm, expiry_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Storage Location
          </label>
          <input
            type="text"
            value={inventoryForm.location}
            onChange={(e) => setInventoryForm({ ...inventoryForm, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="e.g., Main Storage, Refrigerator A"
          />
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Thermometer className="w-4 h-4 inline mr-2" />
            Temperature (°C)
          </label>
          <input
            type="number"
            min="2"
            max="8"
            step="0.1"
            value={inventoryForm.temperature}
            onChange={(e) => setInventoryForm({ ...inventoryForm, temperature: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={inventoryForm.status}
            onChange={(e) => setInventoryForm({ ...inventoryForm, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="expired">Expired</option>
            <option value="quarantine">Quarantine</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding...' : 'Add Inventory Item'}
        </button>
      </div>
    </form>
  )

  const renderDonorForm = () => (
    <form onSubmit={handleDonorSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Full Name
          </label>
          <input
            type="text"
            value={donorForm.name}
            onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter donor's full name"
            required
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </label>
          <input
            type="number"
            min="18"
            max="65"
            value={donorForm.age}
            onChange={(e) => setDonorForm({ ...donorForm, age: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            value={donorForm.gender}
            onChange={(e) => setDonorForm({ ...donorForm, gender: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Blood Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TestTube className="w-4 h-4 inline mr-2" />
            Blood Type
          </label>
          <select
            value={donorForm.blood_type}
            onChange={(e) => setDonorForm({ ...donorForm, blood_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            {bloodTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={donorForm.phone}
            onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="+237 XXX XXX XXX"
            required
          />
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (Optional)
          </label>
          <input
            type="email"
            value={donorForm.email}
            onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="donor@example.com"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address (Optional)
          </label>
          <textarea
            value={donorForm.address}
            onChange={(e) => setDonorForm({ ...donorForm, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="Enter donor's address"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding...' : 'Add Donor'}
        </button>
      </div>
    </form>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
            >
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {type === 'inventory' ? (
                      <>
                        <TestTube className="w-5 h-5 inline mr-2 text-red-600" />
                        Add Blood Inventory Item
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 inline mr-2 text-red-600" />
                        Add New Donor
                      </>
                    )}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {type === 'inventory' ? renderInventoryForm() : renderDonorForm()}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
