export default function TelemetrySummary({ totalEvents = 63, activeLinksCount = 4 }) {
  return (
    <section
      className="bg-white rounded-xl border border-[#E2E1DA] shadow-xs w-full box-border grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-6 items-center min-h-[88px]"
      style={{
        minHeight: '88px',
        padding: '18px 20px',
      }}
      aria-label="Telemetry Pipeline Status"
    >
      {/* Left: Pipeline Status Description */}
      <div className="space-y-1 min-w-0">
        <div className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-[11px] font-bold text-[#093824] uppercase tracking-wider font-['Space_Grotesk',sans-serif]">
            Telemetry Pipeline Status
          </span>
        </div>
        <p className="text-sm font-semibold text-[#0F172A] leading-snug">
          {totalEvents} checkout failure events captured across active merchant sessions
        </p>
        <p className="text-xs text-[#64748B]">
          Awaiting customer checkout completion on generated recovery links.
        </p>
      </div>

      {/* Right: Two Compact Stat Blocks (Minimum width: 110px each) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Active Links */}
        <div
          className="bg-[#F8FAF8] border border-[#E2EBE4] rounded-lg px-4 py-2 text-left min-w-[110px]"
          style={{ minWidth: '110px' }}
        >
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
            Active Links
          </span>
          <span className="text-lg font-bold text-[#093824] font-['Space_Grotesk',sans-serif] leading-tight mt-0.5 block">
            {activeLinksCount}
          </span>
        </div>

        {/* Target Retention */}
        <div
          className="bg-[#F8FAF8] border border-[#E2EBE4] rounded-lg px-4 py-2 text-left min-w-[120px]"
          style={{ minWidth: '120px' }}
        >
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
            Target Retention
          </span>
          <span className="text-lg font-bold text-[#0F172A] font-['Space_Grotesk',sans-serif] leading-tight mt-0.5 block">
            &gt; 30%
          </span>
        </div>
      </div>
    </section>
  )
}
