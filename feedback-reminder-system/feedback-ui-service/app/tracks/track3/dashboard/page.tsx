"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Droplets,
  Users,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Activity,
  Database,
  Brain,
  CheckCircle,
  Clock
} from "lucide-react";

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

export default function Track3Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  const TRACK3_API = 'https://track3-blood-bank-backend-production.up.railway.app';

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
      loadTrack3Data();
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/login');
      return;
    }
  }, [router]);

  const loadTrack3Data = async () => {
    setLoading(true);
    try {
      const [inventoryRes, donorsRes, healthRes, forecastRes] = await Promise.allSettled([
        fetch(`${TRACK3_API}/inventory`),
        fetch(`${TRACK3_API}/donors?limit=10`),
        fetch(`${TRACK3_API}/health`),
        fetch(`${TRACK3_API}/forecast/O+`)
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

      // Process forecast data
      if (forecastRes.status === 'fulfilled' && forecastRes.value.ok) {
        const forecastData = await forecastRes.value.json();
        setForecast(forecastData);
      }

    } catch (error) {
      console.error('Error loading Track 3 data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-lg font-medium text-gray-700">Loading Blood Bank Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to Track 3 backend</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalUnits = inventory.reduce((sum, item) => sum + item.units_available, 0);
  const criticalTypes = inventory.filter(item => item.units_available < 10);
  const activeDonors = donors.filter(donor => donor.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Main Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Droplets className="h-8 w-8 mr-3 text-red-600" />
                  Blood Bank Management System
                </h1>
                <p className="text-gray-600 mt-1">AI-Enhanced Blood Inventory & Donor Management</p>
              </div>
            </div>
            <Button onClick={loadTrack3Data} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Blood Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplets className="h-5 w-5 mr-2 text-red-600" />
                Blood Inventory
              </CardTitle>
              <CardDescription>Current blood stock levels by type</CardDescription>
            </CardHeader>
            <CardContent>
              {inventory.length > 0 ? (
                <div className="space-y-3">
                  {inventory.slice(0, 8).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-bold text-sm">{item.blood_type}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.blood_type}</p>
                          <p className="text-sm text-gray-500">
                            Expires: {new Date(item.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{item.units_available}</p>
                        <p className="text-sm text-gray-500">units</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No inventory data available</p>
                  <p className="text-sm text-gray-400">Check your API connection</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                AI Demand Forecast
              </CardTitle>
              <CardDescription>ARIMA model predictions for O+ blood type</CardDescription>
            </CardHeader>
            <CardContent>
              {forecast ? (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Model Accuracy</span>
                      <span className="text-purple-600 font-bold">{forecast.model_accuracy}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Forecast Period</span>
                      <span className="text-gray-600">{forecast.forecast_period} days</span>
                    </div>
                  </div>
                  
                  {forecast.forecasts && forecast.forecasts.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Range: {item.lower_bound} - {item.upper_bound} units
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-purple-600">{item.predicted_demand}</p>
                        <p className="text-sm text-gray-500">predicted units</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">AI forecast unavailable</p>
                  <p className="text-sm text-gray-400">Loading prediction model...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/blood-bank">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-red-600" />
                  Manage Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Add, update, or remove blood units from inventory</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/donors">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Donor Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Register new donors and manage donor database</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/requests">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Blood Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Process and fulfill blood transfusion requests</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
