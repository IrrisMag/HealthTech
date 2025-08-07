"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  MessageSquare,
  Bot,
  Calendar,
  BarChart3,
  Users,
  Activity,
  ArrowRight,
  Building2,
  Globe,
  ExternalLink,
  Shield,
  Stethoscope,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  TrendingUp,
  UserCheck,
  Droplets
} from "lucide-react";

export default function Home() {
  const [user, setUser] = useState({
    full_name: "Dr. Sarah Mballa",
    role: "admin",
    department: "Emergency Medicine"
  });

  const [systemStats, setSystemStats] = useState({
    activePatients: 1247,
    pendingReminders: 23,
    bloodUnitsAvailable: 156,
    aiConsultations: 89,
    systemUptime: "99.9%"
  });

  useEffect(() => {
    // Get user from localStorage if available
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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

  const healthTechTracks = {
    title: "HealthTech Integrated Platform",
    subtitle: "Three-Track Healthcare Management System",
    tracks: [
      {
        id: 'track1',
        trackNumber: 'Track 1',
        title: 'Patient Communication Hub',
        description: 'Comprehensive patient feedback and appointment reminder system with multi-language support',
        icon: MessageSquare,
        color: 'from-blue-500 to-cyan-500',
        priority: 'high',
        features: [
          'Real-time Patient Feedback Collection',
          'Automated SMS Appointment Reminders',
          'Multi-language Support (EN/FR)',
          'Advanced Analytics & Reporting',
          'Patient Satisfaction Tracking'
        ],
        routes: [
          { name: 'Feedback Management', path: '/feedback', icon: MessageSquare },
          { name: 'Reminder System', path: '/reminders', icon: Calendar },
          { name: 'Analytics Dashboard', path: '/analytics', icon: BarChart3 }
        ],
        mainRoute: '/feedback',
        stats: { active: systemStats.activePatients, pending: systemStats.pendingReminders },
        deployment: {
          url: 'https://healthtech-platform-fresh.netlify.app',
          status: 'active'
        }
      },
      {
        id: 'track2',
        trackNumber: 'Track 2',
        title: 'AI Health Assistant',
        description: 'Intelligent medical chatbot providing 24/7 patient support and preliminary health guidance',
        icon: Bot,
        color: 'from-purple-500 to-pink-500',
        priority: 'medium',
        features: [
          'AI-Powered Medical Consultation',
          'Symptom Assessment & Triage',
          'Medical Information Database',
          '24/7 Patient Support System',
          'Integration with Hospital Records'
        ],
        routes: [
          { name: 'AI Assistant', path: '/chatbot', icon: Bot }
        ],
        mainRoute: '/chatbot',
        stats: { consultations: systemStats.aiConsultations, uptime: systemStats.systemUptime },
        deployment: {
          url: 'https://healthtech-production-4917.up.railway.app',
          status: 'active'
        }
      },
      {
        id: 'track3',
        trackNumber: 'Track 3',
        title: 'Blood Bank Management',
        description: 'AI-enhanced blood bank system with real-time inventory monitoring and demand forecasting',
        icon: Heart,
        color: 'from-red-500 to-rose-500',
        priority: 'critical',
        features: [
          'Real-time Blood Inventory Tracking',
          'AI-Powered Demand Forecasting',
          'Comprehensive Donor Management',
          'DHIS2 System Integration',
          'Automated Expiry Alerts'
        ],
        routes: [
          { name: 'Blood Bank Dashboard', path: '/blood-bank', icon: Heart },
          { name: 'Donor Management', path: '/donors', icon: Users },
          { name: 'Live Monitoring', path: '/monitoring', icon: Activity }
        ],
        mainRoute: '/blood-bank',
        externalUrl: 'https://track3-blood-bank-dashboard.netlify.app',
        stats: { units: systemStats.bloodUnitsAvailable, status: 'optimal' },
        deployment: {
          url: 'https://track3-blood-bank-dashboard.netlify.app',
          status: 'active'
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Medical Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 medical-shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 hospital-gradient rounded-xl flex items-center justify-center medical-shadow">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HealthTech Platform</h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  Douala General Hospital - Integrated Care System
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Welcome, {user.full_name}</p>
              <p className="text-xs text-gray-600 flex items-center justify-end">
                <UserCheck className="h-3 w-3 mr-1" />
                {getRoleDisplayName(user.role)} • {user.department}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Integrated Healthcare Management System
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl">
            Access all healthcare management tools from one unified platform.
            Monitor patient communication, AI assistance, and blood bank operations in real-time.
          </p>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="medical-card">
            <div className="medical-card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.activePatients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="medical-card">
            <div className="medical-card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reminders</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.pendingReminders}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="medical-card">
            <div className="medical-card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blood Units</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.bloodUnitsAvailable}</p>
                </div>
                <Droplets className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="medical-card">
            <div className="medical-card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Consultations</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.aiConsultations}</p>
                </div>
                <Bot className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="medical-card">
            <div className="medical-card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.systemUptime}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Dashboard */}
        <div className="mb-8">
          <div className="medical-card hospital-gradient text-white">
            <div className="medical-card-header border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <Activity className="h-6 w-6 mr-3" />
                    System Control Center
                  </h3>
                  <p className="text-blue-100 mt-1">
                    Comprehensive overview and real-time monitoring dashboard
                  </p>
                </div>
                <div className="status-indicator status-success">
                  <CheckCircle className="h-4 w-4" />
                  All Systems Operational
                </div>
              </div>
            </div>
            <div className="medical-card-content">
              <Link href="/dashboard">
                <button className="btn-medical bg-white text-blue-600 hover:bg-blue-50 medical-shadow">
                  <BarChart3 className="h-5 w-5" />
                  Open Control Dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* HealthTech Platform Overview */}
        <div className="mb-8">
          <div className="medical-card">
            <div className="medical-card-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{healthTechTracks.title}</h3>
                  <p className="text-gray-600">{healthTechTracks.subtitle}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="status-indicator status-success">
                    <CheckCircle className="h-4 w-4" />
                    3 Tracks Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Track Cards - Grouped */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {healthTechTracks.tracks.map((track) => {
            const IconComponent = track.icon;
            const getPriorityColor = (priority: string) => {
              switch (priority) {
                case 'critical': return 'border-red-500 bg-red-50';
                case 'high': return 'border-orange-500 bg-orange-50';
                case 'medium': return 'border-blue-500 bg-blue-50';
                default: return 'border-gray-300 bg-gray-50';
              }
            };

            const getPriorityIcon = (priority: string) => {
              switch (priority) {
                case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
                case 'high': return <Zap className="h-4 w-4 text-orange-600" />;
                case 'medium': return <TrendingUp className="h-4 w-4 text-blue-600" />;
                default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
              }
            };

            return (
              <div key={track.id} className={`medical-card hover:medical-shadow-lg transition-all duration-300 border-l-4 ${getPriorityColor(track.priority)}`}>
                <div className="medical-card-header">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${track.color} flex items-center justify-center medical-shadow`}>
                        <IconComponent className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{track.trackNumber}</div>
                        <div className="flex items-center space-x-2">
                          {getPriorityIcon(track.priority)}
                          <span className="text-xs font-medium text-gray-600 capitalize">{track.priority} Priority</span>
                        </div>
                      </div>
                    </div>
                    <div className="status-indicator status-success">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{track.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {track.description}
                  </p>
                </div>

                <div className="medical-card-content space-y-6">
                  {/* Key Features */}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {track.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Internal Routes */}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-blue-600" />
                      Access Points
                    </h4>
                    <div className="space-y-2">
                      {track.routes.map((route, index) => {
                        const RouteIcon = route.icon;
                        return (
                          <Link key={index} href={route.path}>
                            <button className="btn-medical btn-outline w-full text-xs">
                              <RouteIcon className="h-3 w-3" />
                              {route.name}
                            </button>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Main Action & External Link */}
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <Link href={track.mainRoute}>
                      <button className="btn-medical btn-primary w-full">
                        <IconComponent className="h-4 w-4" />
                        Open {track.trackNumber} Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>

                    <a
                      href={track.deployment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <button className="btn-medical btn-outline w-full">
                        <Globe className="h-4 w-4" />
                        External Deployment
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hospital System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="medical-card">
            <div className="medical-card-header">
              <h4 className="text-lg font-semibold flex items-center text-gray-900">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Hospital Information
              </h4>
            </div>
            <div className="medical-card-content">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Douala General Hospital</p>
                <p className="text-xs text-gray-600">Integrated Healthcare Management System</p>
                <div className="flex items-center mt-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  <span className="text-xs text-gray-600">Cameroon Ministry of Health</span>
                </div>
              </div>
            </div>
          </div>

          <div className="medical-card">
            <div className="medical-card-header">
              <h4 className="text-lg font-semibold flex items-center text-gray-900">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                System Health
              </h4>
            </div>
            <div className="medical-card-content">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">All Services</span>
                  <div className="status-indicator status-success">
                    <CheckCircle className="h-3 w-3" />
                    Operational
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium text-green-600">{systemStats.systemUptime}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="medical-card">
            <div className="medical-card-header">
              <h4 className="text-lg font-semibold flex items-center text-gray-900">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                Security Status
              </h4>
            </div>
            <div className="medical-card-content">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connection</span>
                  <div className="status-indicator status-success">
                    <CheckCircle className="h-3 w-3" />
                    Secure
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Protection</span>
                  <div className="status-indicator status-success">
                    <Shield className="h-3 w-3" />
                    HIPAA Compliant
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
