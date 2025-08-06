"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthService, User } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  canAccessFeature: (feature: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ['/login'];

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    // Redirect logic based on authentication state
    if (!isLoading) {
      if (!user && !publicRoutes.includes(pathname)) {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, pathname, router]);

  const initializeAuth = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      const token = AuthService.getToken();

      if (currentUser && token) {
        // Validate user object has required properties
        if (!currentUser.role || !currentUser.full_name || !currentUser.email) {
          // AuthService.getCurrentUser() will handle clearing invalid data
          setUser(null);
          return;
        }

        // Verify token is still valid by attempting to refresh
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          setUser(currentUser);
        } else {
          // Token refresh failed, clear auth state silently
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password });
      
      // Check if user is a patient (patients should use mobile app)
      if (response.user.role === 'patient') {
        AuthService.logout();
        throw new Error("Patients should use the mobile app to access the system.");
      }

      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    if (isLoggingOut) return; // Prevent multiple logout calls

    setIsLoggingOut(true);
    AuthService.logout();
    setUser(null);
    setIsLoggingOut(false);
    router.push('/login');
  };

  const canAccessFeature = (feature: string): boolean => {
    return AuthService.canAccessFeature(feature);
  };

  const hasRole = (role: string): boolean => {
    return AuthService.hasRole(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return AuthService.hasAnyRole(roles);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    canAccessFeature,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/login');
        return;
      }

      if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
