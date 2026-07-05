// src/components/domain/SettlementCard.jsx
// Aurora Design System — Expense settlement display
// Per Aurora Section 13: Settlement Card spec
import { ArrowRight, Check } from 'lucide-react'
import Card from '@/components/common/Card'
import Avatar from '@/components/common/Avatar'
import Button from '@/components/common/Button'

export default function SettlementCard({
  from,       // { name, avatar }
  to,         // { name, avatar }
  amount = 0,
  currency = '₹',
  settled = false,
  onSettle,
  className = '',
}) {
  return (
    <Card variant="raised" padding="md" className={`${settled ? 'opacity-70' : ''} ${className}`}>
      <div className="flex items-center gap-4">
        {/* From user */}
        <div className="flex items-center gap-2 min-w-0">
          <Avatar src={from?.avatar} name={from?.name} size="sm" />
          <span className="text-[var(--font-size-body-sm)] text-[var(--color-text-primary)] truncate">
            {from?.name}
          </span>
        </div>

        {/* Arrow */}
        <ArrowRight
          size={16}
          className="shrink-0"
          style={{ color: 'var(--color-indigo-400)' }}
        />

        {/* To user */}
        <div className="flex items-center gap-2 min-w-0">
          <Avatar src={to?.avatar} name={to?.name} size="sm" />
          <span className="text-[var(--font-size-body-sm)] text-[var(--color-text-primary)] truncate">
            {to?.name}
          </span>
        </div>

        {/* Amount + Action */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <span
            className="font-[var(--font-family-display)] font-[800] text-[var(--font-size-body)]"
            style={{
              color: settled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              textDecoration: settled ? 'line-through' : 'none',
            }}
          >
            {currency}{amount.toLocaleString()}
          </span>

          {settled ? (
            <span className="inline-flex items-center gap-1 text-[var(--font-size-caption)] text-[var(--color-emerald-400)]">
              <Check size={14} /> Settled
            </span>
          ) : onSettle ? (
            <Button variant="ghost" size="sm" onClick={onSettle}>
              Mark Settled
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
