const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse(response: Response) {
  const text = await response.text();

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    // Server returned non-JSON (e.g. rate-limit plain text)
    data = { error: text || 'An error occurred' };
  }

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'An error occurred', data);
  }

  return data;
}

function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export const api = {
  // Auth endpoints
  auth: {
    register: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    login: async (email: string, password: string) => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    logout: async () => {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return handleResponse(response);
    },

    getCurrentUser: async (token: string) => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: getAuthHeaders(token),
        credentials: 'include',
      });
      return handleResponse(response);
    },

    refresh: async () => {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return handleResponse(response);
    },
  },

  // Vehicle endpoints
  vehicles: {
    getAll: async (token?: string) => {
      const response = await fetch(`${API_URL}/api/vehicles`, {
        headers: getAuthHeaders(token),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/api/vehicles/${id}`);
      return handleResponse(response);
    },

    create: async (token: string, data: any) => {
      const response = await fetch(`${API_URL}/api/vehicles`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    update: async (token: string, id: string, data: any) => {
      const response = await fetch(`${API_URL}/api/vehicles/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    delete: async (token: string, id: string) => {
      const response = await fetch(`${API_URL}/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      return handleResponse(response);
    },
  },

  // Booking endpoints
  bookings: {
    estimateFare: async (data: {
      pickup: { lat: number; lng: number; address: string };
      dropoff: { lat: number; lng: number; address: string };
      vehicleTypeId: string;
    }) => {
      const response = await fetch(`${API_URL}/api/bookings/estimate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    create: async (
      token: string,
      data: {
        pickup: { lat: number; lng: number; address: string };
        dropoff: { lat: number; lng: number; address: string };
        vehicleTypeId: string;
        notes?: string;
      }
    ) => {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getUserBookings: async (token: string) => {
      const response = await fetch(`${API_URL}/api/bookings`, {
        headers: getAuthHeaders(token),
      });
      return handleResponse(response);
    },

    getById: async (token: string, id: string) => {
      const response = await fetch(`${API_URL}/api/bookings/${id}`, {
        headers: getAuthHeaders(token),
      });
      return handleResponse(response);
    },

    cancel: async (token: string, id: string) => {
      const response = await fetch(`${API_URL}/api/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
      });
      return handleResponse(response);
    },
  },

  // Admin endpoints
  admin: {
    getDashboard: async (token: string) => {
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: getAuthHeaders(token),
      });
      return handleResponse(response);
    },

    getAllBookings: async (token: string, params?: { status?: string; page?: number; limit?: number }) => {
      const queryString = new URLSearchParams(params as any).toString();
      const response = await fetch(`${API_URL}/api/admin/bookings?${queryString}`, {
        headers: getAuthHeaders(token),
      });
      return handleResponse(response);
    },

    updateBookingStatus: async (token: string, id: string, status: string) => {
      const response = await fetch(`${API_URL}/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status }),
      });
      return handleResponse(response);
    },

    getAllUsers: async (token: string, params?: { role?: string; page?: number; limit?: number }) => {
      const queryString = new URLSearchParams(params as any).toString();
      const response = await fetch(`${API_URL}/api/admin/users?${queryString}`, {
        headers: getAuthHeaders(token),
      });
      return handleResponse(response);
    },
  },
};

export { ApiError };
