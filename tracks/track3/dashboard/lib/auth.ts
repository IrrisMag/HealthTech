// Authentication utilities for Track 3 Blood Bank Dashboard
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

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// API URLs - Track 3 uses Track 1 auth service
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

  // Blood bank specific access control
  static canAccessBloodBank(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Blood bank access for medical staff and admins
    return ['admin', 'doctor', 'nurse', 'staff'].includes(user.role);
  }

  static canManageInventory(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Inventory management for admins and specific staff
    return ['admin', 'staff'].includes(user.role) || 
           (user.role === 'nurse' && user.department === 'laboratory');
  }

  static canViewReports(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Reports access for medical staff and admins
    return ['admin', 'doctor', 'nurse', 'staff'].includes(user.role);
  }

  static canAccessForecasting(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Forecasting access for admins and doctors
    return ['admin', 'doctor'].includes(user.role);
  }

  static canAccessOptimization(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Optimization access for admins and specific staff
    return ['admin'].includes(user.role) || 
           (user.role === 'staff' && user.department === 'administration');
  }
}
