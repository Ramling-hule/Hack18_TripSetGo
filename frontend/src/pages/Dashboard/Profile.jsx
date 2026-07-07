// src/pages/Dashboard/Profile.jsx
// TripSetGo — Travel Profile Identity & Settings Workspace
// Features user travel credentials, reputation level badges, notification switches, and preference setups.
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Star, Award, Compass, Heart, CheckCircle2, User, Mail, 
  Settings, Bell, Shield, LogOut, Check, Sparkles, HelpCircle, ArrowRight
} from 'lucide-react'
import { selectUser, updateUser } from '@/features/auth/authSlice'
import Avatar from '@/components/common/Avatar'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { selectTrips } from '@/features/trips/tripsSlice'
import api from '@/services/api'

export default function Profile() {
  const dispatch = useDispatch()
  const user   = useSelector(selectUser)
  const trips  = useSelector(selectTrips)
  
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    bio: user?.bio || '',
    location: user?.location || '',
    travelInterests: user?.travelInterests?.join(', ') || '',
    favoriteDestinations: user?.favoriteDestinations?.join(', ') || ''
  })
  
  const [activeTab, setActiveTab] = useState('identity') // 'identity' | 'settings'
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Local settings switches (mocked or bound locally)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyPush, setNotifyPush] = useState(false)
  const [isPublicProfile, setIsPublicProfile] = useState(true)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    
    // Convert comma-separated strings back to arrays, stripping whitespace
    const travelInterests = form.travelInterests.split(',').map(s => s.trim()).filter(Boolean)
    const favoriteDestinations = form.favoriteDestinations.split(',').map(s => s.trim()).filter(Boolean)

    try {
      const res = await api.put('/api/v1/users/me', { 
        name: form.name, 
        bio: form.bio,
        location: form.location,
        travelInterests,
        favoriteDestinations
      })
      dispatch(updateUser(res.data.data))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    // Clear user tokens and reload
    localStorage.removeItem('token')
    window.location.href = '/auth/login'
  }

  const isPro = user?.plan === 'pro'

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col gap-6">
      
      {/* Page Header */}
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-2xl font-extrabold text-text-primary font-display tracking-tight">
          My <span className="text-indigo-400">Profile</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1">Manage your traveler details, preferences, and account preferences.</p>
      </div>

      {/* Tab Triggers */}
      <div className="flex border-b border-border/20 gap-4 shrink-0" role="tablist">
        <button
          id="tab-trigger-identity"
          onClick={() => setActiveTab('identity')}
          role="tab"
          aria-selected={activeTab === 'identity'}
          className={`
            py-2 px-1 text-xs font-bold cursor-pointer transition-all border-b-2
            ${activeTab === 'identity' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-text-secondary hover:text-text-primary'
            }
          `}
        >
          Travel Identity
        </button>
        <button
          id="tab-trigger-settings"
          onClick={() => setActiveTab('settings')}
          role="tab"
          aria-selected={activeTab === 'settings'}
          className={`
            py-2 px-1 text-xs font-bold cursor-pointer transition-all border-b-2
            ${activeTab === 'settings' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-text-secondary hover:text-text-primary'
            }
          `}
        >
          Account Settings
        </button>
      </div>

      {/* Animate Tab switching */}
      <AnimatePresence mode="wait">
        {activeTab === 'identity' ? (
          <motion.div
            key="identity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-6"
          >
            {/* Identity Card Profile Hero */}
            <div className="bg-surface-default border border-border/40 rounded-2xl overflow-hidden shadow-sm relative">
              <div className="w-full h-28 bg-surface-raised border-b border-border/10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-cyan-500/10" />
              </div>
              <div className="px-6 pb-6 pt-14 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
                <div className="absolute -top-12 left-6 sm:left-8">
                  <div className="relative">
                    <Avatar src={user?.avatar} name={user?.name} size="lg" className="border-4 border-surface" />
                    {isPro && (
                      <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border border-surface shadow flex items-center gap-0.5">
                        ★ PRO
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center sm:text-left min-w-0 pt-2 sm:pt-0 sm:pl-4">
                  <h2 className="font-extrabold text-lg text-text-primary flex items-center justify-center sm:justify-start gap-1.5 font-display leading-tight">
                    {user?.name || 'Traveler'}
                    {user?.isEmailVerified && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">{user?.email}</p>
                  {user?.location && (
                    <p className="text-[10px] text-text-muted mt-1 flex items-center justify-center sm:justify-start gap-0.5">
                      <MapPin size={10} /> {user?.location}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <span className="text-[9px] font-extrabold uppercase px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                    Level {Math.max(1, Math.floor((user?.reputationScore || 0) / 10))}
                  </span>
                </div>
              </div>
            </div>

            {/* Content grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: Bio, Interests, and Favorites */}
              <div className="flex flex-col gap-6 lg:col-span-1">
                
                {/* About & Bio */}
                <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2">
                    About My Travel Style
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed bg-surface-raised border border-border/20 p-3 rounded-xl">
                    {user?.bio || "This traveler hasn't written a bio yet. They prefer to let their adventures speak for themselves."}
                  </p>
                </div>

                {/* Preferences tags */}
                <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
                  <div>
                    <h4 className="text-[10px] font-extrabold text-text-muted font-display uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Compass size={12} className="text-indigo-400" /> Travel Interests
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {user?.travelInterests?.length > 0 ? user.travelInterests.map(i => (
                        <span key={i} className="text-[9px] font-bold text-text-primary bg-surface-raised border border-border/30 px-2.5 py-1 rounded-full shadow-sm">
                          {i}
                        </span>
                      )) : (
                        <span className="text-[10px] text-text-muted italic">Not specified</span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border/10 pt-3">
                    <h4 className="text-[10px] font-extrabold text-text-muted font-display uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Heart size={12} className="text-rose-400" /> Favorite Destinations
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {user?.favoriteDestinations?.length > 0 ? user.favoriteDestinations.map(d => (
                        <span key={d} className="text-[9px] font-bold text-rose-400 bg-rose-500/5 border border-rose-500/10 px-2.5 py-1 rounded-full">
                          {d}
                        </span>
                      )) : (
                        <span className="text-[10px] text-text-muted italic">Not specified</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Statistics, Achievements, and Bookmarked items */}
              <div className="flex flex-col gap-6 lg:col-span-2">
                
                {/* Travel stats cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface-default border border-border/40 p-4 rounded-2xl text-center shadow-sm">
                    <p className="font-extrabold text-xl text-indigo-400 font-display leading-none">{trips.length}</p>
                    <p className="text-[9px] text-text-muted font-extrabold uppercase tracking-wider mt-1.5">Total Trips</p>
                  </div>
                  <div className="bg-surface-default border border-border/40 p-4 rounded-2xl text-center shadow-sm">
                    <p className="font-extrabold text-xl text-text-primary font-display leading-none">{user?.followersCount || 0}</p>
                    <p className="text-[9px] text-text-muted font-extrabold uppercase tracking-wider mt-1.5">Followers</p>
                  </div>
                  <div className="bg-surface-default border border-border/40 p-4 rounded-2xl text-center shadow-sm">
                    <p className="font-extrabold text-xl text-text-primary font-display leading-none">{user?.followingCount || 0}</p>
                    <p className="text-[9px] text-text-muted font-extrabold uppercase tracking-wider mt-1.5">Following</p>
                  </div>
                </div>

                {/* Reputation Achievements */}
                <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5 mb-3.5 flex items-center gap-1.5">
                    <Award size={14} className="text-indigo-400" /> Reputation Score & Milestone Badges
                  </h3>

                  <div className="bg-surface-raised border border-border/20 rounded-xl p-3.5 flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-text-secondary">Global Score</span>
                    <span className="font-extrabold text-lg text-indigo-400 font-display">{user?.reputationScore || 0}</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider mb-2">Earned Badges</p>
                    {user?.badges?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {user.badges.map(b => (
                          <span key={b} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                            <Star size={10} fill="currentColor" /> {b}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-text-muted italic bg-surface-raised/40 p-3 rounded-lg border border-border/10 text-center">
                        Explore and plan trips to earn gamified level badges!
                      </p>
                    )}
                  </div>
                </div>

                {/* Saved Trips or destinations summary */}
                <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5">
                    Saved Trip Itineraries
                  </h3>
                  {trips.length === 0 ? (
                    <p className="text-[10px] text-text-muted italic">No itineraries saved yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {trips.slice(0, 4).map(t => (
                        <div key={t._id} className="bg-surface-raised border border-border/20 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <h5 className="font-bold text-text-primary truncate">{t.destination}</h5>
                            <p className="text-[9px] text-text-muted truncate mt-0.5">Budget: ₹{Number(t.budget || 0).toLocaleString()}</p>
                          </div>
                          <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded tracking-wide uppercase border border-indigo-500/15 shrink-0">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn"
          >
            {/* Form edit details card */}
            <div className="bg-surface-default border border-border/40 rounded-2xl p-5 shadow-sm lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5">
                Profile Settings
              </h3>

              {saved && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold p-3 rounded-lg flex items-center gap-1.5 animate-fadeIn">
                  <Check size={14} /> Profile updated successfully!
                </div>
              )}
              
              {saveError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold p-3 rounded-lg flex items-center gap-1.5">
                  ⚠️ {saveError}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  <Input label="Location" placeholder="E.g. Paris, France" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Bio</label>
                  <textarea
                    className="w-full bg-surface-raised border border-border/40 rounded-lg text-text-primary text-xs px-3.5 py-2.5 transition-all outline-none focus:border-indigo-500 focus:shadow-[0_0_0_2px_rgba(99,102,241,0.2)] resize-y"
                    rows={3}
                    placeholder="Tell others about your travel style..."
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Travel Interests (comma separated)" 
                    placeholder="e.g. Hiking, Food, Luxury" 
                    value={form.travelInterests} 
                    onChange={e => setForm(p => ({ ...p, travelInterests: e.target.value }))} 
                  />
                  <Input 
                    label="Favorite Destinations (comma separated)" 
                    placeholder="e.g. Tokyo, Swiss Alps" 
                    value={form.favoriteDestinations} 
                    onChange={e => setForm(p => ({ ...p, favoriteDestinations: e.target.value }))} 
                  />
                </div>

                <div className="pt-2">
                  <Input label="Account Email" value={user?.email || ''} disabled helperText="Email address cannot be changed" />
                </div>

                <div className="flex justify-end pt-3 gap-2">
                  <Button type="submit" loading={saving} size="md">Save Changes</Button>
                </div>
              </form>
            </div>

            {/* Sidebar actions: connected account, notifications, and privacy */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              
              {/* Connected Accounts */}
              <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5">
                  Connected Accounts
                </h3>
                <div className="flex items-center justify-between p-2 rounded-xl bg-surface-raised border border-border/20 text-xs gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌐</span>
                    <div>
                      <h5 className="font-bold text-text-primary">Google Account</h5>
                      <p className="text-[9px] text-text-muted mt-0.5">Linked for single-sign on</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded tracking-wider border border-emerald-500/15">
                    Linked
                  </span>
                </div>
              </div>

              {/* Notification preferences */}
              <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5">
                <h3 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5 flex items-center gap-1.5">
                  <Bell size={13} className="text-indigo-400" /> Notifications
                </h3>

                <div className="flex flex-col gap-2.5">
                  <label className="flex items-center justify-between cursor-pointer p-1 text-xs font-bold text-text-secondary select-none">
                    <span>Email Summaries</span>
                    <input 
                      type="checkbox" 
                      checked={notifyEmail} 
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="w-3.5 h-3.5 border border-border rounded focus:ring-indigo-500 focus:ring-1 text-indigo-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-1 text-xs font-bold text-text-secondary select-none">
                    <span>Push Alerts</span>
                    <input 
                      type="checkbox" 
                      checked={notifyPush} 
                      onChange={(e) => setNotifyPush(e.target.checked)}
                      className="w-3.5 h-3.5 border border-border rounded focus:ring-indigo-500 focus:ring-1 text-indigo-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Privacy settings visibility */}
              <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5">
                <h3 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5 flex items-center gap-1.5">
                  <Shield size={13} className="text-indigo-400" /> Privacy & Visibility
                </h3>

                <label className="flex items-center justify-between cursor-pointer p-1 text-xs font-bold text-text-secondary select-none">
                  <span>Public Travel Identity</span>
                  <input 
                    type="checkbox" 
                    checked={isPublicProfile} 
                    onChange={(e) => setIsPublicProfile(e.target.checked)}
                    className="w-3.5 h-3.5 border border-border rounded focus:ring-indigo-500 focus:ring-1 text-indigo-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Account logout option */}
              <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
                <h3 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5">
                  Session
                </h3>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut size={13} /> Log Out
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}