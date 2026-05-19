import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const STEPS = ['Account Info', 'Business Details', 'Storefront', 'Review & Submit'];

export default function ProgressBar({ current }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {/* connecting line */}
        <div style={{
          position: 'absolute', top: 20, left: '5%', right: '5%', height: 2,
          background: 'var(--border)', zIndex: 0,
        }} />
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
        {STEPS.map((label, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2, flex: 1 }}>
              <motion.div
                animate={{
                  background: done ? 'linear-gradient(135deg,#10B981,#059669)' : active ? 'linear-gradient(135deg,#3D7EFF,#2563EB)' : 'var(--bg-secondary)',
                  borderColor: done ? '#10B981' : active ? '#3D7EFF' : 'var(--border)',
                  scale: active ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 40, height: 40, borderRadius: '50%', border: '2px solid',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                  color: done || active ? '#fff' : 'var(--text-muted)',
                }}
              >
                {done ? <Check size={16} strokeWidth={3} /> : step}
              </motion.div>
              <span style={{
                fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
                color: active ? 'var(--blue)' : done ? 'var(--green)' : 'var(--text-muted)',
                textAlign: 'center',
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 16 }}>
        Step {current} of {STEPS.length}: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{STEPS[current - 1]}</span>
      </p>
    </div>
  );
}