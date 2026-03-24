'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LocationSearch from '@/components/LocationSearch';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface VehicleType {
  id: string;
  name: string;
  description: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  capacity: number;
  imageUrl: string;
}

interface FareEstimate {
  distanceKm: number;
  durationMinutes: number;
  estimatedFare: number;
  breakdown: {
    base: number;
    distance: number;
    time: number;
    surge: number;
  };
  surgeMultiplier: number;
}

// Map vehicle names to local assets (fallback when imageUrl is missing)
const VEHICLE_IMAGES: Record<string, string> = {
  Economy: '/assets/Economy.jpg',
  Sedan:   '/assets/sedan.jpg',
  SUV:     '/assets/SUV.jpg',
  Luxury:  '/assets/Luxury.jpg',
};

function getVehicleImage(vehicle: VehicleType): string {
  return vehicle.imageUrl || VEHICLE_IMAGES[vehicle.name] || '/assets/Economy.jpg';
}

export default function BookingPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [step, setStep] = useState<'locations' | 'vehicles' | 'confirm'>('locations');
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !dropoff) {
      toast.error('Please select both pickup and dropoff locations');
      return;
    }
    setLoading(true);
    try {
      const vehiclesRes = await api.vehicles.getAll(token || undefined);
      setVehicles(vehiclesRes.data);
      setStep('vehicles');
    } catch (error: any) {
      toast.error(error.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };


  const handleVehicleSelect = async (vehicle: VehicleType) => {
    if (!pickup || !dropoff) return;

    setSelectedVehicle(vehicle);
    setLoading(true);

    try {
      const estimate = await api.bookings.estimateFare({
        pickup,
        dropoff,
        vehicleTypeId: vehicle.id,
      });
      setFareEstimate(estimate.data);
      setStep('confirm');
    } catch (error: any) {
      toast.error(error.message || 'Failed to estimate fare');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingConfirm = async () => {
    if (!token) {
      toast.error('Please login to book');
      router.push('/login');
      return;
    }

    if (!pickup || !dropoff || !selectedVehicle) return;

    setLoading(true);
    try {
      const booking = await api.bookings.create(token, {
        pickup,
        dropoff,
        vehicleTypeId: selectedVehicle.id,
        notes,
      });

      toast.success(`Booking confirmed! Reference: ${booking.data.referenceId}`);
      router.push(`/booking/${booking.data.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Locations', 'Select Vehicle', 'Confirm'].map((label, idx) => (
              <div key={label} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    idx === 0 && step === 'locations' ? 'bg-blue-600' :
                    idx === 1 && step === 'vehicles' ? 'bg-blue-600' :
                    idx === 2 && step === 'confirm' ? 'bg-blue-600' :
                    'bg-gray-300'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{label}</span>
                {idx < 2 && <div className="w-24 h-1 bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Locations */}
        {step === 'locations' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-1">Where would you like to go?</h2>
            <p className="text-sm text-gray-500 mb-6">Search for your pickup and dropoff locations</p>
            <form onSubmit={handleLocationSubmit} className="space-y-5">
              <LocationSearch
                label="📍 Pickup Location"
                placeholder="Search pickup address…"
                value={pickup}
                onChange={setPickup}
                showCurrentLocation
              />
              <LocationSearch
                label="🏁 Dropoff Location"
                placeholder="Search dropoff address…"
                value={dropoff}
                onChange={setDropoff}
              />
              <button
                type="submit"
                disabled={loading || !pickup || !dropoff}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Loading vehicles…' : 'Continue →'}
              </button>
            </form>
          </div>
        )}


        {/* Step 2: Vehicle Selection */}
        {step === 'vehicles' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Choose your ride</h2>
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => handleVehicleSelect(vehicle)}
                  className="border-2 rounded-xl p-4 hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={getVehicleImage(vehicle)}
                        alt={vehicle.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = VEHICLE_IMAGES[vehicle.name] || '/assets/Economy.jpg'; }}
                        className="w-24 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                        <p className="text-sm text-gray-600">{vehicle.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Capacity: {vehicle.capacity} passengers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Base Fare</p>
                      <p className="text-2xl font-bold">₹{vehicle.baseFare}</p>
                      <p className="text-xs text-gray-500">
                        +₹{vehicle.perKmRate}/km
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('locations')}
              className="mt-6 w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && fareEstimate && selectedVehicle && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Confirm your booking</h2>
            
            {/* Trip Details */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                <div>
                  <p className="text-sm text-gray-600">Pickup</p>
                  <p className="font-medium">{pickup?.address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                <div>
                  <p className="text-sm text-gray-600">Dropoff</p>
                  <p className="font-medium">{dropoff?.address}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Vehicle</p>
              <div className="flex items-center space-x-3">
                <img
                  src={getVehicleImage(selectedVehicle)}
                  alt={selectedVehicle.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = VEHICLE_IMAGES[selectedVehicle.name] || '/assets/Economy.jpg'; }}
                  className="w-20 h-14 object-cover rounded-lg"
                />
                <div>
                  <p className="font-semibold">{selectedVehicle.name}</p>
                  <p className="text-sm text-gray-600">
                    {fareEstimate.distanceKm} km • {fareEstimate.durationMinutes} min
                  </p>
                </div>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-3">Fare Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Fare</span>
                  <span>₹{fareEstimate.breakdown.base}</span>
                </div>
                <div className="flex justify-between">
                  <span>Distance ({fareEstimate.distanceKm} km)</span>
                  <span>₹{fareEstimate.breakdown.distance}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time ({fareEstimate.durationMinutes} min)</span>
                  <span>₹{fareEstimate.breakdown.time}</span>
                </div>
                {fareEstimate.breakdown.surge > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Surge ({fareEstimate.surgeMultiplier}x)</span>
                    <span>₹{fareEstimate.breakdown.surge}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total Fare</span>
                  <span>₹{fareEstimate.estimatedFare}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Please call on arrival"
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleBookingConfirm}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </button>
              <button
                onClick={() => setStep('vehicles')}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
