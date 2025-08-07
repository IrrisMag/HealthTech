"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Plus,
  Edit,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Beaker,
  Droplets,
  User,
  MapPin
} from "lucide-react";
import {
  getDonations,
  recordDonation,
  getDonation,
  getDonors
} from "@/lib/api";

interface Donation {
  _id: string;
  donation_id: string;
  donor_id: string;
  donor_name?: string;
  blood_type: string;
  donation_type: string;
  volume_ml: number;
  collection_date: string;
  expiry_date: string;
  status: string;
  screening_results?: {
    hiv: string;
    hepatitis_b: string;
    hepatitis_c: string;
    syphilis: string;
  };
  storage_location?: string;
}

export default function DonationsManagementPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("");
  const [donationTypeFilter, setDonationTypeFilter] = useState("");
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dataSource, setDataSource] = useState("loading");

  useEffect(() => {
    loadDonations();
  }, [currentPage, statusFilter, bloodTypeFilter, donationTypeFilter]);

  const loadDonations = async () => {
    setLoading(true);
    try {
      const response = await getDonations(
        currentPage * pageSize,
        pageSize,
        undefined, // donor_id
        statusFilter || undefined
      );

      if (response.status === 'success') {
        let filteredDonations = response.donations || [];
        
        // Apply additional filters
        if (bloodTypeFilter) {
          filteredDonations = filteredDonations.filter((donation: Donation) => 
            donation.blood_type === bloodTypeFilter
          );
        }

        if (donationTypeFilter) {
          filteredDonations = filteredDonations.filter((donation: Donation) => 
            donation.donation_type === donationTypeFilter
          );
        }

        // Apply search filter
        if (searchTerm) {
          filteredDonations = filteredDonations.filter((donation: Donation) =>
            donation.donation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donation.donor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (donation.donor_name && donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        setDonations(filteredDonations);
        setTotalCount(response.total_count || 0);
        setDataSource(response.data_source || "unknown");
      }
    } catch (error) {
      console.error('Error loading donations:', error);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordDonation = async (donationData: Partial<Donation>) => {
    try {
      const response = await recordDonation(donationData, "demo-token");
      if (response.status === 'success') {
        setShowAddForm(false);
        loadDonations(); // Reload the list
      }
    } catch (error) {
      console.error('Error recording donation:', error);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'collected':
        return { color: 'bg-blue-100 text-blue-800', icon: Droplets, label: 'Collected' };
      case 'processed':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Beaker, label: 'Processing' };
      case 'available':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Available' };
      case 'used':
        return { color: 'bg-gray-100 text-gray-800', icon: Activity, label: 'Used' };
      case 'expired':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Expired' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: status };
    }
  };

  const getDonationTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case 'whole_blood':
        return { label: 'Whole Blood', icon: Heart };
      case 'plasma':
        return { label: 'Plasma', icon: Droplets };
      case 'platelets':
        return { label: 'Platelets', icon: Activity };
      case 'red_cells':
        return { label: 'Red Cells', icon: Heart };
      default:
        return { label: type, icon: Heart };
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const getScreeningStatus = (screening?: any) => {
    if (!screening) return { status: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    
    const results = Object.values(screening);
    const allNegative = results.every(result => result === 'negative');
    
    if (allNegative) {
      return { status: 'Clear', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Issues Found', color: 'bg-red-100 text-red-800' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-lg font-medium text-gray-700">Loading Donations...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching real-time data from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Heart className="h-8 w-8 text-red-600 mr-3" />
                Donations Management
              </h1>
              <p className="text-gray-600">
                Complete donation tracking from collection to transfusion
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant="outline" className="flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  Data Source: {dataSource === 'database' ? 'Live Database' : 'Real-time API'}
                </Badge>
                <Badge variant="outline">
                  Total Donations: {totalCount}
                </Badge>
                <Badge variant="outline" className="text-green-600">
                  Available: {donations.filter(d => d.status === 'available').length}
                </Badge>
                <Badge variant="outline" className="text-red-600">
                  Expiring Soon: {donations.filter(d => isExpiringSoon(d.expiry_date)).length}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={loadDonations} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowAddForm(true)} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Record Donation
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by donation ID, donor..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="collected">Collected</option>
                  <option value="processed">Processed</option>
                  <option value="available">Available</option>
                  <option value="used">Used</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Blood Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
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
                <label className="block text-sm font-medium mb-2">Donation Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  value={donationTypeFilter}
                  onChange={(e) => setDonationTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="whole_blood">Whole Blood</option>
                  <option value="plasma">Plasma</option>
                  <option value="platelets">Platelets</option>
                  <option value="red_cells">Red Cells</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button onClick={loadDonations} className="w-full bg-red-600 hover:bg-red-700">
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donations List */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Donations ({donations.length})</CardTitle>
            <CardDescription>
              Real-time donation tracking with screening results and expiry monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donations.map(donation => {
                const statusInfo = getStatusInfo(donation.status);
                const donationTypeInfo = getDonationTypeInfo(donation.donation_type);
                const screeningStatus = getScreeningStatus(donation.screening_results);
                const StatusIcon = statusInfo.icon;
                const TypeIcon = donationTypeInfo.icon;
                
                return (
                  <div key={donation._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-lg">
                          {donation.donation_id}
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {donation.donor_id}
                            </span>
                            <span className="flex items-center">
                              <Heart className="h-3 w-3 mr-1 text-red-500" />
                              {donation.blood_type}
                            </span>
                            <span className="flex items-center">
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {donationTypeInfo.label}
                            </span>
                            <span>{donation.volume_ml}ml</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Collected: {new Date(donation.collection_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Expires: {new Date(donation.expiry_date).toLocaleDateString()}
                            </span>
                            {donation.storage_location && (
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {donation.storage_location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {isExpiringSoon(donation.expiry_date) && (
                        <Badge className="bg-orange-100 text-orange-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expiring Soon
                        </Badge>
                      )}
                      
                      {isExpired(donation.expiry_date) && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      )}
                      
                      <Badge className={screeningStatus.color}>
                        <Beaker className="h-3 w-3 mr-1" />
                        {screeningStatus.status}
                      </Badge>
                      
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDonation(donation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} donations
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

        {/* Record Donation Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Record New Donation</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const donationData = {
                  donor_id: formData.get('donor_id') as string,
                  blood_type: formData.get('blood_type') as string,
                  donation_type: formData.get('donation_type') as string,
                  volume_ml: parseInt(formData.get('volume_ml') as string),
                  collection_date: formData.get('collection_date') as string,
                  storage_location: formData.get('storage_location') as string,
                };
                handleRecordDonation(donationData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Donor ID</label>
                    <input
                      name="donor_id"
                      type="text"
                      required
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter donor ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Blood Type</label>
                    <select
                      name="blood_type"
                      required
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select blood type</option>
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
                    <label className="block text-sm font-medium mb-1">Donation Type</label>
                    <select
                      name="donation_type"
                      required
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select donation type</option>
                      <option value="whole_blood">Whole Blood</option>
                      <option value="plasma">Plasma</option>
                      <option value="platelets">Platelets</option>
                      <option value="red_cells">Red Blood Cells</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Volume (ml)</label>
                    <input
                      name="volume_ml"
                      type="number"
                      required
                      min="100"
                      max="500"
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter volume in ml"
                      defaultValue="450"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Collection Date</label>
                    <input
                      name="collection_date"
                      type="datetime-local"
                      required
                      className="w-full p-2 border rounded-md"
                      defaultValue={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Storage Location</label>
                    <input
                      name="storage_location"
                      type="text"
                      required
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., Refrigerator A-1"
                    />
                  </div>
                </div>
                <div className="flex space-x-2 mt-6">
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Donation
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
