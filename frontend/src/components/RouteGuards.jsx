import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  return !user ? children : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
}