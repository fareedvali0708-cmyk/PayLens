import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { validateLogin, validateSignUp } from '../lib/validation'
import { supabase } from '../lib/supabase'
import resilienceGraphic from '../assets/payment-resilience-graphic.png'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')

  // Form field validation state
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})

  // General server/auth error or message
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (isSignUp) {
      const { errors } = validateSignUp({ businessName, email, password })
      setFieldErrors((prev) => ({ ...prev, [field]: errors[field] }))
    } else {
      const { errors } = validateLogin({ email, password })
      setFieldErrors((prev) => ({ ...prev, [field]: errors[field] }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    const validationResult = isSignUp
      ? validateSignUp({ businessName, email, password })
      : validateLogin({ email, password })

    if (!validationResult.isValid) {
      setFieldErrors(validationResult.errors)
      setTouched(isSignUp ? { businessName: true, email: true, password: true } : { email: true, password: true })
      return
    }

    setFieldErrors({})
    setLoading(true)

    try {
      if (isSignUp) {
        const res = await signUp(email, password, businessName)
        if (res?.user && !res?.session) {
          setMessage('Account created! Please check your email to confirm registration.')
        } else {
          navigate('/dashboard')
        }
      } else {
        await signIn(email, password)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
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
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (oauthError) throw oauthError
    } catch (err) {
      setError(err.message || 'Failed to initiate Google authentication.')
      setGoogleLoading(false)
    }
  }

  function toggleAuthMode() {
    setIsSignUp(!isSignUp)
    setError(null)
    setMessage(null)
    setFieldErrors({})
    setTouched({})
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-['Inter',sans-serif] text-[#111827]">
      {/* Left Column: Form Area (Warm Cream Canvas) */}
      <div
        className="w-full lg:w-1/2 min-h-screen flex flex-col justify-center items-center px-8 sm:px-14 lg:px-20 py-12 relative"
        style={{ backgroundColor: '#F5F6EE' }}
      >
        <div className="w-full max-w-[430px] flex flex-col justify-center animate-fade-in">
          {/* PayLens Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6 6H20C23.3137 6 26 8.68629 26 12C26 15.3137 23.3137 18 20 18H12V26H6V6Z"
                fill="#1E3A8A"
              />
              <path
                d="M12 12H19C20.1046 12 21 12.8954 21 14C21 15.1046 20.1046 16 19 16H12V12Z"
                fill="#3B82F6"
              />
            </svg>
            <span className="font-['Space_Grotesk',sans-serif] text-2xl font-bold text-[#0F172A] tracking-tight">
              PayLens
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight leading-[1.18] mb-3 font-['Space_Grotesk',sans-serif]">
            {isSignUp ? (
              <>
                Register Your Merchant
                <br />
                Account
              </>
            ) : (
              <>
                Recover Failed Checkouts
                <br />
                Automatically
              </>
            )}
          </h1>

          {/* Subtext */}
          <p className="text-sm text-[#4B5563] leading-relaxed mb-8">
            {isSignUp
              ? 'Set up your merchant workspace to start capturing lost revenue and automated recovery.'
              : 'Log in to your merchant console to inspect real-time failure diagnostics and trigger high-converting recovery links.'}
          </p>

          {/* Error & Message Banners */}
          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fade-in"
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {message && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fade-in"
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="leading-snug">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Store / Business Name (Sign Up only) */}
            {isSignUp && (
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                >
                  Business / Store Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  placeholder="Acme Payments"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value)
                    if (fieldErrors.businessName) {
                      setFieldErrors((prev) => ({ ...prev, businessName: undefined }))
                    }
                  }}
                  onBlur={() => handleBlur('businessName')}
                  className={`w-full h-11 px-3.5 rounded-lg bg-white border text-sm text-[#0F172A] placeholder-[#9CA3AF] transition focus:outline-none focus:ring-1 ${fieldErrors.businessName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[#CBD5E1] focus:ring-[#135238] focus:border-[#135238]'
                    }`}
                />
                {fieldErrors.businessName && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.businessName}</p>
                )}
              </div>
            )}

            {/* Work Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#1F2937] mb-1.5"
              >
                Work Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="test@paylens.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }
                }}
                onBlur={() => handleBlur('email')}
                className={`w-full h-11 px-3.5 rounded-lg bg-white border text-sm text-[#0F172A] placeholder-[#9CA3AF] transition focus:outline-none focus:ring-1 ${fieldErrors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#CBD5E1] focus:ring-[#135238] focus:border-[#135238]'
                  }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#1F2937] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }))
                  }
                }}
                onBlur={() => handleBlur('password')}
                className={`w-full h-11 px-3.5 rounded-lg bg-white border text-sm text-[#0F172A] placeholder-[#94A3B8] transition focus:outline-none focus:ring-1 ${fieldErrors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#CBD5E1] focus:ring-[#135238] focus:border-[#135238]'
                  }`}
              />
              <span className="block text-xs text-[#6B7280] mt-1.5">Min. 6 characters</span>
              {fieldErrors.password && (
                <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Action Buttons Section with strict 16-20px top margin and 10-14px internal spacing */}
            <div className="pt-4 flex flex-col gap-3">
              {/* Primary Action Button (Sign In) */}
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#135238' }}
                className="w-full h-11 px-4 rounded-lg text-white font-semibold text-sm transition duration-150 ease-out hover:opacity-95 hover:shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{isSignUp ? 'Create Merchant Account' : 'Sign In'}</span>
                )}
              </button>

              {/* Secondary Action Button (Google) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full h-11 px-4 rounded-lg bg-white border border-[#CBD5E1] text-[#1F2937] font-medium text-sm hover:bg-[#F9FAFB] hover:border-[#94A3B8] active:scale-[0.99] transition duration-150 ease-out flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-[#135238] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Signup text with 16-20px spacing from Google button */}
            <div className="mt-5 text-center">
              <p className="text-xs sm:text-sm text-[#4B5563]">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="font-medium text-[#135238] underline hover:text-[#093824] transition-colors cursor-pointer ml-1 inline-block"
                >
                  {isSignUp ? 'Sign in to existing account' : 'Register a new merchant account'}
                </button>
              </p>
            </div>
          </form>

          {/* Security Note with 8-12px spacing from signup text */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-[#6B7280]">
            <svg className="w-3.5 h-3.5 text-[#135238] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secured via <span className="underline">Supabase Auth</span> &amp; 256-bit TLS</span>
          </div>
        </div>
      </div>

      {/* Right Column: Deep Green Illustration Panel */}
      <div
        className="w-full lg:w-1/2 min-h-[480px] lg:min-h-screen flex flex-col items-center justify-center p-8 lg:p-16 text-center text-white"
        style={{ backgroundColor: '#133D29' }}
      >
        <div className="max-w-md mx-auto flex flex-col items-center justify-center">
          {/* Isometric Graphic */}
          <div className="mb-6 w-full max-w-[320px] sm:max-w-[360px] flex items-center justify-center">
            <img
              src={resilienceGraphic}
              alt="Zero-Loss Payment Resilience Architecture"
              className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-xl"
            />
          </div>

          {/* Heading */}
          <h2
            style={{ color: '#ffffff' }}
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 font-['Space_Grotesk',sans-serif] text-white"
          >
            Zero-Loss Payment Resilience
          </h2>

          {/* Body */}
          <p className="text-sm text-white/80 leading-relaxed max-w-[400px] mx-auto">
            PayLens intercepts failed Razorpay checkout events in real time, classifies failure root causes using Google Gemini, and triggers personalized payment recovery links to protect merchant GMV.
          </p>
        </div>
      </div>
    </div>
  )
}
