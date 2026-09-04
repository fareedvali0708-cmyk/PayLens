export default function DashboardHeader({ onSync, refreshing }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB', width: '100%' }}>
      <div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
          OPERATIONAL OVERVIEW // V4.2
        </span>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>
          PayLens Recovery Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', margin: 0 }}>
          Real-time monitoring, failure classification telemetry, and revenue recovery performance.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Live Telemetry Pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: '#065F46', userSelect: 'none' }}>
          <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
            <span style={{ animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite', position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#34D399', opacity: 0.75 }} />
            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', backgroundColor: '#059669' }} />
          </span>
          <span>LIVE TELEMETRY</span>
        </div>

        {/* Sync Telemetry Action Button */}
        <button
          type="button"
          onClick={onSync}
          disabled={refreshing}
          style={{
            height: '40px',
            padding: '0 20px',
            borderRadius: '9999px',
            backgroundColor: '#ffffff',
            border: '1px solid #D1D5DB',
            color: '#374151',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          <svg
            className={`w-3.5 h-3.5 text-stone-500 ${refreshing ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{refreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
        </button>
      </div>
    </div>
  )
}