"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  RefreshCw,
  Calendar,
  Brain,
  Droplets,
  Plus,
  ArrowLeft,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

// Blood Bank Analytics Types
interface BloodInventory {
  blood_type: string;
  units_available: number;
  expiry_date: string;
  status: string;
}

interface Donor {
  id: string;
  name: string;
  blood_type: string;
  last_donation: string;
  status: string;
}

interface ForecastData {
  blood_type: string;
  model_accuracy: number;
  forecast_period: number;
  forecasts: Array<{
    date: string;
    predicted_demand: number;
    confidence_level: number;
    lower_bound: number;
    upper_bound: number;
  }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [forecasts, setForecasts] = useState<Record<string, ForecastData>>({});
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const TRACK3_API = 'https://track3-blood-bank-backend-production.up.railway.app';
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadAnalyticsData();
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/login');
      return;
    }
  }, [router]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load real data from Track 3 backend
      const [inventoryRes, donorsRes, healthRes] = await Promise.allSettled([
        fetch(`${TRACK3_API}/inventory`),
        fetch(`${TRACK3_API}/donors`),
        fetch(`${TRACK3_API}/health`)
      ]);

      // Process inventory data
      if (inventoryRes.status === 'fulfilled' && inventoryRes.value.ok) {
        const inventoryData = await inventoryRes.value.json();
        setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      }

      // Process donors data
      if (donorsRes.status === 'fulfilled' && donorsRes.value.ok) {
        const donorsData = await donorsRes.value.json();
        setDonors(Array.isArray(donorsData) ? donorsData : []);
      }

      // Process health data
      if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
        const healthData = await healthRes.value.json();
        setSystemHealth(healthData);
      }

      // Load forecast data for each blood type
      const forecastPromises = bloodTypes.map(async (bloodType) => {
        try {
          const response = await fetch(`${TRACK3_API}/forecast/${bloodType}`);
          if (response.ok) {
            const data = await response.json();
            return { bloodType, data };
          }
        } catch (error) {
          console.error(`Error loading forecast for ${bloodType}:`, error);
        }
        return null;
      });

      const forecastResults = await Promise.allSettled(forecastPromises);
      const forecastData: Record<string, ForecastData> = {};
      
      forecastResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const { bloodType, data } = result.value;
          forecastData[bloodType] = data;
        }
      });
      
      setForecasts(forecastData);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics metrics
  const totalUnits = inventory.reduce((sum, item) => sum + item.units_available, 0);
  const criticalTypes = inventory.filter(item => item.units_available < 10);
  const activeDonors = donors.filter(donor => donor.status === 'active').length;
  const bloodTypeDistribution = inventory.reduce((acc, item) => {
    acc[item.blood_type] = (acc[item.blood_type] || 0) + item.units_available;
    return acc;
  }, {} as Record<string, number>);

  // Simple Bar Chart Component
  const BloodTypeChart = ({ data, title }: { data: Record<string, number>, title: string }) => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="space-y-3">
          {Object.entries(data).map(([bloodType, units]) => (
            <div key={bloodType} className="flex items-center space-x-3">
              <div className="w-12 text-sm font-medium">{bloodType}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div 
                  className="bg-red-500 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(units / maxValue) * 100}%` }}
                >
                  <span className="text-white text-xs font-bold">{units}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Forecast Chart Component
  const ForecastChart = ({ forecast, bloodType }: { forecast: ForecastData, bloodType: string }) => {
    if (!forecast.forecasts || forecast.forecasts.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{bloodType} Forecast</h4>
          <Badge variant="outline">{forecast.model_accuracy}% accuracy</Badge>
        </div>
        <div className="space-y-2">
          {forecast.forecasts.slice(0, 7).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
              <div className="text-right">
                <div className="font-bold text-purple-600">{item.predicted_demand}</div>
                <div className="text-xs text-gray-500">
                  {item.lower_bound}-{item.upper_bound} range
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Loading Analytics...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching real-time blood bank data</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                  Blood Bank Analytics
                </h1>
                <p className="text-gray-600 mt-1">Real-time data insights and AI forecasting</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/donors">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Donor
                </Button>
              </Link>
              <Link href="/donations">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Donation
                </Button>
              </Link>
              <Button onClick={loadAnalyticsData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blood Units</CardTitle>
              <Droplets className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalUnits}</div>
              <p className="text-xs text-muted-foreground">Units in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{criticalTypes.length}</div>
              <p className="text-xs text-muted-foreground">Blood types below 10 units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeDonors}</div>
              <p className="text-xs text-muted-foreground">Registered active donors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {systemHealth?.status === 'healthy' ? 'Healthy' : 'Warning'}
              </div>
              <p className="text-xs text-muted-foreground">
                DHIS2: {systemHealth?.dhis2_status || 'Unknown'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bloodtypes">Blood Types</TabsTrigger>
            <TabsTrigger value="forecasting">AI Forecasting</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                    Blood Type Distribution
                  </CardTitle>
                  <CardDescription>Current inventory by blood type</CardDescription>
                </CardHeader>
                <CardContent>
                  <BloodTypeChart data={bloodTypeDistribution} title="" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-600" />
                    Donor Statistics
                  </CardTitle>
                  <CardDescription>Donor breakdown by blood type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bloodTypes.map(bloodType => {
                      const count = donors.filter(d => d.blood_type === bloodType).length;
                      return (
                        <div key={bloodType} className="flex items-center justify-between">
                          <span className="font-medium">{bloodType}</span>
                          <Badge variant="outline">{count} donors</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bloodtypes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bloodTypes.map(bloodType => (
                <Card key={bloodType}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Droplets className="h-5 w-5 mr-2 text-red-600" />
                      {bloodType} Blood Type
                    </CardTitle>
                    <CardDescription>Inventory and donor information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Units Available:</span>
                        <Badge variant="outline" className="text-lg">
                          {bloodTypeDistribution[bloodType] || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Active Donors:</span>
                        <Badge variant="outline">
                          {donors.filter(d => d.blood_type === bloodType && d.status === 'active').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Status:</span>
                        <Badge variant={
                          (bloodTypeDistribution[bloodType] || 0) < 10 ? "destructive" : "default"
                        }>
                          {(bloodTypeDistribution[bloodType] || 0) < 10 ? "Critical" : "Normal"}
                        </Badge>
                      </div>
                    </div>
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
