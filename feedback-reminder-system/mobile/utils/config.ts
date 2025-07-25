/**
 * Configuration utility for mobile app
 * Automatically detects the host IP address for API connections
 */

import Constants from 'expo-constants';

/**
 * Get the host IP address for API connections
 * This automatically detects the development server IP address
 */
export function getHostIP(): string {
  // In development, Expo provides the host IP through Constants
  const hostUri = Constants.expoConfig?.hostUri;
  
  if (hostUri) {
    // Extract IP from hostUri (format: "192.168.1.100:8081")
    const ip = hostUri.split(':')[0];
    return ip;
  }
  
  // Fallback to environment variable if available
  const envIP = process.env.EXPO_PUBLIC_HOST_IP;
  if (envIP) {
    return envIP;
  }
  
  // Final fallback to localhost (for web/simulator)
  return 'localhost';
}

/**
 * Get API URLs with automatic IP detection
 */
export function getAPIConfig() {
  const hostIP = getHostIP();
  
  return {
    chatbotAPI: process.env.EXPO_PUBLIC_CHATBOT_API_URL || `http://${hostIP}:8003`,
    feedbackAPI: process.env.EXPO_PUBLIC_FEEDBACK_API_URL || `http://${hostIP}:8001`,
    authAPI: process.env.EXPO_PUBLIC_AUTH_API_URL || `http://${hostIP}:8001`,
  };
}

/**
 * Check if we're running in development mode
 */
export function isDevelopment(): boolean {
  return __DEV__;
}

/**
 * Get the appropriate API URL based on environment
 */
export function getChatbotAPIURL(): string {
  const config = getAPIConfig();
  
  // In development, use the auto-detected IP
  if (isDevelopment()) {
    console.log(`🔗 Using chatbot API: ${config.chatbotAPI}`);
    return config.chatbotAPI;
  }
  
  // In production, use environment variable or fallback
  return process.env.EXPO_PUBLIC_CHATBOT_API_URL || config.chatbotAPI;
}
