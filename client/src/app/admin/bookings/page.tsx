'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  referenceId: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  finalFare: string | number;
  estimatedFare: string | number;
  distanceKm: string | number;
  createdAt: string;
  pickupLocation: any;
  dropoffLocation: any;
  vehicleType: { name: string };
  user: { firstName: string; lastName: string; email: string };
}

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

// Status transitions that are allowed
const NEXT_STATUSES: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

function getAddress(location: any): string {
  if (!location) return 'N/A';
  if (typeof location === 'string') return location;
  return location?.address || 'N/A';
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const LIMIT = 10;

  useEffect(() => {
    if (!user || !token) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
  }, [user, token]);

  useEffect(() => {
    if (user?.role === 'ADMIN' && token) fetchBookings();
  }, [statusFilter, page, token]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const params: any = { page, limit: LIMIT };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const response = await api.admin.getAllBookings(token!, params);
      setBookings(response.data?.bookings || []);
      const total = response.data?.total || 0;
      setTotalPages(Math.max(1, Math.ceil(total / LIMIT)));
    } catch (err: any) {
      toast.error(err.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      await api.admin.updateBookingStatus(token!, bookingId, newStatus);
      toast.success('Status updated');
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
            <p className="text-gray-600 mt-1">Manage and track customer bookings</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-medium">No bookings found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Reference', 'Customer', 'Route', 'Vehicle', 'Fare', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => {
                  const fare = Number(b.finalFare || b.estimatedFare || 0);
                  const pickupAddress = getAddress(b.pickupLocation);
                  const dropoffAddress = getAddress(b.dropoffLocation);
                  const nextStatuses = NEXT_STATUSES[b.status] || [];

                  return (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-bold text-blue-600">{b.referenceId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{b.user?.firstName} {b.user?.lastName}</p>
                        <p className="text-xs text-gray-500">{b.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="text-xs text-gray-700 truncate">📍 {pickupAddress}</p>
                        <p className="text-xs text-gray-700 truncate">🏁 {dropoffAddress}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.vehicleType?.name}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-700">₹{fare.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {nextStatuses.length > 0 ? (
                          <select
                            disabled={updatingId === b.id}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                            defaultValue=""
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          >
                            <option value="" disabled>Update →</option>
                            {nextStatuses.map((s) => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Final</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
              ← Prev
            </button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
