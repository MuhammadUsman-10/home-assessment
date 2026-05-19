import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, LogOut, CheckCircle, XCircle, PauseCircle, Eye, X, FileText, UserPlus, Upload, CheckCheck } from 'lucide-react';
import api from '../../api/client';

// Cloudinary raw uploads (PDFs) have /raw/upload/ in the URL.
// Image uploads have /image/upload/.
const isPdfUrl = (url) => url && (url.includes('/raw/upload/') || url.toLowerCase().includes('.pdf'));

// PDFs served from Cloudinary raw storage trigger a download.
// Route through Google Docs Viewer to open inline in the browser.
const getViewUrl = (url) => {
  if (!url) return url;
  if (isPdfUrl(url)) return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
  return url;
};

// Reusable document card: shows image preview OR a styled PDF card
function DocCard({ url, label }) {
  if (!url) return null;
  const isPdf = isPdfUrl(url);
  return isPdf ? (
    <a
      href={getViewUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(61,126,255,0.06)', border: '1px solid rgba(61,126,255,0.2)',
        borderRadius: 10, padding: '12px 16px', textDecoration: 'none',
        color: 'var(--text-primary)', flex: '1 1 180px',
      }}
    >
      <FileText size={28} color="var(--blue)" style={{ flexShrink: 0 }} />
      <div>
        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>PDF — click to view ↗</p>
      </div>
    </a>
  ) : (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ flex: '1 1 180px', textDecoration: 'none' }}>
      <img
        src={url}
        alt={label}
        style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10,
          border: '1px solid var(--border)', display: 'block' }}
      />
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'center' }}>{label} — click to view ↗</p>
    </a>
  );
}

const STATUS_TABS = ['all', 'pending_email', 'pending_approval', 'active', 'rejected', 'suspended'];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/sellers', { params: { status, search, page, limit: 15 } });
      setSellers(data.sellers);
      setTotal(data.total);
    } catch { toast.error('Failed to load sellers'); }
    finally { setLoading(false); }
  }, [status, search, page]);

  const fetchUnread = async () => {
    try {
      const { data } = await api.get('/admin/notifications');
      setUnread(data.unread);
      setNotifications(data.notifications || []);
    } catch {}
  };

  const markNotifRead = async (id) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnread((u) => Math.max(0, u - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch('/admin/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
      toast.success('All notifications marked as read');
    } catch {}
  };

  const NOTIF_ICONS = {
    new_registration: <UserPlus size={14} color="var(--blue)" />,
    documents_uploaded: <Upload size={14} color="var(--amber)" />,
    status_change: <CheckCheck size={14} color="var(--green)" />,
  };

  useEffect(() => { fetchSellers(); }, [fetchSellers]);
  useEffect(() => { fetchUnread(); }, []);

  const doAction = async (id, action, payload = {}) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/sellers/${id}/${action}`, payload);
      toast.success(`Seller ${action}d`);
      setSelected(null);
      fetchSellers();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setActionLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="admin-nav" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="brand"><span className="brand-icon">⚡</span><span>ABC<span>Electronics</span> <span style={{ color: 'var(--amber)', fontSize: 12, fontWeight: 600, marginLeft: 6 }}>ADMIN</span></span></div>
        <div className="admin-nav-right" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => { setShowNotifications((s) => !s); if (!showNotifications) fetchUnread(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, position: 'relative', color: 'var(--text-secondary)', display: 'flex' }}
            >
              <Bell size={20} />
              {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--red)', color: '#fff', fontSize: 10, borderRadius: 99, padding: '1px 5px', fontWeight: 700, lineHeight: 1.4 }}>{unread}</span>}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'absolute', top: 36, right: 0, width: 360, maxHeight: 480,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                    zIndex: 200, overflowY: 'auto',
                  }}
                  className="notif-dropdown"
                >
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>Notifications</p>
                    {unread > 0 && (
                      <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ padding: 20, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => { if (!n.isRead) markNotifRead(n._id); }}
                        style={{
                          padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: n.isRead ? 'default' : 'pointer',
                          background: n.isRead ? 'transparent' : 'rgba(61,126,255,0.05)',
                          display: 'flex', gap: 10, alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ marginTop: 2, flexShrink: 0 }}>{NOTIF_ICONS[n.type] || <Bell size={14} />}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 3 }}>{n.message}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                        {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: 4 }} />}
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.fullName}</span>
          <button className="btn btn-ghost" onClick={logout} style={{ padding: '6px 12px', fontSize: 12 }}><LogOut size={12} /> Logout</button>
        </div>
      </nav>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Seller Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{total} total sellers</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search by name, email, business..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_TABS.map((t) => (
              <button key={t} type="button" onClick={() => { setStatus(t); setPage(1); }}
                style={{
                  padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: status === t ? 'none' : '1px solid var(--border)',
                  background: status === t ? 'linear-gradient(135deg,var(--blue),var(--blue-dark))' : 'transparent',
                  color: status === t ? '#fff' : 'var(--text-muted)',
                }}>
                {t === 'all' ? 'All' : t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : sellers.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No sellers found</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Seller</th><th>Business</th><th>Type</th><th>Status</th><th>Registered</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.fullName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</div>
                      </td>
                      <td>{s.businessName}</td>
                      <td><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.userType}</span></td>
                      <td><StatusBadge status={s.status} /></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setSelected(s)} title="View details">
                            <Eye size={13} />
                          </button>
                          {s.status !== 'active' && (
                            <button className="btn btn-success" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => doAction(s._id, 'approve')} disabled={actionLoading} title="Approve">
                              <CheckCircle size={13} />
                            </button>
                          )}
                          {s.status !== 'rejected' && (
                            <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { setSelected(s); setNotes(''); }} disabled={actionLoading} title="Reject">
                              <XCircle size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            {Array.from({ length: Math.ceil(total / 15) }, (_, i) => i + 1).map((p) => (
              <button key={p} type="button" onClick={() => setPage(p)}
                style={{
                  width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)',
                  background: page === p ? 'var(--blue)' : 'transparent',
                  color: page === p ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontSize: 13,
                }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Seller Detail Drawer */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} onClick={() => setSelected(null)} />
          <motion.div
            initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
            style={{ width: 480, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)', overflowY: 'auto', padding: 24 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selected.businessName}</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <StatusBadge status={selected.status} />

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Full Name', selected.fullName],
                ['Email', selected.email],
                ['Mobile', selected.mobileNumber],
                ['Type', selected.userType],
                ['City', selected.city],
                ['Trade License', selected.tradeLicenseNo],
                ['Categories', selected.businessCategories?.join(', ')],
                ['VAT No.', selected.vatNumber],
              ].map(([label, val]) => val ? (
                <div key={label} style={{ display: 'flex', gap: 4, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 100 }}>{label}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{val}</span>
                </div>
              ) : null)}
            </div>

            {/* Document previews — smart image vs PDF */}
            {(selected.tradeLicenseUrl || selected.idPassportUrl) && (
              <div style={{ marginTop: 20 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>DOCUMENTS</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <DocCard url={selected.tradeLicenseUrl} label="Trade License" />
                  <DocCard url={selected.idPassportUrl} label="ID / Passport" />
                </div>
              </div>
            )}

            {/* Store Branding */}
            {(selected.logoUrl || selected.coverImageUrl) && (
              <div style={{ marginTop: 24 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>STORE BRANDING</p>

                {selected.coverImageUrl && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 6 }}>Cover Image</p>
                    <img
                      src={selected.coverImageUrl}
                      alt="Store Cover"
                      style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
                    />
                    <a href={selected.coverImageUrl} target="_blank" rel="noopener noreferrer"
                      className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px', marginTop: 6, display: 'inline-block' }}>
                      Open full size ↗
                    </a>
                  </div>
                )}

                {selected.logoUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <img
                      src={selected.logoUrl}
                      alt="Store Logo"
                      style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', padding: 4 }}
                    />
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 6 }}>Store Logo</p>
                      <a href={selected.logoUrl} target="_blank" rel="noopener noreferrer"
                        className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>
                        Open full size ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}


            {selected.adminNotes && (
              <div style={{ marginTop: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 12 }}>
                <p style={{ color: 'var(--red)', fontSize: 13 }}><strong>Admin Notes:</strong> {selected.adminNotes}</p>
              </div>
            )}

            {/* Actions — context-aware based on current status */}
            <div style={{ marginTop: 28 }}>
              {/* Current status banner */}
              {selected.status === 'active' && (
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={14} color="var(--green)" />
                  <p style={{ color: 'var(--green)', fontSize: 13, fontWeight: 500 }}>Application already approved — seller is active</p>
                </div>
              )}
              {selected.status === 'rejected' && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <XCircle size={14} color="var(--red)" />
                  <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 500 }}>Application already rejected</p>
                </div>
              )}
              {selected.status === 'suspended' && (
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PauseCircle size={14} color="var(--amber)" />
                  <p style={{ color: 'var(--amber)', fontSize: 13, fontWeight: 500 }}>Account is currently suspended</p>
                </div>
              )}

              {/* Notes textarea — shown only when actions that need a reason are available */}
              {!['pending_email'].includes(selected.status) && (
                <>
                  <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                    Notes {['pending_approval', 'suspended'].includes(selected.status) && '(optional)'}
                    {['active', 'rejected'].includes(selected.status) && ' (required for rejection/suspension)'}
                  </label>
                  <textarea className="form-input" style={{ minHeight: 76, marginBottom: 12, resize: 'vertical' }}
                    placeholder="Reason for action..."
                    value={notes} onChange={(e) => setNotes(e.target.value)} />
                </>
              )}

              {/* ── Status-specific button sets ── */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>

                {/* pending_approval → all 3 actions */}
                {selected.status === 'pending_approval' && (<>
                  <button className="btn btn-success" style={{ flex: 1 }} disabled={actionLoading}
                    onClick={() => doAction(selected._id, 'approve')}>
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1 }} disabled={actionLoading}
                    onClick={() => doAction(selected._id, 'reject', { reason: notes })}>
                    <XCircle size={14} /> Reject
                  </button>
                  <button className="btn btn-ghost" style={{ flex: 1 }} disabled={actionLoading}
                    onClick={() => doAction(selected._id, 'suspend', { reason: notes })}>
                    <PauseCircle size={14} /> Suspend
                  </button>
                </>)}

                {/* active → Reject + Suspend only (already approved) */}
                {selected.status === 'active' && (<>
                  <button className="btn btn-danger" style={{ flex: 1 }} disabled={actionLoading}
                    onClick={() => doAction(selected._id, 'reject', { reason: notes })}>
                    <XCircle size={14} /> Reject
                  </button>
                  <button className="btn btn-ghost" style={{ flex: 1 }} disabled={actionLoading}
                    onClick={() => doAction(selected._id, 'suspend', { reason: notes })}>
                    <PauseCircle size={14} /> Suspend
                  </button>
                </>)}

                {/* rejected → Approve + Suspend only (already rejected) */}
                {selected.status === 'rejected' && (<>
                  <button className="btn btn-success" style={{ flex: 1 }} disabled={actionLoading}
                    onClick={() => doAction(selected._id, 'approve')}>
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button className="btn btn-ghost" style={{ flex: 1 }} disabled={actionLoading}
                    onClick={() => doAction(selected._id, 'suspend', { reason: notes })}>
                    <PauseCircle size={14} /> Suspend
                  </button>
                </>)}

                {/* suspended → Unsuspend + Reject (restore or permanently reject) */}
                {selected.status === 'suspended' && (<>
                  <button className="btn btn-success" style={{ flex: 1 }} disabled={actionLoading}
                    onClick={() => doAction(selected._id, 'unsuspend')}>
                    <CheckCircle size={14} /> Unsuspend
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1 }} disabled={actionLoading}
                    onClick={() => doAction(selected._id, 'reject', { reason: notes })}>
                    <XCircle size={14} /> Reject
                  </button>
                </>)}

                {/* pending_email → no actions yet (awaiting verification) */}
                {selected.status === 'pending_email' && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Awaiting email verification — no actions available yet.</p>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </div>
  );
}