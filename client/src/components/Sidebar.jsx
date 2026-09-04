import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar({ isOpen = false, onClose = () => { } }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredKey, setHoveredKey] = useState(null)

  async function handleSignOut() {
    try {
      await signOut()
      onClose()
      navigate('/login')
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }

  const isOverviewActive =
    location.pathname === '/app/overview' ||
    (location.pathname === '/dashboard' && !location.search)
  const isRecoveryActive =
    location.pathname === '/app/recovery' || location.pathname === '/recovery'
  const isAnalyticsActive =
    location.pathname === '/app/analytics' || location.pathname === '/analytics'
  const isSettingsActive =
    location.pathname === '/app/settings' || location.pathname === '/settings'

  const navItems = [
    {
      key: 'overview',
      label: 'Overview',
      to: '/app/overview',
      end: true,
      active: isOverviewActive,
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      key: 'recovery',
      label: 'Recovery',
      to: '/app/recovery',
      active: isRecoveryActive,
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      ),
    },
    {
      key: 'analytics',
      label: 'Analytics',
      to: '/app/analytics',
      active: isAnalyticsActive,
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      key: 'settings',
      label: 'Settings',
      to: '/app/settings',
      active: isSettingsActive,
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          bottom: 0,
          height: '100vh',
          width: '260px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          backgroundColor: '#F3F4F1',
          borderRight: '1px solid #E2E8F0',
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.02)',
          transition: 'transform 300ms ease-in-out',
          overflow: 'hidden',
        }}
        aria-label="Merchant Navigation Sidebar"
      >
        {/* Brand Header with Generous Spacing */}
        <div
          style={{
            padding: '28px 24px 22px 24px',
            borderBottom: '1px solid rgba(209, 213, 219, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Logo Badge */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0B4F3C 0%, #053326 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: '700',
              fontSize: '16px',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(11, 79, 60, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
            role="img"
            aria-label="PayLens Logo"
          >
            PL
          </div>

          {/* Title & Subtitle block */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <span
              style={{
                display: 'block',
                color: '#111827',
                fontWeight: '800',
                fontSize: '20px',
                letterSpacing: '-0.03em',
                lineHeight: '1.1',
              }}
            >
              PayLens
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '10px',
                color: '#6B7280',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: '700',
                marginTop: '4px',
              }}
            >
              RECOVERY CONSOLE
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'none',
              padding: '6px',
              borderRadius: '8px',
              color: '#6B7280',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Close sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Primary Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const isHovered = hoveredKey === item.key
            const isActive = item.active

            return (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.end}
                onClick={onClose}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
                style={{
                  height: '46px',
                  borderRadius: '12px',
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '600',
                  textDecoration: 'none',
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  backgroundColor: isActive
                    ? '#0B4F3C'
                    : isHovered
                    ? '#E2E4DE'
                    : 'transparent',
                  backgroundImage: isActive
                    ? 'linear-gradient(135deg, #0B4F3C 0%, #073D2E 100%)'
                    : 'none',
                  color: isActive ? '#ffffff' : isHovered ? '#111827' : '#374151',
                  boxShadow: isActive ? '0 6px 16px rgba(11, 79, 60, 0.28)' : 'none',
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: isActive ? '#ffffff' : isHovered ? '#0B4F3C' : '#6B7280',
                    transition: 'all 150ms ease',
                    transform: isHovered && !isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    transition: 'transform 150ms ease',
                    transform: isHovered && !isActive ? 'translateX(3px)' : 'none',
                  }}
                >
                  {item.label}
                </span>

                {isActive && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#34D399',
                      boxShadow: '0 0 8px #34D399',
                    }}
                  />
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Sandbox Test Mode Callout Pill */}
        <div style={{ padding: '0 16px', marginBottom: '16px' }}>
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
              <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                SANDBOX SIMULATOR
              </span>
            </div>
            <NavLink
              to="/checkout"
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#0B4F3C',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 2px 4px rgba(11, 79, 60, 0.2)',
              }}
            >
              Test Checkout Simulator &rarr;
            </NavLink>
          </div>
        </div>

        {/* Account Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(209, 213, 219, 0.7)', backgroundColor: 'rgba(226, 228, 222, 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(11, 79, 60, 0.12)', color: '#0B4F3C', border: '1px solid rgba(11, 79, 60, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
              {user?.email?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || 'Merchant Account'}
              </p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#065F46', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} />
                Active Session
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #D1D5DB',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'all 150ms ease',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  )
}