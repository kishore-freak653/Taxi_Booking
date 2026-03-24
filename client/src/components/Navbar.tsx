"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Menu, X, LogOut, Car, History, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
    setIsMenuOpen(false);
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => {
    if (!user) return null;

    const baseClasses = mobile
      ? "flex flex-col gap-4 p-4 border-t border-gray-100"
      : "flex items-center gap-8";
    
    const linkClasses = mobile
      ? "flex items-center gap-3 text-lg font-medium text-gray-700 hover:text-blue-600"
      : "text-gray-700 hover:text-blue-600 font-semibold transition relative group";

    return (
      <div className={baseClasses}>
        {user.role === 'CUSTOMER' && (
          <>
            <Link
              href="/booking"
              onClick={() => setIsMenuOpen(false)}
              className={linkClasses}
            >
              {mobile && <Car className="w-5 h-5" />}
              Book Ride
              {!mobile && <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>}
            </Link>

            <Link
              href="/my-bookings"
              onClick={() => setIsMenuOpen(false)}
              className={linkClasses}
            >
              {mobile && <History className="w-5 h-5" />}
              My Bookings
              {!mobile && <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>}
            </Link>
          </>
        )}

        {user.role === "ADMIN" && (
          <>
            <Link
              href="/admin/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className={linkClasses}
            >
              {mobile && <LayoutDashboard className="w-5 h-5" />}
              Dashboard
              {!mobile && <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-purple-600 transition-all duration-300 group-hover:w-full"></span>}
            </Link>
          </>
        )}
      </div>
    );
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Desktop Nav Links */}
          <div className="hidden md:block">
            <NavLinks />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* User Info - Hidden on tiny screens */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-800">
                    {user.firstName}
                  </span>
                  <span className="text-[10px] text-gray-500 capitalize">
                    {user.role.toLowerCase()}
                  </span>
                </div>

                {/* Logout Button - Desktop */}
                <button
                  onClick={handleLogout}
                  className="hidden md:block bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                >
                  Logout
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover:underline text-sm sm:text-base"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 transition"
                >
                  {/* Shorter text on very small screens */}
                  <span className="sm:hidden">Join</span>
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && user && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <NavLinks mobile />
          <div className="p-4 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {user.firstName[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

