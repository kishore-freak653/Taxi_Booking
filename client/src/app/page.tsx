"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => { setHasHydrated(true); }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (user?.role === 'ADMIN') router.push('/admin/dashboard');
  }, [user, hasHydrated]);

  // Don't render page until auth state is known
  if (!hasHydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* LEFT SIDE - TEXT */}
            <div className="flex flex-col justify-center h-full text-center md:text-left order-2 md:order-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6">
                Book Your Ride in{" "}
                <span className="text-blue-600">Seconds</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0">
                Fast, reliable, and affordable rides at your fingertips. 
                No hidden pricing. No waiting.
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {user ? (
                  <Link
                    href="/booking"
                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition text-center"
                  >
                    Book Now →
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition text-center"
                    >
                      Start Your Ride →
                    </Link>

                    <Link
                      href="/login"
                      className="w-full sm:w-auto px-8 py-4 border border-gray-300 rounded-xl font-semibold hover:bg-gray-100 transition text-center"
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>

              {/* Small trust badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6 mt-8 text-xs sm:text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1 leading-none">✔ 50K+ users</span>
                <span className="flex items-center gap-1 leading-none">✔ 4.8★ rating</span>
                <span className="flex items-center gap-1 leading-none">✔ Instant booking</span>
              </div>
            </div>

            {/* RIGHT SIDE - IMAGE */}
            <div className="relative flex justify-center items-center order-1 md:order-2">
              {/* Background glow (premium feel) */}
              <div className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-500/20 rounded-full blur-3xl"></div>

              {/* Image */}
              <img
                src="/assets/Hero.jpeg"
                alt="Taxi booking"
                className="relative w-[85%] sm:w-[90%] max-w-[450px] object-contain drop-shadow-2xl"
              />

              {/* Floating Fare Card */}
              <div className="absolute -bottom-4 right-10 sm:bottom-10 sm:left-10 bg-white px-4 py-2 sm:px-5 sm:py-3 rounded-xl shadow-xl border animate-bounce-subtle">
                <p className="text-[10px] sm:text-xs text-gray-500">Estimated Fare</p>
                <p className="text-base sm:text-lg font-bold text-gray-900">₹245</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-2xl border border-gray-100 md:-mt-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-4">
            Why Riders Trust Us
          </h2>

          <p className="text-base sm:text-lg text-gray-500 text-center mb-12 md:mb-16 max-w-2xl mx-auto">
            Built for reliability, speed, and transparency — not just another taxi app
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {[
              { emoji: "💰", title: "No Hidden Pricing", desc: "What you see is what you pay. No surge tricks, no last-minute surprises." },
              { emoji: "🛡️", title: "Verified Drivers", desc: "Every driver is background-checked and trained for safety & professionalism." },
              { emoji: "⚡", title: "Instant Confirmation", desc: "Book and get a ride confirmed in seconds with live ETA tracking." }
            ].map((feature, i) => (
              <div key={i} className="group p-6 sm:p-8 rounded-2xl border hover:border-blue-500 hover:shadow-xl transition-all">
                <div className="text-3xl sm:text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 md:mt-16 flex flex-wrap justify-center gap-4 sm:gap-8 text-gray-500 text-xs sm:text-sm font-medium">
            <span>✔ 50,000+ rides</span>
            <span>✔ 4.8★ rating</span>
            <span>✔ Available 24/7</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-b from-blue-50 to-indigo-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-4">
            Book in 4 Simple Steps
          </h2>
          <p className="text-base sm:text-lg text-gray-600 text-center mb-12 md:mb-20">
            Takes less than 30 seconds
          </p>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            {/* Line Connector - Hidden on mobile */}
            <div className="hidden md:block absolute top-10 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

            {[
              { num: "1", title: "Enter Locations", desc: "Pickup & drop" },
              { num: "2", title: "Choose Vehicle", desc: "Compare options" },
              { num: "3", title: "Check Fare", desc: "Transparent pricing" },
              { num: "4", title: "Confirm Ride", desc: "Instant booking" },
            ].map((step, idx) => (
              <div key={idx} className="relative text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-4 z-10 relative shadow-lg group-hover:scale-110 transition">
                  {step.num}
                </div>
                <h3 className="font-bold text-base sm:text-lg">{step.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent">
            Our Fleet
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Choose the perfect vehicle for your journey
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Economy",  tag: "ECONOMY",  base: "₹50",  perKm: "₹12", seats: 4, img: "/assets/Economy.jpg" },
            { name: "Sedan",    tag: "STANDARD", base: "₹80",  perKm: "₹15", seats: 4, img: "/assets/sedan.jpg"   },
            { name: "SUV",      tag: "GROUP",    base: "₹120", perKm: "₹20", seats: 6, img: "/assets/SUV.jpg"     },
            { name: "Luxury",   tag: "PREMIUM",  base: "₹200", perKm: "₹30", seats: 4, img: "/assets/Luxury.jpg"  },
          ].map((vehicle, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-40 sm:h-44 bg-gray-100 overflow-hidden">
                <img
                  src={vehicle.img}
                  alt={vehicle.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-bold tracking-widest px-2 py-1 rounded-md uppercase">
                  {vehicle.tag}
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {vehicle.name}
                </h3>
                <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-500 mb-4">
                  <span>👤 {vehicle.seats} seats</span>
                  <span>•</span>
                  <span>🧳 All-terrain</span>
                </div>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">From</p>
                    <p className="text-xl sm:text-2xl font-black text-gray-900">{vehicle.base}</p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500">{vehicle.perKm} / km</p>
                </div>
                <Link
                  href={user ? "/booking" : "/register"}
                  className="block text-center w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      {!user && (
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
              Ready to Experience
              <span className="block bg-gradient-to-r from-white/90 to-white/50 bg-clip-text text-transparent">
                Seamless Rides?
              </span>
            </h2>
            <p className="text-lg sm:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Join 50K+ satisfied customers. Create your account in 30 seconds.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center px-10 py-5 sm:px-12 sm:py-6 bg-white text-blue-600 text-lg sm:text-xl font-bold rounded-2xl sm:rounded-3xl shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Start Booking Now
              <span className="ml-4 text-xl sm:text-2xl">→</span>
            </Link>
          </div>
        </section>
      )}
    </div>

  );
}
