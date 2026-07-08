// src/components/layout/DashboardLayout.jsx
// Aurora Design System — Dashboard shell (navbar + sidebar + content)
// Uses layout dimension tokens from index.css.
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)]">
      <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[var(--color-surface-scrim)] z-40 backdrop-blur-[2px] md:hidden"
          style={{ top: 'var(--layout-navbar-height)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex" style={{ paddingTop: 'var(--layout-navbar-height)' }}>
        <Sidebar isOpen={sidebarOpen} />
        <main
          className="flex-1 ml-0 md:ml-[var(--layout-sidebar-width)] overflow-x-hidden"
          style={{
            padding: ['/dashboard/map', '/dashboard/copilot'].includes(location.pathname) ? '0' : 'var(--spacing-8)',
            minHeight: 'calc(100vh - var(--layout-navbar-height))',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
