import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { validateSignUp } from '../lib/validation'
import { supabase } from '../lib/supabase'

export default function SignupPage() {
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    // Base validation
    const validationResult = validateSignUp({ businessName, email, password })
    const errors = { ...validationResult.errors }

    // Confirm password check
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setLoading(true)

    try {
      const res = await signUp(email, password, businessName)
      if (res?.user && !res?.session) {
        setMessage('Registration successful! Please check your email inbox to confirm your account.')
      } else {
        navigate('/app/overview')
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError(null)
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app/overview`,
        },
      })
      if (oauthError) throw oauthError
    } catch (err) {
      setError(err.message || 'Failed to initiate Google authentication.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8F9FA] text-gray-900 font-sans">
      {/* ── Left Pane: Form Canvas ── */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-8 sm:p-14 lg:p-16 relative">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#004D40] text-white flex items-center justify-center font-bold text-xs">
            PL
          </div>
          <span className="font-bold text-gray-900 tracking-tight text-base">
            PayLens
          </span>
          <span className="eyebrow-tag ml-2 px-2 py-0.5 rounded bg-[#E6F4F1] text-[#004D40] border border-[#004D40]/15">
            ONBOARDING // STITCH V4.2
          </span>
        </div>

        {/* Center Form Block */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          <span className="eyebrow-tag block mb-2 text-[#004D40]">
            MERCHANT REGISTRATION // V4.2
          </span>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
            Create Merchant Workspace
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed mb-6">
            Set up your store account to start capturing lost payment checkout revenue in real time.
          </p>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" strokeWidth="2" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold leading-relaxed flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            <div>
              <label htmlFor="signup-business-name" className="block text-xs font-semibold text-gray-700 mb-1">
                Business / Store Name *
              </label>
              <input
                id="signup-business-name"
                type="text"
                placeholder="Acme Merchant Solutions"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004D40]/20 focus:border-[#004D40]"
              />
              {fieldErrors.businessName && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.businessName}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-gray-700 mb-1">
                Work Email Address *
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="merchant@paylens.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004D40]/20 focus:border-[#004D40]"
              />
              {fieldErrors.email && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs font-semibold text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-12 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004D40]/20 focus:border-[#004D40]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-gray-500 hover:text-gray-900 font-mono"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-12 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004D40]/20 focus:border-[#004D40]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-xs text-gray-500 hover:text-gray-900 font-mono"
                >
                  {showConfirmPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-2 space-y-3">
              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-[#004D40] hover:bg-[#022C22] text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Create Merchant Workspace →</span>
                )}
              </button>

              {/* Secondary Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full h-10 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold text-xs hover:bg-gray-50 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-[#004D40] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#004D40] underline hover:text-[#022C22]">
              Sign in to existing workspace
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-gray-400 font-mono">
          256-bit TLS Encryption &bull; Supabase Auth Engine &bull; PayLens V4.2
        </div>
      </div>

      {/* ── Right Pane: Editorial Hero Canvas (#004D40) ── */}
      <div className="w-full lg:w-1/2 min-h-[480px] lg:min-h-screen bg-gradient-to-br from-[#022C22] to-[#004D40] text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10">
          <span className="eyebrow-tag text-emerald-300 bg-white/10 px-2.5 py-1 rounded border border-white/15">
            ZERO-LOSS RECOVERY GUARANTEE
          </span>
        </div>

        <div className="relative z-10 max-w-lg my-auto py-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-white mb-4">
            Recover Lost Revenue on Autopilot.
          </h2>
          <p className="text-sm text-emerald-100/80 leading-relaxed mb-8">
            Join top Razorpay merchants recovering 30%+ of failed checkouts with automated Gemini AI root cause diagnosis and instant recovery links.
          </p>

          {/* Testimonial Quote Block from Stitch */}
          <div className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs space-y-3">
            <p className="text-xs italic text-emerald-100 leading-relaxed">
              &ldquo;PayLens intercepted ₹1.64L of high-risk payment drop-offs in our first 14 days and recovered ₹55,979 automatically without manual intervention.&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-white/15">
              <div className="w-8 h-8 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold text-xs">
                AE
              </div>
              <div>
                <p className="text-xs font-bold text-white">Director of Growth</p>
                <p className="text-[11px] text-emerald-300/80 font-mono">Acme Ecommerce Merchant</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs font-mono text-emerald-300/70">
          ● AUTOMATED RECOVERY ENGINE V4.2
        </div>
      </div>
    </div>
  )
}
