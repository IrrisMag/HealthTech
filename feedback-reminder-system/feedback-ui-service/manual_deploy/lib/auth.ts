// Authentication utilities for HealthTech platform
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'staff' | 'patient';
  employee_id?: string;
  department?: string;
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
  role: 'admin' | 'doctor' | 'nurse' | 'staff' | 'patient';
  phone_number: string;
  employee_id?: string;
  department?: string;
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
const TRACK1_API_URL = process.env.NEXT_PUBLIC_TRACK1_API_URL || 'https://track1-production.up.railway.app';

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
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
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
    const token = localStorage.getItem('access_token');
    
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

    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  static isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  static hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  static hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  static canRegisterUsers(): boolean {
    return this.hasRole('admin');
  }

  static canRegisterPatients(): boolean {
    return this.hasAnyRole(['nurse', 'staff', 'admin']);
  }

  static async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return null;
    }

    try {
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
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      return data.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return null;
    }
  }

  // Role-based access control helpers
  static getAccessibleFeatures(): string[] {
    const user = this.getCurrentUser();
    if (!user) return [];

    switch (user.role) {
      case 'patient':
        return ['chatbot', 'feedback'];
      case 'nurse':
        return ['patient-registration', 'chatbot', 'feedback', 'reminders', 'notifications'];
      case 'receptionist':
        return ['patient-registration', 'feedback', 'reminders', 'notifications'];
      case 'staff':
        return ['patient-registration', 'chatbot', 'feedback', 'reminders'];
      case 'admin':
        return ['user-registration', 'analytics', 'chatbot', 'feedback', 'reminders', 'patient-registration', 'notifications', 'system-settings', 'user-management'];
      case 'doctor':
        return ['chatbot', 'feedback', 'reminders', 'analytics', 'patient-registration'];
      case 'blood_bank_staff':
        return ['blood-bank-dashboard', 'analytics'];
      default:
        return [];
    }
  }

  static canAccessFeature(feature: string): boolean {
    return this.getAccessibleFeatures().includes(feature);
  }
}
