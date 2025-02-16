// src/app/modules/auth/login/components/LoginForm.tsx
"use client"; 
import React, { useState, FormEvent } from "react";
import Link from "next/link";

/**
 * LoginForm component
 * Displays the login form with email and password input fields.
 */
const LoginForm: React.FC = () => {
  // State management for email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden mx-[5%]">
      {/* Title Section (White Background) */}
      <div className="bg-white px-8 py-6">
        <h2 className="text-xl font-medium text-center">Sign In</h2>
        <p className="text-center text-gray-500 text-sm mt-3">
          Use your email and password to sign in
        </p>
      </div>

      {/* Form Section (Gray Background) */}
      <div className="bg-gray-50 px-8 py-6 border-t-[1px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-2">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 text-sm border-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="user@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full py-2 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-900 transition"
          >
            Sign in
          </button>
        </form>

        {/* Signup Link (Using Next.js Link) */}
        <div className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-black font-semibold hover:underline">
            Sign up for free.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
