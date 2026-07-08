// src/components/layout/Navbar.jsx
// Aurora Design System — Top navigation bar
// Variants:
//   'dashboard' (default) — fixed glass surface, always visible. Used by DashboardLayout.
//   'landing'             — transparent at scroll 0, transitions to glass past 80px.
//                           CTA label changes to 'Start Planning Free'.
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Menu, User, LogOut } from 'lucide-react'
import Avatar from '@/components/common/Avatar'
import IconButton from '@/components/common/IconButton'
import Dropdown from '@/components/common/Dropdown'
import { selectUser, selectIsAuthenticated, logout } from '@/features/auth/authSlice'
import { useScrollPosition } from '@/hooks/useScrollPosition'

export default function Navbar({ onMenuClick, variant = 'dashboard' }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectUser)
  const isAuth    = useSelector(selectIsAuthenticated)
  const isLanding = variant === 'landing'

  const { isPastThreshold } = useScrollPosition({ enabled: isLanding, threshold: 80 })

  const handleLogout = async () => {
    setDropOpen(false)
    await dispatch(logout())
    navigate('/auth/login')
  }

  const userMenuItems = [
    {
      icon: <User size={15} />,
      label: 'Profile',
      onClick: () => navigate('/dashboard/profile'),
    },
    { divider: true },
    {
      icon: <LogOut size={15} />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ]

  const navBackground = isLanding
    ? isPastThreshold
      ? 'rgba(14, 17, 23, 0.92)'
      : 'transparent'
    : 'rgba(14, 17, 23, 0.88)'

  const navBorderColor = isLanding
    ? isPastThreshold
      ? 'var(--color-border-subtle)'
      : 'transparent'
    : 'var(--color-border-subtle)'

  const navBackdrop = isLanding
    ? isPastThreshold ? 'blur(16px)' : 'none'
    : 'blur(16px)'

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        height: 'var(--layout-navbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        background: navBackground,
        backdropFilter: navBackdrop,
        WebkitBackdropFilter: navBackdrop,
        borderBottom: `1px solid ${navBorderColor}`,
        transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      {onMenuClick && (
        <div className="md:hidden mr-1">
          <IconButton
            icon={<Menu size={20} />}
            variant="primary"
            size="md"
            label="Toggle menu"
            onClick={onMenuClick}
          />
        </div>
      )}

      <Link to="/" className="flex items-center gap-2 no-underline">
        <img src="/favicon.svg" className="w-8 h-8 object-contain" alt="TripSetGo Logo" />
        <span
          style={{
            fontFamily: 'var(--font-family-display)',
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
          }}
        >
          Trip
          <span style={{ color: 'var(--color-indigo-400)' }}>SetGo</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isAuth ? (
          <Dropdown
            align="right"
            items={userMenuItems}
            trigger={
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <span
                  style={{
                    fontSize: 'var(--font-size-body-sm)',
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  className="hidden sm:inline"
                >
                  {user?.name?.split(' ')[0]}
                </span>
              </button>
            }
          />
        ) : (
          <>
            <Link
              to="/auth/login"
              className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-[var(--radius-md)] text-[var(--font-size-body-sm)] font-semibold text-[var(--color-text-secondary)] bg-transparent border-none cursor-pointer transition-all duration-[var(--duration-fast)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] no-underline"
            >
              Sign In
            </Link>
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-md)] text-[var(--font-size-body-sm)] font-semibold text-white bg-[var(--color-indigo-700)] shadow-[var(--shadow-primary)] cursor-pointer transition-all duration-[var(--duration-fast)] hover:bg-[var(--color-indigo-600)] no-underline"
            >
              {isLanding ? 'Start Planning Free' : 'Get Started'}
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
