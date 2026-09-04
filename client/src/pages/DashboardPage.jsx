import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { getTransactions, getMetrics, recoverTransaction } from '../lib/api'

// Dedicated presentation components
import DashboardHeader from '../components/dashboard/DashboardHeader'
import KpiCardsRow from '../components/dashboard/KpiCard'
import TelemetrySummary from '../components/dashboard/TelemetrySummary'
import FailedCheckoutToolbar from '../components/dashboard/FailedCheckoutToolbar'
import FailedCheckoutTable from '../components/dashboard/FailedCheckoutTable'
import TransactionDiagnosticsDrawer from '../components/dashboard/TransactionDiagnosticsDrawer'

function formatINR(val) {
  const num = Number(val) || 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DashboardPage() {
  const { session } = useAuth()
  const { addToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [summary, setSummary] = useState({
    total_failed_count: 0,
    total_failed_amount: 0,
    total_recovered_count: 0,
    total_recovered_amount: 0,
    recovery_rate_percentage: 0,
    pending_count: 0,
    recovery_sent_count: 0,
  })

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState(searchParams.get('filter') || 'ALL')

  // Action states
  const [retryingId, setRetryingId] = useState(null)
  const [selectedTx, setSelectedTx] = useState(null) // for Diagnostic Drawer
  const [copiedModalLink, setCopiedModalLink] = useState(false)

  // Sync tab with URL search params if present
  useEffect(() => {
    const filter = searchParams.get('filter')
    if (filter && ['ALL', 'PENDING', 'RECOVERED', 'IGNORED'].includes(filter.toUpperCase())) {
      setActiveTab(filter.toUpperCase())
    }
  }, [searchParams])

  const token = session?.access_token

  async function fetchData(isManualSync = false) {
    if (!token) return
    if (isManualSync) setRefreshing(true)
    else setLoading(true)

    try {
      const [metricsRes, txRes] = await Promise.all([
        getMetrics(token),
        getTransactions(token),
      ])

      if (metricsRes?.metrics?.summary) {
        setSummary(metricsRes.metrics.summary)
      }
      if (txRes?.transactions) {
        setTransactions(txRes.transactions)
      }
      if (isManualSync) {
        addToast('Dashboard data synchronized in real time.', 'success')
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      addToast(err.message || 'Failed to retrieve live transactions.', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  // Handle Real "Retry" / "Recover" Action
  async function handleRetry(tx) {
    if (!token || !tx?.id) return
    setRetryingId(tx.id)

    try {
      const res = await recoverTransaction(token, tx.id)
      const linkUrl = res?.recovery?.payment_link_url

      const updatedTx = {
        ...tx,
        status: 'RECOVERY_SENT',
        recovery_attempts: (tx.recovery_attempts || 0) + 1,
        last_recovery_at: new Date().toISOString(),
        recovery_link_url: linkUrl || tx.recovery_link_url,
      }

      // Update row in state immediately
      setTransactions((prev) =>
        prev.map((item) => (item.id === tx.id ? updatedTx : item))
      )

      // If drawer is currently showing this tx, update its data as well
      if (selectedTx?.id === tx.id) {
        setSelectedTx(updatedTx)
      }

      // Open link in new browser tab if generated
      if (linkUrl) {
        window.open(linkUrl, '_blank', 'noopener,noreferrer')
        addToast('Recovery link opened in a new tab.', 'success')
      } else {
        addToast('Recovery initiated successfully.', 'success')
      }

      // Refresh metrics in background
      getMetrics(token).then((m) => {
        if (m?.metrics?.summary) setSummary(m.metrics.summary)
      })
    } catch (err) {
      console.error('Retry error:', err)
      addToast(err.message || 'Failed to generate payment recovery link.', 'error')
    } finally {
      setRetryingId(null)
    }
  }

  // Filtered transactions for the table
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Tab filter
      if (activeTab === 'PENDING' && tx.status !== 'PENDING' && tx.status !== 'RECOVERY_SENT') return false
      if (activeTab === 'RECOVERED' && tx.status !== 'RECOVERED') return false
      if (activeTab === 'IGNORED' && tx.status !== 'IGNORED') return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const orderId = (tx.razorpay_order_id || '').toLowerCase()
        const email = (tx.customer_email || '').toLowerCase()
        const id = (tx.id || '').toLowerCase()
        return orderId.includes(q) || email.includes(q) || id.includes(q)
      }

      return true
    })
  }, [transactions, activeTab, searchQuery])

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    setSearchParams({ filter: tabId })
  }

  function handleCopyLink(linkUrl) {
    if (!linkUrl) return
    navigator.clipboard.writeText(linkUrl)
    setCopiedModalLink(true)
    setTimeout(() => setCopiedModalLink(false), 2000)
    addToast('Recovery link copied to clipboard.', 'success')
  }

  // Polished loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-4">
        <div className="w-10 h-10 border-[3px] border-[#0B4F3C] border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-xs font-semibold text-stone-900 tracking-wide uppercase font-mono">
            Loading merchant intelligence
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            Intercepting telemetry and calculating live recovery metrics...
          </p>
        </div>
      </div>
    )
  }

  // Dynamic real-time metrics (NO hardcoded demo fallbacks!)
  const activeLinksCount =
    summary.recovery_sent_count ??
    transactions.filter((t) => t.status === 'RECOVERY_SENT').length ??
    0

  const totalCapturedEvents =
    summary.total_failed_count ?? transactions.length ?? 0

  return (
    <div className="flex flex-col w-full min-w-0">
      {/* 1. Command-Center Top Header */}
      <DashboardHeader
        onSync={() => fetchData(true)}
        refreshing={refreshing}
      />

      {/* 2. Primary Business Summary (Three-Card KPI Row) - 20px below Header */}
      <div className="mt-5 w-full">
        <KpiCardsRow
          summary={summary}
          formatINR={formatINR}
        />
      </div>

      {/* 3. Telemetry Pipeline Operational Summary - 20px below KPI cards */}
      <div className="mt-5 w-full">
        <TelemetrySummary
          totalEvents={totalCapturedEvents}
          activeLinksCount={activeLinksCount}
        />
      </div>

      {/* 4. Operational Section: Recent Failed Checkouts */}
      <div className="flex flex-col w-full">
        <FailedCheckoutToolbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Operations Transactions Table */}
        <div className="mt-4 w-full">
          <FailedCheckoutTable
            transactions={filteredTransactions}
            retryingId={retryingId}
            onRetry={handleRetry}
            onView={(tx) => setSelectedTx(tx)}
            formatINR={formatINR}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* 7. Right-Side Diagnostics Drawer */}
      <TransactionDiagnosticsDrawer
        tx={selectedTx}
        onClose={() => setSelectedTx(null)}
        onRetry={handleRetry}
        isRetrying={retryingId === selectedTx?.id}
        copiedModalLink={copiedModalLink}
        onCopyLink={handleCopyLink}
        formatINR={formatINR}
        formatDate={formatDate}
      />
    </div>
  )
}
