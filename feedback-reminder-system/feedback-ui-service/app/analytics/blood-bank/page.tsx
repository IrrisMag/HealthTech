"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Droplets,
  Users,
  RefreshCw,
  ArrowLeft,
  Plus,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity
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

export default function BloodBankAnalytics() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);

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
      loadBloodBankData();
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/login');
      return;
    }
  }, [router]);

  const loadBloodBankData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, donorsRes, healthRes] = await Promise.allSettled([
        fetch(`${TRACK3_API}/inventory`),
        fetch(`${TRACK3_API}/donors`),
        fetch(`${TRACK3_API}/health`)
      ]);

      if (inventoryRes.status === 'fulfilled' && inventoryRes.value.ok) {
        const inventoryData = await inventoryRes.value.json();
        setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      }

      if (donorsRes.status === 'fulfilled' && donorsRes.value.ok) {
        const donorsData = await donorsRes.value.json();
        setDonors(Array.isArray(donorsData) ? donorsData : []);
      }

      if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
        const healthData = await healthRes.value.json();
        setSystemHealth(healthData);
      }

    } catch (error) {
      console.error('Error loading blood bank data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalUnits = inventory.reduce((sum, item) => sum + item.units_available, 0);
  const criticalTypes = inventory.filter(item => item.units_available < 10);
  const activeDonors = donors.filter(donor => donor.status === 'active').length;
  
  const bloodTypeDistribution = inventory.reduce((acc, item) => {
    acc[item.blood_type] = (acc[item.blood_type] || 0) + item.units_available;
    return acc;
  }, {} as Record<string, number>);

  const donorDistribution = donors.reduce((acc, donor) => {
    acc[donor.blood_type] = (acc[donor.blood_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Simple Bar Chart Component
  const BloodTypeChart = ({ data, title, color = "bg-red-500" }: { 
    data: Record<string, number>, 
    title: string,
    color?: string 
  }) => {
    const maxValue = Math.max(...Object.values(data), 1);
    
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="space-y-3">
          {bloodTypes.map(bloodType => {
            const value = data[bloodType] || 0;
            return (
              <div key={bloodType} className="flex items-center space-x-3">
                <div className="w-12 text-sm font-medium">{bloodType}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className={`${color} h-6 rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max((value / maxValue) * 100, 5)}%` }}
                  >
                    <span className="text-white text-xs font-bold">{value}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-lg font-medium text-gray-700">Loading Blood Bank Analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/analytics">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Analytics
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Droplets className="h-8 w-8 mr-3 text-red-600" />
                  Blood Bank Analytics
                </h1>
                <p className="text-gray-600 mt-1">Real-time blood inventory and donor insights</p>
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
              <Button onClick={loadBloodBankData} variant="outline">
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplets className="h-5 w-5 mr-2 text-red-600" />
                Blood Inventory by Type
              </CardTitle>
              <CardDescription>Current units available for each blood type</CardDescription>
            </CardHeader>
            <CardContent>
              <BloodTypeChart data={bloodTypeDistribution} title="" color="bg-red-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Donors by Blood Type
              </CardTitle>
              <CardDescription>Number of registered donors per blood type</CardDescription>
            </CardHeader>
            <CardContent>
              <BloodTypeChart data={donorDistribution} title="" color="bg-blue-500" />
            </CardContent>
          </Card>
        </div>

        {/* Individual Blood Type Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Individual Blood Type Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bloodTypes.map(bloodType => {
              const units = bloodTypeDistribution[bloodType] || 0;
              const donorCount = donorDistribution[bloodType] || 0;
              const isCritical = units < 10;
              
              return (
                <Card key={bloodType} className={isCritical ? "border-orange-200 bg-orange-50" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Droplets className="h-5 w-5 mr-2 text-red-600" />
                        {bloodType}
                      </span>
                      <Badge variant={isCritical ? "destructive" : "default"}>
                        {isCritical ? "Critical" : "Normal"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Units Available:</span>
                        <span className="font-bold text-lg text-red-600">{units}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Donors:</span>
                        <span className="font-bold text-blue-600">{donorCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ratio:</span>
                        <span className="font-medium">
                          {donorCount > 0 ? (units / donorCount).toFixed(1) : '0'} units/donor
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Critical Alerts */}
        {criticalTypes.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Critical Stock Alert
              </CardTitle>
              <CardDescription className="text-orange-700">
                The following blood types have critically low inventory levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {criticalTypes.map(item => (
                  <div key={item.blood_type} className="bg-white p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-orange-800">{item.blood_type}</span>
                      <span className="text-orange-600 font-bold">{item.units_available} units</span>
                    </div>
                    <p className="text-sm text-orange-600 mt-1">
                      Expires: {new Date(item.expiry_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
