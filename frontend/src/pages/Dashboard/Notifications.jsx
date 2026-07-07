// src/pages/Dashboard/Notifications.jsx
// TripSetGo — Notifications Travel Activity Center
// Groups notifications chronologically (Today, Yesterday, Earlier) and supports tabbed views and category filters.
import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Bell, CheckCheck, DollarSign, Compass, CloudSun, Users, ArrowRight,
  Sparkles, AlertCircle, HelpCircle, Calendar, Trash2
} from 'lucide-react'
import { 
  fetchNotifications, markRead, markAllRead, selectNotifications, selectUnreadCount 
} from '@/features/notifications/notificationsSlice'
import Button from '@/components/common/Button'

export default function Notifications() {
  const dispatch   = useDispatch()
  const items      = useSelector(selectNotifications)
  const unread     = useSelector(selectUnreadCount)

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'actionable'
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'trip' | 'expense' | 'planner' | 'alert'

  useEffect(() => { 
    dispatch(fetchNotifications()) 
  }, [dispatch])

  // Helper to categorize notifications based on content or type
  const getNotificationCategory = (n) => {
    if (n.type) return n.type
    const msg = n.message.toLowerCase()
    if (msg.includes('budget') || msg.includes('expense') || msg.includes('spent') || msg.includes('settle') || msg.includes('paid')) return 'expense'
    if (msg.includes('plan') || msg.includes('itinerary') || msg.includes('generate')) return 'planner'
    if (msg.includes('weather') || msg.includes('rain') || msg.includes('temperature') || msg.includes('storm')) return 'alert'
    if (msg.includes('collaboration') || msg.includes('joined') || msg.includes('invited') || msg.includes('member')) return 'trip'
    return 'general'
  }

  // Helper to resolve the icon based on category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'expense':
        return <DollarSign size={13} className="text-emerald-400" />
      case 'planner':
        return <Compass size={13} className="text-indigo-400" />
      case 'alert':
        return <CloudSun size={13} className="text-amber-400" />
      case 'trip':
        return <Users size={13} className="text-cyan-400" />
      default:
        return <Bell size={13} className="text-text-secondary" />
    }
  }

  // Filter items based on activeTab and activeFilter
  const filteredItems = useMemo(() => {
    return items.filter(n => {
      const category = getNotificationCategory(n)
      
      // Tab check: 'actionable' targets budget alerts, weather warnings, planner updates
      if (activeTab === 'actionable') {
        const isActionable = category === 'expense' || category === 'alert' || category === 'planner'
        if (!isActionable) return false
      }

      // Filter check
      if (activeFilter !== 'all' && category !== activeFilter) {
        return false
      }

      return true
    })
  }, [items, activeTab, activeFilter])

  // Helper to group notifications chronologically (Today, Yesterday, Earlier)
  const groupedItems = useMemo(() => {
    const today = []
    const yesterday = []
    const earlier = []

    const now = new Date()
    const yesterdayDate = new Date()
    yesterdayDate.setDate(now.getDate() - 1)

    filteredItems.forEach(n => {
      const d = new Date(n.createdAt)
      if (d.toDateString() === now.toDateString()) {
        today.push(n)
      } else if (d.toDateString() === yesterdayDate.toDateString()) {
        yesterday.push(n)
      } else {
        earlier.push(n)
      }
    })

    return { Today: today, Yesterday: yesterday, Earlier: earlier }
  }, [filteredItems])

  // Helper to resolve navigation targets for actionable items
  const getActionTarget = (n, category) => {
    if (n.actionUrl) return n.actionUrl
    if (n.tripId) {
      if (category === 'expense') return `/dashboard/expenses`
      return `/dashboard/planner?tripId=${n.tripId}`
    }
    return null
  }

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col gap-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border/20 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary font-display tracking-tight">
            Travel <span className="text-indigo-400">Activity Center</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">{unread} unread updates requiring attention</p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" icon={<CheckCheck size={14} />} onClick={() => dispatch(markAllRead())}>
            Mark all read
          </Button>
        )}
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-border/20 gap-4 shrink-0" role="tablist">
        <button
          id="tab-trigger-all"
          onClick={() => setActiveTab('all')}
          role="tab"
          aria-selected={activeTab === 'all'}
          className={`
            py-2 px-1 text-xs font-bold cursor-pointer transition-all border-b-2
            ${activeTab === 'all' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-text-secondary hover:text-text-primary'
            }
          `}
        >
          All Activity
        </button>
        <button
          id="tab-trigger-actionable"
          onClick={() => setActiveTab('actionable')}
          role="tab"
          aria-selected={activeTab === 'actionable'}
          className={`
            py-2 px-1 text-xs font-bold cursor-pointer transition-all border-b-2
            ${activeTab === 'actionable' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-text-secondary hover:text-text-primary'
            }
          `}
        >
          Action Required
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {[
          { key: 'all', label: 'All updates' },
          { key: 'trip', label: 'Trips & Members' },
          { key: 'expense', label: 'Expenses' },
          { key: 'planner', label: 'AI Planner' },
          { key: 'alert', label: 'Alerts & Weather' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`
              px-3 py-1 rounded-full text-[10px] font-bold border transition-colors whitespace-nowrap cursor-pointer
              ${activeFilter === f.key
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                : 'bg-surface-default hover:bg-surface-hover text-text-secondary border-border/40'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity Timeline List */}
      {filteredItems.length === 0 ? (
        <div className="bg-surface-default border border-border/40 rounded-2xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-12 shadow-sm gap-3">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-3xl">
            🔔
          </div>
          <h2 className="text-lg font-bold text-text-primary font-display">All caught up</h2>
          <p className="text-xs text-text-secondary max-w-xs">
            {activeTab === 'actionable' 
              ? "You don't have any pending action notifications requiring manual response right now."
              : "No notification activities match your current category filters."
            }
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(groupedItems).map(([bucket, notifications]) => {
            if (notifications.length === 0) return null

            return (
              <div key={bucket} className="flex flex-col gap-3">
                {/* Section Header */}
                <h4 className="text-[10px] font-extrabold text-text-muted font-display uppercase tracking-wider pl-1.5 flex items-center gap-1.5">
                  <Calendar size={11} /> {bucket}
                </h4>

                {/* Section Notifications List */}
                <div className="flex flex-col gap-2.5">
                  <AnimatePresence>
                    {notifications.map((n, idx) => {
                      const category = getNotificationCategory(n)
                      const actionTarget = getActionTarget(n, category)

                      return (
                        <motion.div
                          key={n._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15, delay: idx * 0.03 }}
                          onClick={() => !n.isRead && dispatch(markRead(n._id))}
                          className={`
                            bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm transition-all
                            flex gap-3.5 items-start relative
                            ${n.isRead ? 'opacity-80' : 'border-l-3 border-l-indigo-500 hover:bg-surface-hover cursor-pointer'}
                          `}
                        >
                          {/* Category Badge Icon */}
                          <div className="w-7 h-7 rounded-lg bg-surface-raised border border-border flex items-center justify-center shrink-0 shadow-sm">
                            {getCategoryIcon(category)}
                          </div>

                          {/* Detail body content */}
                          <div className="flex-1 min-w-0 pr-4">
                            <p className={`text-xs text-text-primary leading-normal ${n.isRead ? 'font-normal' : 'font-semibold'}`}>
                              {n.message}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-[9px] text-text-muted font-medium">
                                {new Date(n.createdAt).toLocaleDateString('en-IN', { 
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                                })}
                              </span>

                              {/* Highlight trip metadata badge if present */}
                              {n.tripId && (
                                <span className="text-[8px] font-extrabold bg-surface-raised text-text-secondary px-1.5 py-0.5 rounded border border-border/10 tracking-wide uppercase shrink-0">
                                  ✈️ Active Trip
                                </span>
                              )}
                            </div>

                            {/* Action Redirect Link */}
                            {!n.isRead && actionTarget && (
                              <Link 
                                to={actionTarget}
                                className="inline-flex items-center text-[10px] font-extrabold text-indigo-400 hover:underline gap-0.5 mt-2.5"
                              >
                                Resolve Update <ArrowRight size={10} />
                              </Link>
                            )}
                          </div>

                          {/* Unread circle badge dot */}
                          {!n.isRead && (
                            <span 
                              className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500 shrink-0" 
                              aria-label="Unread update"
                            />
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}