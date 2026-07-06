// ResultsTabs.jsx
// Aurora Design System — Tab switcher control for generated plan categories.
// Supports keyboard accessibility, focus rings, and proper ARIA tablist/tab roles.
import { Compass, Hotel, Layers, Lightbulb, Navigation, Package, Utensils } from 'lucide-react'

const TAB_CONFIG = [
  { id: 'itinerary',   label: 'Itinerary',     icon: Compass },
  { id: 'transport',   label: 'Transport',     icon: Navigation },
  { id: 'hotels',      label: 'Hotels',        icon: Hotel },
  { id: 'food',        label: 'Food Plans',    icon: Utensils },
  { id: 'essentials',  label: 'Essentials',    icon: Package },
  { id: 'suggestions', label: 'AI Tips',       icon: Lightbulb },
  { id: 'drafts',      label: 'Saved Drafts',  icon: Layers },
]

export default function ResultsTabs({ activeTab, onTabChange }) {
  const handleKeyDown = (e, index) => {
    let nextIndex = index
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % TAB_CONFIG.length
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + TAB_CONFIG.length) % TAB_CONFIG.length
    } else {
      return
    }
    e.preventDefault()
    onTabChange(TAB_CONFIG[nextIndex].id)
    const button = document.getElementById(`tab-trigger-${TAB_CONFIG[nextIndex].id}`)
    button?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Itinerary category options"
      style={{
        display: 'flex',
        gap: '0.4rem',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0.375rem',
        scrollBehavior: 'smooth',
      }}
      className="scrollbar-none"
    >
      {TAB_CONFIG.map((t, idx) => {
        const Icon = t.icon
        const isActive = activeTab === t.id
        return (
          <button
            key={t.id}
            id={`tab-trigger-${t.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${t.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(t.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1rem',
              borderRadius: '99px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: '1px solid',
              transition: 'all var(--transition-base)',
              backgroundColor: isActive
                ? 'var(--color-indigo-dim)'
                : 'rgba(255, 255, 255, 0.03)',
              borderColor: isActive
                ? 'var(--color-indigo-500)'
                : 'var(--color-border-default)',
              color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
              outline: 'none',
            }}
            className="hover:border-border-interactive hover:text-text-primary focus:border-border-focus focus:shadow-primary"
          >
            <Icon size={13} aria-hidden="true" />
            <span>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
