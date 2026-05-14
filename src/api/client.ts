import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

export const client = axios.create({
  baseURL: baseURL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
});

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    const status = error.response?.status;
    const msg =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Request failed';
    if (import.meta.env.DEV) {
      console.error('[api]', status, msg, error.config?.url);
    }
    return Promise.reject(error);
  }
);
