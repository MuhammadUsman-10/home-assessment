import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RegisterSuccess() {
  return (
    <div className="page-center">
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>📬</div>
        <h1 style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Application Submitted!
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
          We've sent a verification email to your inbox. Click the link to verify your email,
          then our team will review your application within <strong style={{ color: 'var(--blue)' }}>1–2 business days</strong>.
        </p>
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: 20, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckCircle size={20} color="var(--green)" />
          <p style={{ color: 'var(--green)', fontSize: 14, fontWeight: 500, margin: 0 }}>
            Check your email and click the verification link to proceed
          </p>
        </div>
        <Link to="/login" className="btn btn-primary">Go to Login</Link>
      </div>
    </div>
  );
}