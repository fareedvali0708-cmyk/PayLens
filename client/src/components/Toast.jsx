import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm4.293 7.707l-5 5a1 1 0 01-1.414 0l-2.5-2.5a1 1 0 011.414-1.414L8.586 10.586l4.293-4.293a1 1 0 011.414 1.414z" fill="#16a34a"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 14a1 1 0 11-2 0v-1a1 1 0 112 0v1zm0-4a1 1 0 11-2 0V6a1 1 0 112 0v4z" fill="#dc2626"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 15a1 1 0 11-2 0V9a1 1 0 112 0v6zm-1-8a1.25 1.25 0 110-2.5A1.25 1.25 0 0110 7z" fill="#2563eb"/>
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 14a1 1 0 11-2 0v-1a1 1 0 112 0v1zm0-4a1 1 0 11-2 0V6a1 1 0 112 0v4z" fill="#d97706"/>
    </svg>
  ),
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{ animation: 'toast-in 0.3s ease-out both' }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-surface rounded-lg border border-border shadow-lg max-w-sm"
          >
            <span className="shrink-0">{ICONS[toast.type]}</span>
            <p className="text-sm text-text leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 ml-2 text-text-muted hover:text-text transition-colors"
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
