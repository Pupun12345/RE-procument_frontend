// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

// Toast Provider (client-side only)
import { Toaster } from "react-hot-toast";

// LayoutClient (your Zustand hydration wrapper)
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "HRMS",
  description: "HRMS frontend - Next.js + TypeScript + Tailwind",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-gray-50 antialiased">
        {/* Client-side providers (Zustand hydration, toast, etc.) */}
        <LayoutClient>
          {children}
          <Toaster position="top-right" />
        </LayoutClient>
      </body>
    </html>
  );
}
