import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function TransactionDiagnosticsDrawer({
  tx,
  onClose,
  onRetry,
  isRetrying,
  copiedModalLink,
  onCopyLink,
  formatINR,
  formatDate,
}) {
  // Close drawer on ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!tx) return null

  const isRecovered = tx.status === 'RECOVERED'
  const displayId = tx.razorpay_order_id || tx.id

  const drawerContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* 1. Backdrop Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          transition: 'opacity 200ms ease',
        }}
        aria-hidden="true"
      />

      {/* 2. Slide-over Drawer Panel */}
      <aside
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          height: '100vh',
          backgroundColor: '#ffffff',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #E5E7EB',
          zIndex: 100000,
          overflow: 'hidden',
        }}
        aria-label="Transaction Diagnostics Drawer"
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                fontWeight: '700',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              TRANSACTION DIAGNOSTICS // V4.2
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Failure Telemetry
            </h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>Order ID:</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#0B4F3C',
                  backgroundColor: '#ECFDF5',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid #A7F3D0',
                }}
              >
                {displayId}
              </span>
            </div>
          </div>

          <button
            id="drawer-close-btn"
            type="button"
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              color: '#4B5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            aria-label="Close diagnostics drawer"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {/* Order ID */}
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '14px 16px' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                ORDER ID
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: '700', color: '#111827', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={displayId}>
                {displayId}
              </span>
            </div>

            {/* Amount */}
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '14px 16px' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                AMOUNT
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: '800', color: '#0B4F3C', display: 'block' }}>
                {formatINR(tx.amount)} <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>{tx.currency || 'INR'}</span>
              </span>
            </div>

            {/* Customer */}
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '14px 16px' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                CUSTOMER
              </span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tx.customer_email || 'Direct Customer'}>
                {tx.customer_email || 'Direct Customer'}
              </span>
              {tx.customer_phone && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#6B7280', display: 'block', marginTop: '2px' }}>
                  {tx.customer_phone}
                </span>
              )}
            </div>

            {/* Timestamp */}
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '14px 16px' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                DETECTED AT
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block' }}>
                {formatDate(tx.created_at)}
              </span>
            </div>
          </div>

          {/* Failure Banner */}
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                PAYMENT FAILED
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#B91C1C', fontWeight: '700' }}>
                {tx.error_code || 'GATEWAY_ERROR'}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#991B1B', marginBottom: '4px' }}>
                {tx.failure_reason || 'BANK_DOWNTIME'}
              </div>
              <p style={{ fontSize: '12px', color: '#B91C1C', lineHeight: '1.6', margin: 0 }}>
                {tx.error_description || 'Issuing bank server is currently unavailable or experiencing high latency.'}
              </p>
            </div>
          </div>

          {/* AI Insight Section */}
          {tx.ai_insight && (
            <div style={{ backgroundColor: '#E6F4F1', border: '1px solid rgba(11, 79, 60, 0.25)', borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0B4F3C' }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#0B4F3C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  AI TELEMETRY INSIGHT
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#111827', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
                {tx.ai_insight}
              </p>
            </div>
          )}

          {/* Recovery Link Section */}
          <div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              RECOVERY STATUS & LINK
            </span>

            {tx.recovery_link_url ? (
              <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0B4F3C' }}>
                    Active Single-Click Recovery Link
                  </span>
                  <a
                    href={tx.recovery_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', fontWeight: '700', color: '#0B4F3C', textDecoration: 'underline' }}
                  >
                    Open Link &rarr;
                  </a>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={tx.recovery_link_url}
                    style={{ flex: '1 1 200px', height: '38px', padding: '0 12px', backgroundColor: '#ffffff', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#111827', outline: 'none' }}
                  />
                  <a
                    href={tx.recovery_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ height: '38px', padding: '0 16px', backgroundColor: '#0B4F3C', color: '#ffffff', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => onCopyLink(tx.recovery_link_url)}
                    style={{ height: '38px', padding: '0 16px', backgroundColor: '#ffffff', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}
                  >
                    {copiedModalLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                  No recovery link has been generated for this transaction yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <button
            id="drawer-close-btn-footer"
            type="button"
            onClick={onClose}
            style={{
              height: '42px',
              padding: '0 22px',
              borderRadius: '9999px',
              backgroundColor: '#ffffff',
              border: '1px solid #D1D5DB',
              color: '#374151',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Close
          </button>

          {!isRecovered ? (
            <button
              id="drawer-recover-btn"
              type="button"
              onClick={() => onRetry(tx)}
              disabled={isRetrying}
              style={{
                height: '42px',
                padding: '0 26px',
                borderRadius: '9999px',
                backgroundColor: '#0B4F3C',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(11, 79, 60, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isRetrying && (
                <span style={{ width: '14px', height: '14px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
              )}
              <span>Recover Payment</span>
            </button>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0 16px', height: '40px', borderRadius: '9999px', backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', fontSize: '12px', fontWeight: '700' }}>
              ✓ Payment Recovered
            </div>
          )}
        </div>
      </aside>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : drawerContent
}