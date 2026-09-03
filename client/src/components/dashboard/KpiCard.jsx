export default function KpiCardsRow({ summary, formatINR }) {
  // Circular gauge calculations for Success Rate
  const rate = Math.min(100, Math.max(0, Number(summary?.recovery_rate_percentage) || 0))
  const radius = 17
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (rate / 100) * circumference

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full" style={{ gap: '16px' }}>
      {/* 1. TOTAL RECOVERED */}
      <div
        className="bg-white rounded-xl border border-[#E2E1DA] shadow-xs flex flex-col justify-between box-border h-[128px] min-h-[128px] max-h-[140px] px-5 py-[18px]"
        style={{ height: '128px', minHeight: '128px', maxHeight: '140px', padding: '18px 20px' }}
      >
        <div>
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block leading-none">
            Total Recovered
          </span>
          <div className="text-[28px] sm:text-[30px] font-bold text-[#0F172A] tracking-tight font-['Space_Grotesk',sans-serif] leading-tight mt-1 truncate">
            {formatINR(summary?.total_recovered_amount)}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#F1F5F9]">
          <span className="font-semibold text-emerald-700 inline-flex items-center gap-1.5 text-xs">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <span>Revenue ({summary?.recovery_rate_percentage || 0}%)</span>
          </span>
          <span className="text-[11px] text-[#64748B] font-medium">
            {summary?.total_recovered_count || 0} recovered
          </span>
        </div>
      </div>

      {/* 2. SUCCESS RATE */}
      <div
        className="bg-white rounded-xl border border-[#E2E1DA] shadow-xs flex flex-col justify-between box-border h-[128px] min-h-[128px] max-h-[140px] px-5 py-[18px]"
        style={{ height: '128px', minHeight: '128px', maxHeight: '140px', padding: '18px 20px' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block leading-none">
              Success Rate
            </span>
            <div className="text-[28px] sm:text-[30px] font-bold text-[#0F172A] tracking-tight font-['Space_Grotesk',sans-serif] leading-tight mt-1">
              {summary?.recovery_rate_percentage || 0}%
            </div>
          </div>

          {/* Naturally aligned circular gauge (max 48px) */}
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
              <circle
                cx="20"
                cy="20"
                r={radius}
                className="text-[#E2E8F0]"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                stroke="#093824"
                strokeWidth="3.2"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-[#093824] font-['Space_Grotesk',sans-serif]">
              {rate}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#F1F5F9]">
          <span className="font-semibold text-emerald-700 inline-flex items-center gap-1.5 text-xs">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <span>Retention trend</span>
          </span>
          <span className="text-[11px] text-[#64748B] font-medium">
            Benchmark &gt; 25%
          </span>
        </div>
      </div>

      {/* 3. POTENTIAL REVENUE AT RISK */}
      <div
        className="bg-white rounded-xl border border-[#E2E1DA] shadow-xs flex flex-col justify-between box-border h-[128px] min-h-[128px] max-h-[140px] px-5 py-[18px]"
        style={{ height: '128px', minHeight: '128px', maxHeight: '140px', padding: '18px 20px' }}
      >
        <div>
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block leading-none">
            Potential Revenue At Risk
          </span>
          <div className="text-[28px] sm:text-[30px] font-bold text-[#0F172A] tracking-tight font-['Space_Grotesk',sans-serif] leading-tight mt-1 truncate">
            {formatINR(summary?.total_failed_amount)}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#F1F5F9]">
          <span className="text-xs text-[#64748B] font-medium">
            {summary?.pending_count || 0} pending failures
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
            Actionable within 24h
          </span>
        </div>
      </div>
    </div>
  )
}
