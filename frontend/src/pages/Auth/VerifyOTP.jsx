// src/pages/Auth/VerifyOTP.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { verifyOTP, resendOTP, selectAuthLoading, selectAuthError, clearError, clearSuccess } from '@/features/auth/authSlice'
import Button from '@/components/common/Button'

export default function VerifyOTP() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading  = useSelector(selectAuthLoading)
  const error    = useSelector(selectAuthError)
  const successMsg = useSelector(s => s.auth.successMessage)
  const pendingEmail = useSelector(s => s.auth.pendingEmail)
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [countdown, setCountdown] = useState(60)
  const refs = useRef([])

  useEffect(() => { refs.current[0]?.focus() }, [])
  useEffect(() => { return () => { dispatch(clearError()); dispatch(clearSuccess()) } }, [dispatch])
  
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (data.length === 6) {
      setOtp(data.split(''))
      refs.current[5]?.focus()
    }
  }

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--gradient-hero)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="bg-bg-glass backdrop-blur-[20px] border border-border shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" style={{ width: '100%', maxWidth: 420, padding: '2.5rem', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: '1rem' }}>📬</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Check your email</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          We sent a 6-digit OTP to <strong style={{ color: 'var(--color-text-primary)' }}>{pendingEmail || 'your email'}</strong>
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1.25rem', color: '#f87171', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        
        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1.25rem', color: '#10b981', fontSize: '0.875rem' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', marginBottom: '2rem' }} onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: 48, height: 56,
                  padding: 0,
                  textAlign: 'center',
                  fontSize: '1.5rem', fontWeight: 700,
                  background: 'rgba(255,255,255,0.05)',
                  border: `2px solid ${digit ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
              />
            ))}
          </div>
          <Button type="submit" loading={loading} size="lg" style={{ width: '100%', marginBottom: '1rem' }} disabled={otp.join('').length < 6}>
            Verify OTP
          </Button>
        </form>

        <div style={{ marginTop: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span style={{ color: 'var(--color-text-primary)' }}>Resend in {countdown}s</span>
          ) : (
            <button 
              onClick={handleResend}
              disabled={loading}
              style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              Resend Code
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
