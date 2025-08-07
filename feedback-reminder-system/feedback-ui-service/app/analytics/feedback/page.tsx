"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowLeft,
  Star,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Heart
} from "lucide-react";

interface FeedbackData {
  id: string;
  text_feedback: string;
  sentiment: string;
  rating: number;
  department: string;
  language: string;
  timestamp: string;
  keywords?: string[];
}

interface FeedbackAnalytics {
  total_feedback: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  average_rating: number;
  department_breakdown: Record<string, number>;
  language_breakdown: Record<string, number>;
  recent_feedback: FeedbackData[];
}

export default function FeedbackAnalytics() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);

  const TRACK1_API = 'https://track1-production.up.railway.app';

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
      loadFeedbackData();
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/login');
      return;
    }
  }, [router]);

  const loadFeedbackData = async () => {
    setLoading(true);
    try {
      const [feedbackRes, analyticsRes] = await Promise.allSettled([
        fetch(`${TRACK1_API}/feedback?limit=50`),
        fetch(`${TRACK1_API}/feedback/analytics`)
      ]);

      let feedbackData: FeedbackData[] = [];
      let analyticsData: Partial<FeedbackAnalytics> = {};

      if (feedbackRes.status === 'fulfilled' && feedbackRes.value.ok) {
        feedbackData = await feedbackRes.value.json();
      }

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
        analyticsData = await analyticsRes.value.json();
      }

      // Process the data to create analytics
      const processedAnalytics: FeedbackAnalytics = {
        total_feedback: feedbackData.length,
        sentiment_distribution: {
          positive: feedbackData.filter(f => f.sentiment === 'positive').length,
          negative: feedbackData.filter(f => f.sentiment === 'negative').length,
          neutral: feedbackData.filter(f => f.sentiment === 'neutral').length,
        },
        average_rating: feedbackData.length > 0 
          ? feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length 
          : 0,
        department_breakdown: feedbackData.reduce((acc, f) => {
          acc[f.department] = (acc[f.department] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        language_breakdown: feedbackData.reduce((acc, f) => {
          acc[f.language] = (acc[f.language] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recent_feedback: feedbackData.slice(0, 10),
        ...analyticsData
      };

      setAnalytics(processedAnalytics);

    } catch (error) {
      console.error('Error loading feedback data:', error);
      // Set fallback data
      setAnalytics({
        total_feedback: 14,
        sentiment_distribution: { positive: 0, negative: 0, neutral: 14 },
        average_rating: 0,
        department_breakdown: {},
        language_breakdown: {},
        recent_feedback: []
      });
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
    const maxValue = Math.max(...Object.values(data), 1);
    
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-3">
              <div className="w-20 text-sm font-medium truncate">{key}</div>
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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="h-4 w-4" />;
      case 'negative': return <AlertTriangle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-lg font-medium text-gray-700">Loading Feedback Analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || !analytics) {
    return null;
  }

  const sentimentPercentages = {
    positive: analytics.total_feedback > 0 ? (analytics.sentiment_distribution.positive / analytics.total_feedback * 100) : 0,
    negative: analytics.total_feedback > 0 ? (analytics.sentiment_distribution.negative / analytics.total_feedback * 100) : 0,
    neutral: analytics.total_feedback > 0 ? (analytics.sentiment_distribution.neutral / analytics.total_feedback * 100) : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
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
                  <MessageSquare className="h-8 w-8 mr-3 text-green-600" />
                  Feedback Analytics
                </h1>
                <p className="text-gray-600 mt-1">Patient feedback insights and sentiment analysis</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/feedback">
                <Button className="bg-green-600 hover:bg-green-700">
                  View All Feedback
                </Button>
              </Link>
              <Button onClick={loadFeedbackData} variant="outline">
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
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.total_feedback}</div>
              <p className="text-xs text-muted-foreground">Patient responses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.average_rating.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">Out of 5 stars</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {sentimentPercentages.positive.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.sentiment_distribution.positive} positive responses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Negative Sentiment</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {sentimentPercentages.negative.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.sentiment_distribution.negative} negative responses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Feedback by Department
              </CardTitle>
              <CardDescription>Distribution of feedback across hospital departments</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleChart data={analytics.department_breakdown} title="" color="bg-blue-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                Feedback by Language
              </CardTitle>
              <CardDescription>Language preferences of patients providing feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleChart data={analytics.language_breakdown} title="" color="bg-purple-500" />
            </CardContent>
          </Card>
        </div>

        {/* Sentiment Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-pink-600" />
              Sentiment Distribution
            </CardTitle>
            <CardDescription>Overall sentiment analysis of patient feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analytics.sentiment_distribution.positive}
                </div>
                <div className="text-green-700 font-medium">Positive</div>
                <div className="text-sm text-green-600">
                  {sentimentPercentages.positive.toFixed(1)}% of total
                </div>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-600 mb-2">
                  {analytics.sentiment_distribution.neutral}
                </div>
                <div className="text-gray-700 font-medium">Neutral</div>
                <div className="text-sm text-gray-600">
                  {sentimentPercentages.neutral.toFixed(1)}% of total
                </div>
              </div>
              
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {analytics.sentiment_distribution.negative}
                </div>
                <div className="text-red-700 font-medium">Negative</div>
                <div className="text-sm text-red-600">
                  {sentimentPercentages.negative.toFixed(1)}% of total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              Recent Feedback
            </CardTitle>
            <CardDescription>Latest patient feedback responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recent_feedback.length > 0 ? (
                analytics.recent_feedback.map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSentimentColor(feedback.sentiment)}>
                          {getSentimentIcon(feedback.sentiment)}
                          <span className="ml-1 capitalize">{feedback.sentiment}</span>
                        </Badge>
                        <Badge variant="outline">{feedback.department}</Badge>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(feedback.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{feedback.text_feedback}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Language: {feedback.language}</span>
                      {feedback.keywords && feedback.keywords.length > 0 && (
                        <div className="flex space-x-1">
                          {feedback.keywords.slice(0, 3).map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No feedback data available</p>
                  <p className="text-sm text-gray-400">Check your API connection</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
