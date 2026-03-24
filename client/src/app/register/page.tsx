"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await register({ firstName, lastName, email, password, phone });
      toast.success("Registration successful!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* LEFT SIDE */}
      <div className="hidden md:flex flex-col justify-center px-16 relative">
        <div className="absolute top-10 left-10 text-xl font-bold">
          🚖 TaxiBooking
        </div>

        <h1 className="text-5xl font-black text-gray-900 mb-6">
          Join Us 🚀
        </h1>

        <p className="text-lg text-gray-600 mb-10">
          Create your account and start booking rides instantly with transparent pricing.
        </p>

        <div className="space-y-4 text-gray-600">
          <p>✔ Quick signup</p>
          <p>✔ Instant booking</p>
          <p>✔ Trusted drivers</p>
        </div>

        {/* Glow */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 blur-3xl rounded-full"></div>
      </div>

      <div className="flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <span className="text-3xl">🚕</span>
            <span className="text-xl font-bold tracking-tight text-gray-800">TaxiBooking</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
            Create Account
          </h2>

          <p className="text-sm text-gray-500 text-center mb-8">
            Start your journey today
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                type="text"
                placeholder="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Email */}
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {/* Phone */}
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
              {isLoading ? "Creating..." : "Create Account"}
            </button>

            {/* Login link */}
            <p className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-medium">
                Sign in
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}