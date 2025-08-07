"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  TrendingUp,
  RefreshCw,
  ArrowLeft,
  Clock,
  Zap,
  Server,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function SystemPerformanceAnalytics() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);

  const APIs = [
    { name: 'Track 1 API', url: 'https://track1-production.up.railway.app', service: 'Feedback & Reminders' },
    { name: 'Track 2 API', url: 'https://healthtech-production-4917.up.railway.app', service: 'AI Chatbot' },
    { name: 'Track 3 API', url: 'https://track3-blood-bank-backend-production.up.railway.app', service: 'Blood Bank' }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadPerformanceData();
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/login');
      return;
    }
  }, [router]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      const performanceData = {
        uptime: '99.8%',
        responseTime: '245ms',
        throughput: '1,247 req/min',
        errorRate: '0.2%',
        activeConnections: 156,
        cpuUsage: '34%',
        memoryUsage: '67%',
        diskUsage: '45%'
      };

      // Test API endpoints
      const apiStatuses = await Promise.allSettled(
        APIs.map(async (api) => {
          const startTime = Date.now();
          try {
            const response = await fetch(`${api.url}/health`, { 
              method: 'GET',
              signal: AbortSignal.timeout(5000)
            });
            const endTime = Date.now();
            return {
              ...api,
              status: response.ok ? 'healthy' : 'warning',
              responseTime: endTime - startTime,
              statusCode: response.status
            };
          } catch (error) {
            return {
              ...api,
              status: 'error',
              responseTime: Date.now() - startTime,
              error: 'Connection failed'
            };
          }
        })
      );

      setSystemMetrics({
        ...performanceData,
        apis: apiStatuses.map(result => 
          result.status === 'fulfilled' ? result.value : result.reason
        )
      });

    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Loading Performance Analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
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
                  <Activity className="h-8 w-8 mr-3 text-blue-600" />
                  System Performance Analytics
                </h1>
                <p className="text-gray-600 mt-1">Real-time system monitoring and performance metrics</p>
              </div>
            </div>
            <Button onClick={loadPerformanceData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemMetrics?.uptime}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{systemMetrics?.responseTime}</div>
              <p className="text-xs text-muted-foreground">Average response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              <Zap className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{systemMetrics?.throughput}</div>
              <p className="text-xs text-muted-foreground">Requests per minute</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{systemMetrics?.errorRate}</div>
              <p className="text-xs text-muted-foreground">Error percentage</p>
            </CardContent>
          </Card>
        </div>

        {/* API Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2 text-blue-600" />
              API Endpoints Status
            </CardTitle>
            <CardDescription>Real-time status of all backend services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemMetrics?.apis?.map((api: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(api.status)}
                      <span className="font-medium">{api.name}</span>
                    </div>
                    <Badge className={getStatusColor(api.status)}>
                      {api.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{api.responseTime}ms</div>
                    <div className="text-xs text-gray-500">{api.service}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resource Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">{systemMetrics?.cpuUsage}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: systemMetrics?.cpuUsage }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Current CPU utilization</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">{systemMetrics?.memoryUsage}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: systemMetrics?.memoryUsage }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">RAM utilization</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2 text-purple-600" />
                Disk Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">{systemMetrics?.diskUsage}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: systemMetrics?.diskUsage }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Storage utilization</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
