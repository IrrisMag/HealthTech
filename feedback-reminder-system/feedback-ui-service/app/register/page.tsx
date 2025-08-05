"use client";

import { useAuth, withAuth } from "@/components/auth/AuthProvider";
import RegisterForm from "@/components/auth/RegisterForm";

function RegisterStaffPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex items-center justify-center">
      <RegisterForm 
        userType="staff" 
        onSuccess={() => {
          // Could show a success message or redirect
        }}
      />
    </div>
  );
}

// Only admins can register staff
export default withAuth(RegisterStaffPage, ['admin']);
