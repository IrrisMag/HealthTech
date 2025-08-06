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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  Activity,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  MapPin,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  BarChart3,
  TrendingUp,
  Database
} from "lucide-react";
import {
  getBloodInventory,
  getDashboardMetrics,
  testDHIS2Connection
} from "@/lib/api";
import { format, parseISO, differenceInDays, isAfter, isBefore } from "date-fns";

interface InventoryItem {
  _id: string;
  donation_id: string;
  blood_type: string;
  status: string;
  collection_date: string;
  expiry_date: string;
  volume_ml: number;
  storage_location?: string;
  donor_id?: string;
}

export default function RealTimeMonitoringDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataSource, setDataSource] = useState("loading");
  
  // Filter states
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [bloodTypeFilter, setBloodTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("");

  // Chart data
  const [chartData, setChartData] = useState<any>({
    bloodTypeDistribution: [],
    statusDistribution: [],
    expiryTrends: [],
    shelfLifeData: []
  });

  useEffect(() => {
    loadInventoryData();
    
    // Auto-refresh every 30 seconds if enabled
    const interval = autoRefresh ? setInterval(loadInventoryData, 30000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    applyFilters();
  }, [inventory, dateFilter, bloodTypeFilter, statusFilter, locationFilter, expiryFilter]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [inventoryResponse, dhis2Response] = await Promise.allSettled([
        getBloodInventory(),
        testDHIS2Connection()
      ]);

      if (inventoryResponse.status === 'fulfilled') {
        const inventoryData = inventoryResponse.value.inventory || [];
        setInventory(inventoryData);
        setDataSource(inventoryResponse.value.data_source || "unknown");
        processChartData(inventoryData);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inventory];

    // Date filter
    if (dateFilter.start && dateFilter.end) {
      filtered = filtered.filter(item => {
        const collectionDate = parseISO(item.collection_date);
        return isAfter(collectionDate, parseISO(dateFilter.start)) && 
               isBefore(collectionDate, parseISO(dateFilter.end));
      });
    }

    // Blood type filter
    if (bloodTypeFilter) {
      filtered = filtered.filter(item => item.blood_type === bloodTypeFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(item => 
        item.storage_location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Expiry filter
    if (expiryFilter) {
      const today = new Date();
      filtered = filtered.filter(item => {
        const expiryDate = parseISO(item.expiry_date);
        const daysToExpiry = differenceInDays(expiryDate, today);
        
        switch (expiryFilter) {
          case 'expired':
            return daysToExpiry < 0;
          case 'expiring_soon':
            return daysToExpiry >= 0 && daysToExpiry <= 7;
          case 'good':
            return daysToExpiry > 7;
          default:
            return true;
        }
      });
    }

    setFilteredInventory(filtered);
  };

  const processChartData = (inventoryData: InventoryItem[]) => {
    // Blood type distribution
    const bloodTypeCount: any = {};
    const statusCount: any = {};
    const locationCount: any = {};
    
    inventoryData.forEach(item => {
      // Blood type distribution by status
      if (!bloodTypeCount[item.blood_type]) {
        bloodTypeCount[item.blood_type] = { available: 0, reserved: 0, expired: 0, total: 0 };
      }
      bloodTypeCount[item.blood_type][item.status] = (bloodTypeCount[item.blood_type][item.status] || 0) + 1;
      bloodTypeCount[item.blood_type].total += 1;

      // Overall status distribution
      statusCount[item.status] = (statusCount[item.status] || 0) + 1;

      // Location distribution
      if (item.storage_location) {
        locationCount[item.storage_location] = (locationCount[item.storage_location] || 0) + 1;
      }
    });

    const bloodTypeDistribution = Object.entries(bloodTypeCount).map(([type, counts]: [string, any]) => ({
      bloodType: type,
      available: counts.available || 0,
      reserved: counts.reserved || 0,
      expired: counts.expired || 0,
      total: counts.total
    }));

    const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      fill: getStatusColor(status)
    }));

    // Shelf life analysis
    const today = new Date();
    const shelfLifeData = inventoryData.map(item => {
      const expiryDate = parseISO(item.expiry_date);
      const collectionDate = parseISO(item.collection_date);
      const totalShelfLife = differenceInDays(expiryDate, collectionDate);
      const remainingDays = differenceInDays(expiryDate, today);
      const usedDays = totalShelfLife - remainingDays;
      
      return {
        donation_id: item.donation_id,
        blood_type: item.blood_type,
        totalShelfLife,
        remainingDays: Math.max(0, remainingDays),
        usedDays: Math.max(0, usedDays),
        status: item.status,
        expiryCategory: remainingDays < 0 ? 'expired' : remainingDays <= 7 ? 'expiring_soon' : 'good'
      };
    });

    // Expiry trends (next 30 days)
    const expiryTrends = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = format(date, 'MMM dd');
      
      const expiringCount = inventoryData.filter(item => {
        const expiryDate = parseISO(item.expiry_date);
        return format(expiryDate, 'MMM dd') === dateStr;
      }).length;

      expiryTrends.push({
        date: dateStr,
        expiring: expiringCount,
        cumulative: expiryTrends.reduce((sum, day) => sum + day.expiring, 0) + expiringCount
      });
    }

    setChartData({
      bloodTypeDistribution,
      statusDistribution,
      expiryTrends: expiryTrends.slice(0, 14), // Show 2 weeks
      shelfLifeData
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return '#22c55e'; // Green
      case 'reserved': return '#eab308';  // Yellow
      case 'expired': return '#ef4444';   // Red
      case 'used': return '#6b7280';      // Gray
      default: return '#3b82f6';          // Blue
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = parseISO(expiryDate);
    const daysToExpiry = differenceInDays(expiry, today);

    if (daysToExpiry < 0) {
      return { status: 'Expired', color: 'bg-red-100 text-red-800', icon: AlertTriangle, days: Math.abs(daysToExpiry) };
    } else if (daysToExpiry <= 7) {
      return { status: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800', icon: Clock, days: daysToExpiry };
    } else {
      return { status: 'Good', color: 'bg-green-100 text-green-800', icon: CheckCircle, days: daysToExpiry };
    }
  };

  const exportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      dataSource,
      totalUnits: filteredInventory.length,
      summary: {
        available: filteredInventory.filter(item => item.status === 'available').length,
        reserved: filteredInventory.filter(item => item.status === 'reserved').length,
        expired: filteredInventory.filter(item => item.status === 'expired').length
      },
      bloodTypeBreakdown: chartData.bloodTypeDistribution,
      expiryAnalysis: chartData.shelfLifeData,
      filters: { dateFilter, bloodTypeFilter, statusFilter, locationFilter, expiryFilter }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blood-inventory-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Loading Real-Time Monitoring...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching live inventory data</p>
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
                <Eye className="h-8 w-8 text-blue-600 mr-3" />
                Real-Time Blood Bank Monitoring
              </h1>
              <p className="text-gray-600">
                Live inventory tracking with AI-enhanced analytics and forecasting
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant="outline" className="flex items-center">
                  <Activity className="h-3 w-3 mr-1 text-green-600" />
                  Live Data: {dataSource === 'database' ? 'Database' : 'API'}
                </Badge>
                <Badge variant="outline">
                  Last Updated: {format(lastUpdated, 'HH:mm:ss')}
                </Badge>
                <Badge variant={autoRefresh ? "default" : "outline"}>
                  Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setAutoRefresh(!autoRefresh)} 
                variant={autoRefresh ? "default" : "outline"}
              >
                <Activity className="h-4 w-4 mr-2" />
                {autoRefresh ? 'Auto ON' : 'Auto OFF'}
              </Button>
              <Button onClick={loadInventoryData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Now
              </Button>
              <Button onClick={exportReport} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Real-Time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{filteredInventory.length}</div>
              <p className="text-xs text-muted-foreground">
                {inventory.length !== filteredInventory.length ? `Filtered from ${inventory.length}` : 'All units'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {filteredInventory.filter(item => item.status === 'available').length}
              </div>
              <p className="text-xs text-muted-foreground">Ready for use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {filteredInventory.filter(item => {
                  const daysToExpiry = differenceInDays(parseISO(item.expiry_date), new Date());
                  return daysToExpiry >= 0 && daysToExpiry <= 7;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">≤ 7 days to expiry</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {filteredInventory.filter(item => {
                  const daysToExpiry = differenceInDays(parseISO(item.expiry_date), new Date());
                  return daysToExpiry < 0;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">Requires disposal</p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Advanced Filters
            </CardTitle>
            <CardDescription>Filter inventory by date, blood type, location, and expiry status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                    placeholder="Start date"
                  />
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Blood Type Filter */}
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

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="expired">Expired</option>
                  <option value="used">Used</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Storage Location</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>

              {/* Expiry Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Status</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={expiryFilter}
                  onChange={(e) => setExpiryFilter(e.target.value)}
                >
                  <option value="">All Expiry Status</option>
                  <option value="good">Good (>7 days)</option>
                  <option value="expiring_soon">Expiring Soon (≤7 days)</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {filteredInventory.length} of {inventory.length} units
              </div>
              <Button
                onClick={() => {
                  setDateFilter({ start: "", end: "" });
                  setBloodTypeFilter("");
                  setStatusFilter("");
                  setLocationFilter("");
                  setExpiryFilter("");
                }}
                variant="outline"
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-Time Visualizations */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="shelf-life">Shelf Life</TabsTrigger>
            <TabsTrigger value="inventory">Inventory List</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Blood Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-red-600" />
                    Blood Type Distribution
                  </CardTitle>
                  <CardDescription>Stock levels by blood type and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.bloodTypeDistribution}>
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

              {/* Status Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Overall Status Distribution
                  </CardTitle>
                  <CardDescription>Current inventory status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count, percent }) => `${status}: ${count} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {chartData.statusDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  Expiry Trends (Next 14 Days)
                </CardTitle>
                <CardDescription>Units expiring by date with cumulative view</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData.expiryTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="expiring" stackId="1" stroke="#ef4444" fill="#ef4444" name="Units Expiring" />
                    <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" strokeWidth={2} name="Cumulative" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shelf Life Tab */}
          <TabsContent value="shelf-life" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shelf Life Histogram */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-600" />
                    Shelf Life Distribution
                  </CardTitle>
                  <CardDescription>Days remaining until expiry</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={
                      chartData.shelfLifeData.reduce((acc: any[], item: any) => {
                        const category = item.expiryCategory;
                        const existing = acc.find(a => a.category === category);
                        if (existing) {
                          existing.count += 1;
                        } else {
                          acc.push({
                            category: category === 'expired' ? 'Expired' :
                                     category === 'expiring_soon' ? 'Expiring Soon' : 'Good',
                            count: 1,
                            fill: category === 'expired' ? '#ef4444' :
                                  category === 'expiring_soon' ? '#eab308' : '#22c55e'
                          });
                        }
                        return acc;
                      }, [])
                    }>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Shelf Life Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                    Shelf Life Indicators
                  </CardTitle>
                  <CardDescription>Color-coded expiry status overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['expired', 'expiring_soon', 'good'].map(category => {
                      const items = chartData.shelfLifeData.filter((item: any) => item.expiryCategory === category);
                      const color = category === 'expired' ? 'text-red-600 bg-red-50' :
                                   category === 'expiring_soon' ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50';
                      const label = category === 'expired' ? 'Expired' :
                                   category === 'expiring_soon' ? 'Expiring Soon (≤7 days)' : 'Good (>7 days)';

                      return (
                        <div key={category} className={`p-4 rounded-lg ${color}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{label}</h3>
                              <p className="text-sm opacity-75">{items.length} units</p>
                            </div>
                            <div className="text-2xl font-bold">
                              {((items.length / chartData.shelfLifeData.length) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Critical Expiry Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Critical Expiry Alerts
                </CardTitle>
                <CardDescription>Units requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredInventory
                    .filter(item => {
                      const daysToExpiry = differenceInDays(parseISO(item.expiry_date), new Date());
                      return daysToExpiry <= 3 && daysToExpiry >= 0; // Next 3 days
                    })
                    .slice(0, 10)
                    .map(item => {
                      const expiryStatus = getExpiryStatus(item.expiry_date);
                      const ExpiryIcon = expiryStatus.icon;

                      return (
                        <div key={item._id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                          <div className="flex items-center space-x-3">
                            <Heart className="h-5 w-5 text-red-600" />
                            <div>
                              <div className="font-medium">{item.donation_id}</div>
                              <div className="text-sm text-gray-500">
                                {item.blood_type} • {item.volume_ml}ml • {item.storage_location}
                              </div>
                            </div>
                          </div>
                          <Badge className={expiryStatus.color}>
                            <ExpiryIcon className="h-3 w-3 mr-1" />
                            {expiryStatus.days} days
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory List Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-600" />
                    Detailed Inventory List
                  </span>
                  <Badge variant="outline">
                    {filteredInventory.length} units
                  </Badge>
                </CardTitle>
                <CardDescription>Complete inventory with real-time status and expiry information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredInventory.map(item => {
                    const expiryStatus = getExpiryStatus(item.expiry_date);
                    const ExpiryIcon = expiryStatus.icon;

                    return (
                      <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <Heart className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium text-lg">{item.donation_id}</div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                  <Heart className="h-3 w-3 mr-1 text-red-500" />
                                  {item.blood_type}
                                </span>
                                <span>{item.volume_ml}ml</span>
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {item.storage_location || 'Not specified'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Collected: {format(parseISO(item.collection_date), 'MMM dd, yyyy')}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Expires: {format(parseISO(item.expiry_date), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge className={`${getStatusColor(item.status)} text-white`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>

                          <Badge className={expiryStatus.color}>
                            <ExpiryIcon className="h-3 w-3 mr-1" />
                            {expiryStatus.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
