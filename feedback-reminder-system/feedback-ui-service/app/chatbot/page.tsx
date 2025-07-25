"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MicVocal, Send, Trash2, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
  confidence?: number;
}

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI health assistant powered by medical documents. I can help answer questions about health, medical conditions, symptoms, and general wellness based on reliable medical sources. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId] = useState(`web_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    const messageText = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://chatbot.localhost:8002'}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm sorry, I couldn't process your request right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
        sources: data.sources,
        confidence: data.confidence_score,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to the health assistant service. Please check your connection and try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the conversation?')) {
      setMessages([
        {
          id: '1',
          text: "Hello! I'm your AI health assistant. How can I help you today?",
          isUser: false,
          timestamp: new Date(),
        }
      ]);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickQuestions = [
    "What are the symptoms of malaria?",
    "How can I prevent infections?",
    "When should I see a doctor for fever?",
    "What are healthy eating habits?",
    "How to manage diabetes?",
    "What are signs of high blood pressure?",
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">AI Health Assistant</h1>
              <p className="text-green-100 text-sm">Powered by Medical Documents & AI</p>
            </div>
          </div>
          <Button 
            onClick={clearChat}
            variant="outline" 
            className="border-green-400 text-green-100 hover:bg-green-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex  mx-auto w-full">
        {/* Quick Questions Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-4">💡 Quick Questions</h3>
          <div className="space-y-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputText(question)}
                className="w-full text-left p-3 text-sm bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Medical Disclaimer</h4>
            <p className="text-xs text-yellow-700">
              This AI provides general health information based on medical documents. 
              Always consult healthcare professionals for medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-2xl ${message.isUser ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.isUser
                        ? 'bg-green-600 text-white rounded-br-md'
                        : 'bg-white border border-gray-200 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {message.isUser ? (
                        <User className="w-4 h-4 mt-1 text-green-100" />
                      ) : (
                        <Bot className="w-4 h-4 mt-1 text-green-600" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed ${
                          message.isUser ? 'text-white' : 'text-gray-800'
                        }`}>
                          {message.text}
                        </p>
                        
                        {/* Sources and confidence for bot messages */}
                        {!message.isUser && (message.sources || message.confidence) && (
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            {message.sources && (
                              <p className="text-xs text-gray-500 mb-1">
                                📚 <strong>Sources:</strong> {message.sources.join(', ')}
                              </p>
                            )}
                            {message.confidence && (
                              <p className="text-xs text-gray-500">
                                🎯 <strong>Confidence:</strong> {Math.round(message.confidence * 100)}%
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-1 px-2">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-2xl">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-green-600" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <span className="text-gray-500 text-sm ml-2">AI is analyzing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Recording Indicator */}
          {isRecording && (
            <div className="px-6 py-3 bg-red-50 border-t border-red-200">
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium">🎤 Recording... Click to stop</span>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="flex gap-3 items-end">
              {/* Voice Recording Button */}
              <Button
                type="button"
                onClick={toggleRecording}
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className="shrink-0"
              >
                <MicVocal className="w-4 h-4" />
              </Button>

              {/* Text Input */}
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  placeholder="Ask me about your health concerns... (Press Enter to send, Shift+Enter for new line)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="min-h-[60px] max-h-32 resize-none"
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className="shrink-0 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;