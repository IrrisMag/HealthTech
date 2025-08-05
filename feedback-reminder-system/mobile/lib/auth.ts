// Authentication utilities for Mobile App (Patients only)
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'patient';
  is_active: boolean;
  permissions: string[];
  last_login?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: 'patient';
  phone_number: string;
  language?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// API URLs
const TRACK1_API_URL = process.env.EXPO_PUBLIC_TRACK1_API_URL || 'https://track1-production.up.railway.app';

// Authentication API functions
export class AuthService {
  private static getAuthApiUrl(): string {
    return `${TRACK1_API_URL}/api/auth`;
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.getAuthApiUrl()}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    
    // Only allow patients to use mobile app
    if (data.user.role !== 'patient') {
      throw new Error('Only patients can use the mobile app. Please use the web interface.');
    }
    
    // Store tokens in AsyncStorage
    await AsyncStorage.setItem('access_token', data.access_token);
    await AsyncStorage.setItem('refresh_token', data.refresh_token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  static async register(userData: RegisterData): Promise<{ message: string; user_id: string }> {
    const response = await fetch(`${this.getAuthApiUrl()}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return await response.json();
  }

  static async logout(): Promise<void> {
    const token = await AsyncStorage.getItem('access_token');
    
    if (token) {
      try {
        await fetch(`${this.getAuthApiUrl()}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ access_token: token }),
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }

    // Clear AsyncStorage
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const user = await this.getCurrentUser();
      return !!(token && user);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${this.getAuthApiUrl()}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      
      return data.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      return null;
    }
  }

  // Patient-specific access control
  static async canSubmitFeedback(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'patient';
  }

  static async canUseChatbot(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'patient';
  }

  static async canViewOwnFeedback(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'patient';
  }

  // Helper to get authenticated API headers
  static async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }
}
