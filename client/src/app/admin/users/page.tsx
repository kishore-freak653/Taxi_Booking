'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
  phone?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || !token) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
  }, [user, token]);

  useEffect(() => {
    if (user?.role === 'ADMIN' && token) fetchUsers();
  }, [user, token]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.admin.getAllUsers(token!);
      setUsers(response.data.users);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const customers = users
    .filter((u) => u.role === 'CUSTOMER')
    .filter((u) =>
      search === '' ||
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Directly manage and view registered customers</p>
          </div>
          <div className="bg-[#87194B]/10 text-[#87194B] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-[#87194B]/20 inline-flex items-center justify-center">
            {customers.length} TOTAL CUSTOMERS
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400 group-focus-within:text-[#87194B] transition-colors">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search by name, email or mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87194B]/30 focus:border-[#87194B] transition-all"
          />
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#87194B]" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-24 text-gray-500">
              <p className="text-4xl mb-3">👤</p>
              <p className="font-bold text-gray-400">No customers matching your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-gray-400 border-b border-gray-50">
                    {['#', 'Name', 'Email/Phone', 'Joined On', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {customers.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#87194B]/10 text-[#87194B] flex items-center justify-center font-bold text-sm">
                          {u.firstName?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Customer
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
