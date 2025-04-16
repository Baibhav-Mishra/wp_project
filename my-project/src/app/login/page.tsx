"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        email,
        password,
      });

      if (response.status === 200) {

        // Optionally store token or user info
        // localStorage.setItem("token", response.data.token);
        router.push("/dashboard/" + response.data.name); // Redirect to home/dashboard
      } else {
        setError("Invalid login credentials.");
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-white px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-blue-100">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">🔐 Login to Your Account</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg shadow focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg shadow focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow cursor-pointer"
        >
          🚀 Login
        </button>
        <button
            onClick={() => router.push("/register")}
            className="w-full mt-3 py-3 bg-gray-100 text-blue-700 rounded-lg font-semibold hover:bg-gray-200 transition shadow cursor-pointer"
            >
            📝 Don't have an account? Register
            </button>
      </div>
    </main>
  );
}
