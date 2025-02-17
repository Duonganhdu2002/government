"use client";

import "./globals.css";

export default function NotFound() {
  return (
    <div className="h-[100vh] w-full flex justify-center items-center">
      <div className="flex flex-col items-center justify-center p-4 sm:p-6">
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-800">404</h1>
        <p className="text-gray-600 mt-3 text-center max-w-xs sm:max-w-md">
          Oops! The page you are looking for doesn't exist.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <a
            href="/"
            className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition text-center"
          >
            Go to Homepage
          </a>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition text-center"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
