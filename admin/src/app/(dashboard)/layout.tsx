"use client";
import React, { useState, useEffect, Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css"; // Update path if needed
import Loading from "../loading";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

/**
 * Font configurations using Geist fonts.
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
 * RootLayout component.
 * This layout checks for a valid user token (stored as 'accessToken' in cookies)
 * before rendering protected pages. If no token is found, it redirects to "/login".
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for the token in cookies
    const token = Cookies.get("accessToken");
    if (!token) {
      // If no token, redirect to login page
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Render loading while checking for authentication
  if (isAuthenticated === null) {
    return <Loading />;
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 overflow-x-hidden`}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}  />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header setSidebarOpen={setSidebarOpen} />
          <div className="p-6 flex-1">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
