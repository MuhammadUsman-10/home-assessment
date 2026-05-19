import { X } from 'lucide-react';

const CATEGORIES = [
  'Smartphones', 'Laptops', 'Tablets', 'Accessories', 'TVs & Displays',
  'Audio', 'Cameras', 'Gaming', 'Smart Home', 'Wearables',
  'Networking', 'Storage', 'Printers', 'Components', 'Software',
];

export default function MultiSelectChips({ value = [], onChange, error }) {
  const toggle = (cat) => {
    if (value.includes(cat)) {
      onChange(value.filter((c) => c !== cat));
    } else {
      onChange([...value, cat]);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">Business Categories <span>*</span></label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)' }}>
        {CATEGORIES.map((cat) => {
          const active = value.includes(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggle(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                border: active ? 'none' : '1px solid var(--border)',
                background: active ? 'linear-gradient(135deg,var(--blue),var(--blue-dark))' : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {cat}
              {active && <X size={12} />}
            </button>
          );
        })}
      </div>
      {value.length > 0 && (
        <p className="form-hint">{value.length} category{value.length > 1 ? 'ies' : ''} selected</p>
      )}
      {error && <p className="form-error">⚠ {error}</p>}
    </div>
  );
}