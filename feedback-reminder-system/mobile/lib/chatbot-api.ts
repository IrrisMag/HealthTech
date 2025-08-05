const TRACK2_API_URL = process.env.EXPO_PUBLIC_TRACK2_API_URL || 'https://healthtech-production-4917.up.railway.app';

export interface ChatMessage {
  message: string;
  patient_context?: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  is_patient_related: boolean;
  sources?: string[];
  confidence_score?: number;
}

export const sendChatMessage = async (messageData: ChatMessage): Promise<ChatResponse> => {
  // Get auth token from AsyncStorage
  const { AuthService } = await import('./auth');
  const token = await AuthService.getToken();

  // Try multiple endpoints for compatibility
  const endpoints = [
    `${TRACK2_API_URL}/chat`,
    `${TRACK2_API_URL}/api/chat`,
    `${TRACK2_API_URL}/api/chatbot/chat`
  ];

  for (const endpoint of endpoints) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add auth header if token is available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }

      console.warn(`Failed to send message to ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.warn(`Network error for ${endpoint}:`, error);
    }
  }

  throw new Error('Chatbot service unavailable - all endpoints failed');
};

export const getChatbotHealth = async () => {
  try {
    const response = await fetch(`${TRACK2_API_URL}/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking chatbot health:', error);
    throw error;
  }
};

export const clearChatMemory = async (sessionId?: string) => {
  try {
    const { AuthService } = await import('./auth');
    const token = await AuthService.getToken();

    const endpoint = sessionId
      ? `${TRACK2_API_URL}/clear-memory/${sessionId}`
      : `${TRACK2_API_URL}/clear-memory`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing chat memory:', error);
    throw error;
  }
};
