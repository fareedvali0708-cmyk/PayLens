import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { getSettings, updateSettings } from '../lib/api'
import { validateSettings } from '../lib/validation'

export default function SettingsPage() {
  const { user, session, signOut } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [businessName, setBusinessName] = useState('')
  const [razorpayKeyId, setRazorpayKeyId] = useState('')
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')

  const [showKeySecret, setShowKeySecret] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)

  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const webhookUrl = `${window.location.protocol}//${window.location.hostname}:3001/api/webhooks/razorpay`

  const isConnectionActive = Boolean(
    razorpayKeyId && razorpayKeyId.trim() && razorpayKeySecret && razorpayKeySecret.trim()
  )

  useEffect(() => {
    async function loadMerchantData() {
      if (!session?.access_token) return
      try {
        const res = await getSettings(session.access_token)
        if (res?.settings) {
          setBusinessName(res.settings.business_name || '')
          setRazorpayKeyId(res.settings.razorpay_key_id || '')
          setRazorpayKeySecret(res.settings.razorpay_key_secret || '')
          setWebhookSecret(res.settings.razorpay_webhook_secret || '')
        }
      } catch (err) {
        console.error('Failed to load merchant settings:', err)
        addToast(err.message || 'Failed to load settings from database.', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadMerchantData()
  }, [session, addToast])

  async function handleSave(e) {
    e.preventDefault()
    if (!session?.access_token) return

    const validation = validateSettings({
      businessName,
      razorpayKeyId,
      razorpayKeySecret,
      webhookSecret,
    })

    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      addToast('Please correct validation errors before saving.', 'error')
      return
    }

    setFieldErrors({})
    setSaving(true)

    try {
      const payload = {
        business_name: businessName.trim(),
        razorpay_key_id: razorpayKeyId.trim() || null,
        razorpay_key_secret: razorpayKeySecret.trim() || null,
        razorpay_webhook_secret: webhookSecret.trim() || null,
      }

      const res = await updateSettings(session.access_token, payload)
      if (res?.settings) {
        setBusinessName(res.settings.business_name || '')
        setRazorpayKeyId(res.settings.razorpay_key_id || '')
        setRazorpayKeySecret(res.settings.razorpay_key_secret || '')
        setWebhookSecret(res.settings.razorpay_webhook_secret || '')
      }

      addToast('Merchant credentials updated successfully.', 'success')
    } catch (err) {
      console.error('Failed to update settings:', err)
      addToast(err.message || 'Failed to save merchant credentials.', 'error')
    } finally {
      setSaving(false)
    }
  }

  function handleCopyWebhook() {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedWebhook(true)
    addToast('Webhook URL copied to clipboard!', 'success')
    setTimeout(() => setCopiedWebhook(false), 2000)
  }

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-[3px] border-[#0B4F3C] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-wider text-stone-600 font-semibold">
          Loading Merchant Settings...
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '24px' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
        <div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
            MERCHANT CONFIGURATION // V4.2
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>
            Settings & API Credentials
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', margin: 0 }}>
            Manage your Razorpay API keys, webhooks, and merchant organization details.
          </p>
        </div>

        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: '700',
              backgroundColor: isConnectionActive ? '#ECFDF5' : '#FEF3C7',
              color: isConnectionActive ? '#065F46' : '#92400E',
              border: isConnectionActive ? '1px solid #A7F3D0' : '1px solid #FDE68A',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isConnectionActive ? '#059669' : '#D97706',
              }}
            />
            {isConnectionActive ? 'RAZORPAY CONNECTED' : 'KEYS REQUIRED'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 2. Merchant Profile */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid #F3F4F6', marginBottom: '24px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
              01 // ORGANIZATIONAL PROFILE
            </span>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
              Merchant Information
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Business / Store Name *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Acme Merchant Solutions"
                style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', border: '1px solid #D1D5DB', backgroundColor: '#ffffff', fontSize: '13px', color: '#111827', outline: 'none' }}
              />
              {fieldErrors.businessName && (
                <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', fontWeight: '500' }}>{fieldErrors.businessName}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Account Email (Read-Only)
              </label>
              <input
                type="email"
                readOnly
                value={user?.email || ''}
                style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '13px', color: '#6B7280', fontFamily: "'JetBrains Mono', monospace", cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </div>

        {/* 3. Razorpay API Credentials */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid #F3F4F6', marginBottom: '24px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
              02 // PAYMENT GATEWAY CREDENTIALS
            </span>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
              Razorpay API Setup (Test Mode)
            </h2>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              Used to issue single-click payment recovery links directly on behalf of your store.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Razorpay Key ID *
              </label>
              <input
                type="text"
                placeholder="rzp_test_..."
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', border: '1px solid #D1D5DB', backgroundColor: '#ffffff', fontSize: '13px', color: '#111827', fontFamily: "'JetBrains Mono', monospace", outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Razorpay Key Secret * (Masked)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showKeySecret ? 'text' : 'password'}
                  placeholder="••••••••••••••••"
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  style={{ width: '100%', height: '44px', paddingLeft: '16px', paddingRight: '56px', borderRadius: '12px', border: '1px solid #D1D5DB', backgroundColor: '#ffffff', fontSize: '13px', color: '#111827', fontFamily: "'JetBrains Mono', monospace", outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowKeySecret(!showKeySecret)}
                  style={{ position: 'absolute', right: '14px', top: '13px', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showKeySecret ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
          </div>

          {/* Webhook Secret */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Webhook Secret (Optional Signature Verification)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showWebhookSecret ? 'text' : 'password'}
                placeholder="whsec_..."
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                style={{ width: '100%', height: '44px', paddingLeft: '16px', paddingRight: '56px', borderRadius: '12px', border: '1px solid #D1D5DB', backgroundColor: '#ffffff', fontSize: '13px', color: '#111827', fontFamily: "'JetBrains Mono', monospace", outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                style={{ position: 'absolute', right: '14px', top: '13px', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showWebhookSecret ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {/* Webhook Listener Endpoint Banner */}
          <div style={{ backgroundColor: '#E6F4F1', border: '1px solid rgba(11, 79, 60, 0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0B4F3C' }} />
              <h3 style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: '#0B4F3C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                Webhook Listener Endpoint
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: '#4B5563', lineHeight: '1.6', margin: '0 0 16px 0' }}>
              Add this URL to your Razorpay Dashboard (&gt; Settings &gt; Webhooks) subscribed to <code style={{ fontFamily: "'JetBrains Mono', monospace", backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #D1D5DB', color: '#0B4F3C', fontWeight: '700' }}>payment.failed</code> and <code style={{ fontFamily: "'JetBrains Mono', monospace", backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #D1D5DB', color: '#0B4F3C', fontWeight: '700' }}>payment_link.paid</code>.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: '1 1 280px', backgroundColor: '#ffffff', border: '1px solid #D1D5DB', borderRadius: '12px', padding: '12px 16px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {webhookUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyWebhook}
                style={{
                  height: '42px',
                  padding: '0 24px',
                  borderRadius: '9999px',
                  backgroundColor: '#0B4F3C',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(11, 79, 60, 0.2)',
                  whiteSpace: 'nowrap',
                }}
              >
                {copiedWebhook ? 'Copied!' : 'Copy Webhook URL'}
              </button>
            </div>
          </div>

          {/* Dedicated Save Merchant Settings Bar (Completely separate from Webhook box!) */}
          <div style={{ paddingTop: '20px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                height: '46px',
                padding: '0 28px',
                borderRadius: '9999px',
                backgroundColor: '#0B4F3C',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(11, 79, 60, 0.25)',
              }}
            >
              {saving ? 'Saving Settings...' : 'Save Merchant Settings'}
            </button>
          </div>
        </div>
      </form>

      {/* 4. Security & Sign Out */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
              03 // SECURITY & SESSION
            </span>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
              Sign Out Account
            </h2>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              End active merchant session on this workstation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
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
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}