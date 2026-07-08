import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react'

export default function TripItinerary({
  trip,
  editMode,
  handleAddDay,
  handleDeleteDay,
  newActivityDay,
  setNewActivityDay,
  activityForm,
  setActivityForm,
  handleAddActivity,
  handleDeleteActivity,
  plan,
}) {
  const isCustomized = trip.itinerary && trip.itinerary.length > 0
  const daysList = isCustomized ? trip.itinerary : (plan?.itinerary || [])

  // Track expanded day numbers (default Day 1 is expanded, others collapsed)
  const [expandedDays, setExpandedDays] = useState({ 1: true })

  const toggleDay = (dayNum) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNum]: !prev[dayNum]
    }))
  }

  if (!daysList.length) return null

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-family-display)' }} className="text-text-primary">
          {isCustomized ? 'Collaborative' : 'Recommended'} <span className="bg-gradient-primary bg-clip-text text-transparent">Itinerary</span>
        </h2>
        {editMode && isCustomized && (
          <button
            onClick={handleAddDay}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.375rem 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease-out',
            }}
            className="hover:bg-[var(--color-surface-hover)]"
          >
            <Plus size={14} /> Add Day
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} role="list" aria-label="Trip Itinerary Days">
        {daysList.map((day) => {
          const isExpanded = !!expandedDays[day.day]

          return (
            <div
              key={day._id || day.day}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
              role="listitem"
            >
              {/* Day Header Trigger */}
              <button
                onClick={() => toggleDay(day.day)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem 1.5rem',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                aria-expanded={isExpanded}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-family-display)',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Day {day.day}
                  </span>
                  {day.date && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {editMode && isCustomized && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteDay(day.day)
                      }}
                      style={{
                        padding: '0.25rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-rose-400)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                      }}
                      className="hover:bg-[var(--color-surface-hover)]"
                      title={`Delete Day ${day.day}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>
              </button>

              {/* Day Body Accordion Content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ ease: 'easeOut', duration: 0.2 }}
                  >
                    <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                      {isCustomized ? (
                        /* Collaborative custom activities list */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                          {day.activities?.length > 0 ? (
                            day.activities.map((act, actIdx) => (
                              <div
                                key={act._id || actIdx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  background: 'var(--color-surface-hover)',
                                  border: '1px solid var(--color-border-subtle)',
                                  borderRadius: 'var(--radius-lg)',
                                  padding: '0.875rem 1rem',
                                }}
                              >
                                <div>
                                  <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }} className="text-text-primary">
                                    {act.startTime && (
                                      <span style={{ color: 'var(--color-indigo-400)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        <Clock size={11} /> {new Date(act.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                    {act.name}
                                  </p>
                                  {act.notes && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0, marginTop: '0.2rem' }}>{act.notes}</p>}
                                  {act.cost > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--color-emerald-400)', fontWeight: 600, margin: 0, marginTop: '0.2rem' }}>₹{act.cost.toLocaleString()}</p>}
                                </div>

                                {editMode && (
                                  <button
                                    onClick={() => handleDeleteActivity(day.day, actIdx)}
                                    style={{ border: 'none', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                                    className="hover:text-rose-400"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: 0, padding: '0.5rem 0' }}>
                              No activities scheduled for this day yet.
                            </p>
                          )}

                          {/* Add activity controls */}
                          {editMode && (
                            <div style={{ marginTop: '0.5rem' }}>
                              {newActivityDay === day.day ? (
                                <div
                                  style={{
                                    padding: '1rem',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--color-surface-hover)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem',
                                  }}
                                >
                                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                                    <input
                                      type="text"
                                      placeholder="Activity name..."
                                      style={{ padding: '0.5rem', background: 'var(--color-surface-default)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', outline: 'none' }}
                                      value={activityForm.name}
                                      onChange={e => setActivityForm(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                    <input
                                      type="number"
                                      placeholder="Cost (₹)..."
                                      style={{ padding: '0.5rem', background: 'var(--color-surface-default)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', outline: 'none' }}
                                      value={activityForm.cost}
                                      onChange={e => setActivityForm(prev => ({ ...prev, cost: e.target.value }))}
                                    />
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    <input
                                      type="time"
                                      style={{ padding: '0.5rem', background: 'var(--color-surface-default)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', outline: 'none' }}
                                      value={activityForm.startTime}
                                      onChange={e => setActivityForm(prev => ({ ...prev, startTime: e.target.value }))}
                                    />
                                    <input
                                      type="text"
                                      placeholder="Notes..."
                                      style={{ padding: '0.5rem', background: 'var(--color-surface-default)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', outline: 'none' }}
                                      value={activityForm.notes}
                                      onChange={e => setActivityForm(prev => ({ ...prev, notes: e.target.value }))}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => handleAddActivity(day.day)}
                                      style={{ padding: '0.375rem 0.75rem', background: 'var(--color-indigo-600)', color: '#ffffff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setNewActivityDay(null)}
                                      style={{ padding: '0.375rem 0.75rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', cursor: 'pointer' }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setNewActivityDay(day.day)
                                    setActivityForm({ name: '', notes: '', cost: '', startTime: '' })
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '0.625rem',
                                    background: 'transparent',
                                    border: '1px dashed var(--color-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    color: 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.375rem',
                                  }}
                                  className="hover:bg-[var(--color-surface-hover)]"
                                >
                                  <Plus size={14} /> Add Activity
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* AI suggestion visual slots (morning, afternoon, evening) */
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                          {['morning', 'afternoon', 'evening'].map((slotKey) => {
                            const slot = day[slotKey]
                            const slotColors = {
                              morning: 'var(--color-amber-400)',
                              afternoon: 'var(--color-indigo-400)',
                              evening: 'var(--color-purple-400)',
                            }
                            if (!slot?.activities?.length) return null

                            return (
                              <div
                                key={slotKey}
                                style={{
                                  background: 'var(--color-surface-hover)',
                                  borderRadius: 'var(--radius-lg)',
                                  padding: '1rem',
                                  borderLeft: `3px solid ${slotColors[slotKey]}`,
                                }}
                              >
                                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: slotColors[slotKey], margin: 0, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {slotKey}
                                </p>
                                {slot.activities.map((act, actIdx) => (
                                  <div key={actIdx} style={{ marginBottom: actIdx < slot.activities.length - 1 ? '0.5rem' : 0 }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }} className="text-text-primary">
                                      {act.name}
                                    </p>
                                    {act.description && (
                                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0, marginTop: '0.125rem' }}>
                                        {act.description}
                                      </p>
                                    )}
                                    {act.cost > 0 && (
                                      <p style={{ fontSize: '0.75rem', color: 'var(--color-emerald-400)', margin: 0, marginTop: '0.125rem', fontWeight: 600 }}>
                                        ₹{act.cost.toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
