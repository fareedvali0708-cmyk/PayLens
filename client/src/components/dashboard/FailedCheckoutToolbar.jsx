export default function FailedCheckoutToolbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}) {
  const tabs = [
    { id: 'ALL', label: 'All Transactions' },
    { id: 'PENDING', label: 'Pending Action' },
    { id: 'RECOVERED', label: 'Recovered' },
    { id: 'IGNORED', label: 'Ignored' },
  ]

  return (
    <div style={{ width: '100%', marginTop: '28px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Section Header */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>
          Recent Intercepted Checkouts
        </h2>
        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
          Live failed transactions intercepted from Razorpay checkout sessions
        </p>
      </div>

      {/* Toolbar Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', width: '100%' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', itemsCenter: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                style={{
                  height: '38px',
                  padding: '0 18px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: isActive ? 'none' : '1px solid #D1D5DB',
                  backgroundColor: isActive ? '#0B4F3C' : '#ffffff',
                  color: isActive ? '#ffffff' : '#374151',
                  boxShadow: isActive ? '0 2px 4px rgba(11, 79, 60, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.03)',
                  transition: 'all 150ms ease-in-out',
                }}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <div style={{ position: 'absolute', left: '14px', top: '11px', color: '#9CA3AF', pointerEvents: 'none' }}>
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by ID, email, order..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: '100%', height: '38px', paddingLeft: '40px', paddingRight: '36px', borderRadius: '9999px', border: '1px solid #D1D5DB', backgroundColor: '#ffffff', fontSize: '12px', color: '#111827', outline: 'none' }}
            aria-label="Search failed transactions"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              style={{ position: 'absolute', right: '12px', top: '11px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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