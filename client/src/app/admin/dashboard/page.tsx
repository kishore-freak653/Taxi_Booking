'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalBookings: number;
  bookingsByStatus: Array<{ status: string; count: number }>;
  totalRevenue: number;
  activeUsers: number;
  recentBookings: any[];
  vehicleUsage: Array<{ vehicleType: string; count: number }>;
}

import { LayoutDashboard, Users, CreditCard, CheckCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    fetchDashboard();
  }, [token, user]);

  const fetchDashboard = async () => {
    if (!token) return;

    try {
      const response = await api.admin.getDashboard(token);
      setStats(response.data);
    } catch (error: any) {
      toast.error('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#87194B]"></div>
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-xl text-red-600 font-bold">Failed to load dashboard data.</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const statCards = [
    { label: 'Total Bookings', value: stats.totalBookings, icon: LayoutDashboard, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Confirmed', value: stats.bookingsByStatus.find((s) => s.status === 'CONFIRMED')?.count || 0, icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time performance and system stats</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-black text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts/Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#87194B]" /> Bookings by Status
            </h2>
            <div className="space-y-4">
              {stats.bookingsByStatus.map((item) => (
                <div key={item.status} className="flex justify-between items-center group">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                      <div 
                        className="h-full bg-[#87194B]/20" 
                        style={{ width: `${(item.count / stats.totalBookings) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-900">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Popular Vehicles</h2>
            <div className="space-y-4">
              {stats.vehicleUsage.map((item) => (
                <div key={item.vehicleType} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                  <span className="font-bold text-gray-700">{item.vehicleType}</span>
                  <span className="text-sm font-black text-[#87194B]">{item.count} <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Rides</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <button className="text-xs font-bold text-[#87194B] hover:underline uppercase tracking-wider">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-gray-400 border-b border-gray-50">
                  <th className="px-6 py-4">Ref ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Fare</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-gray-400">#{booking.referenceId.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                          {booking.user.firstName[0]}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{booking.user.firstName} {booking.user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[180px] text-xs text-gray-500 line-clamp-1">
                        {booking.pickupLocation.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">₹{booking.finalFare}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-black rounded-lg border uppercase ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                      {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

