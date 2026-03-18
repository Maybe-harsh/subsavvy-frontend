import axios from 'axios';

// THE MAGIC FIX: Pointing your frontend to your live Render backend!
const API_BASE_URL = 'https://subsavvy-backend.onrender.com';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- AXIOS INTERCEPTOR ---
// This runs automatically before EVERY request sent from the frontend
apiClient.interceptors.request.use(
    (config) => {
        // Check if we have a token saved in the browser's local storage
        const token = localStorage.getItem('access_token');
        if (token) {
            // If we do, attach it to the Authorization header
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

// --- AI ALERT FUNCTION ---
export const getUserAlerts = async () => {
    const response = await apiClient.get('/users/me/alerts');
    return response.data;
};

// --- USAGE LOG FUNCTION (This was the missing piece!) ---
export const logUsage = async (usageData: {
    subscription_id: string;
    date_logged: string;
    minutes_used: number;
}) => {
    const response = await apiClient.post('/usage/', usageData);
    return response.data;
};

// --- UPDATE & DELETE FUNCTIONS (NEW) ---
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