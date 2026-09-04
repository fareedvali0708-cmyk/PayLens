import { Link } from 'react-router-dom'

function formatTimestamp(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function FailedCheckoutTable({
  transactions = [],
  retryingId,
  onRetry,
  onView,
  formatINR,
  searchQuery,
}) {
  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)', overflow: 'hidden', width: '100%' }}>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '760px', textAlign: 'left', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '26%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>

          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', height: '44px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.06em' }}>
              <th scope="col" style={{ padding: '0 20px', verticalAlign: 'middle' }}>TRANSACTION</th>
              <th scope="col" style={{ padding: '0 20px', verticalAlign: 'middle' }}>CUSTOMER</th>
              <th scope="col" style={{ padding: '0 20px', verticalAlign: 'middle' }}>AMOUNT</th>
              <th scope="col" style={{ padding: '0 20px', verticalAlign: 'middle' }}>STATUS</th>
              <th scope="col" style={{ padding: '0 20px', verticalAlign: 'middle' }}>DETECTED</th>
              <th scope="col" style={{ padding: '0 20px', textAlign: 'right', verticalAlign: 'middle' }}>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '64px 32px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: '440px', margin: '0 auto' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', marginBottom: '16px' }}>
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <line x1="7" y1="15" x2="11" y2="15" />
                      </svg>
                    </div>

                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', marginBottom: '8px' }}>
                      {searchQuery ? 'NO MATCHING TRANSACTIONS' : 'NO PAYMENT ACTIVITY YET'}
                    </p>

                    <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', marginBottom: '24px' }}>
                      {searchQuery
                        ? `No transactions match "${searchQuery}". Try modifying your filter.`
                        : 'Failed checkouts will appear here when PayLens receives its first payment failure webhook from Razorpay.'}
                    </p>

                    {!searchQuery && (
                      <Link
                        to="/checkout"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 28px',
                          borderRadius: '9999px',
                          backgroundColor: '#0B4F3C',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          boxShadow: '0 4px 12px rgba(11, 79, 60, 0.25)',
                          transition: 'all 150ms ease-in-out',
                        }}
                      >
                        <span>Open Test Checkout (Simulation) &rarr;</span>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isRetrying = retryingId === tx.id
                const isRecovered = tx.status === 'RECOVERED'
                const displayId = tx.razorpay_order_id || tx.id

                let statusBg = '#F3F4F6'
                let statusColor = '#374151'
                let statusBorder = '#E5E7EB'
                let statusLabel = tx.status || 'PENDING'

                if (tx.status === 'PENDING') {
                  statusBg = '#FEF2F2'
                  statusColor = '#991B1B'
                  statusBorder = '#FECACA'
                  statusLabel = 'Pending'
                } else if (tx.status === 'RECOVERY_SENT') {
                  statusBg = '#ECFDF5'
                  statusColor = '#065F46'
                  statusBorder = '#A7F3D0'
                  statusLabel = 'Link Sent'
                } else if (tx.status === 'RECOVERED') {
                  statusBg = '#F0FDF4'
                  statusColor = '#166534'
                  statusBorder = '#BBF7D0'
                  statusLabel = 'Recovered'
                } else if (tx.status === 'IGNORED') {
                  statusBg = '#F3F4F6'
                  statusColor = '#4B5563'
                  statusBorder = '#E5E7EB'
                  statusLabel = 'Ignored'
                }

                return (
                  <tr
                    key={tx.id}
                    style={{ borderBottom: '1px solid #F3F4F6', height: '56px' }}
                  >
                    {/* Transaction Reference */}
                    <td style={{ padding: '0 20px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span
                          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: '700', color: '#111827' }}
                          title={displayId}
                        >
                          {displayId}
                        </span>
                        <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#9CA3AF' }}>
                          {tx.razorpay_payment_id || tx.error_code || 'Direct Checkout'}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: '0 20px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span
                          style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}
                          title={tx.customer_email || 'Direct customer'}
                        >
                          {tx.customer_email || 'Direct customer'}
                        </span>
                        <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#9CA3AF' }}>
                          {tx.customer_phone || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '0 20px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace", color: '#111827' }}>
                        {formatINR(tx.amount)}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0 20px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', textTransform: 'uppercase', backgroundColor: statusBg, color: statusColor, border: `1px solid ${statusBorder}` }}>
                        {statusLabel}
                      </span>
                    </td>

                    {/* Detected Timestamp */}
                    <td style={{ padding: '0 20px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#6B7280' }}>
                        {formatTimestamp(tx.created_at)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0 20px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => onView(tx)}
                          style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: '#374151', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => onRetry(tx)}
                          disabled={isRetrying || isRecovered}
                          style={{
                            height: '36px',
                            padding: '0 16px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: isRecovered ? 'default' : 'pointer',
                            backgroundColor: isRecovered ? '#F3F4F6' : '#0B4F3C',
                            color: isRecovered ? '#9CA3AF' : '#ffffff',
                          }}
                        >
                          {isRetrying ? 'Processing...' : isRecovered ? 'Recovered' : 'Recover Now'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}