import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#F3F2EB]" style={{ backgroundColor: '#F3F2EB' }}>
      {/* Mobile Top Header */}
      <header
        className="md:hidden flex items-center justify-between px-5 py-3.5 border-b border-white/10 sticky top-0 z-30 shrink-0"
        style={{ backgroundColor: '#092D1B' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/15">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-white font-['Space_Grotesk',sans-serif] text-base font-bold tracking-tight">
            PayLens
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          aria-label="Open navigation menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Responsive Sidebar Drawer */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main
        className="flex-1 min-w-0 w-full min-h-screen box-border overflow-x-clip pt-6 sm:pt-7 pb-8 bg-[#F3F2EB]"
        style={{ backgroundColor: '#F3F2EB', overflowX: 'clip' }}
      >
        <div
          className="w-full max-w-[1360px] mx-auto min-w-0 box-border px-[28px]"
          style={{ maxWidth: '1360px', paddingLeft: '28px', paddingRight: '28px' }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
