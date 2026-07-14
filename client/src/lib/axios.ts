import axios from 'axios';

export const AUTH_TOKEN_KEY = 'yessom_kpi_token';
export const PUBLIC_TOKEN_KEY = 'yessom_kpi_public_token';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const publicToken = sessionStorage.getItem(PUBLIC_TOKEN_KEY);
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const token = authToken || publicToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const onPublicRoute = window.location.pathname.startsWith('/public');
      if (!onPublicRoute && localStorage.getItem(AUTH_TOKEN_KEY)) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown, fallback = 'حدث خطأ غير متوقع'): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
}
