// src/pages/Auth/Signup.jsx
// Aurora Design System — Signup Page
// Password strength checks, validation messages, and email pending actions.
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Sparkles, Compass } from 'lucide-react'
import { signup, selectAuthLoading, selectAuthError, clearError, setPendingEmail } from '@/features/auth/authSlice'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import AuthLayout from '@/components/layout/AuthLayout'
import AuthHeader from '@/components/domain/auth/AuthHeader'
import PasswordStrength from '@/components/domain/auth/PasswordStrength'
import { validateEmail, validatePassword, validateConfirmPassword } from '@/utils/authValidation'
import { entrance } from '@/components/landing/animations/variants'

export default function Signup() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading  = useSelector(selectAuthLoading)
  const error    = useSelector(selectAuthError)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [localErr, setLocalErr] = useState('')
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
    setLocalErr('')

    // Validate inputs
    const emailErr = validateEmail(form.email)
    if (emailErr) { setLocalErr(emailErr); return }

    const pwdErr = validatePassword(form.password)
    if (pwdErr) { setLocalErr(pwdErr); return }

    const confirmErr = validateConfirmPassword(form.password, form.confirmPassword)
    if (confirmErr) { setLocalErr(confirmErr); return }

    const res = await dispatch(signup({ name: form.name, email: form.email, password: form.password }))
    if (!res.error) {
      dispatch(setPendingEmail(form.email))
      navigate('/auth/verify-otp')
    }
  }

  const displayError = localErr || error

  return (
    <AuthLayout
      backgroundImageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=85"
    >
      <motion.div
        variants={entrance}
        initial="hidden"
        animate="visible"
      >
        {/* Header branding */}
        <AuthHeader
          title="Create your account"
          subtitle="Start planning your dream trips today"
        />

        {/* Error panel */}
        {displayError && (
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
            {displayError}
          </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <Input
            label="Full Name"
            type="text"
            required
            placeholder="John Doe"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            icon={<User size={16} />}
          />
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
            type="password"
            required
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            icon={<Lock size={16} />}
          />
          
          {/* Password strength visual feedback */}
          {form.password && (
            <div style={{ marginTop: -4 }}>
              <PasswordStrength password={form.password} />
            </div>
          )}

          <Input
            label="Confirm Password"
            type="password"
            required
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
            icon={<Lock size={16} />}
          />

          <Button type="submit" loading={loading} size="lg" style={{ width: '100%', marginTop: 'var(--spacing-2)' }}>
            Create Account
          </Button>
        </form>

        {/* Alternate action */}
        <p
          style={{
            textAlign: 'center',
            marginTop: 'var(--spacing-6)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-body-sm)',
            margin: 'var(--spacing-6) 0 0 0',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/auth/login"
            style={{
              color: 'var(--color-indigo-400)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
            className="hover:text-[var(--color-text-primary)] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
