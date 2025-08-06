"use client";

import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPatientPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex items-center justify-center">
      <RegisterForm
        userType="patient"
        onSuccess={() => {
          // Could show a success message or redirect
        }}
      />
    </div>
  );
}
