import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import StatusBadge from '../../components/StatusBadge';
import { LogOut, User, Store, Clock, ChevronRight, Save, X, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';

const NAV_ITEMS = ['Overview', 'Edit Profile', 'Documents'];

export default function SellerDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [tab, setTab] = useState('Overview');

  const STATUS_MESSAGES = {
    pending_email:    { title: 'Verify Your Email', desc: "Please check your inbox and click the verification link to continue.", icon: '📧', color: 'blue' },
    pending_approval: { title: 'Application Under Review', desc: "Our team is reviewing your documents. We'll email you within 1–2 business days.", icon: '🔍', color: 'amber' },
    active:           { title: 'Your Store is Live!', desc: "Congratulations! Your seller account is active. Start listing products.", icon: '🎉', color: 'green' },
    rejected:         { title: 'Application Not Approved', desc: "Your application was not approved. Please review the notes below and contact support.", icon: '❌', color: 'red' },
    suspended:        { title: 'Account Suspended', desc: "Your account has been suspended. Please contact support.", icon: '⊘', color: 'red' },
  };
  const statusInfo = STATUS_MESSAGES[user?.status] || {};

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Nav */}
      <nav className="admin-nav" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="brand">
          <span className="brand-icon">⚡</span>
          <span>ABC<span>Electronics</span></span>
        </div>
        <div className="admin-nav-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusBadge status={user?.status} />
          <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '7px 14px', fontSize: 13 }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      {/* Layout */}
      <div className="dashboard-layout container" style={{ padding: '32px 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div className="dashboard-sidebar" style={{ width: 220, flexShrink: 0 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Avatar */}
            <div className="sidebar-profile" style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),var(--blue-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 24, fontWeight: 700, color: '#fff' }}>
                {user?.fullName?.[0] || '?'}
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{user?.fullName}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{user?.userType}</p>
            </div>
            {/* Nav */}
            <div className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column' }}>
              {NAV_ITEMS.map((item) => (
                <button key={item} className="sidebar-nav-btn" onClick={() => setTab(item)}
                  style={{
                    width: '100%', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: tab === item ? 'rgba(61,126,255,0.1)' : 'transparent',
                    border: 'none', borderLeft: tab === item ? '3px solid var(--blue)' : '3px solid transparent',
                    color: tab === item ? 'var(--blue)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: 14, fontWeight: tab === item ? 600 : 400, transition: 'all 0.15s',
                  }}>
                  {item} {tab === item && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {tab === 'Overview'     && <OverviewTab user={user} statusInfo={statusInfo} />}
          {tab === 'Edit Profile' && <EditProfileTab user={user} refreshUser={refreshUser} />}
          {tab === 'Documents'    && <DocumentsTab user={user} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Overview ───────────────────────────────────────────────── */
function OverviewTab({ user, statusInfo }) {
  const borderColors = { blue: 'rgba(61,126,255,0.3)', amber: 'rgba(255,157,61,0.3)', green: 'rgba(16,185,129,0.3)', red: 'rgba(239,68,68,0.3)' };
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Welcome, {user?.fullName}! 👋</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{user?.businessName}</p>

      <div className="card" style={{ marginBottom: 20, borderColor: borderColors[statusInfo.color] || 'var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 40 }}>{statusInfo.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{statusInfo.title}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{statusInfo.desc}</p>
            {user?.adminNotes && user?.status === 'rejected' && (
              <div style={{ marginTop: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ color: 'var(--red)', fontSize: 13 }}><strong>Reason:</strong> {user.adminNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-grid-3" style={{ gap: 14 }}>
        {[
          { icon: <User size={18} />, title: 'Account', value: user?.email, sub: user?.userType },
          { icon: <Store size={18} />, title: 'Store', value: user?.businessName, sub: user?.city || 'No city set' },
          { icon: <Clock size={18} />, title: 'Registered', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—', sub: 'Application date' },
        ].map(({ icon, title, value, sub }) => (
          <div key={title} className="card">
            <div style={{ color: 'var(--blue)', marginBottom: 10 }}>{icon}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>{title}</p>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, wordBreak: 'break-all' }}>{value || '—'}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{sub}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Shared Field component (must be at module level to avoid focus-loss bug) ── */
function Field({ label, id, value, onChange, type = 'text', placeholder = '', textarea = false }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      {textarea
        ? <textarea id={id} className="form-input" rows={4} style={{ resize: 'vertical', fontFamily: 'inherit' }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        : <input id={id} type={type} className="form-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  );
}

/* ─── Edit Profile ────────────────────────────────────────────── */
function EditProfileTab({ user, refreshUser }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || '', mobileNumber: user?.mobileNumber || '',
    storeAddress: user?.storeAddress || '', city: user?.city || '',
    aboutStore: user?.aboutStore || '', whatsappContact: user?.whatsappContact || '',
    telephoneNo: user?.telephoneNo || '', yearsInBusiness: user?.yearsInBusiness || '',
    vatNumber: user?.vatNumber || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/sellers/me', form);
      await refreshUser?.();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleReset = () => setForm({
    fullName: user?.fullName || '', mobileNumber: user?.mobileNumber || '',
    storeAddress: user?.storeAddress || '', city: user?.city || '',
    aboutStore: user?.aboutStore || '', whatsappContact: user?.whatsappContact || '',
    telephoneNo: user?.telephoneNo || '', yearsInBusiness: user?.yearsInBusiness || '',
    vatNumber: user?.vatNumber || '',
  });


  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="profile-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Edit Profile</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Update your store and personal information</p>
        </div>
        <div className="profile-actions" style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={handleReset} disabled={saving}><X size={14} /> Reset</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : <><Save size={14} /> Save</>}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, color: 'var(--blue)' }}>
          <User size={15} /> <span style={{ fontWeight: 600, fontSize: 13 }}>Personal Information</span>
        </div>
        <div className="form-grid-2"><Field label="Full Name" id="fn" value={form.fullName} onChange={(v) => set('fullName', v)} placeholder="Your full name" /><Field label="Mobile Number" id="mob" value={form.mobileNumber} onChange={(v) => set('mobileNumber', v)} placeholder="+971 50 000 0000" /></div>
        <div className="form-grid-2" style={{ marginTop: 16 }}><Field label="WhatsApp Contact" id="wa" value={form.whatsappContact} onChange={(v) => set('whatsappContact', v)} placeholder="+971 50 000 0000" /><Field label="Telephone No." id="tel" value={form.telephoneNo} onChange={(v) => set('telephoneNo', v)} placeholder="+971 4 000 0000" /></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, color: 'var(--blue)' }}>
          <Store size={15} /> <span style={{ fontWeight: 600, fontSize: 13 }}>Store Information</span>
        </div>
        <div className="form-grid-2"><Field label="Store Address" id="addr" value={form.storeAddress} onChange={(v) => set('storeAddress', v)} placeholder="123 Tech Street" /><Field label="City" id="city" value={form.city} onChange={(v) => set('city', v)} placeholder="Dubai" /></div>
        <div className="form-grid-2" style={{ marginTop: 16 }}><Field label="Years in Business" id="yrs" type="number" value={form.yearsInBusiness} onChange={(v) => set('yearsInBusiness', v)} placeholder="5" /><Field label="VAT Number" id="vat" value={form.vatNumber} onChange={(v) => set('vatNumber', v)} placeholder="Optional" /></div>
        <div style={{ marginTop: 16 }}><Field label="About Your Store" id="about" textarea value={form.aboutStore} onChange={(v) => set('aboutStore', v)} placeholder="Describe your store, products and expertise..." /></div>
      </div>

      <div className="card">
        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 14 }}>READ-ONLY (Contact support to change)</p>
        <div className="form-grid-2">
          <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} /></div>
          <div className="form-group"><label className="form-label">Business Name</label><input className="form-input" value={user?.businessName || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} /></div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Documents ───────────────────────────────────────────────── */
const isPdfUrl = (url) => url && (url.includes('/raw/upload/') || url.toLowerCase().includes('.pdf'));
const getViewUrl = (url) => {
  if (!url) return url;
  if (isPdfUrl(url)) return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
  return url;
};

function DocCard({ url, label }) {
  if (!url) return (
    <div style={{ flex: '1 1 180px', border: '2px dashed var(--border)', borderRadius: 10, padding: '20px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      {label} — not uploaded
    </div>
  );
  const isPdf = isPdfUrl(url);
  return isPdf ? (
    <a href={getViewUrl(url)} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(61,126,255,0.06)', border: '1px solid rgba(61,126,255,0.2)', borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: 'var(--text-primary)', flex: '1 1 180px' }}>
      <Edit3 size={22} color="var(--blue)" style={{ flexShrink: 0 }} />
      <div><p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{label}</p><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>PDF — click to view ↗</p></div>
    </a>
  ) : (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ flex: '1 1 180px', textDecoration: 'none' }}>
      <img src={url} alt={label} style={{ width: '100%', height: 230, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)', display: 'block' }} />
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>{label} — click to view ↗</p>
    </a>
  );
}

function DocumentsTab({ user }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Documents</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Documents submitted with your application</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 14 }}>VERIFICATION DOCUMENTS</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <DocCard url={user?.tradeLicenseUrl} label="Trade License" />
          <DocCard url={user?.idPassportUrl} label="ID / Passport" />
        </div>
      </div>

      <div className="card">
        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 14 }}>STORE BRANDING</p>
        {user?.logoUrl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
            <img src={user.logoUrl} alt="Logo" style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', padding: 4 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Store Logo</p>
              <a href={user.logoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 12px', marginTop: 6, display: 'inline-block' }}>View full size ↗</a>
            </div>
          </div>
        )}
        {user?.coverImageUrl && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>Cover Image</p>
            <img src={user.coverImageUrl} alt="Cover" style={{ width: '100%', height: 350, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
          </div>
        )}
        {!user?.coverImageUrl && !user?.logoUrl && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No branding assets uploaded yet.</p>
        )}
      </div>
    </motion.div>
  );
}