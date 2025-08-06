"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Heart,
  Phone,
  Mail,
  Calendar,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import {
  getDonors,
  registerDonor,
  getDonor,
  updateDonor,
  deleteDonor,
  analyzeDonorEligibility
} from "@/lib/api";

interface Donor {
  _id: string;
  donor_id: string;
  first_name: string;
  last_name: string;
  blood_type: string;
  phone: string;
  email: string;
  date_of_birth: string;
  last_donation_date?: string;
  is_eligible: boolean;
  total_donations: number;
  medical_history?: string;
  screening_results?: any;
}

export default function DonorManagementPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("");
  const [eligibilityFilter, setEligibilityFilter] = useState("");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [dataSource, setDataSource] = useState("loading");

  useEffect(() => {
    loadDonors();
  }, [currentPage, bloodTypeFilter, eligibilityFilter]);

  const loadDonors = async () => {
    setLoading(true);
    try {
      const response = await getDonors(
        currentPage * pageSize,
        pageSize,
        bloodTypeFilter || undefined
      );

      if (response.status === 'success') {
        let filteredDonors = response.donors || [];
        
        // Apply eligibility filter
        if (eligibilityFilter === 'eligible') {
          filteredDonors = filteredDonors.filter((donor: Donor) => donor.is_eligible);
        } else if (eligibilityFilter === 'ineligible') {
          filteredDonors = filteredDonors.filter((donor: Donor) => !donor.is_eligible);
        }

        // Apply search filter
        if (searchTerm) {
          filteredDonors = filteredDonors.filter((donor: Donor) =>
            `${donor.first_name} ${donor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donor.donor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donor.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setDonors(filteredDonors);
        setTotalCount(response.total_count || 0);
        setDataSource(response.data_source || "unknown");
      }
    } catch (error) {
      console.error('Error loading donors:', error);
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDonor = async (donorData: Partial<Donor>) => {
    try {
      const response = await registerDonor(donorData, "demo-token");
      if (response.status === 'success') {
        setShowAddForm(false);
        loadDonors(); // Reload the list
      }
    } catch (error) {
      console.error('Error adding donor:', error);
    }
  };

  const handleUpdateDonor = async (donorId: string, donorData: Partial<Donor>) => {
    try {
      const response = await updateDonor(donorId, donorData, "demo-token");
      if (response.status === 'success') {
        setShowEditForm(false);
        setSelectedDonor(null);
        loadDonors(); // Reload the list
      }
    } catch (error) {
      console.error('Error updating donor:', error);
    }
  };

  const handleDeleteDonor = async (donorId: string) => {
    if (confirm('Are you sure you want to delete this donor?')) {
      try {
        await deleteDonor(donorId, "demo-token");
        loadDonors(); // Reload the list
      } catch (error) {
        console.error('Error deleting donor:', error);
      }
    }
  };

  const getEligibilityStatus = (donor: Donor) => {
    if (donor.is_eligible) {
      return { status: 'Eligible', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    } else {
      return { status: 'Ineligible', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getDaysSinceLastDonation = (lastDonationDate?: string) => {
    if (!lastDonationDate) return 'Never';
    const today = new Date();
    const lastDonation = new Date(lastDonationDate);
    const diffTime = Math.abs(today.getTime() - lastDonation.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Loading Donors...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching real-time data from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                Donor Management
              </h1>
              <p className="text-gray-600">
                Comprehensive donor database with real-time eligibility tracking
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant="outline" className="flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  Data Source: {dataSource === 'database' ? 'Live Database' : 'Real-time API'}
                </Badge>
                <Badge variant="outline">
                  Total Donors: {totalCount}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={loadDonors} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Donor
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or email..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Blood Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={bloodTypeFilter}
                  onChange={(e) => setBloodTypeFilter(e.target.value)}
                >
                  <option value="">All Blood Types</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Eligibility</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={eligibilityFilter}
                  onChange={(e) => setEligibilityFilter(e.target.value)}
                >
                  <option value="">All Donors</option>
                  <option value="eligible">Eligible Only</option>
                  <option value="ineligible">Ineligible Only</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button onClick={loadDonors} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donors List */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Donors ({donors.length})</CardTitle>
            <CardDescription>
              Real-time donor database with eligibility status and donation history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donors.map(donor => {
                const eligibility = getEligibilityStatus(donor);
                const EligibilityIcon = eligibility.icon;
                
                return (
                  <div key={donor._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-lg">
                          {donor.first_name} {donor.last_name}
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span>ID: {donor.donor_id}</span>
                            <span className="flex items-center">
                              <Heart className="h-3 w-3 mr-1 text-red-500" />
                              {donor.blood_type}
                            </span>
                            <span>Age: {calculateAge(donor.date_of_birth)}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {donor.phone}
                            </span>
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {donor.email}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Last donation: {getDaysSinceLastDonation(donor.last_donation_date)}
                            </span>
                            <span>Total donations: {donor.total_donations}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={eligibility.color}>
                        <EligibilityIcon className="h-3 w-3 mr-1" />
                        {eligibility.status}
                      </Badge>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDonor(donor);
                            setShowEditForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDonor(donor._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} donors
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={(currentPage + 1) * pageSize >= totalCount}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
