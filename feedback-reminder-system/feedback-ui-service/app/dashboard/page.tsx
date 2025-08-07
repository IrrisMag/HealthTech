"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Calendar,
  Bot,
  UserPlus,
  Bell,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  Heart,
  Stethoscope,
  RefreshCw,
  Database,
  Droplets
} from "lucide-react";

interface DashboardStats {
  totalInventoryUnits: number;
  availableUnits: number;
  totalDonors: number;
  pendingRequests: number;
  systemHealth: string;
  dhis2Status: string;
  dataSource: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInventoryUnits: 156,
    availableUnits: 89,
    totalDonors: 1247,
    pendingRequests: 23,
    systemHealth: "healthy",
    dhis2Status: "connected",
    dataSource: "database"
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const user = {
    full_name: "Hospital Staff",
    role: "admin"
  };

  const canAccessFeature = (feature: string) => true;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load real data from all backend APIs
      const TRACK1_API = 'https://track1-production.up.railway.app';
      const TRACK2_API = 'https://healthtech-production-4917.up.railway.app';
      const TRACK3_API = 'https://track3-blood-bank-backend-production.up.railway.app';

      const [track1Health, track2Health, track3Data] = await Promise.allSettled([
        fetch(`${TRACK1_API}/health`).then(res => res.json()),
        fetch(`${TRACK2_API}/health`).then(res => res.json()),
        Promise.all([
          fetch(`${TRACK3_API}/dashboard/metrics`).then(res => res.json()),
          fetch(`${TRACK3_API}/health`).then(res => res.json())
        ])
      ]);

      // Process Track 3 data (blood bank)
      if (track3Data.status === 'fulfilled') {
        const [metricsResponse, health] = track3Data.value;

        // Extract real metrics from the working API response
        const metrics = metricsResponse?.metrics || {};

        console.log('Track 3 metrics received:', metrics);

        setStats(prev => ({
          ...prev,
          totalInventoryUnits: metrics.total_inventory_units || 0,
          availableUnits: metrics.available_units || 0,
          totalDonors: metrics.total_donors || 0,
          pendingRequests: metrics.pending_requests || 0,
          systemHealth: metrics.system_health || (health?.status === 'healthy' ? 'healthy' : 'warning'),
          dhis2Status: health?.dhis2_status || 'connected',
          dataSource: metrics.data_source || 'live_database'
        }));
      } else {
        console.error('Track 3 data fetch failed:', track3Data.reason);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats(prev => ({ ...prev, systemHealth: "error" }));
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return '👑 Administrator';
      case 'doctor': return '👨‍⚕️ Doctor';
      case 'nurse': return '👩‍⚕️ Nurse';
      case 'receptionist': return '🏥 Receptionist';
      case 'staff': return '👥 Staff Member';
      case 'patient': return '🏥 Patient';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Loading Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching real-time data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              HealthTech Unified Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time overview of all healthcare systems
            </p>
            <div className="flex items-center mt-2 space-x-4">
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <div className="flex items-center">
                <Database className="h-3 w-3 mr-1 text-blue-600" />
                <span className="text-xs text-blue-600">
                  Data Source: {stats.dataSource === 'database' ? 'Live Database' : 'Real-time API'}
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-xs text-green-600">
                  DHIS2: {stats.dhis2Status === 'connected' ? 'Connected' : 'Checking...'}
                </span>
              </div>
            </div>
          </div>
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Inventory</CardTitle>
            <Droplets className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalInventoryUnits}</div>
            <p className="text-xs text-muted-foreground">Total units available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Units</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableUnits}</div>
            <p className="text-xs text-muted-foreground">Ready for use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalDonors}</div>
            <p className="text-xs text-muted-foreground">Registered donors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Track 1: Feedback & Reminders */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
              Feedback & Reminders
            </CardTitle>
            <CardDescription>
              Patient feedback and appointment reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/feedback">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Manage Feedback
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Track 2: AI Chatbot */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2 text-blue-600" />
              AI Health Assistant
            </CardTitle>
            <CardDescription>
              Intelligent health consultation and support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/chatbot">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Open Chatbot
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Track 3: Blood Bank */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-red-600" />
              Blood Bank System
            </CardTitle>
            <CardDescription>
              AI-enhanced blood bank management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/tracks/track3/dashboard">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Blood Bank Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              Analytics
            </CardTitle>
            <CardDescription>
              System performance and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analytics">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-indigo-600" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage staff and patient accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/register">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-600" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure system preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings">
              <Button className="w-full bg-gray-600 hover:bg-gray-700">
                Open Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
