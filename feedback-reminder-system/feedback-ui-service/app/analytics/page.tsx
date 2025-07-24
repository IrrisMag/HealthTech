"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type FeedbackAnalytics = {
  total_feedback: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  average_rating: number;
  top_keywords: string[];
  department_breakdown: Record<string, number>;
  language_breakdown: Record<string, number>;
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

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");

  useEffect(() => {
    fetchAnalytics();
    fetchFeedbacks();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FEEDBACK_API_URL}/analytics`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const url = selectedSentiment === "all" 
        ? `${process.env.NEXT_PUBLIC_FEEDBACK_API_URL}/feedback`
        : `${process.env.NEXT_PUBLIC_FEEDBACK_API_URL}/feedback?sentiment=${selectedSentiment}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
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
                {analytics.average_rating.toFixed(1)} ⭐
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
