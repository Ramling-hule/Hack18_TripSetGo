// src/components/layout/Sidebar.jsx
// Aurora Design System — Dashboard sidebar navigation
// Active: indigo.dim bg + indigo.400 text + 3px left border
// Per Aurora Section 9: Navigation Item (Sidebar)
import {
  LayoutDashboard, Map, Compass, Briefcase,
  Receipt, BarChart3, CreditCard, Bell, User, MapPin,
  Users, MessageSquare, Terminal, LogOut, Globe, Sparkles
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, logout } from '@/features/auth/authSlice'

const navItems = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard',    to: '/dashboard' },
  { icon: <Map size={18} />,             label: 'Plan a Trip',  to: '/dashboard/planner' },
  { icon: <Sparkles size={18} />,        label: 'AI Copilot',   to: '/dashboard/copilot' },
  { icon: <Compass size={18} />,         label: 'Discover',     to: '/dashboard/discover' },
  { icon: <Globe size={18} />,           label: 'Explore Hub',  to: '/dashboard/explore' },
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

function NavItem({ icon, label, to, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'shrink-0 flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] no-underline',
          'text-[var(--font-size-body-sm)] border-l-3 border-transparent',
          'transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]',
          isActive
            ? 'font-semibold text-[var(--color-indigo-400)] bg-[var(--color-indigo-dim)] border-l-[var(--color-indigo-400)]'
            : 'font-normal text-[var(--color-text-secondary)] bg-transparent hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',
        ].join(' ')
      }
    >
      <span className={`shrink-0 inline-flex`}>{icon}</span>
      {label}
    </NavLink>
  )
}

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
      className={`
        w-[var(--layout-sidebar-width)] min-w-[var(--layout-sidebar-width)] flex-shrink-0
        fixed top-[var(--layout-navbar-height)] left-0 bottom-0
        overflow-y-auto overflow-x-hidden
        bg-[var(--color-surface-default)]
        border-r border-solid border-[var(--color-border-subtle)]
        p-[1rem_0.75rem]
        flex flex-col gap-0.5
        transition-transform duration-[var(--duration-slow)] ease-[var(--easing-standard)]
        z-50
        md:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-[var(--shadow-lg)]' : '-translate-x-full'}
      `}
    >
      {/* Nav section label */}
      <p className="text-section-label shrink-0 px-3.5 mb-2 mt-1">
        Navigation
      </p>

      {navItems.map(({ icon, label, to }) => (
        <NavItem key={to} icon={icon} label={label} to={to} end={to === '/dashboard'} />
      ))}

      {/* Admin section */}
      {isAdmin && (
        <>
          <p className="text-section-label shrink-0 px-3.5 mt-6 mb-2">
            Admin Console
          </p>
          {adminNavItems.map(({ icon, label, to }) => (
            <NavItem key={to} icon={icon} label={label} to={to} end={to === '/dashboard/admin'} />
          ))}
        </>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className={`
          shrink-0 flex items-center gap-3 px-3.5 py-2.5
          rounded-[var(--radius-md)]
          text-[var(--font-size-body-sm)] font-medium
          text-[var(--color-rose-500)]
          bg-transparent border-none cursor-pointer w-full mt-auto
          transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]
          hover:bg-[var(--color-rose-dim)]
        `}
      >
        <span className="inline-flex shrink-0"><LogOut size={18} /></span>
        Logout
      </button>
    </aside>
  )
}
