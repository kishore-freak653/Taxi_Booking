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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8 overflow-hidden">
          <div className="flex items-center justify-between relative">
            {/* Background Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0"></div>
            
            {['Locations', 'Vehicles', 'Confirm'].map((label, idx) => {
              const isActive = (idx === 0 && step === 'locations') || 
                               (idx === 1 && step === 'vehicles') || 
                               (idx === 2 && step === 'confirm');
              const isCompleted = (idx === 0 && (step === 'vehicles' || step === 'confirm')) ||
                                 (idx === 1 && step === 'confirm');

              return (
                <div key={label} className="flex flex-col items-center relative z-10 bg-gray-50 px-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors duration-300 ${
                      isActive ? 'bg-blue-600 ring-4 ring-blue-100' : 
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={`mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    <span className="hidden xs:inline">{label}</span>
                    <span className="xs:hidden">{label[0]}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Locations */}
        {step === 'locations' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl sm:text-2xl font-black mb-1">Where to?</h2>
            <p className="text-sm text-gray-400 mb-6">Enter your trip details to get started</p>
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
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-40 transition-all shadow-lg shadow-blue-200 mt-2"
              >
                {loading ? 'Finding rides…' : 'Find Available Rides →'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Vehicle Selection */}
        {step === 'vehicles' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black">Choose your ride</h2>
              <button 
                onClick={() => setStep('locations')}
                className="text-sm font-bold text-gray-400 hover:text-blue-600 transition"
              >
                Change Route
              </button>
            </div>
            
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => handleVehicleSelect(vehicle)}
                  className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:border-blue-500 cursor-pointer transition-all hover:shadow-xl group active:scale-[0.98]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-16 sm:w-24 sm:h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={getVehicleImage(vehicle)}
                          alt={vehicle.name}
                          onError={(e) => { (e.target as HTMLImageElement).src = VEHICLE_IMAGES[vehicle.name] || '/assets/Economy.jpg'; }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">
                          {vehicle.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {vehicle.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-600 rounded-md">
                            👤 {vehicle.capacity} seats
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-0 border-gray-50">
                      <div className="sm:text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Est. Price</p>
                        <p className="text-2xl font-black text-blue-600 tracking-tight">
                          ₹{vehicle.baseFare}
                        </p>
                      </div>
                      <span className="sm:hidden text-blue-600 font-bold hover:underline">Select →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && fareEstimate && selectedVehicle && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-black text-gray-900">Confirm Booking</h2>
            
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Trip Summary Header */}
              <div className="p-6 bg-blue-600 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-100 text-xs font-bold uppercase">Total Fare</p>
                    <p className="text-4xl font-black tracking-tight">₹{fareEstimate.estimatedFare}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-xs font-bold uppercase">Distance</p>
                    <p className="text-xl font-bold">{fareEstimate.distanceKm} km</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Route */}
                <div className="relative pl-8 space-y-6">
                  {/* Decorative line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-dashed border-l-2 border-dashed border-gray-300"></div>
                  
                  <div className="relative">
                    <div className="absolute -left-8 top-1 w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-100"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup</p>
                    <p className="text-sm font-bold text-gray-800 line-clamp-2">{pickup?.address}</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-8 top-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-100"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Dropoff</p>
                    <p className="text-sm font-bold text-gray-800 line-clamp-2">{dropoff?.address}</p>
                  </div>
                </div>

                {/* Selected Vehicle Card */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-16 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    <img
                      src={getVehicleImage(selectedVehicle)}
                      alt={selectedVehicle.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = VEHICLE_IMAGES[selectedVehicle.name] || '/assets/Economy.jpg'; }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold uppercase">Ride Type</p>
                    <p className="text-lg font-black text-gray-900">{selectedVehicle.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase">Capacity</p>
                    <p className="text-sm font-bold text-gray-800">👤 {selectedVehicle.capacity}</p>
                  </div>
                </div>

                {/* Fare Breakdown Toggle (Desktop style but mobile friendly) */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing Details</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Base Fare</span>
                      <span className="font-bold text-gray-900">₹{fareEstimate.breakdown.base}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Distance & Time</span>
                      <span className="font-bold text-gray-900">₹{fareEstimate.breakdown.distance + fareEstimate.breakdown.time}</span>
                    </div>
                    {fareEstimate.breakdown.surge > 0 && (
                      <div className="flex justify-between text-sm text-orange-600 font-bold">
                        <span>Surge Pricing ({fareEstimate.surgeMultiplier}x)</span>
                        <span>+₹{fareEstimate.breakdown.surge}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Notes for driver
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Near the main gate"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    rows={2}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => setStep('vehicles')}
                    className="flex-1 order-2 sm:order-1 py-4 px-6 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition active:scale-95"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleBookingConfirm}
                    disabled={loading}
                    className="flex-[2] order-1 sm:order-2 py-4 px-6 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Confirming...' : 'Book Ride Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

