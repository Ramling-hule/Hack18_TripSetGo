// src/pages/Auth/ResetPassword.jsx
// Aurora Design System — Reset Password Page
// Validates recovery tokens and saves new security keys.
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { resetPassword, selectAuthLoading, selectAuthError } from '@/features/auth/authSlice'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import AuthLayout from '@/components/layout/AuthLayout'
import AuthHeader from '@/components/domain/auth/AuthHeader'
import { validatePassword, validateConfirmPassword } from '@/utils/authValidation'
import { entrance } from '@/components/landing/animations/variants'

export default function ResetPassword() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const loading  = useSelector(selectAuthLoading)
  const error    = useSelector(selectAuthError)
  const [form, setForm] = useState({ otp: '', password: '', confirmPassword: '' })
  const [localErr, setLocalErr] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalErr('')

    // Validate inputs
    if (!form.otp || form.otp.length < 6) {
      setLocalErr('Please enter the 6-digit OTP code')
      return
    }

    const pwdErr = validatePassword(form.password)
    if (pwdErr) { setLocalErr(pwdErr); return }

    const confirmErr = validateConfirmPassword(form.password, form.confirmPassword)
    if (confirmErr) { setLocalErr(confirmErr); return }

    const res = await dispatch(resetPassword({
      email: params.get('email'),
      otp: form.otp,
      newPassword: form.password
    }))
    if (!res.error) navigate('/auth/login')
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
          title="Reset your password"
          subtitle="Enter the OTP from your email and your new password."
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
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <Input
            label="OTP Code"
            type="text"
            required
            placeholder="6-digit OTP"
            value={form.otp}
            onChange={e => setForm(p => ({ ...p, otp: e.target.value }))}
          />
          <Input
            label="New Password"
            type="password"
            required
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            icon={<Lock size={16} />}
          />
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
            Reset Password
          </Button>
        </form>

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
