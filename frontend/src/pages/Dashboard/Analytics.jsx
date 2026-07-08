// src/pages/Dashboard/Analytics.jsx
// TripSetGo — Travel Analytics Dashboard Workspace
// Features tab-based history overview, Recharts charts, chronological timelines, achievements, and habit insights.
import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import { 
  Globe, DollarSign, Heart, Compass, Trophy, Award, MapPin, 
  TrendingUp, Calendar, AlertCircle, Sparkles, Luggage, ArrowRight, ShieldCheck
} from 'lucide-react'
import { fetchMyTrips, selectTrips, selectTripsLoading } from '@/features/trips/tripsSlice'
import Loader from '@/components/common/Loader'
import StatCard from '@/components/common/StatCard'

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6']

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const inrK = (n) => `₹${Number((n || 0) / 1000).toFixed(0)}K`

export default function Analytics() {
  const dispatch = useDispatch()
  const trips    = useSelector(selectTrips)
  const loading  = useSelector(selectTripsLoading)

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('history') // 'history' | 'spending'

  useEffect(() => { 
    dispatch(fetchMyTrips({ page: 1, limit: 100 })) 
  }, [dispatch])

  // Destination frequency aggregation
  const destFreq = useMemo(() => {
    const freq = {}
    trips.forEach(t => { freq[t.destination] = (freq[t.destination] || 0) + 1 })
    return freq
  }, [trips])

  const destData = useMemo(() => {
    return Object.entries(destFreq)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [destFreq])

  // Budget distribution aggregation
  const budgetData = useMemo(() => {
    const brackets = { '<₹10K': 0, '₹10K-30K': 0, '₹30K-60K': 0, '₹60K+': 0 }
    trips.forEach(t => {
      const b = Number(t.budget || 0)
      if (b < 10000)       brackets['<₹10K']++
      else if (b < 30000)  brackets['₹10K-30K']++
      else if (b < 60000)  brackets['₹30K-60K']++
      else                 brackets['₹60K+']++
    })
    return Object.entries(brackets)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
  }, [trips])

  const totalBudget = useMemo(() => trips.reduce((s, t) => s + Number(t.budget || 0), 0), [trips])
  const avgBudget   = useMemo(() => trips.length ? Math.round(totalBudget / trips.length) : 0, [trips, totalBudget])
  const totalLikes  = useMemo(() => trips.reduce((s, t) => s + (t.likesCount || 0), 0), [trips])

  // Client-side Travel Personality derivation
  const travelPersonality = useMemo(() => {
    if (trips.length === 0) return null
    if (avgBudget < 15000) {
      return {
        title: 'Budget Backpacker',
        description: 'You focus on cost optimization, finding local treasures, and maximizing experiences within modest budgets.',
        icon: '🎒',
        badge: 'Cost Conscious',
      }
    } else if (avgBudget >= 55000) {
      return {
        title: 'Premium Jetsetter',
        description: 'You prefer upscale hotel accommodations, fine dining hotspots, and high-comfort itineraries.',
        icon: '✈️',
        badge: 'Luxury Explorer',
      }
    }
    return {
      title: 'Balanced Wanderer',
      description: 'You seek a blend of local cultural immersion, standard comfort, and cost-effective planning.',
      icon: '🧭',
      badge: 'Mid-Tier Explorer',
    }
  }, [trips.length, avgBudget])

  // Travel Achievements
  const achievementsList = useMemo(() => {
    const list = []
    const destCount = Object.keys(destFreq).length
    
    if (trips.length >= 3) {
      list.push({ title: 'Road Warrior', desc: 'Planned 3+ trips successfully', tier: 'Gold', icon: <Trophy size={14} className="text-amber-400" /> })
    }
    if (destCount >= 2) {
      list.push({ title: 'Globetrotter', desc: 'Explored multiple cities', tier: 'Silver', icon: <Award size={14} className="text-slate-300" /> })
    }
    if (totalLikes >= 5) {
      list.push({ title: 'Local Influencer', desc: 'Earned 5+ total trip likes', tier: 'Bronze', icon: <Sparkles size={14} className="text-amber-600" /> })
    }
    if (avgBudget > 0 && avgBudget <= 25000) {
      list.push({ title: 'Budget Master', desc: 'Maintained efficient average spends', tier: 'Gold', icon: <ShieldCheck size={14} className="text-emerald-400" /> })
    }
    return list
  }, [trips.length, destFreq, totalLikes, avgBudget])

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-surface-raised border border-border rounded-xl p-2.5 shadow-md text-xs font-bold text-text-primary animate-fadeIn">
        <p className="border-b border-border/10 pb-1 mb-1.5">{label}</p>
        <p className="text-indigo-400 flex items-center gap-1">
          {payload[0].name}: <strong className="text-text-primary">{payload[0].value}</strong>
        </p>
      </div>
    )
  }

  if (loading && trips.length === 0) {
    return (
      <div className="animate-fadeIn py-12">
        <Loader text="Loading your travel analytics..." />
      </div>
    )
  }

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col gap-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border/20 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary font-display tracking-tight">
            Travel <span className="text-indigo-400">Analytics</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">Visualize your habits, spending allocations, and trip milestones.</p>
        </div>
      </div>

      {/* ── Travel statistics summary cards grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard 
          label="Total Trips" 
          value={trips.length} 
          icon={<Globe size={15} />} 
          trend={trips.length > 0 ? '+100%' : null}
          trendDirection={trips.length > 0 ? 'up' : null}
        />
        <StatCard 
          label="Total Budget" 
          value={inrK(totalBudget)} 
          icon={<DollarSign size={15} />} 
        />
        <StatCard 
          label="Avg Budget" 
          value={inrK(avgBudget)} 
          icon={<DollarSign size={15} />} 
        />
        <StatCard 
          label="Destinations" 
          value={Object.keys(destFreq).length} 
          icon={<Compass size={15} />} 
        />
        <StatCard 
          label="Likes Gained" 
          value={totalLikes} 
          icon={<Heart size={15} />} 
          trend={totalLikes > 0 ? `+${totalLikes}` : null}
          trendDirection={totalLikes > 0 ? 'up' : null}
        />
      </div>

      {trips.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-2xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-12 shadow-sm gap-3">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-3xl">
            📊
          </div>
          <h2 className="text-lg font-bold text-text-primary font-display">No analytics records yet</h2>
          <p className="text-xs text-text-secondary max-w-sm">
            Once you create trips, allocate budgets, and explore destinations, visual charts, spend breakdowns, and travel badges will populate here.
          </p>
        </div>
      ) : (
        <>
          {/* Workspace Tab Triggers */}
          <div className="flex border-b border-border/20 gap-4 shrink-0" role="tablist">
            <button
              id="tab-trigger-history"
              onClick={() => setActiveTab('history')}
              role="tab"
              aria-selected={activeTab === 'history'}
              className={`
                py-2 px-1 text-xs font-bold cursor-pointer transition-all border-b-2
                ${activeTab === 'history' 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }
              `}
            >
              History Overview
            </button>
            <button
              id="tab-trigger-spending"
              onClick={() => setActiveTab('spending')}
              role="tab"
              aria-selected={activeTab === 'spending'}
              className={`
                py-2 px-1 text-xs font-bold cursor-pointer transition-all border-b-2
                ${activeTab === 'spending' 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }
              `}
            >
              Spending & AI Insights
            </button>
          </div>

          {/* Tab Viewport */}
          <AnimatePresence mode="wait">
            {activeTab === 'history' ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
              >
                {/* Column 1: Favorite Destinations bar chart */}
                <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm lg:col-span-2 flex flex-col gap-4">
                  <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5">
                    Top Visited Destinations
                  </h4>
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={destData} barCategoryGap="30%">
                        <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip content={customTooltip} cursor={{ fill: 'var(--color-surface-hover)', radius: 6 }} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {destData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Column 2: Chronological vertical Trip Timeline & Badges */}
                <div className="flex flex-col gap-6 lg:col-span-1">
                  
                  {/* Milestones Achievements */}
                  <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm">
                    <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5 mb-3.5">
                      Earned Achievements
                    </h4>
                    {achievementsList.length === 0 ? (
                      <p className="text-[10px] text-text-muted">No achievement badges unlocked yet.</p>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {achievementsList.map((a, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-surface-raised border border-border/20 text-xs gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-surface-base border border-border flex items-center justify-center shrink-0 shadow-sm">
                                {a.icon}
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-text-primary truncate">{a.title}</h5>
                                <p className="text-[9px] text-text-muted truncate mt-0.5">{a.desc}</p>
                              </div>
                            </div>
                            <span className="text-[8px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded tracking-wider border border-indigo-500/15">
                              {a.tier}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Vertical Chronological Timeline */}
                  <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                    <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5">
                      Travel Timeline
                    </h4>
                    <div className="flex flex-col pl-3 border-l-2 border-border/20 gap-4.5 relative py-1.5 ml-1.5">
                      {trips.slice(0, 4).map((t, idx) => (
                        <div key={t._id} className="relative flex flex-col gap-1">
                          {/* Chrono timeline node pointer */}
                          <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-surface bg-indigo-500 shrink-0" />
                          <h5 className="text-xs font-bold text-text-primary leading-none">{t.destination}</h5>
                          <p className="text-[9px] text-text-muted mt-0.5 font-medium flex items-center gap-1">
                            <Calendar size={9} /> {t.startDate ? new Date(t.startDate).toDateString() : 'Active Date'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            ) : (
              <motion.div
                key="spending"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn"
              >
                {/* Column 1: Budget pie chart breakdown */}
                <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm lg:col-span-2 flex flex-col gap-4">
                  <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5">
                    Budget Bracket Allocations
                  </h4>
                  {budgetData.length === 0 ? (
                    <div className="text-center py-20 text-text-muted text-xs">No allocations found.</div>
                  ) : (
                    <div className="w-full h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={budgetData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={70} 
                            outerRadius={95} 
                            paddingAngle={4} 
                            dataKey="value"
                          >
                            {budgetData.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={customTooltip} />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle" 
                            iconSize={8} 
                            formatter={(value) => <span className="text-[10px] font-bold text-text-secondary">{value}</span>} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Column 2: AI Habits & Recommendations panel */}
                <div className="flex flex-col gap-6 lg:col-span-1">
                  
                  {/* AI Personality insights */}
                  {travelPersonality && (
                    <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                      <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5 flex items-center gap-1">
                        <Sparkles size={12} className="text-indigo-400 animate-pulse" /> Travel Personality
                      </h4>
                      <div className="flex items-center gap-2.5 py-1">
                        <span className="text-3xl shrink-0">{travelPersonality.icon}</span>
                        <div>
                          <h5 className="text-xs font-bold text-text-primary">{travelPersonality.title}</h5>
                          <span className="text-[8px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/15 tracking-wider mt-1 inline-block">
                            {travelPersonality.badge}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-text-secondary leading-relaxed bg-surface-raised border border-border/20 p-2.5 rounded-xl font-medium">
                        {travelPersonality.description}
                      </p>
                    </div>
                  )}

                  {/* Packing guidelines recommendations */}
                  <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                    <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5 flex items-center gap-1">
                      <Luggage size={12} className="text-indigo-400" /> AI Packing Guideline
                    </h4>
                    <ul className="text-[10px] text-text-secondary leading-relaxed list-disc pl-4 space-y-1.5 font-medium">
                      <li>Pack micro-fiber travel towels and waterproof bags for monsoon trips.</li>
                      <li>Carry lightweight cotton wear and UV-protectant hats for seaside stays.</li>
                      <li>Bring thermal layering coats for sub-zero mountain escapes.</li>
                    </ul>
                  </div>

                  {/* Dynamic recommendations chips */}
                  <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                    <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5">
                      Suggested Next Spots
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {['Munnar', 'Varanasi', 'Darjeeling', 'Hampi', 'Gokarna'].map((spot) => (
                        <span 
                          key={spot} 
                          className="text-[9px] font-bold text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          📍 {spot}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

    </div>
  )
}