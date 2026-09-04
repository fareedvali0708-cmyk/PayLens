export default function BusinessSignalSection({ summary, formatINR }) {
  const recoveredAmount = Number(summary?.total_recovered_amount) || 0
  const totalFailedAmount = Number(summary?.total_failed_amount) || 0
  const recoveredCount = Number(summary?.total_recovered_count) || 0
  const totalFailedCount = Number(summary?.total_failed_count) || 0
  const recoveryRate = Number(summary?.recovery_rate_percentage) || 0
  const pendingCount = Number(summary?.pending_count) || 0
  const recoverySentCount = Number(summary?.recovery_sent_count) || 0

  // Derived: Potential Revenue at Risk = total_failed_amount - total_recovered_amount
  const derivedRevenueAtRisk = Math.max(0, totalFailedAmount - recoveredAmount)

  return (
    <section aria-label="Financial Signal Summary" className="w-full min-w-0">
      <div className="bg-surface border border-border rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)] divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Dominant Block: RECOVERED REVENUE (1.6fr) */}
        <div className="min-w-0 p-6 sm:p-7 flex flex-col justify-between bg-surface">
          <div>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-text-muted font-semibold">
                Recovered Revenue · Primary Signal
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                {recoveryRate}% Retention Rate
              </span>
            </div>

            {/* Dominant Monetary Figure */}
            <div className="mt-3 flex items-baseline gap-2 flex-wrap">
              <span className="font-serif-heading text-3xl sm:text-4xl lg:text-[42px] font-normal text-text tracking-tight leading-none">
                {formatINR(recoveredAmount)}
              </span>
              <span className="text-xs text-text-muted font-mono uppercase">
                {summary?.currency || 'INR'}
              </span>
            </div>

            <p className="text-xs text-text-muted mt-2 leading-relaxed max-w-md">
              Gross transaction volume retained through automatic payment recovery links and customer re-engagement.
            </p>
          </div>

          {/* Context footnote */}
          <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <span className="font-semibold text-text">{recoveredCount}</span>
              <span className="text-text-muted">of {totalFailedCount} payments recovered</span>
            </div>
            <span className="text-[11px] text-text-muted font-mono">
              Benchmark: &gt; 25.0%
            </span>
          </div>
        </div>

        {/* Supporting Financial Metrics Panel (0.9fr) */}
        <div className="min-w-0 bg-bg-subtle/50 p-6 sm:p-7 flex flex-col justify-between divide-y divide-border-subtle">
          {/* 1. Potential Revenue At Risk (Derived) */}
          <div className="pb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-text-muted font-semibold">
                Revenue at Risk
              </span>
              <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/70 font-medium">
                Exposure
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-heading text-xl sm:text-2xl font-semibold text-text tracking-tight">
                {formatINR(derivedRevenueAtRisk)}
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Unrecovered volume across {pendingCount + recoverySentCount} active/pending failures.
            </p>
          </div>

          {/* 2. Total Intercepted Loss & Active In-Flight */}
          <div className="pt-4 grid grid-cols-2 gap-4 min-w-0">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-text-muted font-medium block truncate">
                Total Intercepted
              </span>
              <span className="font-heading text-base sm:text-lg font-semibold text-text mt-0.5 block truncate">
                {formatINR(totalFailedAmount)}
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 block truncate">
                {totalFailedCount} total failures
              </span>
            </div>

            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-text-muted font-medium block truncate">
                Active In-Flight
              </span>
              <span className="font-heading text-base sm:text-lg font-semibold text-primary mt-0.5 block truncate">
                {recoverySentCount}
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 block truncate">
                Links dispatched
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
