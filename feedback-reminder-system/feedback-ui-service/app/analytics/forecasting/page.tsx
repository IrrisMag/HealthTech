"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  TrendingUp,
  RefreshCw,
  ArrowLeft,
  Target,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from "lucide-react";

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

export default function ForecastingAnalytics() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState<Record<string, ForecastData>>({});
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
      loadForecastingData();
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/login');
      return;
    }
  }, [router]);

  const loadForecastingData = async () => {
    setLoading(true);
    try {
      // Load system health
      const healthRes = await fetch(`${TRACK3_API}/health`);
      if (healthRes.ok) {
        const healthData = await healthRes.json();
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
      console.error('Error loading forecasting data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall metrics
  const totalForecasts = Object.keys(forecasts).length;
  const averageAccuracy = totalForecasts > 0 
    ? Object.values(forecasts).reduce((sum, f) => sum + f.model_accuracy, 0) / totalForecasts 
    : 0;
  const highAccuracyModels = Object.values(forecasts).filter(f => f.model_accuracy > 80).length;
  const totalPredictions = Object.values(forecasts).reduce((sum, f) => sum + f.forecasts.length, 0);

  // Forecast Chart Component
  const ForecastChart = ({ forecast, bloodType }: { forecast: ForecastData, bloodType: string }) => {
    if (!forecast.forecasts || forecast.forecasts.length === 0) return null;

    const maxDemand = Math.max(...forecast.forecasts.map(f => f.upper_bound));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{bloodType} Forecast</h4>
          <Badge variant={forecast.model_accuracy > 80 ? "default" : "secondary"}>
            {forecast.model_accuracy}% accuracy
          </Badge>
        </div>
        <div className="space-y-2">
          {forecast.forecasts.slice(0, 7).map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {new Date(item.date).toLocaleDateString()}
                </span>
                <div className="text-right">
                  <div className="font-bold text-purple-600">{item.predicted_demand}</div>
                  <div className="text-xs text-gray-500">predicted units</div>
                </div>
              </div>
              
              {/* Visual confidence interval */}
              <div className="relative h-4 bg-gray-200 rounded-full">
                <div 
                  className="absolute h-4 bg-purple-200 rounded-full"
                  style={{ 
                    left: `${(item.lower_bound / maxDemand) * 100}%`,
                    width: `${((item.upper_bound - item.lower_bound) / maxDemand) * 100}%`
                  }}
                />
                <div 
                  className="absolute h-4 w-1 bg-purple-600 rounded-full"
                  style={{ left: `${(item.predicted_demand / maxDemand) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Range: {item.lower_bound} - {item.upper_bound}</span>
                <span>Confidence: {item.confidence_level}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-lg font-medium text-gray-700">Loading AI Forecasting Analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
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
                  <Brain className="h-8 w-8 mr-3 text-purple-600" />
                  AI Forecasting Analytics
                </h1>
                <p className="text-gray-600 mt-1">ARIMA model predictions and accuracy metrics</p>
              </div>
            </div>
            <Button onClick={loadForecastingData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Models
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Models</CardTitle>
              <Brain className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalForecasts}</div>
              <p className="text-xs text-muted-foreground">ARIMA models running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{averageAccuracy.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Model prediction accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Accuracy Models</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{highAccuracyModels}</div>
              <p className="text-xs text-muted-foreground">Models above 80% accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalPredictions}</div>
              <p className="text-xs text-muted-foreground">Forecast data points</p>
            </CardContent>
          </Card>
        </div>

        {/* Model Performance Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-indigo-600" />
              Model Performance Overview
            </CardTitle>
            <CardDescription>Accuracy and performance metrics for each blood type model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bloodTypes.map(bloodType => {
                const forecast = forecasts[bloodType];
                const hasData = forecast && forecast.forecasts && forecast.forecasts.length > 0;
                const accuracy = hasData ? forecast.model_accuracy : 0;
                const isHighAccuracy = accuracy > 80;
                
                return (
                  <div key={bloodType} className={`p-4 rounded-lg border ${
                    hasData 
                      ? isHighAccuracy 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-yellow-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{bloodType}</span>
                      {hasData ? (
                        <Badge variant={isHighAccuracy ? "default" : "secondary"}>
                          {accuracy}%
                        </Badge>
                      ) : (
                        <Badge variant="outline">No Data</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={hasData ? 'text-green-600' : 'text-gray-500'}>
                          {hasData ? 'Active' : 'Loading'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Predictions:</span>
                        <span>{hasData ? forecast.forecasts.length : 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Period:</span>
                        <span>{hasData ? `${forecast.forecast_period} days` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Individual Forecasts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {Object.entries(forecasts).map(([bloodType, forecast]) => (
            <Card key={bloodType}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  {bloodType} Demand Forecast
                </CardTitle>
                <CardDescription>
                  ARIMA model predictions for the next {forecast.forecast_period} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ForecastChart forecast={forecast} bloodType={bloodType} />
              </CardContent>
            </Card>
          ))}
          
          {Object.keys(forecasts).length === 0 && (
            <Card className="lg:col-span-2">
              <CardContent className="text-center py-12">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Forecast Data Available</h3>
                <p className="text-gray-500 mb-4">AI models are initializing or data is being processed</p>
                <Button onClick={loadForecastingData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Loading
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* System Status */}
        {systemHealth && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                AI System Status
              </CardTitle>
              <CardDescription>Current status of the forecasting system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium text-blue-900">System Health</div>
                  <div className="text-sm text-blue-700 capitalize">
                    {systemHealth.status || 'Unknown'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-medium text-green-900">Database</div>
                  <div className="text-sm text-green-700">
                    {systemHealth.database_status || 'Connected'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-medium text-purple-900">DHIS2 Integration</div>
                  <div className="text-sm text-purple-700 capitalize">
                    {systemHealth.dhis2_status || 'Unknown'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
