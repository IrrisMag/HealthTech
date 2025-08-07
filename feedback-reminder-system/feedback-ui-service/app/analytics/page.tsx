"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  RefreshCw,
  ArrowLeft,
  Brain,
  Droplets,
  MessageSquare,
  PieChart,
  ArrowRight
} from "lucide-react";

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Loading Analytics...</p>
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
                  Analytics Hub
                </h1>
                <p className="text-gray-600 mt-1">Comprehensive data insights across all systems</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blood Bank Analytics */}
          <Link href="/analytics/blood-bank">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Droplets className="h-6 w-6 mr-3 text-red-600" />
                  Blood Bank Analytics
                </CardTitle>
                <CardDescription>
                  Inventory levels, blood type distribution, and donor statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">• Blood type charts</p>
                    <p className="text-sm text-gray-600">• Inventory tracking</p>
                    <p className="text-sm text-gray-600">• Donor analytics</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* AI Forecasting Analytics */}
          <Link href="/analytics/forecasting">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-6 w-6 mr-3 text-purple-600" />
                  AI Forecasting
                </CardTitle>
                <CardDescription>
                  ARIMA predictions, demand forecasting, and model accuracy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">• Demand predictions</p>
                    <p className="text-sm text-gray-600">• Model accuracy metrics</p>
                    <p className="text-sm text-gray-600">• Confidence intervals</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Feedback Analytics */}
          <Link href="/analytics/feedback">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-6 w-6 mr-3 text-green-600" />
                  Feedback Analytics
                </CardTitle>
                <CardDescription>
                  Patient feedback analysis, sentiment tracking, and ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">• Sentiment analysis</p>
                    <p className="text-sm text-gray-600">• Rating trends</p>
                    <p className="text-sm text-gray-600">• Department breakdown</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* System Performance */}
          <Link href="/analytics/performance">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-6 w-6 mr-3 text-blue-600" />
                  System Performance
                </CardTitle>
                <CardDescription>
                  API response times, uptime monitoring, and system health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">• API performance</p>
                    <p className="text-sm text-gray-600">• Uptime tracking</p>
                    <p className="text-sm text-gray-600">• Error monitoring</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* User Analytics */}
          <Link href="/analytics/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-3 text-indigo-600" />
                  User Analytics
                </CardTitle>
                <CardDescription>
                  User activity, role distribution, and usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">• Active users</p>
                    <p className="text-sm text-gray-600">• Role breakdown</p>
                    <p className="text-sm text-gray-600">• Usage patterns</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Reports & Exports */}
          <Link href="/analytics/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-6 w-6 mr-3 text-orange-600" />
                  Reports & Exports
                </CardTitle>
                <CardDescription>
                  Generate reports, export data, and scheduled analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">• Custom reports</p>
                    <p className="text-sm text-gray-600">• Data exports</p>
                    <p className="text-sm text-gray-600">• Scheduled reports</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Systems</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Track 1, 2, 3 integrated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">APIs, DHIS2, MongoDB</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Models</CardTitle>
                <Brain className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">ARIMA, Sentiment Analysis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Real-time Updates</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Live</div>
                <p className="text-xs text-muted-foreground">Auto-refresh enabled</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
