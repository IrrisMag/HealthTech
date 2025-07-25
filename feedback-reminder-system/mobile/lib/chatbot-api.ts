const CHATBOT_API_URL = process.env.EXPO_PUBLIC_CHATBOT_API_URL || 'http://chatbot.localhost:8002';

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
  try {
    const response = await fetch(`${CHATBOT_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const getChatbotHealth = async () => {
  try {
    const response = await fetch(`${CHATBOT_API_URL}/health`);
    
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
    const endpoint = sessionId 
      ? `${CHATBOT_API_URL}/clear-memory/${sessionId}`
      : `${CHATBOT_API_URL}/clear-memory`;
      
    const response = await fetch(endpoint, {
      method: 'DELETE',
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
