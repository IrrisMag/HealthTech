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
  canAccessBloodBank: () => boolean;
  canManageInventory: () => boolean;
  canViewReports: () => boolean;
  canAccessForecasting: () => boolean;
  canAccessOptimization: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        router.push('/');
      }
    }
  }, [user, isLoading, pathname, router]);

  const initializeAuth = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      const token = AuthService.getToken();

      if (currentUser && token) {
        // Verify token is still valid by attempting to refresh
        const newToken = await AuthService.refreshToken();
        if (newToken && AuthService.canAccessBloodBank()) {
          setUser(currentUser);
        } else {
          // Token refresh failed or no blood bank access, clear auth state
          AuthService.logout();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password });
      
      // Check if user can access blood bank system
      if (!AuthService.canAccessBloodBank()) {
        AuthService.logout();
        throw new Error("You don't have permission to access the blood bank system.");
      }

      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    router.push('/login');
  };

  const canAccessBloodBank = (): boolean => {
    return AuthService.canAccessBloodBank();
  };

  const canManageInventory = (): boolean => {
    return AuthService.canManageInventory();
  };

  const canViewReports = (): boolean => {
    return AuthService.canViewReports();
  };

  const canAccessForecasting = (): boolean => {
    return AuthService.canAccessForecasting();
  };

  const canAccessOptimization = (): boolean => {
    return AuthService.canAccessOptimization();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    canAccessBloodBank,
    canManageInventory,
    canViewReports,
    canAccessForecasting,
    canAccessOptimization,
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
  requiredPermission?: string
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, canAccessBloodBank, canManageInventory, canViewReports, canAccessForecasting, canAccessOptimization } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/login');
        return;
      }

      if (!isLoading && user && requiredPermission) {
        let hasPermission = false;
        
        switch (requiredPermission) {
          case 'inventory':
            hasPermission = canManageInventory();
            break;
          case 'reports':
            hasPermission = canViewReports();
            break;
          case 'forecasting':
            hasPermission = canAccessForecasting();
            break;
          case 'optimization':
            hasPermission = canAccessOptimization();
            break;
          default:
            hasPermission = canAccessBloodBank();
        }

        if (!hasPermission) {
          router.push('/unauthorized');
          return;
        }
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}
