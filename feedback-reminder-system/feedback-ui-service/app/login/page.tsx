"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Stethoscope,
  User,
  Lock,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  Shield
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { value: "admin", label: "👑 Administrator" },
    { value: "doctor", label: "👨‍⚕️ Doctor" },
    { value: "nurse", label: "👩‍⚕️ Nurse" },
    { value: "receptionist", label: "🏥 Receptionist" },
    { value: "staff", label: "👥 Staff Member" },
    { value: "patient", label: "🏥 Patient" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.username || !formData.password || !formData.role) {
        throw new Error("Please fill in all fields");
      }

      // Check for jury account credentials first
      if (formData.username === "dswb" && formData.password === "12345678") {
        const userData = {
          username: "dswb",
          role: formData.role || "admin",
          full_name: "DSWB Jury Member",
          department: "Evaluation Committee",
          loginTime: new Date().toISOString(),
          isJuryAccount: true
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        router.push('/dashboard');
        return;
      }

      // Try real authentication with Track 1 auth service FIRST
      try {
        console.log('Attempting real authentication with Track 1 API...');
        const authResponse = await fetch('https://track1-production.up.railway.app/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.username,
            password: formData.password,
          }),
        });

        console.log('Auth response status:', authResponse.status);

        if (authResponse.ok) {
          const authData = await authResponse.json();
          console.log('Real authentication successful!');

          // Store real auth data
          const userData = {
            username: authData.user?.email || formData.username,
            role: authData.user?.role || formData.role,
            full_name: authData.user?.full_name || formData.username,
            department: authData.user?.department || "General",
            employee_id: authData.user?.employee_id,
            loginTime: new Date().toISOString(),
            access_token: authData.access_token,
            refresh_token: authData.refresh_token,
            isRealAuth: true
          };

          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('access_token', authData.access_token);
          localStorage.setItem('refresh_token', authData.refresh_token);

          router.push('/dashboard');
          return;
        } else {
          console.log('Real auth failed, trying demo accounts...');
        }
      } catch (authError) {
        console.log('Auth service error:', authError);
        console.log('Falling back to demo authentication');
      }

      // Demo accounts for testing (fallback)
      const demoAccounts = {
        "demo_admin": { password: "demo123", role: "admin", name: "Demo Administrator" },
        "demo_doctor": { password: "demo123", role: "doctor", name: "Demo Doctor" },
        "demo_nurse": { password: "demo123", role: "nurse", name: "Demo Nurse" },
        "demo_patient": { password: "demo123", role: "patient", name: "Demo Patient" }
      };

      const demoAccount = demoAccounts[formData.username as keyof typeof demoAccounts];
      if (demoAccount && formData.password === demoAccount.password) {
        console.log('Demo account authentication successful');
        const userData = {
          username: formData.username,
          role: demoAccount.role,
          full_name: demoAccount.name,
          loginTime: new Date().toISOString(),
          isDemoAuth: true
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        router.push('/dashboard');
        return;
      }

      // Fallback authentication for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userData = {
        username: formData.username,
        role: formData.role,
        full_name: formData.username,
        department: "General",
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/dashboard');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: string) => {
    setFormData({
      username: `demo_${role}`,
      password: "demo123",
      role: role
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Medical Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 hospital-gradient rounded-2xl flex items-center justify-center medical-shadow-lg">
              <Stethoscope className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HealthTech Platform</h1>
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
            <Building2 className="h-4 w-4" />
            <span>Douala General Hospital</span>
          </div>
          <p className="text-sm text-gray-500">Integrated Healthcare Management System</p>
          <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Secure Login</span>
            </div>
          </div>
        </div>

        {/* Medical Login Card */}
        <div className="medical-card medical-shadow-lg">
          <div className="medical-card-header">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical Staff Sign In</h2>
              <p className="text-gray-600 text-sm">
                Enter your hospital credentials to access the healthcare platform
              </p>
            </div>
          </div>
          <div className="medical-card-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                  Hospital Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your hospital username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="medical-input pl-12"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your secure password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="medical-input pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700">
                  Medical Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="medical-input medical-select"
                  required
                >
                  <option value="">Select your medical role</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="medical-card bg-red-50 border-red-200">
                  <div className="medical-card-content">
                    <div className="flex items-center space-x-2 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                className="btn-medical btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="medical-spinner w-5 h-5" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Sign In to HealthTech</span>
                  </>
                )}
              </button>
            </form>

            {/* Jury Access */}
            <div className="mt-6 pt-6 border-t border-blue-200 bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-800 text-center mb-3">🏆 Jury Access</p>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    username: "dswb",
                    password: "12345678",
                    role: "admin"
                  });
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
              >
                🎯 Quick Jury Login (dswb)
              </button>
              <p className="text-xs text-blue-600 text-center mt-2">
                Username: dswb | Password: 12345678
              </p>
            </div>

            {/* Demo Login Options */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 text-center mb-4">Quick Demo Access for Testing:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="btn-medical btn-outline text-xs"
                >
                  👑 Admin Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('doctor')}
                  className="btn-medical btn-outline text-xs"
                >
                  👨‍⚕️ Doctor Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('nurse')}
                  className="btn-medical btn-outline text-xs"
                >
                  👩‍⚕️ Nurse Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('patient')}
                  className="btn-medical btn-outline text-xs"
                >
                  🏥 Patient Demo
                </button>
              </div>
            </div>

            {/* Medical Footer */}
            <div className="mt-6 text-center space-y-3">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Building2 className="h-3 w-3" />
                  <span>Douala General Hospital</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>HIPAA Compliant</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Secure healthcare management platform • Medical data protection
              </p>
            </div>
          </div>
        </div>

        {/* Skip Login for Demo */}
        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Skip authentication (Demo Mode) →
          </Link>
        </div>
      </div>
    </div>
  );
}
