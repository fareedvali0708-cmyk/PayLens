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

  const drawerContent = (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* 1. Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Slide-over Drawer Panel */}
      <aside
        className="fixed top-0 right-0 bottom-0 h-screen w-full sm:w-[460px] md:w-[480px] bg-white shadow-2xl flex flex-col border-l border-[#E2E1DA] z-50 overflow-hidden"
        aria-label="Transaction Diagnostics Drawer"
      >
        {/* 1. Header: Always pinned to the top (shrink-0) */}
        <div className="px-6 py-4.5 border-b border-[#F1F5F9] flex items-center justify-between gap-3 shrink-0 bg-white">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#0F172A] font-['Space_Grotesk',sans-serif] tracking-tight">
              Transaction Diagnostics
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 truncate">
              ID: <span className="font-mono text-[#334155]">{tx.razorpay_order_id || tx.id}</span>
            </p>
          </div>

          {/* Accessible Close Button */}
          <button
            id="drawer-close-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
            aria-label="Close diagnostics drawer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 2. Scrollable Body: only this middle area scrolls */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Transaction Summary Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Order ID */}
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E2E1DA]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                ORDER ID
              </span>
              <span
                className="font-mono text-xs font-semibold text-[#0F172A] block truncate mt-1"
                title={tx.razorpay_order_id || '—'}
              >
                {tx.razorpay_order_id || '—'}
              </span>
            </div>

            {/* Amount */}
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E2E1DA]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                AMOUNT
              </span>
              <span className="text-sm font-bold text-[#0F172A] block mt-1 font-['Space_Grotesk',sans-serif]">
                {formatINR(tx.amount)}{' '}
                <span className="text-[11px] font-semibold text-[#64748B]">{tx.currency || 'INR'}</span>
              </span>
            </div>

            {/* Customer */}
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E2E1DA]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                CUSTOMER
              </span>
              <span
                className="text-xs font-semibold text-[#0F172A] block truncate mt-1"
                title={tx.customer_email || '—'}
              >
                {tx.customer_email || '—'}
              </span>
              {tx.customer_phone && (
                <span className="text-[11px] text-[#64748B] font-mono mt-0.5 block">
                  {tx.customer_phone}
                </span>
              )}
            </div>

            {/* Timestamp */}
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E2E1DA]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                TIMESTAMP
              </span>
              <span className="text-xs font-medium text-[#334155] block mt-1">
                {formatDate(tx.created_at)}
              </span>
            </div>
          </div>

          {/* Failure Section: Subtle light-red background */}
          <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded bg-red-100/90 text-red-800 text-[10px] font-bold font-mono uppercase tracking-wider">
                PAYMENT FAILED
              </span>
              <span className="text-[11px] font-mono text-red-700">
                {tx.error_code || 'GATEWAY_ERROR'}
              </span>
            </div>

            <div className="text-sm font-bold text-red-900">
              {tx.failure_reason || 'BANK_DOWNTIME'}
            </div>

            <p className="text-xs text-red-800 leading-relaxed">
              {tx.error_description ||
                'Issuing bank server is currently unavailable or experiencing high latency.'}
            </p>
          </div>

          {/* AI Insight Section: Subtle light-neutral/green surface */}
          {tx.ai_insight && (
            <div className="bg-[#F0F6F2] border border-[#D5E5DA] rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#093824] uppercase tracking-wider font-['Space_Grotesk',sans-serif]">
                <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span>AI INSIGHT</span>
              </div>
              <p className="text-xs sm:text-[13px] text-[#0A3D27] leading-relaxed">
                {tx.ai_insight}
              </p>
            </div>
          )}

          {/* Recovery Link Section */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              Recovery Status
            </span>

            {tx.recovery_link_url ? (
              <div className="bg-[#FAF8F5] border border-[#E2E1DA] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#093824] block">
                    Active Payment Recovery Link
                  </span>
                  <a
                    id="drawer-open-link-btn"
                    href={tx.recovery_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-[#093824] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open Link</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={tx.recovery_link_url}
                    className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-mono text-[#0F172A] select-all focus:outline-none"
                  />
                  <a
                    id="drawer-open-btn"
                    href={tx.recovery_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#093824] hover:bg-[#072B1C] text-white rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer shadow-2xs inline-flex items-center justify-center"
                    aria-label="Open payment recovery link in a new tab"
                  >
                    Open
                  </a>
                  <button
                    id="drawer-copy-btn"
                    type="button"
                    onClick={() => onCopyLink(tx.recovery_link_url)}
                    className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#093824] hover:bg-[#F8FAFC] transition shrink-0 cursor-pointer shadow-2xs"
                  >
                    {copiedModalLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF8F5] border border-[#E2E1DA] rounded-xl py-3 px-4 text-center">
                <p className="text-xs text-[#64748B]">
                  No recovery link has been generated yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Footer Actions: Always pinned to the bottom (shrink-0) */}
        <div className="px-6 py-4 border-t border-[#F1F5F9] bg-[#FAF8F5]/80 flex items-center justify-between gap-3 shrink-0">
          {/* Secondary Action: Close */}
          <button
            id="drawer-close-btn"
            type="button"
            onClick={onClose}
            className="h-11 px-5 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition duration-150 cursor-pointer shadow-2xs"
          >
            Close
          </button>

          {/* Primary Action: Recover Payment */}
          {!isRecovered ? (
            <button
              id="drawer-recover-btn"
              type="button"
              onClick={() => onRetry(tx)}
              disabled={isRetrying}
              className="h-11 px-6 rounded-xl bg-[#093824] hover:bg-[#072B1C] text-white text-xs font-semibold transition duration-150 hover:shadow-xs active:scale-[0.98] cursor-pointer shadow-xs inline-flex items-center justify-center gap-2 flex-1 sm:flex-none sm:min-w-[170px] disabled:opacity-50"
            >
              {isRetrying && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>Recover Payment</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Payment Recovered</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : drawerContent
}
