import { motion } from 'framer-motion'
import { Users, X, CloudRain, Hotel, MapPin, Navigation, TrendingUp, HelpCircle } from 'lucide-react'
import Badge from '@/components/common/Badge'

export function CollaboratorsList({ trip, isOwner, handleRemoveCollaborator }) {
  if (!trip.collaborators?.length) return null

  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="text-text-primary">
        <Users size={18} style={{ color: 'var(--color-indigo-400)' }} /> Collaborators
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {trip.collaborators.map((collab) => (
          <div
            key={collab._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border-subtle)',
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <img
              src={collab.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${collab.userId?.name}`}
              alt=""
              style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '0.8125rem', fontWeight: 500 }} className="text-text-primary">
              {collab.userId?.name}
            </span>
            <Badge
              label={`${collab.status}`}
              variant={collab.status === 'accepted' ? 'success' : 'warning'}
              className="text-[0.6rem] px-2 py-0.5 normal-case"
            />
            {isOwner && (
              <button
                onClick={() => handleRemoveCollaborator(collab.userId?._id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-rose-400)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                  marginLeft: '0.25rem',
                }}
                title="Remove collaborator"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function BudgetBreakdown({ breakdown }) {
  if (!breakdown || Object.keys(breakdown).length === 0) return null

  // Calculate total budget
  const total = Object.values(breakdown).reduce((a, b) => Number(a) + Number(b), 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: '0.25rem' }} className="text-text-primary">
        Estimated Budget
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '1.5rem' }}>
        AI breakdown based on target preferences (Total: ₹{total.toLocaleString()})
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.entries(breakdown).map(([key, val]) => {
          const percentage = total > 0 ? (Number(val) / total) * 100 : 0
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                <span style={{ textTransform: 'capitalize', fontWeight: 500 }} className="text-text-secondary">
                  {key}
                </span>
                <span style={{ fontWeight: 600 }} className="text-text-primary">
                  ₹{Number(val).toLocaleString()} ({Math.round(percentage)}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'var(--color-indigo-500)', borderRadius: 'var(--radius-full)' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export function AITips({ suggestions }) {
  if (!suggestions?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      style={{ marginTop: '2rem' }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="text-text-primary">
        <TrendingUp size={18} style={{ color: 'var(--color-indigo-400)' }} /> AI Travel Insights
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
        {suggestions.map((s, i) => (
          <div
            key={i}
            style={{
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem',
              display: 'flex',
              gap: '0.875rem',
              alignItems: 'flex-start',
              background: 'var(--color-surface-glass)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{s.icon || '💡'}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }} className="text-text-primary">
                {s.title}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function LiveWeather({ weather }) {
  if (!weather?.available || !weather.forecast?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35 }}
      style={{ marginTop: '2rem' }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="text-text-primary">
        <CloudRain size={18} style={{ color: 'var(--color-amber-400)' }} /> Weather Forecast
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
        {weather.forecast.slice(0, 5).map((w, i) => (
          <div
            key={i}
            style={{
              borderRadius: 'var(--radius-xl)',
              padding: '1rem',
              textAlign: 'center',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0, fontWeight: 600 }}>
              {new Date(w.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <div style={{ fontSize: '1.75rem', margin: '0.375rem 0' }}>{w.conditionIcon || '🌤️'}</div>
            <p style={{ fontWeight: 800, fontSize: '0.95rem', margin: 0 }} className="text-text-primary">
              {Math.round(w.tempMaxC)}°{' '}
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.8125rem' }}>
                {Math.round(w.tempMinC)}°
              </span>
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-indigo-400)', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>
              💧 {Math.round(w.rainProbability)}%
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function LiveHotels({ hotels }) {
  if (!hotels?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      style={{ marginTop: '2rem' }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="text-text-primary">
        <Hotel size={18} style={{ color: 'var(--color-indigo-400)' }} /> Available Stays
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
        {hotels.slice(0, 4).map((h, i) => (
          <div
            key={i}
            style={{
              borderRadius: 'var(--radius-xl)',
              padding: '1rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              background: 'var(--color-surface-glass)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 'var(--radius-lg)',
                background: h.photo ? `url(${h.photo}) center/cover` : 'var(--color-surface-hover)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {!h.photo && <Hotel size={20} style={{ color: 'var(--color-indigo-400)' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{ fontWeight: 700, fontSize: '0.875rem', margin: 0, marginBottom: '0.125rem' }}
                className="line-clamp-1 text-text-primary"
                title={h.name}
              >
                {h.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-amber-400)', margin: 0, marginBottom: '0.125rem' }}>
                ★ {h.rating || '4.0'}
              </p>
              {h.price && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-emerald-400)', fontWeight: 700, margin: 0 }}>
                  ₹{Math.round(h.price).toLocaleString()}{' '}
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>total</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function TopAttractions({ attractions }) {
  if (!attractions?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.45 }}
      style={{ marginTop: '2rem' }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="text-text-primary">
        <MapPin size={18} style={{ color: 'var(--color-purple-400)' }} /> Top Attractions
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
        {attractions.slice(0, 6).map((a, i) => (
          <div
            key={i}
            style={{
              borderRadius: 'var(--radius-xl)',
              padding: '1rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              background: 'var(--color-surface-glass)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 'var(--radius-lg)',
                background: a.photo ? `url(${a.photo}) center/cover` : 'var(--color-surface-hover)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {!a.photo && <Navigation size={20} style={{ color: 'var(--color-purple-400)' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{ fontWeight: 700, fontSize: '0.875rem', margin: 0, marginBottom: '0.125rem' }}
                className="line-clamp-1 text-text-primary"
                title={a.name}
              >
                {a.name}
              </p>
              <p
                style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0, textTransform: 'capitalize' }}
                className="line-clamp-1"
              >
                {a.category || a.kinds?.replace(/,/g, ', ') || 'Sight'}
              </p>
              {a.rating > 0 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-amber-400)', fontWeight: 600, margin: 0, marginTop: '0.125rem' }}>
                  ★ {a.rating}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
