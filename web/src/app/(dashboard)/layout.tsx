"use client";

import { useState, Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css"; // Cập nhật lại đường dẫn nếu cần
import Loading from "../loading";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

/**
 * Font configurations using Geist fonts
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Layout component with Sidebar, Header, and Content Wrapper.
 * Các trang auth sẽ sử dụng layout riêng (src/app/auth/layout.tsx)
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 overflow-x-hidden`}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <Header setSidebarOpen={setSidebarOpen} />
            <div className="p-6 flex-1">
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
