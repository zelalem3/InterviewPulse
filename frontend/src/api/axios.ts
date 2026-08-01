import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Accept': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    // Only set Content-Type to application/json if it's not already defined (allows form-data overrides like URLSearchParams)
    if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
    }

    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});