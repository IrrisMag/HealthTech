"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to dashboard - no authentication needed
    router.push('/');
  }, [router]);

  return null; // Redirecting to dashboard
}
