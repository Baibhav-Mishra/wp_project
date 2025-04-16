"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register/", {
        email,
        username,
        password,
      });

      if (response.status === 201) {
        setSuccess("Registration successful!");
        setTimeout(() => router.push("/login"), 1000); // redirect to login after success
      } else {
        setError("Registration failed. Try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-white px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-blue-100">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">📝 Register New Account</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">
            {success}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg shadow focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="e.g., johndoe123"
          />
        </div>

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
          onClick={handleRegister}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow cursor-pointer"
        >
          🛡️ Register
        </button>
        <button
            onClick={() => router.push("/login")}
            className="w-full mt-3 py-3 bg-gray-100 text-blue-700 rounded-lg font-semibold hover:bg-gray-200 transition shadow cursor-pointer"
          >
            🔐 Already have an account? Login
          </button>
      </div>
    </main>
  );
}
