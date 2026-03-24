'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Booking {
  id: string;
  referenceId: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  finalFare: string | number;
  estimatedFare: string | number;
  distanceKm: string | number;
  durationMinutes: number;
  createdAt: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  vehicleType: { name: string };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function getAddress(location: any): string {
  if (!location) return 'N/A';
  if (typeof location === 'string') return location;
  return location?.address || 'N/A';
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }
    fetchBookings();
  }, [user, token]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await api.bookings.getUserBookings(token!);
      setBookings(response.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      await api.bookings.cancel(token!, bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const canCancel = (status: string) => status === 'PENDING' || status === 'CONFIRMED';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-1">
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link
            href="/booking"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + Book a Ride
          </Link>
        </div>

        {/* Empty State */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🚕</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">You haven't made any bookings yet.</p>
            <Link
              href="/booking"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Book a Ride
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const fare = Number(booking.finalFare || booking.estimatedFare || 0);
              const distance = Number(booking.distanceKm || 0);
              const pickupAddress = getAddress(booking.pickupLocation);
              const dropoffAddress = getAddress(booking.dropoffLocation);

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                >
                  {/* Top row: ref ID + status */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Reference ID
                      </span>
                      <p className="text-lg font-bold text-blue-600 font-mono">
                        {booking.referenceId}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[booking.status]}`}
                    >
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div className="w-0.5 h-8 bg-gray-300 my-1" />
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-gray-800">{pickupAddress}</p>
                      <p className="text-sm font-medium text-gray-800">{dropoffAddress}</p>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Vehicle</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {booking.vehicleType?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Distance</p>
                      <p className="text-sm font-semibold text-gray-800">{distance.toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fare</p>
                      <p className="text-sm font-semibold text-green-700">₹{fare.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="flex gap-3">
                      <Link
                        href={`/booking/${booking.id}`}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        View Details
                      </Link>
                      {canCancel(booking.status) && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="text-sm text-red-600 hover:underline font-medium disabled:opacity-50"
                        >
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
