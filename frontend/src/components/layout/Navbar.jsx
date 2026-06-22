// src/components/layout/Navbar.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, ChevronDown, LogOut, User, Settings, CreditCard, Menu } from 'lucide-react'
import Avatar from '@/components/common/Avatar'
import { selectUser, selectIsAuthenticated, logout } from '@/features/auth/authSlice'
import { selectUnreadCount } from '@/features/notifications/notificationsSlice'

export default function Navbar({ onMenuClick }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectUser)
  const isAuth    = useSelector(selectIsAuthenticated)
  const unread    = useSelector(selectUnreadCount)
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/auth/login')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem',
      background: 'rgba(10,15,30,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      {/* Hamburger — only in dashboard (when onMenuClick provided), mobile only via CSS */}
      {onMenuClick && (
        <button
          className="hamburger-btn"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            padding: '0.375rem',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'none', // shown via CSS @media
            marginRight: '0.25rem',
          }}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <div style={{
          width: 32, height: 32,
          background: 'var(--gradient-primary)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>✈️</div>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
          Trip<span className="gradient-text">SetGo</span>
        </span>
      </Link>

      {/* Nav links (Stripted out per design guidelines) */}

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isAuth ? (
          <>
            {/* User dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)' }}
              >
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="var(--color-text-muted)" />
              </button>

              {dropOpen && (
                <div className="glass animate-fadeIn" style={{
                  position: 'absolute', top: '110%', right: 0,
                  width: 200, borderRadius: 'var(--radius-md)',
                  padding: '0.5rem',
                  boxShadow: 'var(--shadow-card)',
                  zIndex: 100,
                  transformOrigin: 'top right'
                }}>
                  <div style={{ padding: '0.5rem 0.75rem 0.75rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.5rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{user?.name}</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                  </div>
                  
                  {/* Exactly 2 Dropdown options: Profile & Logout */}
                  <Link to="/dashboard/profile" onClick={() => setDropOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                  >
                    <User size={15} /> Profile
                  </Link>

                  <button
                    onClick={() => { setDropOpen(false); handleLogout(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent-red)', fontSize: '0.875rem', transition: 'all 0.15s', textAlign: 'left' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/auth/login"  className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/auth/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  )
}
