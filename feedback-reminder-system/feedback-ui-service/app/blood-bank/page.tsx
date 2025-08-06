"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Users,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Database,
  Brain,
  Stethoscope,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import {
  getBloodInventory,
  getDonors,
  getDonations,
  getBloodRequests,
  getBloodForecast,
  getOptimizationRecommendations,
  getDashboardMetrics,
  testDHIS2Connection,
  getPerformanceAnalytics
} from "@/lib/api";

interface BloodInventoryItem {
  _id: string;
  blood_type: string;
  component_type: string;
  volume_ml: number;
  status: string;
  expiry_date: string;
  storage_location: string;
}

interface DashboardMetrics {
  total_inventory_units: number;
  available_units: number;
  expired_units: number;
  pending_requests: number;
  eligible_donors: number;
  system_health: string;
}

export default function BloodBankDashboard() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any>(null);
  const [dhis2Status, setDhis2Status] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dataSource, setDataSource] = useState<string>("loading");
  const [chartData, setChartData] = useState<any>({
    bloodTypeData: [],
    donorData: [],
    requestData: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all dashboard data in parallel
      const [
        inventoryData,
        metricsData,
        donorsData,
        requestsData,
        recommendationsData,
        dhis2Data,
        analyticsData
      ] = await Promise.allSettled([
        getBloodInventory(),
        getDashboardMetrics(),
        getDonors(0, 10),
        getBloodRequests(0, 10),
        getOptimizationRecommendations(),
        testDHIS2Connection(),
        getPerformanceAnalytics()
      ]);

      // Process inventory data
      if (inventoryData.status === 'fulfilled') {
        setInventory(inventoryData.value.inventory || []);
        setDataSource(inventoryData.value.data_source || "unknown");
      }

      // Process metrics
      if (metricsData.status === 'fulfilled') {
        setMetrics(metricsData.value.metrics || null);
      }

      // Process donors
      if (donorsData.status === 'fulfilled') {
        setDonors(donorsData.value.donors || []);
      }

      // Process requests
      if (requestsData.status === 'fulfilled') {
        setRequests(requestsData.value.requests || []);
      }

      // Process recommendations
      if (recommendationsData.status === 'fulfilled') {
        setRecommendations(recommendationsData.value);
      }

      // Process DHIS2 status
      if (dhis2Data.status === 'fulfilled') {
        setDhis2Status(dhis2Data.value.connection || null);
      }

      // Process analytics
      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      }

      // Process chart data
      processChartData(inventoryData, donorsData, requestsData);

      // Load forecasts for key blood types
      loadForecasts();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadForecasts = async () => {
    const bloodTypes = ['O+', 'O-', 'A+', 'A-'];
    const forecastPromises = bloodTypes.map(type => 
      getBloodForecast(type, 7).catch(err => ({ error: err.message, blood_type: type }))
    );

    const forecastResults = await Promise.all(forecastPromises);
    const forecastData: any = {};
    
    forecastResults.forEach((result, index) => {
      if (!result.error) {
        forecastData[bloodTypes[index]] = result;
      }
    });

    setForecasts(forecastData);
  };

  const processChartData = (inventoryResult: any, donorsResult: any, requestsResult: any) => {
    try {
      // Process blood type distribution for charts
      const bloodTypeData: any[] = [];
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

      if (inventoryResult.status === 'fulfilled') {
        const inventoryItems = inventoryResult.value.inventory || [];

        bloodTypes.forEach(bloodType => {
          const typeItems = inventoryItems.filter((item: any) => item.blood_type === bloodType);
          bloodTypeData.push({
            bloodType,
            available: typeItems.filter((item: any) => item.status === 'available').length,
            reserved: typeItems.filter((item: any) => item.status === 'reserved').length,
            expired: typeItems.filter((item: any) => item.status === 'expired').length,
            total: typeItems.length
          });
        });
      }

      // Process donor data for charts
      const donorData: any[] = [];
      if (donorsResult.status === 'fulfilled') {
        const donorsList = donorsResult.value.donors || [];

        bloodTypes.forEach(bloodType => {
          const typeDonors = donorsList.filter((donor: any) => donor.blood_type === bloodType);
          donorData.push({
            bloodType,
            total: typeDonors.length,
            eligible: typeDonors.filter((donor: any) => donor.is_eligible).length,
            ineligible: typeDonors.filter((donor: any) => !donor.is_eligible).length
          });
        });
      }

      // Process request urgency data
      const requestData: any[] = [];
      if (requestsResult.status === 'fulfilled') {
        const requestsList = requestsResult.value.requests || [];
        const urgencyLevels = ['emergency', 'critical', 'high', 'medium', 'low'];

        urgencyLevels.forEach(urgency => {
          const urgencyRequests = requestsList.filter((req: any) => req.urgency_level === urgency);
          requestData.push({
            urgency: urgency.charAt(0).toUpperCase() + urgency.slice(1),
            total: urgencyRequests.length,
            pending: urgencyRequests.filter((req: any) => req.status === 'pending').length,
            fulfilled: urgencyRequests.filter((req: any) => req.status === 'fulfilled').length
          });
        });
      }

      setChartData({
        bloodTypeData,
        donorData,
        requestData
      });

    } catch (error) {
      console.error('Error processing chart data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-lg font-medium text-gray-700">Loading Blood Bank Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to Track 3 Backend</p>
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
                Blood Bank Dashboard
              </h1>
              <p className="text-gray-600">
                AI-Enhanced Blood Bank Management System - Douala General Hospital
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant="outline" className="flex items-center">
                  <Database className="h-3 w-3 mr-1" />
                  Data Source: {dataSource === 'database' ? 'Live Database' : 'Real-time API'}
                </Badge>
                {dhis2Status && (
                  <Badge 
                    variant="outline" 
                    className={`flex items-center ${
                      dhis2Status.status === 'connected' ? 'text-green-700 border-green-300' : 'text-red-700 border-red-300'
                    }`}
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    DHIS2: {dhis2Status.status === 'connected' ? 'Connected' : 'Disconnected'}
                  </Badge>
                )}
              </div>
            </div>
            <Button onClick={loadDashboardData} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventory.length}</div>
              <p className="text-xs text-muted-foreground">
                Blood units in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Units</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {inventory.filter(item => item.status === 'available').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for transfusion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{donors.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered donors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {requests.filter(req => req.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting fulfillment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="donors">Donors</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Blood Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-red-600" />
                  Blood Type Distribution
                </CardTitle>
                <CardDescription>Current inventory by blood type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bloodType => {
                    const count = inventory.filter(item => 
                      item.blood_type === bloodType && item.status === 'available'
                    ).length;
                    return (
                      <div key={bloodType} className="text-center p-4 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-red-600">{count}</div>
                        <div className="text-sm font-medium">{bloodType}</div>
                        <div className="text-xs text-gray-500">units available</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Donations</CardTitle>
                  <CardDescription>Latest blood donations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventory.slice(0, 5).map(item => (
                      <div key={item._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{item.blood_type}</div>
                          <div className="text-sm text-gray-500">{item.component_type}</div>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Urgent Requests</CardTitle>
                  <CardDescription>High priority blood requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {requests.slice(0, 5).map(request => (
                      <div key={request._id || request.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{request.blood_type}</div>
                          <div className="text-sm text-gray-500">{request.department}</div>
                        </div>
                        <Badge className={getUrgencyColor(request.urgency_level)}>
                          {request.urgency_level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-600" />
                    Blood Inventory Management
                  </span>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Add Inventory
                  </Button>
                </CardTitle>
                <CardDescription>Manage blood inventory and track expiration dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory.slice(0, 10).map(item => (
                    <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <Heart className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium">{item.blood_type} - {item.component_type}</div>
                          <div className="text-sm text-gray-500">
                            {item.volume_ml}ml • {item.storage_location}
                          </div>
                          <div className="text-xs text-gray-400">
                            Expires: {new Date(item.expiry_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Donor Management
                  </span>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Users className="h-4 w-4 mr-2" />
                    Register Donor
                  </Button>
                </CardTitle>
                <CardDescription>Manage donor information and eligibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donors.map(donor => (
                    <div key={donor._id || donor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {donor.first_name} {donor.last_name} ({donor.blood_type})
                          </div>
                          <div className="text-sm text-gray-500">
                            {donor.phone} • {donor.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            Last donation: {donor.last_donation_date ?
                              new Date(donor.last_donation_date).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={donor.is_eligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {donor.is_eligible ? 'Eligible' : 'Ineligible'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-600" />
                    Blood Request Management
                  </span>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Clock className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </CardTitle>
                <CardDescription>Track and fulfill blood requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map(request => (
                    <div key={request._id || request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {request.blood_type} - {request.component_type} ({request.quantity_units} units)
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.department} • Requested by: {request.requested_by}
                          </div>
                          <div className="text-xs text-gray-400">
                            Patient: {request.patient_id} • {request.medical_indication}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getUrgencyColor(request.urgency_level)}>
                          {request.urgency_level}
                        </Badge>
                        <Badge variant="outline">
                          {request.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Process
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Blood Type Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-red-600" />
                    Blood Type Distribution
                  </CardTitle>
                  <CardDescription>Current inventory levels by blood type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.bloodTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bloodType" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="available" stackId="a" fill="#22c55e" name="Available" />
                      <Bar dataKey="reserved" stackId="a" fill="#eab308" name="Reserved" />
                      <Bar dataKey="expired" stackId="a" fill="#ef4444" name="Expired" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Donor Eligibility Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Donor Eligibility by Blood Type
                  </CardTitle>
                  <CardDescription>Eligible vs ineligible donors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.donorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bloodType" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="eligible" fill="#22c55e" name="Eligible" />
                      <Bar dataKey="ineligible" fill="#ef4444" name="Ineligible" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Request Urgency Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-600" />
                    Requests by Urgency
                  </CardTitle>
                  <CardDescription>Blood request distribution by urgency level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.requestData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="urgency" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pending" fill="#eab308" name="Pending" />
                      <Bar dataKey="fulfilled" fill="#22c55e" name="Fulfilled" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Inventory Status Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
                    Overall Inventory Status
                  </CardTitle>
                  <CardDescription>Distribution of all blood units by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Available',
                            value: chartData.bloodTypeData.reduce((sum: number, item: any) => sum + item.available, 0),
                            fill: '#22c55e'
                          },
                          {
                            name: 'Reserved',
                            value: chartData.bloodTypeData.reduce((sum: number, item: any) => sum + item.reserved, 0),
                            fill: '#eab308'
                          },
                          {
                            name: 'Expired',
                            value: chartData.bloodTypeData.reduce((sum: number, item: any) => sum + item.expired, 0),
                            fill: '#ef4444'
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.bloodTypeData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['#22c55e', '#eab308', '#ef4444'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions for Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Chart Actions</CardTitle>
                <CardDescription>Export and analyze chart data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Charts
                  </Button>
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Full Analytics
                  </Button>
                  <Button variant="outline" onClick={loadDashboardData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  AI-Powered Demand Forecasting
                </CardTitle>
                <CardDescription>ARIMA model predictions for blood demand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(forecasts).map(([bloodType, forecast]: [string, any]) => (
                    <div key={bloodType} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-lg">{bloodType}</h3>
                        <Badge variant="outline" className="flex items-center">
                          <Brain className="h-3 w-3 mr-1" />
                          ARIMA Model
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {forecast.forecasts?.slice(0, 3).map((point: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{new Date(point.date).toLocaleDateString()}</span>
                            <span className="font-medium">{point.predicted_demand} units</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs text-gray-500">
                          Model: {forecast.model_info?.algorithm || 'ARIMA'} •
                          Confidence: {((forecast.forecasts?.[0]?.confidence_level || 0.95) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-green-600" />
                    Optimization Recommendations
                  </CardTitle>
                  <CardDescription>AI-generated inventory optimization suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.recommendations?.map((rec: any, index: number) => (
                      <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-green-800">{rec.blood_type}</div>
                            <div className="text-sm text-green-700 mt-1">{rec.recommendation}</div>
                            <div className="text-xs text-green-600 mt-2">
                              Priority: {rec.priority} • Confidence: {(rec.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {rec.action}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                    Performance Analytics
                  </CardTitle>
                  <CardDescription>System performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-indigo-50 rounded">
                        <span className="text-sm font-medium">Fulfillment Rate</span>
                        <span className="text-lg font-bold text-indigo-600">
                          {analytics.fulfillment_rate || '92%'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <span className="text-sm font-medium">Wastage Rate</span>
                        <span className="text-lg font-bold text-green-600">
                          {analytics.wastage_rate || '3.2%'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                        <span className="text-sm font-medium">Avg Response Time</span>
                        <span className="text-lg font-bold text-blue-600">
                          {analytics.avg_response_time || '24 min'}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2 text-teal-600" />
                    Clinical Integration
                  </CardTitle>
                  <CardDescription>DHIS2 and clinical data status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dhis2Status && (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">DHIS2 Connection</span>
                          <Badge className={
                            dhis2Status.status === 'connected'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }>
                            {dhis2Status.status}
                          </Badge>
                        </div>
                        {dhis2Status.status === 'connected' && (
                          <div className="text-sm text-gray-600">
                            <div>User: {dhis2Status.user}</div>
                            <div>Organization: {dhis2Status.organization}</div>
                            <div>Version: {dhis2Status.server_version}</div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="font-medium text-teal-800 mb-2">Data Sources</div>
                      <div className="text-sm text-teal-700 space-y-1">
                        <div>• Real-time inventory tracking</div>
                        <div>• ARIMA forecasting models</div>
                        <div>• Clinical donor eligibility</div>
                        <div>• DHIS2 health information system</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
