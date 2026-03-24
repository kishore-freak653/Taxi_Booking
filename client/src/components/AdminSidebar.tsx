'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Car,
  Users,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/bookings',  label: 'All Bookings', icon: CalendarDays     },
  { href: '/admin/vehicles',  label: 'Vehicles',     icon: Car              },
  { href: '/admin/users',     label: 'Users',        icon: Users            },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#1a0a12] text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#87194B] shadow-lg">
            <span className="text-xl">🚕</span>
          </div>
          <div>
            <p className="font-bold text-base leading-tight">TaxiBooking</p>
            <p className="text-xs text-white/40 uppercase tracking-widest">Admin</p>
          </div>
        </div>
        {/* Close on mobile */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-[#87194B] text-white shadow-lg shadow-[#87194B]/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-white/50 group-hover:text-white'}`} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#87194B] text-white font-bold text-sm flex-shrink-0">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-red-500/20 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-white/40 group-hover:text-red-400 transition-colors" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile hamburger button (top bar) ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#1a0a12] shadow-lg">
        <button onClick={() => setOpen(true)} className="text-white/80 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">🚕</span>
          <span className="text-white font-bold text-sm">TaxiBooking <span className="text-white/40 font-normal">Admin</span></span>
        </div>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer (slides in) ── */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* ── Desktop sidebar (always visible) ── */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-40 w-64 shadow-2xl">
        <SidebarContent />
      </aside>
    </>
  );
}
