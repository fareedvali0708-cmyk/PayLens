export default function FailedCheckoutTable({
  transactions = [],
  retryingId,
  onRetry,
  onView,
  formatINR,
  searchQuery,
}) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E2E1DA] shadow-xs overflow-hidden w-full">
      {/* Scroll container for internal responsiveness; prevents page-level horizontal scrolling */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[740px] text-left table-fixed border-collapse">
          {/* Column Proportions: 27% + 28% + 13% + 14% + 18% = 100% */}
          <colgroup>
            <col style={{ width: '27%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>

          {/* Table Header: height 42–46px, 11–12px semibold muted, 14–16px horizontal padding */}
          <thead className="bg-[#FAF8F5] border-b border-[#E2E1DA]">
            <tr className="text-[11px] sm:text-[12px] font-semibold tracking-wider text-[#64748B] h-[44px]">
              <th scope="col" className="px-3.5 sm:px-4 align-middle" style={{ paddingLeft: '16px', paddingRight: '14px' }}>
                TRANSACTION ID
              </th>
              <th scope="col" className="px-3.5 sm:px-4 align-middle" style={{ paddingLeft: '14px', paddingRight: '14px' }}>
                CUSTOMER
              </th>
              <th scope="col" className="px-3.5 sm:px-4 align-middle" style={{ paddingLeft: '14px', paddingRight: '14px' }}>
                AMOUNT
              </th>
              <th scope="col" className="px-3.5 sm:px-4 align-middle" style={{ paddingLeft: '14px', paddingRight: '14px' }}>
                STATUS
              </th>
              <th
                scope="col"
                className="text-right align-middle"
                style={{ paddingLeft: '12px', paddingRight: '16px' }}
              >
                ACTION
              </th>
            </tr>
          </thead>

          {/* Table Body: 48–52px height per row, 14–16px cell padding, vertical-align middle */}
          <tbody className="divide-y divide-[#F1F5F9]">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-14 px-6 text-center text-[#64748B]">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] mb-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-[#0F172A]">No failed checkouts</p>
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                      {searchQuery
                        ? 'No transactions matched your search criteria. Try modifying your search or filter.'
                        : 'All intercepted checkouts have succeeded or been fully recovered.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isRetrying = retryingId === tx.id
                const isRecovered = tx.status === 'RECOVERED'
                const displayId = tx.razorpay_order_id || tx.id

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#FAF8F5]/80 transition-colors duration-150 h-[50px]"
                    style={{ height: '50px' }}
                  >
                    {/* 1. Transaction ID: 12–13px monospace, ellipsis, full tooltip */}
                    <td
                      className="align-middle"
                      style={{ paddingLeft: '16px', paddingRight: '14px' }}
                    >
                      <span
                        className="font-mono text-xs sm:text-[13px] text-[#334155] truncate block max-w-full cursor-default select-all"
                        title={displayId}
                      >
                        {displayId}
                      </span>
                    </td>

                    {/* 2. Customer: vertical arrangement (email 13–14px semibold/medium, phone 11–12px muted, 3–4px gap) */}
                    <td
                      className="align-middle"
                      style={{ paddingLeft: '14px', paddingRight: '14px' }}
                    >
                      <div className="flex flex-col gap-[3px] min-w-0" style={{ gap: '3px' }}>
                        <span
                          className="text-xs sm:text-[13px] font-medium text-[#0F172A] truncate block leading-tight"
                          title={tx.customer_email || 'Customer'}
                        >
                          {tx.customer_email || 'Customer'}
                        </span>
                        <span className="text-[11px] font-mono text-[#64748B] truncate block leading-tight">
                          {tx.customer_phone || '—'}
                        </span>
                      </div>
                    </td>

                    {/* 3. Amount: 14–15px semibold, consistent alignment */}
                    <td
                      className="align-middle whitespace-nowrap"
                      style={{ paddingLeft: '14px', paddingRight: '14px' }}
                    >
                      <span className="text-xs sm:text-[14px] font-semibold text-[#0F172A] font-['Space_Grotesk',sans-serif]">
                        {formatINR(tx.amount)}
                      </span>
                    </td>

                    {/* 4. Status Badge */}
                    <td
                      className="align-middle whitespace-nowrap"
                      style={{ paddingLeft: '14px', paddingRight: '14px' }}
                    >
                      {isRecovered ? (
                        <span
                          style={{ backgroundColor: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0', height: '26px', padding: '0 10px' }}
                          className="inline-flex items-center h-[26px] px-2.5 rounded-full text-xs font-semibold border"
                        >
                          Recovered
                        </span>
                      ) : tx.status === 'RECOVERY_SENT' ? (
                        <span
                          style={{ backgroundColor: '#F0F9FF', color: '#0369A1', borderColor: '#BAE6FD', height: '26px', padding: '0 10px' }}
                          className="inline-flex items-center h-[26px] px-2.5 rounded-full text-xs font-semibold border"
                        >
                          Recovery Sent
                        </span>
                      ) : tx.status === 'IGNORED' ? (
                        <span
                          style={{ backgroundColor: '#F1F5F9', color: '#475569', borderColor: '#CBD5E1', height: '26px', padding: '0 10px' }}
                          className="inline-flex items-center h-[26px] px-2.5 rounded-full text-xs font-medium border"
                        >
                          Ignored
                        </span>
                      ) : (
                        <span
                          style={{ backgroundColor: '#FFFBEB', color: '#92400E', borderColor: '#FDE68A', height: '26px', padding: '0 10px' }}
                          className="inline-flex items-center h-[26px] px-2.5 rounded-full text-xs font-semibold border"
                        >
                          Pending
                        </span>
                      )}
                    </td>

                    {/* 5. Action Buttons: Retry (dark green) + View (white), gap: 8px */}
                    <td
                      className="align-middle text-right whitespace-nowrap"
                      style={{ paddingLeft: '12px', paddingRight: '16px' }}
                    >
                      <div
                        className="flex items-center justify-end gap-2"
                        style={{ gap: '8px' }}
                      >
                        {/* Primary: Recover / Retry */}
                        <button
                          id={`retry-btn-${tx.id}`}
                          data-testid="retry-btn"
                          type="button"
                          onClick={() => onRetry(tx)}
                          disabled={isRetrying || isRecovered}
                          style={{
                            backgroundColor: isRecovered ? '#94A3B8' : '#093824',
                            width: '72px',
                            height: '34px',
                            padding: '0 12px',
                          }}
                          className="w-[72px] h-[34px] rounded-lg text-white font-semibold text-xs transition duration-150 hover:opacity-95 hover:shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5 shrink-0 select-none"
                          aria-label={isRecovered ? 'Transaction Recovered' : 'Retry Payment Recovery'}
                        >
                          {isRetrying && (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          )}
                          <span>{isRecovered ? 'Recovered' : 'Retry'}</span>
                        </button>

                        {/* Secondary: View */}
                        <button
                          id={`view-btn-${tx.id}`}
                          data-testid="view-btn"
                          type="button"
                          onClick={() => onView(tx)}
                          style={{
                            width: '62px',
                            height: '34px',
                          }}
                          className="w-[62px] h-[34px] rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] font-semibold text-xs hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition duration-150 active:scale-[0.98] cursor-pointer shadow-2xs inline-flex items-center justify-center shrink-0 select-none"
                          aria-label="View Transaction Diagnostics"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
