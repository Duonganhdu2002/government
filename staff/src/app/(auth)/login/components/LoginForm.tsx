"use client";
import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { loginUserAPI, LoginCredentials, AuthResponse } from "@/services/authService";

/**
 * LoginForm component
 * Displays the login form with username and password input fields.
 * On submission, it calls the login API via loginUserAPI,
 * saves the access and refresh tokens in secure cookies, and redirects to the dashboard.
 */
const LoginForm: React.FC = () => {
  const router = useRouter();

  // Local state for username and password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Handles form submission.
   * Dispatches a call to the login API using the loginUserAPI function,
   * stores tokens in secure cookies, and redirects the user.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const credentials: LoginCredentials = { username, password };

    try {
      const data: AuthResponse = await loginUserAPI(credentials);

      // Store tokens in secure cookies
      Cookies.set("accessToken", data.accessToken, { secure: true, sameSite: "strict", path: "/" });
      Cookies.set("refreshToken", data.refreshToken, { secure: true, sameSite: "strict", path: "/" });

      setLoading(false);
      console.log("Login successful");
      // Redirect to dashboard (adjust route as needed)
      router.push("/");
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        setError(err.message);
        console.error("Login failed:", err.message);
        alert("Login failed: " + err.message);
      } else {
        setError("An unexpected error occurred");
        console.error("An unexpected error occurred:", err);
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden mx-[5%]">
      {/* Title Section (White Background) */}
      <div className="bg-white px-8 py-6">
        <h2 className="text-xl font-medium text-center">Sign In</h2>
        <p className="text-center text-gray-500 text-sm mt-3">
          Use your username and password to sign in
        </p>
      </div>

      {/* Form Section (Gray Background) */}
      <div className="bg-gray-50 px-8 py-6 border-t-[1px]">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-2">
              USERNAME
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 text-sm border-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-black font-semibold hover:underline">
            Sign up for free.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
