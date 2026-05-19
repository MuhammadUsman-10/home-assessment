import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Account', full: 'Account Info' },
  { label: 'Business', full: 'Business Details' },
  { label: 'Storefront', full: 'Storefront' },
  { label: 'Review', full: 'Review & Submit' },
];

export default function ProgressBar({ current }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {/* connecting line background */}
        <div style={{
          position: 'absolute', top: 20, left: '5%', right: '5%', height: 2,
          background: 'var(--border)', zIndex: 0,
        }} />
        {/* connecting line progress */}
        <motion.div
          style={{
            position: 'absolute', top: 20, left: '5%', height: 2,
            background: 'linear-gradient(90deg, var(--blue), var(--blue-dark))',
            zIndex: 1, originX: 0,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${((current - 1) / (STEPS.length - 1)) * 90}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        {STEPS.map(({ label, full }, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 2, flex: 1 }}>
              <motion.div
                animate={{
                  background: done ? 'linear-gradient(135deg,#10B981,#059669)' : active ? 'linear-gradient(135deg,#3D7EFF,#2563EB)' : 'var(--bg-secondary)',
                  borderColor: done ? '#10B981' : active ? '#3D7EFF' : 'var(--border)',
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: '2px solid',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  color: done || active ? '#fff' : 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                {done ? <Check size={15} strokeWidth={3} /> : step}
              </motion.div>
              {/* Short label on mobile, full label on desktop via CSS */}
              <span className="progress-label" style={{
                fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
                color: active ? 'var(--blue)' : done ? 'var(--green)' : 'var(--text-muted)',
                textAlign: 'center', lineHeight: 1.3,
              }}>
                <span className="progress-label-short">{label}</span>
                <span className="progress-label-full">{full}</span>
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 14 }}>
        Step {current} of {STEPS.length}: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{STEPS[current - 1].full}</span>
      </p>
    </div>
  );
}