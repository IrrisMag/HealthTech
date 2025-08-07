"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Heart,
  MessageSquare
} from "lucide-react";

export default function ReportsAnalytics() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadReportsData();
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/login');
      return;
    }
  }, [router]);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const reportsData = {
        availableReports: [
          {
            id: 'blood-bank-monthly',
            title: 'Blood Bank Monthly Report',
            description: 'Comprehensive blood inventory, donations, and usage statistics',
            type: 'Monthly',
            lastGenerated: '2024-01-15',
            status: 'ready',
            size: '2.4 MB',
            format: 'PDF',
            icon: Heart
          },
          {
            id: 'patient-feedback-weekly',
            title: 'Patient Feedback Analysis',
            description: 'Weekly sentiment analysis and feedback trends',
            type: 'Weekly',
            lastGenerated: '2024-01-14',
            status: 'ready',
            size: '1.8 MB',
            format: 'Excel',
            icon: MessageSquare
          },
          {
            id: 'system-performance',
            title: 'System Performance Report',
            description: 'API response times, uptime, and system health metrics',
            type: 'Daily',
            lastGenerated: '2024-01-15',
            status: 'generating',
            size: '856 KB',
            format: 'PDF',
            icon: BarChart3
          },
          {
            id: 'user-activity',
            title: 'User Activity Summary',
            description: 'User engagement, login patterns, and role distribution',
            type: 'Weekly',
            lastGenerated: '2024-01-13',
            status: 'ready',
            size: '1.2 MB',
            format: 'CSV',
            icon: Users
          },
          {
            id: 'ai-forecasting',
            title: 'AI Forecasting Report',
            description: 'ARIMA model predictions and accuracy metrics',
            type: 'Monthly',
            lastGenerated: '2024-01-10',
            status: 'ready',
            size: '3.1 MB',
            format: 'PDF',
            icon: TrendingUp
          }
        ],
        scheduledReports: [
          { name: 'Daily System Health', frequency: 'Daily', nextRun: '2024-01-16 06:00', status: 'active' },
          { name: 'Weekly Patient Feedback', frequency: 'Weekly', nextRun: '2024-01-21 08:00', status: 'active' },
          { name: 'Monthly Blood Bank Summary', frequency: 'Monthly', nextRun: '2024-02-01 09:00', status: 'active' },
          { name: 'Quarterly Analytics Review', frequency: 'Quarterly', nextRun: '2024-04-01 10:00', status: 'paused' }
        ],
        exportOptions: [
          { format: 'PDF', description: 'Formatted reports with charts and graphs' },
          { format: 'Excel', description: 'Spreadsheet format for data analysis' },
          { format: 'CSV', description: 'Raw data for custom processing' },
          { format: 'JSON', description: 'API-friendly structured data' }
        ]
      };

      setReports(reportsData);

    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (reportId: string) => {
    // Simulate report download
    const report = reports.availableReports.find((r: any) => r.id === reportId);
    if (report) {
      // In a real app, this would trigger an actual download
      alert(`Downloading ${report.title} (${report.format}, ${report.size})`);
    }
  };

  const handleGenerateReport = (reportId: string) => {
    // Simulate report generation
    const report = reports.availableReports.find((r: any) => r.id === reportId);
    if (report) {
      alert(`Generating ${report.title}... This may take a few minutes.`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100';
      case 'generating': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'generating': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-lg font-medium text-gray-700">Loading Reports...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
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
                  <FileText className="h-8 w-8 mr-3 text-orange-600" />
                  Reports & Exports
                </h1>
                <p className="text-gray-600 mt-1">Generate, download, and schedule analytics reports</p>
              </div>
            </div>
            <Button onClick={loadReportsData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Available Reports */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Available Reports
            </CardTitle>
            <CardDescription>Ready-to-download reports and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports?.availableReports?.map((report: any) => {
                const IconComponent = report.icon;
                return (
                  <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{report.title}</h3>
                          <p className="text-sm text-gray-500">{report.type}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1 capitalize">{report.status}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Last: {report.lastGenerated}</span>
                      <span>{report.format} • {report.size}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {report.status === 'ready' ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleDownloadReport(report.id)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleGenerateReport(report.id)}
                          className="flex-1"
                          disabled={report.status === 'generating'}
                        >
                          <RefreshCw className={`h-4 w-4 mr-1 ${report.status === 'generating' ? 'animate-spin' : ''}`} />
                          Generate
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Scheduled Reports
              </CardTitle>
              <CardDescription>Automated report generation schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.scheduledReports?.map((schedule: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{schedule.name}</div>
                      <div className="text-sm text-gray-600">{schedule.frequency}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{schedule.nextRun}</div>
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2 text-purple-600" />
                Export Options
              </CardTitle>
              <CardDescription>Available export formats and options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.exportOptions?.map((option: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{option.format}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
