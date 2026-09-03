const STATUS_STYLES = {
  PENDING: {
    bg: 'bg-warning-light',
    text: 'text-accent',
    label: 'Pending',
  },
  RECOVERY_SENT: {
    bg: 'bg-info-light',
    text: 'text-info',
    label: 'Recovery Sent',
  },
  RECOVERED: {
    bg: 'bg-success-light',
    text: 'text-success',
    label: 'Recovered',
  },
  FAILED: {
    bg: 'bg-danger-light',
    text: 'text-danger',
    label: 'Failed',
  },
  IGNORED: {
    bg: 'bg-surface-hover',
    text: 'text-text-muted',
    label: 'Ignored',
  },
}

export default function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  )
}
