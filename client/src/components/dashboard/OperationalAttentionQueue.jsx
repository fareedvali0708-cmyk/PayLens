export default function OperationalAttentionQueue({
  actionableTransactions = [],
  onRetry,
  onView,
  retryingId,
  formatINR,
}) {
  if (!actionableTransactions || actionableTransactions.length === 0) {
    return null
  }

  return (
    <section aria-label="Operational Attention Queue" className="w-full min-w-0">
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
            <h2 className="font-heading text-sm sm:text-base font-semibold text-text tracking-tight uppercase">
              Needs Attention
            </h2>
            <span className="text-xs font-mono text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded font-medium">
              {actionableTransactions.length} Actionable
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Intercepted payments that may still be recoverable within the standard checkout window.
          </p>
        </div>
      </div>

      {/* Grid of prioritized actionable items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 min-w-0">
        {actionableTransactions.slice(0, 3).map((tx) => {
          const isRetrying = retryingId === tx.id
          const hasLink = Boolean(tx.recovery_link_url)
          const displayId = tx.razorpay_order_id || tx.id

          return (
            <div
              key={tx.id}
              className="bg-surface border border-border hover:border-text-secondary/40 transition-colors duration-140 rounded-lg p-4 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-0"
            >
              <div>
                {/* Top metadata line */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    className="font-mono text-[11px] text-text-secondary truncate max-w-[140px]"
                    title={displayId}
                  >
                    {displayId}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                      tx.status === 'RECOVERY_SENT'
                        ? 'bg-blue-50 text-blue-800 border-blue-200/80'
                        : 'bg-amber-50 text-amber-800 border-amber-200/80'
                    }`}
                  >
                    {tx.status === 'RECOVERY_SENT' ? 'Link Dispatched' : 'Pending Action'}
                  </span>
                </div>

                {/* Amount & Customer */}
                <div className="mt-2.5 flex items-baseline justify-between gap-2">
                  <span className="font-serif-heading text-xl font-medium text-text">
                    {formatINR(tx.amount)}
                  </span>
                  <span
                    className="text-xs text-text-secondary truncate max-w-[130px] text-right font-medium"
                    title={tx.customer_email || 'Customer'}
                  >
                    {tx.customer_email || 'Direct Checkout'}
                  </span>
                </div>

                {/* Failure Reason & Code */}
                <div className="mt-2 pt-2 border-t border-border-subtle flex items-start gap-1.5 min-w-0">
                  <span className="text-[10px] font-mono font-medium text-rose-700 bg-rose-50 px-1 py-0.5 rounded shrink-0">
                    {tx.error_code || 'FAILED'}
                  </span>
                  <p className="text-[11px] text-text-muted line-clamp-1 leading-snug truncate">
                    {tx.failure_reason || tx.error_description || 'Payment dropped by issuer'}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="mt-3.5 pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onView(tx)}
                  className="btn btn-ghost btn-sm text-[11px] px-2 h-7"
                >
                  View Details
                </button>

                <button
                  type="button"
                  onClick={() => onRetry(tx)}
                  disabled={isRetrying}
                  className="btn btn-primary btn-sm text-[11px] h-7 px-3"
                  aria-label={`Recover payment ${displayId}`}
                >
                  {isRetrying ? (
                    <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  <span>{hasLink ? 'Resend Recovery' : 'Recover Payment'}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
