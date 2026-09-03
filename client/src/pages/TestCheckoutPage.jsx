/**
 * SECURITY / DEMO NOTE:
 * This page is intentionally unauthenticated because it simulates an external,
 * customer-facing e-commerce checkout session. This route is intended for local development
 * and demonstration purposes only and must not be deployed publicly without additional
 * access protection, rate-limiting, or security controls.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createCheckoutOrder } from '../lib/api'
import stitchLogo from '../assets/paylens-stitch-logo.png'

// Official on-demand loader for Razorpay Checkout.js
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
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null) // 'SUCCESS' | 'FAILED' | 'DISMISSED'
  const [lastError, setLastError] = useState(null)
  const [lastPaymentDetails, setLastPaymentDetails] = useState(null)

  const product = {
    name: 'PayLens Demo Purchase',
    description: 'Standard E-Commerce Checkout Simulation (Test Mode)',
    amount: 1499,
    formattedAmount: '₹1,499.00',
  }

  async function handlePayWithRazorpay() {
    setLoading(true)
    setLastError(null)
    setPaymentStatus(null)

    try {
      // 1. Ensure Checkout.js is loaded
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        throw new Error('Unable to load Razorpay Checkout SDK. Please check your internet connection.')
      }

      // 2. Call backend to create standard Razorpay Test Mode order
      const orderData = await createCheckoutOrder(product.amount)
      if (!orderData?.success || !orderData?.order_id || !orderData?.key_id) {
        throw new Error(orderData?.message || 'Failed to initialize payment order with server.')
      }

      // 3. Configure Razorpay Standard Checkout options
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'PayLens Store',
        description: product.name,
        image: stitchLogo,
        order_id: orderData.order_id,
        prefill: {
          name: 'Demo Customer',
          email: 'customer@example.com',
          contact: '+919876543210',
        },
        theme: {
          color: '#093824', // PayLens Forest Green
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setPaymentStatus('DISMISSED')
          },
        },
        handler: (response) => {
          // Payment Succeeded
          setLoading(false)
          setPaymentStatus('SUCCESS')
          setLastPaymentDetails({
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
          })
        },
      }

      const rzp = new window.Razorpay(options)

      // 4. Capture intentional payment failures from the modal
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

      // Open the Razorpay Checkout modal
      rzp.open()
    } catch (err) {
      console.error('[Checkout Error]', err)
      setLastError(err.message || 'An unexpected error occurred while opening checkout.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between items-center p-6 sm:p-10 font-['Inter',sans-serif] text-[#111827]"
      style={{ backgroundColor: '#F6F7F2' }}
    >
      {/* Navigation / Header Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-[#E5E7EB]">
        <Link to="/login" className="flex items-center gap-2 hover:opacity-90 transition">
          <img
            src={stitchLogo}
            alt="PayLens"
            className="h-9 w-auto object-contain select-none"
          />
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Razorpay Test Mode
          </span>
          <Link
            to="/dashboard"
            className="text-xs font-semibold text-[#093824] hover:underline px-2 py-1"
          >
            Go to Merchant Dashboard &rarr;
          </Link>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Card Header */}
          <div>
            <p className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase mb-1 font-['Space_Grotesk',sans-serif]">
              Customer Checkout Simulation
            </p>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight font-['Space_Grotesk',sans-serif]">
              Review &amp; Pay
            </h1>
          </div>

          {/* Product Summary Item */}
          <div className="bg-[#FAF8F4] border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-[#0F172A]">
                {product.name}
              </h2>
              <p className="text-xs text-[#64748B]">
                {product.description}
              </p>
            </div>
            <div className="text-right font-['Space_Grotesk',sans-serif]">
              <span className="text-lg font-bold text-[#093824]">
                {product.formattedAmount}
              </span>
            </div>
          </div>

          {/* Test Mode Failure Simulation Helper Note */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="font-semibold text-amber-950 mb-0.5">
                  Razorpay Test Mode Active
                </p>
                <p className="text-[11px] text-amber-800">
                  This checkout runs in Razorpay Test Mode. Use Razorpay&apos;s official test payment details to simulate a payment failure.
                </p>
              </div>
            </div>
          </div>

          {/* General Network/API Error Banner */}
          {lastError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fade-in"
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="space-y-0.5">
                <span className="font-semibold">Checkout Error</span>
                <p className="text-[11px] leading-relaxed">{lastError}</p>
              </div>
            </div>
          )}

          {/* Modal Dismissed Banner */}
          {paymentStatus === 'DISMISSED' && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-2 animate-fade-in">
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6m0-6l6 6" />
              </svg>
              <div className="space-y-0.5">
                <span className="font-semibold">Checkout window closed</span>
                <p className="text-[11px] text-slate-600">
                  Payment was cancelled before completion. You can click below to retry.
                </p>
              </div>
            </div>
          )}

          {/* Payment Failed Feedback Banner */}
          {paymentStatus === 'FAILED' && lastPaymentDetails && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-2 animate-fade-in text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-mono font-bold">
                  {lastPaymentDetails.error_code}
                </span>
                <span className="font-bold">Payment Interrupted</span>
              </div>
              <p className="text-[11px] text-red-800 leading-relaxed">
                {lastPaymentDetails.error_description}
              </p>
              <div className="pt-2 border-t border-red-200/70 text-[11px] text-red-800 flex flex-col gap-1">
                <div>
                  <span className="text-[#64748B]">Order ID: </span>
                  <span className="font-mono">{lastPaymentDetails.order_id}</span>
                </div>
                <div className="mt-1 text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <strong>✨ PayLens Integration:</strong> This payment failure event was transmitted to your webhook pipeline. Check your{' '}
                  <Link to="/dashboard" className="font-bold underline text-[#093824]">
                    PayLens Dashboard
                  </Link>{' '}
                  to view failure classification and initiate automated recovery.
                </div>
              </div>
            </div>
          )}

          {/* Payment Succeeded Banner */}
          {paymentStatus === 'SUCCESS' && lastPaymentDetails && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-fade-in text-xs">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-bold">Payment Successful</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-mono">
                Payment ID: {lastPaymentDetails.payment_id}
              </p>
            </div>
          )}

          {/* Primary Action Button */}
          <div>
            <button
              type="button"
              onClick={handlePayWithRazorpay}
              disabled={loading}
              style={{ backgroundColor: '#093824' }}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition duration-150 hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing Checkout...</span>
                </>
              ) : (
                <span>Pay with Razorpay</span>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-6 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <svg className="w-3.5 h-3.5 text-[#093824]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Secured via Razorpay Payment Gateway &amp; 256-bit SSL</span>
        </div>
        <p className="text-[11px] text-[#9CA3AF]">
          PayLens Recovery Simulation Environment &bull; Test Mode Only
        </p>
      </footer>
    </div>
  )
}
