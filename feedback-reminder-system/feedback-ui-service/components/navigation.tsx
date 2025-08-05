"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Bot, BarChart3, Calendar, UserPlus, Users, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const Navigation = () => {
  const pathname = usePathname();
  const { user, logout, canAccessFeature } = useAuth();

  // Don't show navigation on login page
  if (pathname === '/login') {
    return null;
  }

  // Don't show navigation if not authenticated
  if (!user) {
    return null;
  }

  const getNavItems = () => {
    const items = [
      { href: "/", label: "Home", icon: Home, feature: "home" },
    ];

    // Add role-based navigation items
    if (canAccessFeature('feedback')) {
      items.push({ href: "/feedback", label: "Feedback", icon: MessageSquare, feature: "feedback" });
    }

    if (canAccessFeature('reminders')) {
      items.push({ href: "/reminders", label: "Reminders", icon: Calendar, feature: "reminders" });
    }

    if (canAccessFeature('chatbot')) {
      items.push({ href: "/chatbot", label: "AI Assistant", icon: Bot, feature: "chatbot" });
    }

    if (canAccessFeature('analytics')) {
      items.push({ href: "/analytics", label: "Analytics", icon: BarChart3, feature: "analytics" });
    }

    if (canAccessFeature('user-registration')) {
      items.push({ href: "/register", label: "Register Staff", icon: Users, feature: "user-registration" });
    }

    if (canAccessFeature('patient-registration')) {
      items.push({ href: "/register-patient", label: "Register Patient", icon: UserPlus, feature: "patient-registration" });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-gray-900">HealthTech</span>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center gap-2 ${
                      isActive
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* User info and logout */}
            <div className="ml-4 flex items-center space-x-3 border-l pl-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user.full_name}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;