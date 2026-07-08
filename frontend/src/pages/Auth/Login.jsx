// src/pages/Auth/Login.jsx
// Aurora Design System — Login Page
// Frosted glass card, dynamic Google login, Redux store connection.
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { login, selectAuthLoading, selectAuthError, clearError, setGoogleUser } from '@/features/auth/authSlice'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import AuthLayout from '@/components/layout/AuthLayout'
import AuthHeader from '@/components/domain/auth/AuthHeader'
import SocialLogin from '@/components/domain/auth/SocialLogin'
import api from '@/services/api'
import { entrance } from '@/components/landing/animations/variants'

export default function Login() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const loading   = useSelector(selectAuthLoading)
  const error     = useSelector(selectAuthError)
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [currentDestIndex, setCurrentDestIndex] = useState(0)

  useEffect(() => { return () => dispatch(clearError()) }, [dispatch])

  // Rotate images for the side panel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDestIndex(prev => (prev + 1) % FLOATING_DESTINATIONS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await dispatch(login(form))
    if (!res.error) navigate('/dashboard')
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/api/v1/auth/google/token', { token: credentialResponse.credential })
      dispatch(setGoogleUser(res.data.data))
      navigate('/dashboard')
    } catch {
      // error handled by interceptor
    }
  }

  return (
    <AuthLayout
      backgroundImageUrl="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=85"
    >
      <motion.div
        variants={entrance}
        initial="hidden"
        animate="visible"
      >
        {/* Header branding */}
        <AuthHeader
          title="Welcome back"
          subtitle="Sign in to continue planning"
        />

        {/* Error alert panel */}
        {error && (
          <div
            role="alert"
            style={{
              background: 'var(--color-rose-dim)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--spacing-3) var(--spacing-4)',
              marginBottom: 'var(--spacing-4)',
              color: 'var(--color-rose-400)',
              fontSize: 'var(--font-size-body-sm)',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {error}
          </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <Input
            label="Email"
            type="email"
            required
            placeholder="you@email.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            icon={<Mail size={16} />}
          />
          <Input
            label="Password"
            type={showPwd ? 'text' : 'password'}
            required
            placeholder="Your password"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            icon={<Lock size={16} />}
            iconRight={
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  padding: 0,
                  outline: 'none',
                }}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
            <Link
              to="/auth/forgot-password"
              style={{
                fontSize: 'var(--font-size-caption)',
                color: 'var(--color-indigo-400)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} size="lg" style={{ width: '100%' }}>
            Sign In
          </Button>
        </form>

        {/* Social authentication */}
        <SocialLogin
          onGoogleSuccess={handleGoogleSuccess}
          onGoogleError={() => {}}
        />

        {/* Alternative action */}
        <p
          style={{
            textAlign: 'center',
            marginTop: 'var(--spacing-6)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-body-sm)',
            margin: 'var(--spacing-6) 0 0 0',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/auth/signup"
            style={{
              color: 'var(--color-indigo-400)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
            className="hover:text-[var(--color-text-primary)] transition-colors"
          >
            Sign up free
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
