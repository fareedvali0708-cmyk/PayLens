export default function DashboardHeader({ onSync, refreshing }) {
  return (
    <header className="flex items-start justify-between gap-6 w-full">
      {/* Title & Subtitle */}
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-[32px] lg:text-[34px] font-semibold text-[#0F172A] tracking-tight font-['Space_Grotesk',sans-serif] leading-tight">
          Dashboard
        </h1>
        <p className="text-xs sm:text-[14px] text-[#64748B] mt-1 font-normal">
          Real-time monitoring and automated recovery for failed checkouts
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Live Data Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E2E1DA] text-xs font-semibold text-[#093824] shadow-xs select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span className="tracking-wide">Live Data</span>
        </div>

        {/* Sync Data Action Button */}
        <button
          type="button"
          onClick={onSync}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 h-[38px] px-[14px] min-w-[88px] whitespace-nowrap rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-xs select-none"
          aria-label="Synchronize data from live payment sources"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-500 ${
              refreshing ? 'animate-spin text-[#093824]' : 'text-[#64748B]'
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
        </button>
      </div>
    </header>
  )
}
