export default function KpiCardsRow({ summary, formatINR }) {
  const rate = Math.min(100, Math.max(0, Number(summary?.recovery_rate_percentage) || 0))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', width: '100%' }}>
      {/* Primary Business Signal (Stitch container) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
              PRIMARY BUSINESS SIGNAL // RECOVERED GMV
            </span>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
              {formatINR(summary?.total_recovered_amount)}
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
              {summary?.total_recovered_count || 0} checkout failures recovered automatically
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#065F46', backgroundColor: '#D1FAE5', border: '1px solid #A7F3D0', padding: '4px 12px', borderRadius: '9999px' }}>
              +14.2% BENCHMARK
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#6B7280' }}>
              Yield: {rate}%
            </span>
          </div>
        </div>

        <div style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: '#065F46', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }} />
            AUTOMATED RECOVERY ENGINE ACTIVE
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#6B7280' }}>Target Yield: &gt; 25.0%</span>
        </div>
      </div>

      {/* Revenue At Risk Exposure (Stitch container) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
            EXPOSURE // POTENTIAL REVENUE AT RISK
          </span>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
            {formatINR(summary?.total_failed_amount)}
          </div>
          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
            {summary?.pending_count || 0} pending checkout events in queue
          </p>
        </div>

        <div style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#92400E', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: '6px' }}>
            ACTIONABLE WITHIN 24H
          </span>
        </div>
      </div>
    </div>
  )
}