// src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, ChevronDown, LogOut, User, Menu, Sparkles, Crown } from 'lucide-react'
import Avatar from '@/components/common/Avatar'
import { selectUser, selectIsAuthenticated, logout } from '@/features/auth/authSlice'
import { selectUnreadCount } from '@/features/notifications/notificationsSlice'
import { selectSubscription } from '@/features/subscription/subscriptionSlice'

export default function Navbar({ onMenuClick }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectUser)
  const isAuth    = useSelector(selectIsAuthenticated)
  const unread    = useSelector(selectUnreadCount)
  const sub       = useSelector(selectSubscription)
  const isPro     = sub?.plan === 'pro'

  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setDropOpen(false)
    await dispatch(logout())
    navigate('/auth/login')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem',
      background: 'rgba(8, 15, 30, 0.88)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      {/* Hamburger — only in dashboard on mobile */}
      {onMenuClick && (
        <button
          className="flex items-center justify-center p-1.5 bg-[rgba(14,165,233,0.12)] border border-solid border-[rgba(14,165,233,0.2)] rounded-lg text-text-primary cursor-pointer mr-2 md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <img src="/favicon.svg" style={{ width: 30, height: 30, objectFit: 'contain' }} alt="TripSetGo Logo" />
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>
          Trip<span className="bg-gradient-primary bg-clip-text text-transparent">SetGo</span>
        </span>
      </Link>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        {isAuth ? (
          <>
            {/* Notification Bell */}
            <Link to="/dashboard/notifications" style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.1)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: 5, right: 5,
                  width: 8, height: 8,
                  background: '#EF4444',
                  borderRadius: '50%',
                  border: '1.5px solid var(--color-bg-primary)',
                }} />
              )}
            </Link>

            {/* User dropdown */}
            <div style={{ position: 'relative' }} ref={dropRef}>
              <button
                onClick={() => setDropOpen(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.3rem 0.625rem 0.3rem 0.375rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.1)'; e.currentTarget.style.borderColor = 'var(--color-border-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  {isPro && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Crown size={8} /> Pro
                    </span>
                  )}
                </div>
                <ChevronDown size={13} color="var(--color-text-muted)" style={{ transition: 'transform var(--transition-fast)', transform: dropOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {dropOpen && (
                <div
                  className="animate-fadeIn"
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 210,
                    background: 'rgba(11, 19, 37, 0.96)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-card), 0 0 0 1px rgba(255,255,255,0.04)',
                    padding: '0.5rem',
                    zIndex: 100,
                  }}
                >
                  {/* User info header */}
                  <div style={{ padding: '0.625rem 0.75rem 0.75rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.375rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.125rem' }}>{user?.name}</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                    {isPro && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: '0.375rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#F59E0B' }}>
                        <Crown size={10} /> Pro Member
                      </span>
                    )}
                  </div>

                  {/* Quick links */}
                  {[
                    { to: '/dashboard/copilot',  icon: <Sparkles size={14} />,  label: 'AI Copilot' },
                    { to: '/dashboard/profile',  icon: <User size={14} />,       label: 'Profile' },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setDropOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'all var(--transition-fast)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}

                  <div style={{ height: 1, background: 'var(--color-border)', margin: '0.375rem 0' }} />

                  <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.875rem', transition: 'all var(--transition-fast)', textAlign: 'left' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/auth/login"
              style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)', textDecoration: 'none', border: '1px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'transparent' }}
            >
              Sign In
            </Link>
            <Link to="/auth/signup"
              className="inline-flex items-center justify-center gap-2 font-semibold text-[0.8125rem] px-4 py-[0.4rem] rounded-lg bg-gradient-primary bg-[length:200%_auto] text-white shadow-btn hover:bg-right hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-250"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
