// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, logout } from '@/features/auth/authSlice'
import {
  LayoutDashboard, Map, Compass, Briefcase,
  Receipt, BarChart3, CreditCard, Bell, User, MapPin,
  Users, MessageSquare, Terminal, LogOut
} from 'lucide-react'

const navItems = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard',    to: '/dashboard' },
  { icon: <Map size={18} />,             label: 'Plan a Trip',  to: '/dashboard/planner' },
  { icon: <Compass size={18} />,         label: 'Discover',     to: '/dashboard/discover' },
  { icon: <Briefcase size={18} />,       label: 'My Trips',     to: '/dashboard/trips' },
  { icon: <MapPin size={18} />,          label: 'Explore Map',  to: '/dashboard/map' },
  { icon: <Receipt size={18} />,         label: 'Expenses',     to: '/dashboard/expenses' },
  { icon: <BarChart3 size={18} />,       label: 'Analytics',    to: '/dashboard/analytics' },
  { icon: <CreditCard size={18} />,      label: 'Subscription', to: '/dashboard/subscription' },
  { icon: <Bell size={18} />,            label: 'Notifications',to: '/dashboard/notifications' },
  { icon: <User size={18} />,            label: 'Profile',      to: '/dashboard/profile' },
]

const adminNavItems = [
  { icon: <LayoutDashboard size={18} />, label: 'Overview',     to: '/dashboard/admin' },
  { icon: <Users size={18} />,           label: 'Users',        to: '/dashboard/admin/users' },
  { icon: <MessageSquare size={18} />,   label: 'Reviews',      to: '/dashboard/admin/reviews' },
  { icon: <MapPin size={18} />,          label: 'Destinations', to: '/dashboard/admin/destinations' },
  { icon: <Terminal size={18} />,        label: 'Audit Logs',   to: '/dashboard/admin/reports' },
]

export default function Sidebar({ isOpen = false }) {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/auth/login')
  }

  return (
    <aside
      className={`dashboard-sidebar${isOpen ? ' sidebar-open' : ''}`}
      style={{
        width: 240,
        flexShrink: 0,
        position: 'fixed',
        top: 64,
        left: 0,
        bottom: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
        padding: '1.25rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.125rem',
      }}
    >
      <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 0.875rem', marginBottom: '0.5rem' }}>
        Navigation
      </p>
      {navItems.map(({ icon, label, to }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/dashboard'}
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        >
          <span style={{ flexShrink: 0 }}>{icon}</span>
          {label}
        </NavLink>
      ))}

      {isAdmin && (
        <>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 0.875rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            Admin Console
          </p>
          {adminNavItems.map(({ icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard/admin'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span style={{ flexShrink: 0 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </>
      )}

      {/* Logout Action Button at the bottom of sidebar */}
      <button
        onClick={handleLogout}
        className="sidebar-link"
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 0.875rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--color-accent-red)',
          background: 'transparent',
          border: '1px solid transparent',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          transition: 'all var(--transition-fast)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
        }}
      >
        <span style={{ display: 'inline-flex', flexShrink: 0 }}><LogOut size={18} /></span>
        Logout
      </button>
    </aside>
  )
}
