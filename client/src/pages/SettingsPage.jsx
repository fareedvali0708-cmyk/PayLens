import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import { validateSettings } from '../lib/validation'

export default function SettingsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()

  const [businessName, setBusinessName] = useState('')
  const [razorpayKeyId, setRazorpayKeyId] = useState('')
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')

  const [showKeySecret, setShowKeySecret] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)

  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const webhookUrl = `${window.location.protocol}//${window.location.hostname}:3001/api/webhooks/razorpay`

  // Connection is active when both Key ID and Key Secret are populated
  const isConnectionActive = Boolean(
    razorpayKeyId && razorpayKeyId.trim() && razorpayKeySecret && razorpayKeySecret.trim()
  )

  useEffect(() => {
    async function loadMerchantData() {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('id, business_name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret')
          .eq('id', user.id)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setBusinessName(data.business_name || '')
          setRazorpayKeyId(data.razorpay_key_id || '')
          setRazorpayKeySecret(data.razorpay_key_secret || '')
          setWebhookSecret(data.razorpay_webhook_secret || '')
        }
      } catch (err) {
        console.error('Failed to load merchant settings:', err)
        addToast('Failed to load settings from database.', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadMerchantData()
  }, [user, addToast])

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const { errors } = validateSettings({
      businessName,
      razorpayKeyId,
      razorpayKeySecret,
      webhookSecret,
    })
    if (errors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: errors[field] }))
    } else {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!user) return

    setTouched({
      businessName: true,
      razorpayKeyId: true,
      razorpayKeySecret: true,
      webhookSecret: true,
    })

    const validation = validateSettings({
      businessName,
      razorpayKeyId,
      razorpayKeySecret,
      webhookSecret,
    })

    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      addToast('Please correct the validation errors before saving.', 'error')
      return
    }

    setFieldErrors({})
    setSaving(true)

    try {
      const payload = {
        id: user.id,
        business_name: businessName.trim(),
        razorpay_key_id: razorpayKeyId.trim() || null,
        razorpay_key_secret: razorpayKeySecret.trim() || null,
        razorpay_webhook_secret: webhookSecret.trim() || null,
      }

      const { error } = await supabase
        .from('merchants')
        .upsert(payload)

      if (error) throw error

      addToast('Settings updated successfully.', 'success')
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
    addToast('Webhook URL copied to clipboard!', 'info')
    setTimeout(() => setCopiedWebhook(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#093824] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-[#6B7280]">Loading merchant settings...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in pb-16 font-['Inter',sans-serif]">
      {/* Page Header with Real Connection Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight font-['Space_Grotesk',sans-serif]">
            Razorpay Integration &amp; Settings
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Configure your active Razorpay API credentials and automated recovery parameters.
          </p>
        </div>

        {/* Dynamic Connection Status Indicator */}
        <div className="self-start sm:self-auto">
          {isConnectionActive ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Connection Status: <strong>Active</strong></span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Connection Status: <strong>Inactive</strong> (Setup Required)</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} noValidate autoComplete="off" className="space-y-6">
        {/* Card 1: Business Profile Details */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4 shadow-xs">
          <div className="border-b border-[#F1F5F9] pb-3">
            <h2 className="text-sm font-bold text-[#0F172A] font-['Space_Grotesk',sans-serif]">
              Business Profile
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Identifies your store when recovery messages and customer payment links are issued.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="settings-business-name"
                className="block text-[11px] font-bold text-[#374151] uppercase tracking-wider mb-1.5"
              >
                Business / Store Name *
              </label>
              <input
                id="settings-business-name"
                name="business_store_name"
                type="text"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value)
                  if (fieldErrors.businessName) {
                    setFieldErrors((prev) => ({ ...prev, businessName: undefined }))
                  }
                }}
                onBlur={() => handleBlur('businessName')}
                placeholder="e.g. Acme Payments"
                aria-invalid={!!fieldErrors.businessName}
                aria-describedby={fieldErrors.businessName ? 'business-name-error' : undefined}
                className={`w-full h-10 px-3.5 rounded-lg bg-[#FAF8F4] border text-xs text-[#111827] focus:bg-white focus:outline-none focus:ring-1 transition ${fieldErrors.businessName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#CBD5E1] focus:ring-[#093824] focus:border-[#093824]'
                  }`}
              />
              {fieldErrors.businessName && (
                <p id="business-name-error" className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                  <span aria-hidden="true">&bull;</span> {fieldErrors.businessName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="settings-account-email"
                className="block text-[11px] font-bold text-[#374151] uppercase tracking-wider mb-1.5"
              >
                Account Email <span className="text-[10px] text-[#6B7280] font-normal lowercase">(read-only from auth)</span>
              </label>
              <input
                id="settings-account-email"
                name="account_registered_email"
                type="email"
                readOnly
                value={user?.email || ''}
                className="w-full h-10 px-3.5 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-xs text-[#64748B] cursor-not-allowed select-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Razorpay API Credentials */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-5 shadow-xs">
          <div className="border-b border-[#F1F5F9] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] font-['Space_Grotesk',sans-serif]">
                Razorpay API Credentials
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Required to authenticate with Razorpay and generate dynamic recovery payment links.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold uppercase rounded-md tracking-wider">
              Test Mode
            </span>
          </div>

          <div>
            <label
              htmlFor="settings-key-id"
              className="block text-[11px] font-bold text-[#374151] uppercase tracking-wider mb-1.5"
            >
              Razorpay Key ID *
            </label>
            <input
              id="settings-key-id"
              name="razorpay_api_key_id"
              type="text"
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              placeholder="rzp_test_..."
              value={razorpayKeyId}
              onChange={(e) => {
                setRazorpayKeyId(e.target.value)
                if (fieldErrors.razorpayKeyId) {
                  setFieldErrors((prev) => ({ ...prev, razorpayKeyId: undefined }))
                }
              }}
              onBlur={() => handleBlur('razorpayKeyId')}
              aria-invalid={!!fieldErrors.razorpayKeyId}
              aria-describedby={fieldErrors.razorpayKeyId ? 'key-id-error' : undefined}
              className={`w-full h-10 px-3.5 rounded-lg bg-[#FAF8F4] border text-xs font-mono text-[#111827] focus:bg-white focus:outline-none focus:ring-1 transition ${fieldErrors.razorpayKeyId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-[#CBD5E1] focus:ring-[#093824] focus:border-[#093824]'
                }`}
            />
            {fieldErrors.razorpayKeyId ? (
              <p id="key-id-error" className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                <span aria-hidden="true">&bull;</span> {fieldErrors.razorpayKeyId}
              </p>
            ) : (
              <p className="text-[11px] text-[#64748B] mt-1">
                Obtain from Razorpay Dashboard &gt; Settings &gt; API Keys. Must begin with <code className="font-mono text-[10px] bg-gray-100 px-1 py-0.5 rounded">rzp_test_</code>.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="settings-key-secret"
              className="block text-[11px] font-bold text-[#374151] uppercase tracking-wider mb-1.5"
            >
              Razorpay Key Secret *
            </label>
            <div className="relative">
              <input
                id="settings-key-secret"
                name="razorpay_api_key_secret"
                type={showKeySecret ? 'text' : 'password'}
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore="true"
                placeholder="••••••••••••••••"
                value={razorpayKeySecret}
                onChange={(e) => {
                  setRazorpayKeySecret(e.target.value)
                  if (fieldErrors.razorpayKeySecret) {
                    setFieldErrors((prev) => ({ ...prev, razorpayKeySecret: undefined }))
                  }
                }}
                onBlur={() => handleBlur('razorpayKeySecret')}
                aria-invalid={!!fieldErrors.razorpayKeySecret}
                aria-describedby={fieldErrors.razorpayKeySecret ? 'key-secret-error' : undefined}
                className={`w-full h-10 pl-3.5 pr-10 rounded-lg bg-[#FAF8F4] border text-xs font-mono text-[#111827] focus:bg-white focus:outline-none focus:ring-1 transition ${fieldErrors.razorpayKeySecret
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#CBD5E1] focus:ring-[#093824] focus:border-[#093824]'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowKeySecret(!showKeySecret)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                title={showKeySecret ? 'Hide secret' : 'Show secret'}
              >
                {showKeySecret ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.razorpayKeySecret && (
              <p id="key-secret-error" className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                <span aria-hidden="true">&bull;</span> {fieldErrors.razorpayKeySecret}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="settings-webhook-secret"
              className="block text-[11px] font-bold text-[#374151] uppercase tracking-wider mb-1.5"
            >
              Webhook Secret <span className="text-[10px] text-[#6B7280] font-normal lowercase">(optional for signature verification)</span>
            </label>
            <div className="relative">
              <input
                id="settings-webhook-secret"
                name="razorpay_api_webhook_secret"
                type={showWebhookSecret ? 'text' : 'password'}
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore="true"
                placeholder="whsec_..."
                value={webhookSecret}
                onChange={(e) => {
                  setWebhookSecret(e.target.value)
                  if (fieldErrors.webhookSecret) {
                    setFieldErrors((prev) => ({ ...prev, webhookSecret: undefined }))
                  }
                }}
                onBlur={() => handleBlur('webhookSecret')}
                aria-invalid={!!fieldErrors.webhookSecret}
                aria-describedby={fieldErrors.webhookSecret ? 'webhook-secret-error' : undefined}
                className={`w-full h-10 pl-3.5 pr-10 rounded-lg bg-[#FAF8F4] border text-xs font-mono text-[#111827] focus:bg-white focus:outline-none focus:ring-1 transition ${fieldErrors.webhookSecret
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#CBD5E1] focus:ring-[#093824] focus:border-[#093824]'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                title={showWebhookSecret ? 'Hide secret' : 'Show secret'}
              >
                {showWebhookSecret ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.webhookSecret && (
              <p id="webhook-secret-error" className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                <span aria-hidden="true">&bull;</span> {fieldErrors.webhookSecret}
              </p>
            )}
          </div>
        </div>

        {/* Card 3: Webhook Automation Destination */}
        <div className="bg-[#F0F5F2] border border-[#D1E2D8] rounded-xl p-5 shadow-2xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-[#093824] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-['Space_Grotesk',sans-serif]">
                <svg className="w-4 h-4 text-[#093824]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Webhook Listener Endpoint
              </h3>
              <p className="text-xs text-[#2D5A3D] leading-relaxed mb-3">
                Configure this URL in your Razorpay Dashboard (&gt; Settings &gt; Webhooks) subscribed to <code className="bg-white/80 px-1.5 py-0.5 rounded text-[#093824] font-mono text-[11px] border border-[#CBD5E1]">payment.failed</code> and <code className="bg-white/80 px-1.5 py-0.5 rounded text-[#093824] font-mono text-[11px] border border-[#CBD5E1]">payment_link.paid</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] text-xs font-mono text-[#0F172A] select-all truncate">
              {webhookUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-[#FAF8F4] border border-[#CBD5E1] text-xs font-semibold text-[#093824] transition shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copiedWebhook ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-[#093824]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            style={{ backgroundColor: '#093824' }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-semibold text-xs transition duration-150 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 shadow-xs cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Credentials...</span>
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
