import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../../api/client';

export default function EmailVerify() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  // Prevent React StrictMode double-invocation from calling the API twice.
  // Without this, the first call verifies the email, the second call finds it
  // already verified and shows a confusing "already verified" message.
  const called = useRef(false);

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token found.'); return; }
    if (called.current) return;
    called.current = true;

    api.get(`/auth/verify-email/${token}`)
      .then((res) => { setStatus('success'); setMessage(res.data.message); })
      .catch((err) => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed.'); });
  }, [token]);

  return (
    <div className="page-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', maxWidth: 440 }}
      >
        {status === 'loading' && (
          <>
            <Loader size={56} color="var(--blue)" style={{ animation: 'spin 1s linear infinite', marginBottom: 20 }} />
            <h2 style={{ color: 'var(--text-primary)' }}>Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={64} color="var(--green)" style={{ marginBottom: 20 }} />
            <h1 style={{ color: 'var(--text-primary)', fontSize: 26, marginBottom: 12 }}>Email Verified!</h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
              Your email has been confirmed. Our team will review your application and notify you within 1–2 business days.
            </p>
            <Link to="/login" className="btn btn-primary">Go to Login →</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={64} color="var(--red)" style={{ marginBottom: 20 }} />
            <h1 style={{ color: 'var(--text-primary)', fontSize: 26, marginBottom: 12 }}>Verification Failed</h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>{message}</p>
            <Link to="/register/seller" className="btn btn-ghost">Re-register</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}