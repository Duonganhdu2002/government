// src/app/loading.tsx
"use client";

import React from "react";

/**
 * Loading component to show a spinner while data is loading
 */
const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      <p className="ml-3 text-gray-600">Loading...</p>
    </div>
  );
};

export default Loading;
