import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { AuthService, User } from "../lib/auth";

const HomeScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        router.replace('/auth');
        return;
      }

      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.replace('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.replace('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-br from-blue-50 to-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }
  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 to-white justify-center px-6">
      <View className="items-center mb-16">
        <Text className="text-4xl font-bold text-gray-900 mb-4 text-center">
          HealthTech Platform
        </Text>
        <Text className="text-xl text-gray-600 mb-4 text-center">
          Douala General Hospital - Patient Feedback System
        </Text>
        <Text className="text-lg text-blue-600 mb-8 text-center">
          Welcome, {user.full_name}!
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

          <TouchableOpacity
            className="border border-red-600 px-8 py-4 rounded-lg"
            onPress={handleLogout}
          >
            <Text className="text-red-600 text-lg font-semibold text-center">
              🚪 Sign Out
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
