"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to dashboard - no authentication needed
    router.push('/dashboard');
  }, [router]);

  return null; // Redirecting to dashboard
}
