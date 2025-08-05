// Force the correct URL to override any cached environment variables
const TRACK2_API_URL = 'https://healthtech-production-4917.up.railway.app';

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

export async function sendChatMessage(messageData: ChatMessage): Promise<ChatResponse> {
  // Get auth token for authenticated requests
  const token = localStorage.getItem('access_token');

  // Try multiple endpoints for compatibility
  const endpoints = [
    `${TRACK2_API_URL}/chat`,
    `${TRACK2_API_URL}/api/chat`,
    `${TRACK2_API_URL}/api/chatbot/chat`,
    // Fallback to Track 1 if Track 2 chat is not available
    `${process.env.NEXT_PUBLIC_TRACK1_API_URL || 'https://track1-production.up.railway.app'}/api/chat`
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
        return response.json();
      }

      // Log the specific error for debugging
      console.warn(`Failed to send message to ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.warn(`Network error for ${endpoint}:`, error);
    }
  }

  throw new Error('Chatbot service unavailable - all endpoints failed');
}

export async function getChatbotHealth() {
  const response = await fetch(`${TRACK2_API_URL}/health`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function clearChatMemory(sessionId?: string) {
  const token = localStorage.getItem('access_token');
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

  return response.json();
}