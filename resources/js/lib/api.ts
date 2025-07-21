import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Add CSRF token to requests
api.interceptors.request.use((config) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 422) {
            // Validation errors
            throw new Error(error.response.data.message || 'Validation failed');
        } else if (error.response?.status === 500) {
            // Server errors
            throw new Error(error.response.data.message || 'Server error occurred');
        } else if (error.response?.status === 404) {
            // Not found
            throw new Error('Resource not found');
        }
        throw error;
    }
);

// API endpoints
export const customerApi = {
    getAll: (params?: any) => api.get('/customers', { params }),
    getById: (id: number) => api.get(`/customers/${id}`),
    create: (data: any) => api.post('/customers', data),
    update: (id: number, data: any) => api.put(`/customers/${id}`, data),
    delete: (id: number) => api.delete(`/customers/${id}`),
};

export const materialApi = {
    getAll: (params?: any) => api.get('/materials', { params }),
    getById: (id: number) => api.get(`/materials/${id}`),
    create: (data: any) => api.post('/materials', data),
    update: (id: number, data: any) => api.put(`/materials/${id}`, data),
    delete: (id: number) => api.delete(`/materials/${id}`),
};

export const productApi = {
    getAll: (params?: any) => api.get('/products', { params }),
    getById: (id: number) => api.get(`/products/${id}`),
    create: (data: any) => api.post('/products', data),
    update: (id: number, data: any) => api.put(`/products/${id}`, data),
    delete: (id: number) => api.delete(`/products/${id}`),
};

export const incomingApi = {
    getAll: (params?: any) => api.get('/incoming', { params }),
    getById: (id: number) => api.get(`/incoming/${id}`),
    create: (data: any) => api.post('/incoming', data),
    update: (id: number, data: any) => api.put(`/incoming/${id}`, data),
    delete: (id: number) => api.delete(`/incoming/${id}`),
};

export const productionApi = {
    getAll: (params?: any) => api.get('/productions', { params }),
    getById: (id: number) => api.get(`/productions/${id}`),
    create: (data: any) => api.post('/productions', data),
    update: (id: number, data: any) => api.put(`/productions/${id}`, data),
    delete: (id: number) => api.delete(`/productions/${id}`),
};

export const invoiceApi = {
    getAll: (params?: any) => api.get('/invoices', { params }),
    getById: (id: number) => api.get(`/invoices/${id}`),
    create: (data: any) => api.post('/invoices', data),
    update: (id: number, data: any) => api.put(`/invoices/${id}`, data),
    delete: (id: number) => api.delete(`/invoices/${id}`),
    generatePdf: (id: number) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
    updateStatus: (id: number, status: string) => api.patch(`/invoices/${id}/status`, { status }),
};

export const dashboardApi = {
    getStats: () => api.get('/dashboard/stats'),
    getStockReport: () => api.get('/reports/stock'),
    getRecentActivities: () => api.get('/activities/recent'),
};

export default api;
