// src/pages/Auth/ForgotPassword.jsx
// Aurora Design System — Forgot Password Page
// Submits recovery details to receive verify tokens.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import { forgotPassword, selectAuthLoading, selectAuthError } from '@/features/auth/authSlice'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import AuthLayout from '@/components/layout/AuthLayout'
import AuthHeader from '@/components/domain/auth/AuthHeader'
import { validateEmail } from '@/utils/authValidation'
import { entrance } from '@/components/landing/animations/variants'

export default function ForgotPassword() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading  = useSelector(selectAuthLoading)
  const error    = useSelector(selectAuthError)
  const [email, setEmail] = useState('')
  const [localErr, setLocalErr] = useState('')
  const [sent, setSent]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalErr('')

    const emailErr = validateEmail(email)
    if (emailErr) { setLocalErr(emailErr); return }

    const res = await dispatch(forgotPassword({ email }))
    if (!res.error) {
      setSent(true)
      navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`)
    }
  }

  const displayError = localErr || error

  return (
    <AuthLayout>
      <motion.div
        variants={entrance}
        initial="hidden"
        animate="visible"
      >
        {/* Header branding */}
        <AuthHeader
          icon={<Lock size={24} />}
          title="Forgot password?"
          subtitle={
            sent
              ? 'Check your email for a reset OTP.'
              : "Enter your email and we'll send you a reset OTP."
          }
        />

        {!sent && (
          <>
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
            )}

            {/* Form fields */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', textAlign: 'left' }}>
              <Input
                label="Email"
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon={<Mail size={16} />}
              />
              <Button type="submit" loading={loading} size="lg" style={{ width: '100%' }}>
                Send Reset OTP
              </Button>
            </form>
          </>
        )}

        {/* Success message panel */}
        {sent && (
          <div
            style={{
              background: 'var(--color-emerald-dim)',
              border: '1px solid rgba(45, 181, 142, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--spacing-3) var(--spacing-4)',
              marginBottom: 'var(--spacing-4)',
              color: 'var(--color-emerald-400)',
              fontSize: 'var(--font-size-body-sm)',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            OTP sent to {email}
          </div>
        )}

        {/* Alternate link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: 'var(--spacing-6)',
            fontSize: 'var(--font-size-body-sm)',
            margin: 'var(--spacing-6) 0 0 0',
          }}
        >
          <Link
            to="/auth/login"
            style={{
              color: 'var(--color-indigo-400)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
            className="hover:text-[var(--color-text-primary)] transition-colors"
          >
            &larr; Back to login
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
