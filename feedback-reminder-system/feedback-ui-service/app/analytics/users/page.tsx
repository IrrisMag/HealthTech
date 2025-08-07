"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  RefreshCw,
  ArrowLeft,
  Clock,
  Activity,
  TrendingUp,
  Eye,
  Calendar,
  Shield
} from "lucide-react";

export default function UserAnalytics() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userMetrics, setUserMetrics] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadUserData();
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/login');
      return;
    }
  }, [router]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Simulate user analytics data
      const userData = {
        totalUsers: 1247,
        activeUsers: 892,
        newUsersThisMonth: 156,
        userGrowthRate: '+12.5%',
        roleDistribution: {
          'Admin': 12,
          'Doctor': 45,
          'Nurse': 123,
          'Receptionist': 34,
          'Patient': 1033
        },
        departmentDistribution: {
          'Emergency': 89,
          'Cardiology': 156,
          'Pediatrics': 234,
          'Surgery': 178,
          'General Medicine': 345,
          'Blood Bank': 67,
          'Administration': 178
        },
        activityMetrics: {
          dailyActiveUsers: 567,
          weeklyActiveUsers: 823,
          monthlyActiveUsers: 1156,
          averageSessionDuration: '24 minutes',
          mostActiveHours: '9:00 AM - 11:00 AM'
        },
        recentActivity: [
          { user: 'Dr. Sarah Johnson', action: 'Logged in', time: '2 minutes ago', department: 'Cardiology' },
          { user: 'Nurse Mary Chen', action: 'Updated patient record', time: '5 minutes ago', department: 'Emergency' },
          { user: 'Admin John Doe', action: 'Generated report', time: '8 minutes ago', department: 'Administration' },
          { user: 'Dr. Michael Brown', action: 'Reviewed blood bank status', time: '12 minutes ago', department: 'Surgery' },
          { user: 'Receptionist Lisa Wang', action: 'Scheduled appointment', time: '15 minutes ago', department: 'General Medicine' }
        ]
      };

      setUserMetrics(userData);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple Bar Chart Component
  const SimpleChart = ({ data, title, color = "bg-blue-500" }: { 
    data: Record<string, number>, 
    title: string,
    color?: string 
  }) => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-3">
              <div className="w-24 text-sm font-medium truncate">{key}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div 
                  className={`${color} h-6 rounded-full flex items-center justify-end pr-2`}
                  style={{ width: `${Math.max((value / maxValue) * 100, 5)}%` }}
                >
                  <span className="text-white text-xs font-bold">{value}</span>
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-lg font-medium text-gray-700">Loading User Analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
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
                  <Users className="h-8 w-8 mr-3 text-indigo-600" />
                  User Analytics
                </h1>
                <p className="text-gray-600 mt-1">User activity, roles, and engagement metrics</p>
              </div>
            </div>
            <Button onClick={loadUserData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{userMetrics?.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{userMetrics?.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{userMetrics?.newUsersThisMonth}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{userMetrics?.userGrowthRate}</div>
              <p className="text-xs text-muted-foreground">Monthly growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Users by Role
              </CardTitle>
              <CardDescription>Distribution of users across different roles</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleChart data={userMetrics?.roleDistribution || {}} title="" color="bg-blue-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Users by Department
              </CardTitle>
              <CardDescription>User distribution across hospital departments</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleChart data={userMetrics?.departmentDistribution || {}} title="" color="bg-green-500" />
            </CardContent>
          </Card>
        </div>

        {/* Activity Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-purple-600" />
              User Activity Metrics
            </CardTitle>
            <CardDescription>User engagement and activity patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {userMetrics?.activityMetrics?.dailyActiveUsers}
                </div>
                <div className="text-blue-700 font-medium">Daily Active Users</div>
                <div className="text-sm text-blue-600">Last 24 hours</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {userMetrics?.activityMetrics?.weeklyActiveUsers}
                </div>
                <div className="text-green-700 font-medium">Weekly Active Users</div>
                <div className="text-sm text-green-600">Last 7 days</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {userMetrics?.activityMetrics?.averageSessionDuration}
                </div>
                <div className="text-purple-700 font-medium">Avg Session Duration</div>
                <div className="text-sm text-purple-600">Per user session</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-600" />
              Recent User Activity
            </CardTitle>
            <CardDescription>Latest user actions and system interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userMetrics?.recentActivity?.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium">{activity.user}</div>
                      <div className="text-sm text-gray-600">{activity.action}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{activity.time}</div>
                    <Badge variant="outline" className="text-xs">
                      {activity.department}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
