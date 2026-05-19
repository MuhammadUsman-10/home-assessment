import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const STRENGTH_LEVELS = [
  { label: 'Weak', color: '#EF4444' },
  { label: 'Fair', color: '#F59E0B' },
  { label: 'Good', color: '#3D7EFF' },
  { label: 'Strong', color: '#10B981' },
];

function getStrength(pw) {
  if (!pw) return -1;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score - 1; // 0-3
}

export default function PasswordInput({ id, label, register, error, showStrength = false, ...rest }) {
  const [show, setShow] = useState(false);
  const [val, setVal] = useState('');
  const strength = showStrength ? getStrength(val) : -1;

  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label} <span>*</span></label>}
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={`form-input${error ? ' error' : ''}`}
          style={{ paddingRight: 44 }}
          {...register}
          onChange={(e) => { setVal(e.target.value); register?.onChange?.(e); }}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4,
          }}
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {showStrength && val && (
        <div style={{ marginTop: 6 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            {[0,1,2,3].map((i) => (
              <div key={i} style={{
                height: 3, flex: 1, borderRadius: 2,
                background: i <= strength ? STRENGTH_LEVELS[strength]?.color : 'var(--border)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
          {strength >= 0 && (
            <p style={{ fontSize: 11, color: STRENGTH_LEVELS[strength]?.color, fontWeight: 500 }}>
              {STRENGTH_LEVELS[strength]?.label} password
            </p>
          )}
        </div>
      )}
      {error && <p className="form-error">⚠ {error}</p>}
    </div>
  );
}