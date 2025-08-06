"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Heart,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Calendar,
  Target,
  Zap,
  Brain,
  MessageSquare
} from "lucide-react";
import {
  getPerformanceAnalytics,
  getCostSavingsAnalytics,
  getSupplyDemandAnalytics,
  getForecastAccuracy,
  getOptimizationReports,
  getDashboardMetrics
} from "@/lib/api";

// Legacy feedback types for backward compatibility
type FeedbackAnalytics = {
  total_feedback: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  average_rating: number;
  top_keywords?: string[];
  department_breakdown?: Record<string, number>;
  language_breakdown?: Record<string, number>;
  department_stats?: any[];
};

type Feedback = {
  id: string;
  text_feedback: string;
  sentiment: string;
  rating: number;
  department: string;
  language: string;
  keywords: string[];
  priority: string;
  timestamp: string;
};

// New analytics data interface
interface AnalyticsData {
  performance?: any;
  costSavings?: any;
  supplyDemand?: any;
  forecastAccuracy?: any;
  optimizationReports?: any;
  dashboardMetrics?: any;
  feedbackAnalytics?: FeedbackAnalytics;
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({});
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalyticsData();
    fetchFeedbacks();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load Track 3 analytics data
      const [
        performanceData,
        costSavingsData,
        supplyDemandData,
        forecastAccuracyData,
        optimizationReportsData,
        dashboardMetricsData
      ] = await Promise.allSettled([
        getPerformanceAnalytics(),
        getCostSavingsAnalytics(),
        getSupplyDemandAnalytics(),
        getForecastAccuracy(),
        getOptimizationReports(0, 10),
        getDashboardMetrics()
      ]);

      const newAnalytics: AnalyticsData = {};

      if (performanceData.status === 'fulfilled') {
        newAnalytics.performance = performanceData.value;
      }

      if (costSavingsData.status === 'fulfilled') {
        newAnalytics.costSavings = costSavingsData.value;
      }

      if (supplyDemandData.status === 'fulfilled') {
        newAnalytics.supplyDemand = supplyDemandData.value;
      }

      if (forecastAccuracyData.status === 'fulfilled') {
        newAnalytics.forecastAccuracy = forecastAccuracyData.value;
      }

      if (optimizationReportsData.status === 'fulfilled') {
        newAnalytics.optimizationReports = optimizationReportsData.value;
      }

      if (dashboardMetricsData.status === 'fulfilled') {
        newAnalytics.dashboardMetrics = dashboardMetricsData.value;
      }

      // Also load legacy feedback analytics
      await fetchAnalytics(newAnalytics);

      setAnalytics(newAnalytics);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (existingAnalytics: AnalyticsData = {}) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FEEDBACK_API_URL}/api/feedback/list`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const feedbackList = data.feedback || [];

      // Process feedback list to generate analytics
      const totalFeedback = feedbackList.length;
      const ratings = feedbackList.filter((f: any) => f.rating).map((f: any) => f.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

      // Count departments
      const departmentCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};

      feedbackList.forEach((feedback: any) => {
        if (feedback.department) {
          departmentCounts[feedback.department] = (departmentCounts[feedback.department] || 0) + 1;
        }
        if (feedback.category) {
          categoryCounts[feedback.category] = (categoryCounts[feedback.category] || 0) + 1;
        }
      });

      // Add feedback analytics to existing analytics
      existingAnalytics.feedbackAnalytics = {
        total_feedback: totalFeedback,
        average_rating: averageRating,
        sentiment_distribution: { positive: 0, negative: 0, neutral: 0 },
        department_stats: [],
        top_keywords: [],
        department_breakdown: departmentCounts,
        language_breakdown: {}
      };

    } catch (error) {
      console.error("Error fetching feedback analytics:", error);
      // Set default feedback analytics data on error
      existingAnalytics.feedbackAnalytics = {
        total_feedback: 0,
        average_rating: 0,
        sentiment_distribution: { positive: 0, negative: 0, neutral: 0 },
        department_stats: [],
        top_keywords: [],
        department_breakdown: {},
        language_breakdown: {}
      };
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const url = selectedSentiment === "all"
        ? `${process.env.NEXT_PUBLIC_FEEDBACK_API_URL}/api/feedback/list`
        : `${process.env.NEXT_PUBLIC_FEEDBACK_API_URL}/api/feedback/list?sentiment=${selectedSentiment}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Ensure data is an array to prevent map errors
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      // Set empty array on error to prevent map errors
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [selectedSentiment]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Feedback Analytics Dashboard</h1>
        
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Feedback */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Feedback</h3>
              <p className="text-3xl font-bold text-blue-600">{analytics.total_feedback}</p>
            </div>

            {/* Average Rating */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Average Rating</h3>
              <p className="text-3xl font-bold text-yellow-500">
                {(analytics?.average_rating || 0).toFixed(1)} ⭐
              </p>
            </div>

            {/* Sentiment Distribution */}
            <div className="bg-white p-6 rounded-lg shadow col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Sentiment Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{analytics.sentiment_distribution.positive}</p>
                  <p className="text-sm text-gray-600">😊 Positive</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{analytics.sentiment_distribution.neutral}</p>
                  <p className="text-sm text-gray-600">😐 Neutral</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{analytics.sentiment_distribution.negative}</p>
                  <p className="text-sm text-gray-600">😞 Negative</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Filter */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Filter Feedback</h3>
          <div className="flex gap-2">
            {["all", "positive", "neutral", "negative"].map((sentiment) => (
              <Button
                key={sentiment}
                variant={selectedSentiment === sentiment ? "default" : "outline"}
                onClick={() => setSelectedSentiment(sentiment)}
                className="capitalize"
              >
                {sentiment === "all" ? "All" : 
                 sentiment === "positive" ? "😊 Positive" :
                 sentiment === "neutral" ? "😐 Neutral" : "😞 Negative"}
              </Button>
            ))}
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-700">
              Recent Feedback ({feedbacks.length} items)
            </h3>
          </div>
          <div className="divide-y">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      feedback.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      feedback.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {feedback.sentiment === 'positive' ? '😊 Positive' :
                       feedback.sentiment === 'negative' ? '😞 Negative' : '😐 Neutral'}
                    </span>
                    <span className="text-yellow-500">
                      {'⭐'.repeat(feedback.rating)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      feedback.priority === 'high' ? 'bg-red-100 text-red-800' :
                      feedback.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {feedback.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {feedback.department} • {feedback.language}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{feedback.text_feedback}</p>
                {feedback.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {feedback.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
