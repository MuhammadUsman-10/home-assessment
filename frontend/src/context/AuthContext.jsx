import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef(null);

  // ── Auto-logout on inactivity ───────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      logout('inactivity');
    }, INACTIVITY_LIMIT);
  }, []); // eslint-disable-line

  const setupActivityListeners = useCallback(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer));
    return () => events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
  }, [resetInactivityTimer]);

  // ── Restore session on mount ────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get('/sellers/me');
        setUser(data.user);
        resetInactivityTimer();
      } catch {
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [resetInactivityTimer]);

  // ── Activity listeners active only when logged in ───────────────────
  useEffect(() => {
    if (!user) return;
    const cleanup = setupActivityListeners();
    resetInactivityTimer();
    return cleanup;
  }, [user, setupActivityListeners, resetInactivityTimer]);

  // ── Auth actions ────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    resetInactivityTimer();
    return data.user;
  };

  const logout = async (reason) => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    setUser(null);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (reason === 'inactivity') {
      window.location.href = '/login?reason=inactivity';
    }
  };

  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/sellers/me');
      setUser(data.user);
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};