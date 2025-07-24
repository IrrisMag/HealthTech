const CHATBOT_API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:8000';

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

  return response.json();
}

export async function getChatbotHealth() {
  const response = await fetch(`${CHATBOT_API_URL}/health`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function clearChatMemory(sessionId?: string) {
  const endpoint = sessionId 
    ? `${CHATBOT_API_URL}/clear-memory/${sessionId}`
    : `${CHATBOT_API_URL}/clear-memory`;
    
  const response = await fetch(endpoint, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}