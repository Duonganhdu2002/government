"use client";
import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAppDispatch } from "@/store/hooks";
import { loginUser } from "@/store/authSlice";
import { LoginCredentials } from "@/services/authService";

const LoginForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const credentials: LoginCredentials = { username, password };

    try {
      const resultAction = await dispatch(loginUser(credentials));
      if (loginUser.fulfilled.match(resultAction)) {
        const { accessToken, refreshToken } = resultAction.payload;
        // Lưu token vào cookies
        Cookies.set("accessToken", accessToken, { secure: true, sameSite: "strict", path: "/" });
        Cookies.set("refreshToken", refreshToken, { secure: true, sameSite: "strict", path: "/" });
        setLoading(false);
        router.push("/");
      } else {
        setError(resultAction.payload as string);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden mx-[5%]">
      <div className="bg-white px-8 py-6">
        <h2 className="text-xl font-medium text-center">Sign In</h2>
        <p className="text-center text-gray-500 text-sm mt-3">Use your username and password to sign in</p>
      </div>
      <div className="bg-gray-50 px-8 py-6 border-t-[1px]">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <button
            type="submit"
            className="w-full py-2 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-900 transition"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
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
