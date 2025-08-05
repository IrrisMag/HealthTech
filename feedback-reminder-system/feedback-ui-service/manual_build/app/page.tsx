"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Home() {
  const { user, canAccessFeature } = useAuth();

  if (!user) {
    return null; // AuthProvider will handle redirect to login
  }
  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HealthTech Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Douala General Hospital - Patient Feedback & Management System
          </p>
          <p className="text-lg text-blue-600 mb-8">
            Welcome, {user.full_name} ({user.role.charAt(0).toUpperCase() + user.role.slice(1)})
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            {canAccessFeature('feedback') && (
              <Link href="/feedback">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  📝 Submit Feedback
                </Button>
              </Link>
            )}

            {canAccessFeature('reminders') && (
              <Link href="/reminders">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  📅 Schedule Reminders
                </Button>
              </Link>
            )}

            {canAccessFeature('chatbot') && (
              <Link href="/chatbot">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  🤖 Health Assistant
                </Button>
              </Link>
            )}

            {canAccessFeature('analytics') && (
              <Link href="/analytics">
                <Button variant="outline" size="lg">
                  📊 View Analytics
                </Button>
              </Link>
            )}

            {canAccessFeature('user-registration') && (
              <Link href="/register">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  👥 Register Staff
                </Button>
              </Link>
            )}

            {canAccessFeature('patient-registration') && (
              <Link href="/register?type=patient">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                  🏥 Register Patient
                </Button>
              </Link>
            )}

            {canAccessFeature('notifications') && (
              <Link href="/notifications">
                <Button variant="outline" size="lg">
                  🔔 Notifications
                </Button>
              </Link>
            )}

            {canAccessFeature('user-management') && (
              <Link href="/admin/users">
                <Button variant="outline" size="lg">
                  👥 Manage Users
                </Button>
              </Link>
            )}

            {canAccessFeature('system-settings') && (
              <Link href="/admin/settings">
                <Button variant="outline" size="lg">
                  ⚙️ System Settings
                </Button>
              </Link>
            )}

            {canAccessFeature('blood-bank-dashboard') && (
              <Link href="https://track3-blood-bank-dashboard.netlify.app" target="_blank">
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  🩸 Blood Bank Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              🧠 AI-Powered Feedback Analysis
            </h3>
            <p className="text-gray-600">
              Automatic sentiment analysis, keyword extraction, and priority assignment for patient feedback
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              📅 Smart Appointment Reminders
            </h3>
            <p className="text-gray-600">
              Automated SMS reminders for appointments and medications via Twilio integration
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              🤖 AI Health Assistant
            </h3>
            <p className="text-gray-600">
              Get instant answers to health questions with our AI chatbot powered by medical documents
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              🌍 Multi-language Support
            </h3>
            <p className="text-gray-600">
              Full support for French, English, Bassa, Ewondo, and Nguemba languages
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">🎯 Platform Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-600 mb-2">✅ Currently Available:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Patient feedback submission with sentiment analysis</li>
                <li>• AI health assistant with medical document knowledge</li>
                <li>• Real-time analytics dashboard</li>
                <li>• SMS notifications via Twilio</li>
                <li>• Appointment and medication reminders</li>
                <li>• Multi-language interface</li>
                <li>• Keyword extraction and priority assignment</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">🚀 System Status:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Backend Services: <span className="text-green-600 font-medium">6/6 Running</span></li>
                <li>• Database: <span className="text-green-600 font-medium">Connected</span></li>
                <li>• SMS Service: <span className="text-green-600 font-medium">Active</span></li>
                <li>• AI Analysis: <span className="text-green-600 font-medium">Operational</span></li>
                <li>• Chatbot Service: <span className="text-green-600 font-medium">Online</span></li>
                <li>• Frontend: <span className="text-green-600 font-medium">Deployed</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
