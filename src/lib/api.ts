import axios from 'axios';

const API_BASE_URL = 'https://subsavvy-backend.onrender.com';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- AXIOS INTERCEPTOR ---
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- API FUNCTIONS ---

export const loginUser = async (formData: FormData) => {
    const response = await axios.post(`${API_BASE_URL}/token`, formData);
    return response.data;
};

export const registerUser = async (email: string, password: string) => {
    const response = await apiClient.post('/users/', { email, password });
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
};

export const getUserSubscriptions = async () => {
    const response = await apiClient.get('/users/me/subscriptions/');
    return response.data;
};

export const addSubscription = async (subscriptionData: {
    platform_name: string;
    cost: number;
    billing_cycle: string;
    next_billing_date: string;
}) => {
    const response = await apiClient.post('/users/me/subscriptions/', subscriptionData);
    return response.data;
};

export const getUserAlerts = async () => {
    const response = await apiClient.get('/users/me/alerts');
    return response.data;
};

export const logUsage = async (usageData: {
    subscription_id: string;
    date_logged: string;
    minutes_used: number;
}) => {
    const response = await apiClient.post('/usage/', usageData);
    return response.data;
};

export const updateSubscription = async (id: string, subscriptionData: {
    platform_name: string;
    cost: number;
    billing_cycle: string;
    next_billing_date: string;
}) => {
    const response = await apiClient.put(`/users/me/subscriptions/${id}`, subscriptionData);
    return response.data;
};

export const deleteSubscription = async (id: string) => {
    const response = await apiClient.delete(`/users/me/subscriptions/${id}`);
    return response.data;
};

export const resetUsageLogs = async (subscriptionId: string) => {
    const response = await apiClient.delete(`/subscriptions/${subscriptionId}/logs`);
    return response.data;
};

// FIX: Exported API_BASE_URL so dashboard.tsx can use it for recommendations
// instead of hardcoding http://127.0.0.1:8000
export { API_BASE_URL };