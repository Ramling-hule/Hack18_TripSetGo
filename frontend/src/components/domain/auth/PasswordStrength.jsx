// src/components/domain/auth/PasswordStrength.jsx
// Aurora Design System — Password strength indicator widget
// Evaluates length, letter case, numbers, and special characters.
import { useMemo } from 'react'

export default function PasswordStrength({ password = '' }) {
  const criteria = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }
  }, [password])

  const strengthScore = useMemo(() => {
    if (!password) return 0
    let score = 0
    if (criteria.length) score += 1
    if (criteria.uppercase && criteria.lowercase) score += 1
    if (criteria.number) score += 1
    if (criteria.special) score += 1
    return score
  }, [password, criteria])

  const { color, label, percent } = useMemo(() => {
    if (strengthScore === 0) return { color: 'transparent', label: '', percent: 0 }
    if (strengthScore <= 2) {
      return { color: 'var(--color-rose-500)', label: 'Weak', percent: 33 }
    }
    if (strengthScore === 3) {
      return { color: 'var(--color-amber-500)', label: 'Fair', percent: 66 }
    }
    return { color: 'var(--color-emerald-500)', label: 'Strong', percent: 100 }
  }, [strengthScore])

  if (!password) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', width: '100%' }}>
      {/* Label and score indicator */}
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 'var(--font-size-caption)',
            fontFamily: 'var(--font-family-body)',
            color: 'var(--color-text-muted)',
          }}
        >
          Password Strength:{' '}
          <strong style={{ color }}>{label}</strong>
        </span>
      </div>

      {/* Progress track */}
      <div
        style={{
          width: '100%',
          height: 4,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-surface-raised)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: color,
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}
