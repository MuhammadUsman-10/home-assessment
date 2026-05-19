import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProgressBar from '../../components/ProgressBar';
import AccountInfo from './steps/AccountInfo';
import BusinessDetails from './steps/BusinessDetails';
import StorefrontSetup from './steps/StorefrontSetup';
import ReviewSubmit from './steps/ReviewSubmit';
import api from '../../api/client';

const STORAGE_KEY = 'abc_register_draft';

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function SellerRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  });

  // Auto-save to localStorage (exclude file objects)
  useEffect(() => {
    const { step1, step2, step3 } = formData;
    const safe = {
      step1,
      step2: step2 ? { ...step2, tradeLicenseFile: null, idPassportFile: null } : undefined,
      step3: step3 ? { ...step3, logoFile: null, coverImageFile: null } : undefined,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  }, [formData]);

  const goNext = (stepKey, data) => {
    setFormData((f) => ({ ...f, [stepKey]: data }));
    setDir(1);
    setStep((s) => s + 1);
  };

  const goBack = () => { setDir(-1); setStep((s) => s - 1); };

  const handleSubmit = async (recaptchaToken) => {
    setLoading(true);
    try {
      const { step1, step2, step3 } = formData;

      // Step 1: Create account — response includes a short-lived uploadToken
      const { data: regData } = await api.post('/auth/register', {
        ...step1,
        recaptchaToken,
      });

      // Use the uploadToken to authorise the document upload without needing
      // email verification (login blocks unverified users, which is correct).
      localStorage.setItem('accessToken', regData.uploadToken);

      // Step 2+3: Upload documents & storefront
      const fd = new FormData();
      if (step2?.tradeLicenseFile) fd.append('tradeLicense', step2.tradeLicenseFile);
      if (step2?.idPassportFile)   fd.append('idPassport',   step2.idPassportFile);
      if (step3?.logoFile)         fd.append('logo',         step3.logoFile);
      if (step3?.coverImageFile)   fd.append('coverImage',   step3.coverImageFile);

      // Text fields (exclude File objects)
      const textFields = { ...step2, ...step3 };
      delete textFields.tradeLicenseFile; delete textFields.idPassportFile;
      delete textFields.logoFile; delete textFields.coverImageFile;
      Object.entries(textFields).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
        }
      });

      await api.post('/sellers/upload-documents', fd);

      // Clear upload token — user must log in properly after email verification
      localStorage.removeItem('accessToken');
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Application submitted! Check your email to verify your account.');
      navigate('/register/success');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: 760 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="brand" style={{ justifyContent: 'center', marginBottom: 8 }}>
            <span className="brand-icon">⚡</span>
            <span>ABC<span>Electronics</span>.market</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Seller Registration Portal</p>
        </div>

        <div className="glass" style={{ padding: 'clamp(20px, 5vw, 40px) clamp(16px, 5vw, 48px)' }}>
          <ProgressBar current={step} />

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {step === 1 && <AccountInfo data={formData.step1 || {}} onNext={(d) => goNext('step1', d)} />}
              {step === 2 && <BusinessDetails data={formData.step2 || {}} onNext={(d) => goNext('step2', d)} onBack={goBack} />}
              {step === 3 && <StorefrontSetup data={formData.step3 || {}} onNext={(d) => goNext('step3', d)} onBack={goBack} />}
              {step === 4 && <ReviewSubmit data={formData} onBack={goBack} onSubmit={handleSubmit} loading={loading} />}
            </motion.div>
          </AnimatePresence>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 13 }}>
            Already have an account? <Link to="/login" className="text-blue">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}