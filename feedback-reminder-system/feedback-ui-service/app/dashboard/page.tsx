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
  Stethoscope
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayReminders: 89,
    pendingFeedback: 23,
    totalUsers: 156,
    systemHealth: "healthy"
  });

  // Mock user - no authentication needed
  const user = {
    full_name: "Hospital Staff",
    role: "admin" // Default to admin to show all features
  };

  const canAccessFeature = (feature: string) => true; // Allow access to all features

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return '👑 Administrator';
      case 'nurse': return '👩‍⚕️ Nurse';
      case 'receptionist': return '🏥 Receptionist';
      case 'doctor': return '👨‍⚕️ Doctor';
      case 'staff': return '👥 Staff Member';
      case 'patient': return '🏥 Patient';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-purple-50 to-blue-50';
      case 'doctor': return 'from-blue-50 to-cyan-50';
      case 'nurse': return 'from-green-50 to-teal-50';
      case 'receptionist': return 'from-orange-50 to-yellow-50';
      case 'staff': return 'from-gray-50 to-slate-50';
      case 'patient': return 'from-pink-50 to-rose-50';
      default: return 'from-blue-50 to-white';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getRoleColor(user.role)}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 HealthTech Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user.full_name} ({getRoleDisplayName(user.role)})
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Douala General Hospital - Patient Feedback & Management System
          </p>
        </div>

        {/* Role-based Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {canAccessFeature('reminders') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user.role === 'admin' ? 'Total Reminders' : 'Today\'s Reminders'}
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayReminders}</div>
                <p className="text-xs text-muted-foreground">
                  {user.role === 'admin' ? 'System-wide' : 'Scheduled for today'}
                </p>
              </CardContent>
            </Card>
          )}

          {canAccessFeature('feedback') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingFeedback}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          )}

          {user.role === 'admin' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Registered in system
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                Online
              </div>
              <p className="text-xs text-muted-foreground">
                All services operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role-based Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Patient Registration - for staff roles */}
          {canAccessFeature('patient-registration') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
                  Patient Registration
                </CardTitle>
                <CardDescription>
                  Register new patients and update information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/register-patient">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Register Patient
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Feedback Management */}
          {canAccessFeature('feedback') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                  Patient Feedback
                </CardTitle>
                <CardDescription>
                  {user.role === 'patient' ? 'Submit your feedback' : 'Review and manage patient feedback'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/feedback">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    {user.role === 'patient' ? 'Submit Feedback' : 'Manage Feedback'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* AI Health Assistant */}
          {canAccessFeature('chatbot') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-purple-600" />
                  AI Health Assistant
                </CardTitle>
                <CardDescription>
                  Get instant answers to health questions with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/chatbot">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Open AI Assistant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Appointment Reminders */}
          {canAccessFeature('reminders') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                  Appointment Reminders
                </CardTitle>
                <CardDescription>
                  Schedule and manage patient reminders via SMS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/reminders">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Manage Reminders
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Analytics - for admin and doctors */}
          {canAccessFeature('analytics') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                  Analytics & Reports
                </CardTitle>
                <CardDescription>
                  View detailed analytics and system reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/analytics">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Staff Registration - admin only */}
          {canAccessFeature('user-registration') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Staff Registration
                </CardTitle>
                <CardDescription>
                  Register new staff members and assign roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/register">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Register Staff
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {canAccessFeature('notifications') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-yellow-600" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  View system notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/notifications">
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    View Notifications
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Blood Bank Dashboard - for blood bank staff */}
          {canAccessFeature('blood-bank-dashboard') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  Blood Bank Dashboard
                </CardTitle>
                <CardDescription>
                  Access the AI-enhanced blood bank system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="https://track3-blood-bank-dashboard.netlify.app" target="_blank">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Open Blood Bank
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* System Settings - admin only */}
          {canAccessFeature('system-settings') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure system settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/settings">
                  <Button className="w-full bg-gray-600 hover:bg-gray-700">
                    System Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
