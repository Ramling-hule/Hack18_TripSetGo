// QuickActions.jsx
// Aurora Design System — Secondary tools bar containing Print, Save Draft, and Share action buttons.
// Reuses shared Button components.
import { Printer, Share2, Save } from 'lucide-react'
import Button from '@/components/common/Button'

export default function QuickActions({ onSaveDraftTrigger, liveBudget }) {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    window.dispatchEvent(
      new CustomEvent('toast', {
        detail: { type: 'success', message: 'Trip share link copied to clipboard!' },
      })
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.5rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        icon={<Printer size={13} />}
        onClick={handlePrint}
        aria-label="Print itinerary"
        style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}
      >
        Print
      </Button>

      <Button
        variant="ghost"
        size="sm"
        icon={<Share2 size={13} />}
        onClick={handleShare}
        aria-label="Share trip"
        style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}
      >
        Share
      </Button>

      <Button
        variant="ghost"
        size="sm"
        icon={<Save size={13} />}
        onClick={onSaveDraftTrigger}
        aria-label="Save current selections as draft"
        style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}
      >
        Save Draft
      </Button>
    </div>
  )
}
