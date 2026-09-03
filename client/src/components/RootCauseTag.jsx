const CATEGORY_COLORS = {
  BANK_DOWNTIME: { bg: 'bg-danger-light', text: 'text-danger' },
  AUTHENTICATION_FAILED: { bg: 'bg-warning-light', text: 'text-accent' },
  INSUFFICIENT_FUNDS: { bg: 'bg-info-light', text: 'text-info' },
  LIMIT_EXCEEDED: { bg: 'bg-warning-light', text: 'text-accent' },
  INSTRUMENT_INVALID: { bg: 'bg-danger-light', text: 'text-danger' },
  UPI_ERROR: { bg: 'bg-info-light', text: 'text-info' },
  CUSTOMER_DROPOFF: { bg: 'bg-surface-hover', text: 'text-text-secondary' },
  GATEWAY_ERROR: { bg: 'bg-danger-light', text: 'text-danger' },
  FRAUD_SECURITY: { bg: 'bg-danger-light', text: 'text-danger' },
  UNKNOWN: { bg: 'bg-surface-hover', text: 'text-text-muted' },
}

const CATEGORY_LABELS = {
  BANK_DOWNTIME: 'Bank Down',
  AUTHENTICATION_FAILED: 'Auth Failed',
  INSUFFICIENT_FUNDS: 'Low Balance',
  LIMIT_EXCEEDED: 'Limit Hit',
  INSTRUMENT_INVALID: 'Invalid Card',
  UPI_ERROR: 'UPI Error',
  CUSTOMER_DROPOFF: 'Dropoff',
  GATEWAY_ERROR: 'Gateway Error',
  FRAUD_SECURITY: 'Fraud Risk',
  UNKNOWN: 'Unknown',
}

export default function RootCauseTag({ category }) {
  const key = category?.toUpperCase() || 'UNKNOWN'
  const colors = CATEGORY_COLORS[key] || CATEGORY_COLORS.UNKNOWN
  const label = CATEGORY_LABELS[key] || category || 'Unknown'

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {label}
    </span>
  )
}
