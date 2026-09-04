import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { validateLogin, validateSignUp } from '../lib/validation'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    const validationResult = isSignUp
      ? validateSignUp({ businessName, email, password })
      : validateLogin({ email, password })

    if (!validationResult.isValid) {
      setFieldErrors(validationResult.errors)
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
          navigate('/app/overview')
        }
      } else {
        await signIn(email, password)
        navigate('/app/overview')
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
          redirectTo: `${window.location.origin}/app/overview`,
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
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', flexWrap: 'wrap', backgroundColor: '#F4F4F0', color: '#111827', fontFamily: "'Inter', sans-serif" }}>
      {/* ── Left Hero Canvas (Centered Content Container) ── */}
      <div style={{ flex: '1 1 50%', minWidth: '340px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 40px sm:48px 64px', backgroundColor: '#F4F4F0', borderRight: '1px solid #E5E7EB' }}>
        {/* Top Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#0B4F3C', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
            PL
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: '700', letterSpacing: '0.14em', color: '#0B4F3C', textTransform: 'uppercase' }}>
            PAYLENS RECOVERY CONSOLE
          </span>
        </div>

        {/* Hero Editorial Block (Centered in Left Half) */}
        <div style={{ width: '100%', maxWidth: '520px', margin: 'auto auto', padding: '36px 0' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', color: '#4B5563', textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>
            {isSignUp ? 'OPERATIONAL ONBOARDING // V4.2' : 'OPERATIONAL ACCESS // V4.2'}
          </span>

          <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: '48px', fontWeight: '400', color: '#111827', letterSpacing: '-0.02em', lineHeight: '1.08', textTransform: 'uppercase', marginBottom: '20px' }}>
            {isSignUp ? 'CREATE MERCHANT WORKSPACE.' : 'RETURN TO OPERATIONS.'}
          </h1>

          <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.6', marginBottom: '32px', maxWidth: '480px' }}>
            {isSignUp
              ? 'Set up your merchant workspace to start capturing lost payment checkout revenue in real time.'
              : 'Review failed payments, understand what needs attention, and continue recovery from where you left off.'}
          </p>

          {/* Stitch Recovery Efficiency Chart Card (Full width of centered container) */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                RECOVERY EFFICIENCY
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#065F46', backgroundColor: '#D1FAE5', border: '1px solid #A7F3D0', padding: '3px 10px', borderRadius: '9999px' }}>
                +14.2% THIS WEEK
              </span>
            </div>

            {/* 10 Progressing Green Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '56px', marginBottom: '16px' }}>
              {[18, 26, 32, 40, 48, 56, 68, 80, 90, 100].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: '3px',
                    backgroundColor: i >= 7 ? '#0B4F3C' : i >= 4 ? '#059669' : i >= 2 ? '#34D399' : '#A7F3D0',
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#6B7280', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
              <span>Active Ledgers: 1,482</span>
              <span>Synced 2m ago</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#9CA3AF', lineHeight: '1.5', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
          &copy; PayLens Financial Intelligence Inc. All rights reserved. Secured via end-to-end ledger encryption.
        </div>
      </div>

      {/* ── Right Form Canvas (Clean Floating Card Container) ── */}
      <div style={{ flex: '1 1 50%', minWidth: '340px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', backgroundColor: '#F8F9FA' }}>
        {/* Floating Authentication Card */}
        <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #E5E7EB', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)', padding: '40px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              {isSignUp ? 'Create Merchant Workspace' : 'Sign In'}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>
              {isSignUp
                ? 'Enter your merchant details to register your recovery workspace.'
                : 'Enter your credentials to access the recovery dashboard.'}
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div style={{ marginBottom: '20px', padding: '14px', borderRadius: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ shrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div style={{ marginBottom: '20px', padding: '14px', borderRadius: '12px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: '12px', fontWeight: '500' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isSignUp && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Business / Store Name *
                </label>
                <input
                  type="text"
                  placeholder="Acme Store Pvt Ltd"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '12px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', fontSize: '13px', color: '#111827', outline: 'none' }}
                />
                {fieldErrors.businessName && (
                  <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', fontWeight: '500' }}>{fieldErrors.businessName}</p>
                )}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Work Email *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '13px', color: '#9CA3AF', pointerEvents: 'none' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', height: '44px', paddingLeft: '44px', paddingRight: '14px', borderRadius: '12px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', fontSize: '13px', color: '#111827', outline: 'none' }}
                />
              </div>
              {fieldErrors.email && (
                <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', fontWeight: '500' }}>{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  Password *
                </label>
                {!isSignUp && (
                  <a href="#forgot" onClick={(e) => e.preventDefault()} style={{ fontSize: '12px', color: '#4B5563', textDecoration: 'none', fontWeight: '500' }}>
                    Forgot password?
                  </a>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '13px', color: '#9CA3AF', pointerEvents: 'none' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', height: '44px', paddingLeft: '44px', paddingRight: '44px', borderRadius: '12px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', fontSize: '13px', color: '#111827', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '12px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  aria-label="Toggle password visibility"
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.015 10.015 0 012.227-.263c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 11-4.243-4.243" />
                    ) : (
                      <>
                        <circle cx="12" cy="12" r="3" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {fieldErrors.password && (
                <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', fontWeight: '500' }}>{fieldErrors.password}</p>
              )}
            </div>

            {!isSignUp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0' }}>
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', borderRadius: '4px', accentColor: '#0B4F3C', cursor: 'pointer' }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '12px', color: '#4B5563', cursor: 'pointer' }}>
                  Keep me signed in for 30 days
                </label>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', height: '46px', borderRadius: '12px', backgroundColor: '#0B4F3C', color: '#ffffff', fontWeight: '600', fontSize: '13px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(11, 79, 60, 0.2)' }}
              >
                {loading ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <span>{isSignUp ? 'Create Merchant Account →' : 'Sign In →'}</span>
                )}
              </button>

              {/* Clean Horizontal Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
                <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                style={{ width: '100%', height: '46px', borderRadius: '12px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                {googleLoading ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid #0B4F3C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24">
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

          <div style={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', paddingTop: '8px' }}>
            {isSignUp ? 'Already have an account?' : 'New to PayLens?'}{' '}
            <button
              type="button"
              onClick={toggleAuthMode}
              style={{ fontWeight: '700', color: '#111827', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              {isSignUp ? 'Sign in to existing account' : 'Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
