// src/app/auth/layout.tsx
"use client";

import React from "react";
import "../globals.css"; // Cập nhật lại đường dẫn nếu cần


/**
 * Authentication Layout
 * Wraps login and register pages with a simple layout.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className=" bg-gray-100">{children}</body>
    </html>
  );
}
