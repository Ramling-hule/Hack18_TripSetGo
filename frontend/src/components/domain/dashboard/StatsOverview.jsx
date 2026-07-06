// src/components/domain/dashboard/StatsOverview.jsx
// Aurora Design System — Passive Stats overview row
// 3 StatChips displaying: "X Trips", "Y Destinations", and "Z Likes".
// Value: Bricolage 800, 2rem. Label: Inter 400, body-sm.
// Hidden on first-time login (empty states) where totalTrips === 0.
import Card from '@/components/common/Card'

export default function StatsOverview({ totalTrips = 0, totalDestinations = 0, totalLikes = 0 }) {
  if (totalTrips === 0) return null

  const stats = [
    { value: totalTrips, label: 'Trips Planned' },
    { value: totalDestinations, label: 'Destinations' },
    { value: totalLikes, label: 'Trip Likes' },
  ]

  return (
    <section style={{ marginBottom: 'var(--spacing-8)' }} aria-label="Statistics Overview">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat, idx) => (
          <Card
            key={stat.label + idx}
            variant="raised"
            padding="md"
            className="flex items-center gap-4 h-[72px]"
          >
            {/* Value Numerals */}
            <span
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'var(--font-size-stat)',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}
            >
              {stat.value}
            </span>

            {/* Label details */}
            <span
              style={{
                fontFamily: 'var(--font-family-body)',
                fontSize: 'var(--font-size-body-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              {stat.label}
            </span>
          </Card>
        ))}
      </div>
    </section>
  )
}
