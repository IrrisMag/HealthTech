import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";

export const metadata: Metadata = {
  title: "HealthTech Platform - Douala General Hospital",
  description: "Integrated Healthcare Management System - Patient Communication, AI Assistant & Blood Bank",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Sidebar>
          {children}
        </Sidebar>
      </body>
    </html>
  );
}
