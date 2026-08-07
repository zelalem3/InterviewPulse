import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Accept': 'application/json'
    }
});

api.interceptors.request.use((config) => {

    if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
    }

  
    const token = useAuthStore.getState().token;
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});