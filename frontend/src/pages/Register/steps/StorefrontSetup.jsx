import { useState } from 'react';
import FileDropzone from '../../../components/FileDropzone';
import { Globe, Share2, MessageCircle, Link2, AtSign } from 'lucide-react';

const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram', icon: <AtSign size={15} />,       placeholder: 'https://instagram.com/yourstore' },
  { key: 'facebook',  label: 'Facebook',  icon: <Share2 size={15} />,       placeholder: 'https://facebook.com/yourstore' },
  { key: 'twitter',   label: 'X (Twitter)', icon: <MessageCircle size={15} />, placeholder: 'https://x.com/yourstore' },
  { key: 'youtube',   label: 'YouTube',   icon: <Globe size={15} />,        placeholder: 'https://youtube.com/@yourstore' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: <Link2 size={15} />,        placeholder: 'https://linkedin.com/company/yourstore' },
];

export default function StorefrontSetup({ data, onNext, onBack }) {
  const [form, setForm] = useState({
    aboutStore: data.aboutStore || '',
    whatsappContact: data.whatsappContact || '',
    telephoneNo: data.telephoneNo || '',
    socialLinks: data.socialLinks || {},
    logoFile: data.logoFile || null,
    coverImageFile: data.coverImageFile || null,
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setSocial = (key, val) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: val } }));

  const validate = () => {
    const e = {};
    if (!form.aboutStore) e.aboutStore = 'Please describe your store';
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext(form);
  };

  return (
    <div>
      <div className="form-grid-2" style={{ marginBottom: 20 }}>
        <FileDropzone label="Store Logo"
          accept={{ 'image/*': [] }}
          onFile={(f) => set('logoFile', f)}
          hint="PNG/JPG, max 10MB. Recommended: 400×400px" />
        <FileDropzone label="Store Cover Image"
          accept={{ 'image/*': [] }}
          onFile={(f) => set('coverImageFile', f)}
          hint="PNG/JPG, max 10MB. Recommended: 1200×300px" />
      </div>

      <div className="form-group" style={{ marginBottom: 20 }}>
        <label className="form-label" htmlFor="aboutStore">About Your Store <span>*</span></label>
        <textarea id="aboutStore"
          className={`form-input${errors.aboutStore ? ' error' : ''}`}
          style={{ minHeight: 100, resize: 'vertical' }}
          placeholder="Tell customers about your store, specialties, and what makes you unique..."
          value={form.aboutStore}
          onChange={(e) => set('aboutStore', e.target.value)} />
        {errors.aboutStore && <p className="form-error">⚠ {errors.aboutStore}</p>}
      </div>

      <div className="form-grid-2" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="whatsappContact">WhatsApp Number</label>
          <input id="whatsappContact" className="form-input" placeholder="+971 50 123 4567"
            value={form.whatsappContact} onChange={(e) => set('whatsappContact', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="telephoneNo">Telephone Number</label>
          <input id="telephoneNo" className="form-input" placeholder="+971 4 123 4567"
            value={form.telephoneNo} onChange={(e) => set('telephoneNo', e.target.value)} />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 28 }}>
        <label className="form-label">Social Links</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SOCIAL_FIELDS.map(({ key, label, icon, placeholder }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ color: 'var(--blue)', width: 32, display: 'flex', justifyContent: 'center' }}>{icon}</div>
              <input className="form-input" style={{ flex: 1 }} placeholder={placeholder}
                value={form.socialLinks[key] || ''}
                onChange={(e) => setSocial(key, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" className="btn btn-ghost" onClick={onBack} style={{ flex: 1 }}>← Back</button>
        <button type="button" className="btn btn-primary" onClick={submit} style={{ flex: 2 }}>Review & Submit →</button>
      </div>
    </div>
  );
}