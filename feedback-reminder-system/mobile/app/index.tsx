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
          Douala General Hospital - Patient Portal
        </Text>
        <Text className="text-lg text-blue-600 mb-2 text-center">
          Welcome, {user.full_name}!
        </Text>
        <Text className="text-sm text-gray-500 mb-8 text-center">
          Patient Access - {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Text>
        
        <View className="gap-4 w-full max-w-sm">
          {/* AI Health Assistant - Primary feature for patients */}
          <Link href="/chatbot" asChild>
            <TouchableOpacity className="bg-green-600 px-8 py-4 rounded-lg shadow-lg">
              <Text className="text-white text-lg font-semibold text-center mb-1">
                🤖 AI Health Assistant
              </Text>
              <Text className="text-green-100 text-sm text-center">
                Get instant medical guidance 24/7
              </Text>
            </TouchableOpacity>
          </Link>

          {/* Feedback Submission - Secondary feature for patients */}
          <Link href="/feedback" asChild>
            <TouchableOpacity className="bg-blue-600 px-8 py-4 rounded-lg shadow-lg">
              <Text className="text-white text-lg font-semibold text-center mb-1">
                💬 Share Your Feedback
              </Text>
              <Text className="text-blue-100 text-sm text-center">
                Help us improve our services
              </Text>
            </TouchableOpacity>
          </Link>

          {/* Patient Access Notice */}
          <View className="bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
            <Text className="text-green-800 text-sm text-center font-medium mb-1">
              ✅ Patient Portal Access
            </Text>
            <Text className="text-green-700 text-xs text-center">
              You have access to AI health assistance and feedback submission
            </Text>
          </View>

          <TouchableOpacity
            className="border border-gray-400 px-8 py-2 rounded-lg mt-4"
            onPress={handleLogout}
          >
            <Text className="text-gray-600 text-sm font-medium text-center">
              🚪 Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="gap-4">
        <View className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <Text className="text-lg font-semibold mb-2">
            🤖 24/7 AI Health Assistant
          </Text>
          <Text className="text-gray-600 text-sm">
            Ask questions about symptoms, medications, and get instant medical guidance
          </Text>
        </View>

        <View className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <Text className="text-lg font-semibold mb-2">
            💬 Your Voice Matters
          </Text>
          <Text className="text-gray-600 text-sm">
            Share your experience to help us improve healthcare services
          </Text>
        </View>

        <View className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <Text className="text-orange-800 font-semibold mb-2 text-sm">
            ⚠️ Important Notice
          </Text>
          <Text className="text-orange-700 text-xs">
            The AI assistant provides general health information and should not replace professional medical advice. For emergencies, contact emergency services immediately.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;
