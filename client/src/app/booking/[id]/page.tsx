'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  notes?: string;
  createdAt: string;
  updatedAt: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  vehicleType: {
    name: string;
    description: string;
    capacity: number;
    baseFare: string | number;
    perKmRate: string | number;
    perMinuteRate: string | number;
  };
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

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuthStore();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const bookingId = params.id as string;

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }
    fetchBooking();
  }, [user, token, bookingId]);

  const fetchBooking = async () => {
    try {
      setIsLoading(true);
      const response = await api.bookings.getById(token!, bookingId);
      setBooking(response.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load booking');
      router.push('/my-bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setIsCancelling(true);
    try {
      await api.bookings.cancel(token!, bookingId);
      toast.success('Booking cancelled successfully');
      fetchBooking();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

  // Safely get address - handle both object and string formats
  const pickupAddress =
    typeof booking.pickupLocation === 'object'
      ? booking.pickupLocation?.address
      : booking.pickupLocation;
  const dropoffAddress =
    typeof booking.dropoffLocation === 'object'
      ? booking.dropoffLocation?.address
      : booking.dropoffLocation;

  const fare = Number(booking.finalFare || booking.estimatedFare || 0);
  const distance = Number(booking.distanceKm || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href="/my-bookings"
          className="inline-flex items-center text-xs font-bold text-[#87194B] uppercase tracking-widest hover:underline"
        >
          ← Back to Trips
        </Link>

        {/* Confirmation Banner */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight text-center sm:text-left">Trip Details</h1>
            <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border text-center ${STATUS_STYLES[booking.status]}`}>
              {STATUS_LABELS[booking.status]}
            </span>
          </div>
          
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking Reference</p>
            <p className="text-2xl sm:text-3xl font-mono font-black text-[#87194B]">#{booking.referenceId.slice(0, 10).toUpperCase()}</p>
            <p className="text-xs text-gray-400 font-medium mt-2">
              Booked on{' '}
              {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Route */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Route</h2>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="w-0.5 h-10 bg-gray-300 my-1" />
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="font-medium text-gray-800">{pickupAddress}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Dropoff</p>
                <p className="font-medium text-gray-800">{dropoffAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Trip Info</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Vehicle</p>
              <p className="font-semibold text-gray-800">{booking.vehicleType?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Distance</p>
              <p className="font-semibold text-gray-800">{distance.toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Est. Duration</p>
              <p className="font-semibold text-gray-800">{booking.durationMinutes} min</p>
            </div>
          </div>
          {booking.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Notes</p>
              <p className="text-gray-700 text-sm">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Fare */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Fare</h2>
          <div className="flex justify-between font-bold text-gray-900 text-lg">
            <span>Total Fare</span>
            <span className="text-green-700">₹{fare.toFixed(2)}</span>
          </div>
        </div>

        {/* Cancel Action */}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        )}
      </div>
    </div>
  );
}
