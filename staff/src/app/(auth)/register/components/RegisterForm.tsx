"use client";
import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * RegisterForm component
 * Displays the registration form and calls the registration API.
 * All required fields are collected:
 *  - fullname, identificationnumber, address, phonenumber, email, username, password, areacode.
 * On successful registration, the user is redirected to the login page.
 */
const RegisterForm: React.FC = () => {
  // State management for input fields
  const [fullname, setFullname] = useState("");
  const [identificationnumber, setIdentificationnumber] = useState("");
  const [address, setAddress] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [areacode, setAreacode] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  /**
   * Handles the form submission by validating input,
   * building the registration data object, calling the backend API,
   * and redirecting to the login page upon success.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Build the registration object with all required fields
    const userData = {
      fullname,
      identificationnumber,
      address,
      phonenumber,
      email,
      username,
      password,
      areacode,
    };

    try {
      setLoading(true);
      // Call the backend registration API using the NEXT_PUBLIC_API_URL environment variable
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Alert the user and redirect to the login page
      alert("Registration successful! Please log in.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden mx-[5%]">
      {/* Title Section */}
      <div className="bg-white px-8 py-6">
        <h2 className="text-xl font-medium text-center">Sign Up</h2>
        <p className="text-center text-gray-500 text-sm mt-3">
          Create an account to get started
        </p>
      </div>

      {/* Form Section */}
      <div className="bg-gray-50 px-8 py-6 border-t-[1px]">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Input */}
          <div>
            <label htmlFor="fullname" className="block text-xs font-medium text-gray-700 mb-2">
              FULL NAME
            </label>
            <input
              type="text"
              id="fullname"
              className="w-full px-3 py-2 text-sm border-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="John Doe"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>
          {/* Identification Number Input */}
          <div>
            <label htmlFor="identificationnumber" className="block text-xs font-medium text-gray-700 mb-2">
              IDENTIFICATION NUMBER
            </label>
            <input
              type="text"
              id="identificationnumber"
              className="w-full px-3 py-2 text-sm border-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="435345354353"
              value={identificationnumber}
              onChange={(e) => setIdentificationnumber(e.target.value)}
              required
            />
          </div>
          {/* Address Input */}
          <div>
            <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-2">
              ADDRESS
            </label>
            <input
              type="text"
              id="address"
              className="w-full px-3 py-2 text-sm border-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="456 avenue, ho chi minh city"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          {/* Phone Number Input */}
          <div>
            <label htmlFor="phonenumber" className="block text-xs font-medium text-gray-700 mb-2">
              PHONE NUMBER
            </label>
            <input
              type="tel"
              id="phonenumber"
              className="w-full px-3 py-2 text-sm border-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="35435435345"
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              required
            />
          </div>
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
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-2">
              USERNAME
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 text-sm border-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="sdassad"
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
          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirm-password" className="block text-xs font-medium text-gray-700 mb-2">
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              id="confirm-password"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {/* Area Code Input */}
          <div>
            <label htmlFor="areacode" className="block text-xs font-medium text-gray-700 mb-2">
              AREA CODE
            </label>
            <input
              type="number"
              id="areacode"
              className="w-full px-3 py-2 text-sm border-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="2"
              value={areacode === 0 ? "" : areacode}
              onChange={(e) => setAreacode(Number(e.target.value))}
              required
            />
          </div>
          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full py-2 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-900 transition"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-semibold hover:underline">
            Sign in here.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
