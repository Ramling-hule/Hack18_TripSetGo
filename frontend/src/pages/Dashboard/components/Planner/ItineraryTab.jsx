// ItineraryTab.jsx
// Aurora Design System — Day selector, Day toolbar (lock/regenerate), and sequential activity slot lists.
// Full screen-reader accessibility, keyboard triggers, and tween transitions.
import { Lock, Unlock, RefreshCw, Sunrise, Sun, Moon } from 'lucide-react'
import Card from '@/components/common/Card'

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function ItineraryTab({
  itinerary = [],
  activeDay,
  lockedDays = [],
  regeneratingDay,
  selections = [],
  onDayChange,
  onToggleLock,
  onRegenerate,
  onToggleActivity,
}) {
  const day = itinerary[activeDay]
  if (!day) return null

  const isLocked = lockedDays.includes(activeDay)
  const isRegen  = regeneratingDay === activeDay

  const handleDayKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onDayChange(index)
    }
  }

  const handleActivityKeyDown = (e, slot, act) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggleActivity({ day: activeDay, slot, activity: act })
    }
  }

  return (
    <div
      id="tabpanel-itinerary"
      role="tabpanel"
      aria-label="Daily itinerary details"
    >
      {/* ── Day Timeline selector pills ── */}
      <div
        role="tablist"
        aria-label="Select itinerary day"
        style={{
          display: 'flex',
          gap: '0.4rem',
          marginBottom: '1.25rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}
        className="scrollbar-none"
      >
        {itinerary.map((d, i) => {
          const isActive = activeDay === i
          const dayLocked = lockedDays.includes(i)
          return (
            <button
              key={i}
              role="tab"
              aria-selected={isActive}
              aria-controls={`daypanel-${i}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onDayChange(i)}
              onKeyDown={(e) => handleDayKeyDown(e, i)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
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
              className="hover:border-border-interactive hover:text-text-primary focus:border-border-focus"
            >
              <span>Day {d.day}</span>
              {dayLocked && <Lock size={10} style={{ opacity: 0.65 }} />}
            </button>
          )
        })}
      </div>

      {/* ── Active Day Content ── */}
      <div
        id={`daypanel-${activeDay}`}
        role="tabpanel"
        aria-label={`Details for Day ${day.day}`}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {/* Day Header Toolbar */}
        <div
          className="bg-surface-glass border border-border-default backdrop-blur-2xl shadow-lg"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            {day.theme && (
              <p
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-family-display)',
                  color: '#ffffff',
                  margin: '0 0 0.15rem 0',
                }}
              >
                {day.theme}
              </p>
            )}
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.78rem', margin: 0 }}>
              Day {day.day}
              {isLocked && <span style={{ marginLeft: '0.35rem', color: 'var(--color-indigo-400)' }}>· 🔒 Locked</span>}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onToggleLock(activeDay)}
              aria-label={isLocked ? `Unlock Day ${day.day}` : `Lock Day ${day.day}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.4rem 0.875rem',
                background: isLocked ? 'var(--color-indigo-dim)' : 'var(--color-surface-hover)',
                border: '1px solid',
                borderColor: isLocked ? 'var(--color-indigo-500)' : 'var(--color-border-default)',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 600,
                color: isLocked ? '#ffffff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                outline: 'none',
              }}
              className="hover:border-border-interactive focus:border-border-focus"
            >
              {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
              <span>{isLocked ? 'Locked' : 'Lock'}</span>
            </button>

            <button
              onClick={onRegenerate}
              disabled={isLocked || isRegen}
              aria-label={`Regenerate itinerary options for Day ${day.day}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.4rem 0.875rem',
                background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                cursor: isLocked || isRegen ? 'not-allowed' : 'pointer',
                opacity: isLocked || isRegen ? 0.5 : 1,
                transition: 'all 0.15s',
                outline: 'none',
              }}
              className="hover:border-border-interactive focus:border-border-focus"
            >
              <RefreshCw
                size={12}
                style={{ animation: isRegen ? 'spin 1s linear infinite' : 'none' }}
                aria-hidden="true"
              />
              <span>{isRegen ? 'Regenerating…' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* ── Activity Slots ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            opacity: isRegen ? 0.45 : 1,
            pointerEvents: isRegen ? 'none' : 'auto',
            transition: 'opacity var(--transition-base)',
          }}
        >
          {['morning', 'afternoon', 'evening'].map((slot) => {
            const slotActivities = day[slot]?.activities || []
            if (slotActivities.length === 0) return null

            return (
              <div
                key={slot}
                className="bg-surface-glass border border-border-default backdrop-blur-2xl shadow-lg"
                style={{ borderRadius: 14, padding: '1.25rem' }}
              >
                {/* Slot heading */}
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-family-display)',
                    color: '#ffffff',
                    margin: '0 0 1rem 0',
                  }}
                >
                  {slot === 'morning' ? (
                    <Sunrise size={15} style={{ color: 'var(--color-amber-500)' }} />
                  ) : slot === 'afternoon' ? (
                    <Sun size={15} style={{ color: 'var(--color-amber-400)' }} />
                  ) : (
                    <Moon size={15} style={{ color: 'var(--color-violet-500)' }} />
                  )}
                  <span>{slot}</span>
                </p>

                {/* Grid of activities */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {slotActivities.map((act, j) => {
                    const isSelected = selections.some(
                      (a) =>
                        a.day === activeDay &&
                        a.slot === slot &&
                        a.activity.name === act.name
                    )

                    return (
                      <div
                        key={j}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onClick={() =>
                          onToggleActivity({ day: activeDay, slot, activity: act })
                        }
                        onKeyDown={(e) => handleActivityKeyDown(e, slot, act)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          padding: '0.875rem',
                          borderRadius: '10px',
                          border: '1px solid',
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'all var(--transition-base)',
                          backgroundColor: isSelected
                            ? 'var(--color-indigo-dim)'
                            : 'rgba(255, 255, 255, 0.02)',
                          borderColor: isSelected
                            ? 'var(--color-indigo-500)'
                            : 'var(--color-border-default)',
                        }}
                        className="hover:border-border-interactive focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            margin: '0 0 0.25rem 0',
                            color: isSelected ? '#ffffff' : 'var(--color-text-primary)',
                          }}
                        >
                          {act.name}
                        </p>
                        <p
                          style={{
                            color: 'var(--color-text-secondary)',
                            fontSize: '0.75rem',
                            margin: 0,
                          }}
                        >
                          {act.duration} · {inr(act.cost || 0)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
