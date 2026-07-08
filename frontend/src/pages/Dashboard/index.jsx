// src/pages/Dashboard/index.jsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Map, Compass, Briefcase, Plus, ArrowRight, Clock, Heart, Sparkles, Globe } from 'lucide-react'
import { selectUser } from '@/features/auth/authSlice'
import { fetchMyTrips, selectTrips, selectTripsLoading } from '@/features/trips/tripsSlice'
import { selectSubscription, fetchSubscriptionStatus } from '@/features/subscription/subscriptionSlice'
import { SkeletonCard } from '@/components/common/Loader'
import Badge from '@/components/common/Badge'
import { getDestinationImage } from '@/utils/imageUtils'

const quickActions = [
  { icon: <Sparkles size={22} />, label: 'AI Copilot',   to: '/dashboard/copilot',  color: '#8B5CF6' },
  { icon: <Map size={22} />,      label: 'Plan a Trip',  to: '/dashboard/planner',  color: '#0EA5E9' },
  { icon: <Compass size={22} />,   label: 'Discover',    to: '/dashboard/discover', color: '#14B8A6' },
  { icon: <Briefcase size={22} />, label: 'My Trips',    to: '/dashboard/trips',    color: '#F59E0B' },
]

export default function Dashboard() {
  const dispatch     = useDispatch()
  const user         = useSelector(selectUser)
  const trips        = useSelector(selectTrips)
  const loading      = useSelector(selectTripsLoading)
  const subscription = useSelector(selectSubscription)

  useEffect(() => {
    dispatch(fetchMyTrips({ page: 1, limit: 4 }))
    dispatch(fetchSubscriptionStatus())
  }, [dispatch])

  const recentTrips = trips.slice(0, 4)

  // Calculate some dummy stats based on trips array for visual polish
  const totalTrips = trips.length || 0
  const totalDays = trips.reduce((acc, trip) => acc + (trip.planData?.meta?.total_days || 0), 0)
  const countries = new Set(trips.map(t => t.destination.split(',').pop().trim())).size || 0

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Welcome back, <span className="bg-gradient-primary bg-clip-text text-transparent">{user?.name?.split(' ')[0]} 👋</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Ready to plan your next adventure?</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Trips Planned', value: totalTrips, icon: <Briefcase size={20} color="var(--color-primary)" /> },
          { label: 'Travel Days', value: totalDays, icon: <Clock size={20} color="var(--color-secondary)" /> },
          { label: 'Destinations', value: countries, icon: <Globe size={20} color="var(--color-accent)" /> },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-bg-glass backdrop-blur-[10px] border border-border shadow-sm rounded-xl p-5"
            style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.125rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subscription banner */}
      {subscription?.plan === 'free' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-bg-glass backdrop-blur-[20px] border border-border shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" style={{ marginBottom: '2.5rem', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '3px solid var(--color-accent-amber)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent-amber)' }}>
              <Sparkles size={16} /> Upgrade to Pro
            </p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Unlock advanced AI planning, unlimited trips, and real-time flight tracking.</p>
          </div>
          <Link to="/dashboard/subscription" className="inline-flex items-center justify-center gap-2 font-sans font-semibold text-[0.8125rem] px-[1rem] py-[0.5rem] rounded-xl border-none cursor-pointer transition-all duration-250 ease-out whitespace-nowrap text-decoration-none relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_4px_14px_0_rgba(245,158,11,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)]">
            Upgrade Now <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* Quick actions */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {quickActions.map((action, i) => (
            <motion.div key={action.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Link to={action.to} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="bg-bg-card border border-border rounded-2xl p-6 transition-all duration-250 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-border-hover hover:-translate-y-1 hover:shadow-glow hover:shadow-card hover:bg-[rgba(14,21,41,0.9)]" style={{ textAlign: 'center', padding: '1.75rem 1rem', cursor: 'pointer' }}>
                  <div style={{ width: 52, height: 52, background: `${action.color}15`, border: `1px solid ${action.color}30`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color, margin: '0 auto 1rem', transition: 'all 0.2s' }}>
                    {action.icon}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{action.label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent trips */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Trips</h2>
          <Link to="/dashboard/trips" style={{ color: 'var(--color-accent-primary)', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }} className="hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : recentTrips.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-2xl p-6 transition-all duration-250 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(14, 165, 233, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Map size={28} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.25rem' }}>No trips yet</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', maxWidth: 300, margin: '0 auto 2rem' }}>Plan your first AI-powered trip in seconds and watch the magic happen!</p>
            <Link to="/dashboard/planner" className="inline-flex items-center justify-center gap-2 font-sans font-semibold text-sm px-6 py-3 rounded-xl border-none cursor-pointer transition-all duration-250 ease-out whitespace-nowrap text-decoration-none relative overflow-hidden bg-gradient-primary bg-[length:200%_auto] text-white shadow-btn hover:bg-right hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(129,140,248,0.5)] active:translate-y-0 active:scale-[0.98] active:shadow-btn">
              <Plus size={16} /> Plan Your First Trip
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {recentTrips.map((trip, i) => (
              <motion.div key={trip._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link to={`/dashboard/trips/${trip._id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="bg-bg-card border border-border rounded-2xl transition-all duration-250 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-border-hover hover:-translate-y-1 hover:shadow-glow hover:shadow-card overflow-hidden group">
                    {/* Thumbnail Cover Image */}
                    <div style={{ height: 140, width: '100%', position: 'relative', overflow: 'hidden' }}>
                      <div className="dest-image-bg group-hover:scale-105" style={{
                        position: 'absolute', inset: 0,
                        background: `url("${getDestinationImage(trip.destination)}") center center/cover no-repeat`,
                      }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-bg-card) 0%, transparent 100%)' }} />
                      <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                        <Badge label={subscription?.plan === 'pro' ? 'Pro' : 'Free'} variant={subscription?.plan === 'pro' ? 'cyan' : 'primary'} />
                      </div>
                    </div>
                    
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.2rem', color: 'var(--color-text-primary)' }}>{trip.destination}</p>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          from {trip.source}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {trip.planData?.meta?.total_days || '?'} days</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={14} /> {trip.likesCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
