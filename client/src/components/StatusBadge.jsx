const STATUS_STYLES = {
  PENDING: {
    classes: 'bg-warning-light text-accent border-accent/30',
    label: 'Pending',
  },
  RECOVERY_SENT: {
    classes: 'bg-info-light text-info border-info/30',
    label: 'Recovery Sent',
  },
  RECOVERED: {
    classes: 'bg-success-light text-success border-success/30',
    label: 'Recovered',
  },
  FAILED: {
    classes: 'bg-danger-light text-danger border-danger/30',
    label: 'Failed',
  },
  IGNORED: {
    classes: 'bg-surface-hover text-text-muted border-border',
    label: 'Ignored',
  },
}

export default function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING
  return (
    <span
      className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-semibold border whitespace-nowrap ${s.classes}`}
    >
      {s.label}
    </span>
  )
}