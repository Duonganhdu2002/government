// src/app/auth/register/page.tsx
"use client";

import React from "react";
import RegisterForm from "./components/RegisterForm";

/**
 * Register Page
 * Displays the registration form inside a responsive container.
 */
const RegisterPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
