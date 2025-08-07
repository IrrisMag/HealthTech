"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  MessageSquare,
  Bot,
  Calendar,
  BarChart3,
  Users,
  UserPlus,
  Heart,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Stethoscope,
  Building2,
  Shield,
  Eye,
  Droplets,
  Clock
} from "lucide-react";

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Default user for demo
      setUser({
        username: "Healthcare Professional",
        role: "admin",
        full_name: "Healthcare Professional"
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return '👑 Administrator';
      case 'nurse': return '👩‍⚕️ Nurse';
      case 'receptionist': return '🏥 Receptionist';
      case 'doctor': return '👨‍⚕️ Doctor';
      case 'staff': return '👥 Staff Member';
      case 'patient': return '🏥 Patient';
      default: return role;
    }
  };

  const canAccessFeature = (feature: string) => {
    if (!user) return true;
    
    // Role-based access control
    switch (feature) {
      case 'user-registration':
        return user.role === 'admin';
      case 'system-settings':
        return user.role === 'admin';
      default:
        return true;
    }
  };

  const navigationItems = [
    {
      category: "Main",
      items: [
        { href: "/", label: "Home", icon: Home, feature: "home" },
        { href: "/dashboard", label: "Dashboard", icon: Activity, feature: "dashboard" },
      ]
    },
    {
      category: "Track 1: Patient Communication",
      items: [
        { href: "/feedback", label: "Patient Feedback", icon: MessageSquare, feature: "feedback" },
        { href: "/reminders", label: "Appointment Reminders", icon: Calendar, feature: "reminders" },
      ]
    },
    {
      category: "Track 2: AI Assistant",
      items: [
        { href: "/chatbot", label: "AI Health Assistant", icon: Bot, feature: "chatbot" },
      ]
    },
    {
      category: "Track 3: Blood Bank",
      items: [
        { href: "/blood-bank", label: "Blood Bank Dashboard", icon: Heart, feature: "blood-bank" },
        { href: "/monitoring", label: "Live Monitoring", icon: Eye, feature: "monitoring" },
        { href: "/donors", label: "Donor Management", icon: Users, feature: "donors" },
        { href: "/donations", label: "Donations", icon: Droplets, feature: "donations" },
        { href: "/requests", label: "Blood Requests", icon: Clock, feature: "requests" },
        { 
          href: "https://track3-blood-bank-dashboard.netlify.app", 
          label: "External Blood Bank", 
          icon: ExternalLink, 
          feature: "external-blood-bank",
          external: true 
        },
      ]
    },
    {
      category: "Analytics & Reports",
      items: [
        { href: "/analytics", label: "Analytics", icon: BarChart3, feature: "analytics" },
      ]
    },
    {
      category: "Administration",
      items: [
        { href: "/register-patient", label: "Register Patient", icon: UserPlus, feature: "patient-registration" },
        { href: "/register", label: "Register Staff", icon: Shield, feature: "user-registration" },
        { href: "/admin/settings", label: "System Settings", icon: Settings, feature: "system-settings" },
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">HealthTech</h1>
            <p className="text-xs text-gray-500">Unified Platform</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-gray-500">
                {getRoleDisplayName(user.role)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-6">
          {navigationItems.map((category) => (
            <div key={category.category}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {category.category}
              </h3>
              <div className="space-y-1">
                {category.items
                  .filter(item => canAccessFeature(item.feature))
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    if (item.external) {
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Building2 className="h-3 w-3" />
            <span>Douala General Hospital</span>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full" title="System Online" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-80 bg-white border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsOpen(false)} />
          <div className="relative flex flex-col w-80 bg-white h-full">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">HealthTech</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
