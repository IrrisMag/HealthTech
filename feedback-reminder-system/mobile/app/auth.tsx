import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService, LoginCredentials } from '../lib/auth';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.login(credentials);
      router.replace('/');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!credentials.email || !credentials.password || !fullName || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (credentials.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.register({
        email: credentials.email,
        password: credentials.password,
        full_name: fullName,
        role: 'patient',
        phone_number: phoneNumber,
        language: 'en',
      });
      Alert.alert(
        'Registration Successful',
        'Your account has been created! SMS credentials have been sent to your phone. Please login with your credentials.',
        [{ text: 'OK', onPress: () => setIsLogin(true) }]
      );
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gradient-to-br from-blue-50 to-green-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-12">
        <View className="flex-1 justify-center">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-3xl">🏥</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 text-center">
              HealthTech
            </Text>
            <Text className="text-lg text-gray-600 text-center mt-2">
              Douala General Hospital
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-1">
              Patient Mobile App
            </Text>
          </View>

          {/* Form */}
          <View className="bg-white rounded-2xl p-6 shadow-lg">
            <Text className="text-2xl font-bold text-center mb-6 text-gray-900">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Text>

            {!isLogin && (
              <>
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Full Name</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!isLoading}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="+237 6XX XXX XXX"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    SMS credentials will be sent to this number
                  </Text>
                </View>
              </>
            )}

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Enter your email"
                value={credentials.email}
                onChangeText={(text) => setCredentials(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <View className="relative">
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 pr-12 text-base"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  className="absolute right-4 top-3"
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Text className="text-gray-500 text-lg">
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className={`rounded-lg py-4 mb-4 ${
                isLoading ? 'bg-gray-400' : 'bg-blue-600'
              }`}
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-semibold ml-2">
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              disabled={isLoading}
              className="py-2"
            >
              <Text className="text-blue-600 text-center">
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-8">
            <Text className="text-center text-sm text-gray-500">
              For hospital staff: Please use the web interface
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}