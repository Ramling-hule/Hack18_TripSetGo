// src/components/domain/ProBanner.jsx
// Aurora Design System — Upgrade promotion banner
// Deep Slate with subtle Indigo border, beautiful typography, calm premium feel.
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'

export default function ProBanner({ className = '', onUpgrade }) {
  return (
    <Card
      variant="raised"
      padding="lg"
      className={`relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-[var(--color-indigo-600)] ${className}`}
    >
      {/* Decorative atmospheric lighting */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-indigo-dim) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="relative z-10 flex items-start gap-3.5">
        <div
          className="p-2 rounded-xl shrink-0 hidden xs:flex"
          style={{
            background: 'var(--color-indigo-dim)',
            border: '1px solid rgba(98, 119, 204, 0.2)',
            color: 'var(--color-indigo-400)',
          }}
        >
          <Sparkles size={20} />
        </div>

        <div className="flex flex-col gap-0.5">
          <h4
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--font-size-h3)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Upgrade to Premium
          </h4>
          <p
            style={{
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Unlock unlimited trip planning, priority AI copilot, real-time collaboration, and more.
          </p>
        </div>
      </div>

      <div className="relative z-10 shrink-0 self-stretch sm:self-auto flex items-center">
        {onUpgrade ? (
          <Button
            variant="primary"
            size="sm"
            iconRight={<ArrowRight size={14} />}
            onClick={onUpgrade}
            className="w-full sm:w-auto"
          >
            Upgrade Now
          </Button>
        ) : (
          <Link to="/dashboard/subscription" className="w-full sm:w-auto no-underline">
            <Button
              variant="primary"
              size="sm"
              iconRight={<ArrowRight size={14} />}
              className="w-full sm:w-auto"
            >
              Upgrade Now
            </Button>
          </Link>
        )}
      </div>
    </Card>
  )
}
