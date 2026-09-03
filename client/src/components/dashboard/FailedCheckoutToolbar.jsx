export default function FailedCheckoutToolbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}) {
  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'RECOVERED', label: 'Recovered' },
    { id: 'IGNORED', label: 'Ignored' },
  ]

  return (
    <div className="w-full mt-[28px]">
      {/* Section Header: 20–22px title, 13–14px subtitle, mb-14px */}
      <div className="mb-[14px]">
        <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#0F172A] font-['Space_Grotesk',sans-serif] tracking-tight leading-tight">
          Recent Failed Checkouts
        </h2>
        <p className="text-[13px] sm:text-[14px] text-[#64748B] mt-1">
          Live failed transactions intercepted from Razorpay checkout sessions
        </p>
      </div>

      {/* Toolbar Container: flex, items-center, justify-between, gap-16px, width 100% */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 w-full"
        style={{ gap: '16px' }}
      >
        {/* Left: Filter Group with gap: 6px, flex-shrink: 0 */}
        <div className="flex items-center gap-[6px] shrink-0" style={{ gap: '6px' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`h-[36px] px-3 rounded-lg text-xs font-semibold tracking-normal transition-all duration-150 cursor-pointer select-none inline-flex items-center justify-center ${
                  isActive
                    ? 'bg-[#093824] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#475569] border border-[#E2E1DA] hover:bg-white hover:text-[#0F172A]'
                }`}
                style={{ height: '36px', padding: '8px 12px' }}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Right: Search Input (strict width: 240px, max-width: 240px, height: 38px, flex-shrink: 0) */}
        <div
          className="relative w-[240px] max-w-[240px] shrink-0"
          style={{ width: '240px', maxWidth: '240px' }}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by ID, email, order..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[240px] max-w-[240px] h-[38px] pl-9 pr-7 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#093824] focus:ring-1 focus:ring-[#093824] transition-all shadow-2xs box-border"
            style={{ height: '38px', padding: '0 12px 0 36px', width: '240px', maxWidth: '240px' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
