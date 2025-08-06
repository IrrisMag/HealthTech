"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Bot, BarChart3, Calendar, UserPlus, Users, Heart, Clock, Droplets, Eye } from "lucide-react";

const Navigation = () => {
  const pathname = usePathname();

  // Mock user - no authentication needed
  const user = {
    full_name: "Hospital Staff",
    role: "admin"
  };

  const canAccessFeature = (feature: string) => true; // Allow access to all features

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

    if (canAccessFeature('charts')) {
      items.push({ href: "/charts", label: "Charts", icon: BarChart3, feature: "charts" });
    }

    if (canAccessFeature('user-registration')) {
      items.push({ href: "/register", label: "Register Staff", icon: Users, feature: "user-registration" });
    }

    if (canAccessFeature('patient-registration')) {
      items.push({ href: "/register-patient", label: "Register Patient", icon: UserPlus, feature: "patient-registration" });
    }

    // Blood Bank Management - Real Database Operations
    if (canAccessFeature('blood-bank-dashboard')) {
      items.push({ href: "/blood-bank", label: "Blood Bank", icon: Heart, feature: "blood-bank-dashboard" });
    }

    if (canAccessFeature('real-time-monitoring')) {
      items.push({ href: "/monitoring", label: "Live Monitoring", icon: Eye, feature: "real-time-monitoring" });
    }

    if (canAccessFeature('donor-management')) {
      items.push({ href: "/donors", label: "Donors", icon: Users, feature: "donor-management" });
    }

    if (canAccessFeature('donation-management')) {
      items.push({ href: "/donations", label: "Donations", icon: Droplets, feature: "donation-management" });
    }

    if (canAccessFeature('request-management')) {
      items.push({ href: "/requests", label: "Requests", icon: Clock, feature: "request-management" });
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

            {/* Hospital Info */}
            <div className="ml-4 flex items-center space-x-3 border-l pl-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">Douala General Hospital</span>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  HealthTech Platform
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;