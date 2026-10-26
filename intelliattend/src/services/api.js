import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('token') || '';
    const isMockToken = token.startsWith('mock-');
    const hasDemoUser = Boolean(localStorage.getItem('hrms_user'));

    // Only redirect if it's an authenticated session from a real server that expired
    if (error.response?.status === 401 && !isMockToken && !hasDemoUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('hrms_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;