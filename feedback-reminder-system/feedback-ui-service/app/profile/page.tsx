"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X, 
  Camera,
  Stethoscope,
  Building2,
  Clock,
  Activity,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Badge,
  Award
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState({
    id: "staff_001",
    full_name: "Dr. Sarah Mballa",
    email: "sarah.mballa@dgh.cm",
    phone: "+237 677 123 456",
    role: "admin",
    department: "Emergency Medicine",
    employee_id: "DGH-EM-001",
    license_number: "CM-MD-2019-0456",
    specialization: "Emergency Medicine",
    years_experience: 8,
    address: "Douala, Cameroon",
    joined_date: "2019-03-15",
    last_login: "2024-01-20T14:30:00Z",
    status: "active",
    permissions: ["patient_management", "system_admin", "blood_bank_access", "ai_assistant"],
    profile_image: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user from localStorage if available
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(prev => ({ ...prev, ...parsedUser }));
      setEditedUser(prev => ({ ...prev, ...parsedUser }));
    }
  }, []);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return '👑 Administrator';
      case 'nurse': return '👩‍⚕️ Nurse';
      case 'receptionist': return '🏥 Receptionist';
      case 'doctor': return '👨‍⚕️ Doctor';
      case 'staff': return '👥 Staff Member';
      case 'patient': return '🏥 Patient';
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-success';
      case 'inactive': return 'status-warning';
      case 'suspended': return 'status-critical';
      default: return 'status-info';
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(editedUser);
      localStorage.setItem('user', JSON.stringify(editedUser));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Staff Profile</h1>
            <p className="text-gray-600">Manage your hospital account and professional information</p>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-medical btn-primary"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-medical btn-success"
                >
                  {loading ? (
                    <div className="medical-spinner w-4 h-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="btn-medical btn-outline"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="medical-card">
            <div className="medical-card-header text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 hospital-gradient rounded-full flex items-center justify-center medical-shadow-lg">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{user.full_name}</h3>
              <p className="text-gray-600 mb-2">{getRoleDisplayName(user.role)}</p>
              <div className={`status-indicator ${getStatusColor(user.status)} mb-4`}>
                <CheckCircle className="h-3 w-3" />
                {user.status.toUpperCase()}
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{user.department}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Badge className="h-4 w-4" />
                  <span>ID: {user.employee_id}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>{user.years_experience} years experience</span>
                </div>
              </div>
            </div>
            
            <div className="medical-card-content">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Last Login</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(user.last_login).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="btn-medical btn-danger w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="medical-card">
            <div className="medical-card-header">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </h4>
            </div>
            <div className="medical-card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.full_name}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, full_name: e.target.value }))}
                      className="medical-input"
                    />
                  ) : (
                    <p className="text-gray-900">{user.full_name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                      className="medical-input"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedUser.phone}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                      className="medical-input"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.address}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, address: e.target.value }))}
                      className="medical-input"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{user.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="medical-card">
            <div className="medical-card-header">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
                Professional Information
              </h4>
            </div>
            <div className="medical-card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <p className="text-gray-900">{user.department}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                  <p className="text-gray-900">{user.specialization}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
                  <p className="text-gray-900 font-mono">{user.license_number}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                  <p className="text-gray-900">{user.years_experience} years</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Employee ID</label>
                  <p className="text-gray-900 font-mono">{user.employee_id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Joined Date</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{new Date(user.joined_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Permissions */}
          <div className="medical-card">
            <div className="medical-card-header">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                System Permissions
              </h4>
            </div>
            <div className="medical-card-content">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.permissions.map((permission, index) => (
                  <div key={index} className="status-indicator status-success">
                    <CheckCircle className="h-3 w-3" />
                    <span className="text-xs">{permission.replace('_', ' ').toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
