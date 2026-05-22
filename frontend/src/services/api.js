import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL:", API_URL);

let baseURL = '/api';
if (API_URL) {
  if (API_URL.endsWith('/api') || API_URL.endsWith('/api/')) {
    baseURL = API_URL;
  } else {
    baseURL = `${API_URL.replace(/\/$/, '')}/api`;
  }
}

console.log("Login URL:", `${baseURL}/auth/login`);

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
