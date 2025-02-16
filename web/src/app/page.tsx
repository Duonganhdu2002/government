// src/app/page.tsx
"use client";

import React from "react";

/**
 * Main page component
 */
const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900">Welcome to Next.js App</h1>
      <p className="text-gray-600 mt-2">This is your main application page.</p>
    </div>
  );
};

export default HomePage;
