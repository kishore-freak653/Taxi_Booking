"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      toast.success("Login successful!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* LEFT SIDE - BRANDING */}
      <div className="hidden md:flex flex-col justify-center px-16 relative">
        <div className="absolute top-10 left-10 text-xl font-bold">
          🚖 TaxiBooking
        </div>

        <h1 className="text-5xl font-black text-gray-900 leading-tight mb-6">
          Welcome Back 👋
        </h1>

        <p className="text-lg text-gray-600 mb-10">
          Book rides in seconds. Fast, reliable and transparent pricing —
          anytime, anywhere.
        </p>

        {/* Feature points */}
        <div className="space-y-4 text-gray-600">
          <p>✔ Instant booking</p>
          <p>✔ No hidden charges</p>
          <p>✔ Verified drivers</p>
        </div>

        {/* Glow effect */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 blur-3xl rounded-full"></div>
      </div>

      {/* RIGHT SIDE - LOGIN CARD */}
      <div className="flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border">

          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Sign in
          </h2>

          <p className="text-sm text-gray-500 text-center mb-6">
            Access your account
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Email */}
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {/* Error */}
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            {/* Register link */}
            <p className="text-sm text-center text-gray-500">
              Don’t have an account?{" "}
              <Link href="/register" className="text-blue-600 font-medium">
                Sign up
              </Link>
            </p>

          </form>

          {/* Test credentials (cleaned) */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-600">
            <p className="font-semibold mb-1">Test Credentials</p>
            <p>Customer: customer@test.com / customer123</p>
            <p>Admin: admin@taxibooking.com / admin123</p>
          </div>

        </div>
      </div>
    </div>
  );
}