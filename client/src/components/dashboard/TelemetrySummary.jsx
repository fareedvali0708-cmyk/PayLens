export default function TelemetrySummary({ totalEvents = 63, activeLinksCount = 4 }) {
  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        alignItems: 'center',
      }}
      aria-label="Telemetry Pipeline Status"
    >
      {/* Left: Pipeline Status Description */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#0B4F3C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            TELEMETRY PIPELINE STATUS
          </span>
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '4px 0 6px 0', lineHeight: '1.4' }}>
          {totalEvents} checkout failure events captured across active merchant sessions
        </h3>
        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>
          Awaiting customer checkout completion on generated recovery links.
        </p>
      </div>

      {/* Right: Two Premium Stat Cards */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px 20px', minWidth: '130px', textTransform: 'none' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
            ACTIVE LINKS
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: '800', color: '#0B4F3C', display: 'block' }}>
            {activeLinksCount}
          </span>
        </div>

        <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px 20px', minWidth: '140px', textTransform: 'none' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
            TARGET RETENTION
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: '800', color: '#111827', display: 'block' }}>
            &gt; 30%
          </span>
        </div>
      </div>
    </section>
  )
}