// src/pages/Auth/VerifyOTP.jsx
// Aurora Design System — OTP Verification Page
// Hosts dynamic countdown, resend triggers, and split ref text fields.
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { verifyOTP, resendOTP, selectAuthLoading, selectAuthError, clearError, clearSuccess } from '@/features/auth/authSlice'
import Button from '@/components/common/Button'
import AuthLayout from '@/components/layout/AuthLayout'
import AuthHeader from '@/components/domain/auth/AuthHeader'
import OTPInput from '@/components/domain/auth/OTPInput'
import { entrance } from '@/components/landing/animations/variants'

export default function VerifyOTP() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading  = useSelector(selectAuthLoading)
  const error    = useSelector(selectAuthError)
  const successMsg = useSelector(s => s.auth.successMessage)
  const pendingEmail = useSelector(s => s.auth.pendingEmail)
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [countdown, setCountdown] = useState(60)

  useEffect(() => { return () => { dispatch(clearError()); dispatch(clearSuccess()) } }, [dispatch])

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return
    const res = await dispatch(verifyOTP({ email: pendingEmail, otp: code }))
    if (!res.error) navigate('/auth/login')
  }

  const handleResend = async () => {
    if (countdown > 0) return
    dispatch(clearSuccess())
    dispatch(clearError())
    const res = await dispatch(resendOTP({ email: pendingEmail }))
    if (!res.error) setCountdown(60)
  }

  return (
    <AuthLayout>
      <motion.div
        variants={entrance}
        initial="hidden"
        animate="visible"
      >
        {/* Header branding */}
        <AuthHeader
          icon={<Mail size={24} />}
          title="Check your email"
          subtitle={
            <span>
              We sent a 6-digit OTP to{' '}
              <strong style={{ color: 'var(--color-text-primary)' }}>
                {pendingEmail || 'your email'}
              </strong>
            </span>
          }
        />

        {/* Error panel */}
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
        )}

        {/* Success panel */}
        {successMsg && (
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
            {successMsg}
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit}>
          <OTPInput
            value={otp}
            onChange={setOtp}
            disabled={loading}
          />

          <Button
            type="submit"
            loading={loading}
            size="lg"
            style={{ width: '100%', marginBottom: 'var(--spacing-4)' }}
            disabled={otp.join('').length < 6}
          >
            Verify OTP
          </Button>
        </form>

        {/* Resend actions */}
        <div
          style={{
            marginTop: 'var(--spacing-6)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-body-sm)',
            textAlign: 'center',
          }}
        >
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
              Resend in {countdown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-indigo-400)',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                outline: 'none',
              }}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              Resend Code
            </button>
          )}
        </div>
      </motion.div>
    </AuthLayout>
  )
}
