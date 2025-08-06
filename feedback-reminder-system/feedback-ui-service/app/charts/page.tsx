"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from "recharts";
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  RefreshCw,
  Download,
  Calendar,
  Heart,
  Users,
  Clock,
  Target
} from "lucide-react";
import {
  getBloodInventory,
  getDonors,
  getDonations,
  getBloodRequests,
  getBloodForecast,
  getPerformanceAnalytics
} from "@/lib/api";
import { format, subDays, parseISO } from "date-fns";

export default function ChartsPage() {
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [donorData, setDonorData] = useState<any[]>([]);
  const [donationTrends, setDonationTrends] = useState<any[]>([]);
  const [requestData, setRequestData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [dataSource, setDataSource] = useState("loading");

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    setLoading(true);
    try {
      // Load all data for charts
      const [
        inventory,
        donors,
        donations,
        requests,
        analytics
      ] = await Promise.allSettled([
        getBloodInventory(),
        getDonors(0, 1000), // Get more data for charts
        getDonations(0, 1000),
        getBloodRequests(0, 1000),
        getPerformanceAnalytics()
      ]);

      // Process inventory data for charts
      if (inventory.status === 'fulfilled') {
        const inventoryItems = inventory.value.inventory || [];
        setDataSource(inventory.value.data_source || "unknown");
        
        // Blood type distribution
        const bloodTypeCount: any = {};
        const statusCount: any = {};
        
        inventoryItems.forEach((item: any) => {
          // Blood type distribution
          bloodTypeCount[item.blood_type] = (bloodTypeCount[item.blood_type] || 0) + 1;
          
          // Status distribution
          statusCount[item.status] = (statusCount[item.status] || 0) + 1;
        });

        const inventoryChartData = Object.entries(bloodTypeCount).map(([type, count]) => ({
          bloodType: type,
          available: inventoryItems.filter((item: any) => item.blood_type === type && item.status === 'available').length,
          reserved: inventoryItems.filter((item: any) => item.blood_type === type && item.status === 'reserved').length,
          expired: inventoryItems.filter((item: any) => item.blood_type === type && item.status === 'expired').length,
          total: count
        }));

        setInventoryData(inventoryChartData);
      }

      // Process donor data for charts
      if (donors.status === 'fulfilled') {
        const donorList = donors.value.donors || [];
        
        const donorChartData = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bloodType => {
          const typeCount = donorList.filter((donor: any) => donor.blood_type === bloodType).length;
          const eligibleCount = donorList.filter((donor: any) => 
            donor.blood_type === bloodType && donor.is_eligible
          ).length;
          
          return {
            bloodType,
            total: typeCount,
            eligible: eligibleCount,
            ineligible: typeCount - eligibleCount
          };
        });

        setDonorData(donorChartData);
      }

      // Process donation trends
      if (donations.status === 'fulfilled') {
        const donationList = donations.value.donations || [];
        
        // Create 30-day trend data
        const trendData = [];
        for (let i = 29; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dateStr = format(date, 'yyyy-MM-dd');
          
          const dayDonations = donationList.filter((donation: any) => 
            donation.collection_date?.startsWith(dateStr)
          );

          trendData.push({
            date: format(date, 'MMM dd'),
            donations: dayDonations.length,
            available: dayDonations.filter((d: any) => d.status === 'available').length,
            used: dayDonations.filter((d: any) => d.status === 'used').length
          });
        }

        setDonationTrends(trendData);
      }

      // Process request data
      if (requests.status === 'fulfilled') {
        const requestList = requests.value.requests || [];
        
        const urgencyData = ['emergency', 'critical', 'high', 'medium', 'low'].map(urgency => ({
          urgency: urgency.charAt(0).toUpperCase() + urgency.slice(1),
          count: requestList.filter((req: any) => req.urgency_level === urgency).length,
          pending: requestList.filter((req: any) => req.urgency_level === urgency && req.status === 'pending').length,
          fulfilled: requestList.filter((req: any) => req.urgency_level === urgency && req.status === 'fulfilled').length
        }));

        setRequestData(urgencyData);
      }

      // Load forecast data for key blood types
      const forecastPromises = ['O+', 'O-', 'A+', 'A-'].map(async (bloodType) => {
        try {
          const forecast = await getBloodForecast(bloodType, 7);
          return {
            bloodType,
            forecasts: forecast.forecasts || []
          };
        } catch (error) {
          return { bloodType, forecasts: [] };
        }
      });

      const forecastResults = await Promise.all(forecastPromises);
      
      // Combine forecast data
      const combinedForecast: any[] = [];
      for (let i = 0; i < 7; i++) {
        const dayData: any = { day: `Day ${i + 1}` };
        forecastResults.forEach(result => {
          if (result.forecasts[i]) {
            dayData[result.bloodType] = result.forecasts[i].predicted_demand;
          }
        });
        combinedForecast.push(dayData);
      }

      setForecastData(combinedForecast);

      // Process performance data
      if (analytics.status === 'fulfilled') {
        setPerformanceData(analytics.value);
      }

    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart colors
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];
  const BLOOD_TYPE_COLORS: any = {
    'A+': '#ef4444', 'A-': '#dc2626', 'B+': '#f97316', 'B-': '#ea580c',
    'AB+': '#eab308', 'AB-': '#ca8a04', 'O+': '#22c55e', 'O-': '#16a34a'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-lg font-medium text-gray-700">Loading Charts...</p>
          <p className="text-sm text-gray-500 mt-2">Processing real-time data for visualizations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                Blood Bank Analytics & Charts
              </h1>
              <p className="text-gray-600">
                Real-time data visualizations and trend analysis
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant="outline" className="flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  Data Source: {dataSource === 'database' ? 'Live Database' : 'Real-time API'}
                </Badge>
                <Badge variant="outline">
                  Real-time Charts
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={loadChartData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Download className="h-4 w-4 mr-2" />
                Export Charts
              </Button>
            </div>
          </div>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="donors">Donors</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          </TabsList>

          {/* Inventory Charts */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <BarChart data={inventoryData}>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Inventory Status Overview
                  </CardTitle>
                  <CardDescription>Distribution of inventory by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={inventoryData.reduce((acc: any[], item) => {
                          acc.push(
                            { name: 'Available', value: item.available, fill: '#22c55e' },
                            { name: 'Reserved', value: item.reserved, fill: '#eab308' },
                            { name: 'Expired', value: item.expired, fill: '#ef4444' }
                          );
                          return acc;
                        }, []).reduce((acc: any[], item) => {
                          const existing = acc.find(a => a.name === item.name);
                          if (existing) {
                            existing.value += item.value;
                          } else {
                            acc.push(item);
                          }
                          return acc;
                        }, [])}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {inventoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Donors Charts */}
          <TabsContent value="donors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Donor Distribution by Blood Type
                  </CardTitle>
                  <CardDescription>Total and eligible donors by blood type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={donorData}>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-600" />
                    Donor Eligibility Rate
                  </CardTitle>
                  <CardDescription>Percentage of eligible donors by blood type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={donorData.map(item => ({
                      ...item,
                      eligibilityRate: item.total > 0 ? (item.eligible / item.total * 100) : 0,
                      fill: BLOOD_TYPE_COLORS[item.bloodType] || '#8884d8'
                    }))}>
                      <RadialBar dataKey="eligibilityRate" cornerRadius={10} fill="#8884d8" />
                      <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Eligibility Rate']} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Charts */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  30-Day Donation Trends
                </CardTitle>
                <CardDescription>Daily donation patterns and usage over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={donationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="donations" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Total Donations" />
                    <Area type="monotone" dataKey="available" stackId="2" stroke="#22c55e" fill="#22c55e" name="Available" />
                    <Area type="monotone" dataKey="used" stackId="3" stroke="#ef4444" fill="#ef4444" name="Used" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Charts */}
          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-600" />
                    Requests by Urgency Level
                  </CardTitle>
                  <CardDescription>Blood request distribution by urgency</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={requestData}>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-red-600" />
                    Request Status Distribution
                  </CardTitle>
                  <CardDescription>Overall request fulfillment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={requestData.reduce((acc: any[], item) => {
                          acc.push(
                            { name: 'Pending', value: item.pending, fill: '#eab308' },
                            { name: 'Fulfilled', value: item.fulfilled, fill: '#22c55e' }
                          );
                          return acc;
                        }, []).reduce((acc: any[], item) => {
                          const existing = acc.find(a => a.name === item.name);
                          if (existing) {
                            existing.value += item.value;
                          } else {
                            acc.push(item);
                          }
                          return acc;
                        }, [])}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forecasts Charts */}
          <TabsContent value="forecasts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                  7-Day Demand Forecast (ARIMA Model)
                </CardTitle>
                <CardDescription>AI-powered demand predictions for key blood types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="O+" stroke="#22c55e" strokeWidth={2} name="O+ (Universal Donor)" />
                    <Line type="monotone" dataKey="O-" stroke="#16a34a" strokeWidth={2} name="O- (Universal)" />
                    <Line type="monotone" dataKey="A+" stroke="#ef4444" strokeWidth={2} name="A+" />
                    <Line type="monotone" dataKey="A-" stroke="#dc2626" strokeWidth={2} name="A-" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['O+', 'O-', 'A+', 'A-'].map(bloodType => (
                <Card key={bloodType}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{bloodType} Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-indigo-600">
                      {forecastData.reduce((sum, day) => sum + (day[bloodType] || 0), 0).toFixed(0)}
                    </div>
                    <p className="text-sm text-gray-500">Total 7-day demand</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
