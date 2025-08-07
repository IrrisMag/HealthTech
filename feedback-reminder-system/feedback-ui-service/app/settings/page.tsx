"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Bell,
  Shield,
  Globe,
  Monitor,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: true,
      push: false,
      reminders: true
    },
    system: {
      language: "en",
      timezone: "UTC",
      theme: "light",
      autoRefresh: true
    },
    api: {
      track1Url: "https://track1-production.up.railway.app",
      track2Url: "https://healthtech-production-4917.up.railway.app",
      track3Url: "https://track3-blood-bank-backend-production.up.railway.app"
    }
  });

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Load saved settings
      const savedSettings = localStorage.getItem('settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('settings', JSON.stringify(settings));
      
      // Here you could also save to backend API
      // await fetch('/api/settings', { method: 'POST', body: JSON.stringify(settings) });
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Loading Settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Settings className="h-8 w-8 mr-3 text-blue-600" />
                  System Settings
                </h1>
                <p className="text-gray-600 mt-1">Configure your HealthTech platform preferences</p>
              </div>
            </div>
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-orange-600" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <Switch
                  id="sms-notifications"
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, sms: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reminder-notifications">Appointment Reminders</Label>
                <Switch
                  id="reminder-notifications"
                  checked={settings.notifications.reminders}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, reminders: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="h-5 w-5 mr-2 text-blue-600" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system preferences and display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={settings.system.language}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      system: { ...prev.system, language: e.target.value }
                    }))
                  }
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={settings.system.timezone}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      system: { ...prev.system, timezone: e.target.value }
                    }))
                  }
                >
                  <option value="UTC">UTC</option>
                  <option value="Africa/Douala">Africa/Douala</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">Auto Refresh Dashboard</Label>
                <Switch
                  id="auto-refresh"
                  checked={settings.system.autoRefresh}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      system: { ...prev.system, autoRefresh: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-green-600" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Backend API endpoints for each track (Admin only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="track1-url">Track 1 API (Feedback & Reminders)</Label>
                  <Input
                    id="track1-url"
                    value={settings.api.track1Url}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        api: { ...prev.api, track1Url: e.target.value }
                      }))
                    }
                    disabled={user?.role !== 'admin'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="track2-url">Track 2 API (AI Chatbot)</Label>
                  <Input
                    id="track2-url"
                    value={settings.api.track2Url}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        api: { ...prev.api, track2Url: e.target.value }
                      }))
                    }
                    disabled={user?.role !== 'admin'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="track3-url">Track 3 API (Blood Bank)</Label>
                  <Input
                    id="track3-url"
                    value={settings.api.track3Url}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        api: { ...prev.api, track3Url: e.target.value }
                      }))
                    }
                    disabled={user?.role !== 'admin'}
                  />
                </div>
              </div>
              {user?.role !== 'admin' && (
                <p className="text-sm text-gray-500 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  API configuration is restricted to administrators
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
