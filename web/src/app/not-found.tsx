// src/app/not-found.tsx
"use client";

import React from "react";
import Link from "next/link";

/**
 * NotFound Component - Handles 404 page errors using Next.js Link
 */
const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-gray-600 mt-3 text-center max-w-md">
        Oops! The page you are looking for doesn't exist.
      </p>

      <div className="mt-6 flex space-x-4">
        <Link
          href="/"
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition"
        >
          Go to Homepage
        </Link>
        <Link
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            window.history.back();
          }}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
