import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

const HomeScreen = () => {
  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 to-white justify-center px-6">
      <View className="items-center mb-16">
        <Text className="text-4xl font-bold text-gray-900 mb-4 text-center">
          HealthTech Platform
        </Text>
        <Text className="text-xl text-gray-600 mb-8 text-center">
          Douala General Hospital - Patient Feedback System
        </Text>
        
        <View className="gap-4 w-full max-w-sm">
          <Link href="/feedback" asChild>
            <TouchableOpacity className="bg-blue-600 px-8 py-4 rounded-lg">
              <Text className="text-white text-lg font-semibold text-center">
                📝 Submit Feedback
              </Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/chatbot" asChild>
            <TouchableOpacity className="bg-green-600 px-8 py-4 rounded-lg">
              <Text className="text-white text-lg font-semibold text-center">
                🤖 Health Assistant
              </Text>
            </TouchableOpacity>
          </Link>
          
          <TouchableOpacity className="border border-blue-600 px-8 py-4 rounded-lg">
            <Text className="text-blue-600 text-lg font-semibold text-center">
              📊 View My Feedback
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="gap-4">
        <View className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <Text className="text-lg font-semibold mb-2">
            🧠 AI-Powered Analysis
          </Text>
          <Text className="text-gray-600">
            Your feedback is automatically analyzed for sentiment and priority
          </Text>
        </View>
        
        <View className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <Text className="text-lg font-semibold mb-2">
            🤖 AI Health Assistant
          </Text>
          <Text className="text-gray-600">
            Get instant answers to health questions with our AI chatbot
          </Text>
        </View>
        
        <View className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <Text className="text-lg font-semibold mb-2">
            🌍 Multi-Language
          </Text>
          <Text className="text-gray-600">
            Available in English, French, Duala, and Fulfulde
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;
