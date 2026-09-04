import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col md:grid md:grid-cols-[260px_minmax(0,1fr)] min-h-screen w-full bg-[#F8F9FA]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-5 py-3.5 bg-[#EFEFEA] border-b border-stone-300/60 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#0B4F3C] text-white flex items-center justify-center font-bold text-xs shrink-0">
            PL
          </div>
          <div className="min-w-0">
            <span className="block text-stone-900 font-bold text-base tracking-tight leading-none">
              PayLens
            </span>
            <span className="block text-[9px] text-stone-500 font-mono tracking-[0.14em] uppercase font-semibold mt-1">
              RECOVERY CONSOLE
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-lg text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 transition cursor-pointer"
          aria-label="Open navigation menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Sidebar Navigation */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area - Generous 40px+ left spacing from sidebar divider line */}
      <main className="flex-1 min-w-0 w-full min-h-screen py-8 pl-10 pr-6 sm:pl-14 sm:pr-10 lg:pl-16 lg:pr-12 flex justify-center">
        <div className="w-full max-w-[1536px] mx-auto space-y-8 min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}