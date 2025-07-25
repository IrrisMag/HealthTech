import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/navigation";

export const metadata: Metadata = {
  title: "HealthTech Platform - Douala General Hospital",
  description: "Patient Feedback & AI Health Assistant System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
