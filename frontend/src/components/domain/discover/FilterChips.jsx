import { motion } from 'framer-motion'

export default function FilterChips({
  activeFilter = 'latest',
  onSelect,
}) {
  const options = [
    { id: 'latest', label: 'All Trips' },
    { id: 'popular', label: 'Popular' },
    { id: 'saves', label: 'Saved' },
  ]

  return (
    <div
      role="group"
      aria-label="Filter community feed"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12,
        width: 'fit-content',
        overflowX: 'auto',
      }}
      className="scrollbar-none snap-x"
    >
      {options.map((opt) => {
        const isActive = activeFilter === opt.id
        return (
          <button
            key={opt.id}
            aria-pressed={isActive}
            onClick={() => onSelect(opt.id)}
            style={{
              position: 'relative',
              padding: '0.5rem 1rem',
              borderRadius: 8,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-family-body)',
              transition: 'color 0.2s',
            }}
            className="snap-center hover:text-text-primary focus-visible:ring-1 focus-visible:ring-indigo-500"
          >
            {isActive && (
              <motion.div
                layoutId="activeFilterPill"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'var(--color-indigo-dim)',
                  border: '1px solid rgba(98, 119, 204, 0.3)',
                  borderRadius: 8,
                  zIndex: 0,
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
