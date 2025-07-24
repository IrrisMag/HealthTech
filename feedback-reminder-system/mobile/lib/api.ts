const API_BASE_URL = process.env.EXPO_PUBLIC_FEEDBACK_API_URL || 'http://feedback.localhost';

export interface FeedbackData {
  patient_id: string;
  text_feedback: string;
  rating: number;
  feedback_type: string;
  language: string;
  department: string;
}

export interface FeedbackResponse {
  id: string;
  sentiment: string;
  priority: string;
  keywords: string[];
  message: string;
}

export const submitFeedback = async (feedbackData: FeedbackData): Promise<FeedbackResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth header if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export const getFeedbackHistory = async (patientId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback/patient/${patientId}`, {
      headers: {
        // Add auth header if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching feedback history:', error);
    throw error;
  }
};