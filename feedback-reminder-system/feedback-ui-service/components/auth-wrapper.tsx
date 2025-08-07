"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      const authStatus = localStorage.getItem('isAuthenticated');
      
      if (!userData || !authStatus || authStatus !== 'true') {
        // Clear any invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        // Redirect to login
        router.replace('/login');
        return;
      }

      try {
        JSON.parse(userData); // Validate JSON
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid user data');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        router.replace('/login');
        return;
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
