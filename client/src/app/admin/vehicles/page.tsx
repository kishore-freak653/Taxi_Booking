'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface VehicleType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  isActive: boolean;
}

const emptyForm = {
  name: '',
  description: '',
  capacity: 4,
  baseFare: 0,
  perKmRate: 0,
  perMinuteRate: 0,
};

export default function AdminVehiclesPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleType | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user || !token) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    fetchVehicles();
  }, [user, token]);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await api.vehicles.getAll(token!);
      setVehicles(response.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (vehicle: VehicleType) => {
    setEditingVehicle(vehicle);
    setForm({
      name: vehicle.name,
      description: vehicle.description,
      capacity: Number(vehicle.capacity),
      baseFare: Number(vehicle.baseFare),
      perKmRate: Number(vehicle.perKmRate),
      perMinuteRate: Number(vehicle.perMinuteRate),
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingVehicle) {
        await api.vehicles.update(token!, editingVehicle.id, form);
        toast.success('Vehicle updated successfully');
      } else {
        await api.vehicles.create(token!, form);
        toast.success('Vehicle created successfully');
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save vehicle');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (vehicle: VehicleType) => {
    if (!confirm(`${vehicle.isActive ? 'Deactivate' : 'Activate'} "${vehicle.name}"?`)) return;
    try {
      await api.vehicles.update(token!, vehicle.id, { isActive: !vehicle.isActive });
      toast.success(`Vehicle ${vehicle.isActive ? 'deactivated' : 'activated'}`);
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update vehicle');
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Vehicle Management</h1>
            <p className="text-sm text-gray-500 mt-1">{vehicles.length} vehicle types configured</p>
          </div>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto bg-[#87194B] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#6d143c] transition shadow-lg shadow-[#87194B]/20 active:scale-95"
          >
            + Add New Vehicle
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-gray-400 border-b border-gray-50">
                  {['Vehicle', 'Capacity', 'Base Fare', 'Per KM', 'Per Min', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{v.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{v.description}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{v.capacity} seats</td>
                  <td className="px-6 py-4 text-sm text-gray-700">₹{v.baseFare}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">₹{v.perKmRate}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">₹{v.perMinuteRate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      v.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => openEditModal(v)}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeactivate(v)}
                      className={`text-sm font-medium hover:underline ${
                        v.isActive ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {v.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className={inputClass} required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Economy" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input className={inputClass} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input className={inputClass} type="number" min={1} required value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Fare (₹)</label>
                  <input className={inputClass} type="number" min={0} step="0.01" required value={form.baseFare}
                    onChange={(e) => setForm({ ...form, baseFare: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per KM Rate (₹)</label>
                  <input className={inputClass} type="number" min={0} step="0.01" required value={form.perKmRate}
                    onChange={(e) => setForm({ ...form, perKmRate: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per Min Rate (₹)</label>
                  <input className={inputClass} type="number" min={0} step="0.01" required value={form.perMinuteRate}
                    onChange={(e) => setForm({ ...form, perMinuteRate: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-2 bg-[#87194B] text-white rounded-lg text-sm font-medium hover:bg-[#6d143c] disabled:opacity-50">
                  {isSaving ? 'Saving...' : editingVehicle ? 'Save Changes' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
