import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, AdminRoute, GuestRoute } from './components/RouteGuards';

import Login           from './pages/Login/Login';
import SellerRegister  from './pages/Register/SellerRegister';
import RegisterSuccess from './pages/Register/RegisterSuccess';
import EmailVerify     from './pages/EmailVerify/EmailVerify';
import SellerDashboard from './pages/Dashboard/SellerDashboard';
import AdminPanel      from './pages/Admin/AdminPanel';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register/seller" element={<GuestRoute><SellerRegister /></GuestRoute>} />
          <Route path="/register/success" element={<RegisterSuccess />} />
          <Route path="/verify-email" element={<EmailVerify />} />

          {/* Seller */}
          <Route path="/dashboard" element={<PrivateRoute><SellerDashboard /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#12182B', color: '#E2E8F0', border: '1px solid #1E2A45', fontSize: 14 },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
