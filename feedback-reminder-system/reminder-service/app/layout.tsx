import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">
        <header className="p-4 bg-blue-900 text-white font-bold text-xl">Reminder Service UI</header>
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
