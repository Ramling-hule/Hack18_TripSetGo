import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function BudgetBar({ liveBudget, totalBudget, status }) {
  const pct = totalBudget > 0 ? Math.min((liveBudget / totalBudget) * 100, 100) : 0
  const colors = {
    green: 'var(--color-emerald-500)',
    amber: 'var(--color-amber-500)',
    red: 'var(--color-rose-500)',
    neutral: 'var(--color-indigo-400)'
  }
  const color = colors[status] || colors.neutral
  const remaining = totalBudget - liveBudget

  return (
    <div
      className="bg-surface-glass border border-border-default backdrop-blur-2xl shadow-lg"
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: 16,
        marginBottom: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: status === 'green'
              ? 'var(--color-emerald-dim)'
              : status === 'amber'
              ? 'var(--color-amber-dim)'
              : status === 'red'
              ? 'var(--color-rose-dim)'
              : 'var(--color-indigo-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <TrendingUp size={16} style={{ color }} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', fontFamily: 'var(--font-family-display)', color: '#fff' }}>Live Budget Tracker</p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Real-time spend tracking</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 800, fontSize: '1.25rem', color, fontFamily: 'var(--font-family-display)' }}>{inr(liveBudget)}</p>
          <p style={{ fontSize: '0.75rem', color: remaining >= 0 ? 'var(--color-text-secondary)' : 'var(--color-rose-500)' }}>
            {remaining >= 0 ? `${inr(remaining)} remaining` : `${inr(Math.abs(remaining))} over budget`}
          </p>
        </div>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Live budget usage progress"
        style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}
      >
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.25, type: 'tween', ease: 'easeInOut' }}
          style={{
            height: '100%', borderRadius: 99,
            background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 60%, transparent))`,
            boxShadow: `0 0 8px color-mix(in srgb, ${color} 40%, transparent)`
          }}
          className={remaining < 0 ? 'animate-pulse' : ''}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>₹0</p>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Total: {inr(totalBudget)}</p>
      </div>
    </div>
  )
}
