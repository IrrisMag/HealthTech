"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Plus,
  Edit,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Activity,
  Heart,
  User,
  Stethoscope,
  Calendar,
  Building,
  Target
} from "lucide-react";
import {
  getBloodRequests,
  createBloodRequest,
  getBloodRequest,
  updateRequestStatus
} from "@/lib/api";

interface BloodRequest {
  _id: string;
  request_id: string;
  patient_id: string;
  blood_type: string;
  component_type: string;
  quantity_units: number;
  urgency_level: string;
  requested_by: string;
  department: string;
  medical_indication?: string;
  status: string;
  cross_match_required?: boolean;
  created_at: string;
  estimated_fulfillment?: string;
}

export default function RequestsManagementPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dataSource, setDataSource] = useState("loading");

  useEffect(() => {
    loadRequests();
  }, [currentPage, statusFilter, urgencyFilter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await getBloodRequests(
        currentPage * pageSize,
        pageSize,
        statusFilter || undefined,
        urgencyFilter || undefined
      );

      if (response.status === 'success') {
        let filteredRequests = response.requests || [];
        
        // Apply department filter
        if (departmentFilter) {
          filteredRequests = filteredRequests.filter((request: BloodRequest) => 
            request.department === departmentFilter
          );
        }

        // Apply search filter
        if (searchTerm) {
          filteredRequests = filteredRequests.filter((request: BloodRequest) =>
            request.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.requested_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.department.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setRequests(filteredRequests);
        setTotalCount(response.total_count || 0);
        setDataSource(response.data_source || "unknown");
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (requestData: Partial<BloodRequest>) => {
    try {
      const response = await createBloodRequest(requestData, "demo-token");
      if (response.status === 'success') {
        setShowAddForm(false);
        loadRequests(); // Reload the list
      }
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const response = await updateRequestStatus(requestId, newStatus, "demo-token");
      if (response.status === 'success') {
        loadRequests(); // Reload the list
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const getUrgencyInfo = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'emergency':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Emergency', priority: 5 };
      case 'critical':
        return { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, label: 'Critical', priority: 4 };
      case 'high':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'High', priority: 3 };
      case 'medium':
        return { color: 'bg-blue-100 text-blue-800', icon: Activity, label: 'Medium', priority: 2 };
      case 'low':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Low', priority: 1 };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: urgency, priority: 0 };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' };
      case 'approved':
        return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Approved' };
      case 'fulfilled':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Fulfilled' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Activity, label: status };
    }
  };

  const getComponentTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case 'whole_blood':
        return { label: 'Whole Blood', icon: Heart };
      case 'red_cells':
        return { label: 'Red Cells', icon: Heart };
      case 'plasma':
        return { label: 'Plasma', icon: Activity };
      case 'platelets':
        return { label: 'Platelets', icon: Target };
      default:
        return { label: type, icon: Heart };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-lg font-medium text-gray-700">Loading Blood Requests...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching real-time data from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Clock className="h-8 w-8 text-orange-600 mr-3" />
                Blood Requests Management
              </h1>
              <p className="text-gray-600">
                Real-time blood request tracking and fulfillment system
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant="outline" className="flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  Data Source: {dataSource === 'database' ? 'Live Database' : 'Real-time API'}
                </Badge>
                <Badge variant="outline">
                  Total Requests: {totalCount}
                </Badge>
                <Badge variant="outline" className="text-yellow-600">
                  Pending: {requests.filter(r => r.status === 'pending').length}
                </Badge>
                <Badge variant="outline" className="text-red-600">
                  Emergency: {requests.filter(r => r.urgency_level === 'emergency').length}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={loadRequests} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowAddForm(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                New Request
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
                    placeholder="Search requests, patients..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Urgency</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                >
                  <option value="">All Urgency Levels</option>
                  <option value="emergency">Emergency</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Surgery">Surgery</option>
                  <option value="ICU">ICU</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button onClick={loadRequests} className="w-full bg-orange-600 hover:bg-orange-700">
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Requests ({requests.length})</CardTitle>
            <CardDescription>
              Real-time blood request management with urgency tracking and fulfillment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests
                .sort((a, b) => {
                  // Sort by urgency first, then by creation date
                  const urgencyA = getUrgencyInfo(a.urgency_level).priority;
                  const urgencyB = getUrgencyInfo(b.urgency_level).priority;
                  if (urgencyB !== urgencyA) return urgencyB - urgencyA;
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                })
                .map(request => {
                  const urgencyInfo = getUrgencyInfo(request.urgency_level);
                  const statusInfo = getStatusInfo(request.status);
                  const componentInfo = getComponentTypeInfo(request.component_type);
                  const UrgencyIcon = urgencyInfo.icon;
                  const StatusIcon = statusInfo.icon;
                  const ComponentIcon = componentInfo.icon;
                  
                  return (
                    <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium text-lg">
                            {request.request_id}
                          </div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                Patient: {request.patient_id}
                              </span>
                              <span className="flex items-center">
                                <Heart className="h-3 w-3 mr-1 text-red-500" />
                                {request.blood_type}
                              </span>
                              <span className="flex items-center">
                                <ComponentIcon className="h-3 w-3 mr-1" />
                                {componentInfo.label}
                              </span>
                              <span>{request.quantity_units} units</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Stethoscope className="h-3 w-3 mr-1" />
                                Dr. {request.requested_by}
                              </span>
                              <span className="flex items-center">
                                <Building className="h-3 w-3 mr-1" />
                                {request.department}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {getTimeAgo(request.created_at)}
                              </span>
                            </div>
                            {request.medical_indication && (
                              <div className="text-xs text-gray-400">
                                Indication: {request.medical_indication}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {request.cross_match_required && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Target className="h-3 w-3 mr-1" />
                            Cross-match Required
                          </Badge>
                        )}
                        
                        <Badge className={urgencyInfo.color}>
                          <UrgencyIcon className="h-3 w-3 mr-1" />
                          {urgencyInfo.label}
                        </Badge>
                        
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        
                        <div className="flex space-x-2">
                          {request.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(request._id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                          )}
                          {request.status === 'approved' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(request._id, 'fulfilled')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Fulfill
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Edit className="h-4 w-4" />
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
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} requests
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
