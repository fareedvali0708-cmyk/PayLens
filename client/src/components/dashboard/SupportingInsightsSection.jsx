export default function SupportingInsightsSection({
  categoryBreakdown = [],
  statusBreakdown = {},
  totalFailedCount = 0,
  formatINR,
}) {
  if (totalFailedCount === 0 && (!categoryBreakdown || categoryBreakdown.length === 0)) {
    return null
  }

  const topCategories = categoryBreakdown.slice(0, 4)

  return (
    <section aria-label="Supporting Analytics" className="w-full min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-w-0">
        {/* Left: Failure Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-lg p-5 sm:p-6 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-text-muted font-semibold truncate">
                Failure Root Causes · Diagnostic Distribution
              </h2>
              <span className="text-[11px] text-text-muted font-mono shrink-0">
                {topCategories.length} categories
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Distribution of checkout drop-offs categorized by issuing bank error codes.
            </p>

            {/* Diagnostic Categories List */}
            <div className="mt-4 space-y-3">
              {topCategories.map((cat) => {
                const percent =
                  totalFailedCount > 0
                    ? Math.round((cat.count / totalFailedCount) * 100)
                    : 0
                return (
                  <div key={cat.category} className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[11px] font-medium text-text truncate">
                          {cat.category}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono shrink-0">
                          ({cat.count} events)
                        </span>
                      </div>
                      <span className="font-semibold text-text font-mono text-[11px] shrink-0">
                        {formatINR(cat.total_amount)} · {percent}%
                      </span>
                    </div>

                    {/* Restrained distribution bar */}
                    <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(4, percent))}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted flex-wrap gap-2">
            <span>Automated AI recommendations applied to each category.</span>
            <span className="font-mono">Live Aggregation</span>
          </div>
        </div>

        {/* Right: Pipeline Status Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-lg p-5 sm:p-6 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-text-muted font-semibold">
                Lifecycle State
              </h2>
              <span className="text-[11px] text-text-muted font-mono shrink-0">
                {totalFailedCount} Total Records
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Real-time progression of intercepted payments.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5 min-w-0">
              {/* Recovered */}
              <div className="panel-subtle p-3 min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-semibold block truncate">
                  Recovered
                </span>
                <span className="font-heading text-xl font-bold text-text mt-0.5 block truncate">
                  {statusBreakdown.RECOVERED || 0}
                </span>
                <span className="text-[10px] text-text-muted mt-0.5 block truncate">
                  Closed revenue
                </span>
              </div>

              {/* Recovery Sent */}
              <div className="panel-subtle p-3 min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-800 font-semibold block truncate">
                  Recovery Sent
                </span>
                <span className="font-heading text-xl font-bold text-text mt-0.5 block truncate">
                  {statusBreakdown.RECOVERY_SENT || 0}
                </span>
                <span className="text-[10px] text-text-muted mt-0.5 block truncate">
                  Links active
                </span>
              </div>

              {/* Pending */}
              <div className="panel-subtle p-3 min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-semibold block truncate">
                  Pending Action
                </span>
                <span className="font-heading text-xl font-bold text-text mt-0.5 block truncate">
                  {statusBreakdown.PENDING || 0}
                </span>
                <span className="text-[10px] text-text-muted mt-0.5 block truncate">
                  Awaiting trigger
                </span>
              </div>

              {/* Failed / Other */}
              <div className="panel-subtle p-3 min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-700 font-semibold block truncate">
                  Exhausted / Other
                </span>
                <span className="font-heading text-xl font-bold text-text mt-0.5 block truncate">
                  {statusBreakdown.FAILED || 0}
                </span>
                <span className="text-[10px] text-text-muted mt-0.5 block truncate">
                  Unrecoverable
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] text-text-muted flex items-center justify-between flex-wrap gap-2">
            <span>Webhook synchronization: Active</span>
            <span className="font-mono text-emerald-700">● 200 OK</span>
          </div>
        </div>
      </div>
    </section>
  )
}
