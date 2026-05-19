import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const inactivity = params.get('reason') === 'inactivity';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.fullName}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="brand" style={{ justifyContent: 'center', marginBottom: 8 }}>
            <span className="brand-icon">⚡</span>
            <span>ABC<span>Electronics</span>.market</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Seller Portal Sign In</p>
        </div>

        {inactivity && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--yellow)' }}>
            ⏱ You were logged out due to inactivity. Please sign in again.
          </div>
        )}

        <div className="glass" style={{ padding: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Sign In</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Access your seller dashboard</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="email">Email Address</label>
              <input id="email" type="email" className="form-input" placeholder="you@business.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 28 }}>
              <PasswordInput id="loginPassword" label="Password"
                register={{ onChange: (e) => setPassword(e.target.value), value: password }}
                placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }}>or</div>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Don't have an account?{' '}
            <Link to="/register/seller" className="text-blue" style={{ fontWeight: 500 }}>Register as Seller</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}