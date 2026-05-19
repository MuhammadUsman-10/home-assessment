const STATUS_CONFIG = {
  pending_email:    { label: 'Pending Email', className: 'badge-pending-email',    dot: '○' },
  pending_approval: { label: 'Under Review',  className: 'badge-pending-approval', dot: '◌' },
  active:           { label: 'Active',         className: 'badge-active',           dot: '●' },
  rejected:         { label: 'Rejected',       className: 'badge-rejected',         dot: '✕' },
  suspended:        { label: 'Suspended',      className: 'badge-suspended',        dot: '⊘' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, className: '', dot: '○' };
  return (
    <span className={`badge ${config.className}`}>
      <span>{config.dot}</span>
      {config.label}
    </span>
  );
}