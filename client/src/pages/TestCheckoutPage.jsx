import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createCheckoutOrder } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function TestCheckoutPage() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [lastError, setLastError] = useState(null)
  const [lastPaymentDetails, setLastPaymentDetails] = useState(null)

  const product = {
    name: 'PayLens Test Checkout Purchase',
    description: 'Sandbox Payment Recovery Interception Test',
    amount: 1499,
    formattedAmount: '₹1,499.00',
  }

  async function handlePayWithRazorpay() {
    setLoading(true)
    setLastError(null)
    setPaymentStatus(null)

    try {
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        throw new Error('Unable to load Razorpay Checkout SDK.')
      }

      const orderData = await createCheckoutOrder(product.amount, token)
      if (!orderData?.success || !orderData?.order_id || !orderData?.key_id) {
        throw new Error(orderData?.message || 'Failed to initialize payment order.')
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'PayLens Store',
        description: product.name,
        order_id: orderData.order_id,
        prefill: {
          name: 'Demo Customer',
          email: 'customer@example.com',
          contact: '+919876543210',
        },
        theme: {
          color: '#004D40',
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setPaymentStatus('DISMISSED')
          },
        },
        handler: (response) => {
          setLoading(false)
          setPaymentStatus('SUCCESS')
          setLastPaymentDetails({
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
          })
        },
      }

      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', (response) => {
        setLoading(false)
        setPaymentStatus('FAILED')
        const err = response.error || {}
        setLastPaymentDetails({
          error_code: err.code || 'BAD_REQUEST_ERROR',
          error_description: err.description || 'Payment failed or declined by issuing bank.',
          reason: err.reason || 'bank_failure',
          payment_id: err.metadata?.payment_id || 'N/A',
          order_id: err.metadata?.order_id || orderData.order_id,
        })
      })

      rzp.open()
    } catch (err) {
      console.error('[Checkout Error]', err)
      setLastError(err.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '32px 24px', backgroundColor: '#F8F9FA', color: '#111827', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header */}
      <header style={{ width: '100%', maxWidth: '540px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0B4F3C' }} />
          <span style={{ fontWeight: '700', fontSize: '16px', color: '#111827', letterSpacing: '-0.02em' }}>PayLens</span>
        </div>
        <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
          ENV: SANDBOX TEST MODE
        </span>
      </header>

      {/* Main Modal Card (Generous 36px Padding & Clean Spacing) */}
      <main style={{ width: '100%', maxWidth: '540px', margin: 'auto', padding: '24px 0' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #E5E7EB', padding: '36px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              STITCH CHECKOUT SIMULATOR
            </span>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>
              Review & Pay Order
            </h1>
          </div>

          {/* Product Summary Card */}
          <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>{product.name}</h2>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{product.description}</p>
            </div>
            <span style={{ fontSize: '22px', fontWeight: '800', fontFamily: "'JetBrains Mono', monospace", color: '#0B4F3C', whiteSpace: 'nowrap' }}>
              {product.formattedAmount}
            </span>
          </div>

          {/* Helper Banner */}
          <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0' }}>Test Failure Simulation</p>
            <p style={{ fontSize: '12px', color: '#B45309', lineHeight: '1.5', margin: 0 }}>
              Select Razorpay test failure modes inside the checkout modal to trigger real-time payment interception telemetry.
            </p>
          </div>

          {/* Failure Alert */}
          {paymentStatus === 'FAILED' && lastPaymentDetails && (
            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" }}>
                🔴 Payment Failed ({lastPaymentDetails.error_code})
              </span>
              <p style={{ fontSize: '12px', color: '#B91C1C', margin: 0 }}>
                {lastPaymentDetails.error_description}
              </p>
              <div style={{ paddingTop: '10px', borderTop: '1px solid #FCA5A5', fontSize: '12px', color: '#065F46', fontWeight: '600' }}>
                ✨ Transmitted to PayLens Webhook Pipeline.{' '}
                <Link to="/app/overview" style={{ textDecoration: 'underline', fontWeight: '700', color: '#0B4F3C' }}>
                  View in Dashboard &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {paymentStatus === 'SUCCESS' && lastPaymentDetails && (
            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', marginBottom: '24px' }}>
              <span style={{ fontWeight: '700', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", display: 'block', marginBottom: '4px' }}>
                🟢 Payment Successful!
              </span>
              <p style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#047857', margin: 0 }}>
                Payment ID: {lastPaymentDetails.payment_id}
              </p>
            </div>
          )}

          {lastError && (
            <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '12px', fontWeight: '600', marginBottom: '24px' }}>
              {lastError}
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handlePayWithRazorpay}
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '9999px',
              backgroundColor: '#0B4F3C',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(11, 79, 60, 0.25)',
              marginBottom: '16px',
            }}
          >
            {loading ? 'Opening Razorpay Modal...' : 'Pay with Razorpay →'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <Link
              to="/app/overview"
              style={{ fontSize: '13px', fontWeight: '600', color: '#0B4F3C', textDecoration: 'none' }}
            >
              Back to Merchant Dashboard &rarr;
            </Link>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace" }}>
        PayLens Recovery Test Environment &bull; Razorpay Sandbox Rail
      </footer>
    </div>
  )
}
