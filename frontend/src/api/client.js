import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send cookies for refresh token
});

// ── Request interceptor: attach access token ─────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────
let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (
      err.response?.status === 401 &&
      err.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = data.accessToken;
        localStorage.setItem('accessToken', newToken);
        refreshQueue.forEach(({ resolve }) => resolve(newToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        refreshQueue.forEach(({ reject }) => reject());
        refreshQueue = [];
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;