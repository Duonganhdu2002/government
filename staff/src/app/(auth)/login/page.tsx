// src/app/auth/login/page.tsx
"use client";
import React from "react";
import LoginForm from "./components/LoginForm";

/**
 * Login Page Component
 * This is the main route file for the login page.
 * It renders the LoginForm component inside a centered container.
 */
const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
