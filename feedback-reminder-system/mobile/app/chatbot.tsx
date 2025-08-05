import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import Wave from '../components/wave';
import { sendChatMessage } from '../lib/chatbot-api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
  confidence?: number;
}

const ChatbotScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI health assistant. I can help answer questions about health, medical conditions, symptoms, and general wellness. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { height } = Dimensions.get('window');

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Use the chatbot API function for better error handling
      const response = await sendChatMessage({
        message: userMessage.text,
        session_id: 'mobile_user_' + Date.now(),
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response || "I'm sorry, I couldn't process your request right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
        sources: response.sources,
        confidence: response.confidence_score,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please check your internet connection and try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
    if (!isRecording) {
      Alert.alert('Voice Recording', 'Voice recording feature will be implemented soon!');
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear the conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([
              {
                id: '1',
                text: "Hello! I'm your AI health assistant. How can I help you today?",
                isUser: false,
                timestamp: new Date(),
              }
            ]);
          },
        },
      ]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickQuestions = [
    "What are the symptoms of malaria?",
    "How can I prevent infections?",
    "When should I see a doctor?",
    "What are healthy eating habits?",
  ];

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-4 px-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-2xl font-bold">🤖 Health Assistant</Text>
            <Text className="text-blue-100 text-sm">AI-Powered Medical Support</Text>
          </View>
          <TouchableOpacity onPress={clearChat} className="bg-blue-700 px-3 py-2 rounded-lg">
            <Text className="text-white text-xs font-medium">Clear Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
          >
            <View
              className={`max-w-4/5 px-4 py-3 rounded-2xl ${
                message.isUser
                  ? 'bg-blue-600 rounded-br-md'
                  : 'bg-white border border-gray-200 rounded-bl-md shadow-sm'
              }`}
            >
              <Text
                className={`text-base leading-6 ${
                  message.isUser ? 'text-white' : 'text-gray-800'
                }`}
              >
                {message.text}
              </Text>
              
              {/* Sources and confidence for bot messages */}
              {!message.isUser && (message.sources || message.confidence) && (
                <View className="mt-2 pt-2 border-t border-gray-100">
                  {message.sources && (
                    <Text className="text-xs text-gray-500 mb-1">
                      📚 Sources: {message.sources.join(', ')}
                    </Text>
                  )}
                  {message.confidence && (
                    <Text className="text-xs text-gray-500">
                      🎯 Confidence: {Math.round(message.confidence * 100)}%
                    </Text>
                  )}
                </View>
              )}
            </View>
            
            <Text className="text-xs text-gray-400 mt-1 mx-2">
              {formatTime(message.timestamp)}
            </Text>
          </View>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <View className="items-start mb-4">
            <View className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
              <View className="flex-row items-center">
                <View className="flex-row space-x-1">
                  <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                  <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                  <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                </View>
                <Text className="text-gray-500 ml-2 text-sm">AI is thinking...</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Questions */}
        {messages.length === 1 && (
          <View className="mb-4">
            <Text className="text-gray-600 font-medium mb-3 text-center">
              💡 Quick Questions
            </Text>
            <View className="gap-2">
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setInputText(question)}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                >
                  <Text className="text-blue-700 text-sm">{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Voice Recording Indicator */}
      {isRecording && (
        <View className="px-4 py-2 bg-red-50 border-t border-red-200">
          <Wave isActive={isRecording} height={60} />
          <Text className="text-center text-red-600 text-sm font-medium">
            🎤 Recording... Tap to stop
          </Text>
        </View>
      )}

      {/* Input Area */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-end gap-3">
          {/* Voice Recording Button */}
          <TouchableOpacity
            onPress={toggleRecording}
            className={`p-3 rounded-full ${
              isRecording ? 'bg-red-500' : 'bg-blue-100'
            }`}
          >
            <Text className="text-sm">
              {isRecording ? '🛑' : '🎤'}
            </Text>
          </TouchableOpacity>

          {/* Text Input */}
          <View className="flex-1">
            <TextInput
              className="border border-gray-300 rounded-2xl px-4 py-3 bg-gray-50 max-h-24"
              placeholder="Ask me about your health concerns..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              textAlignVertical="top"
              onSubmitEditing={sendMessage}
              editable={!isLoading}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-full ${
              inputText.trim() && !isLoading ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <Text className="text-sm">
              {isLoading ? '⏳' : '📤'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text className="text-xs text-gray-500 text-center mt-2 px-2">
          ⚠️ This AI assistant provides general health information only. Always consult healthcare professionals for medical advice.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatbotScreen;