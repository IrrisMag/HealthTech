"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/register-patient'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Initialize state based on route type
  const [isReady, setIsReady] = useState(isPublicRoute);

  useEffect(() => {
    // If it's a public route, already ready
    if (isPublicRoute) {
      return;
    }

    // For protected routes, check authentication
    const userData = localStorage.getItem('user');
    const authStatus = localStorage.getItem('isAuthenticated');

    if (userData && authStatus === 'true') {
      try {
        JSON.parse(userData); // Validate JSON
        setIsReady(true);
      } catch (error) {
        console.error('Invalid user data');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        router.push('/login');
      }
    } else {
      // Not authenticated, redirect to login
      router.push('/login');
    }
  }, [pathname, isPublicRoute, router]);

  // Show loading while checking authentication
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render children when ready
  return <>{children}</>;
}
