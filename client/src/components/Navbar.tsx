"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-extrabold text-blue-600 transition-transform group-hover:scale-105">
              🚕
            </span>
            <span className="text-xl font-bold tracking-tight text-gray-800 group-hover:text-blue-600 transition-colors">
              TaxiBooking
            </span>
          </Link>

          {/* Nav Links */}
          {user && (
            <div className="hidden md:flex items-center gap-8">
              {user.role === 'CUSTOMER' && (
                <>
                  <Link
                    href="/booking"
                    className="text-gray-700 hover:text-blue-600 font-semibold transition relative group"
                  >
                    Book Ride
                    <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>

                  <Link
                    href="/my-bookings"
                    className="text-gray-700 hover:text-blue-600 font-semibold transition relative group"
                  >
                    My Bookings
                    <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </>
              )}

              {user.role === "ADMIN" && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="text-purple-700 hover:text-purple-800 font-semibold transition relative group"
                  >
                    Dashboard
                    <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link
                    href="/admin/bookings"
                    className="text-purple-700 hover:text-purple-800 font-semibold transition relative group"
                  >
                    All Bookings
                    <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link
                    href="/admin/vehicles"
                    className="text-purple-700 hover:text-purple-800 font-semibold transition relative group"
                  >
                    Vehicles
                    <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* User Info */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {user.role.toLowerCase()}
                  </span>
                </div>

                {/* Role Badge */}
                {user.role === "ADMIN" && (
                  <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                    ADMIN
                  </span>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover:underline"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
