import { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';

function SummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: 13, minWidth: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontSize: 13, flex: 1, wordBreak: 'break-word', minWidth: 0 }}>{value}</span>
    </div>
  );
}

export default function ReviewSubmit({ data, onBack, onSubmit, loading }) {
  const recaptchaRef = useRef(null);
  const [agreed, setAgreed] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [tcError, setTcError] = useState('');
  const [showAll, setShowAll] = useState(false);

  const { step1 = {}, step2 = {}, step3 = {} } = data;

  const handleSubmit = () => {
    setCaptchaError(''); setTcError('');
    if (!agreed) { setTcError('Please accept the Terms & Conditions'); return; }
    if (!captchaToken) { setCaptchaError('Please complete the reCAPTCHA verification'); return; }
    onSubmit(captchaToken);
  };

  return (
    <div>
      <div style={{ background: 'rgba(61,126,255,0.06)', border: '1px solid rgba(61,126,255,0.2)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Shield size={20} color="var(--blue)" />
          <h3 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 600 }}>Application Summary</h3>
        </div>
        <SummaryRow label="Full Name" value={step1.fullName} />
        <SummaryRow label="Business Name" value={step1.businessName} />
        <SummaryRow label="Email" value={step1.email} />
        <SummaryRow label="Mobile" value={step1.mobileNumber} />
        <SummaryRow label="Seller Type" value={step1.userType} />
        {showAll && (
          <>
            <SummaryRow label="Trade License No." value={step2.tradeLicenseNo} />
            <SummaryRow label="License Expiry" value={step2.tradeLicenseExpiry} />
            <SummaryRow label="Store Address" value={step2.storeAddress} />
            <SummaryRow label="City" value={step2.city} />
            <SummaryRow label="Categories" value={step2.businessCategories?.join(', ')} />
            <SummaryRow label="VAT No." value={step2.vatNumber} />
            <SummaryRow label="About Store" value={step3.aboutStore} />
            <SummaryRow label="WhatsApp" value={step3.whatsappContact} />
          </>
        )}
        <button type="button" onClick={() => setShowAll((s) => !s)}
          style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--blue)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          {showAll ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show all details</>}
        </button>
      </div>

      {/* Document upload confirmation */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Trade License', file: step2.tradeLicenseFile },
          { label: 'ID / Passport', file: step2.idPassportFile },
          { label: 'Store Logo', file: step3.logoFile },
          { label: 'Cover Image', file: step3.coverImageFile },
        ].map(({ label, file }) => (
          <div key={label} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 12,
            background: file ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
            border: `1px solid ${file ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
            color: file ? 'var(--green)' : 'var(--text-muted)',
          }}>
            {file ? '✓' : '○'} {label}
          </div>
        ))}
      </div>

      {/* T&C */}
      <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 20 }}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
          style={{ marginTop: 3, accentColor: 'var(--blue)', width: 16, height: 16 }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          I confirm that all information provided is accurate and I agree to the{' '}
          <a href="/terms" target="_blank" style={{ color: 'var(--blue)' }}>Terms & Conditions</a> and{' '}
          <a href="/privacy" target="_blank" style={{ color: 'var(--blue)' }}>Privacy Policy</a> of ABCElectronics.market.
        </span>
      </label>
      {tcError && <p className="form-error" style={{ marginBottom: 12 }}>⚠ {tcError}</p>}

      {/* reCAPTCHA v2 checkbox — scale down on very narrow screens to avoid overflow */}
      <div style={{ marginBottom: 12, maxWidth: '100%', overflowX: 'auto' }}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
          onChange={(token) => { setCaptchaToken(token || ''); setCaptchaError(''); }}
          onExpired={() => setCaptchaToken('')}
          theme="dark"
        />
      </div>
      {captchaError && <p className="form-error" style={{ marginBottom: 12 }}>⚠ {captchaError}</p>}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-ghost" onClick={onBack} style={{ flex: '1 1 100px' }} disabled={loading}>← Back</button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit} style={{ flex: '2 1 160px' }} disabled={loading}>
          {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</> : '🚀 Submit Application'}
        </button>
      </div>
    </div>
  );
}